# 매스몬 스타일 가이드

이 문서는 Codex와 Claude가 새 매스몬을 만들거나 기존 매스몬을 차시에 배치할 때 따르는 공통 기준입니다.

## 기본 판단

매스몬 이미지는 앞으로 반드시 `_shared/mathmon/`에서 관리합니다. 새 이미지를 차시 폴더에만 생성하거나 저장하지 않습니다.

매스몬 생성·교체·팩 관리의 최상위 절차는 `_shared/mathmon/MATHMON_ASSET_CONTRACT.md`입니다. 이 스타일 가이드는 그 계약의 이미지 분위기 기준을 담당합니다.

이미지 분위기는 반드시 일관되어야 합니다. 학생이 차시가 달라져도 같은 시리즈의 보상 카드라고 느껴야 하기 때문입니다. 현재 활성 기준은 1차시 `매스몬 상자런`에서 사용한 2D 애니/스티커형 매스몬 톤입니다. `core-pack-v2`와 `zero-factory-pack-v2`는 보존 팩으로 남기지만 새 생성 기준으로 쓰지 않습니다.

## V1 표준 스타일

- 스타일 id: `mathmon-v1-anime-sticker`
- 형태: 둥글고 귀여운 2D 애니메이션/스티커형 마스코트
- 표정: 큰 눈, 밝은 표정, 초등학생이 바로 친근하게 느끼는 인상
- 실루엣: 작은 보상 카드에서도 구분되는 단순하고 강한 외곽
- 선 처리: 깨끗한 컬러 외곽선과 부드러운 내부 명암. 과하게 두껍거나 공격적인 검정선은 피함
- 색감: 선명하고 명랑한 색, 캐릭터별 대표색이 분명하되 너무 탁하거나 공포스럽지 않게 유지
- 디테일: 알, 병아리, 여우, 용, 사자, 독수리, 공룡, 유니콘처럼 아이들이 바로 알아볼 수 있는 소재를 우선
- 캐릭터 골격: 동물 또는 판타지 생물이 본체입니다. 차시 테마는 작은 소품, 의상, 표정, 포즈, 카드 문구로만 더합니다.
- 카메라: 정면 또는 3/4 정면, 전신, 카드 안에 넣기 좋은 중앙 배치
- 배경: 원본은 투명 PNG, 생성 중에는 제거 가능한 단색 chroma-key 사용 가능
- 금지: 실사풍, 과한 3D 장난감 렌더, 금속 로봇 렌더, 복잡한 배경, 텍스트, 로고, 워터마크, 날카로운 공포형 디자인, 차시마다 다른 렌더링 톤, 톱니바퀴·자석·상자·컨베이어 같은 사물 자체를 매스몬 몸으로 만드는 디자인

## 팩 단위 일관성

한 팩 안의 매스몬은 아래가 같아야 합니다.

- 렌더링 방식
- 시점과 비율
- 눈/입의 귀여운 정도
- 외곽선 또는 에지 처리
- 카드 안에서의 크기감과 여백
- 차시 테마와 연결되는 소재 범위

예를 들어 공장 차시 팩도 매스몬 본체는 동물/판타지 생물이어야 합니다. 공장 테마는 작은 작업 모자, 0 스티커, 작은 공구 가방, 컨베이어 모양 배지 같은 보조 요소로만 표현합니다. 같은 팩 안에 갑자기 실사 금속 로봇, 사물형 매스몬, 3D 장난감 렌더를 섞지 않습니다.

## 중복 방지

새 매스몬을 만들기 전 반드시 확인합니다.

1. `_shared/mathmon/catalog.json`
2. 각 팩의 `manifest.json`
3. 각 팩의 `contact-sheets/`

이미 있는 팩의 실루엣은 새 팩에서 반복하지 않습니다. 이름만 바꾸고 같은 형태를 다시 만드는 것은 금지입니다.

## 파일 규격

- 원본 투명 PNG: `768x768`, 알파 포함, 캐릭터 중심 정렬
- 배포 WebP: `768x768`, 알파 포함, quality 82~86 권장
- 생성 원본: 필요하면 `raw-chromakey/`에 보관
- 파일명: `mathmon-<pack-short>-<two-digit-number>-<english-slug>.<ext>`
- 팩 manifest: 한국어 이름, 영어 slug, 콘셉트, 파일 경로, 사용 차시를 기록
- contact sheet: 새 팩을 만들거나 수정할 때 반드시 갱신

## 생성 프롬프트 기본형

```text
Create ONE original Mathmon character for a Korean elementary math game.
Style: bright cute Korean anime sticker mascot, clean colorful outline, soft cel-shaded highlights, child-friendly, clean silhouette, full body centered, front three-quarter view, generous padding.
Creature-first rule: the main body must be a cute animal or fantasy creature, matching the warm mascot feeling of the lesson 1 Mathmon pack. The lesson theme may appear only as small accessories, costume details, badges, props, pose, or card-story cues.
The character must match the pack theme without turning into an object: <pack theme>.
It must not resemble any existing Mathmon in _shared/mathmon/catalog.json.
Use big friendly eyes, simple readable shape, no text, no logo, no watermark. Avoid realistic 3D render, realistic metal, industrial robot render, object-bodied mascots, scary sharp details, and complex backgrounds.
Create on a perfectly flat solid #00ff00 chroma-key background for later removal.
The background must be one uniform color with no shadows, gradients, texture, floor plane, or lighting variation.
Do not use #00ff00 anywhere in the character.
```

## 차시 적용 규칙

- 결과 보상으로는 이번 판에서 얻은 매스몬 카드 1장을 보여 줍니다.
- 매스몬 팩 자체를 별도 점수·도감·수집 시스템으로 전면화하지 않습니다.
- 차시 폴더에는 필요한 WebP만 복사하고, 원본 관리는 `_shared/mathmon/`에서 합니다.
- 차시 README/REPORT에는 사용한 팩 id와 원본 관리 위치를 기록합니다.
