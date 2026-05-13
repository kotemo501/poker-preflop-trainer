const fs = require("fs");
const path = require("path");

const lineFamilies = [
  { id: "utg-bb", opener: "UTG", caller: "BB", hero: "BB", villain: "UTG", preflop: "UTGがオープン、BBがコール。" },
  { id: "ep-bb", opener: "EP", caller: "BB", hero: "BB", villain: "EP", preflop: "EPがオープン、BBがコール。" },
  { id: "hj-bb", opener: "LJ/HJ", caller: "BB", hero: "BB", villain: "LJ/HJ", preflop: "LJ/HJがオープン、BBがコール。" },
  { id: "co-bb", opener: "CO", caller: "BB", hero: "BB", villain: "CO", preflop: "COがオープン、BBがコール。" },
  { id: "btn-bb", opener: "BTN", caller: "BB", hero: "BB", villain: "BTN", preflop: "BTNがオープン、BBがコール。" },
  { id: "utg-btn", opener: "UTG", caller: "BTN", hero: "BTN", villain: "UTG", preflop: "UTGがオープン、BTNがコール。" },
  { id: "ep-btn", opener: "EP", caller: "BTN", hero: "BTN", villain: "EP", preflop: "EPがオープン、BTNがコール。" },
  { id: "co-btn", opener: "CO", caller: "BTN", hero: "BTN", villain: "CO", preflop: "COがオープン、BTNがコール。" },
  { id: "bb-btn", opener: "BTN", caller: "BB", hero: "BTN", villain: "BB", preflop: "BTNがオープン、BBがコール。" },
];

