# 매스몬 공용 관리소

이 폴더는 에듀잇티 수학 게임 시리즈의 매스몬 원본 자산을 관리합니다.

## 운영 원칙

- 새 매스몬은 먼저 `_shared/mathmon/<pack-id>/`에 등록합니다.
- 차시 폴더에는 필요한 배포용 파일만 복사합니다.
- 같은 차시 안에서는 한 팩을 기본으로 씁니다. 여러 팩을 섞을 때는 `manifest.json`에 이유를 남깁니다.
- 기존 팩과 실루엣이 겹치는 캐릭터는 만들지 않습니다.
- 새 팩과 새 캐릭터는 `STYLE_GUIDE.md`의 분위기·파일 규격·중복 방지 규칙을 따릅니다.
- 학생 화면에는 매스몬 수집 체계를 전면에 세우지 않습니다. 결과에서 이번 판 보상 카드로 보여 줍니다.

## 폴더 구조

- `base-pack/`: 1차시 기준 공용 10종 매스몬(active, 1~3차시 실행 기준)
- `zero-factory-pack/`: 3차시 `매스몬 0 공장`용 기존 10종 매스몬(preserved, 1차시 기준으로 재생성 전까지 실행 미사용)
- `core-pack-v2/`: 1차시와 2차시 공용 V2 10종 매스몬(preserved)
- `zero-factory-pack-v2/`: 3차시 `매스몬 0 공장`용 V2 10종 매스몬(preserved)
- `catalog.json`: 팩 단위 인벤토리와 사용 차시 목록
- `MATHMON_ASSET_CONTRACT.md`: Codex와 Claude가 반드시 먼저 확인하는 매스몬 자산 계약
- `STYLE_GUIDE.md`: Codex와 Claude가 공통으로 따르는 매스몬 생성·관리 기준

## 파일 규칙

- `raw-chromakey/`: 이미지 생성 원본 또는 배경 제거 전 원본
- `png/`: 투명 배경 PNG 원본
- `webp/`: 게임 배포용 WebP
- `contact-sheets/`: 전체 로스터 확인용 접촉표
- `manifest.json`: 팩 안의 캐릭터 목록, 콘셉트, 사용처

차시 폴더에 복사할 때는 WebP를 우선합니다. 다운로드 카드처럼 투명도가 중요한 합성에는 PNG 또는 WebP 알파가 모두 가능합니다.
