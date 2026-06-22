# 매스몬 0 공장

에듀잇티 수학 게임 시리즈 3탄입니다.

- 대상: 3학년 2학기 1단원 3차시
- 학습: (몇십)×(몇십), (몇십몇)×(몇십)
- 문제: 0 처리가 필요한 곱셈 문제 10개 랜덤 출제
- 방식: `핵심 곱 계산 -> 0 붙이기` 2단계 선택형
- 보상: 한 문제를 끝낼 때마다 출하 준비 칸이 채워지고, 0 공장 생산 이벤트가 공장 부품 아이콘으로 1번 일어남
- 결과: 총 생산량을 측정해 출하 등급을 보여 주고, 정답 수와 생산량에 맞는 매스몬 도감 카드를 공개함
- 실행: `index.html`을 브라우저에서 열기

## 설계 의도

`매스몬 0 공장`은 끝에 0이 붙은 곱셈을 통째로 외우게 하지 않고, 먼저 0을 잠깐 떼어 핵심 부분만 곱한 뒤 떼어 낸 0을 다시 붙이는 원리를 연습하게 만듭니다.

예를 들어 `30 × 40`은 `3 × 4 = 12`를 먼저 고른 뒤, 두 수 끝의 0이 모두 2개였다는 것을 골라 `1,200`을 완성합니다. `27 × 40`은 `27 × 4 = 108`을 먼저 고르고, 끝의 0 1개를 붙여 `1,080`을 완성합니다.

보상은 0 공장의 생산량 하나로만 유지합니다. 문제 안에서 한 번이라도 틀리면 그 문제는 불량 처리 이벤트가 적용되어 일부러 틀려 보상을 노리는 흐름을 막습니다. 문제 화면 왼쪽에는 10칸 출하 준비 칸을 두어 완성품과 불량 처리 칸이 눈에 남도록 했고, 보상 팝업에는 생산·불량·정지·무지개 상태가 다른 부품 아이콘으로 보이게 했습니다. 생산량은 문제를 푸는 동안 전면 점수로 보여 주지 않고, 마지막 결과 화면에서 측정해 출하 등급과 매스몬 도감으로 이어집니다.

## 화면

스크린샷은 `screenshots/` 폴더에 저장합니다.

## RasterStage 이미지

- `cover-generated.png`: 첫 화면 생성 이미지 원본
- `cover-generated.webp`: 첫 화면 배포용 WebP
- `factory-conveyor-generated.png`: 문제 화면 0 공장 배경 생성 이미지 원본
- `factory-conveyor-generated.webp`: 문제 화면 0 공장 배경 배포용 WebP
- `result-class-generated.png/webp`: 우리 반 출하 결과 화면
- `result-school-generated.png/webp`: 학교 출하 결과 화면
- `result-town-generated.png/webp`: 동네 출하 결과 화면
- `result-city-generated.png/webp`: 도시 출하 결과 화면
- `result-country-generated.png/webp`: 전국 출하 결과 화면
- `result-world-generated.png/webp`: 세계 출하 결과 화면
- `result-space-generated.png/webp`: 무지개 부품 특별 출하 결과 화면
- `result-retry-generated.png/webp`: 컨베이어 점검/다시하기 결과 화면

첫 화면과 결과 화면은 생성 이미지를 배경으로 쓰고, 제목·목표·시작 버튼·생산량·정답 수·매스몬 카드처럼 매 판 달라지거나 클릭이 필요한 요소는 HTML로 얹습니다. 설명 화면과 문제 화면은 생성 이미지 0 공장 배경 위에 HTML/CSS 컨베이어 보드를 올려 `핵심 곱 -> 0 스티커 -> 완성 수`가 바로 보이게 했습니다. 성공 결과와 다시하기 결과는 서로 다른 RasterStage 배경을 사용합니다. 결과 화면의 매스몬 카드에는 작은 도감 진행 줄을 넣어 이번 판에서 얻은 매스몬 위치를 보여 줍니다.

## 파일 구성

- `index.html`: 게임 본문
- `cover-generated.webp`: 첫 화면 RasterStage 배경
- `factory-conveyor-generated.webp`: 문제 화면 0 공장 배경
- `result-*-generated.webp`: 출하 등급별 결과 RasterStage 배경
- `eduitit-logo-mark.png`: 에듀잇티 로고
- `mathmon-*.png`: 공용 매스몬 도감 이미지 10종
- `screenshots/`: 화면별 스크린샷
- `REPORT.md`: 게임 설명, 화면 흐름, 보상 구조
