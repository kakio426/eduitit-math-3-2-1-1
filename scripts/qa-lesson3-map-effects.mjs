import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();
const LESSON = join(ROOT, "3-2-1-3-mathmon-jump-islands");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FILE_URL = `file://${LESSON.replaceAll(" ", "%20")}/index.html?seed=12345&qaProblem=tenfold`;
const PORT = Number(process.env.LESSON3_MAP_QA_PORT || 9253);
const PROFILE = await mkdtemp(join(tmpdir(), "lesson3-map-effects-profile-"));
const SCREENSHOT_DIR = await mkdtemp(join(tmpdir(), "lesson3-map-effects-"));
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet-landscape", width: 1024, height: 768 }
];
const EFFECT_CLASSES = [
  "is-map-travel-forward",
  "is-map-travel-back",
  "is-map-land",
  "is-map-land-shaky",
  "is-map-hop",
  "is-map-boost",
  "is-map-rainbow",
  "is-map-pause",
  "is-map-headwind",
  "is-map-shaky",
  "is-map-reduced-flash"
];
const SCENARIOS = [
  { name: "tailwind-stay", eventId: "tailwind", fromIndex: 1, toIndex: 1, activeClass: "is-map-hop" },
  { name: "headwind-stay", eventId: "headwind", fromIndex: 2, toIndex: 2, activeClass: "is-map-headwind" },
  { name: "gust-forward", eventId: "gust", fromIndex: 1, toIndex: 2, activeClass: "is-map-travel-forward", landingClass: "is-map-land" },
  { name: "rainbow-forward", eventId: "rainbow", fromIndex: 4, toIndex: 5, activeClass: "is-map-travel-forward", landingClass: "is-map-land" },
  { name: "shaky-backward", eventId: "shaky", fromIndex: 2, toIndex: 1, activeClass: "is-map-travel-back", landingClass: "is-map-land-shaky" }
];

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

let cdp;

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

async function captureScreenshot(name) {
  const { data } = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false
  });
  const path = join(SCREENSHOT_DIR, `${name}.png`);
  await writeFile(path, data, "base64");
  return path;
}

async function openLesson(viewport) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: false,
    screenOrientation: { type: "landscapePrimary", angle: 90 }
  });
  await cdp.send("Emulation.setEmulatedMedia", { features: [] });
  await cdp.send("Page.navigate", { url: `${FILE_URL}&viewport=${viewport.name}-${Date.now()}` });
  await waitUntil("document.readyState === 'complete'", `${viewport.name}: lesson did not load`, 5000);
  await delay(250);
  await evaluate('document.getElementById("startButton").click()');
  await delay(120);
  await evaluate('document.getElementById("tutorialNextButton").click()');
  await waitUntil("document.getElementById('playScreen').classList.contains('is-active')", `${viewport.name}: play screen did not open`, 3000);
  await delay(160);
}

async function setMapIsland(index) {
  await evaluate(`
(() => {
  const island = ISLANDS[${index}];
  state.correct = island.minCorrect;
  state.jumpDistance = island.minDistance;
  state.rainbowPath = Boolean(island.requiresRainbow);
  renderMap();
  return getReachedIsland().index;
})()
`);
}

async function triggerMapEffect(scenario) {
  const eventId = JSON.stringify(scenario.eventId);
  return evaluate(`
(() => {
  const island = ISLANDS[${scenario.toIndex}];
  state.correct = island.minCorrect;
  state.jumpDistance = island.minDistance;
  state.rainbowPath = Boolean(island.requiresRainbow);
  const markerEffect = {
    eventId: ${eventId},
    fromIndex: ${scenario.fromIndex},
    toIndex: ${scenario.toIndex}
  };
  renderMap({ markerEffect });
  return {
    delay: getMapMarkerEffectDelay(markerEffect),
    currentIndex: getReachedIsland().index
  };
})()
`);
}

function markerAtSource(index) {
  return `
(() => {
  const marker = document.getElementById("mapMathmonMarker");
  const chips = [...document.querySelectorAll(".island-chip")];
  const current = chips.find((chip) => chip.classList.contains("is-current"));
  if (!marker || !current) return false;
  const markerRect = marker.getBoundingClientRect();
  const chipRect = current.getBoundingClientRect();
  const markerCenter = markerRect.left + markerRect.width / 2;
  const chipCenter = chipRect.left + chipRect.width / 2;
  return chips.indexOf(current) === ${index}
    && Math.abs(markerCenter - chipCenter) <= 2
    && Number(getComputedStyle(marker).opacity) > 0.9;
})()
`;
}

