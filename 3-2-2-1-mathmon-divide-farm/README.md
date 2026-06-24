# 매스몬 나누기 농장

에듀잇티 수학 게임 시리즈 2단원 1차시입니다.

- 대상: 3학년 2학기 2단원 1차시
- 학습: 내림 없는 `(몇십몇) ÷ (몇)`
- 목표: 수확물을 똑같이 나눠 바구니에 담기
- 문제: 십의 자리와 일의 자리가 각각 나누어떨어지는 나눗셈 문제를 나누는 수가 고르게 섞이도록 10개 출제
- 방식: 십의 자리 나누기 -> 일의 자리 나누기 -> 몫 합치기 3단계 선택형
- 보상: 한 문제를 끝낼 때마다 랜덤 수확 이벤트가 1번 일어남
- 결과: 수확 점수와 정답 수 게이트를 함께 보아 `씨앗 -> 새싹 -> 텃밭 -> 농장 -> 대농장` 등급을 보여 줌. 황금 작물을 얻으면 `전설 황금밭`으로 감
- 실행: `index.html`을 브라우저에서 열기

## 설계 의도

`매스몬 나누기 농장`은 나눗셈의 첫 차시에서 `십의 자리부터 똑같이 나누고, 일의 자리도 나눈 뒤, 두 자리 몫을 합치는 과정`을 짧게 반복하게 만듭니다. 학생은 답만 고르는 대신 자리별 몫을 차례로 고르며 내림 없는 나눗셈의 구조를 봅니다.

문제판은 곱셈 세로셈 모양이 아니라 `수확물 -> 바구니 -> 몫`으로 보이게 구성했습니다. `8십 + 2개`를 `2바구니`에 나누고, `?십 + ?개 = 몫 ?`로 이어지게 하여 십의 자리 몫과 일의 자리 몫을 따로 본 뒤 합치도록 했습니다.

마지막 `몫 합치기` 단계에는 대표 오개념인 `십의 자리 몫 + 일의 자리 몫` 보기가 항상 들어갑니다. 예를 들어 `82 ÷ 2`에서는 `4십 + 1`의 바른 몫 `41`과 함께 `4 + 1 = 5`로 착각한 보기가 같이 나와 자리값을 확인하게 합니다.

보상은 수확 바구니 하나로 단일화했습니다. 정답을 맞히면 풍년, 햇살, 대풍, 흉작, 황금 작물 같은 랜덤 이벤트가 일어나고, 문제 안에서 한 번이라도 틀리면 그 문제는 벌레 먹음으로 처리합니다. 그래서 정답은 분명히 유리하지만, 최종 등급은 수확 운과 정답 수 게이트를 함께 거쳐 결정됩니다.

## 화면

스크린샷은 `screenshots/` 폴더에 저장합니다.

- `01-cover.png`: 첫 화면
- `02-tutorial.png`: 설명 화면
- `03-problem.png`: 문제 화면
- `04-reward.png`: 수확 이벤트 모달
- `05-result-measuring.png`: 결과 정리 중 화면
- `06-result.png`: 수확 등급 결과 화면

## RasterStage 이미지

- `cover-generated.png`: 첫 화면 생성 이미지 원본
- `cover-generated.webp`: 첫 화면 배포용 WebP
- `title-logo-chromakey.png`: GPT Image/imagegen으로 생성한 제목 로고 원본
- `title-logo-generated.png/webp`: 첫 화면 제목 래스터 오버레이
- `tutorial-generated.png`: 설명 화면 생성 이미지 원본
- `tutorial-generated.webp`: 설명 화면 배포용 WebP
- `farm-board-generated.png`: 문제 화면 농장 보드 이미지 원본
- `farm-board-generated.webp`: 문제 화면 배포용 WebP
- `reward-events-sprite-generated.png`: 보상 이벤트 3x2 스프라이트 원본
- `reward-events-sprite-generated.webp`: 보상 이벤트 WebP 보관본
- `result-tiers-contact-sheet.png`: 결과 등급 3x2 원본 시트
- `result-tier-seed.png/webp`: 씨앗
- `result-tier-sprout.png/webp`: 새싹
- `result-tier-garden.png/webp`: 텃밭
- `result-tier-farm.png/webp`: 농장
- `result-tier-bigfarm.png/webp`: 대농장
- `result-tier-rainbow.png/webp`: 전설 황금밭
- `assets/mathmon/base-pack/mathmon-2-foxmon.webp`: 첫 화면과 결과 화면 동행 매스몬(여우몬)

첫 화면과 설명 화면은 생성 이미지를 배경으로 씁니다. 첫 화면은 `generated-title-overlay` 표준으로, 제목은 `title-logo-generated.webp` 래스터 오버레이로 얹고 실제 제목 텍스트는 접근성용 숨김 제목으로 남깁니다. 한 줄 목표와 시작 버튼은 HTML 오버레이입니다. 첫 화면 배경은 캐릭터 없는 농장 장면이며, 여우몬은 `.cover-mathmon` HTML 이미지로만 올라갑니다. 문제 화면은 생성 농장 보드 위에 나눗셈판과 선택지를 HTML/CSS로 얹습니다. 결과 화면은 캐릭터 없는 도달 등급별 RasterStage 배경을 사용하고, 여우몬은 `.result-mathmon` 오버레이로 한 마리만 보여 줍니다. 수확 점수·정답 수·등급명·다시하기 버튼은 HTML로 얹습니다.

## 파일 구성

- `index.html`: 게임 본문
- `README.md`: 대상, 학습 목표, 게임 방식, 파일 구성
- `REPORT.md`: 화면 흐름, 보상 구조, 검증 결과
- `screenshots/`: 화면별 스크린샷
- `*.png`, `*.webp`: 생성 이미지 원본과 배포용 자산
