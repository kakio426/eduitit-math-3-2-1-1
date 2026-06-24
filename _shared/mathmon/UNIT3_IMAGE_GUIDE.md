# 3단원 「원」 이미지 자산 안내 (생성 도구 보유 세션용)

> 작성 기준: 3단원 4차시(3-2-3-1~4)는 **코드·SVG·문서·등록·검증까지 완료**됐고, 현재 임시 텍스트 커버 + 등급 색 카드로 동작한다.
> 이 문서는 **이미지 생성 도구(GPT Image 등)를 가진 세션이 만들면 되는 자산**과 연결 절차만 정리한다.
> 생성·후처리·연결의 단일 공정 기준은 `eduitit-mathmon-lesson` 스킬과 `eduitit-mathmon-assets` 스킬, `MATHMON_ASSET_CONTRACT.md`다.

문제 화면 도형(표적 원·눈금·컴퍼스·다리·무늬)은 전부 **SVG라서 이미지가 필요 없다.** 생성 자산은 **커버·제목 아트·결과 등급·매스몬 동행**뿐이다.

---

## 0. 먼저: 3단원 전용 매스몬 팩 `circle-pack` 생성 (사용자 선택)

`eduitit-mathmon-assets` 스킬 절차대로 진행한다. 시작 전 `MATHMON_ASSET_CONTRACT.md`·`catalog.json`·`STYLE_GUIDE.md`·`base-pack/manifest.json`·base-pack contact sheet를 읽어 실루엣 중복을 피한다.

- 팩 위치: `_shared/mathmon/circle-pack/`(`manifest.json`, `raw-chromakey/`, `png/`, `webp/`, `contact-sheets/`)
- 스타일: `mathmon-v1-anime-sticker`(1차시 밝은 2D 애니/스티커 톤), 본체는 **동물/판타지 생물**, 도형 테마는 **소품·의상·배지·포즈로만**(컴퍼스·과녁을 몸으로 만들지 않음)
- 생성: flat chroma-key → 투명 `768×768` PNG → WebP(82~86) → contact sheet
- 등록: 팩 `manifest.json` + `catalog.json` 새 팩(`usedBy: ["3-2-3-1","3-2-3-2","3-2-3-3","3-2-3-4"]`, `avoidOverlapWith: ["base-pack"]`)
- 4종(차시별 1마리) 콘셉트 제안:
  - 3-1 표적: 과녁 배지/조준 포즈를 두른 동물
  - 3-2 마법진: 마법진 룬을 두른 신비 생물
  - 3-3 두 배 다리: 다리 멜빵/두 배 모티프 동물
  - 3-4 무늬(정점): 원 무늬 망토를 두른 화려한 동물
- 차시 연결: 각 차시 `assets/mathmon/circle-pack/`에 **그 차시 WebP만** 복사(원본 PNG는 `_shared/mathmon/`에만 보관)

> base-pack 빈자리(0 알몬·1 삐약몬·4 사자몬·6 드래곤몬·7 티라노몬)는 이번엔 쓰지 않고 예비로 남긴다. 재사용을 원하면 새 팩 없이 그 5종 중 4종을 동행으로 연결해도 된다.

---

## 1. 차시별 생성 이미지 (파일명 그대로 만들면 코드가 바로 인식)

각 차시 폴더(`3-2-3-N-...`)에 아래 WebP를 넣는다. PNG 원본은 작업실에 보관, 배포는 WebP(quality 82~86).

### 공통(4차시 동일 형식)
- `cover-generated.webp` — **글자 없는** 대표 장면 배경(16:10 권장, Stage에서 `object-fit: cover`)
- 제목 타이틀 아트 3종: `title-logo-source.png`(또는 `title-logo-chromakey.png`) → `title-logo-generated.png`(투명) → `title-logo-generated.webp`
  - GPT Image 조건: `standalone title/logo asset`, `exact Korean text`, `no full scene`, `flat chroma-key background`. **한글 철자 캡처 검수 필수.**
- 결과 무대/등급 래스터: 아래 표의 6개 파일

### 차시별 제목 문구 & 결과 등급 파일명

