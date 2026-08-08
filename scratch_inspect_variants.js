const fs = require('fs');
const html = fs.readFileSync('scratch_muakey.html', 'utf8');

const rsc = html.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

// Search for variant / option groups
const idx = rsc.indexOf('Dịch Vụ Hỗ Trợ Nâng Cấp Gemini Advanced');
if (idx !== -1) {
  console.log("=== PRODUCT CONTEXT SLICE ===");
  console.log(rsc.substring(idx - 200, idx + 2500));
}
