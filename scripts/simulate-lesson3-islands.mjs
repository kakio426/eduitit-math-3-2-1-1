#!/usr/bin/env node

const TOTAL_QUESTIONS = 10;
const MAX_DISTANCE = 100;
const BASE_FIRST_TRY_DISTANCE = 5;
const DEFAULT_SEED = 12345;
const DEFAULT_RUNS = 50000;
const PROFILE_FIRST_TRY_COUNTS = [0, 4, 6, 8, 10];

const ISLANDS = [
  { id: "start", name: "출발섬", minDistance: 0, minCorrect: 0 },
  { id: "sand", name: "모래섬", minDistance: 1, minCorrect: 0 },
  { id: "forest", name: "숲섬", minDistance: 34, minCorrect: 5 },
  { id: "cloud", name: "구름섬", minDistance: 60, minCorrect: 8 },
  { id: "starlight", name: "별빛섬", minDistance: 86, minCorrect: 9 },
  { id: "rainbow", name: "무지개섬", minDistance: 96, minCorrect: 10, requiresRainbow: true }
];

const REWARD_EVENTS = [
  { id: "tailwind", label: "살랑 바람", weight: 6400, min: 2, max: 5 },
  { id: "headwind", label: "앞바람", weight: 1700, min: -8, max: -4 },
  { id: "pause", label: "잠깐 멈춤", weight: 1284, min: 0, max: 0 },
  { id: "gust", label: "쌩쌩 바람", weight: 598, min: 8, max: 13 },
  { id: "rainbow", label: "무지개 길", weight: 18, min: 14, max: 14, rainbow: true }
];

const MISTAKE_EVENT = {
  id: "shaky",
  label: "길이 흔들렸어요",
  min: -14,
  max: -8
};

function usage() {
  return [
    "Usage: node scripts/simulate-lesson3-islands.mjs [--seed <number>] [--runs <number>] [--expect-rainbow-min <percent>]",
    "",
    "Options:",
    "  --seed <number>                 Deterministic seed. Default: 12345",
    "  --runs <number>                 Runs per first-try profile. Default: 50000",
    "  --expect-rainbow-min <percent>  Extra assertion for the 10/10 rainbow island rate."
  ].join("\n");
}

function parseNumber(value, name, { integer = false, min = -Infinity, max = Infinity } = {}) {
  if (value === undefined) {
    throw new Error(`${name} requires a value.`);
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (integer && !Number.isInteger(parsed)) || parsed < min || parsed > max) {
    const range = Number.isFinite(min) || Number.isFinite(max) ? ` (${min}..${max})` : "";
    throw new Error(`${name} must be a ${integer ? "whole " : ""}number${range}.`);
  }
  return parsed;
}

