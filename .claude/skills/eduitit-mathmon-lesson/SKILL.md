---
name: eduitit-mathmon-lesson
description: "Use when building, planning, or extending an Eduitit 매스몬 math game 차시(lesson) single-HTML package in the `ai mart` workspace — triggers like 차시 만들어, 새 게임 만들어, N단원 N차시 제작, 게임 빌드, 매스몬 게임 추가."
---

# Eduitit 매스몬 차시 빌더

`/Users/yubyeongju/ai mart` 작업실에서 매스몬 수학 게임 한 차시를 **단일 실행 HTML 패키지**로 만들거나 확장할 때 따르는 절차다. 이 스킬은 "어떻게 만드는가(공정)"를 담는다. "왜·무엇을(정체성·철학·로드맵)"은 작업실의 `AGENTS.md`와 `CLAUDE.md`가 같은 내용으로 공유하는 루트 하네스 문서가 단일 기준이다.

## 이 스킬을 쓰는 때

- 새 차시(`3-2-<단원>-<차시>-<영문짧은이름>`) 게임을 만든다.
- 기존 차시의 화면·문제·보상을 크게 바꾼다.
- 차시 상세 계획(`PLAN.md`)을 세운다.
- 트리거: `차시 만들어`, `새 게임 만들어`, `N단원 N차시 제작`, `게임 빌드`, `매스몬 게임 추가`.

teacher-facing SaaS·관리자 화면에는 적용하지 않는다(그건 `eduitit-service-polish`). 배포/푸시는 `eduitit-main-release`를 함께 쓴다.

## 시작할 때 선언

- 적용 스킬: `eduitit-mathmon-lesson`.
- 대상 차시: 학년-학기-단원-차시, 게임명(매스몬으로 시작), 배움주제, 성취기준.
- 복제 기준 파일(보통 `3-2-1-2-mathmon-rocket-charge/index.html` = 최신 엔진).
- 건드리지 않을 범위(다른 차시·단원, 학생 화면 외 서비스).

## 절대 규칙 (루트 하네스 문서 「핵심 설계 철학」 강제)

매 차시는 아래를 모두 만족해야 한다. 하나라도 "아니오"면 설계를 고친다.

1. **계산 = 행동의 도구**: 문제 → 보상 → 결과. 계산은 예측 가능, 보상은 예측 불가능.
2. **무작위성 유지**: 랜덤 보상은 빼지 않는다(기대감+긴장감 동반).
3. **정답 ≠ 전부**: 최고 등급은 얻기 어렵게. 정답은 유리하되 유일한 통로 아님. 빈손 금지 + 운으로 도약 가능.
4. **"다음엔 더 멀리"**: 차시 자체 완결형 등급 결과로 재도전 동기를 만든다(도감 없음 — 모아두는 백엔드 만들지 않음).
5. 학생 화면에 `AI Mart` 등 내부 용어 노출 금지. 게임 제목은 **매스몬**으로 시작.
6. **문제 화면 과밀 금지**: 초3 학생이 3초 안에 현재 할 일을 말할 수 있어야 한다. 기본 문제 화면은 큰 문제·현재 단계 조작판·한 줄 지시문·선택지만 남긴다.

## 빌드 파이프라인

1. **계획**: 해당 차시 폴더에 `PLAN.md`를 먼저 쓴다 → `references/plan-template.md`.
2. **폴더**: `_templates/lesson-package`를 `3-2-<단원>-<차시>-<영문짧은이름>`으로 복사.
3. **자산**: `_shared/`에서 `eduitit-logo-mark.png`와 필요한 배포용 자산만 복사. 매스몬은 반드시 `_shared/mathmon/catalog.json`과 `_shared/mathmon/STYLE_GUIDE.md`를 먼저 확인하고, 새 매스몬은 `_shared/mathmon/<pack-id>/`에 원본 등록 후 차시 폴더에는 WebP 배포본만 복사한다(10종 전부 복사 불필요 — 도감 없음).
4. **엔진 복제**: 최신 기준 차시(`3-2-1-2-...`)의 `index.html`을 복제해 개조. 재사용 함수 맵 → `references/engine-and-images.md`.
5. **개조 3종만**: ① 문제 생성기 ② 보상/등급 라벨 ③ 테마 이미지. 점수·콤보·단계선택·등급 뼈대는 그대로.
6. **이미지**: 필요한 RasterStage 이미지를 생성하고 WebP로 배포 변환 → `references/engine-and-images.md`.
7. **문서**: `README.md`, `REPORT.md` 작성, `screenshots/`에 첫·설명·문제·보상·결과 화면 저장.
8. **등록**: `manifest.json`에 차시 추가, 루트 `README.md` 시리즈 표에 행 추가.
9. **화면 계약 대조**: `SERIES_CONTRACT.md`와 한 줄씩 대조(첫 화면 3요소·배지 위치·중심 보상 1개·문제 화면 과밀 금지).
10. **문제 화면 3초 검사**: 문제 화면 스크린샷에서 학생이 볼 기본 요소가 큰 문제·현재 단계·한 줄 지시·선택지뿐인지 확인하고, 설명 패널이 많으면 줄인다.
11. **Stage 비율 검사**: 모든 `index.html`이 `16:10`/`1280×800` 계약을 지키는지 루트에서 `node scripts/check-stage-ratio.mjs` 실행.
12. **검증·배포**: `references/verification.md` 통과 → 배포는 `eduitit-main-release` + GitHub Pages, 공개 URL `curl -I -L` 200 확인.

