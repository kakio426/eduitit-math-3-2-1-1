# 매스몬 10배 점프섬 REPORT

## 구현 요약

- 대상: 3학년 2학기 1단원 3차시 `(몇십)×(몇십), (몇십몇)×(몇십)`
- 실행 파일: `3-2-1-3-mathmon-jump-islands/index.html`
- Stage: `16:10`, `1280x800`, `.stage-shell` contain 구조
- 첫 화면: `cover-generated.webp` 배경, `title-poster-generated.webp` 제목 아트, HTML 목표 문장과 `시작` 버튼
- 흐름: 첫 화면 → 설명 → 문제 → 바람 → 도착 전 살펴보기 → 결과

## 문제 은행

`Lesson3MathModel.generateRun(seed)`가 실행 때 문제를 뽑습니다.

- 한 판 10문제
- `0 한 개 붙이기` 문제 5개, `0 두 개 붙이기` 문제 5개
- 최종 답 중복 없음
- `(A0)×(B0)`: `A×B`를 고른 뒤 `0 두 개 붙이기`
- `(AB)×(C0)`: `AB×C`를 고른 뒤 `0 한 개 붙이기`
- 화면 변환 예: 1단계 `49 × 6 = 294`, 2단계 `294 → 2,940`, 완성 칸 `49 × 60 = 2,940`

## 실수와 힌트

문제 화면은 큰 문제, 현재 단계, 한 줄 지시, 선택지에 집중합니다. 첫 오답은 현재 단계 힌트 하나만 보여 줍니다. 같은 단계에서 두 번째 오답이 나오면 정답을 보여 주고 넘어갑니다. 한 번이라도 실수한 문제는 `길이 흔들렸어요`로 처리되어 좋은 바람을 받지 않습니다.

정답을 바로 고르면 선택지 색만 바꾸고 넘기지 않습니다. 1단계는 계산판이 `49 × 6 = 294`처럼 바뀌고 `맞았어요. 다음은 0 붙이기예요.`를 보여 준 뒤 2단계로 갑니다. 2단계는 `294 → 2,940`처럼 최종 답을 보여 줍니다. 그다음 완성 칸에는 `49 × 60 = 2,940`처럼 식과 답만 크게 보이고, 학생이 `바람 보기`를 눌러야 보상 모달로 넘어갑니다.

새 Phase 2에서는 문제 화면 매스몬 작업대, 0 토큰 설명판, 오른쪽 3단 진행 버튼을 제거했습니다. 학생에게 보이는 구조는 상단 전체 섬 지도, 큰 문제, 단일 계산판, 한 줄 지시, 선택지뿐입니다.

상단 지도는 새로 생성한 bitmap 자산 `play-map-strip-generated.webp`를 씁니다. CSS는 섬 그림을 그리지 않고, 섬 이름·현재 위치 테두리·작은 매스몬 현재 위치 마커만 HTML 오버레이로 처리합니다. 학생 화면에 `현재` 글자는 보이지 않고, 보조기기용 `aria-label`에만 현재 위치 정보를 남겼습니다. 보상 뒤에는 이 마커만 지도 안에서 0.4~0.7초 동안 작게 반응합니다.

## 바람 보상

중심 보상은 점프 거리 하나입니다. 정답을 바로 고르면 기본 `+5`가 붙고, 아래 바람 중 하나가 더해집니다.

새 보상 모달에서는 큰 이동감을 문제 화면이 아니라 보상 모달 이미지에만 넣었습니다. 기존처럼 `reward-wind-path-generated.webp` 위에 `mathmon-zfa-04-nyangnyangmon.webp`를 얹어 CSS로 뛰게 하지 않습니다. 바람 종류마다 매스몬이 장면 안에 함께 생성된 `reward-*-generated.webp` 6장을 교체합니다. 문제 풀이 화면에는 계산을 가리는 큰 이동 캐릭터를 넣지 않고, 상단 지도에서 현재 섬을 알려 주는 작은 매스몬 마커만 움직입니다.

상단 지도 매스몬 미니 효과는 보상 모달이 뜨기 전에만 나옵니다. 도착 섬 index가 커지면 새 섬으로 이동하고 통통 착지하며, 작아지면 반대로 이동하고 살짝 흔들립니다. 같은 섬이면 `살랑 바람`은 작은 점프, `쌩쌩 바람`은 조금 큰 점프, `무지개 길`은 밝기 강조, `잠깐 멈춤`은 작게 움찔, `앞바람`과 `길이 흔들렸어요`는 짧은 좌우 흔들림으로 처리합니다. `prefers-reduced-motion: reduce`에서는 이동을 줄이고 위치 갱신과 짧은 밝기 변화만 둡니다.

