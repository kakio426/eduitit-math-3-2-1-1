# 엔진 재사용 맵 + 이미지 패턴

기준 파일: `3-2-1-2-mathmon-rocket-charge/index.html` (최신 단일 파일 엔진). 새 차시는 이걸 복제해 **문제 생성기 / 보상·등급 라벨 / 테마 이미지** 세 가지만 바꾼다.

## 그대로 재사용하는 함수 (2차시 기준)

> 줄 번호는 참고용. 복제 후 실제 위치는 다시 확인한다.

- 화면/진행: `showScreen`, `startGame`, `renderProblem`, `renderStatus`, `finishProblem`, `nextAfterReward`, `completeProblem`
- **단계 선택 엔진(핵심)**: `buildSteps`, `getCurrentStep`, `renderStep`, `buildStepOptions`, `handleStepChoice`, `completeStep`, `applyStepToBoard`, `updateStepChips`, `updateCurrentAnswerCell`
  - 세로셈/나눗셈/검산 등 차시별 알고리즘을 "단계별 선택"으로 가르치는 뼈대. 단계 수·각 단계 계산·오답 보기만 교체.
- **랜덤 보상 엔진**: `pickFuelEventForRoll`, `rollFuelEvent`, `applyFuelEvent`, `getFuelEventMessage`
  - 효과 타입(증가 +/× · 감소 −/÷ · 0 · 즉시종료 · 특별=최고 직행)은 유지하고 **라벨만** 차시 소재로 바꾼다.
  - 한 문제에서 한 번이라도 틀리면 그 문제는 "결함/누수" 처리 → 일부러 틀리기 차단.
- **결과 등급/연출**: `getDestinationByFuel`, `renderPlanetTrack`(→ 차시별 트랙으로 rename), `showResult`, `getPraise`, `getRetryMessage`
  - 등급 트랙 5단계 + 무지개(전설) + **정답 수 게이트**. 도감 아님 — 도달 등급 자체가 보상.
- 공통: `shuffle`, `randomInt`, 오디오 `initAudio`/`playSound`(BGM 토글 포함), RasterStage CSS.

## 단계 선택 설계 규칙

- 각 단계 보기에는 **정답 1개 + 그 단계의 대표 오답**을 반드시 포함한다(차시별 핵심 오개념을 보기로 노출).
- 마지막 단계는 앞 단계 결과를 합쳐 최종 답을 자동 완성하는 연출로 마무리.
- 정답 누적은 콤보로 가산, 점수는 play 중 전면 비노출 → 끝나고 총량으로 등급 산정(2차시 방식).

## 문제 화면 레이아웃 밀도 규칙

문제 화면은 초3 학생이 3초 안에 `무슨 문제인지`와 `지금 무엇을 고르는지` 말할 수 있어야 한다.

- 기본 노출 요소는 **큰 문제 / 현재 단계 조작판 / 한 줄 지시문 / 선택지** 4개로 제한한다.
- `buildSteps`가 여러 단계를 만들더라도 `renderStep`은 현재 단계만 크게 렌더링한다. 완료 단계는 작은 체크칩으로 접고, 다음 단계는 `?` 또는 잠금 상태로 둔다.
- 설명 패널, 풀이 예고, 보조 계산판, 힌트 내용, 보상 상태판은 기본으로 펼치지 않는다. 필요하면 버튼 뒤로 숨기고, 열어도 지금 단계 힌트 1개만 보여 준다.
- 원리 시각화는 텍스트가 아니라 조작판 안의 블록·칸·스티커·화살표로 해결한다. 같은 원리를 왼쪽 설명판과 오른쪽 계산판에 중복해서 보여 주지 않는다.
- 선택지는 한 덩어리로 크게 배치한다. 선택지와 문제 사이에 긴 문장 또는 장식 패널을 끼우지 않는다.

## RasterStage + WebP 이미지 패턴

