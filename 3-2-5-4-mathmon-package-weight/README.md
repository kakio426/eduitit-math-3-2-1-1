# 매스몬 택배 무게 맞추기

에듀잇티 수학 게임 시리즈 3학년 2학기 5단원 4차시 단일 HTML 패키지입니다.

- 대상: 초등학교 3학년 2학기
- 배움주제: 무게의 덧셈·뺄셈과 어림
- 학생 행동: 택배 한도에 맞는 무게를 골라요.
- 문제: 10문제, kg/g 더하기, kg/g 빼기, 한도 고르기
- 보상: 상자로 트럭을 멋지게 바꾸기
- 실행: `index.html`을 브라우저에서 열기

## 화면 흐름

```text
첫 화면 -> 설명 -> 문제 -> 보상 -> 결과
```

문제 화면은 큰 문제, 현재 계산판, 한 줄 지시, 선택지만 기본으로 보여 줍니다. 정답을 고르면 값이 계산판 칸에 들어간 뒤 다음 단계로 넘어갑니다. 마지막 단계 뒤에는 완성된 식을 먼저 보여 주고 `트럭 보기` 버튼으로 보상 화면을 엽니다.

## 생성 이미지 자산

`index.html`은 `data-cover-standard="generated-title-overlay"`를 선언합니다. 첫 화면은 글자 없는 배경, 생성형 제목 아트, HTML 목표 문장과 실제 `시작` 버튼으로 나뉩니다.

| 파일명 | 용도 | 런타임 |
| --- | --- | --- |
| `cover-source.png` / `cover-generated.webp` | 글자 없는 택배 작업장 첫 화면 배경 | `cover-generated.webp` |
| `title-logo-chromakey.png` / `title-logo-generated.png` / `title-logo-generated.webp` | 생성형 제목 아트 | `title-logo-generated.webp` |
| `reward-truck-upgrade-source.png` / `reward-truck-upgrade-generated.webp` | 트럭 업그레이드 작업장 보상 배경 | `reward-truck-upgrade-generated.webp` |
| `result-truck-plain-source.png` / `result-truck-plain-generated.webp` | 평범 트럭 결과 장면 | `result-truck-plain-generated.webp` |
| `result-truck-slight-source.png` / `result-truck-slight-generated.webp` | 살짝 멋진 트럭 결과 장면 | `result-truck-slight-generated.webp` |
| `result-truck-cool-source.png` / `result-truck-cool-generated.webp` | 번쩍 멋진 트럭 결과 장면 | `result-truck-cool-generated.webp` |
| `result-truck-super-source.png` / `result-truck-super-generated.webp` | 슈퍼 초울트라 트럭 결과 장면 | `result-truck-super-generated.webp` |
| `result-title-plain/slight/cool/super-source.png` / `result-title-*-generated.webp` | 결과 트럭 이름 생성형 타이틀 아트 | `result-title-*-generated.webp` |
| `result-retry-button-source.png` / `result-retry-button-generated.webp` | 결과 화면 `다시` 생성형 버튼 아트 | `result-retry-button-generated.webp` |

결과 장면에는 생성 단계에서 트럭과 택배 매스몬이 함께 들어가 있습니다. 결과 이름과 `다시` 버튼도 로컬 폰트/CSS가 아니라 생성형 타이틀/버튼 자산으로 얹습니다. 결과 화면에는 큰 CSS 카드, CSS 제목, CSS 본문을 만들지 않습니다. 이전 결과 이미지는 `_archive/3-2-5-4-destination-results/`에 보관합니다.

## HTML 오버레이 범위

- 첫 화면: 브랜드/단원 배지, 배움주제 배지, 목표 문장, `시작` 버튼
- 문제 화면: 문제식, 단계 칩, 한 줄 지시, 답 칸, 선택지, 확인 문구, `트럭 보기` 버튼
- 보상 화면 이미지: 글자 없는 트럭 업그레이드 작업장 배경
- 보상 화면 HTML: 부품 상자 이름, CSS 트럭 미리보기, 현재 트럭 단계, 변화 문구, 다음 버튼
- 결과 화면 생성 이미지: 트럭 단계와 택배 매스몬, 생성형 결과 타이틀 아트, 생성형 `다시` 버튼 아트
- 결과 화면 동적(dynamic) 값: `resultTitle`, `resultSummary`, `resultNext`는 스크린리더용 숨김 텍스트로만 유지합니다.
- 결과 화면 고정 조작: `retryButton`은 생성형 버튼 아트 위의 실제 HTML hitbox입니다. 보이는 버튼 글자와 장식은 CSS가 아니라 이미지 자산이 맡습니다.
- 결과 화면 전역 배지/조작: 상단 `오늘의 트럭`, `5단원 무게` 배지와 소리 아이콘은 시리즈 공통 Stage chrome입니다.

결과 화면의 보이는 HTML 오버레이는 실제 조작 hitbox와 시리즈 공통 배지로 제한합니다. 결과 카드, 큰 제목, 칭찬 문구, 버튼 장식을 HTML/CSS로 새로 그리면 하네스 실패로 봅니다.

