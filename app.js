const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

const levelNames = {
  8: "UTG強",
  7: "UTG中",
  6: "UTG弱",
  5: "EP",
  4: "LJ/HJ",
  3: "CO",
  2: "BTN",
  1: "BB対BTNコール",
  0: "フォールド",
};

const legendItems = [
  [8, "UTGの強ハンド"],
  [7, "UTGの中ハンド"],
  [6, "UTGの弱ハンド"],
  [5, "EPのハンド"],
  [4, "LJ/HJのハンド"],
  [3, "COのハンド"],
  [2, "BTNの追加ハンド"],
  [1, "BBのみコール候補"],
  [0, "フォールド"],
];

const readerCategories = [
  ["made", "強い完成役", "ツーペア以上・強いペア"],
  ["topPair", "トップペア", "ボード最高カードにヒット"],
  ["secondPair", "セカンドペア", "2番目以下のボードカードにヒット"],
  ["draw", "ドロー", "ストレート/フラッシュの伸びしろ"],
  ["overcards", "オーバーカード", "未ヒットだが高いカード2枚"],
  ["underpair", "中小ペア", "ボードより下のポケット"],
  ["air", "空振り", "ヒットも強いドローも薄い"],
];

let readerScenarios = [
  {
    id: "btn-cbet-a72",
    title: "BTN vs BB / A72r / 小CB",
    heroPosition: "BB",
    villainPosition: "BTN",
    board: "A72r",
    line: "BTNがオープン、BBがコール。フロップ A72r でBTNが小さくCB。",
    action: "BTNの小CB後に、BTN側にまだ残りやすいハンド群を選ぶ。",
    keep: ["made", "topPair", "overcards", "air"],
    notes: ["Aハイボードの小CBはレンジ全体で打ちやすい。", "強いAだけでなく、KQ/KJのような空振りも残りやすい。"],
    insights: [
      {
        title: "なぜこのハンド？",
        body: "BTNはA72rでレンジ優位が大きく、33%CBを広く使いやすい。強いAxやセットだけでなく、88のような中程度SDVやKQ/KJの空振りも一部ベットに混ざる。",
      },
      {
        title: "レンジ内の役割",
        body: "セットや強いAxはバリュー、88-TTは薄いプロテクション兼SDV、KQ/KJ/QJは小さいサイズでフォールドを作る候補。小CBなので強い手だけに絞らない。",
      },
      {
        title: "ここまでの経路",
        body: "この時点ではフロップCBを打った全体レンジを見ている。ハンド単体で毎回打つかではなく、各ハンドの一部がCBラインに入ると考える。",
      },
    ],
  },
  {
    id: "utg-barrel-kq7",
    title: "UTG vs BTN / KQ7ss / ターン大きめ",
    heroPosition: "BTN",
    villainPosition: "UTG",
    board: "KQ7ss",
    line: "UTGがオープン、BTNがコール。KQ7ssでCB、ターンも大きくベット。",
    action: "UTGの連続ベット後に、UTG側に濃く残るハンド群を選ぶ。",
    keep: ["made", "topPair", "draw"],
    notes: ["早い位置の連続ベットは強いKx/Qxと強いドローに寄りやすい。", "完全な空振りは小CB単発よりかなり減る。"],
  },
  {
    id: "co-check-986",
    title: "CO vs BB / 986tt / チェックバック",
    heroPosition: "BB",
    villainPosition: "CO",
    board: "986tt",
    line: "COがオープン、BBがコール。986ツートーンでCOがチェックバック。",
    action: "COのチェックバック後に、CO側に残りやすいハンド群を選ぶ。",
    keep: ["underpair", "overcards", "air", "draw"],
    notes: ["ミドル連結ボードはBB側にも強く当たりやすい。", "チェックには諦め、ショーダウン狙い、弱めのドローが混ざる。"],
  },
  {
    id: "bb-donk-t54",
    title: "BB防衛 / T54r / ドンク",
    heroPosition: "BTN",
    villainPosition: "BB",
    board: "T54r",
    line: "BTNがオープン、BBがコール。T54rでBBが小さくドンク。",
    action: "BBのドンク後に、BB側に残りやすいハンド群を選ぶ。",
    keep: ["made", "topPair", "draw", "underpair"],
    notes: ["BBは低中ボードに多くヒットしやすい。", "トップペア、ペア+ドロー、弱い完成役の保護ベットが残る。"],
  },
];

const cashMatrix = [
  [8, 8, 7, 7, 7, 5, 5, 5, 5, 5, 5, 5, 5],
  [8, 8, 7, 6, 5, 5, 3, 3, 3, 3, 3, 3, 3],
  [7, 6, 8, 6, 5, 4, 3, 3, 3, 2, 2, 2, 2],
  [6, 5, 4, 7, 6, 4, 3, 3, 2, 1, 1, 1, 1],
  [5, 4, 3, 4, 7, 5, 4, 2, 1, 1, 1, 1, 0],
  [4, 3, 3, 3, 3, 7, 4, 3, 2, 1, 0, 0, 0],
  [3, 0, 0, 1, 1, 2, 6, 3, 2, 1, 0, 0, 0],
  [3, 1, 1, 0, 0, 1, 0, 6, 3, 2, 0, 0, 0],
  [2, 1, 0, 0, 0, 0, 0, 0, 5, 3, 0, 1, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
];

const storageKey = "preflop-trainer-v1";
const paintStorageKey = "preflop-range-coloring-v1";
const drillLabels = {
  all: "全部",
  open: "未参加ポット",
  vsOpen: "相手オープン対応",
  bbDefense: "BBディフェンス",
  mistakes: "苦手だけ",
};

const seatPositions = {
  UTG: { x: 22, y: 22 },
  EP: { x: 50, y: 13 },
  "LJ/HJ": { x: 78, y: 22 },
  CO: { x: 84, y: 72 },
  BTN: { x: 50, y: 86 },
  BB: { x: 16, y: 72 },
};

const mobileSeatPositions = {
  UTG: { x: 28, y: 24 },
  EP: { x: 50, y: 15 },
  "LJ/HJ": { x: 72, y: 24 },
  CO: { x: 72, y: 72 },
  BTN: { x: 50, y: 84 },
  BB: { x: 28, y: 72 },
};

const state = {
  page: "trainer",
  mode: "cash",
  studyMode: "withChart",
  current: null,
  answered: false,
  reviewHand: null,
  recentHeroPositions: [],
  recentQuestionIds: [],
  recentKinds: [],
  stats: loadStats(),
  paint: {
    selectedLevel: 8,
    drillMode: "all",
    bandLevel: 8,
    entries: loadPaintEntries(),
    mistakes: loadPaintMistakes(),
    checked: false,
    revealed: false,
    isPainting: false,
    draggedHands: new Set(),
    dragChanged: false,
  },
  reader: {
    scenarioId: readerScenarios[0].id,
    selectedHands: new Set(),
    checked: false,
    revealed: false,
    isDragging: false,
    dragMode: "add",
    draggedHands: new Set(),
    suppressClick: false,
  },
  renderedOnce: false,
};

const els = {
  pageButtons: document.querySelectorAll("[data-page]"),
  trainerControls: document.querySelectorAll(".trainerControl"),
  modeButtons: document.querySelectorAll("[data-mode]"),
  studyButtons: document.querySelectorAll("[data-study-mode]"),
  studyFlow: document.querySelector(".studyFlow"),
  trainer: document.querySelector(".trainer"),
  coloringPage: document.querySelector("#coloringPage"),
  readerPage: document.querySelector("#readerPage"),
  skipMastered: document.querySelector("#skipMastered"),
  scenarioType: document.querySelector("#scenarioType"),
  handText: document.querySelector("#handText"),
  situationText: document.querySelector("#situationText"),
  actions: document.querySelector("#actions"),
  feedback: document.querySelector("#feedback"),
  nextQuestion: document.querySelector("#nextQuestion"),
  markMastered: document.querySelector("#markMastered"),
  accuracy: document.querySelector("#accuracy"),
  streak: document.querySelector("#streak"),
  masteredCount: document.querySelector("#masteredCount"),
  weakCount: document.querySelector("#weakCount"),
  drillMode: document.querySelector("#drillMode"),
  rangeGrid: document.querySelector("#rangeGrid"),
  legend: document.querySelector("#legend"),
  showChart: document.querySelector("#showChart"),
  resetStats: document.querySelector("#resetStats"),
  chartDialog: document.querySelector("#chartDialog"),
  closeChart: document.querySelector("#closeChart"),
  chartImage: document.querySelector("#chartImage"),
  chartTitle: document.querySelector("#chartTitle"),
  modeNote: document.querySelector("#modeNote"),
  seatLayer: document.querySelector("#seatLayer"),
  heroCards: document.querySelector("#heroCards"),
  tableStatus: document.querySelector("#tableStatus"),
  resultBurst: document.querySelector("#resultBurst"),
  rangePanel: document.querySelector(".rangePanel"),
  memoryCoach: document.querySelector("#memoryCoach"),
  cueRule: document.querySelector("#cueRule"),
  cueHand: document.querySelector("#cueHand"),
  cueProgress: document.querySelector("#cueProgress"),
  whyPanel: document.querySelector("#whyPanel"),
  whyTitle: document.querySelector("#whyTitle"),
  whyList: document.querySelector("#whyList"),
  paintPalette: document.querySelector("#paintPalette"),
  paintGrid: document.querySelector("#paintGrid"),
  paintAccuracy: document.querySelector("#paintAccuracy"),
  paintFilled: document.querySelector("#paintFilled"),
  paintDrillMode: document.querySelector("#paintDrillMode"),
  paintBand: document.querySelector("#paintBand"),
  paintCheck: document.querySelector("#paintCheck"),
  paintReveal: document.querySelector("#paintReveal"),
  paintClear: document.querySelector("#paintClear"),
  paintStatus: document.querySelector("#paintStatus"),
  paintReview: document.querySelector("#paintReview"),
  paintModeNote: document.querySelector("#paintModeNote"),
  readerScenario: document.querySelector("#readerScenario"),
  readerBoard: document.querySelector("#readerBoard"),
  readerLine: document.querySelector("#readerLine"),
  readerHero: document.querySelector("#readerHero"),
  readerVillain: document.querySelector("#readerVillain"),
  readerTask: document.querySelector("#readerTask"),
  readerAction: document.querySelector("#readerAction"),
  readerPick: document.querySelector("#readerPick"),
  readerRandom: document.querySelector("#readerRandom"),
  readerCheck: document.querySelector("#readerCheck"),
  readerReveal: document.querySelector("#readerReveal"),
  readerReset: document.querySelector("#readerReset"),
  readerGrid: document.querySelector("#readerGrid"),
  readerStatus: document.querySelector("#readerStatus"),
  readerScore: document.querySelector("#readerScore"),
  readerCombos: document.querySelector("#readerCombos"),
  readerCaseCount: document.querySelector("#readerCaseCount"),
  readerResult: document.querySelector("#readerResult"),
  readerLegend: document.querySelector("#readerLegend"),
  readerNotes: document.querySelector("#readerNotes"),
};

function handAt(row, col) {
  if (row === col) return ranks[row] + ranks[col];
  return ranks[Math.min(row, col)] + ranks[Math.max(row, col)] + (row < col ? "s" : "o");
}

function allHands() {
  const hands = [];
  for (let row = 0; row < 13; row += 1) {
    for (let col = 0; col < 13; col += 1) {
      hands.push({ hand: handAt(row, col), row, col, baseLevel: cashMatrix[row][col] });
    }
  }
  return hands;
}

function effectiveLevel(baseLevel) {
  return state.mode === "tournament" ? Math.min(8, baseLevel + 1) : baseLevel;
}

function openingThreshold(position) {
  return { UTG: 6, EP: 5, "LJ/HJ": 4, CO: 3, BTN: 2 }[position];
}

function answerFor(question) {
  const strength = effectiveLevel(question.baseLevel);
  if (question.kind === "open") {
    return strength >= openingThreshold(question.heroPosition) ? "open" : "fold";
  }

  if (question.kind === "bbDefense") {
    const callThreshold = { "LJ/HJ": 4, CO: 3, BTN: 1 }[question.villainPosition];
    if (strength >= callThreshold + 2) return "raise";
    if (strength >= callThreshold) return "call";
    return "fold";
  }

  const threshold = openingThreshold(question.villainPosition);
  if (strength >= threshold + 2) return "raise";
  if (strength >= threshold + 1) return "call";
  return "fold";
}

function makeQuestion() {
  const candidates = marginalQuestions().filter((question) => {
    if (els.skipMastered.checked && state.stats.mastered[question.id]) return false;
    if (!matchesDrill(question)) return false;
    if (state.recentQuestionIds.includes(question.id)) return false;
    return true;
  });
  const varied = candidates.filter((question) => {
    return !state.recentHeroPositions.includes(heroPositionFor(question)) && !state.recentKinds.includes(question.kind);
  });
  const positionVaried = candidates.filter((question) => !state.recentHeroPositions.includes(heroPositionFor(question)));
  const pool = varied.length >= 8 ? varied : positionVaried.length >= 8 ? positionVaried : candidates;
  const question = weightedPick(pool) || marginalQuestions().find(matchesDrill) || marginalQuestions()[0];
  rememberQuestion(question);
  return question;
}

function matchesDrill(question) {
  const drill = els.drillMode.value;
  if (drill === "all") return true;
  if (drill === "mistakes") {
    const progress = state.stats.progress[question.id];
    return Boolean(progress && progress.wrong > 0 && !state.stats.mastered[question.id]);
  }
  return question.kind === drill;
}

function weightedPick(pool) {
  if (!pool.length) return null;
  const weighted = pool.map((question) => {
    const progress = state.stats.progress[question.id] || { correct: 0, wrong: 0 };
    const weakBoost = progress.wrong * 6;
    const learningBoost = Math.max(0, 3 - progress.correct) * 1.5;
    const masteredPenalty = state.stats.mastered[question.id] ? -4 : 0;
    return { question, weight: Math.max(1, 4 + weakBoost + learningBoost + masteredPenalty) };
  });
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;
  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) return item.question;
  }
  return weighted[weighted.length - 1].question;
}

