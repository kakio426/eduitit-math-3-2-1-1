#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const LESSON_PATH = path.join(ROOT, "3-2-5-4-mathmon-package-weight", "index.html");

function parseArgs(argv) {
  const options = {
    runs: 100000,
    seed: 20260629,
    injectBadCarry: false
  };
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
    if (arg === "--inject-bad-carry") {
      options.injectBadCarry = true;
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }
  if (!Number.isInteger(options.runs) || options.runs < 1) {
    throw new Error("--runs must be a positive whole number");
  }
  if (!Number.isInteger(options.seed) || options.seed < 0) {
    throw new Error("--seed must be a non-negative whole number");
  }
  return options;
}

function loadLessonModel() {
  const html = fs.readFileSync(LESSON_PATH, "utf8");
  const start = html.indexOf("const Lesson5PackageWeightModel = (() => {");
  const end = html.indexOf("\n\n    const screens", start);
  if (start === -1 || end === -1) {
    throw new Error("Lesson5PackageWeightModel block not found");
  }
  const source = `${html.slice(start, end)}\nLesson5PackageWeightModel;`;
  const context = vm.createContext({ console });
  return vm.runInContext(source, context, { filename: LESSON_PATH });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function addCount(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function toObject(map) {
  return Object.fromEntries([...map.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function validateChoiceSet(step, problem, index) {
  assert(step.choices.includes(step.correct), `problem ${index} step ${step.id} lacks correct choice`);
  assert(new Set(step.choices).size === step.choices.length, `problem ${index} step ${step.id} has duplicate choices`);
  assert(step.choices.length >= 3, `problem ${index} step ${step.id} needs at least 3 choices`);
  if (problem.representativeMistake) {
    const hasMistake = step.choices.includes(problem.representativeMistake);
    const isFitStep = problem.type === "limit" && step.id === "limitFit";
    const isFinalMathStep = (problem.type === "addCarry" && step.id === "addFinal") || (problem.type === "subtractBorrow" && step.id === "subtractFinal");
    if (isFitStep || isFinalMathStep) {
      assert(hasMistake, `problem ${index} step ${step.id} lacks representative mistake ${problem.representativeMistake}`);
    }
  }
}

function validateProblem(problem, index, model) {
  assert(problem.steps.length === 2, `problem ${index} must have exactly two steps`);
  assert(problem.expression.includes(problem.finalText), `problem ${index} expression does not show final value`);
  for (const step of problem.steps) {
    validateChoiceSet(step, problem, index);
    assert(model.validateChoice(step, step.correct), `problem ${index} rejects correct choice for ${step.id}`);
    const wrong = step.choices.find((choice) => choice !== step.correct);
    assert(wrong && !model.validateChoice(step, wrong), `problem ${index} accepts wrong choice for ${step.id}`);
  }

  if (problem.type === "addCarry") {
    assert(problem.gramSum >= 1000, `problem ${index} addCarry must carry g >= 1000`);
    const expected = model.fromTotalGrams(model.toTotalGrams(problem.left) + model.toTotalGrams(problem.right));
    assert(problem.final.kg === expected.kg && problem.final.g === expected.g, `problem ${index} add final mismatch`);
    assert(problem.steps[0].correct === model.formatGrams(problem.gramSum), `problem ${index} add g step mismatch`);
    assert(problem.steps[1].correct === model.formatWeight(problem.final), `problem ${index} add final step mismatch`);
    return;
  }

  if (problem.type === "subtractBorrow") {
    assert(problem.top.g < problem.bottom.g, `problem ${index} subtractBorrow must need borrowing`);
    assert(problem.borrowedTop.kg === problem.top.kg - 1, `problem ${index} borrowed kg mismatch`);
    assert(problem.borrowedTop.g === problem.top.g + 1000, `problem ${index} borrowed g mismatch`);
    const expected = model.fromTotalGrams(model.toTotalGrams(problem.top) - model.toTotalGrams(problem.bottom));
    assert(problem.final.kg === expected.kg && problem.final.g === expected.g, `problem ${index} subtract final mismatch`);
    assert(problem.steps[0].correct === model.formatWeight(problem.borrowedTop), `problem ${index} borrow step mismatch`);
    assert(problem.steps[1].correct === model.formatWeight(problem.final), `problem ${index} subtract final step mismatch`);
    return;
  }

  if (problem.type === "limit") {
    const total = model.toTotalGrams(problem.final);
    const limit = model.toTotalGrams(problem.limit);
    assert(problem.fitsLimit === (total <= limit), `problem ${index} limit comparison mismatch`);
    assert(problem.steps[1].correct === (problem.fitsLimit ? "실을 수 있어요" : "무거워요"), `problem ${index} limit label mismatch`);
    return;
  }

  throw new Error(`problem ${index} unknown type ${problem.type}`);
}

function validateRun(run, model, runIndex, typeCounts, coverageCounts) {
  assert(run.length === model.TOTAL_PROBLEMS, `run ${runIndex} must have ${model.TOTAL_PROBLEMS} problems`);
  const perRunCounts = new Map();
  for (const [index, problem] of run.entries()) {
    validateProblem(problem, `${runIndex}.${index + 1}`, model);
    addCount(typeCounts, problem.type);
    addCount(perRunCounts, problem.type);
    if (problem.type === "addCarry") addCount(coverageCounts, "carry_g_ge_1000");
    if (problem.type === "subtractBorrow") addCount(coverageCounts, "borrow_1kg_1000g");
    if (problem.type === "limit" && problem.fitsLimit) addCount(coverageCounts, "limit_fits");
    if (problem.type === "limit" && !problem.fitsLimit) addCount(coverageCounts, "limit_too_heavy");
  }
  assert(perRunCounts.get("addCarry") === 4, `run ${runIndex} must have four addCarry problems`);
  assert(perRunCounts.get("subtractBorrow") === 3, `run ${runIndex} must have three subtractBorrow problems`);
  assert(perRunCounts.get("limit") === 3, `run ${runIndex} must have three limit problems`);
}

function runMalformedProbe(model) {
  const fixture = model.generateRun(424242).find((problem) => problem.type === "addCarry");
  assert(fixture, "malformed probe needs addCarry fixture");
  const mutated = structuredClone(fixture);
  mutated.gramSum -= 1000;
  validateProblem(mutated, "malformed", model);
}

function validateUpgradeFamilies(model) {
  const families = new Set(model.UPGRADE_EVENTS.map((event) => event.family));
  families.add(model.WRONG_UPGRADE_EVENT.family);
  for (const family of ["smallUpgrade", "bigUpgrade", "styleUpgrade", "smallOnly", "superUpgrade", "repair"]) {
    assert(families.has(family), `missing upgrade family ${family}`);
  }
  const repaired = model.applyUpgrade(
    { truckPower: 50, correctFirstTry: 5, superPartSeen: false },
    { ...model.WRONG_UPGRADE_EVENT, amount: 2 },
    false
  );
  assert(repaired.truckPower === 52, "repair event must still add a small truck upgrade");
  assert(repaired.correctFirstTry === 5, "repair event must not add first-try credit");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const model = loadLessonModel();
  if (options.injectBadCarry) {
    runMalformedProbe(model);
    throw new Error("Malformed carry probe unexpectedly passed");
  }

  validateUpgradeFamilies(model);

  const typeCounts = new Map();
  const coverageCounts = new Map();
  const sample = [];
  for (let run = 0; run < options.runs; run += 1) {
    const seed = (options.seed + Math.imul(run + 1, 2654435761)) >>> 0;
    const generated = model.generateRun(seed);
    validateRun(generated, model, run + 1, typeCounts, coverageCounts);
    if (sample.length < 3) {
      sample.push({
        seed,
        firstPrompt: generated[0].prompt,
        firstExpression: generated[0].expression,
        types: generated.map((problem) => problem.type)
      });
    }
  }

  for (const key of ["carry_g_ge_1000", "borrow_1kg_1000g", "limit_fits", "limit_too_heavy"]) {
    assert((coverageCounts.get(key) || 0) > 0, `coverage missing ${key}`);
  }

  console.log("LESSON5_PACKAGE_WEIGHT_MODEL_QA: PASS");
  console.log(JSON.stringify({
    runs: options.runs,
    problemsChecked: options.runs * model.TOTAL_PROBLEMS,
    typeCounts: toObject(typeCounts),
    coverageCounts: toObject(coverageCounts),
    upgradeFamilies: [...new Set([...model.UPGRADE_EVENTS.map((event) => event.family), model.WRONG_UPGRADE_EVENT.family])].sort(),
    samples: sample
  }, null, 2));
}

main();
