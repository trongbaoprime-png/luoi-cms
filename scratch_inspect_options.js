const fs = require('fs');
const html = fs.readFileSync('scratch_muakey.html', 'utf8');
const rsc = html.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

const idx = rsc.indexOf('Dịch Vụ Hỗ Trợ Nâng Cấp Gemini Advanced');
if (idx !== -1) {
  console.log("=== PRODUCT UI OPTIONS SLICE ===");
  console.log(rsc.substring(idx + 4500, idx + 8500));
}