function marginalQuestions() {
  const questions = [];
  allHands().forEach((hand) => {
    ["UTG", "EP", "LJ/HJ", "CO", "BTN"].forEach((heroPosition) => {
      const question = { ...hand, kind: "open", heroPosition };
      addIfMarginal(questions, question);
    });

    ["UTG", "EP", "LJ/HJ", "CO"].forEach((villainPosition) => {
      const question = { ...hand, kind: "vsOpen", villainPosition };
      addIfMarginal(questions, question);
    });

    ["LJ/HJ", "CO", "BTN"].forEach((villainPosition) => {
      const question = { ...hand, kind: "bbDefense", villainPosition };
      addIfMarginal(questions, question);
    });
  });
  return questions;
}

function addIfMarginal(list, question) {
  if (!isMarginal(question)) return;
  question.correct = answerFor(question);
  question.id = questionId(question);
  list.push(question);
}

function isMarginal(question) {
  if (["AA", "KK", "AKs", "AKo"].includes(question.hand)) return false;
  const strength = effectiveLevel(question.baseLevel);
  const onBoundary = isActionBoundary(question);
  if (question.kind === "open") {
    const threshold = openingThreshold(question.heroPosition);
    return onBoundary && strength >= threshold - 1 && strength <= threshold + 1;
  }
  if (question.kind === "bbDefense") {
    const callThreshold = { "LJ/HJ": 4, CO: 3, BTN: 1 }[question.villainPosition];
    return onBoundary && strength >= callThreshold - 1 && strength <= callThreshold + 2;
  }
  const threshold = openingThreshold(question.villainPosition);
  return onBoundary && strength >= threshold && strength <= threshold + 2;
}

function isActionBoundary(question) {
  const currentAction = answerFor(question);
  const offsets = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  return offsets.some(([rowOffset, colOffset]) => {
    const row = question.row + rowOffset;
    const col = question.col + colOffset;
    if (row < 0 || row > 12 || col < 0 || col > 12) return false;
    const neighbor = { ...question, hand: handAt(row, col), row, col, baseLevel: cashMatrix[row][col] };
    return answerFor(neighbor) !== currentAction;
  });
}

function rememberQuestion(question) {
  state.recentHeroPositions.unshift(heroPositionFor(question));
  state.recentHeroPositions = state.recentHeroPositions.slice(0, 2);
  state.recentQuestionIds.unshift(question.id);
  state.recentQuestionIds = state.recentQuestionIds.slice(0, 12);
  state.recentKinds.unshift(question.kind);
  state.recentKinds = state.recentKinds.slice(0, 1);
}

function questionId(q) {
  const actor = q.heroPosition || q.villainPosition;
  return `${state.mode}:${q.kind}:${actor}:${q.hand}`;
}

function situation(q) {
  if (q.kind === "open") {
    return {
      type: "未参加ポット",
      text: `全員フォールド。あなたは${q.heroPosition}でアクション。`,
      visible: ["open", "fold"],
    };
  }
  if (q.kind === "bbDefense") {
    return {
      type: "BBディフェンス",
      text: `${q.villainPosition}が通常サイズでオープン。あなたはBB。`,
      visible: ["raise", "call", "fold"],
    };
  }
  return {
    type: "相手のオープンに対応",
    text: `${q.villainPosition}が通常レンジでオープン。あなたは後ろのポジション。`,
    visible: ["raise", "call", "fold"],
  };
}

function renderQuestion() {
  state.current = makeQuestion();
  state.answered = false;
  state.reviewHand = null;
  document.body.classList.remove("answered");
  document.body.classList.remove("chart-revealed");
  const meta = situation(state.current);
  els.scenarioType.textContent = meta.type;
  els.handText.textContent = state.current.hand;
  els.situationText.textContent = meta.text;
  els.feedback.className = "feedback hidden";
  els.feedback.textContent = "";
  els.nextQuestion.textContent = "スキップ";
  els.rangePanel.classList.remove("review", "answeredVisible");
  els.memoryCoach.classList.remove("revealed");
  els.whyPanel.classList.add("hidden");
  els.whyPanel.classList.remove("revealed");
  els.whyTitle.textContent = "回答後に表示";
  els.whyList.innerHTML = "";
  els.markMastered.checked = Boolean(state.stats.mastered[state.current.id]);

  els.actions.querySelectorAll("button").forEach((button) => {
    button.className = "";
    button.disabled = false;
    button.hidden = !meta.visible.includes(button.dataset.action);
  });
  renderTable(meta);
  renderMemoryCoach();
  renderGrid();
  if (state.renderedOnce) scrollQuestionIntoView();
  state.renderedOnce = true;
}