**RasterStage** = `16:10`, 기준 크기 `1280×800` 고정 종횡비 컨테이너에 AI 생성 배경을 깔고, 그 위에 실제 `<button>`과 동적 텍스트를 얹는 구조. 점수·문제 같은 가변 데이터는 HTML 오버레이로 유지(이미지에 굽지 않는다).

결과 화면은 더 엄격하다. 섬 이름, 도착 라벨, 칭찬 문구, 다시하기 버튼처럼 매 판 똑같은 요소는 image_gen/GPT Image 등 생성형 이미지 한 장 안에 포함한다. HTML/CSS 오버레이는 정답 수·점수처럼 매 판 달라지는 값과 접근성용 실제 버튼/hitbox만 맡긴다. 이때 버튼 시각 요소, 글자, 패널, 캐릭터를 로컬 폰트·Pillow·canvas·SVG·CSS 캡처·기존 PNG/WebP 겹치기로 만들어 붙이면 로컬 합성이라 금지된다.

모든 차시 `index.html`은 아래 Stage 계약을 유지한다.

```html
<main class="game" data-stage-ratio="16:10" data-stage-size="1280x800">
  <div class="stage-shell">
    <button class="sound-toggle" type="button" aria-pressed="true" aria-label="소리 켜짐">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 10h3.5l4.2-4v12l-4.2-4H4z"></path>
        <path class="sound-wave" d="M15.5 8.5a5 5 0 0 1 0 7"></path>
        <path class="sound-wave" d="M18.5 5.8a9 9 0 0 1 0 12.4"></path>
        <path class="sound-off-stroke" d="M16 8l5 8M21 8l-5 8"></path>
      </svg>
    </button>
  </div>
</main>
```

```css
.stage-shell {
  --stage-inset: clamp(14px, 2vw, 22px);
  --sound-button-size: clamp(30px, 3vw, 34px);
  --sound-gap: clamp(8px, 1vw, 12px);
  --sound-reserve: calc(var(--sound-button-size) + var(--sound-gap));
  --top-control-pad-x: 9px;
  --top-control-icon-gap: 7px;
  position: relative;
  width: min(1280px, calc((100dvh - 48px) * 1.6), 100%);
  aspect-ratio: 16 / 10;
}

.sound-toggle {
  position: absolute;
  top: var(--stage-inset);
  right: var(--stage-inset);
  width: var(--sound-button-size);
  height: var(--sound-button-size);
  font-size: 0;
}

.sound-toggle svg {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 18px;
  height: 18px;
  transform: translate(-50%, -50%);
}

.sound-toggle[aria-pressed="false"] .sound-wave {
  display: none;
}

.sound-off-stroke {
  display: none;
}

.sound-toggle[aria-pressed="false"] .sound-off-stroke {
  display: block;
}

.top-row {
  position: absolute;
  top: var(--stage-inset);
  left: var(--stage-inset);
  right: calc(var(--stage-inset) + var(--sound-reserve));
  height: var(--sound-button-size);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sound-gap);
}

.brand-badge,
.unit-badge,
.mini-badge {
  flex: 0 0 auto;
  width: fit-content;
  max-width: max-content;
  min-height: var(--sound-button-size);
  padding: 0 var(--top-control-pad-x);
  gap: var(--top-control-icon-gap);
  white-space: nowrap;
}

.stage-shell .top-row {
  right: calc(var(--stage-inset) + var(--sound-reserve));
}

.stage-shell .hud {
  padding-right: var(--sound-reserve);
}

.hud {
  align-items: start;
  min-height: var(--sound-button-size);
}

.screen {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: auto;
  aspect-ratio: 16 / 10;
}
```