const boardProfiles = [
  {
    id: "a72r",
    label: "A72r",
    board: "A72r",
    type: "Aハイドライ",
    small: ["made", "topPair", "secondPair", "overcards", "air"],
    pressure: ["made", "topPair", "secondPair"],
    check: ["underpair", "overcards", "air"],
    attack: ["made", "topPair", "secondPair"],
    notes: ["Aハイドライはプリフロップレイザーが小さく広く打ちやすい。", "強いAだけに寄せすぎると、小CBに含まれる空振りを落としすぎる。"],
  },
  {
    id: "k83r",
    label: "K83r",
    board: "K83r",
    type: "Kハイドライ",
    small: ["made", "topPair", "secondPair", "overcards", "air"],
    pressure: ["made", "topPair", "secondPair"],
    check: ["underpair", "overcards", "air"],
    attack: ["made", "topPair", "secondPair"],
    notes: ["Kハイドライもレイザー有利だが、Aハイよりコール側のヒットも少し残る。", "小CBなら未ヒットの高いカードも残す。"],
  },
  {
    id: "qj5tt",
    label: "QJ5tt",
    board: "QJ5tt",
    type: "高カード2枚ツートーン",
    small: ["made", "topPair", "secondPair", "draw", "overcards"],
    pressure: ["made", "topPair", "secondPair", "draw"],
    check: ["underpair", "overcards", "draw", "air"],
    attack: ["made", "topPair", "secondPair", "draw"],
    notes: ["高カード2枚はトップペアと強いドローが多く残る。", "ツートーンではフラッシュドローを落としすぎない。"],
  },
  {
    id: "t54r",
    label: "T54r",
    board: "T54r",
    type: "低中連結レインボー",
    small: ["made", "topPair", "secondPair", "draw", "overcards"],
    pressure: ["made", "topPair", "secondPair", "draw"],
    check: ["underpair", "overcards", "air", "draw"],
    attack: ["made", "topPair", "secondPair", "draw", "underpair"],
    notes: ["低中連結はBB側が多く絡みやすい。", "ワンペア、ペア+ドロー、オーバーペア系を意識して残す。"],
  },
  {
    id: "876ss",
    label: "876ss",
    board: "876ss",
    type: "低中連結ツートーン",
    small: ["made", "topPair", "secondPair", "draw"],
    pressure: ["made", "draw"],
    check: ["underpair", "overcards", "draw", "air"],
    attack: ["made", "secondPair", "draw"],
    notes: ["876ツートーンはコール側にツーペア、ストレート、強いドローが多い。", "強いアクション後は完成役とドローを中心に残す。"],
  },
  {
    id: "772r",
    label: "772r",
    board: "772r",
    type: "低ペアボード",
    small: ["made", "underpair", "overcards", "air"],
    pressure: ["made", "underpair", "topPair"],
    check: ["underpair", "overcards", "air"],
    attack: ["made", "underpair", "air"],
    notes: ["ペアボードの小CBは広く打てる。", "強い完成役だけでなく、オーバーカードや中小ペアも一部残る。"],
  },
  {
    id: "tt4r",
    label: "TT4r",
    board: "TT4r",
    type: "高ペアボード",
    small: ["made", "underpair", "overcards", "air"],
    pressure: ["made", "underpair"],
    check: ["underpair", "overcards", "air"],
    attack: ["made", "underpair"],
    notes: ["高ペアボードでは強いペアと中小ペアが残りやすい。", "小さいサイズなら空振りを完全には消さない。"],
  },
  {
    id: "aj5ss",
    label: "AJ5ss",
    board: "AJ5ss",
    type: "Aハイ濃いドロー",
    small: ["made", "topPair", "secondPair", "draw", "overcards"],
    pressure: ["made", "topPair", "secondPair", "draw"],
    check: ["underpair", "draw", "air"],
    attack: ["made", "topPair", "secondPair", "draw"],
    notes: ["Aハイでドローが濃い時はAヒットと強いドローを残す。", "大きいベットはレンジ全体より強い塊に寄る。"],
  },
  {
    id: "986tt",
    label: "986tt",
    board: "986tt",
    type: "ミドル連結ツートーン",
    small: ["made", "topPair", "secondPair", "draw", "overcards"],
    pressure: ["made", "draw"],
    check: ["underpair", "overcards", "draw", "air"],
    attack: ["made", "draw", "topPair", "secondPair"],
    notes: ["ミドル連結はコール側にもかなり刺さる。", "チェックバックやレイズでレンジの形が大きく変わる。"],
  },
  {
    id: "q83r",
    label: "Q83r",
    board: "Q83r",
    type: "Qハイドライ",
    small: ["made", "topPair", "secondPair", "overcards", "air"],
    pressure: ["made", "topPair", "secondPair"],
    check: ["underpair", "overcards", "air"],
    attack: ["made", "topPair", "secondPair", "air"],
    notes: ["Qハイドライは小CBしやすいが、A/Kハイほど一方的ではない。", "遅延CBでは弱いショーダウンバリューも残る。"],
  },
  {
    id: "ak4r",
    label: "AK4r",
    board: "AK4r",
    type: "AKハイ",
    small: ["made", "topPair", "secondPair", "overcards"],
    pressure: ["made", "topPair", "secondPair"],
    check: ["underpair", "air"],
    attack: ["made", "topPair", "secondPair"],
    notes: ["AKハイは早いポジションのレイザーにかなり強く当たりやすい。", "強いアクションでは空振りを残しすぎない。"],
  },
  {
    id: "654r",
    label: "654r",
    board: "654r",
    type: "低連結",
    small: ["made", "draw", "overcards"],
    pressure: ["made", "draw"],
    check: ["underpair", "overcards", "air", "draw"],
    attack: ["made", "draw", "underpair"],
    notes: ["低連結はBB側のレンジに強く絡む。", "強いアクションではセット、ツーペア、ストレート、ドローを中心に残す。"],
  },
];