function answer(action) {
  if (state.answered) return;
  state.answered = true;
  document.body.classList.add("answered");
  const isCorrect = action === state.current.correct;
  state.stats.total += 1;
  state.stats[isCorrect ? "correct" : "wrong"] += 1;
  state.stats.streak = isCorrect ? state.stats.streak + 1 : 0;

  const progress = state.stats.progress[state.current.id] || { correct: 0, wrong: 0 };
  if (isCorrect) {
    progress.correct += 1;
    state.stats.mastered[state.current.id] = true;
  } else {
    progress.wrong += 1;
    progress.correct = 0;
    delete state.stats.mastered[state.current.id];
  }
  state.stats.progress[state.current.id] = progress;

  els.actions.querySelectorAll("button").forEach((button) => {
    const selected = button.dataset.action === action;
    button.disabled = true;
    if (selected) button.classList.add("selected", isCorrect ? "correct" : "wrong");
  });
  showResultBurst(isCorrect);

  const correctLabel = actionLabel(state.current.correct);
  els.feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
  els.feedback.textContent = isCorrect
    ? `正解。${explainAnswer(state.current)}`
    : `不正解。推奨アクションは${correctLabel}。${explainAnswer(state.current)}`;
  els.tableStatus.textContent = isCorrect ? `${correctLabel}で正解` : `正解は${correctLabel}`;
  els.nextQuestion.textContent = "次の問題";
  els.memoryCoach.classList.add("revealed");
  els.whyPanel.classList.remove("hidden");
  els.whyPanel.classList.add("revealed");
  renderMemoryCoach(true);
  renderWhyPanel(true);
  els.rangePanel.classList.add("answeredVisible");
  document.body.classList.add("chart-revealed");
  if (!isCorrect) {
    state.reviewHand = state.current.hand;
    els.rangePanel.classList.add("review");
    renderGrid();
  }

  saveStats();
  renderStats();
  els.markMastered.checked = Boolean(state.stats.mastered[state.current.id]);
}

function showResultBurst(isCorrect) {
  els.resultBurst.className = `resultBurst ${isCorrect ? "correct" : "wrong"}`;
  els.resultBurst.textContent = isCorrect ? "○" : "×";
  window.setTimeout(() => {
    els.resultBurst.className = "resultBurst";
    els.resultBurst.textContent = "";
  }, 900);
}

function actionLabel(action) {
  return { raise: "レイズ", call: "コール", open: "オープン", fold: "フォールド" }[action];
}

function thresholdLabel(level) {
  return `${levelNames[level]}以上`;
}

function ruleFor(question) {
  if (question.kind === "open") {
    const threshold = openingThreshold(question.heroPosition);
    return `${question.heroPosition}は${thresholdLabel(threshold)}ならオープン`;
  }
  if (question.kind === "bbDefense") {
    const callThreshold = { "LJ/HJ": 4, CO: 3, BTN: 1 }[question.villainPosition];
    return `BBは${question.villainPosition}相手に${thresholdLabel(callThreshold)}でコール、2ランク上でレイズ`;
  }
  const thresholds = vsOpenThresholds(question.villainPosition);
  return `${question.villainPosition}オープン基準は${thresholdLabel(thresholds.open)}。対応は${thresholdLabel(thresholds.call)}でコール、${thresholdLabel(thresholds.raise)}でレイズ`;
}

function explainAnswer(question) {
  const strength = effectiveLevel(question.baseLevel);
  const band = levelNames[strength];
  if (question.kind === "open") {
    const threshold = openingThreshold(question.heroPosition);
    return `${question.hand}は${band}。${question.heroPosition}の基準は${thresholdLabel(threshold)}です。`;
  }
  if (question.kind === "bbDefense") {
    const callThreshold = { "LJ/HJ": 4, CO: 3, BTN: 1 }[question.villainPosition];
    return `${question.hand}は${band}。BB対${question.villainPosition}は${thresholdLabel(callThreshold)}でコール、さらに強ければレイズです。`;
  }
  const thresholds = vsOpenThresholds(question.villainPosition);
  return `${question.hand}は${band}。${question.villainPosition}のオープン基準${thresholdLabel(thresholds.open)}に対して、${thresholdLabel(thresholds.call)}以上でコールです。`;
}

function renderMemoryCoach(revealed = false) {
  const q = state.current;
  const progress = state.stats.progress[q.id] || { correct: 0, wrong: 0 };
  const strength = effectiveLevel(q.baseLevel);
  els.cueRule.textContent = ruleFor(q);
  els.cueHand.textContent = revealed
    ? `${q.hand} = ${levelNames[strength]} / 正解は${actionLabel(q.correct)}`
    : `${q.hand}が表のどの帯かを先に思い出す`;
  if (state.stats.mastered[q.id]) {
    els.cueProgress.textContent = "習得済み";
  } else if (progress.wrong > 0) {
    els.cueProgress.textContent = `苦手: ミス${progress.wrong}回`;
  } else if (progress.correct > 0) {
    els.cueProgress.textContent = "正解済み";
  } else {
    els.cueProgress.textContent = "初見";
  }
}

function renderWhyPanel(revealed = false) {
  const q = state.current;
  const insight = marginalInsight(q, revealed);
  els.whyTitle.textContent = insight.title;
  els.whyList.innerHTML = "";
  insight.points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    els.whyList.appendChild(item);
  });
}

function marginalInsight(question, revealed) {
  const profile = handProfile(question.hand);
  const strength = effectiveLevel(question.baseLevel);
  const threshold = referenceThreshold(question);
  const answer = actionLabel(question.correct);
  const title = revealed
    ? `${question.hand}: ${answer}の理由`
    : `${question.hand} の価値と弱点`;
  const points = revealed
    ? revealedInsight(question, profile, strength, threshold)
    : previewInsight(question, profile, strength, threshold);

  return { title, points };
}

function previewInsight(question, profile, strength, threshold) {
  return [
    `${question.hand}は${levelNames[strength]}。この場面の基準は${thresholdLabel(threshold)}です。`,
    handShapeSummary(profile),
    scenarioQuestionPoint(question),
  ];
}

function revealedInsight(question, profile, strength, threshold) {
  if (question.kind === "open") return openDecisionInsight(question, profile, strength, threshold);
  if (question.kind === "bbDefense") return bbDefenseDecisionInsight(question, profile, strength, threshold);
  return vsOpenDecisionInsight(question, profile, strength, threshold);
}

function openDecisionInsight(question, profile, strength, threshold) {
  const diff = strength - threshold;
  if (question.correct === "fold") {
    return [
      `判定: ${question.hand}は${levelNames[strength]}で、${question.heroPosition}の参加基準${thresholdLabel(threshold)}に届いていません。`,
      `理由: ${question.heroPosition}はまだ後ろに${playersBehind(question.heroPosition)}人残るため、微妙なハンドを開くとコール/3betを受けた後が苦しくなります。`,
      `実戦: ${handRisk(profile)} ここは「惜しい」よりも、表の下限を守ってフォールドする場面です。`,
    ];
  }
  return [
    `判定: ${question.hand}は${levelNames[strength]}で、${question.heroPosition}の基準${thresholdLabel(threshold)}を${diff === 0 ? "ちょうど満たす下限" : "満たしています"}。`,
    `理由: ${question.heroPosition}まで全員フォールドなら、自分からレイズしてブラインドを降ろす価値があります。`,
    `実戦: ${handValue(profile)} ただし下限ハンドなので、強く抵抗されたら無理に守らない前提です。`,
  ];
}

function bbDefenseDecisionInsight(question, profile, strength, threshold) {
  if (question.correct === "fold") {
    const villainReason = question.villainPosition === "BTN"
      ? "BTNオープンは広いですが、このハンドはBBの追加コール枠にも届いていません。"
      : `${question.villainPosition}オープンはBTNより強いので、BTN級のハンドをそのまま守るとレンジ負けしやすいです。`;
    return [
      `判定: ${question.hand}は${levelNames[strength]}で、BB対${question.villainPosition}のコール基準${thresholdLabel(threshold)}より下です。`,
      `理由: ${villainReason}`,
      `ハンド: ${handRisk(profile)} BBはポジション不利で主導権もないため、弱いワンペアや弱いドローで難しい判断を強いられます。`,
      `実戦: 相手がBTNかCO以前かで守る下限を分けて覚えます。位置が早いオープンほどBBでも無理に守りません。`,
    ];
  }
  if (question.correct === "raise") {
    return [
      `判定: ${question.hand}は${levelNames[strength]}で、BB対${question.villainPosition}のコール基準より2ランク以上上です。`,
      `理由: この帯はただ守るだけでなく、相手のオープンに対して強く返せる候補です。`,
      `実戦: ${handValue(profile)} レイズ後にコールされても戦える強さがあるため、受け身のコールより主導権を取り返します。`,
    ];
  }
  return [
    `判定: ${question.hand}は${levelNames[strength]}で、BB対${question.villainPosition}のコール基準${thresholdLabel(threshold)}を満たします。`,
    `理由: BBはすでにブラインドを払っているので追加投資は小さく、基準を満たす下限ハンドは守れます。`,
    `実戦: ${handValue(profile)} ただしポジション不利なので、ヒットしても弱いワンペアで大きく払いすぎない前提です。`,
  ];
}

function vsOpenDecisionInsight(question, profile, strength, threshold) {
  const thresholds = vsOpenThresholds(question.villainPosition);
  if (question.correct === "fold") {
    return [
      `判定: ${question.hand}は${levelNames[strength]}。${question.villainPosition}オープンへのコール基準${thresholdLabel(threshold)}に届いていません。`,
      `理由: ${question.villainPosition}のオープン基準は${thresholdLabel(thresholds.open)}なので、コールには1ランク上の${thresholdLabel(thresholds.call)}が必要です。境界未満のハンドでコールすると支配されやすいです。`,
      `実戦: ${handRisk(profile)} コールしても主導権がなく、難しいフロップで損失が膨らみやすいのでフォールドします。`,
    ];
  }
  if (question.correct === "raise") {
    return [
      `判定: ${question.hand}は${levelNames[strength]}で、${question.villainPosition}オープンに対してレイズできる強い帯です。`,
      `理由: レイズは、相手を降ろす力と、コールされても戦える強さの両方が必要です。`,
      `実戦: ${handValue(profile)} 受け身でコールするより、主導権を取り返す価値があります。`,
    ];
  }
  return [
    `判定: ${question.hand}は${levelNames[strength]}で、${question.villainPosition}オープンへのコール基準${thresholdLabel(threshold)}を満たします。`,
    `理由: ${question.villainPosition}のオープン基準は${thresholdLabel(thresholds.open)}。その1ランク上である${thresholdLabel(thresholds.call)}に届いているのでコールできますが、レイズ基準${thresholdLabel(thresholds.raise)}には届きません。`,
    `実戦: ${handValue(profile)} フロップ後は当たり方が弱ければ無理に粘らない前提です。`,
  ];
}

