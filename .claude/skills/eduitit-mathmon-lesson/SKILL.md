---
name: eduitit-mathmon-lesson
description: "Use when building, planning, or extending an Eduitit 매스몬 math game 차시(lesson) single-HTML package in the `ai mart` workspace, including reward/effect animation polish — triggers like 차시 만들어, 새 게임 만들어, N단원 N차시 제작, 게임 빌드, 매스몬 게임 추가, 효과 넣어."
---

# Eduitit 매스몬 차시 빌더

`/Users/yubyeongju/ai mart` 작업실에서 매스몬 수학 게임 한 차시를 **단일 실행 HTML 패키지**로 만들거나 확장할 때 따르는 절차다. 이 스킬은 "어떻게 만드는가(공정)"를 담는다. "왜·무엇을(정체성·철학·로드맵)"은 작업실의 `AGENTS.md`와 `CLAUDE.md`가 같은 내용으로 공유하는 루트 하네스 문서가 단일 기준이다.

## 이 스킬을 쓰는 때

- 새 차시(`3-2-<단원>-<차시>-<영문짧은이름>`) 게임을 만든다.
- 기존 차시의 화면·문제·보상을 크게 바꾼다.
- 기존 차시의 효과, 보상 연출, 결과 측정감을 강화한다.
- 차시 상세 계획(`PLAN.md`)을 세운다.
- 트리거: `차시 만들어`, `새 게임 만들어`, `N단원 N차시 제작`, `게임 빌드`, `매스몬 게임 추가`, `효과 넣어`.

teacher-facing SaaS·관리자 화면에는 적용하지 않는다(그건 `eduitit-service-polish`). 배포/푸시는 `eduitit-main-release`를 함께 쓴다.

## 시작할 때 선언

- 적용 스킬: `eduitit-mathmon-lesson`.
- 대상 차시: 학년-학기-단원-차시, 게임명(매스몬으로 시작), 배움주제, 성취기준.
- 복제 기준 파일(보통 `3-2-1-2-mathmon-rocket-charge/index.html` = 최신 엔진).
- 건드리지 않을 범위(다른 차시·단원, 학생 화면 외 서비스).

## 절대 규칙 (루트 하네스 문서 「핵심 설계 철학」 강제)

매 차시는 아래를 모두 만족해야 한다. 하나라도 "아니오"면 설계를 고친다.

1. **계산 = 행동의 도구**: 문제 → 보상 → 결과. 계산은 예측 가능, 보상은 예측 불가능.
2. **무작위성 유지**: 랜덤 보상은 빼지 않는다(기대감+긴장감 동반).
3. **정답 ≠ 전부**: 최고 등급은 얻기 어렵게. 정답은 유리하되 유일한 통로 아님. 빈손 금지 + 운으로 도약 가능.
4. **"다음엔 더 멀리"**: 차시 자체 완결형 등급 결과로 재도전 동기를 만든다(도감 없음 — 모아두는 백엔드 만들지 않음).
5. 학생 화면에 `AI Mart` 등 내부 용어 노출 금지. 게임 제목은 **매스몬**으로 시작.
6. **문제 화면 과밀 금지**: 초3 학생이 3초 안에 현재 할 일을 말할 수 있어야 한다. 기본 문제 화면은 큰 문제·현재 단계 조작판·한 줄 지시문·선택지만 남긴다.
7. **단계 정답 확인 필수**: 정답 선택 뒤 다음 단계나 보상 모달로 바로 넘기지 않는다. 현재 계산판·칸·블록이 정답값으로 바뀌고, 짧은 확인 문구가 보인 뒤 넘어간다. 마지막 단계는 보상 모달 전에 완성식이나 완성값을 먼저 보여 주고, 가능하면 학생이 확인 버튼을 눌러 보상으로 넘어가게 한다.

## 빌드 파이프라인

