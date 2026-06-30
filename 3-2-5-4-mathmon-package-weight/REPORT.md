# 매스몬 택배 무게 맞추기 트럭 진화 재설계 보고서

## 1. 구현 요약

3학년 2학기 5단원 4차시 `무게의 덧셈·뺄셈과 어림`을 단일 HTML 게임으로 정리했습니다. 학생은 10문제 동안 kg와 g 무게를 더하고 빼며, 택배 한도에 맞는 말을 고릅니다. 정답을 고르면 답이 계산판에 먼저 들어가고, 마지막 단계에서는 완성식을 본 뒤 `트럭 보기`를 눌러 보상으로 넘어갑니다.

이번 수정에서 보상 축을 트럭 진화로 바꾸고, 차시 README/REPORT, Humanizer QA, 스크린샷 QA, 검증 증거를 새 기준에 맞췄습니다.

## 2. 등록

- `manifest.json` lesson id: `3-2-5-4`
- folder: `3-2-5-4-mathmon-package-weight`
- title: `매스몬 택배 무게 맞추기`
- grade/semester/unit/lesson: `3 / 2 / 5 / 4`
- subject: `수학`
- learningGoal: `kg와 g로 나타낸 무게를 더하고 빼며, 택배 한도에 맞는지 어림해 판단한다.`
- entryFile: `index.html`
- root `README.md`: 현재 시리즈 표에 5단원 4차시 행 추가

## 3. 화면 흐름

```text
첫 화면 -> 설명 -> 문제 -> 보상 -> 결과
```

- 첫 화면: `cover-generated.webp` 배경, `title-logo-generated.webp` 제목 아트, HTML 목표 문장, `data-cover-start-standard="generated-button-art"` 기반 독립 생성형 `start-button-generated.webp` 버튼 아트와 실제 HTML 버튼
- 설명: 3개의 짧은 카드로 g 더하기, 1kg 빌리기, 한도 판단을 안내
- 문제: 큰 문제, 현재 계산판, 한 줄 지시, 선택지만 기본 노출
- 보상: 부품 상자 이름, CSS 트럭 미리보기, 현재 트럭 단계 1개만 크게 표시
- 결과: 트럭 단계 생성 이미지와 동적(dynamic) 결과값, 실제 다시 하기 조작 표시

## 4. 생성 이미지 자산

| 파일명 | 역할 |
| --- | --- |
| `cover-source.png` | 생성형 첫 화면 원본 |
| `cover-generated.webp` | 글자 없는 첫 화면 배경 |
| `title-logo-chromakey.png` | 생성형 제목 크로마키 원본 |
| `title-logo-generated.png` | 배경 제거 제목 PNG |
| `title-logo-generated.webp` | 런타임 제목 WebP |
| `start-button-source.png` | 1차시 버튼 물성을 참고한 독립 생성형 시작 버튼 원본 |
| `start-button-generated.png` | 배경 제거 시작 버튼 PNG |
| `start-button-generated.webp` | 런타임 시작 버튼 WebP |
| `reward-truck-upgrade-source.png` / `reward-truck-upgrade-generated.webp` | 트럭 업그레이드 작업장 보상 배경 |
| `result-truck-plain-source.png` / `result-truck-plain-generated.webp` | 평범 트럭 결과 장면 |
| `result-truck-slight-source.png` / `result-truck-slight-generated.webp` | 살짝 멋진 트럭 결과 장면 |
| `result-truck-cool-source.png` / `result-truck-cool-generated.webp` | 번쩍 멋진 트럭 결과 장면 |
| `result-truck-super-source.png` / `result-truck-super-generated.webp` | 슈퍼 초울트라 트럭 결과 장면 |
| `result-title-plain/slight/cool/super-source.png` / `result-title-*-generated.webp` | 결과 트럭 이름 생성형 타이틀 아트 |
| `result-retry-button-source.png` / `result-retry-button-generated.webp` | 결과 화면 `다시` 생성형 버튼 아트 |

결과 장면 안에는 생성 단계에서 트럭과 택배 매스몬이 함께 들어가 있습니다. 결과 이름과 `다시` 버튼도 생성형 타이틀/버튼 자산으로 처리했습니다. 결과 화면 위에 큰 CSS 카드, CSS 제목, CSS 본문, 로컬에서 만든 제목/버튼 그림을 덧붙이지 않았습니다. 이전 결과 이미지는 `_archive/3-2-5-4-destination-results/`에 보관했습니다.