function scenarioQuestionPoint(question) {
  if (question.kind === "open") {
    return `${question.heroPosition}まで全員フォールド。後ろの人数とスティール価値込みで、基準に届くかを見ます。`;
  }
  if (question.kind === "bbDefense") {
    return `${question.villainPosition}オープンにBBで対応。相手位置が早いほど守る基準は厳しくなります。`;
  }
  return `${question.villainPosition}オープンへの対応。自分から開く時より、相手レンジに対して強さが必要です。`;
}

function handShapeSummary(profile) {
  if (profile.pair) return `${profile.hand}はポケットペア。セット価値はありますが、オーバーカードが出ると扱いが難しくなります。`;
  if (profile.suited && profile.connected) return `${profile.hand}はスーテッドコネクター。強いドローを作れますが、ワンペアだけでは強くありません。`;
  if (profile.suited && profile.oneGap) return `${profile.hand}はスーテッドワンギャッパー。ドローの伸びしろはありますが、完成しない時は弱いです。`;
  if (profile.suited) return `${profile.hand}はスーテッド。フラッシュ/バックドアはありますが、キッカーと連結性を確認します。`;
  if (profile.offsuit && profile.broadway) return `${profile.hand}はオフスートの高めハンド。トップペア価値はありますが、キッカー負けに注意します。`;
  return `${profile.hand}は伸びしろが少ないタイプ。参加できる場面はかなり位置と状況に依存します。`;
}

function handValue(profile) {
  if (profile.pair) return "ペアはプリフロップ時点で完成していて、セットを引いた時のリターンもあります。";
  if (profile.suited && profile.aceHigh) return "Aスーテッドはナッツフラッシュの可能性とAブロッカーが価値になります。";
  if (profile.suited && profile.connected) return "スーテッドかつ連結しているため、フラッシュだけでなくストレート/強いドローも狙えます。";
  if (profile.suited && profile.oneGap) return "スーテッドで一部のストレート筋も残るため、フロップ後に続けられる形が少しあります。";
  if (profile.suited) return "スーテッドなので、フラッシュドローやバックドアで続けられるボードが増えます。";
  if (profile.broadway) return "高いカードを含むため、トップペアを作った時の価値があります。";
  return "単体のカード価値は高くないため、参加するなら位置やポットオッズ込みの判断になります。";
}

function handRisk(profile) {
  if (profile.pair) return "セットを引けない時はオーバーカードに弱く、ショーダウンまで行きにくいです。";
  if (profile.suited && profile.high <= 11 && profile.gap >= 4) return "スーテッドでも連結性が低く、Jヒットなどの弱いトップペアは上のキッカーに支配されやすいです。";
  if (profile.suited && profile.gap >= 3) return "スーテッドでもストレートの筋が薄く、フラッシュ以外の強い完成形が少ないです。";
  if (profile.suited && profile.low <= 7) return "キッカーが弱く、トップペアを作っても大きなポットには向きません。";
  if (profile.offsuit) return "オフスートはドローの保険が少なく、当たらない時に続ける理由が少ないです。";
  return "境界ハンドは当たっても中途半端になりやすく、強い抵抗には弱いです。";
}

function playersBehind(position) {
  return { UTG: 8, EP: 6, "LJ/HJ": 4, CO: 3, BTN: 2 }[position] || 0;
}

function scrollQuestionIntoView() {
  if (!window.matchMedia("(max-width: 760px)").matches) return;
  requestAnimationFrame(() => {
    document.querySelector(".pokerStage").scrollIntoView({ block: "center", behavior: "auto" });
  });
}

function referenceThreshold(question) {
  if (question.kind === "open") return openingThreshold(question.heroPosition);
  if (question.kind === "bbDefense") {
    const callThreshold = { "LJ/HJ": 4, CO: 3, BTN: 1 }[question.villainPosition];
    return callThreshold;
  }
  return vsOpenThresholds(question.villainPosition).call;
}

function vsOpenThresholds(villainPosition) {
  const open = openingThreshold(villainPosition);
  return {
    open,
    call: Math.min(8, open + 1),
    raise: Math.min(8, open + 2),
  };
}

function thresholdComparisonPoints(question, strength, threshold) {
  const points = [`表では${question.hand}は${levelNames[strength]}。この場面の基準は${thresholdLabel(threshold)}です。`];
  const diff = strength - threshold;
  if (question.kind === "open") {
    if (diff >= 0) points.push("オープン判断では、ハンドの帯がそのポジションの基準に届いていれば参加できます。");
    else points.push("オープン判断では、基準に1ランク届かない境界外ハンドはフォールド寄りにします。");
  } else if (question.kind === "vsOpen") {
    points.push("相手が先に参加しているので、単にオープンできる強さでは足りず、相手レンジより上の帯が必要です。");
  } else {
    points.push("BBは必要な追加投資が小さいため広く守れますが、ポジション不利なので下限は慎重に扱います。");
  }
  return points;
}

function handProfile(hand) {
  const suited = hand.endsWith("s");
  const offsuit = hand.endsWith("o");
  const pair = hand.length === 2 && hand[0] === hand[1];
  const first = hand[0];
  const second = hand[1];
  const high = Math.max(rankPower(first), rankPower(second));
  const low = Math.min(rankPower(first), rankPower(second));
  const gap = Math.max(0, high - low - 1);
  return {
    hand,
    suited,
    offsuit,
    pair,
    first,
    second,
    high,
    low,
    gap,
    broadway: high >= 10 && low >= 8,
    aceHigh: first === "A" || second === "A",
    queenHigh: first === "Q" || second === "Q",
    connected: !pair && gap === 0,
    oneGap: !pair && gap === 1,
    smallPair: pair && high <= 6,
  };
}

function rankPower(rank) {
  return { A: 14, K: 13, Q: 12, J: 11, T: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 }[rank];
}

function handTypePoints(profile) {
  if (profile.pair) {
    if (profile.smallPair) {
      return [
        "小さいポケットは完成役としては弱いですが、セットを引いた時の伸びしろがあります。",
        "ただしオーバーカードが出やすいので、早いポジションでは過信しません。",
        "セットを引けない多くのフロップでは守りに回るため、コールしすぎるより参加条件を守ることが大事です。",
      ];
    }
    return [
      "ポケットペアはプリフロップ時点でワンペアが確定しているため、同ランク帯のハイカードより安定します。",
      "境界では、後ろの人数が少ないほどオープンしやすくなります。",
      "一方で小さめのペアはポストフロップでオーバーカードに悩まされるので、強い完成役として過信しません。",
    ];
  }

  if (profile.suited && profile.queenHigh && profile.low <= 7) {
    return [
      "スーテッドQxはフラッシュ完成だけを狙うハンドではありません。",
      "Qヒットのショーダウン価値、フラッシュドロー、バックドアで継続できるボードが増えます。",
      "ただしキッカーは弱いので、Qヒットで大きく打ち合うハンドではありません。",
      "価値の中心は、ポジションが後ろで相手を降ろせる時に小さな利益を積むことです。",
    ];
  }

  if (profile.suited && profile.aceHigh) {
    return [
      "スーテッドAはAヒットの価値に加えて、ナッツフラッシュを作れる点が大きいです。",
      "キッカーが弱くても、自分からオープンするなら降ろせる可能性も含めて価値があります。",
      "Aを持っていることで相手のAA/AK/AQの組み合わせを少し減らすブロッカー効果もあります。",
      "弱いAヒットで大きく払うと逆に危ないので、参加後はポットサイズを意識します。",
    ];
  }

  if (profile.suited && (profile.connected || profile.oneGap)) {
    return [
      "スーテッドコネクター系はワンペア勝負では弱いですが、ストレート・フラッシュ・強いドローを作れます。",
      "コールよりも、主導権を持てるオープンやBBの安いディフェンスで価値が出やすいです。",
      "ヒットした時の形が分かりやすく、強いドローならセミブラフにも回せます。",
      "逆に何も引けないフロップでは潔く諦めやすいので、境界ハンドとして扱いやすいです。",
    ];
  }

  if (profile.suited) {
    return [
      "スーテッドはオフスートより、フラッシュドローやバックドアで続けられるフロップが増えます。",
      "弱いキッカーのワンペアで大きく勝つハンドではなく、下限として慎重に扱います。",
      "同じランクならオフスートより数段扱いやすいのは、フロップ後に続けられる理由が増えるからです。",
      "ただしフラッシュは毎回完成しないので、スーテッドというだけで広げすぎないのがポイントです。",
    ];
  }

  if (profile.offsuit && profile.broadway) {
    return [
      "オフスートのブロードウェイはフラッシュの価値はありませんが、トップペアを作る力があります。",
      "境界では、支配されやすいキッカーかどうかを意識します。",
      "KJ/QT/JTのようなハンドは当たれば戦えますが、上のキッカーに負ける場面も多いです。",
      "そのため、早いポジションや相手オープンへの対応では表の基準を厳守します。",
    ];
  }

  return [
    "オフスートの低めハンドは伸びしろが少なく、かなり位置依存です。",
    "表に残っている場合も、強いからではなく後ろの人数やブラインド状況込みの下限です。",
    "フラッシュの保険がないので、ワンペアになった時のキッカー負けや降りにくさが問題になります。",
    "参加できる場面でも、主導権や安いディフェンスがあるから成立していると考えます。",
  ];
}