1. **계획**: 해당 차시 폴더에 `PLAN.md`를 먼저 쓴다 → `references/plan-template.md`.
2. **폴더**: `_templates/lesson-package`를 `3-2-<단원>-<차시>-<영문짧은이름>`으로 복사.
3. **자산**: `_shared/`에서 `eduitit-logo-mark.png`와 필요한 배포용 자산만 복사. 매스몬은 반드시 `eduitit-mathmon-assets` 스킬과 `_shared/mathmon/MATHMON_ASSET_CONTRACT.md`를 먼저 적용하고, 새 매스몬은 `_shared/mathmon/<pack-id>/`에 원본 등록 후 차시 폴더에는 WebP 배포본만 복사한다(10종 전부 복사 불필요 — 도감 없음).
4. **엔진 복제**: 최신 기준 차시(`3-2-1-2-...`)의 `index.html`을 복제해 개조. 재사용 함수 맵 → `references/engine-and-images.md`.
5. **개조 3종만**: ① 문제 생성기 ② 보상/등급 라벨 ③ 테마 이미지. 점수·콤보·단계선택·등급 뼈대는 그대로.
6. **효과 설계**: 단계 정답, 보상 이동, 중심 오브젝트 변화, 랜덤 이벤트 충격, 결과 측정에 효과를 배치한다 → `references/effect-design.md`.
7. **이미지**: 필요한 RasterStage 이미지를 생성하고 WebP로 배포 변환 → `references/engine-and-images.md`.
8. **Humanizer 학생 문구 QA**: 학생에게 보이는 문구를 모두 뽑아 `humanizer` 스킬(`/Users/yubyeongju/.agents/skills/humanizer/SKILL.md`) 기준으로 AI 문체·번역투·어려운 한자어를 걷어낸다. 초3 학생이 소리 내어 읽어도 바로 이해되는 행동어로 바꾸고, 바뀐 문구가 화면에 맞는지 브라우저 캡처로 확인한다.
9. **문서**: `README.md`, `REPORT.md` 작성, `screenshots/`에 첫·설명·문제·보상·결과 화면 저장.
10. **등록**: `manifest.json`에 차시 추가, 루트 `README.md` 시리즈 표에 행 추가.
11. **화면 계약 대조**: `SERIES_CONTRACT.md`와 한 줄씩 대조(첫 화면 3요소·배지 위치·중심 보상 1개·문제 화면 과밀 금지).
12. **문제 화면 3초 검사**: 문제 화면 스크린샷에서 학생이 볼 기본 요소가 큰 문제·현재 단계·한 줄 지시·선택지뿐인지 확인하고, 설명 패널이 많으면 줄인다.
13. **Stage 비율 검사**: 모든 `index.html`이 `16:10`/`1280×800` 계약을 지키는지 루트에서 `node scripts/check-stage-ratio.mjs` 실행.
14. **검증·배포**: `references/verification.md` 통과 → 배포는 `eduitit-main-release` + GitHub Pages, 공개 URL `curl -I -L` 200 확인.

## 화면 골격 (모든 차시 동일)

```text
첫 화면 → 설명 → 문제 풀이 → 보상 → 결과
```

세부 규칙은 `SERIES_CONTRACT.md`가 단일 기준. 첫 화면 3요소(제목·한 줄 목표·시작 버튼), 브랜드/단원/배움주제 배지 위치, 중심 보상 1개, 결과=차시 자체 완결형 등급은 고정.

## 설명 화면 이해 계약

설명 화면은 예쁜 포스터가 아니라 학생이 게임을 시작하기 전 꼭 알아야 할 약속이다. 새 차시를 만들거나 기존 설명 화면을 크게 바꿀 때는 아래 네 가지가 화면 안에서 바로 보여야 한다.

- **풀이 방법**: 이번 차시 문제를 어떻게 풀지 한눈에 보여 준다. 단계는 2~3개로 제한하고, 예시는 실제 차시 문제와 같은 구조를 쓴다.
- **문제 수**: 한 판에 몇 문제를 푸는지 보여 준다. 현재 표준은 `10문제`이며, 다르면 차시 문서와 화면에 같은 숫자로 맞춘다.
- **보상 연결**: 정답을 맞히면 무엇을 얻는지 보여 준다. 정답은 보상 기회를 늘리지만 최고 결과를 보장한다고 말하지 않는다. 랜덤 보상 때문에 좋아질 수도, 조금 아쉬울 수도 있음을 학생 말로 짧게 보여 준다.
- **최종 목표**: 마지막에 무엇을 확인하는지 보여 준다. 예: 상자 점수와 매스몬, 로켓 도착 행성, 도착 섬, 로봇 등급, 전국 순위.

설명 화면은 반드시 두 장으로 간다. 한 장 안에 풀이법과 보상/최종 목표를 모두 넣는 방식은 실패다. 이미지가 예뻐도 학생이 `어떻게 풀지?`와 `왜 풀지?`를 나눠 이해하지 못하면 다시 만든다.

```text
설명 1: 어떻게 풀어요? → 풀이 단계와 예시
설명 2: 무엇을 얻어요? → 10문제, 보상, 최종 결과, 순위
```

설명 이미지 프롬프트를 만들 때도 같은 계약을 따른다. 생성 이미지가 학생에게 보이는 문구를 직접 담는다면 `exact Korean text`와 `no extra text`를 명시하고, 생성 뒤 한글 철자를 캡처로 검수한다. 철자가 틀리거나 문구가 너무 많으면 같은 슬롯에서 재생성한다. HTML/CSS로 새 포스터를 로컬 합성해 때우지 않는다.

설명 화면 아래 행동 버튼은 크기를 고정한다. 1280×800 Stage 기준 보이는 버튼 표면은 가로 `400-460px`, 세로 `110-145px`를 기본으로 하고, 중앙 x좌표 `640`, y좌표 `665-735` 안전영역 안에 둔다. 버튼 라벨은 `문제 시작`, `연료 넣기`, `점프 시작`, `합체 시작`, `다음`처럼 1~4단어로 짧게 쓴다. 실제 클릭은 같은 좌표의 HTML button 또는 hitbox가 맡고, 버튼 표면이 이미지 안에 있으면 HTML은 새 보이는 텍스트를 추가하지 않는다.

