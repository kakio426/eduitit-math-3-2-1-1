# 매스몬 컴퍼스 마법진 제작 보고 (3-2-3-2)

## 한 일

- `3-2-3-1-mathmon-target-hit`(도형 선택 스캐폴드)를 복제해 컴퍼스/눈금 도메인으로 개조했습니다.
- 보상 룰렛·결과 측정·등급 트랙·오디오·Stage/소리 계약은 그대로 재사용하고 라벨을 마법진 테마로 바꿨습니다.

## 핵심 구현

- 문제 생성: `buildProblems`(반지름 2~6cm 10문제) → `buildCompassProblem(radius)`.
  - 정답 = 반지름, 보기 = 반지름·지름(2r) 함정·근접 오답(±1/±2), 4개 distinct.
- SVG 보드: `drawCompassRuler` — 눈금(0~12cm) + 컴퍼스 V(0→r) + "반지름 r cm" 밴드. viewBox 320×200, 가로형으로 보드를 넓힘.
- 단계: `buildSteps`(1단계), `renderStep`(보드+cm 선택지), `buildStepOptions`(값 오름차순), `handleStepChoice`(정답 비교, 공개 시 "정답은 r cm").
- 3-1의 점/선분 후보 렌더(`candSvg`/`labelPos` 등)는 제거하고 `highlightCandidate`는 no-op.

## 검증

- `node scripts/check-stage-ratio.mjs` → OK(10 packages).
- 인라인 JS `node --check` 통과.
- 로직 시뮬(5000회): 정답(반지름)과 지름 함정(2r)이 항상 보기에 포함, 4개 distinct.
- 브라우저(프리뷰): 첫 화면 → 문제(눈금·컴퍼스·cm 선택지) 렌더 확인. 컴퍼스 벌림이 반지름과 일치하게 그려짐.

## 동적 HTML 오버레이 범위

- 문제 화면 눈금·컴퍼스(SVG), cm 선택지, 한 줄 지시, 좌측 마법진 점수 미터·등급 트랙, 결과 점수·등급·칭찬·다시하기 모두 HTML/JS로 갱신.

## 남은 일 (이미지 도구 보유 세션)

- 생성형 자산: cover-generated.webp, title-logo-generated.webp(한글 철자 검수), result-{faint,small,ring,big,grand,legend}-generated.webp, circle-pack 매스몬 동행 1종.
- 자산 연결 후 첫 화면을 generated-title-overlay 표준으로 승격, 결과 래스터를 등급 이미지로 교체.
- 좌측 점수 패널 레거시 캡슐 비주얼을 마법진 소품으로 교체.
- 스크린샷은 자산 연결 후 최종본 촬영.
