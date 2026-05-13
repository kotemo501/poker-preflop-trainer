const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data", "range-reading-cases.json");
const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
const validCategories = new Set(["made", "topPair", "secondPair", "draw", "overcards", "underpair", "air"]);
const validPositions = new Set(["UTG", "EP", "LJ/HJ", "CO", "BTN", "BB"]);
const errors = [];
const ids = new Set();
const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
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

function handAt(row, col) {
  if (row === col) return ranks[row] + ranks[col];
  return ranks[Math.min(row, col)] + ranks[Math.max(row, col)] + (row < col ? "s" : "o");
}

function allHands() {
  const hands = [];
  for (let row = 0; row < 13; row += 1) {
    for (let col = 0; col < 13; col += 1) {
      hands.push({ hand: handAt(row, col), row, col });
    }
  }
  return hands;
}

function openingThreshold(position) {
  return { UTG: 6, EP: 5, "LJ/HJ": 4, CO: 3, BTN: 2 }[position];
}

function rankPower(rank) {
  return { A: 14, K: 13, Q: 12, J: 11, T: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 }[rank];
}

function handProfile(hand) {
  const suited = hand.endsWith("s");
  const pair = hand.length === 2 && hand[0] === hand[1];
  const first = hand[0];
  const second = hand[1];
  const high = Math.max(rankPower(first), rankPower(second));
  const low = Math.min(rankPower(first), rankPower(second));
  const gap = Math.max(0, high - low - 1);
  return { suited, pair, first, second, high, low, gap };
}

function categoryFor(hand, board) {
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

function startingHands(item) {
  const threshold = item.villainPosition === "BB" ? 1 : openingThreshold(item.villainPosition);
  return new Set(allHands()
    .filter(({ row, col }) => cashMatrix[row][col] >= threshold)
    .map(({ hand }) => hand));
}

if (!Array.isArray(payload.cases) || payload.cases.length < 100) {
  errors.push("cases must contain at least 100 items");
}

for (const item of payload.cases || []) {
  if (!item.id || ids.has(item.id)) errors.push(`duplicate or missing id: ${item.id}`);
  ids.add(item.id);

  ["title", "heroPosition", "villainPosition", "board", "street", "betSize", "line", "action"].forEach((field) => {
    if (!item[field]) errors.push(`${item.id}: missing ${field}`);
  });

  if (!validPositions.has(item.heroPosition)) errors.push(`${item.id}: invalid heroPosition ${item.heroPosition}`);
  if (!validPositions.has(item.villainPosition)) errors.push(`${item.id}: invalid villainPosition ${item.villainPosition}`);
  if (!["flop", "turn"].includes(item.street)) errors.push(`${item.id}: invalid street ${item.street}`);
  if (item.street === "turn" && !item.turn) errors.push(`${item.id}: turn case missing turn card`);
  if (item.street === "flop" && item.turn) errors.push(`${item.id}: flop case should not have turn card`);
  if (item.betSize === "75%" && item.street !== "turn") errors.push(`${item.id}: 75% cases must be turn cases`);
  if (item.betSize === "33%" && !/33%/.test(item.line)) errors.push(`${item.id}: 33% betSize missing from line`);
  if (item.betSize === "75%" && !/75%/.test(item.line)) errors.push(`${item.id}: 75% betSize missing from line`);
  if (/一度アクション|次のストリート/.test(item.line)) errors.push(`${item.id}: ambiguous action line`);
  if (!Array.isArray(item.keep) || !item.keep.length) errors.push(`${item.id}: keep must be non-empty`);
  (item.keep || []).forEach((category) => {
    if (!validCategories.has(category)) errors.push(`${item.id}: invalid keep category ${category}`);
  });
  if (item.insights !== undefined) {
    if (!Array.isArray(item.insights) || !item.insights.length) {
      errors.push(`${item.id}: insights must be a non-empty array when present`);
    } else {
      item.insights.forEach((insight, index) => {
        if (!insight || typeof insight.title !== "string" || !insight.title.trim()) {
          errors.push(`${item.id}: insights[${index}] missing title`);
        }
        if (!insight || typeof insight.body !== "string" || !insight.body.trim()) {
          errors.push(`${item.id}: insights[${index}] missing body`);
        }
      });
    }
  }

  const start = startingHands(item);
  const board = item.turn ? `${item.board}${item.turn}` : item.board;
  const retained = allHands()
    .filter(({ hand }) => start.has(hand))
    .filter(({ hand }) => item.keep.includes(categoryFor(hand, board)));
  if (!retained.length) errors.push(`${item.id}: retained range is empty`);
  retained.forEach(({ hand }) => {
    if (!start.has(hand)) errors.push(`${item.id}: retained ${hand} outside starting range`);
  });
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${payload.cases.length} range-reading cases`);
