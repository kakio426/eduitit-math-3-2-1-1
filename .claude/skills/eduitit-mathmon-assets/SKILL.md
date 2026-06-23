---
name: eduitit-mathmon-assets
description: "Use whenever creating, replacing, selecting, organizing, auditing, or integrating 매스몬 character assets, Mathmon packs, result cards, catalog.json, STYLE_GUIDE.md, or lesson Mathmon image references in the ai mart workspace."
---

# Eduitit 매스몬 자산 관리자

이 스킬은 매스몬 캐릭터 자산을 만들거나 바꾸거나 차시에 연결할 때 쓴다. 차시 전체를 만드는 공정은 `eduitit-mathmon-lesson`이고, 매스몬 이미지·팩·카탈로그·카드 자산은 이 스킬이 우선한다.

## 시작 규칙

매스몬 관련 작업이면 구현 전에 아래 파일을 먼저 읽는다.

1. `_shared/mathmon/MATHMON_ASSET_CONTRACT.md`
2. `_shared/mathmon/catalog.json`
3. `_shared/mathmon/STYLE_GUIDE.md`
4. 사용할 팩의 `manifest.json`
5. 사용할 팩의 `contact-sheets/*-contact-sheet.png`

읽지 않고 이미지 생성, HTML 참조 교체, 팩 추가, 차시 폴더 복사를 시작하지 않는다.

## 현재 기준

- 활성 스타일은 `mathmon-v1-anime-sticker`다.
- `base-pack`이 현재 실행 기준 팩이다.
- `zero-factory-pack`, `core-pack-v2`, `zero-factory-pack-v2`는 보존 팩이며 새 차시와 리마스터의 기본값으로 쓰지 않는다.
- 새 차시와 리마스터는 1차시 `매스몬 상자런`의 밝은 2D 애니/스티커형 매스몬 톤을 기본으로 쓴다.
- 차시별 전용 매스몬도 본체는 동물/판타지 생물이어야 하며, 차시 테마는 소품·의상·배지·포즈로만 표현한다.
- 원본은 `_shared/mathmon/`에만 둔다.
- 차시 폴더에는 실행용 WebP만 복사한다.

## 작업 절차

1. **현황 확인**: `catalog.json`, active/legacy 팩, contact sheet를 확인한다.
2. **재사용 판단**: 기존 active 팩으로 충분하면 새 이미지를 만들지 않는다.
3. **팩 추가**: 새 팩이 필요하면 `_shared/mathmon/<pack-id>/`에 `manifest.json`, `raw-chromakey/`, `png/`, `webp/`, `contact-sheets/`를 만든다.
4. **이미지 생성**: `STYLE_GUIDE.md`의 V1 프롬프트 기준으로 flat chroma-key 원본을 만들고 `raw-chromakey/`에 저장한다.
5. **후처리**: chroma-key 제거 → 투명 `768x768` PNG → WebP quality 82~86 → contact sheet 생성.
6. **등록**: 팩 `manifest.json`과 `_shared/mathmon/catalog.json`을 갱신한다.
7. **차시 연결**: 차시 폴더에는 필요한 WebP만 복사하고 `index.html`의 매스몬 참조를 그 경로로 바꾼다.
8. **검증**: JSON 파싱, 파일 개수, alpha, 레거시 실행 참조 제거, 로컬 200, 브라우저 이미지 로드를 확인한다.

## 금지

- 차시 폴더에만 새 매스몬을 생성하거나 저장하지 않는다.
- 원본 PNG, raw chroma-key, contact sheet를 차시 폴더에 복사하지 않는다.
- V2 팩을 새 차시에 기본값으로 쓰지 않는다.
- 톱니바퀴, 자석, 상자, 컨베이어 같은 사물 자체를 매스몬 몸으로 만들지 않는다.
- 매스몬을 별도 도감/점수/수집 시스템으로 전면화하지 않는다.
- 기존 contact sheet를 보지 않고 비슷한 실루엣을 새로 만들지 않는다.