## 5. 매스몬 팩

택배 차시 전용 `weight-pack`을 씁니다.

| 파일명 | 역할 |
| --- | --- |
| `_shared/mathmon/weight-pack/manifest.json` | 팩 메타데이터 |
| `_shared/mathmon/weight-pack/raw-chromakey/mathmon-wt-01-courierfox.png` | 생성형 크로마키 원본 |
| `_shared/mathmon/weight-pack/png/mathmon-wt-01-courierfox.png` | 투명 PNG 원본 |
| `_shared/mathmon/weight-pack/webp/mathmon-wt-01-courierfox.webp` | 공용 WebP |
| `_shared/mathmon/weight-pack/contact-sheets/weight-pack-contact-sheet.png` | 확인용 시트 |
| `assets/mathmon/weight-pack/mathmon-wt-01-courierfox.webp` | 차시 실행용 WebP |

첫 화면과 결과 장면에는 이미 매스몬이 생성 이미지 안에 있으므로, 차시 실행용 WebP를 별도 오버레이로 올리지 않았습니다.

## 6. HTML 오버레이 경계

- 첫 화면 HTML: 브랜드/단원 배지, 배움주제 배지, 목표 문장, 생성형 `시작` 버튼 아트 위의 실제 HTML 버튼
- 첫 화면 이미지: 글자 없는 택배 작업장, 생성형 제목 아트, 독립 생성형 `시작` 버튼 아트
- 문제 화면 HTML: 모든 문제식, 선택지, 답 칸, 피드백, 단계 칩, `트럭 보기`
- 보상 화면 이미지: `reward-truck-upgrade-generated.webp` 트럭 업그레이드 작업장 배경
- 보상 화면 HTML: 부품 상자 이름, CSS 트럭 미리보기, 트럭 단계 트랙, 변화 문구, 다음 버튼
- 결과 화면 이미지: `result-truck-*-generated.webp` 트럭 단계와 택배 매스몬 장면
- 결과 화면 생성형 오버레이: `result-title-*-generated.webp` 트럭 단계 이름, `result-retry-button-generated.webp` 버튼 아트
- 결과 화면 동적(dynamic) 값: `resultTitle`, `resultSummary`, `resultNext`는 스크린리더용 숨김 텍스트로만 유지합니다.
- 첫 화면 고정 조작: `startButton`은 생성형 버튼 아트 위의 실제 HTML 버튼입니다. 보이는 버튼 글자와 장식은 CSS가 아니라 이미지 자산이 맡습니다.
- 결과 화면 고정 조작: `retryButton`은 생성형 버튼 아트 위의 실제 HTML hitbox입니다. 보이는 버튼 글자와 장식은 CSS가 아니라 이미지 자산이 맡습니다.
- 결과 화면 전역 배지/조작: 상단 `오늘의 트럭`, `5단원 무게` 배지와 소리 아이콘은 시리즈 공통 Stage chrome입니다.

이 경계는 결과 RasterStage 하네스 보강입니다. 트럭 단계 이름과 버튼 장식은 생성형 이미지 자산이고, `retryButton`은 실제 조작과 접근성을 위한 hitbox로만 남깁니다. 결과 카드, 큰 제목, 칭찬 문구, 버튼 장식을 HTML/CSS로 새로 그리면 실패로 봅니다.

## 7. 보상과 확률

보상은 트럭 진화 하나로 유지합니다. 처음에 맞히면 내부 보상값 `+5`가 붙고, 부품 상자 보상이 한 번 더해집니다. 학생 화면에는 숫자 보상값을 직접 노출하지 않고 트럭 단계만 보여 줍니다.

| 상자 | 확률 | 변화 |
| --- | --- | --- |
| 작은 부품 상자 | 52% | +5~+8 |
| 번쩍 부품 상자 | 17% | +13~+18 |
| 꾸미기 상자 | 17% | +9~+12 |
| 삐끗 상자 | 12% | +1~+3 |
| 슈퍼 부품 상자 | 2% | +28, 최고 트럭 조건 |

오답 뒤에 맞히면 기본 보상값은 붙지 않고 `상자 다시 묶기`로 +1~+2가 한 번 붙습니다. 빈손처럼 끝나지 않지만, 바로 맞힌 경우보다 트럭이 천천히 바뀝니다.

트럭 결과는 내부 보상값과 바로 맞힌 문제 수로 정합니다.