function openContextPoints(question, profile, revealed) {
  const behind = { UTG: 8, EP: 6, "LJ/HJ": 4, CO: 3, BTN: 2 }[question.heroPosition];
  const points = [
    `${question.heroPosition}は後ろが約${behind}人。後ろが少ないほど、全員フォールドでポットを取れる価値が上がります。`,
  ];
  if (["CO", "BTN"].includes(question.heroPosition)) {
    points.push("CO/BTNの下限ハンドは、強いハンドというよりブラインドを攻めるスティール込みの参加です。");
    points.push("後ろが少ないため、全員フォールドで即利益になる割合が早いポジションより高くなります。");
    points.push("コールされた時も自分がレイズ側なので、フロップでCBを打てる主導権があります。");
  } else {
    points.push("早めのポジションでは後ろに強いハンドが残りやすいので、同じハンドでも参加基準はかなり厳しくなります。");
    points.push("早い位置の境界ハンドは、後ろから3betやコールを受けた時に難しくなりやすいです。");
    points.push("だからこそ、表で早いポジションに残っているハンドはかなり選別されています。");
  }
  if (revealed && question.correct === "fold") {
    points.push("惜しいハンドでも、基準の帯に届かないなら参加頻度を落としてミスを減らします。");
  }
  return points;
}

function vsOpenContextPoints(question, profile, revealed) {
  const points = [
    "相手が先にオープンしている時は、こちらはフォールドエクイティが少なく、必要な強さが上がります。",
    "コールは相手レンジより1ランク上、レイズはさらに上という考え方で、ただ参加できるハンドより厳しく見ます。",
    "自分からオープンする時と違い、既に相手の強いレンジがポットに入っているのが最大の違いです。",
    "境界では「参加できそう」ではなく、「相手のレンジに対して十分戦えるか」で判定します。",
  ];
  if (profile.suited) {
    points.push("スーテッドはコール候補を少し増やしますが、弱いトップペアで大きく払わない前提です。");
  }
  if (profile.offsuit) {
    points.push("オフスートはドローの保険が少ないため、相手オープンへのコールでは特に厳しく見ます。");
  }
  if (revealed && question.correct === "raise") {
    points.push("レイズ域は、相手のオープンに対して十分強く、主導権を取り返せる帯です。");
  }
  return points;
}

function bbDefenseContextPoints(question, profile, revealed) {
  const points = [
    "BBはすでにブラインドを払っているので、追加で必要な額が少なく、コールできる下限が少し広がります。",
    "ただしポジションは不利なので、ヒットしても弱いワンペアで払いすぎない前提です。",
    "BBディフェンスは勝ちに行くというより、既に払ったブラインドを簡単に捨てすぎないための防衛です。",
    "コールした後は常に相手より先にアクションするので、プリフロップで広く守れてもポストフロップは難しくなります。",
  ];
  if (question.villainPosition === "BTN") {
    points.push("BTNオープンは広いので、BB側もピンク枠のようなギリギリハンドまで守れます。");
  } else {
    points.push(`${question.villainPosition}オープンはBTNより強いレンジなので、BBでも守るハンドは少し絞ります。`);
  }
  if (profile.suited) {
    points.push("スーテッドは安く守った後にドローで継続できるため、BBディフェンスでは価値が上がります。");
  }
  return points;
}

function postAnswerPoints(question, profile, stage) {
  const points = [
    `結論: ${actionLabel(question.correct)}。これは「強いから」ではなく、${stage}周辺の人数・主導権・降ろせる可能性込みの下限です。`,
  ];
  if (question.correct === "fold") {
    points.push("フォールドが正解の境界では、惜しさに引っ張られず、基準に届かないハンドを捨てるのが利益を守ります。");
  } else if (question.correct === "open") {
    points.push("オープン後に強く抵抗されたら、この種の下限ハンドは無理に守らずフォールド寄りで扱います。");
  } else if (question.correct === "call") {
    points.push("コール域の下限は、当たった後も慎重に。弱いトップペアだけで大きなポットにしないのが前提です。");
  } else if (question.correct === "raise") {
    points.push("レイズ域に入る時は、相手を降ろす力と、コールされても戦える強さの両方がある帯です。");
  }
  if (profile.suited) {
    points.push("覚え方: スーテッド下限は「フラッシュ狙い」ではなく、ドロー・バックドア・主導権込みで薄く利益を取る枠です。");
  } else if (profile.offsuit) {
    points.push("覚え方: オフスート下限は保険が少ないので、参加できる位置と相手レンジの条件をより厳密に見ます。");
  }
  return points;
}

function heroPositionFor(q) {
  if (q.kind === "bbDefense") return "BB";
  if (q.kind === "open") return q.heroPosition;
  return nextPositionAfter(q.villainPosition);
}

function nextPositionAfter(position) {
  const order = ["UTG", "EP", "LJ/HJ", "CO", "BTN", "BB"];
  return order[Math.min(order.indexOf(position) + 1, order.length - 1)];
}

function renderTable(meta) {
  const q = state.current;
  const hero = heroPositionFor(q);
  const villain = q.kind === "open" ? null : q.villainPosition;
  const seatMap = window.matchMedia("(max-width: 760px)").matches ? mobileSeatPositions : seatPositions;
  const seats = Object.keys(seatMap);
  els.seatLayer.innerHTML = "";

  seats.forEach((position) => {
    const seat = document.createElement("div");
    const isHero = position === hero;
    const isVillain = position === villain;
    const isLowerSeat = seatMap[position].y > 58;
    seat.className = `seat${isHero ? " hero" : ""}${isVillain ? " villain" : ""}${isLowerSeat ? " lowerSeat" : ""}`;
    seat.style.left = `${seatMap[position].x}%`;
    seat.style.top = `${seatMap[position].y}%`;
    const action = tableActionFor(position, q, hero, villain);
    seat.innerHTML = `
      <span class="role">${isHero ? "Hero" : isVillain ? "Opponent" : "Player"}</span>
      <strong>${position}</strong>
      <span class="actionBadge ${action.tone}">${action.label}</span>
      ${isHero ? '<span class="heroPointer">あなた</span>' : ""}
      ${position === "BTN" ? '<span class="dealerButton">D</span>' : ""}
    `;
    els.seatLayer.appendChild(seat);
  });

  renderCards(q.hand);
  els.tableStatus.textContent = tableStatusText(q, meta, hero);
}

function tableActionFor(position, q, hero, villain) {
  if (position === hero) return { label: "YOUR TURN", tone: "heroTurn" };
  if (position === villain) return { label: "OPEN", tone: "open" };
  if (q.kind === "open") {
    return positionBefore(position, hero) ? { label: "FOLD", tone: "folded" } : { label: "WAIT", tone: "waiting" };
  }
  if (positionBefore(position, villain)) return { label: "FOLD", tone: "folded" };
  if (positionBefore(villain, position) && positionBefore(position, hero)) return { label: "FOLD", tone: "folded" };
  return { label: "WAIT", tone: "waiting" };
}

function positionBefore(a, b) {
  const order = ["UTG", "EP", "LJ/HJ", "CO", "BTN", "BB"];
  return order.indexOf(a) > -1 && order.indexOf(a) < order.indexOf(b);
}

function renderCards(hand) {
  const cards = parseCards(hand);
  els.heroCards.innerHTML = "";
  cards.forEach((card) => {
    const item = document.createElement("div");
    item.className = `playingCard ${card.red ? "red" : ""}`;
    item.innerHTML = `<span class="rank">${card.rank}</span><span class="suit">${card.suit}</span>`;
    els.heroCards.appendChild(item);
  });
}

function parseCards(hand) {
  const suited = hand.endsWith("s");
  const offsuit = hand.endsWith("o");
  const rankA = hand[0];
  const rankB = hand[1];
  if (suited) {
    return [
      { rank: rankA, suit: "♠", red: false },
      { rank: rankB, suit: "♠", red: false },
    ];
  }
  if (offsuit || rankA === rankB) {
    return [
      { rank: rankA, suit: "♥", red: true },
      { rank: rankB, suit: "♣", red: false },
    ];
  }
  return [
    { rank: rankA, suit: "♦", red: true },
    { rank: rankB, suit: "♣", red: false },
  ];
}

function tableStatusText(q, meta, hero) {
  if (q.kind === "open") return `${hero}まで全員フォールド。あなたの番。`;
  if (q.kind === "bbDefense") return `${q.villainPosition}がオープン、あなたはBBでディフェンス判断。`;
  return `${q.villainPosition}がオープン、あなたは${hero}で対応。`;
}

function renderGrid() {
  els.rangeGrid.innerHTML = "";
  for (let row = 0; row < 13; row += 1) {
    for (let col = 0; col < 13; col += 1) {
      const hand = handAt(row, col);
      const level = state.mode === "tournament" ? Math.min(8, cashMatrix[row][col] + 1) : cashMatrix[row][col];
      const cell = document.createElement("div");
      cell.className = `cell rank-${level}`;
      if (state.current && state.current.hand === hand) cell.classList.add("current");
      if (state.reviewHand === hand) cell.classList.add("reviewHand");
      cell.textContent = hand;
      cell.title = `${hand}: ${levelNames[level]}`;
      els.rangeGrid.appendChild(cell);
    }
  }
}

function renderLegend() {
  els.legend.innerHTML = "";
  legendItems.forEach(([level, label]) => {
    const item = document.createElement("div");
    item.className = "legendItem";
    item.innerHTML = `<span class="swatch rank-${level}"></span><span>${label}</span>`;
    els.legend.appendChild(item);
  });
}

function currentPaintEntries() {
  if (!state.paint.entries[state.mode]) state.paint.entries[state.mode] = {};
  return state.paint.entries[state.mode];
}

function correctPaintLevel(row, col) {
  return state.mode === "tournament" ? Math.min(8, cashMatrix[row][col] + 1) : cashMatrix[row][col];
}

function paintTargetHands() {
  const mode = state.paint.drillMode;
  const mistakes = state.paint.mistakes[state.mode] || [];
  const hands = allHands().filter(({ row, col, hand }) => {
    const level = correctPaintLevel(row, col);
    if (mode === "band") return level === state.paint.bandLevel;
    if (mode === "boundary") return isPaintBoundary(row, col);
    if (mode === "mistakes") return mistakes.includes(hand);
    return true;
  });
  return hands;
}