설명 화면 문구는 Humanizer 학생 문구 QA 대상이다. `보상 구조`, `최종 목표`, `랭킹 시스템`, `랜덤 이벤트` 같은 제작자 말은 쓰지 말고, `상자 점수`, `연료`, `바람`, `합체 에너지`, `마지막에 순위 보기`처럼 화면 안 물건과 행동으로 말한다.

## 로컬 합성 금지

- 생성형 이미지처럼 보여야 하는 화면·타이틀·보상·결과 자산을 로컬 폰트, Pillow, canvas, SVG, CSS 캡처, 기존 PNG/WebP 겹치기 같은 로컬 합성으로 만들지 않는다.
- 로컬 합성은 사용자가 먼저 명시적으로 허락한 경우에만 예외로 쓴다. 허락 없이 "최종 화면에서는 한 장 이미지처럼 보인다"는 이유로 로컬 합성 산출물을 생성형 이미지 자산처럼 연결하면 실패다.
- 문제 화면 상단에 목표 지도, 진행 지도, 보상 도달 경로처럼 학생의 `다음엔 더 멀리` 기대감을 만드는 큰 시각 장치를 둘 때는 3차시 `play-map-strip-generated.webp` 방식을 기준으로 삼는다. CSS 도형, SVG, 회색 실루엣, 로컬에서 그린 아이콘 반복으로 목표 세계를 때우면 실패다. 배경/섬/로봇/장소/최종 목표 실루엣은 `image_gen`/GPT Image 등 생성형 bitmap 자산으로 만들고, HTML은 현재 위치 마커, 짧은 라벨, 접근성 hitbox처럼 동적으로 바뀌는 최소 오버레이만 맡긴다.
- 상단 목표 지도 자산은 원본 `*-source.png`와 학생용 `*-generated.webp`를 함께 보관한다. 예: 3차시 `play-map-strip-source.png` + `play-map-strip-generated.webp`, 4차시 로봇 목표판 `play-robot-goal-strip-source.png` + `play-robot-goal-strip-generated.webp`. 크롭, 리사이즈, WebP 변환처럼 생성 원본의 의미를 바꾸지 않는 후처리는 허용하지만, 새 캐릭터·목표물·패널·문구를 로컬에서 그려 붙이면 로컬 합성으로 본다.
- 특히 결과 화면처럼 고정 문구·버튼·캐릭터·배경을 한 장으로 보여 달라는 요청은 image_gen/GPT Image 등 생성형 이미지 도구로 한 장면을 생성하는 것이 기본이다. 섬 이름, 도착 라벨, 칭찬 문구, 다시하기 버튼처럼 매 판 똑같은 요소는 생성 이미지 안에 포함하고, 정답 수·점수처럼 매 판 달라지는 값만 HTML/CSS 오버레이로 남긴다.
- 결과 화면에서 생성 이미지 위에 큰 반투명 CSS 카드, `backdrop-filter` blur 패널, CSS 제목/본문, CSS로 그린 큰 버튼을 얹어 결과 라벨을 처리하면 로컬 합성 우회로 보고 실패 처리한다.
- 결과 라벨이 4단계처럼 유한하게 바뀌면 단계별 결과 이미지 또는 독립 생성형 타이틀/버튼 자산을 만들고, JS는 이미지 `src`만 바꾼다. `resultTitle`, `resultSummary`, `resultNext` 같은 HTML 텍스트는 `visually-hidden` 접근성 값이나 실제 정답 수·점수처럼 매 판 계산되는 최소 정보에만 쓴다.
- 사용자가 "이미지에는 글자를 넣지 말라"는 이미지 계획을 줬더라도 고정 결과 라벨·칭찬·버튼을 CSS 카드로 대체하지 않는다. 생성 이미지 안의 글자 금지와 CSS 결과 카드 금지가 충돌하면 구현 전에 계획을 바로잡는다.
- 생성형 결과 라벨/버튼 자산 표준을 쓰는 차시는 `<main class="game">`에 `data-result-visual-standard="generated-assets"`를 선언한다. 이 표식이 있으면 공통 하네스가 `.result-card` 같은 CSS 결과 카드, 보이는 `resultTitle` 텍스트, 생성형 버튼 아트 누락을 실패로 본다.
- 결과 화면을 통째 이미지로 요구받거나 `result-final-*-generated.webp`가 도착 상태별 완성 장면이면 `<main class="game">`에 `data-result-render-mode="fullscene-score-slot"`도 선언한다. 이 모드에서 보이는 HTML은 동적 점수 숫자 1개와 투명 다시하기 hitbox뿐이다.
- `fullscene-score-slot`의 점수 숫자는 이미지 안 빈 점수칸에 맞춘 RasterStage 슬롯으로 배치한다. 생성 이미지마다 빈칸 위치가 다르면 `data-result-island` 같은 상태별 슬롯을 명시한다. 중앙 정렬은 CSS 좌표값만 확인하면 실패다. 1280×800과 1024×768 스크린샷 픽셀에서 숫자 글자 중심과 이미지 속 빈 점수칸 중심을 비교해 확인한다.
- `fullscene-score-slot` 모드에서 `.result-stats`, `.result-stat`, `.result-card`, `.result-copy`, 보이는 CSS 제목/본문/버튼 장식이 있으면 실패다. 점수 박스 라벨도 이미지와 HTML 양쪽에서 보이지 않게 한다.
- 결과 화면의 버튼을 이미지 안에 그린 경우에도 실제 클릭과 접근성을 위한 HTML 버튼 또는 hitbox는 같은 위치에 둔다. 단, 이 hitbox가 새 시각 요소를 로컬에서 그려 붙이는 방식이 되면 로컬 합성으로 본다.
- **혼합형 ResultStage**: 결과 화면에 멋진 보상 장면과 정확한 동적 정보가 함께 필요하면 `data-result-render-mode="hybrid-generated-dynamic"`을 쓴다. 생성 이미지는 로봇·섬·행성·무대·빛·감정 같은 결과 세계를 맡고, SVG `viewBox="0 0 1280 800"` 오버레이는 정답 수, 이번 판 결과명, 짧은 진행값, 버튼 표면처럼 정확한 정렬이 필요한 동적 UI만 맡는다.
- 혼합형 결과 화면의 생성 프롬프트에는 `no text`, `no letters`, `no numbers`, `no score board`, `no stats cards`, `no table`, `no buttons`, `no UI panels`를 기본으로 넣는다. 이미지 안에 남겨도 되는 것은 세계 안의 자연스러운 빛, 받침대, 홀로그램 빔, 빈 에너지 장치처럼 텍스트가 없는 장면 소품뿐이다.
- 혼합형에서 SVG 오버레이는 새로운 CSS 카드가 아니라 정밀 UI 레이어다. 모든 보이는 SVG 텍스트는 1-3개 짧은 값으로 제한하고, 긴 칭찬·고정 결과 라벨·버튼 장식은 생성형 결과 이미지나 독립 생성형 타이틀/버튼 자산으로 처리한다. 동적 값이 4개 이상 필요해지면 결과 화면이 아니라 순위판/대시보드 패턴으로 분리한다.
- 혼합형 QA는 생성 이미지 품질과 SVG 정렬을 따로 본다. 1280×800과 1024×768 캡처에서 보상 장면이 먼저 보이고, SVG `<text>`의 `getBBox()`가 의도한 UI 영역 밖으로 나가지 않으며, 점수·통계 카드가 결과 보상보다 시각적으로 앞서지 않아야 한다.
- 배경 제거, 크롭, WebP 변환, 용량 최적화처럼 생성형 원본의 의미를 바꾸지 않는 후처리는 허용된다. 단, 새 문구·버튼·캐릭터·패널을 로컬에서 그려 붙이는 순간 로컬 합성으로 본다.

