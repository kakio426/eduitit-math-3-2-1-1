# 매스몬 원 무늬 디자이너 제작 보고 (3-2-3-4) ★ 단원 정점

## 한 일

- `3-2-3-1-mathmon-target-hit`(라벨형 후보 스캐폴드)를 복제해 원 무늬 배치 도메인으로 개조했습니다.
- 보상 룰렛·결과 측정·등급 트랙·오디오·Stage/소리 계약·`handleStepChoice`·`highlightCandidate`는 그대로 재사용하고 라벨을 무늬 테마로 바꿨습니다.

## 핵심 구현

- 문제 생성: `buildProblems`(10문제) → `buildPatternProblem()`.
  - 반지름 14~18, 간격 2r+12~18, 놓인 원 2~3개. 후보 4종: 정답·far·off·big.
  - 정답 정확히 1개, 후보 4개 distinct 라벨, 모두 보드 범위 안(20000회 검증).
- SVG 보드: `drawPatternBoard` + `candCircle` — 놓인 원(파랑 채움) + 후보 링(점선 가나다라) + 안내선. `.cand-ring` 하이라이트 CSS 추가(정답 민트/오답 로즈).
- 단계: `buildSteps`(1단계, 규칙 안내 지시문). `handleStepChoice`/`buildStepOptions`는 3-1 라벨형 그대로 재사용.

## 검증

- `node scripts/check-stage-ratio.mjs` → OK(12 packages, 3단원 4차시 전부 포함).
- 인라인 JS `node --check` 통과.
- 로직 시뮬 20000회: 정답 1개·후보 4개 distinct·보드 안.
- 브라우저(프리뷰): 첫 화면(테마 제목) → 문제(놓인 원·후보 링·가나다라 선택지) 렌더 확인. 보드를 380×238로 넓혀 원이 잘 보임.

## 동적 HTML 오버레이 범위

- 문제 화면 무늬(SVG), 가나다라 선택지, 한 줄 지시, 좌측 무늬 점수 미터·등급 트랙, 결과 점수·등급·칭찬·다시하기 모두 HTML/JS로 갱신.

## 남은 일 (이미지 도구 보유 세션)

- 생성형 자산: cover-generated.webp, title-logo-generated.webp(한글 철자 검수), result-{dot,small,pattern,big,design,rainbow}-generated.webp, circle-pack 매스몬 동행 1종.
- 자산 연결 후 첫 화면을 generated-title-overlay 표준으로 승격, 결과 래스터를 등급 이미지로 교체.
- 좌측 점수 패널 레거시 캡슐 비주얼을 무늬 소품으로 교체.
- 스크린샷은 자산 연결 후 최종본 촬영.
