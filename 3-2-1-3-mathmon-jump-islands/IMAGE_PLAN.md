# 매스몬 10배 점프섬 IMAGE PLAN

이 문서는 RasterStage 안전 구역과 최종 생성형 비트맵 자산 연결 상태를 함께 기록합니다. 첫 화면, 제목, 설명, 지도, 보상, 결과 배경, 매스몬 실행 WebP를 생성·복사·연결했습니다. 보상 모달은 기존 캐릭터 PNG 합성이 아니라 결과별 매스몬 포함 이미지 6장을 사용합니다.

## Stage Contract

- 기준 Stage: `1280x800`, 비율 `16:10`.
- `.stage-shell`이 contain 크기를 맡고, 모든 화면은 Stage 안에서만 배치합니다.
- generated art에는 문제 수식, 선택지, 점수, 버튼, 섬 이름, 결과 요약, 소리 상태를 굽지 않습니다.
- HTML overlay는 학생이 매 판 읽는 말과 숫자만 담당합니다.
- 최소 여백은 Stage 가장자리에서 22px, 주요 글자/버튼에서 24px, 소리 버튼 슬롯에서 12px 이상입니다.

## Global Safe Zones

| Zone | 좌표 기준 | 생성 이미지 안전 조건 | HTML overlay |
| --- | --- | --- | --- |
| top-row/sound reserve | x 22-1258, y 22-56 | 중요한 얼굴, 제목, 지형 끝을 두지 않음 | 브랜드 배지, 단원 배지, 원형 sound button |
| title/goal/start cover | x 70-640, y 150-610 | cover 배경은 글자 없음, 제목 자리 뒤는 밝기 낮게 | title art, 목표 1줄, `시작` 버튼 |
| lesson badge | x 22-420, y 730-778 | 하단 왼쪽에 작은 물체나 글자 금지 | 배움주제 badge |
| result overlay | x 690-1210, y 150-700 | 결과 배경은 오른쪽 카드 뒤가 단순해야 함 | 결과 제목, 칭찬, 요약 2칸, 다시하기 |

## Play Screen 1280x800 Layout

Task 6 play layout은 세 구역으로 고정합니다.

1. Top map, x 22-1258, y 68-210, height 142-160px
   - Stage의 약 18-20%를 씁니다.
   - generated compact island map 또는 island pieces가 들어갈 art slot입니다.
   - 모든 섬은 왼쪽에서 오른쪽으로 보입니다: `출발섬`, `모래섬`, `숲섬`, `구름섬`, `별빛섬`, `무지개섬`.
   - 생성 이미지에는 섬 이름을 굽지 않습니다. 섬 이름, 현재 매스몬 marker, reached dim/bright, next target은 HTML overlay입니다.
   - 섬 label 예상 글자 크기: 14-16px, 2줄 금지. 각 label box 최소 25px 높이.
   - 섬 label 사이 최소 여백: 10px. 매스몬 marker는 label과 6px 이상 떨어집니다.

2. Middle math area, x 22-1258, y 224-600
   - 큰 문제, 현재 단계 board, transformation area가 들어갑니다.
   - 문제 제목 예상 글자 크기: 54px 안팎, 숫자는 한 줄 유지.
   - 현재 step board는 왼쪽 70% 이상, step chip column은 오른쪽 210-260px입니다.
   - current step만 크게 보이고, 완료 step은 작은 chip, 다음 step은 `?`입니다.
   - transformation area 최소 높이 92px. 예: `25 × 7 = ?`, `175 → 1,750`.
   - wrong hint는 기본 hidden, 오답 뒤 현재 step hint 1개만 x 360-920 안에 보여 줍니다.

3. Bottom choices, x 22-1258, y 650-734
   - 선택지는 3칸 고정 grid입니다.
   - 각 버튼 최소 높이 68px, 칸 gap 10px.
   - 예상 글자 크기: 19px 안팎. 숫자와 `0 세 개 붙이기`가 상자 안에서 줄바꿈 없이 들어가야 합니다.
   - correct/wrong/disabled 상태에서도 버튼 크기는 변하지 않습니다.

## Reward Modal Safe Zone

- Overlay 전체: x 0-1280, y 0-800, 어두운 dim + blur.
- Modal card: x 270-1010, y 145-655, 최대 740px 폭.
- Generated reward art area: x 320-960, y 170-530, ratio `16:9`.
- HTML reward label: art area 중앙, 최소 220x92px. 보이는 non-button 텍스트는 하나만 허용합니다.
- 허용 label: `살랑 바람`, `앞바람`, `잠깐 멈춤`, `쌩쌩 바람`, `무지개 길`, `길이 흔들렸어요`.
- 버튼: art 아래 18px 이상 떨어진 곳. 버튼 문구는 `다음` 또는 `보기`만 씁니다.
- 생성 보상 이미지는 바람, 길 흔들림, 작은 섬 실루엣, 장면 안에 함께 있는 매스몬을 담고 글자를 넣지 않습니다. 기존 매스몬 PNG/WebP를 보상 이미지 위에 따로 붙이지 않습니다.

