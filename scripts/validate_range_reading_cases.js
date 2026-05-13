const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data", "range-reading-cases.json");
const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
const validCategories = new Set(["made", "topPair", "secondPair", "draw", "overcards", "underpair", "air"]);
const validPositions = new Set(["UTG", "EP", "LJ/HJ", "CO", "BTN", "BB"]);
const errors = [];
const ids = new Set();

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
  if (/一度アクション|次のストリート/.test(item.line)) errors.push(`${item.id}: ambiguous action line`);
  if (!Array.isArray(item.keep) || !item.keep.length) errors.push(`${item.id}: keep must be non-empty`);
  (item.keep || []).forEach((category) => {
    if (!validCategories.has(category)) errors.push(`${item.id}: invalid keep category ${category}`);
  });
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${payload.cases.length} range-reading cases`);
