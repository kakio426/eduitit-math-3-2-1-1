import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = Number(process.env.MATHMON_AUDIO_QA_PORT || 9261);
const PROFILE = join(ROOT, ".tmp-qa", "mathmon-audio-smoke-profile");

const LESSONS = [
  {
    name: "lesson1-box-run",
    dir: "3-2-1-1-mathmon-box-run",
    soundSelector: '[data-action="toggle-bgm"]',
    startSelector: '[data-action="start"]',
    playSelector: '[data-action="start-first-problem"]',
    startCue: "uiNext",
    playCue: "uiNext",
  },
  {
    name: "lesson2-rocket-charge",
    dir: "3-2-1-2-mathmon-rocket-charge",
    soundSelector: "#soundToggle",
    startSelector: "#startButton",
    playSelector: "#tutorialNextButton",
    startCue: "uiStart",
    playCue: "uiStart",
  },
  {
    name: "lesson3-jump-islands",
    dir: "3-2-1-3-mathmon-jump-islands",
    soundSelector: "#soundToggle",
    startSelector: "#startButton",
    playSelector: "#tutorialNextButton",
    startCue: "uiStart",
    playCue: "uiStart",
  },
];

await rm(PROFILE, { recursive: true, force: true });

const browser = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--allow-file-access-from-files",
  "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });

browser.stderr.on("data", () => {});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForJson() {
  for (let index = 0; index < 80; index += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const pages = await response.json();
      const page = pages.find((item) => item.type === "page");
      if (page?.webSocketDebuggerUrl) {
        return page.webSocketDebuggerUrl;
      }
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error("Chrome DevTools endpoint did not open");
}

class Cdp {
  constructor(socketUrl) {
    this.socketUrl = socketUrl;
    this.id = 0;
    this.pending = new Map();
  }

  async open() {
    this.ws = new WebSocket(this.socketUrl);
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) {
          reject(new Error(JSON.stringify(message.error)));
        } else {
          resolve(message.result || {});
        }
      }
    });
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  close() {
    this.ws.close();
  }
}

const cdp = new Cdp(await waitForJson());
await cdp.open();

async function evaluate(expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(JSON.stringify(result.exceptionDetails));
  }
  return result.result?.value;
}

async function waitUntil(predicateSource, message, timeout = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(predicateSource)) {
      return;
    }
    await delay(80);
  }
  throw new Error(message);
}

function lessonUrl(lesson, suffix = "") {
  const url = pathToFileURL(join(ROOT, lesson.dir, "index.html"));
  url.search = `?seed=12345&audioSmoke=${encodeURIComponent(`${lesson.name}-${Date.now()}${suffix}`)}`;
  return url.href;
}

async function navigateToLesson(lesson, suffix = "") {
  await cdp.send("Page.navigate", { url: lessonUrl(lesson, suffix) });
  await waitUntil("document.readyState === 'complete'", `${lesson.name}: document did not finish loading`, 6000);
  await waitUntil("Boolean(window.__mathmonAudioQa)", `${lesson.name}: audio QA hook missing`, 3000);
}

function clickSource(selector) {
  return `
(() => {
  const element = document.querySelector(${JSON.stringify(selector)});
  if (!element) throw new Error("missing selector: ${selector.replaceAll('"', '\\"')}");
  element.click();
  return true;
})()
`;
}

async function click(selector) {
  await evaluate(clickSource(selector));
}

async function getLog() {
  return evaluate("window.__mathmonAudioQa.getLog()");
}

async function clearLog() {
  await evaluate("window.__mathmonAudioQa.clearLog()");
}

async function assertLogIncludes(lesson, cue, message) {
  await waitUntil(`window.__mathmonAudioQa.getLog().includes(${JSON.stringify(cue)})`, `${lesson.name}: ${message}`, 2500);
}

async function checkCueLoads(lesson) {
  const results = await evaluate(`
(async () => {
  const entries = Object.entries(window.__mathmonAudioQa.cues);
  return Promise.all(entries.map(([cue, src]) => new Promise((resolve) => {
    const audio = new Audio(src);
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      resolve({
        cue,
        src,
        ok,
        duration: Number.isFinite(audio.duration) ? Math.round(audio.duration * 1000) : 0,
        error: audio.error ? audio.error.code : 0
      });
    };
    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", () => finish(Number.isFinite(audio.duration) && audio.duration > 0), { once: true });
    audio.addEventListener("error", () => finish(false), { once: true });
    audio.load();
    setTimeout(() => finish(false), 4000);
  })));
})()
`);
  const failed = results.filter((item) => !item.ok);
  assert(!failed.length, `${lesson.name}: browser could not load audio metadata: ${JSON.stringify(failed)}`);
  return results;
}

async function runSoundOnScenario(lesson) {
  await navigateToLesson(lesson, "on");
  const loaded = await checkCueLoads(lesson);

  await clearLog();
  await click(lesson.startSelector);
  await assertLogIncludes(lesson, lesson.startCue, "start cue was not logged");

  await clearLog();
  await click(lesson.playSelector);
  await assertLogIncludes(lesson, lesson.playCue, "play-screen cue was not logged");
  await waitUntil("document.querySelectorAll('.choice-button').length > 0", `${lesson.name}: choices did not render`, 3000);

  await clearLog();
  await click(".choice-button");
  await waitUntil(
    "window.__mathmonAudioQa.getLog().some((cue) => cue === 'answerCorrect' || cue === 'answerWrongSoft')",
    `${lesson.name}: answer cue was not logged`,
    2500
  );

  return {
    cueCount: loaded.length,
    answerLog: await getLog(),
  };
}

async function runSoundOffScenario(lesson) {
  await navigateToLesson(lesson, "off");
  await clearLog();
  await click(lesson.soundSelector);
  const pressed = await evaluate(`document.querySelector(${JSON.stringify(lesson.soundSelector)}).getAttribute("aria-pressed")`);
  assert(pressed === "false", `${lesson.name}: sound toggle did not switch off`);
  await click(lesson.startSelector);
  await delay(250);
  const log = await getLog();
  assert(log.length === 0, `${lesson.name}: sound-off start still logged cues: ${JSON.stringify(log)}`);
  return { mutedLogLength: log.length };
}

const summaries = [];

try {
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  for (const lesson of LESSONS) {
    const on = await runSoundOnScenario(lesson);
    const off = await runSoundOffScenario(lesson);
    summaries.push({ lesson: lesson.name, ...on, ...off });
  }
  console.log("MATHMON_AUDIO_SMOKE_QA: PASS");
  console.log(JSON.stringify({ lessons: summaries }, null, 2));
} finally {
  cdp.close();
  if (browser.exitCode === null) {
    browser.kill();
    await Promise.race([
      new Promise((resolve) => browser.once("exit", resolve)),
      delay(2000),
    ]);
  }
  await rm(PROFILE, { recursive: true, force: true });
}