## 정밀 동적 UI 화면 계약

전국 순위판, 대시보드, 표, 여러 행 목록처럼 매 판 달라지는 값이 많고 정확한 정렬이 필요한 화면에는 아래 패턴을 쓴다.

- 생성 이미지 안에 박스, 카드, 행, 버튼 껍데기, 빈 텍스트 슬롯을 그려 넣고 그 위에 HTML/SVG 글자를 맞추지 않는다. 이 방식은 폰트 렌더링·브라우저 축소·이미지 여백 차이 때문에 반복해서 깨진다.
- 생성 이미지는 `축하 배경`, `무대`, `불꽃`, `매스몬 장식`, `분위기`만 맡긴다. 프롬프트에는 `no text`, `no letters`, `no numbers`, `no UI panels`, `no leaderboard board`, `no cards`, `no table rows`, `no buttons`, `no empty boxes`, `no signs`, `no labels`를 명시한다.
- 순위판, 내 기록 박스, 행 배경, 스크롤 영역, 버튼 표면, 보이는 글자는 하나의 SVG `viewBox="0 0 1280 800"` 컴포넌트가 그린다. 배경 이미지와 UI를 같은 SVG 좌표계 안에 두어 Stage가 줄어도 함께 줄어들게 한다.
- 실제 클릭은 같은 좌표의 투명 HTML `button` hitbox가 맡는다. 버튼 안에 보이는 HTML 텍스트를 넣지 말고, 접근성용 `aria-label`만 둔다.
- 긴 이름·긴 상태 문구는 렌더러에서 정해진 글자 수로 말줄임한다. 글자를 맞추려고 viewport 폭 기준 글자 크기를 계속 줄이지 않는다.
- 목록은 고정 높이 row 슬롯 안에서 4행처럼 안정적으로 보여 주고, 10위까지 같은 SVG 리스트 안에서 wheel/pointer 스크롤로 확인하게 한다.
- 이 패턴은 동적 UI가 많은 화면을 위한 예외다. 결과 라벨·칭찬·고정 버튼 장식처럼 유한하고 고정된 시각 요소는 여전히 생성형 결과 이미지/타이틀/버튼 자산으로 처리한다.
- QA는 CSS 좌표값만 보지 않는다. 1280×800, 1024×768, 사용자가 올린 문제 크기와 비슷한 브라우저 크기에서 캡처하고, SVG `<text>`의 `getBBox()`가 Stage와 의도한 보드 영역 밖으로 나가지 않는지 확인한다. 보이는 HTML 버튼 텍스트, `foreignObject`, 제작자 용어, 금지 문구도 0건이어야 한다.