## 매스몬 팩

택배 무게 차시 전용 `weight-pack`을 `_shared/mathmon/weight-pack/`에 등록했습니다.

| 파일명 | 용도 |
| --- | --- |
| `_shared/mathmon/weight-pack/raw-chromakey/mathmon-wt-01-courierfox.png` | 생성형 크로마키 원본 |
| `_shared/mathmon/weight-pack/png/mathmon-wt-01-courierfox.png` | 투명 PNG 원본 |
| `_shared/mathmon/weight-pack/webp/mathmon-wt-01-courierfox.webp` | 공용 WebP 배포본 |
| `assets/mathmon/weight-pack/mathmon-wt-01-courierfox.webp` | 차시 실행용 복사본 |
| `_shared/mathmon/weight-pack/contact-sheets/weight-pack-contact-sheet.png` | 팩 확인용 시트 |

첫 화면 배경과 결과 장면에는 매스몬이 생성 이미지 안에 들어가 있으므로, 런타임 복사본은 따로 얹지 않았습니다.

## 보상 구조

정답을 처음에 맞히면 내부 보상값 `+5`가 더해집니다. 그 뒤 트럭을 바꾸는 상자 보상이 한 번 붙습니다. 학생 화면에는 숫자 보상값을 직접 보이지 않고, 현재 트럭 단계만 보여 줍니다.

| 상자 | 확률 | 변화 |
| --- | --- | --- |
| 작은 부품 상자 | 52% | +5~+8 |
| 번쩍 부품 상자 | 17% | +13~+18 |
| 꾸미기 상자 | 17% | +9~+12 |
| 삐끗 상자 | 12% | +1~+3 |
| 슈퍼 부품 상자 | 2% | +28, 최고 트럭 조건 |

오답 뒤에 맞히면 기본 보상값은 붙지 않고 `상자 다시 묶기`로 +1~+2가 한 번 붙습니다. 빈손처럼 끝나지 않지만, 바로 맞힌 경우보다 트럭이 천천히 바뀝니다.

| 트럭 | 조건 |
| --- | --- |
| 평범 트럭 | 기본 |
| 살짝 멋진 트럭 | 30 이상, 바로 맞힌 문제 3개 이상 |
| 번쩍 멋진 트럭 | 70 이상, 바로 맞힌 문제 7개 이상 |
| 슈퍼 초울트라 트럭 | 100, 바로 맞힌 문제 10개, 슈퍼 부품 상자 필요 |

## Humanizer QA

학생에게 보이는 문구는 짧은 행동 말로 점검했습니다.

- 첫 화면 목표: `택배 한도에 맞는 무게를 골라요.`
- 설명: `g끼리 먼저 봐요.`, `부족하면 1kg을 빌려요.`, `한도보다 가벼워야 해요.`
- 문제 지시: `g끼리 더한 값을 골라요.`, `남은 택배 무게를 골라요.`, `한도에 맞는 말을 골라요.`
- 피드백: `다시 골라요.`, `...이 들어갔어요.`, `...로 보낼 수 있어요.`
- 보상/결과: `작은 부품 상자`, `트럭이 멋져졌어요.`, `평범 트럭`, `슈퍼 초울트라 트럭`, `다시`

학생 화면에는 내부 작업실 이름이나 제작자용 말을 보이지 않게 했습니다.

## 스크린샷

스크린샷은 `screenshots/`에 저장합니다.

- `cover.png`
- `tutorial.png`
- `play-step1.png`
- `play-step2.png`
- `wrong-hint.png`
- `reward.png`
- `result-plain.png`
- `result-slight.png`
- `result-cool.png`
- `result-super.png`
- `tablet-cover.png`
- `tablet-play-step1.png`
- `tablet-reward.png`
- `tablet-result-plain.png`
- `tablet-result-slight.png`
- `tablet-result-cool.png`
- `tablet-result-super.png`
- `tablet-landscape.png`

세로 휴대폰은 기본 지원 대상이 아니며, 별도 세로 차단 화면이 구현되어 있지 않아 `portrait-guard.png`는 만들지 않습니다.

## 검증

- `node -e 'JSON.parse(require("fs").readFileSync("manifest.json","utf8")); const lesson=JSON.parse(require("fs").readFileSync("manifest.json","utf8")).lessons.find((item)=>item.id==="3-2-5-4"); if(!lesson) throw new Error("missing lesson"); console.log(JSON.stringify(lesson,null,2));'`
- Text audit: required student-term pattern against `index.html`, `README.md`, and `REPORT.md`
- `node scripts/check-stage-ratio.mjs`
- `node scripts/qa-lesson5-package-weight-model.mjs --runs 10000`
- `node scripts/simulate-lesson5-package-weight.mjs --runs 10000`
- `node scripts/qa-lesson5-package-weight-click-guards.mjs`
- Browser QA: Chrome CDP 자동 캡처로 데스크톱과 태블릿 가로 화면 확인
