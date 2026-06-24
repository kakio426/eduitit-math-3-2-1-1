# 매스몬 표적 맞히기 제작 보고 (3-2-3-1)

## 한 일

- `3-2-1-2-mathmon-rocket-charge`(최신 엔진)를 복제해 **시리즈 최초 도형 차시**로 개조했습니다.
- 산술 세로셈 보드/단계 엔진을 **원 SVG 도형 + 1단계 요소 선택**으로 교체했습니다.
- 보상 룰렛(5종)·결과 측정·등급 트랙·정답 수 게이트·오디오·Stage/소리 계약은 그대로 재사용하고 라벨만 표적 테마로 바꿨습니다.

## 핵심 구현

- 문제 생성: `buildProblems`(세 용어 균형 10문제) → `buildCircleProblem(term)`.
  - 320×320 viewBox, 중심(160,160) 반지름 120, `pointAt(각도)`로 테두리 점.
  - 후보 4개에 가·나·다·라 배정, 정답 정확히 1개(`buildCircleProblem` 검증 스크립트 통과).
- SVG 렌더: `drawTargetDiagram` + `candSvg`(점/선분) + `segLabelPos`(선분 라벨을 중심에서 떨어뜨려 겹침 방지) + `highlightCandidate`(정답 민트/오답 로즈).
- 단계 엔진: `buildSteps`(1단계), `renderStep`(보드+선택지), `handleStepChoice`(하이라이트+공개), `completeStep`(스텝 길이 기반 종료). 산술 전용 함수(updateStepChips/updateCurrentAnswerCell/applyStepToBoard/triggerStepEffect)는 no-op 처리.

## 검증

- `node scripts/check-stage-ratio.mjs` → OK(9 packages).
- 인라인 JS `node --check` 통과.
- 로직 시뮬레이션: 세 용어 × 2000회 모두 정답 1개 + 핵심 오답(지름→radius, 반지름→diameter) 포함.
- 브라우저(프리뷰): 첫 화면·문제(원 그림+선택지)·보상 팝업·결과 등급 전 흐름 렌더 확인. 원 그림이 보드 안에 들어맞고 후보 라벨이 겹치지 않음.

## 동적 HTML 오버레이 범위

- 문제 화면 원 그림(SVG), 선택지, 한 줄 지시문, 진행도, 좌측 표적 점수 미터·등급 트랙, 결과 점수·등급·칭찬·다시하기는 모두 HTML/JS로 매 판 갱신.

## 남은 일 (이미지 도구 보유 세션)

- 생성형 자산: `cover-generated.webp`(글자 없는 배경) + `title-logo-generated.webp`(제목 아트, 한글 철자 검수) + `result-{miss,edge,hit,bullseye,targetking,legend}-generated.webp` + `circle-pack` 매스몬 동행 1종.
- 자산 연결 후 첫 화면을 `data-cover-standard="generated-title-overlay"` 표준으로 승격하고 결과 래스터를 등급 이미지로 교체.
- 좌측 점수 패널의 레거시 캡슐 비주얼은 표적 소품으로 교체 예정.
- 스크린샷(첫·설명·문제·보상·결과)은 자산 연결 후 최종본으로 촬영.
