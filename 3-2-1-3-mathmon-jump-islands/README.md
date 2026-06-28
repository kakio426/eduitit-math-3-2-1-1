# 매스몬 10배 점프섬

3학년 2학기 1단원 3차시용 단일 HTML 게임입니다. `(몇십)×(몇십)`과 `(몇십몇)×(몇십)`에서 0을 잠깐 가리고 곱한 뒤, 가렸던 0을 붙이는 원리를 연습합니다.

## 실행

- 파일: `index.html`
- 권장 화면: 컴퓨터, 태블릿 가로
- Stage: `16:10`, 기준 `1280x800`
- 첫 화면 표준: `generated-title-overlay`

## 화면 흐름

1. 첫 화면: 제목 아트, 한 줄 목표, `시작` 버튼을 HTML 오버레이로 보여 줍니다.
2. 설명: 0 가리기, 먼저 곱하기, 0 붙이기, 바람에 따라 점프 길이 달라지는 흐름을 짧게 안내합니다.
3. 문제: 상단 생성 이미지 지도에 여섯 섬과 현재 위치 매스몬을 보여 주고, 현재 단계만 크게 풉니다.
4. 바람: 한 문제 뒤 한 가지 바람만 보여 줍니다. 지도 매스몬이 먼저 작게 반응한 뒤 보상 모달 이미지가 바뀝니다.
5. 결과: 점프 길을 살펴본 뒤 도착한 섬, 맞힌 문제 수, 다시하기 버튼을 보여 줍니다.

## 문제 방식

- 한 판은 10문제입니다.
- 문제 은행은 실행 때 새로 뽑습니다.
- `(A0)×(B0)`은 `A×B`를 고른 뒤 `0 두 개 붙이기`를 고릅니다.
- `(AB)×(C0)`은 `AB×C`를 고른 뒤 `0 한 개 붙이기`를 고릅니다.
- 한 판에는 `0 한 개 붙이기` 문제 5개, `0 두 개 붙이기` 문제 5개가 정확히 들어갑니다.
- 같은 판 안에서 최종 답이 겹치지 않도록 뽑습니다.

## 실수와 힌트

첫 번째 오답은 지금 단계 힌트 하나만 보여 줍니다. 같은 단계에서 다시 틀리면 정답을 보여 주고 다음 단계로 갑니다. 한 번이라도 도움을 받은 문제는 `길이 흔들렸어요` 쪽으로 가며, 좋은 바람 보상은 받지 않습니다.

## 보상과 결과

정답을 바로 고르면 기본 점프 거리와 바람 보상이 더해집니다. 바람은 점프 길을 조금 늘리거나 줄일 수 있고, 아주 드물게 `무지개 길`이 나옵니다. 낮은 결과도 실패가 아니라 `출발섬`이나 `모래섬`처럼 도착한 곳으로 보여 줍니다.

큰 이동 연출은 문제 풀이 화면에 넣지 않습니다. 학생이 완성식을 확인하고 `바람 보기`를 누르면 상단 지도 안에서 냥냥몬 마커가 0.4~0.7초 동안 먼저 반응합니다. 도착 섬이 바뀌면 새 섬으로 이동하고 착지하며, 같은 섬이면 바람 종류에 따라 작은 점프·흔들림·밝기 변화만 보여 줍니다. 그 뒤 보상 모달에서 바람 장면을 보여 주고, 문제 화면은 계산과 선택지에 집중합니다. 상단 지도에는 `현재` 글자 대신 작은 냥냥몬 마커만 현재 섬으로 움직입니다. 보상 모달의 매스몬은 별도 PNG를 붙인 것이 아니라 각 바람 이미지 안에 함께 생성했습니다.

시뮬레이션 기준은 `node scripts/simulate-lesson3-islands.mjs --seed 12345 --runs 50000`입니다. 10/10으로 바로 맞힌 경우에도 `무지개섬`은 0.214%로 아주 드물고, 8/10에서는 0%였습니다.

## 소리

시작 뒤 낮은 배경음이 켜지고, 정답·오답·보상·다음·결과 공개에 짧은 WebAudio 효과가 납니다. 소리 버튼은 Stage 안 오른쪽 위 원형 SVG 버튼이며, 화면에는 글자를 보이지 않습니다.

## 자산

- 첫 화면: `cover-generated.webp`, `title-poster-generated.webp`
- 설명: `tutorial-generated.webp`
- 문제 지도: `play-map-strip-source.png`, `play-map-strip-generated.webp`, `mathmon-zfa-04-nyangnyangmon.webp` 현재 위치 마커
- 바람: `reward-tailwind-generated.webp`, `reward-headwind-generated.webp`, `reward-pause-generated.webp`, `reward-gust-generated.webp`, `reward-rainbow-generated.webp`, `reward-shaky-generated.webp`
- 결과: `result-final-start-generated.webp`, `result-final-sand-generated.webp`, `result-final-forest-generated.webp`, `result-final-cloud-generated.webp`, `result-final-starlight-generated.webp`, `result-final-rainbow-generated.webp`
- 매스몬: `_shared/mathmon/zero-factory-animal-pack/`의 `mathmon-zfa-04-nyangnyangmon.webp`

문제와 보상 모달의 생성 이미지에는 문제, 선택지, 점수, 버튼, 섬 이름을 넣지 않았습니다. 결과 화면은 `result-final-*` 완성형 래스터 위에 맞힌 문제 수만 HTML로 얹고, 다시하기는 투명 HTML 버튼으로 클릭 영역을 제공합니다.

## QA

새 보상 모달 이미지 6종, 첫 화면부터 결과 화면까지의 흐름, 상단 지도 매스몬 미니 효과를 다시 확인했습니다. `1280x800`, `1024x768`에서 텍스트 넘침과 요소 겹침 0건, 지도 밖 이탈 0건, 학생 화면 `현재` 글자 미노출을 확인했습니다. 대표 스크린샷은 `screenshots/`에 있습니다.