## 전국 순위 백엔드 연동 계약

전국 순위판을 차시에 붙일 때는 UI만 만들고 끝내지 않는다. 학생 점수 제출, 주간 순위 조회, 백엔드 검증 규칙, API 꺼짐 상태까지 한 묶음으로 확인한다.

- 1단원 1·2·3·4차시는 전국 순위 프론트가 이미 붙어 있는 기준 차시다. 1·3·4차시는 `_shared/scoreboard/scoreboard-ui.js`의 `MathmonScoreboard.createApiBridge(...)`를 쓰고, 2차시는 같은 `/api/v1` 엔드포인트를 직접 호출하는 이전 방식으로 동작한다.
- 새 차시는 가능하면 직접 API 호출을 새로 쓰지 말고 `MathmonScoreboard.createApiBridge(...)`를 쓴다. 차시 폴더의 `index.html`에는 `_shared/scoreboard/scoreboard-ui.css`, `_shared/scoreboard/scoreboard-ui.js`, 빈 `<section class="screen mathmon-scoreboard" id="scoreboardScreen" ...>`, 결과 화면의 `leaderboardButton`, `scoreboardBridge.start()`, `scoreboardBridge.open()` 흐름이 모두 있어야 한다.
- 브리지에는 `lessonId`, `getScore`, `getAnswers`, `showScoreboard`, `showResult`, `restart`를 차시 실제 상태와 연결한다. `lessonId`는 폴더명과 같게 두고, 답안 로그는 문제 번호, 선택값, 정답값, 정오답, 풀이 시간처럼 백엔드가 검증할 수 있는 값을 담는다.
- 에듀잇티 백엔드는 `/Users/yubyeongju/Documents/eduitit`의 `mathmon_scoreboard` Django 앱이 기준이다. 새 단원 차시를 전국 순위로 공개하기 전에는 해당 차시 `lessonId`가 백엔드 검증 규칙에 들어갔는지 확인한다. 범용 가드레일이 있더라도 공개 차시는 차시별 정답 구조를 아는 검증 규칙을 추가하는 것을 기본으로 한다.
- 백엔드 모델이 바뀌면 `makemigrations`와 Railway migration까지 진행한다. 모델이 바뀌지 않고 검증 규칙만 늘어나는 경우에도 `manage.py check`, `mathmon_scoreboard` 테스트, Railway production `manage.py check`로 운영 설정이 앱을 인식하는지 확인한다.
- API가 꺼져 있거나 네트워크 오류가 나도 차시는 끝까지 플레이되어야 한다. 순위 화면 안에는 자연스러운 안내가 보여야 하고, 결과로 돌아가기·다시하기 hitbox는 계속 동작해야 한다.
- 새 단원 QA는 프론트만 보지 않는다. API 켜짐 success, API 꺼짐/offline, loading, error, empty, 10행 스크롤, 긴 닉네임 말줄임, 버튼 hitbox 클릭까지 확인한다.

첫 화면 커버는 기본적으로 `generated-title-overlay` 표준을 따른다. 새 차시와 생성형 시작 버튼으로 이관한 차시는 `<main class="game" data-cover-standard="generated-title-overlay" data-cover-start-standard="generated-button-art">`를 선언한다. `cover-generated.webp`는 글자 없는 대표 장면 배경으로 `.raster-bg`에 `object-fit: cover`로 깐다. 게임명은 생성형 이미지로 만든 `title-*-generated.webp`를 `.hero-title-art`로 얹고, 한 줄 목표는 짧은 HTML 텍스트로 둔다. 시작 버튼의 보이는 면은 CSS 텍스트 버튼이 아니라 생성형 버튼 자산(`start-button-generated.webp`)으로 둔다. 실제 조작은 `<button class="cover-start-button" id="startButton" aria-label="시작"><img class="start-button-art" src="start-button-generated.webp" alt="" aria-hidden="true"></button>`처럼 같은 크기의 HTML 버튼이 맡는다.

시작 버튼 자산은 `start-button-source.png`, `start-button-generated.png`, `start-button-generated.webp`를 기본 파일명으로 둔다. 기준 물성은 1차시 포스터형 시작 버튼처럼 플레이 아이콘이 들어간 두툼한 노란 래스터 버튼이다. 1280×800 Stage 기준 표시 크기는 너비 `400-460px`, 높이 `140-170px`, 비율 `2.6-3.0:1`을 권장한다. 배치는 제목/목표 묶음의 시선 흐름을 따르며, 보통 목표 아래 `14-24px` 간격, Stage y좌표 `500-580px` 안쪽에 둔다. 1차시의 물성 있는 버튼감과 2·3차시의 제목-목표-버튼 흐름을 기준으로 삼고, 배경 주인공을 가리지 않는 쪽을 우선한다.

