# 게임명

에듀잇티 수학 게임 시리즈 차시 패키지입니다.

- 대상:
- 학습:
- 문제:
- 보상:
- 실행: `index.html`을 브라우저에서 열기

## 화면

스크린샷을 `screenshots/` 폴더에 넣습니다.

새 차시는 `SERIES_CONTRACT.md`와 `LESSON_COMMONS.md`의 현재 화면 계약을 따릅니다. 첫 화면은 `generated-title-overlay`와 생성형 시작 버튼 자산(`data-cover-start-standard="generated-button-art"`)을 목표 표준으로 삼고, 기존 `.primary-button` 시작은 이전 차시 compatibility 상태로만 둡니다.

결과 화면은 generated-result와 `fullscene-score-slot` 규칙을 유지합니다. 고정 라벨·칭찬·버튼 장식은 생성형 결과 자산이 맡고, HTML은 실제 점수처럼 매 판 달라지는 값과 접근성 hitbox만 맡습니다.

## 파일 구성

- `index.html`: 게임 본문
- `REPORT.md`: 게임 설명 보고서
- `screenshots/`: 화면별 스크린샷
