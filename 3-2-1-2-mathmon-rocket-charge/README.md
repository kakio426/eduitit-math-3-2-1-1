# 매스몬 로켓발사 대작전

에듀잇티 수학 게임 시리즈 2탄입니다.

- 대상: 3학년 2학기 1단원 2차시
- 학습: 받아올림 있는 세 자리 수 × 한 자리 수
- 문제: 자리올림이 1번 이상 생기는 곱셈 문제 10개 랜덤 출제
- 방식: 세로셈판에서 일의 자리 -> 십의 자리 -> 백의 자리 계산값을 차례로 고르는 3단계 선택형
- 보상: 한 문제를 끝낼 때마다 랜덤 연료 이벤트가 일어남
- 결과: 10문제가 끝나거나 즉시 발사 이벤트가 나오면 로켓 안 연료를 측정하고, 수성 -> 금성 -> 지구 -> 화성 -> 목성 -> 토성 -> 천왕성 -> 해왕성 중 어디까지 갈 수 있는지 보여 줌. 무지개 연료를 얻으면 안드로메다로 감. 연료가 0이면 로켓 점검 후 다시하기
- 실행: `index.html`을 브라우저에서 열기

## 설계 의도

`매스몬 로켓발사 대작전`은 받아올림 있는 곱셈을 세로셈 순서 그대로 연습하게 만듭니다. 학생은 일의 자리 계산값을 고르고, 10이 넘으면 화면 위쪽에 올림 수가 자동으로 써지는 것을 본 뒤, 십의 자리와 백의 자리를 차례대로 채웁니다.

한 문제를 끝낼 때마다 로켓 안 액체 연료에 일이 일어납니다. 보통은 연료가 들어가지만, 가끔은 많이 들어가거나, 조금 줄거나, 연료통이 비거나, 바로 발사되거나, 무지개 연료가 켜집니다. 문제 안에서 한 번이라도 틀리면 해당 문제는 연료 누수 이벤트로 처리합니다. 문제를 푸는 동안에는 연료 원점수를 전면에 두지 않고, 한 판이 끝난 뒤 연료량을 측정해 `수성`부터 `해왕성`까지 어디까지 갈 수 있는지를 결과로 보여 줍니다. 해왕성은 어려운 최상위 목표, 안드로메다는 해왕성보다 더 보기 힘든 secret stage로 두었습니다. 무지개 연료를 얻으면 일반 연료량보다 안드로메다 도착이 우선입니다. 첫 화면의 파란 매스몬 친구는 보상 카드가 아니라 로켓 발사를 함께하는 동행 주인공입니다.

## 화면

스크린샷은 `screenshots/` 폴더에 저장합니다.

- `01-cover.png`: 첫 화면
- `02-tutorial.png`: 설명 화면
- `03-problem.png`: 문제 화면
- `03-problem-hint.png`: 힌트 열린 문제 화면
- `04-reward.png`: 연료 이벤트 모달
- `05-result-success.png`: 도착 결과 화면
- `06-result-retry.png`: 다시하기 결과 화면
- `07-tablet-cover.png`: 태블릿 가로 첫 화면 참고

## RasterStage 이미지