| 트럭 | 조건 |
| --- | --- |
| 평범 트럭 | 기본 |
| 살짝 멋진 트럭 | 30 이상, 바로 맞힌 문제 3개 이상 |
| 번쩍 멋진 트럭 | 70 이상, 바로 맞힌 문제 7개 이상 |
| 슈퍼 초울트라 트럭 | 100, 바로 맞힌 문제 10개, 슈퍼 부품 상자 필요 |

## 8. Humanizer QA

학생 문구는 초3 학생이 소리 내어 바로 읽을 수 있는 말인지 확인했습니다.

- 첫 화면 목표: `택배 한도에 맞는 무게를 골라요.`
- 설명 카드: `g끼리 먼저 봐요.`, `부족하면 1kg을 빌려요.`, `한도보다 가벼워야 해요.`
- 문제 지시: `g끼리 더한 값을 골라요.`, `위 무게를 1kg 줄이고 1000g 늘려요.`, `한도에 맞는 말을 골라요.`
- 오답 피드백: `다시 골라요.`
- 보상/결과: `작은 부품 상자`, `트럭이 멋져졌어요.`, `평범 트럭`, `슈퍼 초울트라 트럭`, `5단원 무게`, `다시`

점검 결과 학생 화면에는 내부 작업실 이름이나 제작자용 말이 보이지 않습니다. 보고서와 README의 기술 설명은 학생 화면이 아닙니다.

## 9. 텍스트 넘침·요소 겹침 QA

브라우저 QA에서 desktop `1280x800`과 tablet landscape `1024x768`을 확인했습니다.

확인 상태:

- 첫 화면: `screenshots/cover.png`
- 설명: `screenshots/tutorial.png`
- 문제 1단계: `screenshots/play-step1.png`
- 문제 2단계: `screenshots/play-step2.png`
- 오답/힌트 상태: `screenshots/wrong-hint.png`
- 보상: `screenshots/reward.png`
- 결과 1단계: `screenshots/result-plain.png`
- 결과 2단계: `screenshots/result-slight.png`
- 결과 3단계: `screenshots/result-cool.png`
- 결과 4단계: `screenshots/result-super.png`
- 태블릿 첫 화면: `screenshots/tablet-cover.png`
- 태블릿 문제: `screenshots/tablet-play-step1.png`
- 태블릿 보상: `screenshots/tablet-reward.png`
- 태블릿 결과 1단계: `screenshots/tablet-result-plain.png`
- 태블릿 결과 2단계: `screenshots/tablet-result-slight.png`
- 태블릿 결과 3단계: `screenshots/tablet-result-cool.png`
- 태블릿 결과 4단계: `screenshots/tablet-result-super.png`
- 태블릿 대표 화면: `screenshots/tablet-landscape.png`

확인 결과:

- 버튼, 배지, 선택지, 보상 카드, 결과 카드의 글자 넘침 없음
- 소리 버튼과 상단 배지 충돌 없음
- 문제와 선택지 사이의 겹침 없음
- 답 칸과 확인 문구가 보상 화면에 가려지지 않음
- 태블릿 가로에서도 Stage 비율 유지

세로 휴대폰은 기본 지원 대상이 아니며, 별도 세로 차단 화면이 구현되어 있지 않습니다. 그래서 `portrait-guard.png`는 만들지 않았습니다.

## 10. 스크린샷 QA 증거

- Browser QA summary: `.omo/evidence/mathmon-lesson5-package-weight/truck-evolution-visual-qa.json`
- 화면 파일: `3-2-5-4-mathmon-package-weight/screenshots/`
- 반복 확인: 로컬 서버 reload 뒤 첫 화면 라우팅이 흔들리지 않는지 확인

## 11. 검증 명령

- Git 상태 전: `git status --short`
- 등록 확인: `node -e <manifest lesson assertion>`
- 학생 문구 감사: required student-term pattern with `rg`
- Stage 계약: `node scripts/check-stage-ratio.mjs`
- 수학 모델: `node scripts/qa-lesson5-package-weight-model.mjs --runs 10000`
- 보상 시뮬레이션: `node scripts/simulate-lesson5-package-weight.mjs --runs 10000`
- 클릭 가드: `node scripts/qa-lesson5-package-weight-click-guards.mjs`
- 브라우저 QA: Chrome CDP 자동 조작과 캡처
- Git 상태 후: `git status --short`

증거 파일:

- `.omo/evidence/mathmon-lesson5-package-weight/truck-evolution-visual-qa.json`