function parseArgs(argv) {
  const options = {
    seed: DEFAULT_SEED,
    runs: DEFAULT_RUNS,
    expectRainbowMin: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    }
    if (arg === "--seed") {
      options.seed = parseNumber(argv[++index], "--seed", { integer: true, min: 0, max: 0xffffffff });
      continue;
    }
    if (arg === "--runs") {
      options.runs = parseNumber(argv[++index], "--runs", { integer: true, min: 1, max: 1000000 });
      continue;
    }
    if (arg === "--expect-rainbow-min") {
      options.expectRainbowMin = parseNumber(argv[++index], "--expect-rainbow-min", { min: 0, max: 100 });
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function createRng(seed) {
  let value = seed >>> 0;
  return function rng() {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deriveProfileSeed(seed, firstTryCount) {
  return (seed + Math.imul(firstTryCount + 1, 1000003)) >>> 0;
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pickRewardEvent(rng) {
  let roll = Math.floor(rng() * 10000);
  for (const event of REWARD_EVENTS) {
    if (roll < event.weight) {
      const amount = randomInt(rng, event.min, event.max);
      return { ...event, amount };
    }
    roll -= event.weight;
  }
  const fallback = REWARD_EVENTS[REWARD_EVENTS.length - 1];
  return { ...fallback, amount: fallback.max };
}

function pickMistakeEvent(rng) {
  return {
    ...MISTAKE_EVENT,
    amount: randomInt(rng, MISTAKE_EVENT.min, MISTAKE_EVENT.max)
  };
}

function getReachedIsland(distance, correct, hasRainbowPath) {
  for (let index = ISLANDS.length - 1; index >= 0; index -= 1) {
    const island = ISLANDS[index];
    if (island.requiresRainbow && !hasRainbowPath) {
      continue;
    }
    if (distance >= island.minDistance && correct >= island.minCorrect) {
      return island;
    }
  }
  return ISLANDS[0];
}

function simulateRound(rng, firstTryCount) {
  let distance = 0;
  let correct = 0;
  let hasRainbowPath = false;
  const events = [];

  for (let index = 0; index < TOTAL_QUESTIONS; index += 1) {
    if (index < firstTryCount) {
      correct += 1;
      const event = pickRewardEvent(rng);
      distance = clamp(distance + BASE_FIRST_TRY_DISTANCE + event.amount, 0, MAX_DISTANCE);
      hasRainbowPath ||= Boolean(event.rainbow);
      events.push(event.id);
      continue;
    }
    const event = pickMistakeEvent(rng);
    distance = clamp(distance + event.amount, 0, MAX_DISTANCE);
    events.push(event.id);
  }

  const island = getReachedIsland(distance, correct, hasRainbowPath);
  return { distance, correct, hasRainbowPath, island, events };
}

function createEmptyCounts() {
  const counts = Object.fromEntries(ISLANDS.map((island) => [island.name, 0]));
  return {
    counts,
    totalDistance: 0,
    minDistance: Number.POSITIVE_INFINITY,
    maxDistance: Number.NEGATIVE_INFINITY,
    rainbowPathCount: 0
  };
}

function simulateProfile(seed, runs, firstTryCount) {
  const rng = createRng(deriveProfileSeed(seed, firstTryCount));
  const summary = createEmptyCounts();

  for (let run = 0; run < runs; run += 1) {
    const result = simulateRound(rng, firstTryCount);
    summary.counts[result.island.name] += 1;
    summary.totalDistance += result.distance;
    summary.minDistance = Math.min(summary.minDistance, result.distance);
    summary.maxDistance = Math.max(summary.maxDistance, result.distance);
    if (result.hasRainbowPath) {
      summary.rainbowPathCount += 1;
    }
  }

  return {
    firstTryCount,
    runs,
    counts: summary.counts,
    averageDistance: summary.totalDistance / runs,
    minDistance: summary.minDistance,
    maxDistance: summary.maxDistance,
    rainbowPathPercent: (summary.rainbowPathCount / runs) * 100
  };
}

function percent(profile, islandName) {
  return ((profile.counts[islandName] || 0) / profile.runs) * 100;
}

function atLeast(profile, islandName) {
  const startIndex = ISLANDS.findIndex((island) => island.name === islandName);
  return ISLANDS.slice(startIndex).reduce((sum, island) => sum + percent(profile, island.name), 0);
}

function formatPercent(value) {
  return `${value.toFixed(3)}%`;
}

function formatRow(profile) {
  const cells = [
    `${profile.firstTryCount}/10`,
    profile.averageDistance.toFixed(2),
    `${profile.minDistance}-${profile.maxDistance}`,
    ...ISLANDS.map((island) => `${profile.counts[island.name]} (${formatPercent(percent(profile, island.name))})`),
    formatPercent(profile.rainbowPathPercent)
  ];
  return cells.join(" | ");
}

function printTable(profiles) {
  console.log("Profile | Avg distance | Distance range | 출발섬 | 모래섬 | 숲섬 | 구름섬 | 별빛섬 | 무지개섬 | Rare flag");
  console.log("--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:");
  for (const profile of profiles) {
    console.log(formatRow(profile));
  }
}

function addCheck(checks, name, passed, detail) {
  checks.push({ name, passed, detail });
}

function evaluateTargets(profiles, options) {
  const byFirstTry = new Map(profiles.map((profile) => [profile.firstTryCount, profile]));
  const checks = [];
  const ten = byFirstTry.get(10);
  const eight = byFirstTry.get(8);
  const six = byFirstTry.get(6);
  const zero = byFirstTry.get(0);

  const tenCloudOrHigher = atLeast(ten, "구름섬");
  const eightCloudOrHigher = atLeast(eight, "구름섬");
  const tenStarlightOrHigher = atLeast(ten, "별빛섬");
  const tenRainbow = percent(ten, "무지개섬");

  addCheck(
    checks,
    "10/10 구름섬 이상은 보장되지 않음",
    tenCloudOrHigher < 98,
    `구름섬 이상 ${formatPercent(tenCloudOrHigher)}`
  );
  addCheck(
    checks,
    "10/10 별빛섬 이상은 드묾",
    tenStarlightOrHigher > 0 && tenStarlightOrHigher <= 15,
    `별빛섬 이상 ${formatPercent(tenStarlightOrHigher)}`
  );
  addCheck(
    checks,
    "10/10 무지개섬 0.2%-1.5%",
    tenRainbow >= 0.2 && tenRainbow <= 1.5,
    `무지개섬 ${formatPercent(tenRainbow)}`
  );
  addCheck(
    checks,
    "8/10 무지개섬 0%",
    percent(eight, "무지개섬") === 0,
    `무지개섬 ${formatPercent(percent(eight, "무지개섬"))}`
  );
  addCheck(
    checks,
    "8/10 별빛섬 2% 이하",
    percent(eight, "별빛섬") <= 2,
    `별빛섬 ${formatPercent(percent(eight, "별빛섬"))}`
  );
  addCheck(
    checks,
    "8/10 구름섬 이상은 10/10보다 크게 낮음",
    eightCloudOrHigher <= tenCloudOrHigher - 25,
    `8/10 ${formatPercent(eightCloudOrHigher)} vs 10/10 ${formatPercent(tenCloudOrHigher)}`
  );
  addCheck(
    checks,
    "6/10 높은 섬은 막힘",
    atLeast(six, "구름섬") === 0,
    `구름섬 이상 ${formatPercent(atLeast(six, "구름섬"))}`
  );
  addCheck(
    checks,
    "6/10 모래섬은 reachable",
    percent(six, "모래섬") > 0,
    `모래섬 ${formatPercent(percent(six, "모래섬"))}`
  );
  addCheck(
    checks,
    "0/10도 빈손/실패가 아니라 도착한 곳으로 끝남",
    percent(zero, "출발섬") + percent(zero, "모래섬") === 100,
    `출발섬+모래섬 ${formatPercent(percent(zero, "출발섬") + percent(zero, "모래섬"))}`
  );

  if (options.expectRainbowMin !== null) {
    addCheck(
      checks,
      `RED fixture: 10/10 무지개섬 ${options.expectRainbowMin}% 이상`,
      tenRainbow >= options.expectRainbowMin,
      `무지개섬 ${formatPercent(tenRainbow)} < 기대 ${options.expectRainbowMin.toFixed(3)}%`
    );
  }

  return checks;
}

function printChecks(checks) {
  console.log("");
  console.log("Target band checks:");
  for (const check of checks) {
    console.log(`${check.passed ? "PASS" : "FAIL"} | ${check.name} | ${check.detail}`);
  }
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    console.error(usage());
    process.exit(2);
  }

  const totalWeight = REWARD_EVENTS.reduce((sum, event) => sum + event.weight, 0);
  if (totalWeight !== 10000) {
    console.error(`ERROR: reward weights must total 10000 basis points, got ${totalWeight}.`);
    process.exit(2);
  }

  console.log(`Seed: ${options.seed}`);
  console.log(`Runs per profile: ${options.runs}`);
  console.log("Reward weights: tailwind 64.00%, headwind 17.00%, pause 12.84%, gust 5.98%, rainbow 0.18%");
  console.log("Base first-try distance: +5 before wind; mistake/reveal: hidden -8..-14 with label \"길이 흔들렸어요\".");
  console.log("");

  const profiles = PROFILE_FIRST_TRY_COUNTS.map((firstTryCount) => (
    simulateProfile(options.seed, options.runs, firstTryCount)
  ));
  printTable(profiles);

  const checks = evaluateTargets(profiles, options);
  printChecks(checks);

  const failures = checks.filter((check) => !check.passed);
  if (failures.length > 0) {
    console.error("");
    console.error(`Simulation FAILED: ${failures.length} target check(s) failed.`);
    process.exit(1);
  }

  console.log("");
  console.log("Simulation PASS: all target bands passed.");
}

main();