| 차시 | 폴더 | 제목(한글, 철자 정확히) | 결과 등급 이미지 6개 |
|---|---|---|---|
| 3-1 | `3-2-3-1-mathmon-target-hit` | 매스몬 표적 맞히기 | `result-miss` / `result-edge` / `result-hit` / `result-bullseye` / `result-targetking` / `result-legend` |
| 3-2 | `3-2-3-2-mathmon-compass-ring` | 매스몬 컴퍼스 마법진 | `result-faint` / `result-small` / `result-ring` / `result-big` / `result-grand` / `result-legend` |
| 3-3 | `3-2-3-3-mathmon-double-bridge` | 매스몬 두 배 다리 | `result-log` / `result-small` / `result-bridge` / `result-big` / `result-grand` / `result-rainbow` |
| 3-4 | `3-2-3-4-mathmon-circle-pattern` | 매스몬 원 무늬 디자이너 | `result-dot` / `result-small` / `result-pattern` / `result-big` / `result-design` / `result-rainbow` |

> 결과 등급 파일은 위 이름 뒤에 `-generated.webp`를 붙인다(예: `result-hit-generated.webp`). 코드의 `DESTINATIONS[].image`와 정확히 일치한다.
> 등급 그림은 점수가 낮은 쪽→높은 쪽으로 점점 화려해지게, 마지막(legend/rainbow)은 secret 최고 등급으로 가장 보기 힘든 톤.

---

## 2. 생성 후 연결 절차 (차시마다)

1. 위 파일들을 차시 폴더에 넣는다(매스몬 WebP는 `assets/mathmon/circle-pack/`).
2. **첫 화면을 표준으로 승격**: `index.html`의 `<main class="game">`에 `data-cover-standard="generated-title-overlay"`를 다시 붙이고, 현재 임시 커버(`.cover-title-text` 텍스트 제목 + `.cover-target` 도형)를 아래 표준 구조로 교체한다.
   - `<img class="raster-bg" src="cover-generated.webp" alt="">`(object-fit: cover)
   - `<h1 class="visually-hidden" id="coverTitle">게임명</h1>` + `<img class="hero-title-art" src="title-logo-generated.webp" alt="" aria-hidden="true">`
   - 한 줄 목표 + `<button class="primary-button" id="startButton">시작</button>`(190×72)
   - 참고 표본: `3-2-1-2-mathmon-rocket-charge`, `3-2-1-3-mathmon-zero-factory`의 커버.
3. **결과 래스터 연결**: 결과 화면은 이미 `el.resultRaster.src = destination.image`로 등급 이미지를 불러온다. 파일만 있으면 자동 표시(현재는 없어서 `onerror`로 숨김 처리됨).
4. **매스몬 동행 오버레이**: 커버/결과의 `.cover-visual`/결과 무대에 `assets/mathmon/circle-pack/<파일>.webp`를 `<img>`로 얹는다. **2단원 교훈 — 생성 래스터에는 동행 캐릭터를 굽지 말고**, 배경만 만들고 매스몬은 오버레이로 올려 **한 마리만** 보이게.
5. **좌측 점수 패널** 레거시 캡슐 비주얼(로켓 잔재)을 차시 소품(과녁/마법진/다리/무늬)으로 교체(선택).
6. `node scripts/check-stage-ratio.mjs` 통과 확인(표준 커버 승격 후 커버 검사 항목이 활성화됨 — 제목 원본 3종 파일이 있어야 통과).
7. 스크린샷 촬영: 각 차시 `screenshots/`에 첫·설명·문제·보상·결과(1280×800, 태블릿 가로) 저장.
8. `README.md`/`REPORT.md`의 "자산 상태 (TODO)"를 완료로 갱신.

---

## 3. 완료 기준 (검수)

- [ ] 각 차시 cover·result에 매스몬이 **한 마리만**(베이크 캐릭터 겹침 없음), 본체는 동물/판타지.
- [ ] 첫 화면이 `generated-title-overlay` 표준(글자 없는 배경 + 제목 아트 + HTML 목표/시작 버튼). 한글 철자 캡처 정확.
- [ ] 제목 원본(`title-logo-source.png`/`-chromakey.png`) + 투명 PNG + WebP 3종 보관.
- [ ] 결과 등급 6장이 점수대로 표시되고 WebP 200 로드.
- [ ] `node scripts/check-stage-ratio.mjs` 통과.
- [ ] `catalog.json`에 `circle-pack` 등록(또는 base-pack 재사용 시 `usedBy` 갱신).
- [ ] 각 차시 `screenshots/` 5장 + 문서 자산 상태 갱신.

## 참고
- 표본 커버/제목 아트: `3-2-1-2-mathmon-rocket-charge`(cover-mathmon + title-poster), `3-2-1-3-mathmon-zero-factory`(title-logo 3종).
- 매스몬 자산 공정: `.claude/skills/eduitit-mathmon-assets/SKILL.md`, `_shared/mathmon/MATHMON_ASSET_CONTRACT.md`, `_shared/mathmon/STYLE_GUIDE.md`.
