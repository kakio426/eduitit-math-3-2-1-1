(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const ROW_Y = [422, 476, 530, 584];
  const ROW_HEIGHT = 48;
  const ROW_STEP = 54;
  const VISIBLE_ROWS = ROW_Y.length;
  const REQUEST_TIMEOUT_MS = 7000;
  const OUTCOME_LABELS = Object.freeze({
    box: Object.freeze({ retry: "상자 준비" }),
    rocket: Object.freeze({
      retry: "출발 준비",
      mercury: "수성",
      venus: "금성",
      earth: "지구",
      mars: "화성",
      jupiter: "목성",
      saturn: "토성",
      uranus: "천왕성",
      neptune: "해왕성",
      andromeda: "안드로메다"
    }),
    island: Object.freeze({
      retry: "출발섬",
      start: "출발섬",
      sand: "모래섬",
      forest: "숲섬",
      cloud: "구름섬",
      starlight: "별빛섬",
      rainbow: "무지개섬"
    }),
    fusion: Object.freeze({
      retry: "합체 준비",
      small: "소형 로봇",
      medium: "중형 로봇",
      large: "대형 로봇",
      giant: "거대 로봇",
      ultra: "초거대 로봇",
      legend: "전설 로봇"
    })
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function mount(root) {
    if (!root || root.querySelector(".mathmon-scoreboard-stage")) return root;
    const title = root.dataset.scoreboardTitle || "전국 순위";
    const titleArt = root.dataset.scoreboardTitleArt || "";
    const scoreLabel = root.dataset.scoreboardScoreLabel || "내 점수";
    const listTitle = root.dataset.scoreboardListTitle || "점수 순위";
    const unit = root.dataset.scoreboardUnit || "";
    const brand = root.dataset.scoreboardBrand || "에듀잇티 수학 게임";
    const kicker = root.dataset.scoreboardKicker || "이번 주 전국 순위";
    const titleMarkup = titleArt
      ? `<title id="scoreboardTitle">${escapeHtml(title)}</title>
            <image class="mathmon-scoreboard-title-art" href="${escapeHtml(titleArt)}" x="350" y="38" width="580" height="184" preserveAspectRatio="xMidYMid meet"></image>`
      : `<text class="mathmon-scoreboard-kicker" x="640" y="106">${escapeHtml(kicker)}</text>
            <text class="mathmon-scoreboard-title" id="scoreboardTitle" x="640" y="138" filter="url(#scoreboardTitleShadow)">${escapeHtml(title)}</text>`;
    root.insertAdjacentHTML("afterbegin", `
      <svg class="mathmon-scoreboard-stage" viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid meet" aria-hidden="false">
        <defs>
          <linearGradient id="scoreboardTitleGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"></stop>
            <stop offset="34%" stop-color="#fff6d1"></stop>
            <stop offset="72%" stop-color="#ffc857"></stop>
            <stop offset="100%" stop-color="#f38b1f"></stop>
          </linearGradient>
          <linearGradient id="scoreboardGoldStroke" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#fff8b5"></stop>
            <stop offset="44%" stop-color="#ffbf3d"></stop>
            <stop offset="100%" stop-color="#a85a11"></stop>
          </linearGradient>
          <linearGradient id="scoreboardBoardGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#174a97" stop-opacity="0.96"></stop>
            <stop offset="48%" stop-color="#0b285d" stop-opacity="0.95"></stop>
            <stop offset="100%" stop-color="#07173b" stop-opacity="0.97"></stop>
          </linearGradient>
          <linearGradient id="scoreboardPanelGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#214f9f" stop-opacity="0.82"></stop>
            <stop offset="58%" stop-color="#12346f" stop-opacity="0.72"></stop>
            <stop offset="100%" stop-color="#071f4d" stop-opacity="0.84"></stop>
          </linearGradient>
          <linearGradient id="scoreboardCardGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#3268bb" stop-opacity="0.74"></stop>
            <stop offset="100%" stop-color="#0c2b66" stop-opacity="0.86"></stop>
          </linearGradient>
          <linearGradient id="scoreboardRowGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stop-color="#133c82" stop-opacity="0.72"></stop>
            <stop offset="50%" stop-color="#09285f" stop-opacity="0.68"></stop>
            <stop offset="100%" stop-color="#103878" stop-opacity="0.72"></stop>
          </linearGradient>
          <linearGradient id="scoreboardButtonGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#1fb9c5"></stop>
            <stop offset="52%" stop-color="#0d7891"></stop>
            <stop offset="100%" stop-color="#095167"></stop>
          </linearGradient>
          <linearGradient id="scoreboardButtonPrimaryGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#2ee5dc"></stop>
            <stop offset="52%" stop-color="#0f8aa4"></stop>
            <stop offset="100%" stop-color="#075e75"></stop>
          </linearGradient>
          <filter id="scoreboardTextShadow" x="-20%" y="-50%" width="140%" height="220%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000a24" flood-opacity="0.82"></feDropShadow>
          </filter>
          <filter id="scoreboardTitleShadow" x="-20%" y="-50%" width="140%" height="220%">
            <feDropShadow dx="0" dy="3" stdDeviation="0" flood-color="#2f1500" flood-opacity="0.54"></feDropShadow>
            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ffc857" flood-opacity="0.38"></feDropShadow>
          </filter>
          <filter id="scoreboardBoardShadow" x="-8%" y="-8%" width="116%" height="120%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#020817" flood-opacity="0.62"></feDropShadow>
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#1df8ff" flood-opacity="0.18"></feDropShadow>
          </filter>
          <clipPath id="scoreboardRowsClip">
            <rect x="174" y="392" width="932" height="222" rx="20"></rect>
          </clipPath>
        </defs>
        <image class="mathmon-scoreboard-stage-art" href="../_shared/scoreboard/scoreboard-celebration-bg-generated.webp" x="0" y="0" width="1280" height="800" preserveAspectRatio="xMidYMid slice"></image>
        <rect class="mathmon-scoreboard-bg-dim" x="0" y="0" width="1280" height="800"></rect>
        <g class="mathmon-scoreboard-ui" filter="url(#scoreboardBoardShadow)">
          <rect class="mathmon-scoreboard-board" x="108" y="104" width="1064" height="628" rx="38"></rect>
          <rect class="mathmon-scoreboard-board-inner" x="134" y="132" width="1012" height="572" rx="30"></rect>
          <rect class="mathmon-scoreboard-plaque" x="400" y="78" width="480" height="98" rx="24"></rect>
          <rect class="mathmon-scoreboard-plaque-inner" x="424" y="96" width="432" height="64" rx="17"></rect>
          <g class="mathmon-scoreboard-copy" filter="url(#scoreboardTextShadow)">
            ${titleMarkup}
            <g class="mathmon-scoreboard-metrics" aria-label="내 기록">
              <rect class="mathmon-scoreboard-card" x="174" y="222" width="286" height="88" rx="16"></rect>
              <rect class="mathmon-scoreboard-card" x="497" y="222" width="286" height="88" rx="16"></rect>
              <rect class="mathmon-scoreboard-card" x="820" y="222" width="286" height="88" rx="16"></rect>
              <text class="mathmon-scoreboard-label" x="214" y="248">내 이름</text>
              <text class="mathmon-scoreboard-value" id="scoreboardNickname" x="214" y="282" data-scoreboard-nickname>준비 중</text>
              <text class="mathmon-scoreboard-label" x="537" y="248">${escapeHtml(scoreLabel)}</text>
              <text class="mathmon-scoreboard-value" id="scoreboardScore" x="537" y="282" data-scoreboard-score>0</text>
              <text class="mathmon-scoreboard-label" x="860" y="248">내 등수</text>
              <text class="mathmon-scoreboard-value mathmon-scoreboard-rank-value" id="scoreboardRank" x="860" y="282" data-scoreboard-rank>기록 전</text>
            </g>
            <g class="mathmon-scoreboard-list-frame">
              <rect class="mathmon-scoreboard-list-panel" x="174" y="334" width="932" height="286" rx="24"></rect>
              <rect class="mathmon-scoreboard-list-header" x="174" y="334" width="932" height="54" rx="22"></rect>
              <text class="mathmon-scoreboard-head-left" x="214" y="361">10위까지</text>
              <text class="mathmon-scoreboard-head-title" id="leaderboardTitle" x="640" y="361">${escapeHtml(listTitle)}</text>
              <text class="mathmon-scoreboard-head-week" id="leaderboardUpdated" x="1066" y="361" data-scoreboard-week>이번 주</text>
              <rect class="mathmon-scoreboard-row-slot" x="190" y="398" width="900" height="48" rx="17"></rect>
              <rect class="mathmon-scoreboard-row-slot" x="190" y="452" width="900" height="48" rx="17"></rect>
              <rect class="mathmon-scoreboard-row-slot" x="190" y="506" width="900" height="48" rx="17"></rect>
              <rect class="mathmon-scoreboard-row-slot" x="190" y="560" width="900" height="48" rx="17"></rect>
              <rect class="mathmon-scoreboard-scroll-track" x="1096" y="404" width="5" height="198" rx="3"></rect>
            </g>
            <g class="mathmon-scoreboard-list" id="leaderboardList" clip-path="url(#scoreboardRowsClip)" data-scoreboard-list></g>
            <rect class="mathmon-scoreboard-list-hitbox" x="174" y="392" width="932" height="222" data-scoreboard-list-viewport></rect>
            <g class="mathmon-scoreboard-action-labels">
              <rect class="mathmon-scoreboard-button-face is-primary" x="642" y="648" width="142" height="58" rx="24"></rect>
              <rect class="mathmon-scoreboard-button-face" x="804" y="648" width="142" height="58" rx="24"></rect>
              <rect class="mathmon-scoreboard-button-face" x="966" y="648" width="142" height="58" rx="24"></rect>
              <text class="mathmon-scoreboard-action-label is-primary" x="713" y="678">새로 보기</text>
              <text class="mathmon-scoreboard-action-label" x="875" y="678">결과로</text>
              <text class="mathmon-scoreboard-action-label" x="1037" y="678">다시하기</text>
            </g>
          </g>
        </g>
      </svg>
      <div class="mathmon-scoreboard-hitboxes" aria-label="순위 화면 조작">
        <button class="mathmon-scoreboard-hitbox" id="scoreboardRefreshButton" data-scoreboard-refresh type="button" style="--x: 642; --y: 648; --w: 142; --h: 58;" aria-label="새로 보기"></button>
        <button class="mathmon-scoreboard-hitbox" id="scoreboardResultButton" type="button" style="--x: 804; --y: 648; --w: 142; --h: 58;" aria-label="결과로"></button>
        <button class="mathmon-scoreboard-hitbox" id="scoreboardRestartButton" type="button" style="--x: 966; --y: 648; --w: 142; --h: 58;" aria-label="다시하기"></button>
      </div>
      <div class="top-row">
        <span class="brand-badge"><img src="eduitit-logo-mark.png" alt="">${escapeHtml(brand)}</span>
        <span class="unit-badge">${escapeHtml(unit)}</span>
      </div>
    `);
    return root;
  }

  function text(root, selector, value) {
    const element = root.querySelector(selector);
    if (element) element.textContent = value;
  }

  function clearList(root) {
    const list = root.querySelector("[data-scoreboard-list]");
    if (list) list.textContent = "";
    return list;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function truncate(value, maxLength) {
    const textValue = String(value);
    if (textValue.length <= maxLength) return textValue;
    return `${textValue.slice(0, maxLength - 1)}…`;
  }

  function objectValue(value, key) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return "";
    const propertyValue = value[key];
    if (typeof propertyValue === "string" || typeof propertyValue === "number") {
      return String(propertyValue);
    }
    return "";
  }

  function resultKind(root) {
    return root.dataset.scoreboardResultKind || "score";
  }

  function outcomeFromRewardResult(kind, rewardResult) {
    if (kind === "box") {
      return objectValue(rewardResult, "mathmonName") || OUTCOME_LABELS.box.retry;
    }
    if (kind === "rocket") {
      const id = objectValue(rewardResult, "destinationId") || objectValue(rewardResult, "id");
      return OUTCOME_LABELS.rocket[id] || OUTCOME_LABELS.rocket.retry;
    }
    if (kind === "island") {
      const id = objectValue(rewardResult, "islandId") || objectValue(rewardResult, "id");
      return OUTCOME_LABELS.island[id] || OUTCOME_LABELS.island.retry;
    }
    if (kind === "fusion") {
      const id = objectValue(rewardResult, "gradeId") || objectValue(rewardResult, "id");
      return OUTCOME_LABELS.fusion[id] || OUTCOME_LABELS.fusion.retry;
    }
    return "";
  }

  function mainRecordValue(root, rewardResult, score, options = {}) {
    const kind = resultKind(root);
    if (kind === "score") return options.withPoint ? `${score}점` : String(score);
    const outcome = outcomeFromRewardResult(kind, rewardResult);
    if (outcome) return outcome;
    return options.submitted ? "기록 완료" : "준비 중";
  }

  function svgElement(tagName, attributes = {}) {
    const element = document.createElementNS(SVG_NS, tagName);
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, String(value));
    });
    return element;
  }

  function appendSvgText(parent, className, x, y, value, maxLength) {
    const element = svgElement("text", { class: className, x, y });
    element.textContent = maxLength ? truncate(value, maxLength) : String(value);
    parent.appendChild(element);
    return element;
  }

  function appendEmpty(list, message) {
    appendSvgText(list, "mathmon-scoreboard-empty", 640, 506, message, 34);
  }

  function appendEntry(root, list, entry, myRank, totalQuestions, rowIndex) {
    const group = svgElement("g", { class: "mathmon-scoreboard-row" });
    const y = ROW_Y[rowIndex];
    if (entry.rank === myRank) {
      group.classList.add("is-mine");
      group.appendChild(svgElement("rect", {
        class: "mathmon-scoreboard-row-highlight",
        x: 190,
        y: y - ROW_HEIGHT / 2,
        width: 900,
        height: ROW_HEIGHT,
        rx: 17
      }));
    }

    appendSvgText(group, "mathmon-scoreboard-rank", 238, y, entry.rank);
    appendSvgText(group, "mathmon-scoreboard-name", 300, y, entry.nickname, 12);
    appendSvgText(
      group,
      "mathmon-scoreboard-score",
      952,
      y,
      mainRecordValue(root, entry.rewardResult, entry.score, { submitted: true, withPoint: true }),
      10
    );
    appendSvgText(group, "mathmon-scoreboard-correct", 1052, y, `${entry.correctCount}/${totalQuestions}`);

    list.appendChild(group);
  }

  function statusText(state) {
    if (!state.apiEnabled) return "선생님이 순위 기능을 켜면 전국 순위를 볼 수 있어요.";
    if (state.loading) return "기록을 보내고 순위를 불러오고 있어요.";
    if (state.error) return "순위를 불러오지 못했어요. 조금 뒤 다시 눌러요.";
    if (state.submission) return `${state.submission.nickname} 이름으로 기록했어요.`;
    if (state.session) return "이름이 정해졌어요. 결과를 보내면 순위가 보여요.";
    return "이름 정하는 중이에요.";
  }

  function emptyText(state) {
    if (!state.apiEnabled) return "순위 기능이 켜지면 여기에 10위까지 보여요.";
    if (state.loading) return "순위를 불러오고 있어요.";
    if (state.error) return "지금은 순위를 볼 수 없어요.";
    return "이번 주 기록이 아직 없어요.";
  }

  function getMaxOffset(entryCount) {
    return Math.max(0, entryCount - VISIBLE_ROWS);
  }

  function getOffset(root, entryCount) {
    const offset = Number.parseInt(root.dataset.scoreboardListOffset || "0", 10);
    return clamp(Number.isFinite(offset) ? offset : 0, 0, getMaxOffset(entryCount));
  }

  function setOffset(root, entryCount, offset) {
    root.dataset.scoreboardListOffset = String(clamp(offset, 0, getMaxOffset(entryCount)));
  }

  function installListControls(root) {
    if (root.dataset.scoreboardListControls === "ready") return;
    const viewport = root.querySelector("[data-scoreboard-list-viewport]");
    if (!viewport) return;
    root.dataset.scoreboardListControls = "ready";

    viewport.addEventListener("wheel", (event) => {
      const state = root.__mathmonScoreboardState;
      if (!state) return;
      const entryCount = state.entries.slice(0, 10).length;
      if (entryCount <= VISIBLE_ROWS) return;
      event.preventDefault();
      const direction = event.deltaY > 0 ? 1 : -1;
      setOffset(root, entryCount, getOffset(root, entryCount) + direction);
      render(state);
    }, { passive: false });

    let dragStartY = null;
    let dragStartOffset = 0;
    viewport.addEventListener("pointerdown", (event) => {
      const state = root.__mathmonScoreboardState;
      if (!state) return;
      const entryCount = state.entries.slice(0, 10).length;
      if (entryCount <= VISIBLE_ROWS) return;
      dragStartY = event.clientY;
      dragStartOffset = getOffset(root, entryCount);
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener("pointermove", (event) => {
      const state = root.__mathmonScoreboardState;
      if (!state || dragStartY === null) return;
      const entryCount = state.entries.slice(0, 10).length;
      const deltaRows = Math.round((dragStartY - event.clientY) / ROW_STEP);
      setOffset(root, entryCount, dragStartOffset + deltaRows);
      render(state);
    });
    viewport.addEventListener("pointerup", () => {
      dragStartY = null;
    });
    viewport.addEventListener("pointercancel", () => {
      dragStartY = null;
    });
  }

  function render(state) {
    const root = state.root;
    mount(root);
    root.__mathmonScoreboardState = state;
    installListControls(root);
    if (new URLSearchParams(window.location.search).has("scoreboardDebug")) {
      root.dataset.layoutDebug = "true";
    }
    const entries = state.entries.slice(0, 10);
    const list = clearList(root);
    const myRank = state.myEntry ? state.myEntry.rank : null;
    const rankLabel = state.myEntry ? `${state.myEntry.rank}위` : state.submission ? "100위 밖" : "기록 전";

    text(root, "[data-scoreboard-status]", truncate(statusText(state), 34));
    text(root, "[data-scoreboard-nickname]", truncate(state.session ? state.session.nickname : "준비 중", 9));
    text(root, "[data-scoreboard-score]", truncate(
      mainRecordValue(root, state.rewardResult, state.score, { submitted: Boolean(state.submission) }),
      10
    ));
    text(root, "[data-scoreboard-rank]", rankLabel);
    text(root, "[data-scoreboard-week]", truncate(state.weekLabel, 12));

    const refresh = root.querySelector("[data-scoreboard-refresh]");
    if (refresh) refresh.disabled = state.loading || !state.apiEnabled;

    if (!list) return;
    if (!state.apiEnabled || state.loading || state.error || entries.length === 0) {
      setOffset(root, 0, 0);
      appendEmpty(list, emptyText(state));
      return;
    }

    const offset = getOffset(root, entries.length);
    setOffset(root, entries.length, offset);
    entries
      .slice(offset, offset + VISIBLE_ROWS)
      .forEach((entry, rowIndex) => appendEntry(root, list, entry, myRank, state.totalQuestions, rowIndex));
  }

  function getElapsedMs(startedAt) {
    return Math.max(0, Math.round(performance.now()) - startedAt);
  }

  function createApiBridge(options) {
    const root = mount(options.root);
    const state = {
      session: null,
      sessionPromise: null,
      submission: null,
      entries: [],
      loading: false,
      error: "",
      gameStartedAt: 0
    };

    function getApiUrl() {
      return String(options.apiUrl || "").trim().replace(/\/+$/, "");
    }

    function renderBridge() {
      if (!root) return;
      render({
        root,
        apiEnabled: Boolean(getApiUrl()),
        loading: state.loading,
        error: Boolean(state.error),
        session: state.session,
        submission: state.submission,
        score: options.getScore(),
        rewardResult: options.getRewardResult(),
        myEntry: findMyLeaderboardEntry(),
        weekLabel: getLeaderboardWeekLabel(),
        entries: state.entries,
        totalQuestions: options.totalQuestions
      });
    }

    async function requestScoreboard(path, requestOptions = {}) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(`${getApiUrl()}${path}`, {
          method: requestOptions.method || "GET",
          headers: requestOptions.body ? { "content-type": "application/json" } : undefined,
          body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined,
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`scoreboard_${response.status}`);
        return response.json();
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    function startSession() {
      if (!getApiUrl()) return null;
      return requestScoreboard("/api/v1/sessions", {
        method: "POST",
        body: { lessonId: options.lessonId }
      }).then((session) => {
        state.session = session;
        renderBridge();
        return session;
      }).catch((error) => {
        if (error instanceof Error) {
          state.error = "session";
          renderBridge();
          return null;
        }
        throw error;
      });
    }

    function reset() {
      state.session = null;
      state.submission = null;
      state.entries = [];
      state.loading = false;
      state.error = "";
      state.gameStartedAt = Math.round(performance.now());
      state.sessionPromise = startSession();
      renderBridge();
    }

    async function submitScoreboardIfNeeded() {
      if (!getApiUrl()) return null;
      if (state.submission) return state.submission;
      const session = state.session || (state.sessionPromise ? await state.sessionPromise : null);
      if (!session) throw new Error("scoreboard_session_unavailable");
      const submission = await requestScoreboard("/api/v1/scores", {
        method: "POST",
        body: {
          sessionId: session.sessionId,
          lessonId: options.lessonId,
          nickname: session.nickname,
          clientScore: String(options.getScore()),
          clientCorrectCount: options.getCorrectCount(),
          playTimeMs: getElapsedMs(state.gameStartedAt),
          answers: options.getAnswers(),
          rewardResult: options.getRewardResult()
        }
      });
      state.submission = submission;
      return submission;
    }

    async function loadWeeklyLeaderboard() {
      const query = `lessonId=${encodeURIComponent(options.lessonId)}&limit=100`;
      const body = await requestScoreboard(`/api/v1/leaderboards/weekly?${query}`);
      state.entries = Array.isArray(body.entries) ? body.entries : [];
    }

    function findMyLeaderboardEntry() {
      const submission = state.submission;
      if (!submission) return null;
      return state.entries.find((entry) =>
        entry.nickname === submission.nickname &&
        String(entry.score) === String(submission.score) &&
        Number(entry.correctCount) === Number(submission.correctCount)
      ) || null;
    }

    function getLeaderboardWeekLabel() {
      const firstEntry = state.entries[0];
      if (firstEntry && firstEntry.weekStart) return `${firstEntry.weekStart} 주`;
      return "이번 주";
    }

    async function refresh() {
      if (!getApiUrl()) {
        state.error = "";
        renderBridge();
        return;
      }
      state.loading = true;
      state.error = "";
      renderBridge();
      try {
        await submitScoreboardIfNeeded();
        await loadWeeklyLeaderboard();
      } catch (error) {
        if (error instanceof Error) {
          state.error = "network";
          return;
        }
        throw error;
      } finally {
        state.loading = false;
        renderBridge();
      }
    }

    function open() {
      if (typeof options.playSound === "function") options.playSound();
      options.showScoreboard();
      refresh();
    }

    const refreshButton = root ? root.querySelector("[data-scoreboard-refresh]") : null;
    const resultButton = root ? root.querySelector("#scoreboardResultButton") : null;
    const restartButton = root ? root.querySelector("#scoreboardRestartButton") : null;
    if (refreshButton) refreshButton.addEventListener("click", refresh);
    if (resultButton) resultButton.addEventListener("click", options.showResult);
    if (restartButton) restartButton.addEventListener("click", options.restart);

    return Object.freeze({
      reset,
      start: reset,
      open,
      refresh,
      render: renderBridge,
      getSession: () => state.session
    });
  }

  window.MathmonScoreboard = Object.freeze({ mount, render, createApiBridge });
})();
