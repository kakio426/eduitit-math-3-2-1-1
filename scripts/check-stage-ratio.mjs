#!/usr/bin/env node
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] || process.cwd());
const LESSON_DIR = /^(\d-\d-\d-\d-[a-z0-9-]+|eduitit_math_\d-\d-\d-\d)$/;
const STAGE_WIDTH = "1280px";
const STAGE_RATIO = "16 / 10";
const STAGE_WIDTH_RULE = "width: min(1280px, calc((100dvh - 48px) * 1.6), 100%);";
const SOUND_SIZE_RULE = "--sound-button-size:";
const SOUND_GAP_RULE = "--sound-gap:";
const SOUND_RESERVE_RULE = "--sound-reserve: calc(var(--sound-button-size) + var(--sound-gap));";
const TOP_CONTROL_PAD_RULE = "--top-control-pad-x:";
const TOP_CONTROL_ICON_GAP_RULE = "--top-control-icon-gap:";

async function findLessons(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const lessons = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !LESSON_DIR.test(entry.name)) continue;
    lessons.push(path.join(dir, entry.name));
  }
  return lessons.sort();
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
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

function getStandaloneBlock(text, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(^|\\n)\\s*${escapedSelector}\\s*\\{`).exec(text);
  if (!match) return "";
  const start = match.index + match[1].length;
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
  const screenBlock = getStandaloneBlock(html, ".screen");
  const gameBlock = getStandaloneBlock(html, ".game");
  const stageShellBlock = getStandaloneBlock(html, ".stage-shell");
  const topRowBlock = getStandaloneBlock(html, ".top-row");
  const badgeBlock = getBlock(html, ".brand-badge,");
  const brandImageBlock = getBlock(html, ".brand-badge img");
  const playBlock = getStandaloneBlock(html, ".play");
  const hudBlock = getStandaloneBlock(html, ".hud");
  const soundBlock = getStandaloneBlock(html, ".sound-toggle");
  const hasStageMeta = /<main\s+class="game"[^>]*data-stage-ratio="16:10"[^>]*data-stage-size="1280x800"/.test(html);
  const hasTopBadges = html.includes('class="brand-badge"') && html.includes(".top-row");
  const hasHudUnitBadge = /<header\s+class="hud"[\s\S]*class="unit-badge"/.test(html);
  const titleArtMatch = html.match(/<img(?=[^>]*class="hero-title-art")(?=[^>]*alt="")(?=[^>]*aria-hidden="true")[^>]*src="(title-(?:poster|logo)-generated\.webp)"[^>]*>/);
  const hasTitleArt = html.includes('class="hero-title-art"') || html.includes("title-poster-generated.webp") || html.includes("title-logo-generated.webp");
  const hasHiddenCoverTitle = /<h1(?=[^>]*class="visually-hidden")(?=[^>]*id="coverTitle")[^>]*>/.test(html);
  const hasTitleArtImage = Boolean(titleArtMatch);
  const hasCoverBackground = /<img(?=[^>]*class="raster-bg")(?=[^>]*src="cover-generated\.webp")[^>]*>/.test(html);
  const titleArtFile = titleArtMatch?.[1] || "";
  const titleArtBase = titleArtFile.replace(/-generated\.webp$/, "");
  const hasTitleArtWebp = !hasTitleArt || (titleArtFile && await fileExists(path.join(lesson, titleArtFile)));
  const hasTitleArtPng = !hasTitleArt || (titleArtBase && await fileExists(path.join(lesson, `${titleArtBase}-generated.png`)));
  const hasTitleSource = !hasTitleArt || (titleArtBase && (
    await fileExists(path.join(lesson, `${titleArtBase}-source.png`)) ||
    await fileExists(path.join(lesson, `${titleArtBase}-chromakey.png`))
  ));
  const stageWidthRuleCount = (html.match(new RegExp(STAGE_WIDTH_RULE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  const checks = [
    [hasStageMeta, "main.game에 data-stage-ratio=\"16:10\" data-stage-size=\"1280x800\"가 필요합니다."],
    [gameBlock.includes("--stage-padding: clamp(10px, 2vw, 24px);"), ".game은 공통 --stage-padding 값을 가져야 합니다."],
    [gameBlock.includes("padding: var(--stage-padding);"), ".game padding은 var(--stage-padding)을 써야 합니다."],
    [!html.includes("--stage-padding: var(--stage-padding)"), "--stage-padding 재귀 선언이 남아 있습니다."],
    [/<div\s+class="stage-shell"[\s>]/.test(html), "Stage 안쪽 UI를 감싸는 .stage-shell 래퍼가 필요합니다."],
    [stageShellBlock.includes("position: relative;"), ".stage-shell은 내부 전역 버튼 기준이 되도록 position: relative; 여야 합니다."],
    [stageShellBlock.includes(STAGE_WIDTH_RULE), `.stage-shell은 ${STAGE_WIDTH} 기준 contain 폭 규칙을 써야 합니다.`],
    [stageShellBlock.includes(`aspect-ratio: ${STAGE_RATIO};`), `.stage-shell은 aspect-ratio: ${STAGE_RATIO}; 여야 합니다.`],
    [stageShellBlock.includes(SOUND_SIZE_RULE), ".stage-shell에는 전역 소리 버튼 고정 크기 변수 --sound-button-size가 필요합니다."],
    [stageShellBlock.includes(SOUND_GAP_RULE), ".stage-shell에는 배지와 소리 버튼 사이 고정 간격 변수 --sound-gap이 필요합니다."],
    [stageShellBlock.includes(SOUND_RESERVE_RULE), ".stage-shell에는 top-row/hud가 공유하는 --sound-reserve 계산식이 필요합니다."],
    [!hasTopBadges || stageShellBlock.includes(TOP_CONTROL_PAD_RULE), ".stage-shell에는 상단 배지 좌우 패딩 변수 --top-control-pad-x가 필요합니다."],
    [!hasTopBadges || stageShellBlock.includes(TOP_CONTROL_ICON_GAP_RULE), ".stage-shell에는 상단 아이콘+텍스트 gap 변수 --top-control-icon-gap이 필요합니다."],
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
    [soundBlock.includes("width: var(--sound-button-size);"), "소리 버튼 width는 --sound-button-size를 써서 모든 화면에서 같아야 합니다."],
    [soundBlock.includes("height: var(--sound-button-size);"), "소리 버튼 height는 --sound-button-size를 써서 모든 화면에서 같아야 합니다."],
    [soundBlock.includes("font-size: 0;"), "소리 버튼은 보이는 텍스트 pill이 아니라 SVG 아이콘 버튼이어야 합니다."],
    [html.includes(".sound-toggle svg"), "소리 버튼 SVG 아이콘을 중앙 배치하는 규칙이 필요합니다."],
    [html.includes(".sound-off-stroke"), "소리 꺼짐 상태도 같은 SVG 안에서 표시해야 합니다."],
    [!/<button\s+class="sound-toggle"[^>]*>\s*소리\s*<\/button>/.test(html), "소리 버튼 안에 보이는 '소리' 텍스트를 직접 넣지 마세요. aria-label과 SVG 아이콘을 사용하세요."],
    [html.includes(".stage-shell .top-row"), "상단 배지가 소리 버튼과 겹치지 않도록 .top-row 보정 규칙이 필요합니다."],
    [html.includes(".stage-shell .hud"), "문제 화면 HUD가 소리 버튼과 겹치지 않도록 .hud 보정 규칙이 필요합니다."],
    [html.includes("right: calc(var(--stage-inset) + var(--sound-reserve));"), "상단 배지는 소리 버튼 고정 슬롯인 --sound-reserve만큼 우측을 비워야 합니다."],
    [html.includes("padding-right: var(--sound-reserve);"), "문제 화면 HUD는 소리 버튼 고정 슬롯인 --sound-reserve만큼 우측을 비워야 합니다."],
    [!hasTopBadges || topRowBlock.includes("top: var(--stage-inset);"), ".top-row는 Stage 상단 기준선 top: var(--stage-inset);을 써야 합니다."],
    [!hasTopBadges || topRowBlock.includes("height: var(--sound-button-size);"), ".top-row 높이는 소리 버튼 높이와 같아야 합니다."],
    [!hasTopBadges || topRowBlock.includes("gap: var(--sound-gap);"), ".top-row gap은 --sound-gap을 써야 화면마다 간격이 흔들리지 않습니다."],
    [!hasTopBadges || !topRowBlock.includes("inset:"), ".top-row에 inset 축약을 쓰면 상단 컨트롤 중심선 관리가 흐려집니다. top/left/right를 명시하세요."],
    [!hasTopBadges || badgeBlock.includes("flex: 0 0 auto;"), "브랜드/단원 배지는 flex로 늘어나면 안 됩니다."],
    [!hasTopBadges || badgeBlock.includes("width: fit-content;"), "브랜드/단원 배지는 내용 크기에 맞는 width: fit-content;를 써야 합니다."],
    [!hasTopBadges || badgeBlock.includes("max-width: max-content;"), "브랜드/단원 배지는 불필요한 오른쪽 빈 공간이 생기지 않게 max-width: max-content;를 써야 합니다."],
    [!hasTopBadges || badgeBlock.includes("min-height: var(--sound-button-size);"), "브랜드/단원 배지 높이는 소리 버튼 높이와 같아야 중심선이 맞습니다."],
    [!hasTopBadges || badgeBlock.includes("padding: 0 var(--top-control-pad-x);"), "브랜드/단원 배지 좌우 패딩은 --top-control-pad-x로 작게 고정해야 합니다."],
    [!hasTopBadges || badgeBlock.includes("gap: var(--top-control-icon-gap);"), "아이콘+텍스트 배지 gap은 --top-control-icon-gap을 써야 합니다."],
    [!hasTopBadges || badgeBlock.includes("white-space: nowrap;"), "상단 배지는 줄바꿈으로 높이가 흔들리면 안 됩니다."],
    [!hasTopBadges || brandImageBlock.includes("margin-right: 0;"), "브랜드 배지 아이콘 간격은 margin-right가 아니라 공통 gap으로 관리합니다."],
    [!hasHudUnitBadge || playBlock.includes("padding: var(--stage-inset);"), "문제 화면 play padding은 소리 버튼 기준선과 맞게 var(--stage-inset)을 써야 합니다."],
    [!hasHudUnitBadge || hudBlock.includes("align-items: start;"), "HUD 가운데 pill이 커도 오른쪽 배지가 소리 버튼보다 내려가지 않게 align-items: start;를 써야 합니다."],
    [!hasHudUnitBadge || hudBlock.includes("min-height: var(--sound-button-size);"), "HUD 최소 높이는 소리 버튼 높이와 같아야 합니다."],
    [!soundBlock.includes("position: fixed;"), "소리 버튼에 position: fixed;를 쓰면 Stage 밖으로 떠 보입니다."],
    [!soundBlock.includes("bottom:"), "소리 버튼은 선택지/결과 버튼을 가리지 않도록 하단 고정을 쓰지 않습니다."],
    [!soundBlock.includes("transform:"), "소리 버튼 위치를 transform으로 화면별 보정하면 화면마다 위치가 달라집니다. top/right와 고정 슬롯만 쓰세요."],
    [!html.includes(".stage-shell[data-active-screen=\"play\"] .sound-toggle"), "소리 버튼은 화면별(active-screen별) 위치 보정을 만들지 않습니다."],
    [!html.includes('content: "♪";'), "소리 버튼을 음표 문자 pseudo-element로 만들지 않습니다. SVG 스피커 아이콘을 쓰세요."],
    [!html.includes(">소리 켬<") && !html.includes(">소리 끔<") && !html.includes(">BGM 켜짐<") && !html.includes(">BGM 꺼짐<"), "소리 버튼의 긴 상태 문구는 화면에 직접 노출하지 않습니다. 보이는 글자는 짧게 두고 aria-label로 상태를 전달하세요."],
    [!hasTitleArt || hasHiddenCoverTitle, "첫 화면 제목을 그림으로 쓰는 경우 실제 제목은 <h1 class=\"visually-hidden\" id=\"coverTitle\">로 남겨야 합니다."],
    [!hasTitleArt || hasTitleArtImage, "첫 화면 제목 그림은 <img class=\"hero-title-art\" src=\"title-*-generated.webp\" alt=\"\" aria-hidden=\"true\"> 패턴으로 얹어야 합니다."],
    [!hasTitleArt || hasCoverBackground, "제목 그림을 만들 때 전체 커버를 갈아엎지 말고 기존 cover-generated.webp 배경을 유지해야 합니다."],
    [!hasTitleArt || hasTitleArtWebp, "title-*-generated.webp 제목 오버레이 배포 자산이 차시 폴더에 있어야 합니다."],
    [!hasTitleArt || hasTitleArtPng, "title-*-generated.png 투명 PNG 원본이 차시 폴더에 있어야 합니다."],
    [!hasTitleArt || hasTitleSource, "title-*-source.png 또는 title-*-chromakey.png 생성 원본을 함께 보관해야 합니다. CSS/SVG/로컬 폰트로 만든 가짜 제목 이미지는 통과시키지 않습니다."],
    [!html.includes("cover-title-generated"), "제목 참고 이미지를 전체 커버 배경(cover-title-generated)으로 바꾸지 마세요. 제목만 독립 오버레이로 생성하세요."],
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