## Result Overlay Safe Zone

- Result generated scene: 전체 `1280x800`, 주요 island scene은 왼쪽 x 70-620, y 130-650에 배치합니다.
- 오른쪽 x 690-1210, y 130-710은 HTML summary가 읽히도록 배경 대비를 낮춥니다.
- 결과 제목 예상 글자 크기: 48-52px, 2줄까지 허용하되 줄 사이 겹침 금지.
- 결과 summary는 2칸입니다: 맞힌 문제, 도착한 곳. 각 카드 최소 94px 높이.
- 다시하기 button은 summary 아래 10px 이상 떨어집니다.

## Generated Element Inventory For Task 7

- `cover-generated.webp`: 글자 없는 점프섬 대표 장면. title/goal/start overlay safe area를 비워 둡니다.
- `title-poster-generated.webp`: 정확한 한글 `매스몬 10배 점프섬` standalone title art. 생성 원본과 배경 제거본 보관 필요.
- `tutorial-generated.webp`: 두 번 고르는 흐름을 보여 주는 글자 없는 장면.
- `play-map-strip-generated.webp`: generated top map strip. 여섯 섬 전체와 길은 bitmap이 담당하고, 섬 이름과 현재 위치만 HTML 오버레이로 둡니다.
- `reward-tailwind-generated.webp`, `reward-headwind-generated.webp`, `reward-pause-generated.webp`, `reward-gust-generated.webp`, `reward-rainbow-generated.webp`, `reward-shaky-generated.webp`: reward modal art. 각 이미지는 매스몬과 바람/길 상태가 함께 생성된 완성 장면이며 event label은 HTML.
- `result-start-generated.webp`, `result-sand-generated.webp`, `result-forest-generated.webp`, `result-cloud-generated.webp`, `result-starlight-generated.webp`, `result-rainbow-generated.webp`: 결과 island scenes. 결과 제목과 요약은 HTML.

## Task 7 Final Asset Inventory

생성 방식은 built-in `image_gen`입니다. 생성 원본은 `/Users/yubyeongju/.codex/generated_images/` 아래에 남겨 두고, 배포 런타임 파일은 이 차시 폴더에 복사·변환했습니다. 첫 화면·설명·보상·결과 장면은 `1280x800` WebP이고, 문제 지도는 상단 슬롯에 맞춘 `1280x190` WebP입니다. 동적 점수·버튼·섬 이름·문제 수식은 굽지 않았습니다.