async function readMarkerSnapshot() {
  return evaluate(`
(() => {
  const marker = document.getElementById("mapMathmonMarker");
  const map = document.getElementById("islandMap");
  const choices = document.getElementById("choiceGrid");
  const problemPanel = document.querySelector(".problem-panel");
  const chips = [...document.querySelectorAll(".island-chip")];
  const current = chips.find((chip) => chip.classList.contains("is-current"));
  const rect = (node) => {
    const item = node.getBoundingClientRect();
    return { left: item.left, top: item.top, right: item.right, bottom: item.bottom, width: item.width, height: item.height };
  };
  const overlaps = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
  const markerRect = rect(marker);
  const mapRect = rect(map);
  const chipRect = rect(current);
  const choiceRect = rect(choices);
  const problemRect = rect(problemPanel);
  return {
    classes: [...marker.classList],
    mapEffect: marker.dataset.mapEffect || "",
    currentIndex: chips.indexOf(current),
    centerDeltaX: Math.abs((markerRect.left + markerRect.width / 2) - (chipRect.left + chipRect.width / 2)),
    markerVisible: Number(getComputedStyle(marker).opacity) > 0.9,
    markerWithinMap: markerRect.left >= mapRect.left - 1
      && markerRect.right <= mapRect.right + 1
      && markerRect.top >= mapRect.top - 1
      && markerRect.bottom <= mapRect.bottom + 1,
    overlapsChoices: overlaps(markerRect, choiceRect),
    overlapsProblemPanel: overlaps(markerRect, problemRect),
    rewardVisible: document.getElementById("rewardPop").classList.contains("is-visible")
  };
})()
`);
}

function assertSnapshotSafe(snapshot, viewportName, scenarioName) {
  assert(snapshot.markerVisible, `${viewportName}/${scenarioName}: marker is not visible`);
  assert(snapshot.markerWithinMap, `${viewportName}/${scenarioName}: marker left the map: ${JSON.stringify(snapshot)}`);
  assert(!snapshot.overlapsChoices, `${viewportName}/${scenarioName}: marker overlaps choices: ${JSON.stringify(snapshot)}`);
  assert(!snapshot.overlapsProblemPanel, `${viewportName}/${scenarioName}: marker overlaps problem panel: ${JSON.stringify(snapshot)}`);
}

async function runScenario(viewport, scenario) {
  await setMapIsland(scenario.fromIndex);
  await waitUntil(markerAtSource(scenario.fromIndex), `${viewport.name}/${scenario.name}: marker did not settle at source island`);
  const effect = await triggerMapEffect(scenario);
  await delay(90);
  const activeSnapshot = await readMarkerSnapshot();
  assert(activeSnapshot.classes.includes(scenario.activeClass), `${viewport.name}/${scenario.name}: active class missing: ${JSON.stringify(activeSnapshot)}`);
  assert(!activeSnapshot.rewardVisible, `${viewport.name}/${scenario.name}: reward modal opened during marker effect`);
  assertSnapshotSafe(activeSnapshot, viewport.name, scenario.name);

  let landingSnapshot = null;
  let screenshot = null;
  if (scenario.landingClass) {
    await delay(430);
    landingSnapshot = await readMarkerSnapshot();
    assert(landingSnapshot.classes.includes(scenario.landingClass), `${viewport.name}/${scenario.name}: landing class missing: ${JSON.stringify(landingSnapshot)}`);
    assertSnapshotSafe(landingSnapshot, viewport.name, scenario.name);
    if (scenario.name === "gust-forward") {
      screenshot = await captureScreenshot(`${viewport.name}-gust-land`);
    }
  } else if (scenario.name === "tailwind-stay") {
    screenshot = await captureScreenshot(`${viewport.name}-tailwind-hop`);
  }

  await delay(effect.delay + 140);
  const finalSnapshot = await readMarkerSnapshot();
  assert(finalSnapshot.currentIndex === scenario.toIndex, `${viewport.name}/${scenario.name}: marker current island mismatch: ${JSON.stringify(finalSnapshot)}`);
  assert(finalSnapshot.centerDeltaX <= 2, `${viewport.name}/${scenario.name}: marker did not finish at island center: ${JSON.stringify(finalSnapshot)}`);
  assert(!finalSnapshot.classes.some((className) => EFFECT_CLASSES.includes(className)), `${viewport.name}/${scenario.name}: transient classes were not cleared: ${JSON.stringify(finalSnapshot)}`);
  assert(!finalSnapshot.rewardVisible, `${viewport.name}/${scenario.name}: reward modal opened during direct effect QA`);
  assertSnapshotSafe(finalSnapshot, viewport.name, scenario.name);
  return { name: scenario.name, activeSnapshot, landingSnapshot, finalSnapshot, screenshot };
}

