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

모든 차시 `index.html`은 아래 Stage 계약을 유지한다.

```html
<main class="game" data-stage-ratio="16:10" data-stage-size="1280x800">
  <div class="stage-shell">
    <button class="sound-toggle" type="button" aria-pressed="true" aria-label="소리 켜짐">소리</button>
  </div>
</main>
```

```css
.stage-shell {
  width: min(1280px, calc((100dvh - 48px) * 1.6), 100%);
  aspect-ratio: 16 / 10;
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
- 좌표 스트레스 방지: 배경은 그림, 조작은 투명/반투명 HTML 버튼.
- `소리` 같은 전역 조작 버튼은 `.stage-shell` 내부 상단 오른쪽 보조 슬롯에 작게 두고, 문제·선택지·결과 버튼 위로 떠다니게 만들지 않는다.
- PC와 태블릿 가로에서는 Stage를 contain 방식으로 맞추고, 남는 영역은 바깥 배경 여백으로 둔다.
- 차시를 만든 뒤 루트에서 `node scripts/check-stage-ratio.mjs`를 통과시킨다.

**WebP 규칙**: 작업실 원본은 PNG 보관, 배포는 WebP(quality 82). `index.html`은 webp 참조. 변환은 Pillow(`Image.save(..., format="WEBP", quality=82, method=6)`)를 임시 venv에서 사용 가능.

## 매스몬 이미지 패턴

- 매스몬 원본 관리는 `_shared/mathmon/`이 단일 기준이다.
- 새 매스몬을 만들기 전 `_shared/mathmon/catalog.json`, 각 팩 `manifest.json`, contact sheet를 확인해 기존 실루엣과 겹치지 않게 한다.
- 새 팩은 `_shared/mathmon/STYLE_GUIDE.md`의 rounded toy-like 3D mascot 기준을 따른다.
- 원본 투명 PNG와 raw chroma-key 생성물은 `_shared/mathmon/<pack-id>/`에 두고, 차시 폴더에는 실행에 필요한 WebP만 복사한다.
- 한 차시 안에서는 한 매스몬 팩을 기본으로 쓰고, 여러 팩을 섞을 때는 문서에 이유를 남긴다.

## 차시당 생성 이미지 표준 세트

| 용도 | 개수 | 비고 |
| --- | --- | --- |
| 첫 화면 커버 | 1 | 제목·매스몬·테마·시작 버튼 자리 포함한 한 장면 |
| 문제 화면 배경(작업 보드) | 1 | 단계 선택판이 얹힐 테마 배경 |
| 보상 오브젝트 | 1~2 | 차시 소재(바구니·층·별·자물쇠 등) |
| 결과 등급 이미지 | 5~6 | 등급 5단계 + 무지개(전설) (+ 필요시 실패형) |
| 결과 무대 배경 | 1 | 시상식/도착 무대(RasterStage) |

> 합체·변신류는 실시간 합성이 아니라 **등급별 완성 이미지를 미리 생성**하고 도달 등급을 보여 준다(2차시 행성과 동형).