| Runtime file | Source note | RasterStage role | Overlay safe area and text band |
| --- | --- | --- | --- |
| `cover-generated.webp` | generated scene PNG → center-crop WebP | 첫 화면 배경. 글자 없는 점프섬 대표 장면 | x 70-640, y 150-610에 제목 art 126-240px tall, 목표 22-24px, 시작 버튼 72px. top row y 22-60, lesson badge y 730-778 clear. |
| `title-poster-source.png` | generated chroma-key title source | 제목 원본 보관 | 정확한 한글 `매스몬 10배 점프섬`을 시각 검수함. 배경은 flat chroma-key. |
| `title-poster-generated.png` | chroma-key removed transparent PNG | 접근성 제목 위에 얹는 투명 제목 art | `.hero-title-art` slot width <= 520px. 주변 목표/버튼과 18px 이상 간격. |
| `title-poster-generated.webp` | transparent runtime WebP | 첫 화면 제목 runtime | 같은 slot 사용. alpha corners 검증. |
| `tutorial-generated.webp` | generated scene PNG → center-crop WebP | 설명 화면 배경. 0 붙이기 길과 점프 길 성장 | left x 60-600, y 130-670에 4단계 설명 19-20px, 버튼 58px. right visual remains text-free. |
| `play-map-strip-source.png` | built-in `image_gen` output copied from `/Users/yubyeongju/.codex/generated_images/019f0b5c-eea3-7882-a79d-dec340f89c09/ig_0bf877857df4a570016a40dd5977b48191a0ec97a2ab403b23.png` | 문제 화면 상단 지도 원본 보관 | 글자 없는 여섯 섬 route scene. HTML labels/current marker only. |
| `play-map-strip-generated.webp` | `play-map-strip-source.png` crop/resize → 1280x190 WebP | 문제 화면 상단 지도 runtime | `.island-map` slot에 `<img class="map-raster">`로 연결. 지도 이미지는 섬/바다/길을 담당하고 HTML은 라벨과 상태만 담당. |
| `compact-island-map-generated.webp` | earlier generated map PNG → center-crop WebP | 보존 자산. 새 Phase 2 문제 화면 runtime에서는 미사용 | 이전 전체 지도 탐색본. |
| `reward-tailwind-generated.webp` | `reward-tailwind-source.png` → 1280x720 WebP | `살랑 바람` 보상 모달 장면 | 매스몬과 가벼운 바람 효과가 이미지 안에 함께 생성됨. HTML reward label one visible phrase only. |
| `reward-headwind-generated.webp` | `reward-headwind-source.png` → 1280x720 WebP | `앞바람` 보상 모달 장면 | 매스몬과 앞바람 효과가 이미지 안에 함께 생성됨. HTML reward label one visible phrase only. |
| `reward-pause-generated.webp` | `reward-pause-source.png` → 1280x720 WebP | `잠깐 멈춤` 보상 모달 장면 | 매스몬과 멈춤 효과가 이미지 안에 함께 생성됨. HTML reward label one visible phrase only. |
| `reward-gust-generated.webp` | `reward-gust-source.png` → 1280x720 WebP | `쌩쌩 바람` 보상 모달 장면 | 매스몬과 큰 바람 효과가 이미지 안에 함께 생성됨. HTML reward label one visible phrase only. |
| `reward-rainbow-generated.webp` | `reward-rainbow-source.png` → 1280x720 WebP | `무지개 길` 보상 모달 장면 | 매스몬과 무지개 길이 이미지 안에 함께 생성됨. HTML reward label one visible phrase only. |
| `reward-shaky-generated.webp` | `reward-shaky-source.png` → 1280x720 WebP | `길이 흔들렸어요` 보상 모달 장면 | 매스몬과 흔들린 길 효과가 이미지 안에 함께 생성됨. HTML reward label one visible phrase only. |
| `result-start-generated.webp` | generated scene PNG → center-crop WebP | `출발섬` result background | right x 690-1210, y 130-710 for result title 48-52px, praise 20px, summary cards 94px. |
| `result-sand-generated.webp` | generated scene PNG → center-crop WebP | `모래섬` result background | same right overlay zone. |
| `result-forest-generated.webp` | generated scene PNG → center-crop WebP | `숲섬` result background | same right overlay zone. |
| `result-cloud-generated.webp` | generated scene PNG → center-crop WebP | `구름섬` result background | same right overlay zone. |
| `result-starlight-generated.webp` | generated scene PNG → center-crop WebP | `별빛섬` result background | same right overlay zone. |
| `result-rainbow-generated.webp` | generated scene PNG → center-crop WebP | `무지개섬` result background | same right overlay zone. |

## Mathmon Pack Choice

- Reused pack: `_shared/mathmon/zero-factory-animal-pack/`.
- Runtime companion copied into this lesson: `mathmon-zfa-04-nyangnyangmon.webp`.
- Reason: the active pack is already registered for `3-2-1-3`, matches `mathmon-v1-anime-sticker`, and the cat silhouette is compact enough for cover/result overlays.
- 첫 화면과 결과 화면의 배경은 매스몬 없는 장면 위에 runtime companion WebP를 씁니다. 보상 모달은 결과별 완성 장면 안에 매스몬이 함께 생성되어 있으므로 별도 companion WebP를 얹지 않습니다.
- 원본 PNG/contact sheet는 `_shared/mathmon/zero-factory-animal-pack/`에만 있고, 차시 폴더에는 실행용 WebP만 둡니다.

## Task 7 Safe-Zone Confirmation

- Cover: generated scene carries the world on center-right; left title/goal/start overlay keeps at least 24px between title, goal, and button, and the fixed sound slot is untouched.
- Tutorial: generated pads sit on the right; HTML steps remain left-side and do not rely on baked explanatory text.
- Play map: generated `play-map-strip-generated.webp` is the runtime visual base. Labels, current marker, reached/next states remain dynamic HTML overlays, and all six islands must fit inside the Stage without cropping.
- Reward: six generated `reward-*-generated.webp` files are the visual base. The modal shows exactly one visible non-button phrase, and Mathmon is part of each generated reward scene rather than a separate overlay.
- Result: each island has a distinct generated background. The right-side result overlay stays clear of the main island art and uses short dynamic HTML text.

## QA Notes

- Task 7 cover/result 증거 화면에서 제목 art, 목표/시작 버튼, 결과 요약, 다시하기 버튼, 소리 버튼, 상단 배지가 서로 덮이지 않는 것을 확인했습니다.
- 장면 WebP는 `1280x800`, 문제 지도 WebP는 `1280x190`, 제목 source/runtime은 별도 PNG/WebP로 보관합니다. 결과 배경 6장은 서로 다른 파일과 해시입니다.
- 컴퓨터 `1280x800`과 태블릿 가로 스크린샷 세트, Humanizer 학생 문구 QA, README/REPORT 최신화는 Task 8에서 확인했습니다.
