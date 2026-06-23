# 매스몬 검산 자물쇠

에듀잇티 수학 게임 시리즈 3학년 2학기 2단원 4차시 게임입니다.

- 대상: 3학년 2학기 2단원 4차시
- 학습: 곱셈으로 나눗셈 검산하기
- 목표: `몫 × 나누는 수 + 나머지 = 나누어지는 수` 관계를 사용해 원래 수를 확인한다.
- 문제: 나머지가 있는 나눗셈 결과를 보고 검산식으로 원래 수를 찾는 문제 10개 랜덤 출제
- 방식: `곱하기 -> 나머지 더하기 -> 원래 수 확인` 3단계 선택형
- 보상: 한 문제를 끝낼 때마다 금고 해제 이벤트가 1번 일어남
- 결과: 금고 해제 에너지와 정답 수를 함께 측정해 `자물쇠 -> 금고 -> 대형금고 -> 비밀금고 -> 보물고` 등급 중 도달 등급을 보여 줌. 무지개 코어를 얻으면 `전설 금고`가 열림
- 실행: `index.html`을 브라우저에서 열기

## 설계 의도

`매스몬 검산 자물쇠`는 2단원 나눗셈의 종합 차시입니다. 학생은 나눗셈 결과를 보고 답을 다시 검산합니다.

예를 들어 `47 ÷ 5 = 9 ... 2`는 `9 × 5 = 45`, `45 + 2 = 47` 순서로 확인합니다. 핵심 오개념인 `나머지 더하기 누락`을 보기 안에 넣어, `45`에서 멈추면 원래 수가 돌아오지 않는다는 점을 반복해서 확인하게 했습니다.

보상은 `금고 해제 에너지` 하나로만 유지합니다. 문제 안에서 한 번이라도 틀리면 해당 문제는 오류 처리 이벤트로 이어져 일부러 틀려 보상을 노리는 흐름을 막습니다. 플레이 중에는 금고 등급을 미리 공개하지 않고, 한 판이 끝난 뒤 측정 화면에서만 도달 등급을 보여 줍니다. 결과는 차시 자체 완결형 금고 등급이며, 도감 수집 구조는 사용하지 않습니다.

## 화면

스크린샷은 `screenshots/` 폴더에 저장합니다.

## RasterStage 이미지

- `cover-generated.png/webp`: 첫 화면 금고 보안실 표지
- `tutorial-generated.png/webp`: 설명 화면 검산 흐름 배경
- `board-vault-generated.png/webp`: 문제 화면 보안실 배경
- `lock-generated.png/webp`: 보상 팝업 자물쇠 오브젝트
- `result-lock-generated.png/webp`: 자물쇠 결과 화면
- `result-safe-generated.png/webp`: 금고 결과 화면
- `result-large-safe-generated.png/webp`: 대형금고 결과 화면
- `result-secret-safe-generated.png/webp`: 비밀금고 결과 화면
- `result-treasure-generated.png/webp`: 보물고 결과 화면
- `result-rainbow-generated.png/webp`: 전설 금고 결과 화면
- `result-retry-generated.png/webp`: 다시하기 결과 화면

첫 화면과 결과 화면은 RasterStage 배경을 쓰고, 제목·한 줄 목표·버튼·해제 에너지·정답 수·도달 등급처럼 매 판 달라지는 값은 HTML로 얹습니다. 문제 화면의 계산판과 선택지도 HTML/CSS로 유지해 숫자가 선명하게 보이도록 했습니다. 금고 해제 에너지는 왼쪽 보안실의 빛, 다이얼, 잠금등이 켜지는 CSS 레이어로도 표현합니다.

## 작업실 파일 구성

- `index.html`: 게임 본문
- `cover-generated.webp`, `tutorial-generated.webp`, `board-vault-generated.webp`: 주요 화면 배경
- `result-*-generated.webp`: 금고 등급별 결과 배경
- `lock-generated.webp`: 보상 오브젝트
- `eduitit-logo-mark.png`: 에듀잇티 로고
- `screenshots/`: 화면별 검증 스크린샷
- `REPORT.md`: 게임 설명, 화면 흐름, 보상 구조

학생용 static 사본에는 실행에 필요한 `index.html`, WebP 배경, 로고, 문서만 복사합니다. PNG 원본과 `screenshots/`는 작업실에 보관합니다.

## 검증 산출물

- `screenshots/01-cover.png`: 첫 화면
- `screenshots/02-tutorial.png`: 설명 화면
- `screenshots/03-problem.png`: 문제 화면
- `screenshots/04-reward.png`: 보상 화면
- `screenshots/05-result-success.png`: 성공 결과 화면
- `screenshots/06-result-retry.png`: 다시하기 결과 화면
- `screenshots/07-tablet-cover.png`: 태블릿 가로 첫 화면
- `screenshots/08-error-reward.png`: 오답 후 오류 처리 보상 화면
- `screenshots/09-tablet-problem.png`: 태블릿 가로 문제 화면
- `screenshots/raster-assets-contact-sheet.png`: RasterStage 이미지 세트
- `screenshots/screen-flow-contact-sheet.png`: 화면 흐름 확인용 모음
