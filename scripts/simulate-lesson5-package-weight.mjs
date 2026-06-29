#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const LESSON_PATH = path.join(ROOT, "3-2-5-4-mathmon-package-weight", "index.html");
const PROFILES = [0, 6, 8, 10];

function parseArgs(argv) {
  const options = { runs: 20000, seed: 73571 };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--runs") {
      options.runs = Number(argv[++index]);
      continue;
    }
    if (arg === "--seed") {
      options.seed = Number(argv[++index]);
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }
  if (!Number.isInteger(options.runs) || options.runs < 1) {
    throw new Error("--runs must be a positive whole number");
  }
  return options;
}

function loadLessonModel() {
  const html = fs.readFileSync(LESSON_PATH, "utf8");
  const start = html.indexOf("const Lesson5PackageWeightModel = (() => {");
  const end = html.indexOf("\n\n    const screens", start);
  if (start === -1 || end === -1) throw new Error("Lesson5PackageWeightModel block not found");
  const source = `${html.slice(start, end)}\nLesson5PackageWeightModel;`;
  return vm.runInContext(source, vm.createContext({ console }), { filename: LESSON_PATH });
}

function simulateOne(model, rng, correctCount) {
  let state = { truckPower: 0, correctFirstTry: 0, superPartSeen: false };
  const families = [];
  for (let index = 0; index < model.TOTAL_PROBLEMS; index += 1) {
    const firstTry = index < correctCount;
    const event = model.pickUpgradeEvent(rng, !firstTry);
    const applied = model.applyUpgrade(state, event, firstTry);
    state = {
      truckPower: applied.truckPower,
      correctFirstTry: applied.correctFirstTry,
      superPartSeen: applied.superPartSeen
    };
    families.push(event.family);
  }
  const truckResult = model.getTruckResult(state.truckPower, state.correctFirstTry, state.superPartSeen);
  return { ...state, truckResult, families };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const model = loadLessonModel();
  const summaries = [];
  const familySeen = new Set();

  for (const correctCount of PROFILES) {
    const rng = model.createRng((options.seed + correctCount * 1009) >>> 0);
    const truckResultCounts = new Map(model.TRUCK_RESULTS.map((item) => [item.name, 0]));
    let totalTruckPower = 0;
    let minTruckPower = Infinity;
    let maxTruckPower = -Infinity;
    for (let run = 0; run < options.runs; run += 1) {
      const result = simulateOne(model, rng, correctCount);
      truckResultCounts.set(result.truckResult.name, truckResultCounts.get(result.truckResult.name) + 1);
      totalTruckPower += result.truckPower;
      minTruckPower = Math.min(minTruckPower, result.truckPower);
      maxTruckPower = Math.max(maxTruckPower, result.truckPower);
      result.families.forEach((family) => familySeen.add(family));
    }
    summaries.push({
      correctCount,
      runs: options.runs,
      averageTruckPower: Number((totalTruckPower / options.runs).toFixed(2)),
      truckPowerRange: `${minTruckPower}-${maxTruckPower}`,
      truckResultCounts: Object.fromEntries(truckResultCounts)
    });
  }

  const requiredFamilies = ["smallUpgrade", "bigUpgrade", "styleUpgrade", "smallOnly", "superUpgrade", "repair"];
  const missing = requiredFamilies.filter((family) => !familySeen.has(family));
  if (missing.length) {
    throw new Error(`Missing reward families: ${missing.join(", ")}`);
  }

  console.log("LESSON5_PACKAGE_WEIGHT_REWARD_SIM: PASS");
  console.log(JSON.stringify({
    runsPerProfile: options.runs,
    profiles: summaries,
    familySeen: [...familySeen].sort()
  }, null, 2));
}

main();
