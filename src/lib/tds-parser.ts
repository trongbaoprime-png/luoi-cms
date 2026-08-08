/**
 * Tâm Đức Smile (TDS) Data Parser Library
 * Ported 100% faithfully from Apps Script & Dashboard JS
 */

export const CONFIG_YEAR = 2026;

export function normalizeText(value: any): string {
  return String(value || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeSource(value: any): string {
  const text = normalizeText(value);

  if (text === 'FACEBOOK' || text.includes('FACEBOOK')) return 'FACEBOOK';
  if (text === 'HLFB') return 'HLFB';

  if (text === 'TIKTOK' || text.includes('TIKTOK') || text.includes('TIK TOK')) return 'TIKTOK';
  if (text === 'HLTT') return 'HLTT';

  if (text === 'WEBSITE') return 'WEBSITE';
  if (text === 'HLW') return 'HLW';
  if (text === 'CWEB') return 'CWEB';
  if (text === 'GG') return 'GG';
  if (text === 'HLGG') return 'HLGG';

  if (text === 'HOTLINE') return 'HOTLINE';
  if (text === 'HTK') return 'HTK';

  return String(value || '').trim().toUpperCase();
}

export function getSourceGroup(value: any): string {
  const text = normalizeText(normalizeSource(value));

  if (text === 'FACEBOOK' || text === 'HLFB' || text.includes('FACEBOOK')) return 'FACEBOOK';
  if (['WEBSITE', 'HLW', 'CWEB', 'GG', 'HLGG'].includes(text) || text.includes('WEBSITE')) return 'WEBSITE';
  if (text === 'TIKTOK' || text === 'HLTT' || text.includes('TIKTOK') || text.includes('TIK TOK')) return 'TIKTOK';
  if (text === 'HOTLINE' || text === 'HTK' || text.includes('HOTLINE')) return 'HOTLINE';

  return 'KHÁC';
}

export function normalizeBranch(value: any): string {
  const text = normalizeText(value);

  if (text.includes('DA LAT')) return 'ĐÀ LẠT';
  if (text.includes('TAY NINH')) return 'TÂY NINH';
  if (text.includes('DA NANG')) return 'ĐÀ NẴNG';
  if (text.includes('QUY NHON')) return 'QUY NHƠN';
  if (text.includes('BINH PHUOC')) return 'BÌNH PHƯỚC';

  if (text.includes('THU DUC')) return 'THỦ ĐỨC';
  if (text.includes('BINH CHANH')) return 'BÌNH CHÁNH';
  if (text.includes('BINH THANH')) return 'BÌNH THẠNH';
  if (text.includes('GO VAP')) return 'GÒ VẤP';
  if (text.includes('HOC MON')) return 'HÓC MÔN';
  if (text.includes('LANDMARK')) return 'LANDMARK';
  if (text.includes('LBB')) return 'LBB';
  if (text.includes('QUAN 1')) return 'QUẬN 1';
  if (text.includes('QUAN 3')) return 'QUẬN 3';
  if (text.includes('QUAN 7')) return 'QUẬN 7';
  if (text.includes('TAN BINH')) return 'TÂN BÌNH';
  if (text.includes('TAN PHU')) return 'TÂN PHÚ';
  if (text.includes('TEN LUA')) return 'TÊN LỬA';
  if (text.includes('VINH LOC B')) return 'VĨNH LỘC B';

  if (text.includes('BINH DUONG')) return 'BÌNH DƯƠNG';
  if (text.includes('DI AN')) return 'DĨ AN';
  if (text.includes('MINH HOA')) return 'MINH HOÀ';

  if (text.includes('BIEN HOA')) return 'BIÊN HÒA';
  if (text.includes('GIA KIEM')) return 'GIA KIỆM';
  if (text.includes('DAI PHUOC')) return 'ĐẠI PHƯỚC';

  if (text.includes('CAN THO 1')) return 'CẦN THƠ 1';
  if (text.includes('CAN THO 2')) return 'CẦN THƠ 2';
  if (text.includes('THOT NOT')) return 'THỐT NỐT';
  if (text.includes('CA MAU')) return 'CÀ MAU';
  if (text.includes('BAC LIEU')) return 'BẠC LIÊU';
  if (text.includes('SOC TRANG')) return 'SÓC TRĂNG';
  if (text.includes('DONG THAP')) return 'ĐỒNG THÁP';

  if (text.includes('VUNG TAU')) return 'VŨNG TÀU';
  if (text.includes('BA RIA')) return 'BÀ RỊA';
  if (text.includes('BA CU')) return 'BA CU';
  if (text.includes('XUYEN MOC')) return 'XUYÊN MỘC';
  if (text.includes('PHUOC TINH')) return 'PHƯỚC TỈNH';

  return String(value || '').trim().toUpperCase();
}

export function getBranchGroup(value: any): string {
  const text = normalizeText(normalizeBranch(value));

  const hcm = [
    'BINH CHANH', 'BINH THANH', 'GO VAP', 'HOC MON', 'LANDMARK',
    'LBB', 'QUAN 1', 'QUAN 3', 'QUAN 7', 'TAN BINH',
    'TAN PHU', 'TEN LUA', 'THU DUC', 'VINH LOC B'
  ];

  const binhDuong = ['BINH DUONG', 'DI AN', 'MINH HOA'];
  const vungTau = ['VUNG TAU', 'BA CU', 'BA RIA', 'XUYEN MOC', 'PHUOC TINH'];
  const dongNai = ['BIEN HOA', 'GIA KIEM', 'DAI PHUOC'];
  const mienTay = ['CAN THO 1', 'CAN THO 2', 'THOT NOT', 'CA MAU', 'BAC LIEU', 'SOC TRANG', 'DONG THAP'];

  if (hcm.some(x => text.includes(x))) return 'HCM';
  if (binhDuong.some(x => text.includes(x))) return 'BÌNH DƯƠNG';
  if (vungTau.some(x => text.includes(x))) return 'TP VŨNG TÀU';
  if (dongNai.some(x => text.includes(x))) return 'ĐỒNG NAI';
  if (mienTay.some(x => text.includes(x))) return 'MIỀN TÂY';

  return 'CN KHÁC';
}

export function normalizeService(value: any): string {
  const text = normalizeText(value);

  if (text === 'CN' || text.includes('CHINH NHA') || text.includes('NIENG') || text.includes('INVISALIGN')) return 'CN';

  if (text === 'TRAM') return 'TRÁM';
  if (text === 'CTUY') return 'CTUY';
  if (text === 'CVR') return 'CVR';
  if (text === 'NR') return 'NR';
  if (text === 'TL') return 'TL';
  if (text === 'TTR') return 'TTR';
  if (text === 'HDT') return 'HĐT';
  if (text === 'GMC') return 'GMC';
  if (text === 'MXO') return 'MXO';
  if (text === 'KTQ') return 'KTQ';
  if (text === 'TQ') return 'TQ';

  if (text === 'IMP' || text.includes('IMPLANT') || text.includes('ALL ON')) return 'IMP';
  if (text === 'SU' || text.includes('RANG SU') || text.includes('VENEER')) return 'SỨ';

  return String(value || '').trim().toUpperCase();
}

export function getServiceGroup(value: any): string {
  const text = normalizeText(normalizeService(value));

  if (text === 'CN' || text.includes('CHINH NHA') || text.includes('NIENG') || text.includes('INVISALIGN')) return 'CHỈNH NHA';
  if (text.includes('IMPLANT') || text === 'IMP' || text.includes('ALL ON')) return 'IMPLANT';
  if (text === 'SU' || text.includes('RANG SU') || text.includes('VENEER')) return 'RĂNG SỨ';

  return 'TỔNG QUÁT';
}

export function normalizeTelesale(value: any): string {
  const t = normalizeText(value);

  if (t === 'CHANG' || t === 'TRANG') return 'TRANG';
  if (t === 'LIEU') return 'LIỂU';
  if (t === 'TELE' || t === 'TELEVOI') return 'TELEVOI';

  return String(value || '').trim().toUpperCase();
}

export function isOldCustomerByColumnO(value: any): boolean {
  const text = normalizeText(value);
  if (!text) return false;

  return (
    text === 'OLD' ||
    text === 'CU' ||
    text.includes('OLD') ||
    text.includes('KHACH CU') ||
    text.includes('KH CU')
  );
}

export function isMonthNoteH(value: any): boolean {
  const text = normalizeText(value);
  return /TRONG THANG\s*\d{1,2}/.test(text);
}

export function isSpecificDateH(value: any): boolean {
  const text = normalizeText(value);
  if (!text) return false;
  if (isMonthNoteH(value)) return false;
  return /\d{1,2}[\/\-.]\d{1,2}/.test(text);
}

export function getCheckinDateKey(value: any, defaultYear: number = CONFIG_YEAR): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const text = normalizeText(raw);
  if (text.includes('TRONG THANG')) return '';

  // 1. Check if ISO string YYYY-MM-DD
  const isoMatch = raw.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (isoMatch) {
    let y = Number(isoMatch[1]);
    let mo = Number(isoMatch[2]);
    let d = Number(isoMatch[3]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      if (y < 2020 || y > 2030) y = defaultYear;
      return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // 2. Try JavaScript Date parsing if ISO string with T/GMT
  const dateObj = new Date(raw);
  if (!isNaN(dateObj.getTime()) && raw.length > 8 && (raw.includes('T') || raw.includes('GMT') || raw.includes('Z'))) {
    let y = dateObj.getFullYear();
    let mo = dateObj.getMonth() + 1;
    let d = dateObj.getDate();
    if (y < 2020 || y > 2030) y = defaultYear;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // 3. Match 3 components: p1/p2/p3 or 2 components: p1/p2
  const parts = raw.match(/(\d{1,4})[\/\-.](\d{1,2})(?:[\/\-.](\d{1,4}))?/);
  if (!parts) return '';

  let p1 = Number(parts[1]);
  let p2 = Number(parts[2]);
  let p3 = parts[3] ? Number(parts[3]) : undefined;

  let y = defaultYear;
  let mo = 1;
  let d = 1;

  if (p3 !== undefined) {
    // Case 3 parts: YY/MM/DD (26/05/31), YYYY/MM/DD (2026/05/31), DD/MM/YYYY (31/05/2026), or DD/MM/YY (31/05/26)
    if (p1 === 26 || p1 === 2026 || (p1 >= 20 && p1 <= 30)) {
      // YY/MM/DD or YYYY/MM/DD (e.g. 26/05/31 -> 2026-05-31)
      y = p1 < 100 ? 2000 + p1 : p1;
      mo = p2;
      d = p3;
    } else if (p3 === 26 || p3 === 2026 || (p3 >= 2000 && p3 <= 2030) || (p3 >= 20 && p3 <= 30)) {
      // DD/MM/YYYY or DD/MM/YY (e.g. 31/05/2026 or 31/05/26 -> 2026-05-31)
      d = p1;
      mo = p2;
      y = p3 < 100 ? 2000 + p3 : p3;
    } else {
      d = p1;
      mo = p2;
      y = p3 < 100 ? 2000 + p3 : p3;
    }
  } else {
    // Case 2 parts: p1/p2 (e.g. 31/5 or 4/8 -> DD/MM)
    d = p1;
    mo = p2;
    y = defaultYear;
  }

  // Handle month/day swap if mo > 12
  if (mo > 12 && d <= 12) {
    const temp = d;
    d = mo;
    mo = temp;
  }

  if (y < 2020 || y > 2030) y = defaultYear;
  if (mo < 1 || mo > 12) return '';
  if (d < 1 || d > 31) return '';

  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const match = String(dateStr).trim().match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (match) {
    const y = match[1];
    const m = String(match[2]).padStart(2, '0');
    const d = String(match[3]).padStart(2, '0');
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

export function isRot(value: any): boolean {
  const text = normalizeText(value);
  return text === 'R' || text === 'ROT' || text === 'RỚT';
}

export function isDauValue(value: any): boolean {
  const text = normalizeText(value);

  if (!text) return false;
  if (isRot(text)) return false;
  if (text === 'THEO') return true;
  if (text === '0') return true;

  return text.replace(/[^\d]/g, '') !== '';
}

export function getResult(jValue: any, checkin: number): 'Đậu' | 'Rớt' | 'Chưa có' {
  if (!checkin) return 'Chưa có';

  if (isRot(jValue)) return 'Rớt';
  if (isDauValue(jValue)) return 'Đậu';

  return 'Chưa có';
}

export function parseRevenueJ(value: any): number {
  const text = normalizeText(value);

  if (!text) return 0;
  if (isRot(text)) return 0;
  if (text === 'THEO') return 0;
  if (text === '0') return 0;

  const number = text.replace(/[^\d]/g, '');

  return number ? Number(number) : 0;
}

export function parseMoney(value: any): number {
  const text = String(value || '').replace(/[^\d]/g, '');
  return text ? Number(text) : 0;
}

export function isValidCaTheo(value: any): boolean {
  const text = String(value || '').trim();
  if (!text) return false;

  return text.replace(/[^\d]/g, '') !== '';
}

export interface ParsedTdsRow {
  fullName: string;
  phone: string;
  source: string;
  sourceGroup: string;
  branch: string;
  branchGroup: string;
  service: string;
  serviceGroup: string;
  telesale: string;
  checkinDate: string;
  isMonthNote: boolean;
  checkin: number;
  result: 'Đậu' | 'Rớt' | 'Chưa có';
  status: 'NEW' | 'QUALIFIED' | 'SCHEDULED' | 'CHECKIN' | 'PURCHASE' | 'JUNK';
  revenue: number;
  actualRevenue: number;
  caTheoRevenue: number;
  isOldCustomer: boolean;
  isKoMkt: boolean;
  isVietKieu: boolean;
  isNN: boolean;
  ctkm?: string;
}

export function isKoMkt(value: any): boolean {
  return String(value || '').trim() === '0';
}

export function isNguoiNuocNgoai(value: any): boolean {
  const text = normalizeText(value);
  if (!text) return false;
  return (
    text === 'NN' ||
    text.includes('NGUOI NUOC NGOAI') ||
    text.includes('FOREIGN')
  );
}

export function normalizePhoneNumber(raw: any): string {
  if (!raw) return "";
  let str = String(raw).trim();

  // If contains multiple phones separated by /, -, or comma, take the first valid one
  if (str.includes("/") || str.includes(",") || (str.includes("-") && !str.startsWith("+"))) {
    const parts = str.split(/[\/,]/);
    for (const part of parts) {
      const cleaned = part.replace(/[^\d+]/g, "");
      if (cleaned.length >= 9) {
        str = part;
        break;
      }
    }
  }

  // Remove non-digit and non-plus characters
  let clean = str.replace(/[^\d+]/g, "");

  // Convert 00 prefix (e.g., 0016501234567 -> +16501234567)
  if (clean.startsWith("00")) {
    clean = "+" + clean.slice(2);
  }

  // Handle Vietnam phone numbers
  if (clean.startsWith("+84")) {
    clean = "0" + clean.slice(3);
  } else if (clean.startsWith("84") && clean.length === 11 && (clean.startsWith("843") || clean.startsWith("845") || clean.startsWith("847") || clean.startsWith("848") || clean.startsWith("849"))) {
    clean = "0" + clean.slice(2);
  }

  return clean;
}

export function isForeignPhone(phone: string): boolean {
  const norm = normalizePhoneNumber(phone);
  if (!norm) return false;

  // Domestic VN phone starts with 0 and is 10 digits
  if (/^0\d{9}$/.test(norm)) {
    return false;
  }

  // Starts with + and not Vietnam
  if (norm.startsWith("+") && !norm.startsWith("+84") && !norm.startsWith("0")) {
    return true;
  }

  // International prefixes: +1, +61, +44, +33, +49, +81, +82, +886, +65, +64, +41, +60, +852, +86
  const foreignPrefixes = ["+1", "+61", "+44", "+33", "+49", "+81", "+82", "+886", "+65", "+64", "+41", "+60", "+852", "+86"];
  if (foreignPrefixes.some((p) => norm.startsWith(p))) {
    return true;
  }

  // If number is non-VN 11-14 digits not starting with 0
  if (/^[1-9]\d{9,13}$/.test(norm) && !norm.startsWith("0")) {
    return true;
  }

  return false;
}

export function isVietKieu(value: any, phone?: string): boolean {
  const text = normalizeText(value);
  
  // Checking phone number country code
  if (phone && isForeignPhone(phone)) {
    if (!text || (text !== 'NN' && !text.includes('NGUOI NUOC NGOAI') && !text.includes('FOREIGN'))) {
      return true;
    }
  }

  if (!text) return false;
  if (
    text === 'NN' ||
    text.includes('NGUOI NUOC NGOAI') ||
    text.includes('FOREIGN')
  ) {
    return false;
  }
  if (text === 'VK' || text.includes('VK') || text.includes('VIET KIEU')) return true;
  const countries = [
    'MY', 'USA', 'CANADA', 'UC', 'ANH', 'PHAP', 'DUC', 'NHAT', 'HAN', 'HAN QUOC', 'DAI LOAN', 'SINGAPORE', 'UC CHAU', 'NEW ZEALAND', 'THUY SI', 'MALAYSIA'
  ];
  return countries.some(c => text.includes(c));
}

export function isRealName(n?: string): boolean {
  if (!n) return false;
  const s = String(n).trim();
  if (!s || s.length < 2) return false;
  if (s.includes('#') || s.includes('ERROR') || s.includes('VALUE') || s.includes('N/A')) return false;
  const u = s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (u.startsWith('KHACH') || u.startsWith('DAT HEN')) return false;
  return true;
}

export function getPriorityRef(existingRef?: string | null, incomingRef?: string): string {
  if (existingRef === 'Form' || incomingRef === 'Form') return 'Form';
  if (existingRef === 'App' || incomingRef === 'App') return 'App';
  return incomingRef || existingRef || 'Checkin';
}

export function parseTdsPayload(body: any): ParsedTdsRow {
  const isDathen = String(body.type || "").toUpperCase() === "DATHEN";
  // Sheet nhân viên (từ T6): Họ Tên = cột C, Số ĐT = cột D
  // Sheet ĐẶT HẸN       : Họ Tên = cột B, Số ĐT = cột C

  const nameFromCol  = isDathen ? (body.colB || '') : (body.colC || '');
  const phoneFromCol = isDathen ? (body.colC || '') : (body.colD || '');

  // Ưu tiên cột vật lý (colB/colC) để tránh bị ghi đè bởi named-field có thể là giả/placeholder
  // body.fullName = rawName đã được lọc từ google-sheets.ts, cũng an toàn để dùng nếu cột trống
  const name  = nameFromCol ||
    body.fullName ||
    body.hoTen || body.ho_ten || body.customerName || body.name || '';
  const rawPhone = phoneFromCol ||
    body.phone ||
    body.so_dt || body.soDt || body.phone_number || '';
  const phone = normalizePhoneNumber(rawPhone) || rawPhone;

  const rawSource = body.source || (isDathen ? body.colD : body.colE) || body.colE || body.nguon || 'Chưa rõ';
  const rawBranch = body.branch || (isDathen ? body.colE : body.colF) || body.colF || body.chi_nhanh || 'Chưa rõ';
  const rawService = body.service || body.colG || body.dvu || 'Chưa rõ';
  const rawTelesale = body.telesale || (isDathen ? body.colH : body.colL) || body.sale || 'Chưa rõ';

  const hValue = body.checkinDate || body.colH || body.checkin || '';
  const jValue = body.revenueStr || body.colJ || body.doanh_thu || body.revenue || '';
  const kValue = body.colK || body.mkt || '';
  const lValue = body.colL || body.ca_theo || '';
  const mValue = body.actualRevenueStr || body.colM || body.thuc_thu || '';
  const nValue = body.colN || body.doi_tuong || '';
  const oValue = body.colO || body.khach_cu || '';
  const pValue = body.colP || body.ctkm || '';

  const source = normalizeSource(rawSource);
  const sourceGroup = getSourceGroup(source);
  const branch = normalizeBranch(rawBranch);
  const branchGroup = getBranchGroup(branch);
  const service = normalizeService(rawService);
  const serviceGroup = getServiceGroup(service);
  const telesale = normalizeTelesale(rawTelesale);

  const hasSpecificDate = isSpecificDateH(hValue);
  const hasMonthNote = isMonthNoteH(hValue);
  const isOld = isOldCustomerByColumnO(oValue);

  const checkinDateKey = getCheckinDateKey(hValue);
  const checkin = hasSpecificDate ? 1 : 0;
  const result = getResult(jValue, checkin);

  const revenue = parseRevenueJ(jValue);
  const actualRevenue = parseMoney(mValue);
  const caTheoRevenue = isValidCaTheo(lValue) ? parseMoney(lValue) : 0;

  const isKoMktVal = isKoMkt(kValue);
  const isNNVal = isNguoiNuocNgoai(nValue);
  const isVKVal = isVietKieu(nValue, phone);

  let status: 'CHECKIN' | 'PURCHASE' | 'QUALIFIED' = 'QUALIFIED';

  if (checkin === 1 || hasMonthNote) {
    if (result === 'Đậu' && revenue > 0) {
      status = 'PURCHASE';
    } else {
      status = 'CHECKIN';
    }
  }

  return {
    fullName: name,
    phone,
    source,
    sourceGroup,
    branch,
    branchGroup,
    service,
    serviceGroup,
    telesale,
    checkinDate: checkinDateKey,
    isMonthNote: hasMonthNote,
    checkin,
    result,
    status,
    revenue,
    actualRevenue,
    caTheoRevenue,
    isOldCustomer: isOld,
    isKoMkt: isKoMktVal,
    isVietKieu: isVKVal,
    isNN: isNNVal,
    ctkm: pValue,
  };
}