- 텍스트 안전 여백 + 스크림(반투명 어둠막)으로 글자 가독성 확보.
- 첫 화면 제목은 단순 `<h1>` 큰 글자로 방치하지 않는다. 사용자가 `그림으로`, `GPT Image`, `제목 이미지`를 요구하면 **전체 커버가 아니라 제목 로고만** 별도 래스터 자산으로 생성한다.
- 올바른 제작 순서: 기존 `cover-generated.webp` 대표 장면 유지 → GPT Image에 `standalone title/logo asset`, `exact Korean text`, `no full scene`, `flat #00ff00 chroma-key background`로 제목만 생성 → 초록 배경 제거 → `title-poster-source.png`, `title-poster-generated.png`, `title-poster-generated.webp` 저장 → 첫 화면 위에 `.hero-title-art`로 배치.
- 래스터 제목 자산 HTML 패턴: `<h1 class="visually-hidden" id="coverTitle">게임명</h1>` + `<img class="hero-title-art" src="title-poster-generated.webp" alt="" aria-hidden="true">`.
- 새 차시와 이관 완료 차시는 `<main class="game" data-cover-standard="generated-title-overlay" data-cover-start-standard="generated-button-art">`로 시작 버튼 표준을 선언한다.
- 첫 화면 시작 버튼도 CSS 텍스트 버튼으로 만들지 않는다. GPT Image/imagegen으로 `standalone poster-style start button asset`, `exact Korean text 시작`, `play icon`, `glossy yellow pill`, `transparent or chroma-key background` 조건의 독립 버튼 자산을 만든다. 1차시 커버나 포스터 버튼을 크롭·복제·합성해 새 차시 버튼으로 쓰는 방식은 `generated-button-art`로 인정하지 않는다. 사용자가 명시적으로 승인한 생성형 원본의 배경 제거·크롭·리사이즈·WebP 변환처럼 새 시각 의미를 만들지 않는 후처리만 허용한다. 파일은 `start-button-source.png`, `start-button-generated.png`, `start-button-generated.webp`로 저장한다.
- 시작 버튼 HTML 패턴: `<button class="cover-start-button" id="startButton" aria-label="시작"><img class="start-button-art" src="start-button-generated.webp" alt="" aria-hidden="true"></button>`. 1280×800 Stage 기준 표시 크기는 `400-460px × 140-170px`, 목표 아래 간격은 `14-24px`, 권장 y좌표는 `500-580px`이다.
- 기존 `generated-title-overlay` 차시가 아직 `.primary-button`으로 시작하면 `data-cover-start-standard="compatibility-primary-button"`로 분류한다. 검증은 호환 상태를 기록할 뿐, 생성형 버튼 이관을 조용히 끝난 것으로 처리하지 않는다.
- 금지: 전체 커버를 새 이미지로 갈아엎기, 제목 참고 이미지를 16:10 배경으로 늘리기, HTML/CSS/SVG로 제목 그림 흉내 내기, 철자 검수 없이 생성 이미지를 넣기.
- GPT Image로 제목을 만들 때는 한글 철자를 실제 화면 캡처로 확인한다. 철자가 틀리거나 품질이 맞지 않으면 같은 제목 오버레이 슬롯에서 다시 생성한다.
- 좌표 스트레스 방지: 배경은 그림, 조작은 HTML 버튼으로 둔다. 단, 첫 화면 시작 버튼의 보이는 면은 생성형 버튼 아트이고, HTML 버튼은 같은 크기의 클릭/접근성 레이어다. 결과 화면에서 이미지 안에 그린 다시하기 버튼은 같은 위치의 접근성용 HTML hitbox로 받을 수 있다.
- `소리` 같은 전역 조작 버튼은 `.stage-shell` 내부 상단 오른쪽 보조 슬롯에 작게 두고, `--sound-button-size`/`--sound-gap`/`--sound-reserve`로 모든 화면에서 같은 위치를 유지한다. 화면별 `transform`, active-screen별 위치 보정, 하단 고정은 금지한다.
- 소리 버튼은 텍스트 pill이 아니라 원형 SVG 아이콘 버튼이다. 화면에 `소리` 글자를 직접 넣지 말고, 켜짐/꺼짐은 SVG 파형과 `aria-label`로 표현한다.
- 브랜드/단원/상태 배지는 `width: fit-content`, `max-width: max-content`, 작은 패딩/gap 변수로 내용 폭만큼만 잡는다. 상단 배지와 소리 버튼은 같은 `--sound-button-size` 기준선에 둔다.
- PC와 태블릿 가로에서는 Stage를 contain 방식으로 맞추고, 남는 영역은 바깥 배경 여백으로 둔다.
- 차시를 만든 뒤 루트에서 `node scripts/check-stage-ratio.mjs`를 통과시킨다.

