# 매스몬 별 줍기

에듀잇티 수학 게임 시리즈 3학년 2학기 2단원 3차시 패키지입니다.

- 대상: 3학년 2학기 수학
- 학습: 나머지가 있는 나눗셈에서 몫과 나머지를 구하고, 나머지가 나누는 수보다 작다는 뜻을 익힙니다.
- 문제: `(몇십몇) ÷ (몇) = 몫 ... 나머지`, 나머지 0 제외, 한 판 10문제
- 보상: 정답 문제는 별빛이 무작위로 변하고, 정답으로 확인한 나머지 별은 결과에서 보너스 별빛으로 더해집니다.
- 실행: `index.html`을 브라우저에서 열기

## 화면

```text
첫 화면 -> 설명 화면 -> 문제 풀이 -> 보상 -> 결과
```

- 첫 화면: `cover-generated.webp` 위에 제목, 한 줄 목표, 시작 버튼을 HTML로 얹습니다.
- 설명 화면: 몫 고르기, 나머지 고르기, 검산 보기의 3단계를 짧게 보여 줍니다.
- 문제 화면: `board-night.webp` 배경 위에서 몫 선택, 나머지 선택, 검산 자동 확인을 진행합니다.
- 보상 화면: `star.webp`를 중심 보상으로 사용하며 유성우, 구름, 깜깜, 별똥별, 무지개 별 이벤트를 HTML/CSS로 표시합니다. 오답 문제의 나머지는 확인 문구로만 보여 주고 등급 점수에는 더하지 않습니다.
- 결과 화면: `result-stage.webp`와 등급별 `result-star-*.webp`를 사용하고 최종 별빛, 정답 수, 등급은 HTML 오버레이로 표시합니다. 플레이 중에는 최종 숫자 별빛을 공개하지 않습니다.

## 파일 구성

- `index.html`: 학생용 단일 HTML 게임
- `PLAN.md`: 차시 제작 계획
- `REPORT.md`: 설계 및 검증 보고서
- `screenshots/`: 화면별 스크린샷
- `cover-generated.png/webp`, `tutorial-generated.png/webp`, `board-night.png/webp`, `result-stage.png/webp`: RasterStage 배경
- `star.png/webp`, `result-star-*.png/webp`: 보상 및 결과 등급 이미지
- `eduitit-logo-mark.png`, `mathmon-8-unicornmon.webp`: 공용 로고와 base-pack 매스몬 동행 캐릭터