| 바람 | 거리 변화 | 가중치 |
| --- | ---: | ---: |
| 살랑 바람 | +2~+5 | 64.00% |
| 앞바람 | -4~-8 | 17.00% |
| 잠깐 멈춤 | 0 | 12.84% |
| 쌩쌩 바람 | +8~+13 | 5.98% |
| 무지개 길 | +14 | 0.18% |
| 길이 흔들렸어요 | -8~-14 | 실수한 문제 |

## 확률 시뮬레이션

명령: `node scripts/simulate-lesson3-islands.mjs --seed 12345 --runs 50000`

| 바로 맞힌 문제 | 평균 거리 | 주요 결과 |
| ---: | ---: | --- |
| 0/10 | 0.00 | 출발섬 100% |
| 6/10 | 3.20 | 모래섬 39.818%, 높은 섬 0% |
| 8/10 | 33.32 | 숲섬 49.130%, 구름섬 1.404%, 무지개섬 0% |
| 10/10 | 69.03 | 구름섬 65.752%, 별빛섬 10.534%, 무지개섬 0.214% |

최고 도착지는 정답을 많이 맞힐수록 유리하지만 보장되지 않습니다. 낮은 결과도 도착한 곳을 보여 주며 다시 뛸 길을 남깁니다.

## 결과 공개

마지막 바람 뒤 곧바로 결과를 고정하지 않고, `점프 길을 살펴봐요.` → `도착한 곳을 찾았어요.` → `섬이 보여요.` 순서로 짧게 보여 줍니다. 공개 뒤에는 도착한 섬, 한 줄 칭찬, 맞힌 문제 수, 다시하기 버튼만 남깁니다.

## 소리

`AudioContext`로 낮은 배경음과 짧은 효과음을 만듭니다. 외부 오디오 파일은 쓰지 않습니다.

- 시작, 정답, 오답, `0 한 개 붙이기`, `0 두 개 붙이기`는 서로 다른 짧은 cue를 씁니다.
- 바람 보상은 `살랑 바람`, `앞바람`, `잠깐 멈춤`, `쌩쌩 바람`, `무지개 길`, `길이 흔들렸어요` 각각 `reward-*` cue를 씁니다.
- 결과 공개는 `점프 길을 살펴봐요.` → `도착한 곳을 찾았어요.` → `섬이 보여요.` 단계 cue와 마지막 완료 cue를 분리했습니다.
- 소리 버튼은 Stage 안 오른쪽 위에 고정된 원형 SVG 버튼이며 `aria-label`로 켜짐/꺼짐을 알려 줍니다.

## 생성 이미지와 매스몬

사용 자산은 Stage 안에서 문제, 선택지, 점수, 버튼을 가리지 않도록 연결했습니다.

- `cover-generated.webp`
- `title-poster-source.png`, `title-poster-generated.png`, `title-poster-generated.webp`, `title-poster-transparent-raw.png`
- `tutorial-generated.webp`
- `play-map-strip-source.png`, `play-map-strip-generated.webp`
- `reward-tailwind-source.png`, `reward-tailwind-generated.webp`
- `reward-headwind-source.png`, `reward-headwind-generated.webp`
- `reward-pause-source.png`, `reward-pause-generated.webp`
- `reward-gust-source.png`, `reward-gust-generated.webp`
- `reward-rainbow-source.png`, `reward-rainbow-generated.webp`
- `reward-shaky-source.png`, `reward-shaky-generated.webp`
- `result-final-start-source.png`, `result-final-start-generated.webp`
- `result-final-sand-source.png`, `result-final-sand-generated.webp`
- `result-final-forest-source.png`, `result-final-forest-generated.webp`
- `result-final-cloud-source.png`, `result-final-cloud-generated.webp`
- `result-final-starlight-source.png`, `result-final-starlight-generated.webp`
- `result-final-rainbow-source.png`, `result-final-rainbow-generated.webp`
- `mathmon-zfa-04-nyangnyangmon.webp`

첫 화면과 상단 지도 현재 위치 마커의 동행 매스몬은 `_shared/mathmon/zero-factory-animal-pack/`의 냥냥몬 WebP를 runtime에 씁니다. 보상 모달과 `result-final-*` 결과 화면은 매스몬이 장면 안에 함께 생성된 이미지를 사용합니다. 보상 모달과 결과 장면 안에는 기존 매스몬 WebP를 별도 `<img>`로 붙이지 않습니다.

문제 지도는 built-in `image_gen`으로 새로 생성한 원본을 `play-map-strip-source.png`로 보관하고, runtime에서는 `1280x190` WebP인 `play-map-strip-generated.webp`를 사용합니다. `출발섬`, `모래섬`, `숲섬`, `구름섬`, `별빛섬`, `무지개섬` 6개가 한 화면 안에 항상 들어옵니다. 현재 위치는 `현재` 텍스트 배지 대신 `mathmon-zfa-04-nyangnyangmon.webp` 마커가 섬 중앙 위로 이동하는 방식입니다. 지도 마커 효과에는 새 이미지 자산을 만들지 않았고, 기존 냥냥몬 WebP를 그대로 사용했습니다.

