#!/usr/bin/env node
import { access, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const lessonDirPattern = /^(\d-\d-\d-\d-[a-z0-9-]+|eduitit_math_\d-\d-\d-\d)$/;

const requiredDocs = [
  "AGENTS.md",
  "CLAUDE.md",
  "LESSON_COMMONS.md",
  "SERIES_CONTRACT.md",
  "README.md",
  "_templates/lesson-package/README.md",
  ".claude/skills/eduitit-mathmon-lesson/SKILL.md",
  ".claude/skills/eduitit-mathmon-lesson/references/engine-and-images.md",
  ".claude/skills/eduitit-mathmon-lesson/references/verification.md",
  ".claude/skills/eduitit-mathmon-lesson/references/lesson-prompts.md",
  "_shared/mathmon/UNIT3_IMAGE_GUIDE.md",
  "_shared/mathmon/UNIT4_IMAGE_GUIDE.md",
];

const optionalDocs = [
  "DESIGN.md",
];

const stalePatterns = [
  {
    pattern: /primary-button.*(?:190×72|190x72|190px|72px)/,
    message: "stale primary-button size guidance remains",
  },
  {
    pattern: /190×72|190x72/,
    message: "stale 190x72 start-button guidance remains",
  },
  {
    pattern: /매스몬 0 공장/,
    message: "stale old lesson name remains",
  },
  {
    pattern: /생성 래스터에는 동행 캐릭터를 굽지 말고/,
    message: "stale generated-raster Mathmon omission guidance remains",
  },
  {
    pattern: /매스몬은 오버레이로 올려/,
    message: "stale Mathmon overlay guidance remains",
  },
];

function parseArgs(argv) {
  const args = {
    extraDocs: [],
    classificationPath: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--extra-doc") {
      i += 1;
      if (!argv[i]) throw new Error("--extra-doc requires a path");
      args.extraDocs.push(argv[i]);
    } else if (arg === "--write-lesson-classification") {
      i += 1;
      if (!argv[i]) throw new Error("--write-lesson-classification requires a path");
      args.classificationPath = argv[i];
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  return args;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function lineNumberFor(text, index) {
  return text.slice(0, index).split("\n").length;
}

async function checkMatchingRootDocs(failures) {
  const agents = await readText("AGENTS.md");
  const claude = await readText("CLAUDE.md");
  if (agents !== claude) {
    failures.push("AGENTS.md and CLAUDE.md differ");
  }
}

async function checkStaleText(files, failures) {
  for (const file of files) {
    if (!(await fileExists(path.join(root, file)))) {
      failures.push(`${file}: required governance document is missing`);
      continue;
    }

    const text = await readText(file);
    for (const { pattern, message } of stalePatterns) {
      const match = pattern.exec(text);
      if (match?.index !== undefined) {
        failures.push(`${file}:${lineNumberFor(text, match.index)}: ${message}`);
      }
    }
  }
}

async function findLessons() {
  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && lessonDirPattern.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function classifyLesson(folder, html) {
  const hasGeneratedCover = /<main\s+class="game"[^>]*data-cover-standard="generated-title-overlay"/.test(html);
  const hasLegacyCover = /<main\s+class="game"[^>]*data-cover-standard="legacy-raster-poster"/.test(html);
  const hasGeneratedStart = /<main\s+class="game"[^>]*data-cover-start-standard="generated-button-art"/.test(html);
  const hasCoverStartButton = /<button(?=[^>]*class="[^"]*\bcover-start-button\b[^"]*")(?=[^>]*id="startButton")/.test(html);
  const hasPrimaryStart = /<button(?=[^>]*class="[^"]*\bprimary-button\b[^"]*")(?=[^>]*id="startButton")/.test(html);
  const hasStartHitbox = html.includes("cover-start-hitbox");
  const hasGeneratedResult = /<main\s+class="game"[^>]*data-result-visual-standard="generated-assets"/.test(html);
  const hasFullScene = /<main\s+class="game"[^>]*data-result-render-mode="fullscene-score-slot"/.test(html);

  const coverStandard = hasLegacyCover
    ? "legacy-raster-poster"
    : hasGeneratedCover
      ? "generated-title-overlay"
      : "none";
  const startStyle = hasGeneratedStart || hasCoverStartButton
    ? "generated-button-art"
    : hasStartHitbox
      ? "legacy-hitbox"
      : hasPrimaryStart
        ? "compatibility-primary-button"
        : "none";
  const resultStandard = hasGeneratedResult ? "generated-assets" : "css-or-legacy";
  const fullsceneMode = hasFullScene ? "fullscene-score-slot" : "none";
  const action = resolveAction({
    coverStandard,
    folder,
    fullsceneMode,
    startStyle,
  });

  return {
    action,
    coverStandard,
    folder,
    fullsceneMode,
    resultStandard,
    startStyle,
  };
}

function resolveAction({ coverStandard, folder, fullsceneMode, startStyle }) {
  if (coverStandard === "legacy-raster-poster") return "keep legacy";
  if (fullsceneMode === "fullscene-score-slot") return "already fullscene";
  if (startStyle === "generated-button-art") return "already generated-button";
  if (coverStandard === "generated-title-overlay" && startStyle === "compatibility-primary-button") {
    return "keep compatibility";
  }
  if (folder.includes("3-2-3-") || folder.includes("3-2-4-")) return "needs separate visual migration";
  return "needs separate visual migration";
}

async function collectClassifications() {
  const folders = await findLessons();
  const rows = [];
  for (const folder of folders) {
    const indexPath = path.join(root, folder, "index.html");
    if (!(await fileExists(indexPath))) continue;
    const html = await readFile(indexPath, "utf8");
    rows.push(classifyLesson(folder, html));
  }
  return rows;
}

async function checkGeneratedButtonLessons(rows, failures) {
  for (const row of rows) {
    if (row.startStyle !== "generated-button-art") continue;
    const lesson = path.join(root, row.folder);
    const html = await readFile(path.join(lesson, "index.html"), "utf8");
    const hasButton = /<button(?=[^>]*class="[^"]*\bcover-start-button\b[^"]*")(?=[^>]*id="startButton")(?=[^>]*aria-label="시작")[^>]*>\s*<img(?=[^>]*class="[^"]*\bstart-button-art\b[^"]*")(?=[^>]*src="start-button-generated\.webp")(?=[^>]*alt="")(?=[^>]*aria-hidden="true")[^>]*>\s*<\/button>/.test(html);
    const assets = await Promise.all([
      fileExists(path.join(lesson, "start-button-source.png")),
      fileExists(path.join(lesson, "start-button-generated.png")),
      fileExists(path.join(lesson, "start-button-generated.webp")),
    ]);
    if (!hasButton) failures.push(`${row.folder}: generated-button-art DOM is missing`);
    if (assets.includes(false)) failures.push(`${row.folder}: generated-button-art asset triplet is missing`);
  }
}

function formatClassification(rows) {
  const header = "folder\tcover_standard\tstart_style\tresult_standard\tfullscene_mode\taction";
  const body = rows.map((row) => [
    row.folder,
    row.coverStandard,
    row.startStyle,
    row.resultStandard,
    row.fullsceneMode,
    row.action,
  ].join("\t"));
  return `${[header, ...body].join("\n")}\n`;
}

const args = parseArgs(process.argv.slice(2));
const failures = [];
const existingOptionalDocs = [];
for (const file of optionalDocs) {
  if (await fileExists(path.join(root, file))) existingOptionalDocs.push(file);
}
const docs = [...requiredDocs, ...existingOptionalDocs, ...args.extraDocs];

await checkMatchingRootDocs(failures);
await checkStaleText(docs, failures);
const rows = await collectClassifications();
await checkGeneratedButtonLessons(rows, failures);

if (args.classificationPath) {
  await writeFile(path.join(root, args.classificationPath), formatClassification(rows), "utf8");
}

if (failures.length > 0) {
  console.error("Rule consistency failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Rule consistency OK (${docs.length} docs, ${rows.length} lesson packages).`);