function actionTemplates(family, board) {
  const turn = turnCardFor(board.id);
  if (family.villain === "BB") {
    return [
      {
        id: "donk-small",
        label: "BBドンク",
        street: "flop",
        betSize: "33%",
        turn: null,
        line: `${family.preflop}フロップ ${board.label}。${family.villain}が33%サイズでドンクベット。`,
        action: `${family.villain}のドンク後、${family.villain}側に残すハンドをクリック。`,
        keep: board.attack,
        notes: [`${board.type}でのドンクは、コール側が絡んだ時に出やすい。`, ...board.notes],
      },
      {
        id: "checkraise",
        label: "チェックレイズ",
        street: "flop",
        betSize: "check-raise",
        turn: null,
        line: `${family.preflop}フロップ ${board.label}。${family.villain}チェック、${family.opener}が33%CB、${family.villain}がチェックレイズ。`,
        action: `${family.villain}のチェックレイズ後、${family.villain}側に残すハンドをクリック。`,
        keep: board.attack.filter((category) => category !== "air"),
        notes: [`チェックレイズ後はレンジが強い完成役と強いドローに寄りやすい。`, ...board.notes],
      },
    ];
  }

  return [
    {
      id: "small-cbet",
      label: "小CB",
      street: "flop",
      betSize: "33%",
      turn: null,
      line: `${family.preflop}フロップ ${board.label}。${family.caller}チェック、${family.villain}が33%サイズでCB。`,
      action: `${family.villain}の小CB後、${family.villain}側に残すハンドをクリック。`,
      keep: board.small,
      notes: [`小CBは広めに打てるラインなので、強いハンドだけに絞りすぎない。`, ...board.notes],
    },
    {
      id: board.id.includes("986") || board.id.includes("876") || board.id.includes("654") ? "big-barrel" : "delayed-or-big",
      label: board.id.includes("986") || board.id.includes("876") || board.id.includes("654") ? "大きめ継続" : "遅延/大きめ",
      street: "turn",
      betSize: "75%",
      turn,
      line: `${family.preflop}フロップ ${board.label}。${family.caller}チェック、${family.villain}が33%CB、${family.caller}がコール。ターン ${turn} で${family.caller}チェック、${family.villain}が75%サイズでベット。`,
      action: `${family.villain}のターン75%ベット後、${family.villain}側に濃く残すハンドをクリック。`,
      keep: board.pressure,
      notes: [`ターン75%ベットは、フロップ小CBより強い完成役・強いドロー・強いペアに寄る。`, ...board.notes],
    },
  ];
}

function turnCardFor(boardId) {
  return {
    a72r: "8",
    k83r: "2",
    qj5tt: "9",
    t54r: "J",
    "876ss": "2",
    "772r": "Q",
    tt4r: "A",
    aj5ss: "3",
    "986tt": "K",
    q83r: "T",
    ak4r: "8",
    "654r": "Q",
  }[boardId] || "8";
}

const cases = [];
for (const family of lineFamilies) {
  for (const board of boardProfiles) {
    for (const action of actionTemplates(family, board)) {
      cases.push({
        id: `${family.id}-${board.id}-${action.id}`,
        title: `${family.villain} vs ${family.hero} / ${board.label} / ${action.label}`,
        heroPosition: family.hero,
        villainPosition: family.villain,
        board: board.board,
        turn: action.turn,
        street: action.street,
        betSize: action.betSize,
        line: action.line,
        action: action.action,
        keep: Array.from(new Set(action.keep)),
        notes: action.notes.slice(0, 3),
      });
    }
  }
}

const payload = {
  source: {
    name: "Balanced normalized poker range-reading cases",
    description: "Generated training cases balanced across position families, common board textures, and practical postflop actions. Real hand histories should be normalized into this same schema by the app-server/GPT pipeline.",
    public_dataset_reference: "A Dataset of Poker Hand Histories, Zenodo DOI 10.5281/zenodo.10796886",
    generated_case_count: cases.length,
  },
  coverage: {
    position_families: lineFamilies.length,
    board_profiles: boardProfiles.length,
    action_variants_per_family_board: 2,
  },
  cases,
};

const outPath = path.join(__dirname, "..", "data", "range-reading-cases.json");
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${cases.length} cases to ${outPath}`);
