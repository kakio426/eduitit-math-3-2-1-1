#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] || process.cwd());
const LESSON_DIR = /^(\d-\d-\d-\d-[a-z0-9-]+|eduitit_math_\d-\d-\d-\d)$/;
const STAGE_WIDTH = "1280px";
const STAGE_RATIO = "16 / 10";
const STAGE_WIDTH_RULE = "width: min(1280px, calc((100dvh - 48px) * 1.6), 100%);";

async function findLessons(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const lessons = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !LESSON_DIR.test(entry.name)) continue;
    lessons.push(path.join(dir, entry.name));
  }
  return lessons.sort();
}

function getBlock(text, selector) {
  const start = text.indexOf(selector);
  if (start === -1) return "";
  const open = text.indexOf("{", start);
  if (open === -1) return "";
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1;
    if (text[i] === "}") depth -= 1;
    if (depth === 0) return text.slice(start, i + 1);
  }
  return "";
}

const lessons = await findLessons(root);
const failures = [];

for (const lesson of lessons) {
  const indexPath = path.join(lesson, "index.html");
  let html;
  try {
    html = await readFile(indexPath, "utf8");
  } catch {
    continue;
  }

  const label = path.relative(root, lesson);
  const screenBlock = getBlock(html, ".screen");
  const gameBlock = getBlock(html, ".game");
  const stageShellBlock = getBlock(html, ".stage-shell");
  const soundBlock = getBlock(html, "\n    .sound-toggle {");
  const hasStageMeta = /<main\s+class="game"[^>]*data-stage-ratio="16:10"[^>]*data-stage-size="1280x800"/.test(html);
  const stageWidthRuleCount = (html.match(new RegExp(STAGE_WIDTH_RULE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  const checks = [
    [hasStageMeta, "main.game에 data-stage-ratio=\"16:10\" data-stage-size=\"1280x800\"가 필요합니다."],
    [gameBlock.includes("--stage-padding: clamp(10px, 2vw, 24px);"), ".game은 공통 --stage-padding 값을 가져야 합니다."],
    [gameBlock.includes("padding: var(--stage-padding);"), ".game padding은 var(--stage-padding)을 써야 합니다."],
    [!html.includes("--stage-padding: var(--stage-padding)"), "--stage-padding 재귀 선언이 남아 있습니다."],
    [html.includes('<div class="stage-shell">'), "Stage 안쪽 UI를 감싸는 .stage-shell 래퍼가 필요합니다."],
    [stageShellBlock.includes("position: relative;"), ".stage-shell은 내부 전역 버튼 기준이 되도록 position: relative; 여야 합니다."],
    [stageShellBlock.includes(STAGE_WIDTH_RULE), `.stage-shell은 ${STAGE_WIDTH} 기준 contain 폭 규칙을 써야 합니다.`],
    [stageShellBlock.includes(`aspect-ratio: ${STAGE_RATIO};`), `.stage-shell은 aspect-ratio: ${STAGE_RATIO}; 여야 합니다.`],
    [stageWidthRuleCount === 1, "Stage contain 폭 규칙은 .stage-shell에만 1번 있어야 합니다. .screen이나 media override에 남기지 마세요."],
    [screenBlock.includes("position: absolute;"), ".screen은 .stage-shell 안에서 position: absolute; 여야 합니다."],
    [screenBlock.includes("inset: 0;"), ".screen은 .stage-shell을 꽉 채우도록 inset: 0; 여야 합니다."],
    [screenBlock.includes("width: 100%;"), ".screen은 width: 100%; 여야 합니다."],
    [screenBlock.includes("height: 100%;"), ".screen은 height: 100%; 여야 합니다."],
    [screenBlock.includes("min-height: auto;"), ".screen은 min-height: auto; 여야 합니다."],
    [screenBlock.includes(`aspect-ratio: ${STAGE_RATIO};`), `.screen은 aspect-ratio: ${STAGE_RATIO}; 여야 합니다.`],
    [!screenBlock.includes("min-height: min("), ".screen 기본 블록에 min-height:min(...)을 쓰면 Stage 비율이 흔들립니다."],
    [!html.includes("aspect-ratio: 1586 / 992;"), "이전 1차시 임시 비율(1586/992)이 남아 있습니다."],
    [soundBlock.includes("position: absolute;"), "소리 버튼은 viewport fixed가 아니라 .stage-shell 내부 absolute여야 합니다."],
    [soundBlock.includes("top: var(--stage-inset);"), "소리 버튼은 Stage 상단 보조 슬롯에 맞춰야 합니다."],
    [soundBlock.includes("right: var(--stage-inset);"), "소리 버튼은 Stage 우측 보조 슬롯에 맞춰야 합니다."],
    [html.includes(".stage-shell .top-row"), "상단 배지가 소리 버튼과 겹치지 않도록 .top-row 보정 규칙이 필요합니다."],
    [html.includes(".stage-shell .hud"), "문제 화면 HUD가 소리 버튼과 겹치지 않도록 .hud 보정 규칙이 필요합니다."],
    [!soundBlock.includes("position: fixed;"), "소리 버튼에 position: fixed;를 쓰면 Stage 밖으로 떠 보입니다."],
    [!soundBlock.includes("bottom:"), "소리 버튼은 선택지/결과 버튼을 가리지 않도록 하단 고정을 쓰지 않습니다."],
    [!html.includes(">소리 켬<") && !html.includes(">소리 끔<") && !html.includes(">BGM 켜짐<") && !html.includes(">BGM 꺼짐<"), "소리 버튼의 긴 상태 문구는 화면에 직접 노출하지 않습니다. 보이는 글자는 짧게 두고 aria-label로 상태를 전달하세요."],
  ];

  for (const [ok, message] of checks) {
    if (!ok) failures.push(`${label}: ${message}`);
  }
}

if (failures.length) {
  console.error("Stage ratio contract failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Stage ratio contract OK (${lessons.length} lesson packages, 16:10 / 1280x800).`);