**WebP 규칙**: 작업실 원본은 PNG 보관, 배포는 WebP(quality 82). `index.html`은 webp 참조. 변환은 Pillow(`Image.save(..., format="WEBP", quality=82, method=6)`)를 임시 venv에서 사용 가능.

## 매스몬 이미지 패턴

- 매스몬 원본 관리는 `_shared/mathmon/`이 단일 기준이다.
- 새 매스몬을 만들기 전 `_shared/mathmon/catalog.json`, 각 팩 `manifest.json`, contact sheet를 확인해 기존 실루엣과 겹치지 않게 한다.
- 새 팩은 `_shared/mathmon/STYLE_GUIDE.md`의 활성 스타일 기준을 따른다. 현재 활성 스타일은 1차시 매스몬 기준의 `mathmon-v1-anime-sticker`이며, 밝은 2D 애니/스티커형 톤으로 생성한다.
- 원본 투명 PNG와 raw chroma-key 생성물은 `_shared/mathmon/<pack-id>/`에 두고, 차시 폴더에는 실행에 필요한 WebP만 복사한다.
- 한 차시 안에서는 한 매스몬 팩을 기본으로 쓰고, 여러 팩을 섞을 때는 문서에 이유를 남긴다.
- 보상 모달·결과 배경처럼 매스몬이 장면 안에 있어야 하는 이미지는 이미지 생성 단계에서 장면 안에 매스몬을 함께 포함한다. 먼저 생성한 배경 위에 기존 매스몬 PNG/WebP를 CSS/HTML로 붙여 넣어 한 장면처럼 보이게 만드는 것은 금지한다.
- 실제 이동 모션이 필요한 경우는 기존 컷아웃 합성이 아니라 `event x frame` 생성형 스프라이트, 짧은 WebP/MP4, 또는 canvas용 프레임 시퀀스로 만든다. 정적 보상 모달이면 결과별 완성 이미지 여러 장을 교체하는 방식을 우선한다.

## 차시당 생성 이미지 표준 세트

| 용도 | 개수 | 비고 |
| --- | --- | --- |
| 첫 화면 커버 | 1 | 매스몬·테마·시작 버튼 자리 포함한 한 장면 |
| 첫 화면 제목 타이틀 아트 | 0~1 | 전체 커버가 아니라 제목 로고만 생성해 기존 커버 위에 오버레이 |
| 첫 화면 시작 버튼 아트 | 1 | CSS 텍스트 버튼이 아니라 독립 생성형 버튼 자산으로 제작 |
| 문제 화면 배경(작업 보드) | 1 | 단계 선택판이 얹힐 테마 배경 |
| 보상 오브젝트/모달 장면 | 1~6 | 차시 소재(바구니·층·별·자물쇠 등). 랜덤 이벤트가 결과를 바꾸면 이벤트별 완성 장면을 생성한다. 매스몬은 필요한 경우 이미지 안에 함께 생성한다. |
| 결과 등급 이미지 | 5~6 | 등급 5단계 + 무지개(전설) (+ 필요시 실패형). 각 등급별 완성 결과 장면을 한 장 이미지로 만들고, 고정 문구·도착지 이름·버튼 시각 요소는 이미지 안에 포함한다. |
| 결과 무대 배경 | 0~1 | 결과 등급 이미지와 별개로 필요한 경우만 둔다. 중복 패널이나 별도 도착지 박스를 만들기 위한 배경은 쓰지 않는다. |

> 합체·변신류는 실시간 합성이 아니라 **등급별 완성 이미지를 미리 생성**하고 도달 등급을 보여 준다(2차시 행성과 동형).