## RasterStage 안전 구역

- 첫 화면: 왼쪽 제목·목표·시작 버튼 영역과 오른쪽 장면 영역을 분리했습니다.
- 문제 화면: 상단 전체 섬 지도, 가운데 큰 문제와 단일 계산판, 하단 선택지를 고정 구역으로 나눴습니다.
- 보상 화면: 중앙 generated art 위에 보상 문구 한 개와 버튼 한 개만 둡니다. 매스몬과 바람 효과는 결과별 생성 이미지 안에 포함합니다.
- 결과 화면: `result-final-*` 래스터가 도착 섬과 다시하기 버튼 모양을 담당하고, 맞힌 문제 수와 실제 클릭 영역만 HTML 오버레이로 둡니다.
- 소리 버튼과 상단 배지는 같은 기준선을 쓰고, 문제·선택지를 덮지 않습니다.

## Humanizer 학생 문구 QA

학생이 보는 한국어는 초3 학생이 소리 내어 읽어도 자연스러운지 기준으로 확인했습니다.

- 어려운 말과 제작자 말은 화면에 남기지 않았습니다.
- 첫 화면 목표: `0을 잠깐 가리고 먼저 곱한 뒤, 0을 붙여 섬을 건너요.`
- 설명 4단계: `바람에 따라 점프 길이 달라져요.`
- 문제 화면 문구: `0을 잠깐 가리고 곱해요.`, `먼저 답을 골라요.`, `가렸던 0을 다시 붙여요.`, `0을 몇 개 붙일까요?`
- 선택지: `0 한 개 붙이기`, `0 두 개 붙이기`, `0 세 개 붙이기`
- 힌트: 지금 단계 힌트 한 줄만 표시
- 보상 모달: 버튼을 빼고 보이는 문구는 한 개. 기본 바람은 `살랑 바람`으로 표시하고, 큰 이동감은 결과별 생성 이미지로 처리하며 지도 마커는 짧은 위치 피드백만 담당
- 실수 보상 문구: `길이 흔들렸어요`

## 텍스트 넘침·요소 겹침 QA

실제 브라우저에서 아래 상태를 캡처했습니다. 보상 모달, 지도 마커, 보상 문구, 결과 요약 숫자와 섬 이름을 다시 확인했고, 첫 화면, 설명, 문제 1단계, 문제 2단계, 보상, 결과 공개 전, 결과, 오답 힌트, 태블릿 가로 문제, 세로 보호막 모두 텍스트 넘침과 요소 겹침 0건으로 통과했습니다. 새 지도 효과 QA는 `1280x800`, `1024x768`에서 `살랑 바람` 제자리 점프와 `쌩쌩 바람` 이동 착지 캡처를 확인했습니다.

| 파일 | 화면 | 상태 |
| --- | --- | --- |
| `screenshots/cover.png` | 1280x800 | 첫 화면 |
| `screenshots/tutorial.png` | 1280x800 | 설명 |
| `screenshots/play-step1.png` | 1280x800 | 먼저 곱하기 |
| `screenshots/play-step2.png` | 1280x800 | 0 붙이기 |
| `screenshots/wrong-hint.png` | 1280x800 | 오답 뒤 힌트 |
| `screenshots/reward.png` | 1280x800 | 바람 보상 |
| `screenshots/result-measurement.png` | 1280x800 | 도착 전 살펴보기 |
| `screenshots/result.png` | 1280x800 | 결과 |
| `screenshots/tablet-landscape-play.png` | 1024x768 | 태블릿 가로 문제 |
| `screenshots/portrait-guard.png` | 390x844 | 세로 화면 보호막 |

## 검증 증거

- 지도 매스몬 효과 QA: `node scripts/qa-lesson3-map-effects.mjs`
- 단계 정답 확인 QA: `node scripts/qa-lesson3-step-feedback.mjs`(1280×800), `LESSON3_QA_NAME=tablet-landscape LESSON3_QA_WIDTH=1024 LESSON3_QA_HEIGHT=768 LESSON3_QA_PORT=9252 node scripts/qa-lesson3-step-feedback.mjs`
- 문제 모델 QA: `node scripts/qa-lesson3-math-model.mjs`
- 보상 시뮬레이션: `node scripts/simulate-lesson3-islands.mjs --seed 12345 --runs 50000 --expect-rainbow-min 0.15`
- Stage 검사: `node scripts/check-stage-ratio.mjs`
- 브라우저 QA: 첫 화면, 설명, 문제 1단계, 문제 2단계, 보상, 결과 공개 전, 결과, 오답 힌트, 태블릿 가로 문제, 세로 보호막, 지도 매스몬 효과 캡처 확인
