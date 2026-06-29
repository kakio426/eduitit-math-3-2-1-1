#!/usr/bin/env node
import fs from "node:fs";
import fsp from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const ROOT = process.cwd();
const LESSON = "3-2-5-4-mathmon-package-weight";
const DEFAULT_SEED = 424242;
const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  "/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  "/Applications/Chromium.app/Contents/MacOS/Chromium"
];

const MIME = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml; charset=utf-8"]
]);

function parseArgs(argv) {
  const options = { seed: DEFAULT_SEED };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--seed") {
      options.seed = Number(argv[++index]);
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }
  if (!Number.isInteger(options.seed) || options.seed < 0) {
    throw new Error("--seed must be a non-negative whole number");
  }
  return options;
}

function assert(condition, message, details = undefined) {
  if (!condition) {
    const error = new Error(message);
    if (details) error.details = details;
    throw error;
  }
}

function getChromePath() {
  const chromePath = CHROME_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  assert(chromePath, `No Chrome binary found in: ${CHROME_CANDIDATES.join(", ")}`);
  return chromePath;
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close(() => port ? resolve(port) : reject(new Error("No free port allocated")));
    });
    server.on("error", reject);
  });
}

function makeServer(port) {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);
    if (requestUrl.pathname === "/favicon.ico") {
      response.writeHead(204);
      response.end();
      return;
    }
    const resolved = path.resolve(ROOT, `.${decodeURIComponent(requestUrl.pathname)}`);
    if (!resolved.startsWith(ROOT)) {
      response.writeHead(403);
      response.end("forbidden");
      return;
    }
    const filePath = fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()
      ? path.join(resolved, "index.html")
      : resolved;
    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(error.code === "ENOENT" ? 404 : 500, { "content-type": "text/plain; charset=utf-8" });
        response.end(error.code || "error");
        return;
      }
      response.writeHead(200, { "content-type": MIME.get(path.extname(filePath)) || "application/octet-stream" });
      response.end(data);
    });
  });
  return new Promise((resolve, reject) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
    server.on("error", reject);
  });
}

function closeServer(server) {
  return new Promise((resolve) => server.close(resolve));
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return false;
  child.kill("SIGTERM");
  const exited = await Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    delay(2000).then(() => false)
  ]);
  if (exited) return true;
  child.kill("SIGKILL");
  await Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    delay(1000).then(() => false)
  ]);
  return true;
}

async function fetchJson(url, attempts = 60) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      lastError = new Error(`HTTP ${response.status} for ${url}`);
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw lastError || new Error(`Failed to fetch ${url}`);
}

class Cdp {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => this.onMessage(event));
  }

  onMessage(event) {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const pending = this.pending.get(message.id);
    if (!pending) return;
    this.pending.delete(message.id);
    if (message.error) {
      pending.reject(new Error(message.error.message || JSON.stringify(message.error)));
      return;
    }
    pending.resolve(message.result);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  close() {
    this.ws.close();
  }
}

async function waitForPageTarget(debugPort, pageUrl) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`, 1).catch(() => []);
    const target = targets.find((item) => item.type === "page" && item.url === pageUrl)
      || targets.find((item) => item.type === "page" && item.url.includes(`/${LESSON}/index.html`));
    if (target?.webSocketDebuggerUrl) return target.webSocketDebuggerUrl;
    await delay(100);
  }
  throw new Error("Chrome page target was not exposed over CDP");
}

async function launchChrome(pageUrl, debugPort, profileDir) {
  const chrome = spawn(getChromePath(), [
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-popup-blocking",
    "--window-size=1280,800",
    pageUrl
  ], { stdio: "ignore" });
  await fetchJson(`http://127.0.0.1:${debugPort}/json/version`);
  return chrome;
}

async function waitForLoad(page) {
  await page.send("Runtime.evaluate", {
    expression: "new Promise((resolve) => { if (document.readyState === 'complete') resolve(true); else window.addEventListener('load', () => resolve(true), { once: true }); })",
    awaitPromise: true,
    returnByValue: true
  });
}

async function evalInPage(page, expression) {
  const result = await page.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  }
  return result.result.value;
}

async function loadLessonPage(page, pageUrl) {
  await page.send("Page.navigate", { url: pageUrl });
  await waitForLoad(page);
}

async function dispatchMouseClick(page, x, y, clickCount = 1) {
  await page.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x,
    y,
    button: "none"
  });
  await page.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x,
    y,
    button: "left",
    buttons: 1,
    clickCount
  });
  await page.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x,
    y,
    button: "left",
    buttons: 0,
    clickCount
  });
}

