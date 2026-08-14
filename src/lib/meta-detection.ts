/**
 * Meta Ads Service & Branch Automatic Detection Utility
 * Standardizes detection of clinic services and regional branches from campaign/adset names.
 */

export interface RawMetaRow {
  service?: string;
  branch?: string;
  campaign_name?: string;
  adset_name?: string;
  ad_name?: string;
  target_locations?: string[];
}

export type CanonicalService = "Implant" | "Răng sứ" | "Niềng răng" | "Nha khoa tổng quát";

/**
 * Detect canonical clinic service from campaign/adset fields
 */
export function detectService(row: RawMetaRow): CanonicalService {
  if (row.service && row.service.trim().length > 0) {
    const s = row.service.trim();
    if (s.toLowerCase().includes("implant")) return "Implant";
    if (s.toLowerCase().includes("sứ") || s.toLowerCase().includes("su") || s.toLowerCase().includes("veneer")) return "Răng sứ";
    if (s.toLowerCase().includes("niềng") || s.toLowerCase().includes("nieng") || s.toLowerCase().includes("chỉnh nha")) return "Niềng răng";
    if (s.toLowerCase().includes("tổng") || s.toLowerCase().includes("tẩy") || s.toLowerCase().includes("cạo")) return "Nha khoa tổng quát";
  }

  const text = `${row.campaign_name || ""} ${row.adset_name || ""} ${row.ad_name || ""}`.toUpperCase();

  // 1. Implant
  if (
    text.includes("IMP") ||
    text.includes("IMPLANT") ||
    text.includes("CẤY GHÉP") ||
    text.includes("CAY GHEP") ||
    text.includes("TRỒNG RĂNG") ||
    text.includes("TRONG RANG")
  ) {
    return "Implant";
  }

  // 2. Răng sứ
  if (
    text.includes("SỨ") ||
    text.includes("SU ") ||
    text.endsWith("SU") ||
    text.includes("VENEER") ||
    text.includes("MÃO") ||
    text.includes("MAO") ||
    text.includes("BỌC SỨ") ||
    text.includes("BOC SU") ||
    text.includes("RĂNG SỨ") ||
    text.includes("RANG SU")
  ) {
    return "Răng sứ";
  }

  // 3. Niềng răng / Chỉnh nha
  if (
    text.includes("NIỀNG") ||
    text.includes("NIENG") ||
    text.includes("CHỈNH NHA") ||
    text.includes("CHINH NHA") ||
    text.includes("INVISALIGN") ||
    text.includes("MẮC CÀI") ||
    text.includes("MAC CAI") ||
    text.includes("RĂNG HÔ") ||
    text.includes("RANG HO")
  ) {
    return "Niềng răng";
  }

  // 4. Nha khoa tổng quát (Default fallback)
  return "Nha khoa tổng quát";
}

/**
 * Detect regional clinic branch location from campaign/adset fields & targets
 */
export function detectBranch(row: RawMetaRow): string {
  if (row.branch && row.branch.trim().length > 0 && row.branch !== "Unknown") {
    return row.branch.trim();
  }

  const text = `${row.campaign_name || ""} ${row.adset_name || ""} ${(row.target_locations || []).join(" ")}`.toUpperCase();

  if (text.includes("BINH DUONG") || text.includes("BÌNH DƯƠNG") || text.includes("BD_") || text.includes("_BD") || text.includes("THỦ DẦU MỘT") || text.includes("THUAN AN") || text.includes("THUẬN AN") || text.includes("DĨ AN") || text.includes("DI AN")) {
    return "Bình Dương";
  }
  if (text.includes("BIEN HOA") || text.includes("BIÊN HOÀ") || text.includes("BIÊN HÒA") || text.includes("BH_") || text.includes("_BH") || text.includes("DONG NAI") || text.includes("ĐỒNG NAI")) {
    return "Biên Hoà";
  }
  if (text.includes("CAN THO") || text.includes("CẦN THƠ") || text.includes("CT_") || text.includes("_CT") || text.includes("NINH KIỀU") || text.includes("CÁI RĂNG")) {
    return "Cần Thơ";
  }
  if (text.includes("TIEN GIANG") || text.includes("TIỀN GIANG") || text.includes("MY THO") || text.includes("MỸ THO") || text.includes("TG_") || text.includes("_TG")) {
    return "Tiền Giang";
  }
  if (text.includes("AN GIANG") || text.includes("LONG XUYEN") || text.includes("LONG XUYÊN") || text.includes("AG_") || text.includes("_AG")) {
    return "An Giang";
  }
  if (text.includes("VUNG TAU") || text.includes("VŨNG TÀU") || text.includes("BA RIA") || text.includes("BÀ RỊA") || text.includes("VT_") || text.includes("_VT")) {
    return "Vũng Tàu";
  }
  if (text.includes("KIEN GIANG") || text.includes("KIÊN GIANG") || text.includes("RACH GIA") || text.includes("RẠCH GIÁ") || text.includes("KG_") || text.includes("_KG")) {
    return "Kiên Giang";
  }
  if (text.includes("LONG AN") || text.includes("TAN AN") || text.includes("TÂN AN") || text.includes("LA_") || text.includes("_LA")) {
    return "Long An";
  }
  if (text.includes("TAY NINH") || text.includes("TÂY NINH") || text.includes("TN_") || text.includes("_TN")) {
    return "Tây Ninh";
  }
  if (text.includes("DA NANG") || text.includes("ĐÀ NẴNG") || text.includes("DN_") || text.includes("_DN")) {
    return "Đà Nẵng";
  }
  if (text.includes("HA NOI") || text.includes("HÀ NỘI") || text.includes("HN_") || text.includes("_HN")) {
    return "Hà Nội";
  }
  if (text.includes("HCM") || text.includes("HỒ CHÍ MINH") || text.includes("HO CHI MINH") || text.includes("SAI GON") || text.includes("SÀI GÒN") || text.includes("TPHCM") || text.includes("SG_") || text.includes("_SG")) {
    return "HCM";
  }

  // Default fallback for clinic campaigns
  return "HCM";
}