function paintTargetSet() {
  return new Set(paintTargetHands().map(({ hand }) => hand));
}

function isPaintBoundary(row, col) {
  const level = correctPaintLevel(row, col);
  return [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ].some(([rowOffset, colOffset]) => {
    const nextRow = row + rowOffset;
    const nextCol = col + colOffset;
    if (nextRow < 0 || nextRow > 12 || nextCol < 0 || nextCol > 12) return false;
    return correctPaintLevel(nextRow, nextCol) !== level;
  });
}

function paintMistakeHands() {
  const entries = currentPaintEntries();
  return paintTargetHands()
    .filter(({ hand, row, col }) => entries[hand] !== correctPaintLevel(row, col))
    .map(({ hand }) => hand);
}

function renderPaintPalette() {
  els.paintPalette.innerHTML = "";
  const paletteItems = state.paint.drillMode === "band"
    ? legendItems.filter(([level]) => level === state.paint.bandLevel || level === 0)
    : legendItems;
  paletteItems.forEach(([level, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `paintColor${state.paint.selectedLevel === level ? " active" : ""}`;
    button.dataset.level = String(level);
    button.innerHTML = `<span class="swatch rank-${level}"></span><span>${label}</span>`;
    els.paintPalette.appendChild(button);
  });

  const eraser = document.createElement("button");
  eraser.type = "button";
  eraser.className = `paintColor eraser${state.paint.selectedLevel === null ? " active" : ""}`;
  eraser.dataset.level = "erase";
  eraser.innerHTML = '<span class="swatch blankSwatch"></span><span>消しゴム</span>';
  els.paintPalette.appendChild(eraser);
}

function renderPaintGrid() {
  const entries = currentPaintEntries();
  const target = paintTargetSet();
  els.paintGrid.innerHTML = "";
  for (let row = 0; row < 13; row += 1) {
    for (let col = 0; col < 13; col += 1) {
      const hand = handAt(row, col);
      const answer = correctPaintLevel(row, col);
      const userLevel = entries[hand];
      const shouldShowAnswerColor = state.paint.revealed;
      const visibleLevel = shouldShowAnswerColor ? answer : userLevel;
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "paintCell";
      cell.dataset.hand = hand;
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      if (!target.has(hand)) {
        cell.classList.add("locked");
        cell.disabled = true;
      }
      if (visibleLevel === undefined) {
        cell.classList.add("blank");
      } else {
        cell.classList.add(`rank-${visibleLevel}`);
      }
      if (state.paint.revealed && target.has(hand)) {
        cell.classList.add("answer");
        cell.disabled = true;
      } else if (state.paint.checked && target.has(hand)) {
        if (userLevel === undefined) cell.classList.add("missing");
        else if (userLevel === answer) cell.classList.add("correct");
        else {
          cell.classList.add("wrong");
          cell.dataset.userLevel = String(userLevel);
          cell.dataset.answerLevel = String(answer);
        }
      }
      cell.textContent = hand;
      cell.title = shouldShowAnswerColor
        ? `${hand}: 正解は${levelNames[answer]}${userLevel === undefined ? "" : ` / あなたは${levelNames[userLevel]}`}`
        : `${hand}: ${userLevel === undefined ? "未回答" : levelNames[userLevel]}`;
      els.paintGrid.appendChild(cell);
    }
  }
  renderPaintStats();
}

function renderPaintStats() {
  const entries = currentPaintEntries();
  const hands = paintTargetHands();
  const filled = hands.filter(({ hand }) => entries[hand] !== undefined).length;
  const correct = hands.filter(({ hand, row, col }) => entries[hand] === correctPaintLevel(row, col)).length;
  const accuracy = hands.length ? Math.round((correct / hands.length) * 100) : 0;
  els.paintFilled.textContent = `${filled}/${hands.length}`;
  els.paintAccuracy.textContent = state.paint.checked ? `${accuracy}%` : "--";
  if (state.paint.revealed) {
    els.paintStatus.textContent = state.paint.checked
      ? "正解表示中。もう一度押すと採点結果に戻ります。"
      : "正解表示中。もう一度押すと自分の塗りに戻ります。";
  } else if (state.paint.checked) {
    const misses = hands.length - correct;
    els.paintStatus.textContent = `採点結果: ${correct}マス一致、${misses}マスに差があります。表はあなたの塗りのままです。`;
  } else {
    els.paintStatus.textContent = paintStatusText(hands.length);
  }
  els.paintReview.classList.toggle("hidden", !state.paint.checked);
  els.paintReview.textContent = state.paint.revealed
    ? "正解レンジを表示中です。採点結果に戻すと、あなたの塗りとミス表示を確認できます。"
    : "採点後も表はあなたの塗りのままです。赤枠は色違い、点線は未回答、薄いマスは正解済みです。";
  els.paintCheck.textContent = state.paint.checked && !state.paint.revealed ? "再採点" : "採点";
  els.paintReveal.textContent = state.paint.revealed
    ? state.paint.checked ? "採点結果に戻す" : "自分の塗りに戻す"
    : "正解を表示";
  els.paintBand.disabled = state.paint.drillMode !== "band";
  els.paintModeNote.textContent = state.mode === "tournament"
    ? "トーナメント用: リングより1ランク広い白地図"
    : "リングゲーム用の白地図";
}

function paintStatusText(targetCount) {
  if (state.paint.drillMode === "band") return `${levelNames[state.paint.bandLevel]}の追加分だけを塗ります。対象は${targetCount}マスです。`;
  if (state.paint.drillMode === "boundary") return `色が変わる境界だけを塗ります。対象は${targetCount}マスです。`;
  if (state.paint.drillMode === "mistakes") {
    return targetCount ? `前回ミスしたマスだけ再テストします。対象は${targetCount}マスです。` : "再テスト対象はありません。先に採点するとミスだけを復習できます。";
  }
  return "色を選んで、覚えている範囲を表に塗ります。";
}

function updatePaintCellVisual(cell, hand) {
  const entries = currentPaintEntries();
  cell.classList.remove("blank", "correct", "wrong", "missing");
  for (let level = 0; level <= 8; level += 1) cell.classList.remove(`rank-${level}`);
  const userLevel = entries[hand];
  if (userLevel === undefined) {
    cell.classList.add("blank");
    cell.title = `${hand}: 未回答`;
  } else {
    cell.classList.add(`rank-${userLevel}`);
    cell.title = `${hand}: ${levelNames[userLevel]}`;
  }
}

function setPaintLevel(hand, { render = true, persist = true, cell = null } = {}) {
  if (!paintTargetSet().has(hand)) return;
  const entries = currentPaintEntries();
  const previousLevel = entries[hand];
  const wasReviewing = state.paint.checked || state.paint.revealed;
  if (state.paint.selectedLevel === null) delete entries[hand];
  else entries[hand] = state.paint.selectedLevel;
  state.paint.checked = false;
  state.paint.revealed = false;
  const changed = previousLevel !== entries[hand] || wasReviewing;
  if (!changed) return;
  if (persist) savePaintEntries();
  if (render) renderPaintGrid();
  else if (cell) updatePaintCellVisual(cell, hand);
}

function savePaintEntries() {
  try {
    localStorage.setItem(paintStorageKey, JSON.stringify(state.paint.entries));
  } catch {
    // Storage can be unavailable in private browsing; keep the in-memory answer.
  }
}

function loadPaintEntries() {
  try {
    return JSON.parse(localStorage.getItem(paintStorageKey) || "{}");
  } catch {
    return {};
  }
}

function savePaintMistakes() {
  try {
    localStorage.setItem(`${paintStorageKey}-mistakes`, JSON.stringify(state.paint.mistakes));
  } catch {
    // Keep the session usable even when persistence is blocked.
  }
}

function loadPaintMistakes() {
  try {
    return JSON.parse(localStorage.getItem(`${paintStorageKey}-mistakes`) || "{}");
  } catch {
    return {};
  }
}

function setPage(page) {
  state.page = page;
  els.pageButtons.forEach((button) => button.classList.toggle("active", button.dataset.page === page));
  els.studyFlow.classList.toggle("hidden", page !== "trainer");
  els.trainer.classList.toggle("hidden", page !== "trainer");
  els.coloringPage.classList.toggle("hidden", page !== "coloring");
  els.readerPage.classList.toggle("hidden", page !== "reader");
  els.trainerControls.forEach((control) => control.classList.toggle("hidden", page !== "trainer"));
  if (page === "coloring") {
    renderPaintPalette();
    renderPaintGrid();
  } else if (page === "reader") {
    if (!state.reader.checked && !state.reader.revealed && state.reader.selectedHands.size === 0) {
      pickRandomReaderCase();
      return;
    }
    renderReader();
  }
}

function currentReaderScenario() {
  return readerScenarios.find((scenario) => scenario.id === state.reader.scenarioId) || readerScenarios[0];
}

function renderReaderScenarioOptions() {
  els.readerScenario.innerHTML = "";
  readerScenarios.forEach((scenario) => {
    const option = document.createElement("option");
    option.value = scenario.id;
    option.textContent = scenario.title;
    els.readerScenario.appendChild(option);
  });
  els.readerScenario.value = state.reader.scenarioId;
}

function renderReader() {
  const scenario = currentReaderScenario();
  els.readerBoard.textContent = displayBoard(scenario.board, scenario.turn);
  els.readerLine.textContent = scenario.line;
  els.readerHero.textContent = scenario.heroPosition;
  els.readerVillain.textContent = scenario.villainPosition;
  els.readerTask.textContent = `${scenario.villainPosition}に残る塊を選択`;
  els.readerAction.textContent = scenario.action;
  renderReaderPick();
  renderReaderGrid();
  renderReaderStats();
}

function renderReaderPick() {
  els.readerPick.innerHTML = "";
  const selectedCategories = selectedReaderCategories();
  readerCategories.forEach(([id, label, hint]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.category = id;
    button.className = selectedCategories.has(id) ? "active" : "";
    button.innerHTML = `<strong>${label}</strong><span>${hint}</span>`;
    els.readerPick.appendChild(button);
  });
}

function renderReaderGrid() {
  const scenario = currentReaderScenario();
  const retained = retainedReaderHands(scenario);
  const answerHands = new Set(retained.map((entry) => entry.hand));
  const startingHands = readerStartingHandSet(scenario);
  const showAnswer = state.reader.revealed || state.reader.checked;
  els.readerGrid.innerHTML = "";
  for (let row = 0; row < 13; row += 1) {
    for (let col = 0; col < 13; col += 1) {
      const hand = handAt(row, col);
      const level = correctPaintLevel(row, col);
      const item = retained.find((entry) => entry.hand === hand);
      const selected = state.reader.selectedHands.has(hand);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.dataset.hand = hand;
      cell.className = `readerCell ${showAnswer && item ? `rank-${level}` : "blank"}`;
      if (!startingHands.has(hand)) {
        cell.classList.add("locked");
        cell.disabled = true;
      }
      if (selected) cell.classList.add("selected");
      if (showAnswer && !item) cell.classList.add("faded");
      if (state.reader.checked) {
        if (selected && answerHands.has(hand)) cell.classList.add("correct");
        else if (selected && !answerHands.has(hand)) cell.classList.add("extra");
        else if (!selected && answerHands.has(hand)) cell.classList.add("missed");
      }
      cell.textContent = hand;
      if (state.reader.checked) {
        if (selected && answerHands.has(hand)) cell.dataset.mark = "✓";
        else if (selected && !answerHands.has(hand)) cell.dataset.mark = "+";
        else if (!selected && answerHands.has(hand)) cell.dataset.mark = "!";
      }
      cell.title = showAnswer && item ? `${hand}: ${categoryLabel(item.category)}` : `${hand}: クリックで選択`;
      els.readerGrid.appendChild(cell);
    }
  }
}

function renderReaderStats() {
  const scenario = currentReaderScenario();
  const retained = retainedReaderHands(scenario);
  const caseIndex = readerScenarios.findIndex((item) => item.id === scenario.id);
  const answerHands = new Set(retained.map((entry) => entry.hand));
  const selected = Array.from(state.reader.selectedHands);
  const correct = selected.filter((hand) => answerHands.has(hand)).length;
  const extra = selected.filter((hand) => !answerHands.has(hand)).length;
  const missing = retained.filter((entry) => !state.reader.selectedHands.has(entry.hand)).length;
  const score = Math.max(0, Math.round(((correct - extra * 0.65 - missing * 0.35) / Math.max(1, retained.length)) * 100));
  els.readerScore.textContent = state.reader.checked ? `${score}%` : "--";
  els.readerCombos.textContent = state.reader.revealed || state.reader.checked
    ? `${selected.length}/${retained.length}`
    : `${selected.length}/--`;
  els.readerCaseCount.textContent = `${caseIndex + 1}/${readerScenarios.length}`;
  renderReaderResult({ correct, extra, missing, score, retainedCount: retained.length });
  if (state.reader.checked) {
    els.readerStatus.textContent = extra || missing
      ? `一致${correct}、残しすぎ${extra}、落としすぎ${missing}。表の記号を見直します。`
      : "完全一致。残存レンジの形を確認します。";
  } else if (state.reader.revealed) {
    els.readerStatus.textContent = "残るレンジを表示中。カテゴリの偏りを表で確認します。";
  } else {
    els.readerStatus.textContent = `${scenario.villainPosition}の開始レンジ内から、アクション後に残るハンドを選びます。`;
  }
  renderReaderNotes(scenario);
  els.readerReveal.textContent = state.reader.revealed ? "レンジを隠す" : "残るレンジを見る";
}

function renderReaderResult({ correct, extra, missing, score, retainedCount }) {
  els.readerResult.className = "readerResult hidden";
  els.readerResult.innerHTML = "";
  els.readerLegend.classList.add("hidden");
  if (!state.reader.checked) return;

  const isPerfect = extra === 0 && missing === 0;
  els.readerResult.className = `readerResult ${isPerfect ? "perfect" : score >= 70 ? "close" : "needsWork"}`;

  const summary = document.createElement("strong");
  summary.textContent = isPerfect ? "完全一致" : score >= 70 ? "だいたい近い" : "見直し多め";
  const details = document.createElement("span");
  details.textContent = `正しく残した ${correct}/${retainedCount} ・ 残しすぎ ${extra} ・ 落としすぎ ${missing}`;
  els.readerResult.append(summary, details);
  els.readerLegend.classList.remove("hidden");
}

function renderReaderNotes(scenario) {
  els.readerNotes.innerHTML = "";
  if (!state.reader.checked && !state.reader.revealed) return;

  const fragment = document.createDocumentFragment();
  (scenario.notes || []).forEach((note) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = note;
    fragment.appendChild(paragraph);
  });
  (scenario.insights || []).forEach((insight) => {
    const section = document.createElement("section");
    section.className = "readerInsight";
    const title = document.createElement("h3");
    title.textContent = insight.title;
    const body = document.createElement("p");
    body.textContent = insight.body;
    section.append(title, body);
    fragment.appendChild(section);
  });
  els.readerNotes.appendChild(fragment);
}

