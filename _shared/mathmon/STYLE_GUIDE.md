# 매스몬 스타일 가이드

이 문서는 Codex와 Claude가 새 매스몬을 만들거나 기존 매스몬을 차시에 배치할 때 따르는 공통 기준입니다.

## 기본 판단

매스몬 이미지는 앞으로 반드시 `_shared/mathmon/`에서 관리합니다. 새 이미지를 차시 폴더에만 생성하거나 저장하지 않습니다.

이미지 분위기는 반드시 일관되어야 합니다. 학생이 차시가 달라져도 같은 시리즈의 보상 카드라고 느껴야 하기 때문입니다. 다만 1~2차시에서 쓰던 `base-pack`은 이미 만들어진 레거시 팩이므로 보존하고, 앞으로 새로 만드는 팩은 아래의 신규 표준을 따릅니다.

## 신규 표준 스타일

- 형태: 둥글고 부드러운 장난감 같은 3D 마스코트
- 표정: 큰 눈, 밝은 표정, 초등학생에게 친근한 인상
- 실루엣: 작은 썸네일에서도 구분되는 단순하고 강한 외곽
- 재질: 부드러운 플라스틱, 고무, 천 인형, 무광 금속처럼 과하게 사실적이지 않은 표면
- 색감: 선명하지만 과포화되지 않은 색, 차시 테마색 1~2개와 공통 포인트색을 함께 사용
- 조명: 부드러운 스튜디오 조명, 강한 그림자나 공포감 있는 대비 금지
- 카메라: 정면 또는 3/4 정면, 전신, 카드 안에 넣기 좋은 중앙 배치
- 배경: 원본은 투명 PNG, 생성 중에는 제거 가능한 단색 chroma-key 사용 가능
- 금지: 텍스트, 로고, 워터마크, 복잡한 배경, 바닥 그림자, 날카로운 공포형 디자인, 과한 디테일

## 팩 단위 일관성

한 팩 안의 매스몬은 아래가 같아야 합니다.

- 렌더링 방식
- 시점과 비율
- 눈/입의 귀여운 정도
- 외곽선 또는 에지 처리
- 카드 안에서의 크기감과 여백
- 차시 테마와 연결되는 소재 범위

예를 들어 `zero-factory-pack`은 공장·기계·0 스티커 소재로 통일합니다. 같은 팩 안에 갑자기 동물형, 판타지 용형, 사람형을 섞지 않습니다.

## 중복 방지

새 매스몬을 만들기 전 반드시 확인합니다.

1. `_shared/mathmon/catalog.json`
2. 각 팩의 `manifest.json`
3. 각 팩의 `contact-sheets/`

이미 있는 알, 병아리, 여우, 용, 사자, 독수리, 티라노, 유니콘, 왕관 드래곤 같은 실루엣은 새 팩에서 반복하지 않습니다. 이름만 바꾸고 같은 형태를 다시 만드는 것은 금지입니다.

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
Style: polished cute rounded toy-like 3D mascot sprite, child-friendly, clean silhouette, full body centered, front three-quarter view, generous padding.
The character must match the pack theme: <pack theme>.
It must not resemble any existing Mathmon in _shared/mathmon/catalog.json.
Use big friendly eyes, soft studio lighting, simple readable shape, no text, no logo, no watermark.
Create on a perfectly flat solid #00ff00 chroma-key background for later removal.
The background must be one uniform color with no shadows, gradients, texture, floor plane, or lighting variation.
Do not use #00ff00 anywhere in the character.
```

## 차시 적용 규칙

- 결과 보상으로는 이번 판에서 얻은 매스몬 카드 1장을 보여 줍니다.
- 매스몬 팩 자체를 별도 점수·도감·수집 시스템으로 전면화하지 않습니다.
- 차시 폴더에는 필요한 WebP만 복사하고, 원본 관리는 `_shared/mathmon/`에서 합니다.
- 차시 README/REPORT에는 사용한 팩 id와 원본 관리 위치를 기록합니다.
