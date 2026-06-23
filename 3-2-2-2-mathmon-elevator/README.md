# 매스몬 엘리베이터

에듀잇티 수학 게임 시리즈 2단원 2차시입니다.

- 대상: 3학년 2학기 2단원 2차시
- 학습: 내림 있는 (두 자리)÷(한 자리)
- 문제: 십의 자리에서 남은 십을 일의 자리로 내려 계산하는 나눗셈 10문제 랜덤 출제
- 방식: `십의 자리 나누기 -> 남은 십 내리기 -> 일의 자리 나누기` 3단계 선택형
- 보상: 한 문제를 끝낼 때마다 엘리베이터 동력 이벤트가 1번 일어남
- 결과: 일반 층은 동력과 정답 수를 함께 측정해 지하 정비층 -> 1층 로비 -> 중간층 -> 전망층 -> 옥상 정원 중 도착 층을 보여 줌. 무지개 동력을 얻으면 정답 수와 관계없이 꼭대기 전망대가 열림
- 실행: `index.html`을 브라우저에서 열기

## 설계 의도

`매스몬 엘리베이터`는 내림 있는 나눗셈에서 가장 중요한 장면인 `남은 십을 일의 자리로 내려 합치기`를 엘리베이터가 한 층 내려가는 행동으로 연결합니다.

예를 들어 `52 ÷ 4`는 `5 ÷ 4 = 1, 남은 1십`, `1십 + 2 = 12`, `12 ÷ 4 = 3` 순서로 풀어 최종 몫 `13`을 완성합니다. 선택지에는 `일의 자리만 2`처럼 남은 십을 빠뜨리는 대표 오답을 넣어, 학생이 내림의 의미를 반복해서 확인하게 했습니다.

보상은 `엘리베이터 동력` 하나로만 유지합니다. 문제 안에서 한 번이라도 틀리면 정전 이벤트로 처리해 일부러 틀려 보상을 노리는 흐름을 막습니다. 결과는 도감 수집이 아니라 한 판에서 도착한 층 자체가 보상입니다.

## 화면

스크린샷은 `screenshots/` 폴더에 저장합니다.

## RasterStage 이미지

- `cover-generated.png/webp`: 첫 화면 표지 16:10 RasterStage
- `board-shaft-generated.png/webp`: 설명/문제 화면 엘리베이터 샤프트 16:10 RasterStage
- `reward-events-sprite-generated.png`: 보상 이벤트 3×2 스프라이트(가속 모터, 슈퍼 모터, 정전, 멈춤, 급행 운행, 무지개 동력)
- `result-basement-generated.png/webp`: 지하 정비층 결과 16:10 RasterStage
- `result-first-generated.png/webp`: 1층 로비 결과 16:10 RasterStage
- `result-middle-generated.png/webp`: 중간층 결과 16:10 RasterStage
- `result-view-generated.png/webp`: 전망층 결과 16:10 RasterStage
- `result-roof-generated.png/webp`: 옥상 정원 결과 16:10 RasterStage
- `result-rainbow-generated.png/webp`: 꼭대기 전망대 결과 16:10 RasterStage
- `result-retry-generated.png/webp`: 다시 준비 결과 16:10 RasterStage

첫 화면과 결과 화면은 생성 이미지를 RasterStage 배경으로 쓰고, 제목·한 줄 목표·시작 버튼·동력·정답 수·도착 층처럼 매 판 달라지는 값은 HTML로 얹습니다. 결과 화면은 도착 층별 배경을 동적으로 교체하며, 실패 결과는 축하 무대가 아니라 안전하게 다시 준비하는 장면으로 분리했습니다. 생성 이미지에는 텍스트와 숫자를 넣지 않았습니다.

문제 화면은 생성 이미지 샤프트 배경 위에 HTML/CSS 나눗셈 보드와 동적 엘리베이터를 올립니다. 십의 자리 몫, 남은 십, 내린 수, 일의 자리 몫은 학생의 선택에 따라 채워집니다.

## 작업실 파일 구성

- `index.html`: 게임 본문
- `cover-generated.webp`: 첫 화면 표지
- `board-shaft-generated.webp`: 설명/문제 화면 배경
- `reward-events-sprite-generated.png`: 보상 이벤트 스프라이트
- `result-*-generated.webp`: 결과 화면 등급별 배경
- `eduitit-logo-mark.png`: 에듀잇티 로고
- `screenshots/`: 화면별 스크린샷
- `REPORT.md`: 게임 설명, 화면 흐름, 보상 구조

학생용 static 사본에는 실행에 필요한 `index.html`, WebP 배경, 로고, 문서만 복사합니다. PNG 원본과 `screenshots/`는 작업실에 보관합니다.