const PLAY_TO_COMPLETE = String.raw`
(async () => {
  const waitFor = (predicate, label, timeout = 5000) => new Promise((resolve, reject) => {
    const started = performance.now();
    const tick = () => {
      if (predicate()) {
        resolve(true);
        return;
      }
      if (performance.now() - started > timeout) {
        reject(new Error("Timed out waiting for " + label));
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
  const clickCorrect = () => {
    const button = [...document.querySelectorAll("#choicesPanel button")]
      .find((item) => item.dataset.correct === "true" && !item.disabled);
    if (!button) throw new Error("correct choice not found");
    button.click();
  };

  document.querySelector("#startButton").click();
  document.querySelector("#tutorialStartButton").click();
  await waitFor(() => document.querySelector("#screen-play").classList.contains("is-active"), "play screen");
  clickCorrect();
  await waitFor(() => [...document.querySelectorAll("#choicesPanel button")].some((item) => item.dataset.correct === "true" && !item.disabled), "step 2 choices");
  clickCorrect();
  await waitFor(() => document.querySelector("#completePanel").classList.contains("is-visible"), "complete panel");
	  return {
	    progressBeforeReward: document.querySelector("#runProgressText").textContent,
	    problemCounter: document.querySelector("#problemCounter").textContent,
	    truckDisabled: document.querySelector("#truckButton").disabled
	  };
	})()
	`;

	function expectedSingleUpgradeExpression(seed) {
	  return `(() => {
	    const model = window.Lesson5PackageWeightModel;
	    const rng = model.createRng((${seed} + 0x9e3779b9) >>> 0);
	    const event = model.pickUpgradeEvent(rng, false);
	    const upgradeResult = model.applyUpgrade({ truckPower: 0, correctFirstTry: 0, superPartSeen: false }, event, true);
	    const actualMovement = upgradeResult.truckPower - upgradeResult.before;
	    const truckResult = model.getTruckResult(upgradeResult.truckPower, upgradeResult.correctFirstTry, upgradeResult.superPartSeen);
	    const expectedChangeText = actualMovement <= 2
	      ? "조금 멋져졌어요."
	      : actualMovement >= 28
	        ? "크게 멋져졌어요."
	        : "트럭이 멋져졌어요.";
	    return {
	      eventId: event.id,
	      family: event.family,
	      amount: event.amount,
	      expectedTruckPower: upgradeResult.truckPower,
	      expectedCorrectFirstTry: upgradeResult.correctFirstTry,
	      expectedStageText: truckResult.name,
	      expectedActualMovement: actualMovement,
	      expectedRawMovement: upgradeResult.skillPower + event.amount,
	      expectedChangeText
	    };
	  })()`;
	}

	async function runTruckButtonTripleProbe(page, pageUrl, seed) {
	  await loadLessonPage(page, pageUrl);
	  const setup = await evalInPage(page, PLAY_TO_COMPLETE);
	  const expected = await evalInPage(page, expectedSingleUpgradeExpression(seed));
	  const observed = await evalInPage(page, String.raw`
	    (() => {
	      const button = document.querySelector("#truckButton");
	      button.click();
	      button.click();
	      button.click();
	      return {
	        rewardActive: document.querySelector("#screen-reward").classList.contains("is-active"),
	        truckDisabledAfterClicks: button.disabled,
	        stageText: document.querySelector("#rewardStageText").textContent,
	        changeText: document.querySelector("#rewardChange").textContent,
	        title: document.querySelector("#rewardTitle").textContent
	      };
	    })()
	  `);
	  const pass = observed.rewardActive
	    && observed.stageText === expected.expectedStageText
	    && observed.changeText === expected.expectedChangeText;
	  return { name: "truck_button_triple_click", pass, setup, expected, observed };
	}

async function runRewardNextDoubleProbe(page, pageUrl) {
  await loadLessonPage(page, pageUrl);
	  const setup = await evalInPage(page, PLAY_TO_COMPLETE);
	  const observed = await evalInPage(page, String.raw`
	    (() => {
	      const truckButton = document.querySelector("#truckButton");
	      truckButton.click();
	      const nextButton = document.querySelector("#rewardNextButton");
	      nextButton.click();
	      nextButton.click();
      return {
        rewardActive: document.querySelector("#screen-reward").classList.contains("is-active"),
        playActive: document.querySelector("#screen-play").classList.contains("is-active"),
        resultActive: document.querySelector("#screen-result").classList.contains("is-active"),
        nextDisabledAfterClicks: nextButton.disabled,
        problemCounter: document.querySelector("#problemCounter").textContent,
        problemTitle: document.querySelector("#problemTitle").textContent
      };
    })()
  `);
  const pass = observed.playActive && !observed.resultActive && observed.problemCounter === "2/10";
  return { name: "reward_next_double_click", pass, setup, expected: { problemCounter: "2/10" }, observed };
}