function displayBoard(board, turn = null) {
  const rankText = board.replace(/[^AKQJT98765432]/g, "");
  const ranksText = rankText.split("").join(" ");
  const texture = board.endsWith("r") ? "rainbow" : board.endsWith("ss") ? "♠♠" : board.endsWith("tt") ? "♠♠x" : "";
  const flopText = `${ranksText}${texture ? ` ${texture}` : ""}`;
  return turn ? `${flopText} / Turn ${turn}` : flopText || board;
}

function toggleReaderHand(hand) {
  if (!readerStartingHandSet(currentReaderScenario()).has(hand)) return;
  if (state.reader.selectedHands.has(hand)) state.reader.selectedHands.delete(hand);
  else state.reader.selectedHands.add(hand);
}

function setReaderHand(hand, selected) {
  if (!readerStartingHandSet(currentReaderScenario()).has(hand)) return;
  if (selected) state.reader.selectedHands.add(hand);
  else state.reader.selectedHands.delete(hand);
}

function applyReaderDragAt(clientX, clientY) {
  const target = document.elementFromPoint(clientX, clientY);
  const cell = target && target.closest("button[data-hand]");
  if (!cell) return false;
  const hand = cell.dataset.hand;
  if (state.reader.draggedHands.has(hand)) return true;
  state.reader.draggedHands.add(hand);
  setReaderHand(hand, state.reader.dragMode === "add");
  state.reader.checked = false;
  state.reader.revealed = false;
  return true;
}

function toggleReaderCategory(category) {
  const scenario = currentReaderScenario();
  const board = readerBoardForCategory(scenario);
  const startingHands = readerStartingHandSet(scenario);
  const hands = allHands()
    .filter((entry) => startingHands.has(entry.hand))
    .map((entry) => ({ ...entry, category: readerHandCategory(entry.hand, board) }))
    .filter((entry) => entry.category === category)
    .map((entry) => entry.hand);
  const shouldRemove = hands.every((hand) => state.reader.selectedHands.has(hand));
  hands.forEach((hand) => {
    if (shouldRemove) state.reader.selectedHands.delete(hand);
    else state.reader.selectedHands.add(hand);
  });
}

function selectedReaderCategories() {
  const scenario = currentReaderScenario();
  const board = readerBoardForCategory(scenario);
  const startingHands = readerStartingHandSet(scenario);
  const selected = Array.from(state.reader.selectedHands);
  return new Set(readerCategories
    .filter(([category]) => {
      const categoryHands = allHands()
        .filter((entry) => startingHands.has(entry.hand))
        .map((entry) => ({ ...entry, category: readerHandCategory(entry.hand, board) }))
        .filter((entry) => entry.category === category)
        .map((entry) => entry.hand);
      return categoryHands.length && categoryHands.some((hand) => selected.includes(hand));
    })
    .map(([category]) => category));
}

function retainedReaderHands(scenario) {
  const startingHands = readerStartingHandSet(scenario);
  const board = readerBoardForCategory(scenario);
  return allHands()
    .filter((entry) => startingHands.has(entry.hand))
    .map((entry) => ({ ...entry, category: readerHandCategory(entry.hand, board) }))
    .filter((entry) => scenario.keep.includes(entry.category));
}

function readerStartingHandSet(scenario) {
  const threshold = scenario.villainPosition === "BB" ? 1 : openingThreshold(scenario.villainPosition);
  return new Set(allHands()
    .filter(({ row, col }) => correctPaintLevel(row, col) >= threshold)
    .map(({ hand }) => hand));
}

function readerBoardForCategory(scenario) {
  return scenario.turn ? `${scenario.board}${scenario.turn}` : scenario.board;
}

function readerHandCategory(hand, board) {
  const profile = handProfile(hand);
  const boardRanks = board.replace(/[^AKQJT98765432]/g, "").split("");
  const boardPowers = boardRanks.map(rankPower);
  const highBoard = Math.max(...boardPowers);
  const lowBoard = Math.min(...boardPowers);
  const handPowers = [rankPower(profile.first), rankPower(profile.second)];
  const pairedBoard = new Set(boardRanks).size < boardRanks.length;
  const matches = handPowers.filter((power) => boardPowers.includes(power)).length;
  if (profile.pair && handPowers[0] >= highBoard) return "made";
  if (matches >= 2 || (pairedBoard && matches >= 1)) return "made";
  if (matches === 1 && Math.max(...handPowers) >= highBoard) return "topPair";
  if (matches === 1) return "secondPair";
  if (profile.suited && board.includes("ss")) return "draw";
  if (!profile.pair && profile.gap <= 1 && profile.low <= highBoard && profile.high >= lowBoard) return "draw";
  if (handPowers.every((power) => power > highBoard)) return "overcards";
  if (profile.pair && handPowers[0] < highBoard) return "underpair";
  return "air";
}