async function runReducedMotionCheck(viewport) {
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }]
  });
  const scenario = { name: "reduced-motion", eventId: "gust", fromIndex: 1, toIndex: 2, activeClass: "is-map-reduced-flash" };
  await setMapIsland(scenario.fromIndex);
  await waitUntil(markerAtSource(scenario.fromIndex), `${viewport.name}/reduced-motion: marker did not settle at source island`);
  const effect = await triggerMapEffect(scenario);
  await delay(30);
  const activeSnapshot = await readMarkerSnapshot();
  assert(activeSnapshot.classes.includes("is-map-reduced-flash"), `${viewport.name}/reduced-motion: reduced flash class missing: ${JSON.stringify(activeSnapshot)}`);
  assert(!activeSnapshot.classes.includes("is-map-travel-forward"), `${viewport.name}/reduced-motion: movement class should not be used: ${JSON.stringify(activeSnapshot)}`);
  await delay(effect.delay + 120);
  const finalSnapshot = await readMarkerSnapshot();
  assert(finalSnapshot.currentIndex === scenario.toIndex, `${viewport.name}/reduced-motion: marker did not update destination`);
  assert(!finalSnapshot.classes.some((className) => EFFECT_CLASSES.includes(className)), `${viewport.name}/reduced-motion: effect class did not clear: ${JSON.stringify(finalSnapshot)}`);
  await cdp.send("Emulation.setEmulatedMedia", { features: [] });
  return { activeSnapshot, finalSnapshot };
}

async function runModalDelayCheck(viewport) {
  await setMapIsland(1);
  await waitUntil(markerAtSource(1), `${viewport.name}/modal-delay: marker did not settle at source island`);
  await evaluate(`
(() => {
  QA.nextRewardId = "tailwind";
  showReward();
})()
`);
  await delay(120);
  const beforeModal = await readMarkerSnapshot();
  assert(beforeModal.classes.includes("is-map-hop"), `${viewport.name}/modal-delay: marker effect did not start before modal: ${JSON.stringify(beforeModal)}`);
  assert(!beforeModal.rewardVisible, `${viewport.name}/modal-delay: reward modal opened before map effect finished`);
  assertSnapshotSafe(beforeModal, viewport.name, "modal-delay-before");
  await waitUntil("document.getElementById('rewardPop').classList.contains('is-visible')", `${viewport.name}/modal-delay: reward modal did not open after marker effect`, 1400);
  const afterModal = await readMarkerSnapshot();
  assert(afterModal.rewardVisible, `${viewport.name}/modal-delay: reward modal not visible after delay`);
  assertSnapshotSafe(afterModal, viewport.name, "modal-delay-after");
  return { beforeModal, afterModal };
}

async function runViewport(viewport) {
  await openLesson(viewport);
  const scenarioResults = [];
  for (const scenario of SCENARIOS) {
    scenarioResults.push(await runScenario(viewport, scenario));
  }
  const reducedMotion = await runReducedMotionCheck(viewport);
  const modalDelay = await runModalDelayCheck(viewport);
  return { viewport, scenarios: scenarioResults, reducedMotion, modalDelay };
}

try {
  cdp = new Cdp(await waitForJson());
  await cdp.open();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  const results = [];
  for (const viewport of VIEWPORTS) {
    results.push(await runViewport(viewport));
  }

  console.log("LESSON3_MAP_EFFECT_QA: PASS");
  console.log(JSON.stringify({
    screenshotDir: SCREENSHOT_DIR,
    screenshots: results.flatMap((result) => result.scenarios.map((scenario) => scenario.screenshot).filter(Boolean)),
    results
  }, null, 2));
} finally {
  if (cdp) {
    cdp.close();
  }
  if (browser.exitCode === null) {
    browser.kill();
    await Promise.race([
      new Promise((resolve) => browser.once("exit", resolve)),
      delay(2000)
    ]);
  }
  await rm(PROFILE, { recursive: true, force: true });
}