`cover-generated.webp` 한 장 안에 제목·목표·시작 버튼을 구워 넣거나, 커버 전체를 누르는 `cover-art`/`cover-start-hitbox` 투명 클릭 영역을 새 차시에 쓰지 않는다. 버튼 크기의 HTML 버튼은 접근성과 클릭을 위해 필요하지만, 보이는 버튼 표면을 CSS 배경/텍스트로 새로 그리면 실패다. 기존 `generated-title-overlay` 차시 중 아직 `.primary-button`으로 시작하는 화면은 개별 이관 전까지 `data-cover-start-standard="compatibility-primary-button"`로 분류하고, 새 차시 복제 기준으로 삼지 않는다. 아직 마이그레이션하지 않은 포스터형 기존 차시는 `data-cover-standard="legacy-raster-poster"`로 예외임을 명시한다.

첫 화면 제목은 단순 큰 HTML 텍스트로 끝내지 않는다. 사용자가 `그림으로`, `GPT Image`, `제목 이미지`를 요구하면 기존 커버 배경은 유지하고, 제목 부분만 독립 래스터 타이틀 아트(`title-logo-generated.webp`, `title-poster-generated.webp` 등)로 생성해 얹는다. 전체 커버를 제목 이미지로 갈아엎거나 HTML/CSS/SVG로 흉내 내지 않는다. 실제 제목은 `visually-hidden` 텍스트로 남긴다. 생성형 이미지 제목은 캡처로 한글 철자와 배경 위 배치 상태를 검수하고, 철자 오류·어색한 자산·생성 실패 중간 결과를 화면에 남기지 않는다.

중요: 첫 화면 제목 자산과 시작 버튼 자산은 반드시 `image_gen`/GPT Image 등 생성형 이미지 도구로 만든 결과여야 한다. 특히 시작 버튼은 독립 버튼 자산으로 생성해야 하며, 1차시 커버나 포스터 버튼을 크롭·복제·합성해 새 차시 버튼으로 쓰면 `generated-button-art`로 인정하지 않는다. 사용자가 명시적으로 승인한 생성형 원본의 배경 제거, 크롭, 리사이즈, WebP 변환처럼 새 시각 의미를 만들지 않는 후처리만 허용한다. 로컬 폰트, Pillow, canvas, SVG, CSS text-shadow를 이용해 글자를 그린 뒤 이미지처럼 저장한 것은 실패다. 프로젝트에는 생성 원본(`title-*-source.png` 또는 `title-*-chromakey.png`, `start-button-source.png`)과 배경 제거 PNG/WebP를 함께 둔다. `node scripts/check-stage-ratio.mjs`가 이 원본 보관 조건을 검사한다.

## 문제 화면 과밀 금지 계약

- 문제 화면은 설명서가 아니라 **현재 한 단계의 수학 행동을 고르는 화면**이다.
- 기본으로 펼쳐 둘 수 있는 학습 요소는 `큰 문제`, `현재 단계 조작판`, `한 줄 지시문`, `선택지`뿐이다.
- 개념 설명판, 풀이 해설판, 힌트판, 계산 미리보기, 보상 상태판을 한 화면에 동시에 펼치지 않는다.
- 단계형 문제는 현재 단계만 크게 보여 주고, 이전 단계는 작은 완료 칩으로 접으며, 다음 단계는 `?` 또는 잠금 상태로 둔다.
- 정답을 고른 뒤에는 클릭한 선택지 색만 바뀌고 끝나면 실패다. 현재 계산판·칸·블록이 정답값으로 바뀌고, `맞았어요` 같은 짧은 확인 문구가 보여야 한다.
- 마지막 단계 뒤에는 보상 모달이 정답 확인을 덮지 않게 한다. 완성식이나 완성값이 학생 눈에 먼저 들어온 뒤, `바람 보기`, `상자 열기`처럼 차시 소재에 맞는 버튼으로 보상에 들어가게 한다.
- 원리는 긴 문장이 아니라 블록·칸·스티커·화살표·자리값 묶음 같은 시각 조작으로 보여 준다.
- 힌트는 기본으로 닫고, 열어도 지금 단계 힌트 1개만 보여 준다.
- 스크린샷을 보고 "문제보다 패널이 많다", "문장이 여러 줄이다", "무엇을 눌러야 할지 바로 안 보인다"면 완성하지 말고 즉시 덜어낸다.

## Humanizer 학생 문구 QA 계약