async function runRewardNextPhysicalDoubleClickProbe(page, pageUrl) {
	  await loadLessonPage(page, pageUrl);
	  const setup = await evalInPage(page, PLAY_TO_COMPLETE);
	  const beforeClick = await evalInPage(page, String.raw`
	    (() => {
	      document.querySelector("#truckButton").click();
	      const rect = document.querySelector("#rewardNextButton").getBoundingClientRect();
	      return {
        rewardActive: document.querySelector("#screen-reward").classList.contains("is-active"),
        buttonText: document.querySelector("#rewardNextButton").textContent,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    })()
  `);
  await dispatchMouseClick(page, beforeClick.x, beforeClick.y, 1);
  await delay(520);
  const targetAtSecondClick = await evalInPage(page, String.raw`
    ((x, y) => {
      const target = document.elementFromPoint(x, y);
      return {
        tagName: target?.tagName || null,
        text: target?.textContent || "",
        className: target?.className || "",
        isChoiceButton: Boolean(target?.closest?.("#choicesPanel button"))
      };
    })
  ` + `(${JSON.stringify(beforeClick.x)}, ${JSON.stringify(beforeClick.y)})`);
  await dispatchMouseClick(page, beforeClick.x, beforeClick.y, 2);
  await delay(120);
  const afterCarryThrough = await evalInPage(page, String.raw`
    (() => ({
      rewardActive: document.querySelector("#screen-reward").classList.contains("is-active"),
      playActive: document.querySelector("#screen-play").classList.contains("is-active"),
      resultActive: document.querySelector("#screen-result").classList.contains("is-active"),
      problemCounter: document.querySelector("#problemCounter").textContent,
      answerSlot: document.querySelector("#answerSlot").textContent,
      answerFilled: document.querySelector("#answerSlot").classList.contains("is-filled"),
      feedbackText: document.querySelector("#feedbackLine").textContent,
      wrongChoices: document.querySelectorAll("#choicesPanel button.is-wrong").length,
      correctChoices: document.querySelectorAll("#choicesPanel button.is-correct").length,
      disabledChoices: [...document.querySelectorAll("#choicesPanel button")].filter((button) => button.disabled).length
    }))()
  `);
  await delay(450);
  const afterNormalClick = await evalInPage(page, String.raw`
    (() => {
      const button = [...document.querySelectorAll("#choicesPanel button")]
        .find((item) => item.dataset.correct === "true" && !item.disabled);
      if (!button) throw new Error("correct choice not found after carry-through guard");
      button.click();
      return {
        answerSlot: document.querySelector("#answerSlot").textContent,
        answerFilled: document.querySelector("#answerSlot").classList.contains("is-filled"),
        feedbackText: document.querySelector("#feedbackLine").textContent,
        correctChoices: document.querySelectorAll("#choicesPanel button.is-correct").length
      };
    })()
  `);
  const pass = beforeClick.rewardActive
    && afterCarryThrough.playActive
    && !afterCarryThrough.resultActive
    && afterCarryThrough.problemCounter === "2/10"
    && afterCarryThrough.answerSlot === "?"
    && !afterCarryThrough.answerFilled
    && afterCarryThrough.feedbackText === ""
    && afterCarryThrough.wrongChoices === 0
    && afterCarryThrough.correctChoices === 0
    && afterCarryThrough.disabledChoices === 0
    && afterNormalClick.answerFilled
    && afterNormalClick.correctChoices === 1;
  return {
    name: "reward_next_physical_double_click_no_carry_through",
    pass,
    setup,
    expected: {
      afterRapidDoubleClick: "problem 2/10 visible with no selected choice, no feedback, no disabled choice",
      normalClickAfterGuard: "first correct choice still works after the short guard"
    },
    observed: { beforeClick, afterCarryThrough, afterNormalClick },
    diagnostic: { targetAtSecondClick }
  };
}

	async function runTruckButtonStaleEventProbe(page, pageUrl, seed) {
	  await loadLessonPage(page, pageUrl);
	  const setup = await evalInPage(page, PLAY_TO_COMPLETE);
	  const expected = await evalInPage(page, expectedSingleUpgradeExpression(seed));
	  const observed = await evalInPage(page, String.raw`
	    (() => {
	      const button = document.querySelector("#truckButton");
	      button.click();
	      button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
	      button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
	      button.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
	      return {
	        rewardActive: document.querySelector("#screen-reward").classList.contains("is-active"),
	        truckDisabledAfterEvents: button.disabled,
	        stageText: document.querySelector("#rewardStageText").textContent,
	        changeText: document.querySelector("#rewardChange").textContent
	      };
	    })()
	  `);
	  const pass = observed.rewardActive
	    && observed.stageText === expected.expectedStageText
	    && observed.changeText === expected.expectedChangeText;
	  return { name: "truck_button_stale_pointer_keyboard_events", pass, setup, expected, observed };
	}

