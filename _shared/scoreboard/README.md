# 매스몬 공통 순위 화면

전국 순위 화면은 모든 차시가 같은 축하 배경과 SVG 순위판 컴포넌트를 공유합니다. 차시별로 바뀌는 것은 생성형 타이틀 이미지, 점수 이름, `LESSON_ID`, 점수 계산 함수뿐입니다.

생성 배경 이미지는 매스몬, 불꽃, 무대 조명, 축하 분위기만 맡습니다. 상단 고정 제목은 생성형 타이틀 이미지로 올리고, 순위판, 내 기록 박스, 순위 행, 버튼 껍데기, 동적으로 바뀌는 글자는 SVG `viewBox="0 0 1280 800"` 안에서 공통 컴포넌트가 그립니다. 브라우저 크기가 바뀌어도 배경과 UI가 같은 좌표계로 함께 축소되고, 실제 버튼은 보이지 않는 HTML hitbox만 맡습니다.

## 자산

- `scoreboard-celebration-bg-source.png`: imagegen으로 만든 축하 배경 원본
- `scoreboard-celebration-bg-generated.png`: 1280x800 확인용 PNG
- `scoreboard-celebration-bg-generated.webp`: 학생 화면 배포용 WebP
- `scoreboard-title-*-source.png`: imagegen으로 만든 차시별 전국 순위 타이틀 원본
- `scoreboard-title-*-generated.png`: 마젠타 배경 제거 후 확인용 PNG
- `scoreboard-title-*-generated.webp`: 학생 화면에 쓰는 투명 타이틀 WebP
- `scoreboard-ui.css`: SVG 순위판, 카드, 행, 버튼, 글자 스타일과 투명 hitbox 정렬
- `scoreboard-ui.js`: SVG 순위 화면 자동 생성, 상태별 문구, 순위 목록 렌더러, API 브리지

## 포함 파일

```html
<link rel="stylesheet" href="../_shared/scoreboard/scoreboard-ui.css">
<script src="../_shared/scoreboard/scoreboard-ui.js"></script>
```

차시 폴더 깊이가 다르면 상대 경로만 맞춥니다.

## 화면 구조

```html
<section
  class="screen mathmon-scoreboard"
  id="scoreboardScreen"
  aria-labelledby="scoreboardTitle"
  data-scoreboard-title="전국 로켓 순위"
  data-scoreboard-title-art="../_shared/scoreboard/scoreboard-title-rocket-generated.webp"
  data-scoreboard-score-label="연료 점수"
  data-scoreboard-list-title="로켓 연료 순위"
  data-scoreboard-unit="3학년 2학기 1단원 2차시"
></section>
```

`MathmonScoreboard.mount(root)` 또는 `MathmonScoreboard.render(...)`가 호출되면 위 빈 섹션 안에 1280x800 SVG 순위판과 투명 hitbox 버튼이 자동으로 만들어집니다. 2차시처럼 예전 전체 SVG 마크업을 이미 가진 화면도 그대로 동작합니다.

## 구현 원칙

- 생성 이미지는 축하 배경, 매스몬 장식, 무대 조명만 맡습니다.
- 상단 고정 제목은 차시별 생성형 타이틀 이미지가 맡고, SVG 안의 어두운 받침판 위에 올립니다.
- 순위판, 내 기록 3칸, 순위 행, 스크롤 영역, 버튼 표면은 공통 SVG/CSS가 그립니다.
- SVG `<text>`는 실제로 바뀌는 이름, 점수, 등수, 순위 목록, 버튼 라벨, 상태 안내를 그립니다.
- 학생 화면에는 자유 닉네임 입력, 학교명, 지역명, 참가코드를 보이지 않습니다.
- 버튼 표면과 보이는 버튼 글자는 SVG가 맡고, HTML 버튼은 투명 hitbox와 접근성 라벨만 맡습니다.
- 상단에는 별도 상태 문장을 두지 않습니다. API 꺼짐, 로딩, 오류, 빈 목록 안내는 순위 목록 영역 안에서만 보입니다.
- 배경 이미지 안에 만든 박스에 글자를 맞추지 않습니다. 위치를 조정할 때는 공통 SVG 컴포넌트의 도형과 `<text>` 좌표를 함께 바꿉니다.
- URL에 `?scoreboardDebug=1`을 붙이면 목록 viewport와 버튼 hitbox의 디버그 선이 켜집니다. 이 선은 학생 화면에는 보이지 않습니다.
- 한 화면에는 4행을 안정적으로 보여 줍니다. 렌더러는 최대 10개를 받을 수 있고 목록은 순위판 안에서 스크롤됩니다.

## 렌더 계약

각 차시는 순위 상태가 바뀔 때 아래처럼 호출합니다.

```js
window.MathmonScoreboard.render({
  root: el.scoreboardScreen,
  apiEnabled: Boolean(SCOREBOARD_API_URL),
  loading: state.scoreboardLoading,
  error: Boolean(state.scoreboardError),
  session: state.scoreboardSession,
  submission: state.scoreboardSubmission,
  score: getScoreboardScore(),
  myEntry: findMyLeaderboardEntry(),
  weekLabel: getLeaderboardWeekLabel(),
  entries: state.scoreboardEntries,
  totalQuestions: TOTAL_QUESTIONS
});
```

`session.nickname`은 API가 정한 이름만 사용합니다. 학생이 직접 닉네임을 쓰는 입력은 만들지 않습니다.

## API 브리지 계약

새 차시는 `MathmonScoreboard.createApiBridge(...)`를 쓰면 세션 생성, 점수 제출, 주간 순위 조회, 순위 화면 렌더링, 새로 보기/결과로/다시하기 hitbox 연결을 한 곳에서 처리할 수 있습니다.

```js
const scoreboardBridge = window.MathmonScoreboard.createApiBridge({
  root: el.scoreboardScreen,
  apiUrl: SCOREBOARD_API_URL,
  lessonId: LESSON_ID,
  totalQuestions: TOTAL_QUESTIONS,
  getScore: () => state.fuelPercent,
  getCorrectCount: () => state.correct,
  getAnswers: () => state.scoreboardAnswers,
  getRewardResult: () => ({ destinationId: "mars" }),
  showScoreboard: () => showScreen("scoreboard"),
  showResult: () => showScreen("result"),
  restart: startGame
});
```

- 게임 시작: `scoreboardBridge.start()`
- 결과 화면의 순위 버튼: `leaderboardButton.addEventListener("click", scoreboardBridge.open)`
- API 주소 주입 위치: `window.MATHMON_SCOREBOARD_API_URL` 또는 `?scoreboardApi=https%3A%2F%2Feduitit.site`
- API 주소가 비어 있으면 점수 제출 없이 같은 순위 화면 안에서 꺼짐 안내만 보입니다.