- 화면 구현 뒤에는 반드시 `humanizer` 스킬을 읽고 적용한다. Codex 세션의 스킬 목록에 보이지 않아도 `/Users/yubyeongju/.agents/skills/humanizer/SKILL.md`와 필요한 `references/` 문서를 직접 읽는다.
- 대상 문구는 첫 화면 목표 문장, 설명 화면 단계, 문제 지시문, 선택지, 힌트, 오답 피드백, 보상 모달, 결과 칭찬, 다운로드 카드 문구, `aria-label` 중 학생에게 읽힐 수 있는 말이다.
- Humanizer의 AI 문체 기준(번역투, 불필요한 한자어, 명사 과다, 3박자 반복, 경직된 문장)을 보되, 최종 판단은 초3 학생이 이해하는가에 둔다.
- 제작자 용어를 화면 말로 바꾼다. 예: `핵심 곱`은 필요하면 `0 뗀 곱`, `생산량`은 테마에 맞춰 `공장 힘`이나 `모은 힘`, `출하 등급`은 `상자가 간 곳`, `0 토큰`은 `0`, `불량 처리`는 `고칠 상자`처럼 보이는 물건과 행동으로 바꾼다.
- 한 문장에는 행동 하나만 담는다. `계산하고 붙여요`처럼 두 행동이 들어가면 단계로 나누거나 더 짧게 쓴다.
- 모달 문구는 Humanizer QA 뒤에도 한 덩어리만 남긴다. 제목·본문·버튼이 같은 뜻을 반복하면 실패다.
- 문구를 바꾼 뒤에는 브라우저 캡처에서 줄바꿈, 버튼 폭, 카드 안 텍스트 넘침을 다시 확인한다.

## 효과 설계 계약

- 효과는 장식이 아니라 **수학 행동이 게임 세계를 바꿨다는 신호**여야 한다.
- 효과를 넣거나 다듬을 때는 `references/effect-design.md`를 읽고, 단계 정답·보상 이동·중심 오브젝트 변화·랜덤 이벤트 충격·결과 측정 중 어디에 붙일지 먼저 정한다.
- 효과가 문제·현재 단계·한 줄 지시·선택지를 가리면 즉시 줄인다.
- 중심 보상은 하나만 유지한다. 효과를 별, 코인, 하트 같은 별도 보상 체계처럼 추가하지 않는다.
- 모든 큰 효과는 `prefers-reduced-motion` 대응과 브라우저 캡처 검증을 거친다.

## 보상/피드백 모달 문구 계약

- 모달은 설명서가 아니라 짧은 결과 신호다. 버튼을 제외한 보이는 텍스트는 큰 결과 라벨 또는 변화량 1개로 줄인다.
- 긴 설명 문장, 제목+본문+버튼의 3중 문구, 같은 뜻의 반복은 기본 노출하지 않는다. 필요한 설명은 숨김 접근성 텍스트나 결과 뒤 화면으로 보낸다.
- 같은 모달 안에서 `출하!`와 `출하 보기`, `결과`와 `결과 보기`처럼 같은 단어를 반복하면 실패다. 버튼은 `다음`, `보기`, `다시`처럼 다음 행동만 말한다.
- 랜덤 이벤트의 차이는 긴 문구가 아니라 이미지, 아이콘, 변화량, 짧은 모션으로 구분한다.

## Stage 비율 계약