async function runRewardNextStaleEventProbe(page, pageUrl) {
  await loadLessonPage(page, pageUrl);
	  const setup = await evalInPage(page, PLAY_TO_COMPLETE);
	  const observed = await evalInPage(page, String.raw`
	    (() => {
	      document.querySelector("#truckButton").click();
	      const nextButton = document.querySelector("#rewardNextButton");
      nextButton.click();
      nextButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      nextButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      nextButton.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
      return {
        rewardActive: document.querySelector("#screen-reward").classList.contains("is-active"),
        playActive: document.querySelector("#screen-play").classList.contains("is-active"),
        resultActive: document.querySelector("#screen-result").classList.contains("is-active"),
        nextDisabledAfterEvents: nextButton.disabled,
        problemCounter: document.querySelector("#problemCounter").textContent,
        problemTitle: document.querySelector("#problemTitle").textContent
      };
    })()
  `);
  const pass = observed.playActive && !observed.resultActive && observed.problemCounter === "2/10";
  return { name: "reward_next_stale_pointer_keyboard_events", pass, setup, expected: { problemCounter: "2/10" }, observed };
}

async function runSeedReplayProbe(page, seedPageUrl, randomPageUrl) {
  const readReplayFromResult = async (url) => {
    await loadLessonPage(page, url);
    return evalInPage(page, String.raw`
      (async () => {
        window.setTimeout = (callback) => {
          queueMicrotask(callback);
          return 0;
        };
        const waitFor = (predicate, label, timeout = 5000) => new Promise((resolve, reject) => {
          const started = performance.now();
          const tick = () => {
            if (predicate()) {
              resolve(true);
              return;
            }
            if (performance.now() - started > timeout) {
              reject(new Error("Timed out waiting for " + label));
              return;
            }
            requestAnimationFrame(tick);
          };
          tick();
        });
        const clickCorrect = () => {
          const button = [...document.querySelectorAll("#choicesPanel button")]
            .find((item) => item.dataset.correct === "true" && !item.disabled);
          if (!button) throw new Error("correct choice not found");
          button.click();
        };
        document.querySelector("#startButton").click();
        document.querySelector("#tutorialStartButton").click();
        await waitFor(() => document.querySelector("#screen-play").classList.contains("is-active"), "first play screen");
        const firstTitle = document.querySelector("#problemTitle").textContent;
        for (let guard = 0; guard < 80 && !document.querySelector("#screen-result").classList.contains("is-active"); guard += 1) {
          if (document.querySelector("#screen-reward").classList.contains("is-active")) {
            document.querySelector("#rewardNextButton").click();
            await waitFor(() => document.querySelector("#screen-play").classList.contains("is-active") || document.querySelector("#screen-result").classList.contains("is-active"), "reward advance");
            continue;
          }
	          if (document.querySelector("#completePanel").classList.contains("is-visible")) {
	            document.querySelector("#truckButton").click();
	            await waitFor(() => document.querySelector("#screen-reward").classList.contains("is-active"), "reward screen");
	            continue;
          }
          clickCorrect();
          await waitFor(() => [...document.querySelectorAll("#choicesPanel button")].some((item) => item.dataset.correct === "true" && !item.disabled)
            || document.querySelector("#completePanel").classList.contains("is-visible"), "next choice or complete");
        }
        await waitFor(() => document.querySelector("#screen-result").classList.contains("is-active"), "result screen");
        const retryVisibleBeforeReplay = getComputedStyle(document.querySelector("#retryButton")).display !== "none";
        document.querySelector("#retryButton").click();
        await waitFor(() => document.querySelector("#screen-play").classList.contains("is-active"), "replay play screen");
        const replayTitle = document.querySelector("#problemTitle").textContent;
        return { firstTitle, replayTitle, retryVisibleBeforeReplay };
      })()
    `);
  };
  const deterministic = await readReplayFromResult(seedPageUrl);
  const fresh = await readReplayFromResult(randomPageUrl);
  const pass = deterministic.firstTitle === deterministic.replayTitle
    && deterministic.retryVisibleBeforeReplay
    && fresh.retryVisibleBeforeReplay
    && fresh.firstTitle !== fresh.replayTitle;
  return {
    name: "retry_seed_policy",
    pass,
    expected: {
      explicitSeed: "same first problem on replay",
      noSeed: "at least one fresh first problem across retries"
    },
    observed: { deterministic, fresh }
  };
}

