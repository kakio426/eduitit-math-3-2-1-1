#!/usr/bin/env node
// SIZE_OK: Single-file CLI harness for cross-lesson Stage/RasterStage contracts; one command reports all package blockers without a build step.
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

async function readFullSceneQaScripts() {
  try { const scriptDir = path.join(root, "scripts"); const files = (await readdir(scriptDir)).filter((name) => /^qa-.*result-fullscene\.mjs$/.test(name)); return (await Promise.all(files.map((file) => readFile(path.join(scriptDir, file), "utf8")))).join("\n"); } catch { return ""; }
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

function getCssPxValue(block, property) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${escapedProperty}:\\s*(\\d+)px;`).exec(block);
  return match ? Number(match[1]) : null;
}

const lessons = await findLessons(root);
const failures = [], fullSceneQaScripts = await readFullSceneQaScripts();
const hasFullSceneScorePixelCenterQa = fullSceneQaScripts.includes("measureScoreCenter") && fullSceneQaScripts.includes("score is not horizontally centered") && fullSceneQaScripts.includes("score is not vertically centered");
const hasFullSceneForbiddenScoreLabelQa = fullSceneQaScripts.includes("measureForbiddenScoreLabel") && fullSceneQaScripts.includes("forbidden score label pixels remain above the score box");

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
  const rasterBgBlock = getStandaloneBlock(html, ".raster-bg");
  const coverStartButtonBlock = getBlock(html, ".cover #startButton");
  const coverStartGeneratedButtonBlock = getStandaloneBlock(html, ".cover-start-button");
  const resultCountOverlayBlock = getStandaloneBlock(html, ".result-count-overlay");
  const resultRestartHitboxBlock = getStandaloneBlock(html, ".result-restart-hitbox");
  const hasStageMeta = /<main\s+class="game"[^>]*data-stage-ratio="16:10"[^>]*data-stage-size="1280x800"/.test(html);
  const hasStandardCover = /<main\s+class="game"[^>]*data-cover-standard="generated-title-overlay"/.test(html);
  const hasGeneratedCoverStartStandard = /<main\s+class="game"[^>]*data-cover-start-standard="generated-button-art"/.test(html);
  const hasLegacyCover = /<main\s+class="game"[^>]*data-cover-standard="legacy-raster-poster"/.test(html);
  const hasGeneratedResultStandard = /<main\s+class="game"[^>]*data-result-visual-standard="generated-assets"/.test(html);
  const hasFullSceneScoreSlot = /<main\s+class="game"[^>]*data-result-render-mode="fullscene-score-slot"/.test(html);
  const hasResultFinalGeneratedAsset = /result-final-[a-z0-9-]+-generated\.webp/.test(html);
  const hasFullSceneResultSignal = hasResultFinalGeneratedAsset || hasFullSceneScoreSlot;
  const hasSeparateGeneratedResultAssets = hasGeneratedResultStandard && !hasFullSceneScoreSlot;
  const hasLegacyCoverArt = html.includes('class="cover-art"') || html.includes("cover-start-hitbox");
  const hasTopBadges = html.includes('class="brand-badge"') && html.includes(".top-row");
  const hasHudUnitBadge = /<header\s+class="hud"[\s\S]*class="unit-badge"/.test(html);
  const titleArtMatch = html.match(/<img(?=[^>]*class="hero-title-art")(?=[^>]*alt="")(?=[^>]*aria-hidden="true")[^>]*src="(title-(?:poster|logo)-generated\.webp)"[^>]*>/);
  const hasTitleArt = html.includes('class="hero-title-art"') || html.includes("title-poster-generated.webp") || html.includes("title-logo-generated.webp");
  const hasHiddenCoverTitle = /<h1(?=[^>]*class="visually-hidden")(?=[^>]*id="coverTitle")[^>]*>/.test(html);
  const hasTitleArtImage = Boolean(titleArtMatch);
  const hasCoverBackground = /<img(?=[^>]*class="raster-bg")(?=[^>]*src="cover-generated\.webp")[^>]*>/.test(html);
  const hasCoverScene = /<div\s+class="cover-scene"[\s>]/.test(html);
  const hasHeroCopy = /<div\s+class="hero-copy"[\s>]/.test(html);
  const hasVisibleCoverStart = /<button(?=[^>]*class="[^"]*primary-button[^"]*")(?=[^>]*id="startButton")[^>]*>\s*시작\s*<\/button>/.test(html);
  const hasGeneratedCoverStart = /<button(?=[^>]*class="[^"]*\bcover-start-button\b[^"]*")(?=[^>]*id="startButton")(?=[^>]*aria-label="시작")[^>]*>\s*<img(?=[^>]*class="[^"]*\bstart-button-art\b[^"]*")(?=[^>]*src="start-button-generated\.webp")(?=[^>]*alt="")(?=[^>]*aria-hidden="true")[^>]*>\s*<\/button>/.test(html);
  const hasCoverStartSize = coverStartButtonBlock.includes("min-width: 190px;")
    && coverStartButtonBlock.includes("min-height: 72px;")
    && coverStartButtonBlock.includes("padding: 0 44px;");
  const generatedCoverStartWidth = getCssPxValue(coverStartGeneratedButtonBlock, "width");
  const generatedCoverStartHeight = getCssPxValue(coverStartGeneratedButtonBlock, "height");
  const hasGeneratedCoverStartSize = generatedCoverStartWidth !== null
    && generatedCoverStartHeight !== null
    && generatedCoverStartWidth >= 400
    && generatedCoverStartWidth <= 460
    && generatedCoverStartHeight >= 140
    && generatedCoverStartHeight <= 170;
  const hasForbiddenFullSceneResultClass = /\b(result-card|result-stats|result-stat|result-copy)\b/.test(html);
  const hasGeneratedResultTitleArt = /<img(?=[^>]*class="[^"]*\bresult-title-art\b[^"]*")(?=[^>]*src="[^"]*result-title-[^"]*generated\.webp")(?=[^>]*alt="")(?=[^>]*aria-hidden="true")[^>]*>/.test(html);
  const hasGeneratedResultRetryArt = /<img(?=[^>]*class="[^"]*\bresult-retry-art\b[^"]*")(?=[^>]*src="[^"]*result-[^"]*generated\.webp")(?=[^>]*alt="")(?=[^>]*aria-hidden="true")[^>]*>/.test(html);
  const hasHiddenResultTitle = !/\bid="resultTitle"/.test(html)
    || /<h[1-6](?=[^>]*\bid="resultTitle")(?=[^>]*\bclass="[^"]*\bvisually-hidden\b)[^>]*>/.test(html);
  const hasHiddenPraiseText = !/\bid="praiseText"/.test(html)
    || /<p(?=[^>]*\bid="praiseText")(?=[^>]*\bclass="[^"]*\bvisually-hidden\b)[^>]*>/.test(html);
  const finalIslandTextMatch = html.match(/<[^>]+id="finalIslandText"[^>]*>/);
  const hasHiddenFinalIslandText = !finalIslandTextMatch || /\bclass="[^"]*\bvisually-hidden\b/.test(finalIslandTextMatch[0]);
  const hasHiddenResultSummary = !/\bid="resultSummary"/.test(html)
    || /<p(?=[^>]*\bid="resultSummary")(?=[^>]*\bclass="[^"]*\bvisually-hidden\b)[^>]*>/.test(html);
  const hasHiddenResultNext = !/\bid="resultNext"/.test(html)
    || /<p(?=[^>]*\bid="resultNext")(?=[^>]*\bclass="[^"]*\bvisually-hidden\b)[^>]*>/.test(html);
  const hasAccessibleResultRetryHitbox = /<button(?=[^>]*\bid="retryButton")(?=[^>]*\baria-label="다시")[^>]*>/.test(html);
  const hasFullSceneResultRasterImage = /<img(?=[^>]*\bid="resultRaster")(?=[^>]*\bclass="[^"]*\braster-bg\b)(?=[^>]*\bsrc="result-final-[^"]*generated\.webp(?:\?v=[^"]+)?")(?=[^>]*\balt="")[^>]*>/.test(html);
  const hasFullSceneScoreOverlay = /<div(?=[^>]*\bid="resultCountOverlay")(?=[^>]*\bclass="[^"]*\bresult-count-overlay\b)[^>]*>\s*<strong(?=[^>]*\bid="finalCorrectText")[^>]*>/.test(html);
  const hasFullSceneRestartHitbox = /<button(?=[^>]*\bid="restartButton")(?=[^>]*\bclass="[^"]*\bresult-restart-hitbox\b)(?=[^>]*\baria-label="다시하기")[^>]*>/.test(html);
  const hasTransparentFullSceneRestartHitbox = resultRestartHitboxBlock.includes("border: 0;")
    && resultRestartHitboxBlock.includes("background: transparent;")
    && resultRestartHitboxBlock.includes("color: transparent;");
  const hasFullSceneScoreSlotPosition = resultCountOverlayBlock.includes("left: var(--result-score-left")
    && resultCountOverlayBlock.includes("top: var(--result-score-top")
    && resultCountOverlayBlock.includes("width: var(--result-score-width")
    && resultCountOverlayBlock.includes("height: var(--result-score-height")
    && /data-result-island="start"/.test(html)
    && /\[data-result-island="rainbow"\]/.test(html);
  const hasShipmentRepeatCopy = html.includes("출하!")
    && (html.includes("출하 보기") || html.includes("출하보기"));
  const titleArtFile = titleArtMatch?.[1] || "";
  const titleArtBase = titleArtFile.replace(/-generated\.webp$/, "");
  const hasTitleArtWebp = !hasTitleArt || (titleArtFile && await fileExists(path.join(lesson, titleArtFile)));
  const hasTitleArtPng = !hasTitleArt || (titleArtBase && await fileExists(path.join(lesson, `${titleArtBase}-generated.png`)));
  const hasTitleSource = !hasTitleArt || (titleArtBase && (
    await fileExists(path.join(lesson, `${titleArtBase}-source.png`)) ||
    await fileExists(path.join(lesson, `${titleArtBase}-chromakey.png`))
  ));
  const hasGeneratedCoverStartAssets = !hasGeneratedCoverStartStandard || (
    await fileExists(path.join(lesson, "start-button-source.png")) &&
    await fileExists(path.join(lesson, "start-button-generated.png")) &&
    await fileExists(path.join(lesson, "start-button-generated.webp"))
  );
  const stageWidthRuleCount = (html.match(new RegExp(STAGE_WIDTH_RULE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  const checks = [
    [hasStageMeta, "main.game에 data-stage-ratio=\"16:10\" data-stage-size=\"1280x800\"가 필요합니다."],
    [!hasLegacyCoverArt || hasLegacyCover, "cover-art/cover-start-hitbox 방식은 data-cover-standard=\"legacy-raster-poster\"가 붙은 기존 차시에서만 허용됩니다."],
    [!hasStandardCover || !hasLegacyCoverArt, "generated-title-overlay 표준 차시는 cover-art/투명 hitbox를 쓰지 않습니다."],
    [!hasStandardCover || hasCoverBackground, "generated-title-overlay 표준 차시는 첫 화면 배경을 <img class=\"raster-bg\" src=\"cover-generated.webp\">로 둬야 합니다."],
    [!hasStandardCover || rasterBgBlock.includes("object-fit: cover;"), "generated-title-overlay 표준 차시의 .raster-bg는 object-fit: cover;를 써야 합니다."],
    [!hasStandardCover || hasCoverScene, "generated-title-overlay 표준 차시는 커버 오버레이를 .cover-scene 안에 배치해야 합니다."],
    [!hasStandardCover || hasHeroCopy, "generated-title-overlay 표준 차시는 제목·목표·시작 버튼을 .hero-copy 안에 둬야 합니다."],
    [!hasStandardCover || hasTitleArt, "generated-title-overlay 표준 차시의 첫 화면 제목은 .hero-title-art 독립 이미지여야 합니다."],
    [!hasTitleArt || hasStandardCover, ".hero-title-art를 쓰는 차시는 main.game에 data-cover-standard=\"generated-title-overlay\"를 선언해야 합니다."],
    [!hasStandardCover || hasVisibleCoverStart || hasGeneratedCoverStart, "generated-title-overlay 표준 차시의 시작 버튼은 투명 hitbox가 아니라 보이는 시작 버튼이어야 합니다."],
    [!hasStandardCover || hasVisibleCoverStart || hasGeneratedCoverStartStandard, "생성형 시작 버튼 아트를 쓰는 차시는 main.game에 data-cover-start-standard=\"generated-button-art\"를 선언해야 합니다."],
    [!hasGeneratedCoverStartStandard || hasGeneratedCoverStart, "data-cover-start-standard=\"generated-button-art\" 차시는 <button class=\"cover-start-button\" id=\"startButton\" aria-label=\"시작\"><img class=\"start-button-art\" src=\"start-button-generated.webp\" alt=\"\" aria-hidden=\"true\"></button> 구조여야 합니다."],
    [!hasGeneratedCoverStartStandard || hasGeneratedCoverStartAssets, "data-cover-start-standard=\"generated-button-art\" 차시는 start-button-source.png, start-button-generated.png, start-button-generated.webp 자산을 함께 보관해야 합니다."],
    [!hasGeneratedCoverStartStandard || hasGeneratedCoverStartSize, "data-cover-start-standard=\"generated-button-art\" 차시의 시작 버튼은 1280×800 Stage 기준 width 400-460px, height 140-170px 범위여야 합니다."],
    [!hasStandardCover || hasGeneratedCoverStart || hasCoverStartSize, "generated-title-overlay 표준 차시의 CSS 시작 버튼은 공통 크기(min-width 190px, min-height 72px, padding 0 44px)를 써야 합니다."],
    [!hasFullSceneResultSignal || hasGeneratedResultStandard, "result-final-*-generated.webp 또는 fullscene-score-slot 결과 차시는 main.game에 data-result-visual-standard=\"generated-assets\"를 선언해야 합니다."],
    [!hasSeparateGeneratedResultAssets || hasGeneratedResultTitleArt, "별도 생성형 결과 자산 방식은 보이는 결과 라벨을 <img class=\"result-title-art\" src=\"result-title-*-generated.webp\" alt=\"\" aria-hidden=\"true\">로 둬야 합니다."],
    [!hasSeparateGeneratedResultAssets || hasGeneratedResultRetryArt, "별도 생성형 결과 자산 방식은 보이는 다시 버튼 장식을 <img class=\"result-retry-art\" ...> 생성형 자산으로 둬야 합니다."],
    [!hasSeparateGeneratedResultAssets || hasAccessibleResultRetryHitbox, "별도 생성형 결과 자산 방식은 생성형 다시 버튼 위에 <button id=\"retryButton\" aria-label=\"다시\"> 접근성 hitbox를 둬야 합니다."],
    [!hasGeneratedResultStandard || !hasForbiddenFullSceneResultClass, "data-result-visual-standard=\"generated-assets\" 차시는 .result-card/.result-stats/.result-stat/.result-copy 같은 CSS 결과 카드를 쓰지 않습니다."],
    [!hasGeneratedResultStandard || hasHiddenResultTitle, "data-result-visual-standard=\"generated-assets\" 차시의 #resultTitle은 보이는 CSS 제목이 아니라 visually-hidden 접근성 텍스트여야 합니다."],
    [!hasFullSceneScoreSlot || hasHiddenPraiseText, "fullscene-score-slot 결과의 #praiseText는 보이는 CSS 본문이 아니라 visually-hidden 접근성 텍스트여야 합니다."],
    [!hasFullSceneScoreSlot || hasHiddenFinalIslandText, "fullscene-score-slot 결과의 #finalIslandText는 보이는 텍스트가 아니라 visually-hidden 접근성 텍스트여야 합니다."],
    [!hasGeneratedResultStandard || hasHiddenResultSummary, "data-result-visual-standard=\"generated-assets\" 차시의 #resultSummary는 보이는 CSS 본문이 아니라 visually-hidden 접근성 텍스트여야 합니다."],
    [!hasGeneratedResultStandard || hasHiddenResultNext, "data-result-visual-standard=\"generated-assets\" 차시의 #resultNext는 보이는 CSS 본문이 아니라 visually-hidden 접근성 텍스트여야 합니다."],
    [!hasFullSceneScoreSlot || hasFullSceneResultRasterImage, "fullscene-score-slot 결과는 <img class=\"raster-bg\" id=\"resultRaster\" src=\"result-final-*-generated.webp\" alt=\"\"> 전체 장면을 써야 합니다."],
    [!hasFullSceneScoreSlot || hasFullSceneScoreOverlay, "fullscene-score-slot 결과의 보이는 HTML은 <div id=\"resultCountOverlay\"><strong id=\"finalCorrectText\">...</strong></div> 점수 숫자만 허용합니다."],
    [!hasFullSceneScoreSlot || hasFullSceneScoreSlotPosition, "fullscene-score-slot 점수 오버레이는 이미지별 data-result-island RasterStage 슬롯 변수(left/top/width/height)를 써야 합니다."],
    [!hasFullSceneScoreSlot || hasFullSceneScorePixelCenterQa, "fullscene-score-slot 결과는 스크린샷 픽셀에서 점수 숫자 중심과 이미지 속 빈 점수칸 중심을 비교하는 QA 하네스를 가져야 합니다."],
    [!hasFullSceneScoreSlot || hasFullSceneForbiddenScoreLabelQa, "fullscene-score-slot 결과는 스크린샷 픽셀에서 점수칸 위 '맞힌 문제' 같은 금지 라벨 잔상을 잡는 QA 하네스를 가져야 합니다."],
    [!hasFullSceneScoreSlot || hasFullSceneRestartHitbox, "fullscene-score-slot 결과는 이미지 속 다시하기 버튼 위에 <button class=\"result-restart-hitbox\" id=\"restartButton\" aria-label=\"다시하기\"> 투명 hitbox를 둬야 합니다."],
    [!hasFullSceneScoreSlot || hasTransparentFullSceneRestartHitbox, "fullscene-score-slot 다시하기 hitbox는 border 0, transparent background/color여야 하며 새 시각 버튼을 그리면 안 됩니다."],
    [!hasFullSceneScoreSlot || !html.includes("맞힌 문제"), "fullscene-score-slot 결과에는 보이는/숨김 HTML 어느 쪽에도 '맞힌 문제' 라벨을 남기지 않습니다. 점수는 '정답 6/10'처럼 보조 라벨만 씁니다."],
    [!hasLegacyCover || hasLegacyCoverArt, "legacy-raster-poster 표식은 cover-art/cover-start-hitbox를 쓰는 이전 커버에만 붙입니다."],
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
    [!hasShipmentRepeatCopy, "보상/피드백 모달에서 같은 말을 반복하지 마세요. 예: 출하! + 출하 보기"],
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