- 모든 차시는 `16:10` Stage, 기준 제작 크기 `1280×800`으로 만든다.
- 모든 `index.html`의 `<main class="game">`에는 `data-stage-ratio="16:10"`과 `data-stage-size="1280x800"`을 둔다.
- 기본 Stage CSS는 `.stage-shell`이 `width: min(1280px, calc((100dvh - 48px) * 1.6), 100%);`, `aspect-ratio: 16 / 10;`을 담당하고, `.screen`은 `position: absolute; inset: 0; width: 100%; height: 100%;`로 Stage를 채우게 한다.
- PC와 태블릿 가로에서는 Stage를 contain 방식으로 맞추고, 남는 영역은 바깥 배경 여백으로 처리한다.
- 설정/소리 같은 전역 조작 버튼은 Stage 밖에 fixed로 띄우지 말고 `.stage-shell` 안의 상단 오른쪽 보조 슬롯에 작게 둔다. `top-row`/`hud`는 그 공간만큼 비워 버튼이 배지·문제·선택지를 가리지 않게 한다.
- 새 차시와 큰 수정 차시는 `<main class="game" data-settings-standard="modal-controls">`를 선언하고, 오른쪽 위 버튼은 `.settings-toggle` 원형 SVG 톱니바퀴로 만든다. 화면에 `설정`/`소리` 글자를 직접 넣지 말고 `aria-label="설정 열기"`를 둔다. 아직 이관하지 않은 차시는 레거시 `.sound-toggle`을 보존할 수 있지만 새 복제 기준은 아니다.
- 전역 버튼 위치는 모든 화면에서 완전히 같아야 한다. `.stage-shell`에 `--sound-button-size`, `--sound-gap`, `--sound-reserve: calc(var(--sound-button-size) + var(--sound-gap));`를 두고, `.settings-toggle`/레거시 `.sound-toggle`은 `top: var(--stage-inset); right: var(--stage-inset); width/height: var(--sound-button-size);`만 쓴다. 화면별 `transform`, active-screen별 위치 보정, 하단 고정은 금지한다.
- 설정 모달은 `.stage-shell` 안에 `role="dialog" aria-modal="true" aria-labelledby="settingsTitle"`로 둔다. 보이는 문구는 `설정`, `배경 소리`, `효과 소리`, `방법 다시 보기`, `처음부터`, `닫기`처럼 짧게 유지하고, `움직임 줄이기`는 넣지 않는다. 모달은 열 때 첫 토글에 focus, 닫을 때 설정 버튼으로 focus 복귀, Escape 닫기, Tab 순환을 지원한다.
- 오디오 상태는 `bgmEnabled`와 `sfxEnabled`로 분리한다. BGM은 `mathmon-audio-bgm-enabled`, 효과음은 `mathmon-audio-sfx-enabled`에 저장하고, `playSample()`은 효과음 설정만 본다. 브라우저 QA용 `__mathmonAudioQa`에는 `getPrefs()`와 `setPrefs({ bgmEnabled, sfxEnabled })`를 둔다.
- `방법 다시 보기`는 기존 설명 화면을 복습 모드로 재사용하고 버튼 문구를 `계속하기`로 바꾼다. `계속하기`를 누르면 저장한 화면으로 돌아가며 문제/보상/결과 상태를 초기화하지 않는다. `처음부터`는 확인 상태(`처음부터 할까요?`)를 거친 뒤 보상 모달·타이머를 정리하고 첫 화면으로 돌아간다.
- `.stage-shell .top-row`는 `right: calc(var(--stage-inset) + var(--sound-reserve));`, `.stage-shell .hud`는 `padding-right: var(--sound-reserve);`로 같은 슬롯을 공유한다. 화면별로 단원 배지와 설정/소리 버튼 사이 간격이 달라지면 실패다.
- `.top-row`는 `top: var(--stage-inset); left: var(--stage-inset); right: calc(var(--stage-inset) + var(--sound-reserve)); height: var(--sound-button-size); gap: var(--sound-gap);`를 명시하고 `inset` 축약을 쓰지 않는다. 문제 화면 `.hud`는 `align-items: start; min-height: var(--sound-button-size);`로 오른쪽 배지가 전역 버튼보다 위아래로 흔들리지 않게 한다.
- 브랜드/단원/상태 배지와 작은 보조 버튼은 글자보다 상자가 먼저 보이면 실패다. `flex: 0 0 auto; width: fit-content; max-width: max-content; min-height: var(--sound-button-size); padding: 0 var(--top-control-pad-x); gap: var(--top-control-icon-gap); white-space: nowrap;`를 기본으로 쓰고, 안정 슬롯이 꼭 필요한 경우를 제외하고 `min-width`로 빈 공간을 크게 만들지 않는다.
- 아이콘+텍스트 배지는 아이콘 크기, 글자 크기, gap, 좌우 패딩을 함께 줄인다. 아이콘만 있는 전역 버튼은 텍스트 pill로 만들지 말고 원형/정사각 아이콘 버튼으로 둔다.
- 새 차시를 만들거나 화면을 크게 고친 뒤에는 반드시 `node scripts/check-stage-ratio.mjs`를 통과시킨다.

## 성취기준 표기 주의

- 루트 로드맵 표의 성취기준 코드(`[4수0X-XX]`)는 2022 개정 3~4학년군 기준 안내용이다.
- 차시 문서(`README.md`/`REPORT.md`)에 코드를 박기 전 교육부 고시(제2022-33호) 수학과 원문과 한 번 더 대조한다.
- 단원·차시 묶음은 교과서마다 다를 수 있으니 학교 교과서가 정해지면 그 배열에 맞춘다.

## 단일 레포 원칙

- 별도 공개 레포를 만들지 않는다. 이 작업실 GitHub 레포지토리 하나를 원본이자 Pages 배포 기준으로 운영한다.
- 필요한 게임 폴더만 GitHub Pages artifact에 포함하고, 공개 URL은 `curl -I -L`로 `HTTP 200`을 확인한다.
- 작업실 원본은 PNG 보관, 학생용 `index.html`은 WebP 같은 경량 포맷을 우선 참조한다. 자세한 검증·배포는 `references/verification.md`와 `eduitit-main-release` 참고.

## 참고 파일

- `references/plan-template.md` — 차시 `PLAN.md` 템플릿(구조·화면 수·생성 이미지·검증).
- `references/lesson-prompts.md` — 24개 차시별 제작 프롬프트와 문제 화면 과밀 방지 공통 프롬프트.
- `references/engine-and-images.md` — 2차시 재사용 함수 맵 + RasterStage/WebP 이미지 패턴.
- `references/effect-design.md` — 효과를 줄 위치, 물질감·보상 이동·랜덤 이벤트 충격·결과 측정 기준.
- `references/verification.md` — 빌드·배포 검증 체크리스트.
- `.claude/skills/eduitit-mathmon-assets/SKILL.md` — 매스몬 캐릭터·팩·카탈로그·결과 카드 자산 관리 절차.
- `_shared/mathmon/MATHMON_ASSET_CONTRACT.md` — Codex와 Claude가 함께 따르는 매스몬 자산 계약.
- `_shared/mathmon/STYLE_GUIDE.md` — 매스몬 팩 생성·중복 방지·이미지 분위기 기준.