## 화면 골격 (모든 차시 동일)

```text
첫 화면 → 설명 → 문제 풀이 → 보상 → 결과
```

세부 규칙은 `SERIES_CONTRACT.md`가 단일 기준. 첫 화면 3요소(제목·한 줄 목표·시작 버튼), 브랜드/단원/배움주제 배지 위치, 중심 보상 1개, 결과=차시 자체 완결형 등급은 고정.

## 문제 화면 과밀 금지 계약

- 문제 화면은 설명서가 아니라 **현재 한 단계의 수학 행동을 고르는 화면**이다.
- 기본으로 펼쳐 둘 수 있는 학습 요소는 `큰 문제`, `현재 단계 조작판`, `한 줄 지시문`, `선택지`뿐이다.
- 개념 설명판, 풀이 해설판, 힌트판, 계산 미리보기, 보상 상태판을 한 화면에 동시에 펼치지 않는다.
- 단계형 문제는 현재 단계만 크게 보여 주고, 이전 단계는 작은 완료 칩으로 접으며, 다음 단계는 `?` 또는 잠금 상태로 둔다.
- 원리는 긴 문장이 아니라 블록·칸·스티커·화살표·자리값 묶음 같은 시각 조작으로 보여 준다.
- 힌트는 기본으로 닫고, 열어도 지금 단계 힌트 1개만 보여 준다.
- 스크린샷을 보고 "문제보다 패널이 많다", "문장이 여러 줄이다", "무엇을 눌러야 할지 바로 안 보인다"면 완성하지 말고 즉시 덜어낸다.

## Stage 비율 계약

- 모든 차시는 `16:10` Stage, 기준 제작 크기 `1280×800`으로 만든다.
- 모든 `index.html`의 `<main class="game">`에는 `data-stage-ratio="16:10"`과 `data-stage-size="1280x800"`을 둔다.
- 기본 Stage CSS는 `.stage-shell`이 `width: min(1280px, calc((100dvh - 48px) * 1.6), 100%);`, `aspect-ratio: 16 / 10;`을 담당하고, `.screen`은 `position: absolute; inset: 0; width: 100%; height: 100%;`로 Stage를 채우게 한다.
- PC와 태블릿 가로에서는 Stage를 contain 방식으로 맞추고, 남는 영역은 바깥 배경 여백으로 처리한다.
- `소리` 같은 전역 조작 버튼은 Stage 밖에 fixed로 띄우지 말고 `.stage-shell` 안의 상단 오른쪽 보조 슬롯에 작게 둔다. `top-row`/`hud`는 그 공간만큼 비워 버튼이 배지·문제·선택지를 가리지 않게 한다.
- 새 차시를 만들거나 화면을 크게 고친 뒤에는 반드시 `node scripts/check-stage-ratio.mjs`를 통과시킨다.

## 성취기준 표기 주의

- 루트 로드맵 표의 성취기준 코드(`[4수0X-XX]`)는 2022 개정 3~4학년군 기준 안내용이다.
- 차시 문서(`README.md`/`REPORT.md`)에 코드를 박기 전 교육부 고시(제2022-33호) 수학과 원문과 한 번 더 대조한다.
- 단원·차시 묶음은 교과서마다 다를 수 있으니 학교 교과서가 정해지면 그 배열에 맞춘다.

## 단일 레포 원칙

- 별도 공개 레포를 만들지 않는다. 이 작업실 GitHub 레포지토리 하나를 원본이자 Pages 배포 기준으로 운영한다.
- 필요한 게임 폴더만 GitHub Pages artifact에 포함하고, 공개 URL은 `curl -I -L`로 `HTTP 200`을 확인한다.
- 작업실 원본은 PNG 보관, 학생용 `index.html`은 WebP 같은 경량 포맷을 우선 참조한다. 자세한 검증·배포는 `references/verification.md`와 `eduitit-main-release` 참고.

## 참고 파일

- `references/plan-template.md` — 차시 `PLAN.md` 템플릿(구조·화면 수·생성 이미지·검증).
- `references/lesson-prompts.md` — 24개 차시별 제작 프롬프트와 문제 화면 과밀 방지 공통 프롬프트.
- `references/engine-and-images.md` — 2차시 재사용 함수 맵 + RasterStage/WebP 이미지 패턴.
- `references/verification.md` — 빌드·배포 검증 체크리스트.
- `_shared/mathmon/STYLE_GUIDE.md` — 매스몬 팩 생성·중복 방지·이미지 분위기 기준.