function categoryLabel(category) {
  const item = readerCategories.find(([id]) => id === category);
  return item ? item[1] : category;
}

function pickRandomReaderCase() {
  if (!readerScenarios.length) return;
  let next = readerScenarios[Math.floor(Math.random() * readerScenarios.length)];
  if (readerScenarios.length > 1) {
    while (next.id === state.reader.scenarioId) {
      next = readerScenarios[Math.floor(Math.random() * readerScenarios.length)];
    }
  }
  state.reader.scenarioId = next.id;
  els.readerScenario.value = next.id;
  resetReaderAnswer();
  renderReader();
}

function resetReaderAnswer() {
  state.reader.selectedHands = new Set();
  state.reader.checked = false;
  state.reader.revealed = false;
}

function loadReaderCases() {
  return fetch("./data/range-reading-cases.json")
    .then((response) => {
      if (!response.ok) throw new Error("case fetch failed");
      return response.json();
    })
    .then((payload) => {
      if (!Array.isArray(payload.cases) || !payload.cases.length) return;
      readerScenarios = payload.cases;
      state.reader.scenarioId = readerScenarios[Math.floor(Math.random() * readerScenarios.length)].id;
      resetReaderAnswer();
      renderReaderScenarioOptions();
      renderReader();
    })
    .catch(() => {
      renderReaderScenarioOptions();
      renderReader();
    });
}

function renderStats() {
  const rate = state.stats.total ? Math.round((state.stats.correct / state.stats.total) * 100) : 0;
  els.accuracy.textContent = `${rate}%`;
  els.streak.textContent = String(state.stats.streak);
  els.masteredCount.textContent = String(Object.keys(state.stats.mastered).length);
  els.weakCount.textContent = String(weakQuestionCount());
}

function weakQuestionCount() {
  return Object.entries(state.stats.progress).filter(([id, progress]) => {
    return progress.wrong > 0 && !state.stats.mastered[id];
  }).length;
}

function showChart() {
  const isTournament = state.mode === "tournament";
  els.chartImage.src = isTournament ? "./assets/tournament.png" : "./assets/ring-game.png";
  els.chartTitle.textContent = isTournament ? "トーナメントのハンドレンジ表" : "リングゲームのハンドレンジ表";
  els.chartDialog.showModal();
}

function loadStats() {
  const fallback = { total: 0, correct: 0, wrong: 0, streak: 0, progress: {}, mastered: {} };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
  } catch {
    return fallback;
  }
}

function saveStats() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state.stats));
  } catch {
    // Keep training usable when browser storage is unavailable.
  }
}

els.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    els.modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    els.modeNote.textContent = state.mode === "tournament" ? "トーナメント用: リングより1ランク広く判定" : "リングゲーム用";
    state.paint.checked = false;
    state.paint.revealed = false;
    renderPaintGrid();
    if (state.page === "trainer") renderQuestion();
    if (state.page === "reader") renderReader();
  });
});

els.pageButtons.forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.page));
});

els.studyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.studyMode = button.dataset.studyMode;
    els.studyButtons.forEach((item) => item.classList.toggle("active", item === button));
    document.body.classList.toggle("chart-after-answer", state.studyMode === "afterAnswer");
    document.body.classList.toggle("chart-revealed", state.studyMode === "afterAnswer" && state.answered);
    els.rangePanel.classList.toggle("answeredVisible", state.studyMode === "withChart" || state.answered);
  });
});

els.drillMode.addEventListener("change", () => {
  state.recentHeroPositions = [];
  state.recentQuestionIds = [];
  state.recentKinds = [];
  renderQuestion();
});

els.actions.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (button) answer(button.dataset.action);
});

els.nextQuestion.addEventListener("click", renderQuestion);
els.showChart.addEventListener("click", showChart);
els.closeChart.addEventListener("click", () => els.chartDialog.close());
els.markMastered.addEventListener("change", () => {
  if (!state.current) return;
  if (els.markMastered.checked) state.stats.mastered[state.current.id] = true;
  else delete state.stats.mastered[state.current.id];
  saveStats();
  renderStats();
});
els.resetStats.addEventListener("click", () => {
  state.stats = { total: 0, correct: 0, wrong: 0, streak: 0, progress: {}, mastered: {} };
  saveStats();
  renderStats();
  renderQuestion();
});
els.paintPalette.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-level]");
  if (!button) return;
  state.paint.selectedLevel = button.dataset.level === "erase" ? null : Number(button.dataset.level);
  renderPaintPalette();
});
els.paintDrillMode.addEventListener("change", () => {
  state.paint.drillMode = els.paintDrillMode.value;
  if (state.paint.drillMode === "band") state.paint.selectedLevel = state.paint.bandLevel;
  state.paint.checked = false;
  state.paint.revealed = false;
  renderPaintPalette();
  renderPaintGrid();
});
els.paintBand.addEventListener("change", () => {
  state.paint.bandLevel = Number(els.paintBand.value);
  state.paint.selectedLevel = state.paint.bandLevel;
  state.paint.checked = false;
  state.paint.revealed = false;
  renderPaintPalette();
  renderPaintGrid();
});
els.paintGrid.addEventListener("pointerdown", (event) => {
  const cell = event.target.closest("button[data-hand]");
  if (!cell) return;
  state.paint.isPainting = true;
  state.paint.draggedHands = new Set();
  state.paint.dragChanged = false;
  els.paintGrid.setPointerCapture?.(event.pointerId);
  event.preventDefault();
  state.paint.draggedHands.add(cell.dataset.hand);
  setPaintLevel(cell.dataset.hand, { render: false, persist: false, cell });
  state.paint.dragChanged = true;
});
els.paintGrid.addEventListener("pointermove", (event) => {
  if (!state.paint.isPainting) return;
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const cell = target && target.closest("button[data-hand]");
  if (!cell) return;
  if (state.paint.draggedHands.has(cell.dataset.hand)) return;
  event.preventDefault();
  state.paint.draggedHands.add(cell.dataset.hand);
  setPaintLevel(cell.dataset.hand, { render: false, persist: false, cell });
  state.paint.dragChanged = true;
});
window.addEventListener("pointerup", (event) => {
  if (state.paint.isPainting && state.paint.dragChanged) {
    savePaintEntries();
    renderPaintGrid();
  }
  state.paint.isPainting = false;
  state.paint.draggedHands = new Set();
  state.paint.dragChanged = false;
  if (els.paintGrid.hasPointerCapture?.(event.pointerId)) els.paintGrid.releasePointerCapture(event.pointerId);
});
window.addEventListener("pointercancel", (event) => {
  if (state.paint.isPainting && state.paint.dragChanged) {
    savePaintEntries();
    renderPaintGrid();
  }
  state.paint.isPainting = false;
  state.paint.draggedHands = new Set();
  state.paint.dragChanged = false;
  if (els.paintGrid.hasPointerCapture?.(event.pointerId)) els.paintGrid.releasePointerCapture(event.pointerId);
});
els.paintCheck.addEventListener("click", () => {
  state.paint.checked = true;
  state.paint.revealed = false;
  state.paint.mistakes[state.mode] = paintMistakeHands();
  savePaintMistakes();
  renderPaintGrid();
});
els.paintReveal.addEventListener("click", () => {
  state.paint.revealed = !state.paint.revealed;
  renderPaintGrid();
});
els.paintClear.addEventListener("click", () => {
  state.paint.entries[state.mode] = {};
  state.paint.checked = false;
  state.paint.revealed = false;
  savePaintEntries();
  renderPaintGrid();
});
els.readerScenario.addEventListener("change", () => {
  state.reader.scenarioId = els.readerScenario.value;
  resetReaderAnswer();
  renderReader();
});
els.readerRandom.addEventListener("click", pickRandomReaderCase);
els.readerPick.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  toggleReaderCategory(button.dataset.category);
  state.reader.checked = false;
  state.reader.revealed = false;
  renderReader();
});
els.readerGrid.addEventListener("pointerdown", (event) => {
  const cell = event.target.closest("button[data-hand]");
  if (!cell) return;
  state.reader.isDragging = true;
  state.reader.dragMode = state.reader.selectedHands.has(cell.dataset.hand) ? "remove" : "add";
  state.reader.draggedHands = new Set();
  event.preventDefault();
  applyReaderDragAt(event.clientX, event.clientY);
  renderReader();
});
els.readerGrid.addEventListener("pointermove", (event) => {
  if (!state.reader.isDragging) return;
  event.preventDefault();
  if (applyReaderDragAt(event.clientX, event.clientY)) renderReader();
});
window.addEventListener("pointerup", () => {
  state.reader.suppressClick = state.reader.isDragging;
  state.reader.isDragging = false;
  state.reader.draggedHands = new Set();
});
els.readerGrid.addEventListener("click", (event) => {
  if (state.reader.suppressClick) {
    state.reader.suppressClick = false;
    return;
  }
  const cell = event.target.closest("button[data-hand]");
  if (!cell) return;
  toggleReaderHand(cell.dataset.hand);
  state.reader.checked = false;
  state.reader.revealed = false;
  renderReader();
});
els.readerCheck.addEventListener("click", () => {
  state.reader.checked = true;
  state.reader.revealed = true;
  renderReader();
});
els.readerReveal.addEventListener("click", () => {
  state.reader.revealed = !state.reader.revealed;
  renderReader();
});
els.readerReset.addEventListener("click", () => {
  resetReaderAnswer();
  renderReader();
});

renderLegend();
renderPaintPalette();
renderPaintGrid();
loadReaderCases();
renderStats();
setPage("trainer");
renderQuestion();
