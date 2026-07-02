# 1단원 설명 이미지 프롬프트

이 문서는 3학년 2학기 1단원 1~4차시의 설명 화면을 생성할 때 쓰는 기준 프롬프트다. 설명 화면은 반드시 두 장 구조로 만든다.

- `guide-solve`: 문제를 어떻게 푸는지 보여 주는 화면
- `guide-goal`: 10문제, 보상, 마지막 결과와 순위를 보여 주는 화면

공통 조건:

```text
Use case: scientific-educational
Asset type: 1280x800 landscape guide image for a Korean elementary math game
Style/medium: bright 2D anime-style educational game poster, polished Korean tablet game UI, thick rounded panels, high contrast, readable from a classroom screen
Composition/framing: 16:10 wide stage, one large title, three simple step cards, one clear visual flow strip, one large yellow start button area at the bottom
Typography: large rounded Korean display letters, exact Korean text only, no extra text, no English, no watermark
Constraints: grade 3 student friendly, low text density, no cramped labels, no overlapping text, no tiny captions, no confusing extra math examples
Bottom action button: a centered yellow rounded button surface, about 400-460 px wide and 110-145 px tall in a 1280x800 stage, bottom safe area y 665-735, label centered and readable, not oversized
```

## 1차시: 매스몬 상자런

### guide-solve

```text
Primary request: Create a guide image for "매스몬 상자런" that teaches multiplication without carrying.
Scene/backdrop: colorful storage room with stacked gift boxes and cheerful Mathmon monster friends.
Subject: large white teaching board and golden boxes.
Text (verbatim):
"매스몬 상자런"
"어떻게 풀어요?"
"자리마다 곱해요"
"1 일의 자리부터 곱해요."
"2 십의 자리도 곱해요."
"3 백의 자리까지 곱해요."
"324 × 2 = 648"
"문제 시작"
Visual math: show 324 × 2 with ones, tens, hundreds highlighted one by one, no carrying marks.
Avoid: extra Korean text, English, wrong equation, tiny numbers, cluttered boxes.
```

### guide-goal

```text
Primary request: Create a second guide image for "매스몬 상자런" that explains the game goal and rewards.
Scene/backdrop: festive box warehouse track with golden boxes opening and Mathmon cheering.
Subject: a simple flow from math problem to boxes to final score and national ranking.
Text (verbatim):
"무엇을 얻어요?"
"10문제를 풀어요"
"맞히면 상자가 열려요"
"상자 점수가 오르거나 내려가요"
"마지막에 점수와 순위를 봐요"
"상자 열기"
Visual flow: 10 math cards -> normal/shiny/gold boxes -> score meter -> big ranking trophy.
Avoid: extra Korean text, exact score promises, guaranteed highest reward, English, tiny captions, leaderboard table rows.
```

## 2차시: 매스몬 로켓발사 대작전

### guide-solve

```text
Primary request: Create a guide image for "매스몬 로켓발사 대작전" that teaches multiplication with carrying.
Scene/backdrop: bright space rocket lab with a rocket and green fuel tank.
Subject: large teaching board, place-value multiplication, carrying mark shown clearly.
Text (verbatim):
"매스몬 로켓발사 대작전"
"어떻게 풀어요?"
"차례로 곱해요"
"1 일의 자리부터 곱해요."
"2 넘친 수는 위에 써요."
"3 다음 자리와 함께 더해요."
"23 × 4 = 92"
"연료 넣기"
Visual math: show 23 × 4, 4×3=12, write 2 and carry 1, then 4×2+1=9.
Avoid: extra Korean text, wrong carrying mark, wrong equation, English, cramped panels.
```

### guide-goal

```text
Primary request: Create a second guide image for "매스몬 로켓발사 대작전" that explains rewards and final goal.
Scene/backdrop: colorful space launch room, rocket ready, planets visible through a window, Mathmon cheering.
Subject: simple flow from 10 problems to fuel to planet arrival and national ranking.
Text (verbatim):
"무엇을 얻어요?"
"10문제를 풀어요"
"맞히면 연료 기회를 얻어요"
"연료가 차거나 새기도 해요"
"마지막에 도착 행성과 순위를 봐요"
"발사 준비"
Visual flow: 10 problem cards -> fuel droplets -> rocket fuel gauge -> planet arrival -> trophy ranking.
Avoid: extra Korean text, exact fuel guarantees, English, tiny labels, dense planet list.
```

## 3차시: 매스몬 10배 점프섬

### guide-solve

```text
Primary request: Create a guide image for "매스몬 10배 점프섬" that teaches multiplying tens by hiding zeros first.
Scene/backdrop: floating island world with jump pads, clouds, waterfalls, cheerful Mathmon monsters.
Subject: large teaching board with zero-cover stickers.
Text (verbatim):
"매스몬 10배 점프섬"
"어떻게 풀어요?"
"0을 잠깐 가려요"
"1 0을 잠깐 가려요."
"2 남은 수를 곱해요."
"3 0을 다시 붙여요."
"30 × 20 = 600"
"점프 시작"
Visual math: show 30×20 -> cover two zeros -> 3×2=6 -> attach two zeros -> 600.
Avoid: extra Korean text, wrong number of zeros, English, tiny captions, cluttered islands.
```

### guide-goal

```text
Primary request: Create a second guide image for "매스몬 10배 점프섬" that explains rewards and final goal.
Scene/backdrop: floating islands with a windy jump path and distant rainbow island.
Subject: flow from 10 problems to wind rewards to landing island and national ranking.
Text (verbatim):
"무엇을 얻어요?"
"10문제를 풀어요"
"맞히면 바람을 만나요"
"좋은 바람은 멀리 보내요"
"마지막에 도착 섬과 순위를 봐요"
"점프 준비"
Visual flow: 10 problem cards -> wind icons -> jump distance path -> island destination -> trophy ranking.
Avoid: extra Korean text, guaranteed rainbow island, English, tiny captions, crowded map.
```

## 4차시: 매스몬 로봇 합체

### guide-solve

```text
Primary request: Create a guide image for "매스몬 로봇 합체" that teaches splitting a two-digit multiplier and adding partial products.
Scene/backdrop: friendly robot workshop with Mathmon robot helper, tools, glowing blueprint screen.
Subject: large teaching board with two clean partial-product blocks.
Text (verbatim):
"매스몬 로봇 합체"
"어떻게 풀어요?"
"나눠서 곱해요"
"1 45를 40과 5로 나눠요."
"2 두 조각을 따로 곱해요."
"3 두 값을 더해요."
"23 × 45 = 1035"
"합체 시작"
Visual math: show 45 = 40 + 5, then 23×40 = 920 and 23×5 = 115, then 920+115=1035.
Avoid: extra Korean text, wrong equation, wrong addition, English, cramped math board.
```

### guide-goal

```text
Primary request: Create a second guide image for "매스몬 로봇 합체" that explains rewards and final goal.
Scene/backdrop: bright robot fusion workshop, robot parts moving together, Mathmon cheering.
Subject: simple flow from 10 problems to fusion energy to robot grade and national ranking.
Text (verbatim):
"무엇을 얻어요?"
"10문제를 풀어요"
"맞히면 합체 에너지를 얻어요"
"에너지가 늘거나 줄기도 해요"
"마지막에 로봇과 순위를 봐요"
"합체 준비"
Visual flow: 10 problem cards -> glowing energy cores -> robot assembly meter -> robot grade -> trophy ranking.
Avoid: extra Korean text, guaranteed legend robot, English, tiny captions, complex robot blueprint text.
```
