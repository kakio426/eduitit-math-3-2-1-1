import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const LESSON_PATH = path.join(ROOT, "3-2-1-3-mathmon-jump-islands", "index.html");

function loadLessonModel() {
  const html = fs.readFileSync(LESSON_PATH, "utf8");
  const start = html.indexOf("const Lesson3MathModel = (() => {");
  const end = html.indexOf("\n\n    if (location.protocol", start);
  if (start === -1 || end === -1) {
    throw new Error("Lesson3MathModel block not found in lesson HTML");
  }
  const source = `${html.slice(start, end)}\nLesson3MathModel;`;
  const context = vm.createContext({ console });
  return vm.runInContext(source, context, { filename: LESSON_PATH });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map());
}

function validateProblem(problem, index, model) {
  assert(problem.steps.length === 2, `problem ${index} must have exactly two steps`);
  const [smallStep, footingStep] = problem.steps;
  assert(smallStep.id === "smallProduct", `problem ${index} first step must be smallProduct`);
  assert(footingStep.id === "scaleFooting", `problem ${index} second step must be scaleFooting`);
  assert(smallStep.correct === problem.smallProduct, `problem ${index} small step answer mismatch`);
  assert(footingStep.correct === problem.scaleLabel, `problem ${index} footing label mismatch`);
  assert(footingStep.label === problem.scaleLabel, `problem ${index} footing step lacks correct label`);
  assert(problem.transformText.includes(`${problem.smallExpression} = ${problem.smallProduct}`), `problem ${index} transform lacks small product`);
  assert(problem.transformText.includes(`${problem.smallProduct} → ${problem.finalAnswer.toLocaleString("ko-KR")}`), `problem ${index} transform lacks final answer`);
  assert(model.validateFooting(problem, problem.scaleLabel), `problem ${index} correct footing rejected`);

  if (problem.type === "hundredfold") {
    assert(problem.leftFactor % 10 === 0 && problem.rightFactor % 10 === 0, `problem ${index} is not A0 x B0`);
    assert(problem.scaleLabel === "0 두 개 붙이기", `problem ${index} must use 0 두 개 붙이기`);
    assert(problem.finalAnswer === problem.leftSmall * problem.rightSmall * 100, `problem ${index} final answer formula failed`);
  } else if (problem.type === "tenfold") {
    assert(problem.rightFactor % 10 === 0 && problem.leftFactor % 10 !== 0, `problem ${index} is not AB x C0`);
    assert(problem.scaleLabel === "0 한 개 붙이기", `problem ${index} must use 0 한 개 붙이기`);
    assert(problem.finalAnswer === problem.leftSmall * problem.rightSmall * 10, `problem ${index} final answer formula failed`);
  } else {
    throw new Error(`problem ${index} has unknown type ${problem.type}`);
  }
}

function validateRun(run, model) {
  assert(run.length === 10, "run must have exactly 10 problems");
  const typeCounts = countBy(run, "type");
  assert(typeCounts.get("hundredfold") === 5, "run must have five 100배 problems");
  assert(typeCounts.get("tenfold") === 5, "run must have five 10배 problems");
  assert(new Set(run.map((problem) => problem.finalAnswer)).size === 10, "run must not duplicate final answers");
  assert(Math.max(...countBy(run.filter((problem) => problem.type === "tenfold"), "rightSmall").values()) <= 2, "10배 run repeats one-digit factor too often");
  assert(run.filter((problem) => problem.finalAnswer === 400 || problem.smallProduct <= 9).length <= 1, "run is dominated by trivial examples");
  run.forEach((problem, index) => validateProblem(problem, index, model));
}

function runNegativeFixture(model) {
  const fixture = model.generateCandidateBank().tenfold.find((problem) => problem.question === "25 × 70");
  assert(fixture, "negative fixture 25 x 70 not found");
  const accepted = model.validateFooting(fixture, "0 두 개 붙이기");
  assert(!accepted, "negative fixture should reject 0 두 개 붙이기 for 25 x 70");
  const shaky = model.applyMistakeBranch(fixture);
  assert(shaky.mistakeTouched, "mistake fixture should be marked touched");
  assert(model.getRewardBranch(shaky) === "shaky", "mistake fixture should route to shaky branch");
  return {
    question: fixture.question,
    expectedFooting: fixture.scaleLabel,
    triedFooting: "0 두 개 붙이기",
    accepted,
    rewardBranchAfterMistake: model.getRewardBranch(shaky)
  };
}

function main() {
  const model = loadLessonModel();
  const negative = runNegativeFixture(model);
  if (process.argv.includes("--negative-fixture")) {
    console.log("NEGATIVE_FIXTURE: PASS");
    console.log(JSON.stringify(negative, null, 2));
    return;
  }

  const seeds = [12345, 20260628, 314159];
  const summaries = [];
  for (const seed of seeds) {
    const run = model.generateRun(seed);
    validateRun(run, model);
    summaries.push({
      seed,
      split: Object.fromEntries(countBy(run, (problem) => problem.scaleLabel)),
      finalAnswers: run.map((problem) => problem.finalAnswer),
      sampleTransform: run[0].transformText,
      rewardBranchAfterMistake: model.getRewardBranch(model.applyMistakeBranch(run[0]))
    });
  }

  console.log("LESSON3_MATH_MODEL_QA: PASS");
  console.log(JSON.stringify({ seeds: summaries, negativeFixture: negative }, null, 2));
}

main();
