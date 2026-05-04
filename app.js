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

const state = {
  mode: "cash",
  studyMode: "withChart",
  current: null,
  answered: false,
  reviewHand: null,
  recentHeroPositions: [],
  recentQuestionIds: [],
  recentKinds: [],
  stats: loadStats(),
};

const els = {
  modeButtons: document.querySelectorAll("[data-mode]"),
  studyButtons: document.querySelectorAll("[data-study-mode]"),
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
  rangePanel: document.querySelector(".rangePanel"),
  memoryCoach: document.querySelector("#memoryCoach"),
  cueRule: document.querySelector("#cueRule"),
  cueHand: document.querySelector("#cueHand"),
  cueProgress: document.querySelector("#cueProgress"),
  whyPanel: document.querySelector("#whyPanel"),
  whyTitle: document.querySelector("#whyTitle"),
  whyList: document.querySelector("#whyList"),
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
  const base = { UTG: 6, EP: 5, "LJ/HJ": 4, CO: 3, BTN: 2 }[position];
  return state.mode === "tournament" ? Math.max(1, base - 1) : base;
}

function answerFor(question) {
  const strength = effectiveLevel(question.baseLevel);
  if (question.kind === "open") {
    return strength >= openingThreshold(question.heroPosition) ? "open" : "fold";
  }

  if (question.kind === "bbDefense") {
    const callThreshold = { "LJ/HJ": 4, CO: 3, BTN: 1 }[question.villainPosition];
    const adjustedCall = state.mode === "tournament" ? Math.max(1, callThreshold - 1) : callThreshold;
    if (strength >= adjustedCall + 2) return "raise";
    if (strength >= adjustedCall) return "call";
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
    const adjustedCall = state.mode === "tournament" ? Math.max(1, callThreshold - 1) : callThreshold;
    return onBoundary && strength >= adjustedCall - 1 && strength <= adjustedCall + 2;
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
  scrollQuestionIntoView();
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
    if (progress.correct >= 3) state.stats.mastered[state.current.id] = true;
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
    const adjustedCall = state.mode === "tournament" ? Math.max(1, callThreshold - 1) : callThreshold;
    return `BBは${question.villainPosition}相手に${thresholdLabel(adjustedCall)}でコール、2ランク上でレイズ`;
  }
  const threshold = openingThreshold(question.villainPosition);
  return `${question.villainPosition}オープンには1ランク上でコール、2ランク上でレイズ`;
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
    const adjustedCall = state.mode === "tournament" ? Math.max(1, callThreshold - 1) : callThreshold;
    return `${question.hand}は${band}。BB対${question.villainPosition}は${thresholdLabel(adjustedCall)}でコール、さらに強ければレイズです。`;
  }
  const threshold = openingThreshold(question.villainPosition);
  return `${question.hand}は${band}。相手レンジより1ランク上でコール、2ランク上でレイズです。`;
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
    els.cueProgress.textContent = `あと${Math.max(1, 3 - progress.correct)}回で習得`;
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
  const stage = question.kind === "open" ? question.heroPosition : question.villainPosition;
  const strength = effectiveLevel(question.baseLevel);
  const threshold = referenceThreshold(question);
  const title = revealed
    ? `${question.hand}: ${levelNames[strength]} / 基準 ${thresholdLabel(threshold)}`
    : `${question.hand} の価値と弱点`;

  const points = [
    ...handTypePoints(profile).slice(0, 2),
    thresholdComparisonPoints(question, strength, threshold)[0],
  ];

  if (question.kind === "open") {
    points.push(...openContextPoints(question, profile, revealed).slice(0, 2));
  } else if (question.kind === "bbDefense") {
    points.push(...bbDefenseContextPoints(question, profile, revealed).slice(0, 2));
  } else {
    points.push(...vsOpenContextPoints(question, profile, revealed).slice(0, 2));
  }

  if (revealed) {
    points.push(...postAnswerPoints(question, profile, stage).slice(0, 2));
  }

  return { title, points };
}

function scrollQuestionIntoView() {
  if (!window.matchMedia("(max-width: 760px)").matches) return;
  requestAnimationFrame(() => {
    els.scenarioType.scrollIntoView({ block: "start", behavior: "auto" });
  });
}

function referenceThreshold(question) {
  if (question.kind === "open") return openingThreshold(question.heroPosition);
  if (question.kind === "bbDefense") {
    const callThreshold = { "LJ/HJ": 4, CO: 3, BTN: 1 }[question.villainPosition];
    return state.mode === "tournament" ? Math.max(1, callThreshold - 1) : callThreshold;
  }
  return openingThreshold(question.villainPosition);
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
  const seats = Object.keys(seatPositions);
  els.seatLayer.innerHTML = "";

  seats.forEach((position) => {
    const seat = document.createElement("div");
    const isHero = position === hero;
    const isVillain = position === villain;
    const isLowerSeat = seatPositions[position].y > 58;
    seat.className = `seat${isHero ? " hero" : ""}${isVillain ? " villain" : ""}${isLowerSeat ? " lowerSeat" : ""}`;
    seat.style.left = `${seatPositions[position].x}%`;
    seat.style.top = `${seatPositions[position].y}%`;
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
  localStorage.setItem(storageKey, JSON.stringify(state.stats));
}

els.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    els.modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    els.modeNote.textContent = state.mode === "tournament" ? "トーナメント用: リングより1ランク広く判定" : "リングゲーム用";
    renderQuestion();
  });
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

renderLegend();
renderStats();
renderQuestion();