- `cover-generated.png`: 첫 화면 생성 이미지 원본
- `cover-generated.webp`: 첫 화면 배포용 WebP
- `title-poster-source.png`: GPT Image로 생성한 첫 화면 제목 이미지 원본
- `title-poster-generated.png`: 초록 배경 제거 후 크롭한 첫 화면 제목 이미지
- `title-poster-generated.webp`: 첫 화면 제목 배포용 WebP
- `start-button-source.png`: 1차시 포스터형 버튼 물성을 참고해 별도로 생성한 첫 화면 시작 버튼 원본
- `start-button-generated.png`: 배경 제거 후 크롭한 포스터형 첫 화면 시작 버튼
- `start-button-generated.webp`: 첫 화면 시작 버튼 배포용 WebP
- `tutorial-generated.png`: 설명 화면 생성 이미지 원본
- `tutorial-generated.webp`: 설명 화면 배포용 WebP
- `rocket-charge-source.png`: 문제 화면 로켓 생성 이미지 원본
- `rocket-charge.png`: 배경 제거 후 크롭한 문제 화면 로켓
- `rocket-charge.webp`: 문제 화면 배포용 로켓
- `rocket-launchpad-generated.png`: 문제 화면 발사장 배경 생성 이미지 원본
- `rocket-launchpad-generated.webp`: 문제 화면 발사장 배경 배포용 WebP
- `reward-events-sprite-generated.png`: 연료 이벤트 모달용 3×2 생성 이미지 스프라이트
- `result-mercury-generated.png/webp`: 수성 도착 결과 화면
- `result-venus-generated.png/webp`: 금성 도착 결과 화면
- `result-earth-generated.png/webp`: 지구 도착 결과 화면
- `result-mars-generated.png/webp`: 화성 도착 결과 화면
- `result-jupiter-generated.png/webp`: 목성 도착 결과 화면
- `result-saturn-generated.png/webp`: 토성 도착 결과 화면
- `result-uranus-generated.png/webp`: 천왕성 도착 결과 화면
- `result-neptune-generated.png/webp`: 해왕성 도착 결과 화면
- `result-andromeda-generated.png/webp`: 안드로메다 도착 결과 화면
- `result-retry-generated.png`: 다시하기 결과 화면 생성 이미지 원본
- `result-retry-generated.webp`: 다시하기 결과 화면 배포용 WebP

첫 화면과 결과 화면은 생성 이미지를 배경으로 씁니다. 첫 화면 제목은 GPT Image로 만든 별도 자산을 배경 위에 얹고, 시작 버튼은 1차시 포스터형 버튼 물성을 참고해 별도로 생성한 두툼한 노란 래스터 버튼 자산으로 보여 줍니다. 실제 클릭은 같은 위치의 HTML 버튼이 맡습니다. 한 줄 목표와 결과 화면의 연료 측정값·정답 수처럼 매 판 달라지는 값도 HTML로 얹습니다. 결과 이미지는 텍스트 없이 로켓, 매스몬, 도착 장소만 담습니다. 문제 화면은 생성 이미지 발사장을 배경으로 깔고 기존 로켓 이미지를 얹습니다. 배터리 창 안쪽 액체 연료, 바닥 링, 증기, 신호등, 빛줄기 효과는 HTML/CSS 레이어로 얹어 연료량에 따라 반응하게 했습니다. 문제 계산은 왼쪽 세로셈판을 중심으로 보이게 하고, 오른쪽 보조식은 기본으로 숨긴 뒤 `힌트` 버튼을 눌렀을 때만 보여 줍니다. 연료 이벤트 모달은 6개 상황을 담은 스프라이트 이미지를 배경으로 쓰고, `연료 +6`, `연료 -12`, `연료 0`, `발사!`, `무지개!` 같은 짧은 값만 HTML로 얹습니다.

효과음은 Kenney CC0 샘플 WAV를 `assets/audio/`에 둡니다. 사용 팩은 Interface Sounds, Sci-fi Sounds, Digital Audio, Music Jingles입니다. 낮은 우주 BGM은 기존 WebAudio 루프로 유지하고, 시작, 정답, 오답, 자리값 확인, 연료 이벤트, 측정, 결과 공개 효과음만 샘플로 재생합니다.

## 파일 구성

- `index.html`: 게임 본문
- `cover-generated.webp`: 첫 화면 RasterStage 배경
- `title-poster-generated.webp`: 첫 화면 제목 타이틀 아트
- `tutorial-generated.webp`: 설명 화면 RasterStage 배경
- `rocket-charge.webp`: 문제 화면 로켓 이미지
- `rocket-launchpad-generated.webp`: 문제 화면 발사장 배경
- `reward-events-sprite-generated.png`: 연료 이벤트 모달 스프라이트
- `result-*-generated.webp`: 도착지별 결과 RasterStage 배경 9장
- `result-retry-generated.webp`: 다시하기 RasterStage 배경
- `eduitit-logo-mark.png`: 에듀잇티 로고
- `assets/mathmon/base-pack/*.webp`: 1차시 기준 공용 매스몬 동행 이미지
- `assets/audio/*.wav`: Kenney CC0 기반 버튼, 정답, 오답, 연료, 측정, 결과 효과음
- `screenshots/`: 화면별 스크린샷
- `REPORT.md`: 게임 설명, 화면 흐름, 보상 구조
