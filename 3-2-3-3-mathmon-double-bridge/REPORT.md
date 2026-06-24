# 매스몬 두 배 다리 제작 보고 (3-2-3-3)

## 한 일

- `3-2-3-2-mathmon-compass-ring`(숫자 선택 스캐폴드)를 복제해 두 배/반 변환 도메인으로 개조했습니다.
- 보상 룰렛·결과 측정·등급 트랙·오디오·Stage/소리 계약은 그대로 재사용하고 라벨을 다리 테마로 바꿨습니다.

## 핵심 구현

- 문제 생성: `buildProblems`(10문제) → `buildDoubleProblem()`.
  - 방향 랜덤(반지름→지름 ×2 / 지름→반지름 ÷2). 정답 + 핵심 오답(두 배 잊음 r / 반 안 나눔 2r) + 근접.
  - 작은 값에서 보기 겹침 → 채움 로직으로 4개 distinct 보장(버그 수정 후 20000회 검증).
- SVG 보드: `drawBridge` — 위(반지름)·아래(지름=반지름 두 칸+divider). 주어진 칸 채움, 묻는 칸 점선+"?". "반지름×2=지름?"/"지름÷2=반지름?" 안내.
- 질문문/지시문/해설은 방향(`problem.ask`)에 따라 분기.

## 검증

- `node scripts/check-stage-ratio.mjs` → OK(11 packages).
- 인라인 JS `node --check` 통과.
- 로직 시뮬 20000회: 항등(지름=반지름×2) 성립, 4개 distinct, 정답·핵심 오답 항상 포함.
- 브라우저(프리뷰): 첫 화면 → 문제(두 배 다리·cm 선택지) 렌더 확인. 점선 지름 칸과 divider로 두 배 관계가 보임.

## 동적 HTML 오버레이 범위

- 문제 화면 다리(SVG), cm 선택지, 한 줄 지시, 좌측 다리 점수 미터·등급 트랙, 결과 점수·등급·칭찬·다시하기 모두 HTML/JS로 갱신.

## 남은 일 (이미지 도구 보유 세션)

- 생성형 자산: cover-generated.webp, title-logo-generated.webp(한글 철자 검수), result-{log,small,bridge,big,grand,rainbow}-generated.webp, circle-pack 매스몬 동행 1종.
- 자산 연결 후 첫 화면을 generated-title-overlay 표준으로 승격, 결과 래스터를 등급 이미지로 교체.
- 좌측 점수 패널 레거시 캡슐 비주얼을 다리 소품으로 교체.
- 스크린샷은 자산 연결 후 최종본 촬영.
