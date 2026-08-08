const fs = require('fs');
const html = fs.readFileSync('scratch_muakey.html', 'utf8');

// Unescape RSC stream
const rsc = html.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

// 1. Title & Meta
const titleMatch = html.match(/<title>(.*?)<\/title>/);
console.log("=== TITLE ===");
console.log(titleMatch ? titleMatch[1] : "N/A");

// 2. Extract product options / variants / packages
console.log("\n=== PACKAGES / OPTIONS ===");
const optionMatches = rsc.match(/Gói\s*[^"<>]{1,50}|Tài khoản\s*[^"<>]{1,50}|Nâng cấp\s*[^"<>]{1,50}/gi);
if (optionMatches) {
  console.log(Array.from(new Set(optionMatches)).slice(0, 20));
}

// 3. Extract Prices
console.log("\n=== PRICES ===");
const priceMatches = rsc.match(/[\d\.]+\s*(?:đ|đ|VNĐ)/gi);
if (priceMatches) {
  console.log(Array.from(new Set(priceMatches)).slice(0, 20));
}

// 4. Extract Key Product Features / Tabs / Blocks
console.log("\n=== PRODUCT BLOCKS & SECTIONS ===");
const blockTitles = rsc.match(/"children":\s*"([^"]{3,60})"/g);
if (blockTitles) {
  const cleanTitles = blockTitles
    .map(b => b.replace(/"children":\s*"/, '').replace('"', '').trim())
    .filter(t => !t.startsWith('$') && !t.includes('{') && t.length > 2);
  console.log(Array.from(new Set(cleanTitles)).slice(0, 40));
}
