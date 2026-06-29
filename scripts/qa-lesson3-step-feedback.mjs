import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const LESSON = join(ROOT, "3-2-1-3-mathmon-jump-islands");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FILE_URL = `file://${LESSON.replaceAll(" ", "%20")}/index.html?seed=12345&qaProblem=tenfold`;
const VIEWPORT = {
  name: process.env.LESSON3_QA_NAME || "desktop",
  width: Number(process.env.LESSON3_QA_WIDTH || 1280),
  height: Number(process.env.LESSON3_QA_HEIGHT || 800)
};
const PORT = Number(process.env.LESSON3_QA_PORT || 9251);
const PROFILE = join(ROOT, ".tmp-qa", `lesson3-step-feedback-profile-${VIEWPORT.name}`);

await rm(PROFILE, { recursive: true, force: true });

const browser = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--allow-file-access-from-files",
  "about:blank"
], { stdio: ["ignore", "ignore", "pipe"] });

browser.stderr.on("data", () => {});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(JSON.stringify(result.exceptionDetails));
  }
  return result.result?.value;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitUntil(predicateSource, message, timeout = 3000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(predicateSource)) {
      return;
    }
    await delay(80);
  }
  throw new Error(message);
}

async function waitForStepText(expectedText, viewport, timeout = 5000) {
  try {
    await waitUntil(`document.getElementById("stepText").textContent.trim() === "${expectedText}"`, `${viewport.name}: play screen did not reach ${expectedText}`, timeout);
  } catch (error) {
    const snapshot = await readFeedbackSnapshot();
    throw new Error(`${error.message}; snapshot=${JSON.stringify(snapshot)}`);
  }
}

async function clickCorrectChoice() {
  return evaluate(`
(() => {
  const problem = currentProblem();
  const isSecondStep = document.getElementById("stepText").textContent.trim() === "2단계";
  const step = window.__lesson3MathModel.buildSteps(problem)[isSecondStep ? 1 : 0];
  const target = formatChoice(step.correct);
  const button = [...document.querySelectorAll(".choice-button")].find((candidate) => candidate.textContent.trim() === target);
  if (!button) throw new Error("correct choice not found: " + target);
  button.click();
  return {
    stepId: step.id,
    reveal: step.reveal,
    target,
    finalExpression: problem.finalExpression
  };
})()
`);
}

async function readFeedbackSnapshot() {
  return evaluate(`
(() => ({
  stepText: document.getElementById("stepText").textContent.trim(),
  prompt: document.getElementById("promptText").textContent.trim(),
  promptHidden: document.getElementById("promptText").hidden,
  transform: document.getElementById("jumpTransform").textContent.trim(),
  promptFits: document.getElementById("promptText").hidden || (
    document.getElementById("promptText").scrollWidth <= document.getElementById("promptText").clientWidth + 1
    && document.getElementById("promptText").scrollHeight <= document.getElementById("promptText").clientHeight + 1
  ),
  transformFits: document.getElementById("jumpTransform").scrollWidth <= document.getElementById("jumpTransform").clientWidth + 1
    && document.getElementById("jumpTransform").scrollHeight <= document.getElementById("jumpTransform").clientHeight + 1,
  rewardButtonLabel: document.querySelector(".reward-check-button")?.getAttribute("aria-label") || "",
  rewardButtonImage: document.querySelector(".reward-check-button img")?.getAttribute("src") || "",
  rewardVisible: document.getElementById("rewardPop").classList.contains("is-visible")
}))()
`);
}

async function runScenario(viewport) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: { type: "landscapePrimary", angle: 90 }
  });
  await cdp.send("Page.navigate", { url: `${FILE_URL}&viewport=${viewport.name}-${Date.now()}` });
  await delay(900);

  await evaluate('document.getElementById("startButton").click()');
  await delay(120);
  await evaluate('document.getElementById("tutorialNextButton").click()');
  await waitForStepText("1단계", viewport);

  const firstStep = await clickCorrectChoice();
  await delay(220);
  const firstSnapshot = await readFeedbackSnapshot();
  assert(firstSnapshot.transform === firstStep.reveal, `${viewport.name}: first correct step did not reveal calculation: ${JSON.stringify(firstSnapshot)}`);
  assert(firstSnapshot.prompt.includes("맞았어요"), `${viewport.name}: first correct step did not show confirmation copy: ${JSON.stringify(firstSnapshot)}`);
  assert(firstSnapshot.promptFits && firstSnapshot.transformFits, `${viewport.name}: first confirmation text overflowed: ${JSON.stringify(firstSnapshot)}`);
  assert(!firstSnapshot.rewardVisible, `${viewport.name}: reward modal appeared during first-step confirmation`);

  await waitForStepText("2단계", viewport);
  const secondStep = await clickCorrectChoice();
  await delay(220);
  const secondSnapshot = await readFeedbackSnapshot();
  assert(secondSnapshot.transform === secondStep.reveal, `${viewport.name}: second correct step did not reveal final answer: ${JSON.stringify(secondSnapshot)}`);
  assert(secondSnapshot.prompt.includes("맞았어요"), `${viewport.name}: second correct step did not show confirmation copy: ${JSON.stringify(secondSnapshot)}`);
  assert(secondSnapshot.promptFits && secondSnapshot.transformFits, `${viewport.name}: second confirmation text overflowed: ${JSON.stringify(secondSnapshot)}`);
  assert(!secondSnapshot.rewardVisible, `${viewport.name}: reward modal appeared during second-step confirmation`);

  await delay(1200);
  const heldSnapshot = await readFeedbackSnapshot();
  assert(heldSnapshot.transform === secondStep.finalExpression, `${viewport.name}: completed expression was not simplified to the final equation: ${JSON.stringify(heldSnapshot)}`);
  assert(heldSnapshot.promptHidden, `${viewport.name}: completed prompt should be hidden: ${JSON.stringify(heldSnapshot)}`);
  assert(heldSnapshot.rewardButtonLabel === "어떤 바람이 불까?", `${viewport.name}: generated reward image button did not appear: ${JSON.stringify(heldSnapshot)}`);
  assert(heldSnapshot.rewardButtonImage.endsWith("reward-wind-button-generated.webp"), `${viewport.name}: generated reward image button asset was not used: ${JSON.stringify(heldSnapshot)}`);
  assert(heldSnapshot.promptFits && heldSnapshot.transformFits, `${viewport.name}: completed expression text overflowed: ${JSON.stringify(heldSnapshot)}`);
  assert(!heldSnapshot.rewardVisible, `${viewport.name}: reward modal opened before the student pressed the reward button: ${JSON.stringify(heldSnapshot)}`);

  await evaluate('document.querySelector(".reward-check-button").click()');
  await waitUntil('document.getElementById("rewardPop").classList.contains("is-visible")', `${viewport.name}: reward modal did not appear after confirmation hold`, 2500);
  return { viewport, firstSnapshot, secondSnapshot, heldSnapshot };
}

try {
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  const result = await runScenario(VIEWPORT);
  console.log("LESSON3_STEP_FEEDBACK_QA: PASS");
  console.log(JSON.stringify({ result }, null, 2));
} finally {
  cdp.close();
  if (browser.exitCode === null) {
    browser.kill();
    await Promise.race([
      new Promise((resolve) => browser.once("exit", resolve)),
      delay(2000)
    ]);
  }
  await rm(PROFILE, { recursive: true, force: true });
}