async function runResultRasterContractProbe(page, pageUrl) {
  await loadLessonPage(page, pageUrl);
  const observed = await evalInPage(page, String.raw`
    (() => {
      const retryButton = document.querySelector("#retryButton");
      const title = document.querySelector("#resultTitle");
      const summary = document.querySelector("#resultSummary");
      const next = document.querySelector("#resultNext");
      const isVisuallyHidden = (element) => {
        if (!element) return false;
        const style = getComputedStyle(element);
        return style.position === "absolute"
          && element.clientWidth <= 1
          && element.clientHeight <= 1
          && style.overflow === "hidden";
      };
      return {
        hasResultCard: Boolean(document.querySelector(".result-card")),
        hasCssResultHeading: Boolean(document.querySelector(".result-truck-name")),
        hasResultTitleArt: document.querySelector("#resultTitleArt")?.tagName === "IMG",
        hasRetryArt: document.querySelector(".result-retry-art")?.tagName === "IMG",
        retryVisibleText: retryButton?.textContent.trim() || "",
        retryAriaLabel: retryButton?.getAttribute("aria-label") || "",
        titleHidden: isVisuallyHidden(title),
        summaryHidden: isVisuallyHidden(summary),
        nextHidden: isVisuallyHidden(next)
      };
    })()
  `);
  const pass = !observed.hasResultCard
    && !observed.hasCssResultHeading
    && observed.hasResultTitleArt
    && observed.hasRetryArt
    && observed.retryVisibleText === ""
    && observed.retryAriaLabel === "다시"
    && observed.titleHidden
    && observed.summaryHidden
    && observed.nextHidden;
  return {
    name: "result_raster_contract_no_css_card",
    pass,
    expected: {
      visibleResultText: "generated image assets only",
      retryButton: "transparent accessible hitbox over generated button art"
    },
    observed
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const serverPort = await getFreePort();
  const debugPort = await getFreePort();
  const profileDir = await fsp.mkdtemp(path.join(os.tmpdir(), "lesson5-click-guards-"));
  const seedPageUrl = `http://127.0.0.1:${serverPort}/${LESSON}/index.html?seed=${options.seed}`;
  const randomPageUrl = `http://127.0.0.1:${serverPort}/${LESSON}/index.html`;
  let server;
  let chrome;
  let page;
  const cleanup = { serverPort, debugPort, profileDir, serverClosed: false, chromeKilled: false, profileRemoved: false };

  try {
    server = await makeServer(serverPort);
    chrome = await launchChrome(seedPageUrl, debugPort, profileDir);
    const pageWs = await waitForPageTarget(debugPort, seedPageUrl);
    page = new Cdp(pageWs);
    await page.open();
    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await waitForLoad(page);

	    const probes = [
	      await runTruckButtonTripleProbe(page, seedPageUrl, options.seed),
	      await runRewardNextDoubleProbe(page, seedPageUrl),
	      await runRewardNextPhysicalDoubleClickProbe(page, seedPageUrl),
	      await runTruckButtonStaleEventProbe(page, seedPageUrl, options.seed),
	      await runRewardNextStaleEventProbe(page, seedPageUrl),
	      await runSeedReplayProbe(page, seedPageUrl, randomPageUrl),
	      await runResultRasterContractProbe(page, seedPageUrl)
	    ];
    const pass = probes.every((probe) => probe.pass);
    const payload = {
      status: pass ? "PASS" : "FAIL",
      seed: options.seed,
      browser: getChromePath(),
      seedPageUrl,
      randomPageUrl,
      probes
    };
    console.log("LESSON5_PACKAGE_WEIGHT_CLICK_GUARDS: " + payload.status);
    console.log(JSON.stringify(payload, null, 2));
    if (!pass) {
      process.exitCode = 1;
    }
  } finally {
    if (page) page.close();
    if (server) {
      await closeServer(server);
      cleanup.serverClosed = true;
    }
    cleanup.chromeKilled = await stopProcess(chrome);
    await fsp.rm(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    cleanup.profileRemoved = true;
    console.error("CLEANUP " + JSON.stringify(cleanup));
  }
}

main().catch((error) => {
  console.error("LESSON5_PACKAGE_WEIGHT_CLICK_GUARDS: ERROR");
  console.error(error.stack || error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  process.exit(1);
});
