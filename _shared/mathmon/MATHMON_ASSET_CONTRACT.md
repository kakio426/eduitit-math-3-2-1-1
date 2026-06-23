# 매스몬 자산 계약

이 문서는 Codex와 Claude가 매스몬을 만들거나, 바꾸거나, 차시에 배치할 때 반드시 먼저 확인하는 단일 계약입니다.

## 반드시 먼저 볼 파일

1. `_shared/mathmon/MATHMON_ASSET_CONTRACT.md`
2. `_shared/mathmon/catalog.json`
3. `_shared/mathmon/STYLE_GUIDE.md`
4. 사용할 팩의 `manifest.json`
5. 사용할 팩의 `contact-sheets/*-contact-sheet.png`

매스몬 관련 작업에서 위 파일을 보지 않고 이미지 생성, 파일 복사, HTML 참조 교체, 팩 추가를 시작하지 않습니다.

## 현재 활성 기준

- 활성 스타일: `mathmon-v1-anime-sticker`
- 활성 공용 팩: `_shared/mathmon/base-pack/`
- 활성 차시별 전용 팩: 없음. 전용 팩이 필요하면 1차시 스타일로 새로 생성합니다.
- 보존 팩: `_shared/mathmon/zero-factory-pack/`, `_shared/mathmon/core-pack-v2/`, `_shared/mathmon/zero-factory-pack-v2/`

앞으로 새 매스몬을 만들거나 기존 차시를 리마스터할 때는 1차시 `매스몬 상자런`의 매스몬 톤을 기준으로 삼습니다. 0 공장 기존 팩과 V2 장난감/클레이풍 팩은 삭제하지 않고 보존하지만, 실행 기본값이나 새 생성 기준으로 사용하지 않습니다.

차시별 전용 매스몬을 새로 만들 때도 매스몬 본체는 동물 또는 판타지 생물이어야 합니다. 차시 테마는 소품, 의상, 배지, 포즈, 카드 문구로만 표현하고, 톱니바퀴·자석·상자·컨베이어 같은 사물 자체를 매스몬 몸으로 만들지 않습니다.

## 원본과 배포본

- 원본 단일 관리 위치는 `_shared/mathmon/`입니다.
- 새 매스몬은 먼저 `_shared/mathmon/<pack-id>/`에 등록합니다.
- 차시 폴더에는 실행에 필요한 WebP만 복사합니다.
- 차시 폴더에 원본 PNG, raw chroma-key 생성물, contact sheet를 두지 않습니다.
- 기존 차시 폴더의 옛 PNG를 계속 참조하지 않습니다.

## 팩 구조

새 팩은 항상 아래 구조를 가집니다.

```text
_shared/mathmon/<pack-id>/
  manifest.json
  raw-chromakey/
  png/
  webp/
  contact-sheets/
```

파일명은 `mathmon-<pack-short>-<two-digit-number>-<english-slug>.<ext>` 형식을 따릅니다.

## 생성 절차

1. `catalog.json`에서 활성 팩과 레거시 팩을 확인합니다.
2. 기존 contact sheet를 보고 실루엣·소재·등급감이 겹치지 않는지 확인합니다.
3. `STYLE_GUIDE.md`의 `mathmon-v1-anime-sticker` 기준으로 프롬프트를 작성합니다.
4. 프롬프트에는 동물/판타지 생물 본체와 차시 테마 소품을 분리해 적습니다.
5. image generation은 flat chroma-key 배경으로 생성합니다.
6. 생성 원본은 `raw-chromakey/`에 저장합니다.
7. 배경 제거 후 투명 `768x768` PNG를 `png/`에 저장합니다.
8. WebP quality 82~86 배포본을 `webp/`에 저장합니다.
9. `manifest.json`에 캐릭터 id, 이름, 콘셉트, 파일 경로를 기록합니다.
10. contact sheet를 갱신합니다.
11. `catalog.json`에 팩 상태와 `usedBy`를 갱신합니다.
12. 차시 폴더에는 필요한 WebP만 복사하고 HTML 참조를 그 WebP로 바꿉니다.

## 차시 적용 원칙

- 한 차시는 기본적으로 한 매스몬 팩만 사용합니다.
- 여러 팩을 섞어야 할 때는 차시 `README.md`/`REPORT.md`와 팩 `manifest.json`에 이유를 남깁니다.
- 결과 보상은 차시 중심 보상 등급 뒤에 이번 판 매스몬 카드 1장으로 보여 줍니다.
- 매스몬 팩 자체를 저장형 도감, 별도 점수, 별도 수집 시스템으로 전면화하지 않습니다.
- 결과 조건(threshold, minCorrect)은 차시 보상 구조를 유지하고, 이미지·이름·문구만 바꾸는 경우에는 계산 로직을 건드리지 않습니다.

## 검증 체크리스트

- `catalog.json`과 모든 변경된 `manifest.json`이 JSON으로 파싱됩니다.
- 각 새 팩에 raw PNG 10종, 투명 PNG 10종, WebP 10종, contact sheet 1장이 있습니다.
- 모든 투명 PNG는 `768x768`, alpha 포함, 캐릭터 중심 정렬입니다.
- 차시 `index.html`에는 현재 활성 기준과 다른 V2 매스몬 실행 참조가 남아 있지 않습니다.
- 차시 폴더에는 실행용 WebP만 복사되어 있습니다.
- 로컬 서버에서 대표 WebP URL이 `HTTP 200`입니다.
- 브라우저에서 시작 화면 또는 결과 화면의 매스몬 이미지가 실제로 로드됩니다.
