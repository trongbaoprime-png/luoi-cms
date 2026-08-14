/**
 * LƯỜI BUSINESS OS — Tâm Đức Smile (TDS) Master Pancake Tag Directory & Classifier
 * 
 * Chuẩn hóa 100% dựa trên Bảng Master Thẻ Pancake thực tế của Tâm Đức Smile:
 * 
 * 1. Nhóm Trạng Thái & Chuyển Đổi:
 *    - SDT: Khách để lại SĐT (Raw, cần Telesale call xác nhận) -> RAW_LEAD
 *    - DDH: Khách đã đặt hẹn thăm khám -> QUALIFIED
 *    - #ĐẬU: Khách ghé chi nhánh làm dịch vụ => phát sinh tiền -> PURCHASE
 *    - #RỚT: Khách ghé chi nhánh tư vấn rớt => cần chăm lại về sau -> RE_NURTURE
 * 
 * 2. Nhóm Bùng & Kịch Bản Chăm Sóc Lại (Drip Nurture):
 *    - BumKPH: Khách không phản hồi => Kịch bản chăm 7-14 ngày
 *    - BumDV: Khách hỏi dịch vụ chưa ghé => Kịch bản chăm 7-14 ngày hỏi lịch hẹn
 *    - BumHEN: Khách đặt hẹn chưa ghé => Kịch bản chăm 7 ngày nhắc hẹn ghé sớm
 *    - KPH: Khách không phản hồi
 *    - HếtNC: Khách báo hết nhu cầu
 *    - SPAM: Khách spam, phá => Loại trừ & Báo cáo Meta loại bỏ
 *    - TRÙNG: Khách nhắn nhiều page
 * 
 * 3. Nhóm Dịch Vụ:
 *    - IMP: Dịch vụ Implant
 *    - SỨ: Dịch vụ Răng sứ / Veneer
 *    - CN: Dịch vụ Niềng / Chỉnh nha
 *    - TQ: Dịch vụ Tổng quát (Cạo vôi, trám răng, nhổ răng...)
 *    - KHÁC: Khách hỏi không liên quan (tuyển dụng, bán hàng...)
 * 
 * 4. Nhóm Phân Loại Khách:
 *    - VK: Người Việt kiều sống ở nước ngoài
 *    - NN: Người nước ngoài
 *    - XA: Khách ở khu vực xa
 *    - OLD: Khách cũ
 *    - Kênh khác: Khách từ Google, Web, TikTok, truyền thống
 *    - KKC: Khách complain, phản hồi dịch vụ không tốt
 *    - Gửi lỗi: Telesale nhắn lỗi, cần gửi lại
 *    - SALE: Khách của nhân viên cũ đã nghỉ
 * 
 * 5. Danh sách Telesale:
 *    - HẬU, TRÚC, QUIN, NHUNG, TRANG, Trân Miln, Liễu, THẢO, SINH, HẠ, Loan, XUÂN
 */

export interface MasterPancakeTag {
  code: string;
  color: string;
  stt: number;
  label: string;
  category: "STATUS" | "SERVICE" | "NURTURE" | "SEGMENT" | "TELESALE" | "SYSTEM";
  crmStatus?: "RAW_LEAD" | "QUALIFIED" | "PURCHASE" | "FAIL" | "RE_NURTURE";
  nurturePlan?: string;
  isSpam?: boolean;
}

export const MASTER_PANCAKE_TAGS: Record<string, MasterPancakeTag> = {
  // --- 1. TRẠNG THÁI & CHUYỂN ĐỔI ---
  "SDT": {
    code: "SDT",
    color: "#08d72d",
    stt: 1,
    label: "Khách để lại SĐT (Cần call xác nhận)",
    category: "STATUS",
    crmStatus: "RAW_LEAD",
  },
  "SĐT": {
    code: "SDT",
    color: "#08d72d",
    stt: 1,
    label: "Khách để lại SĐT (Cần call xác nhận)",
    category: "STATUS",
    crmStatus: "RAW_LEAD",
  },
  "DDH": {
    code: "DDH",
    color: "#26a8ff",
    stt: 2,
    label: "Khách đã đặt hẹn thăm khám",
    category: "STATUS",
    crmStatus: "QUALIFIED",
  },
  "DĐH": {
    code: "DDH",
    color: "#26a8ff",
    stt: 2,
    label: "Khách đã đặt hẹn thăm khám",
    category: "STATUS",
    crmStatus: "QUALIFIED",
  },
  "#ĐẬU": {
    code: "#ĐẬU",
    color: "#925828",
    stt: 17,
    label: "Khách ghé chi nhánh làm dịch vụ => Phát sinh tiền",
    category: "STATUS",
    crmStatus: "PURCHASE",
  },
  "DAU": {
    code: "#ĐẬU",
    color: "#925828",
    stt: 17,
    label: "Khách ghé chi nhánh làm dịch vụ => Phát sinh tiền",
    category: "STATUS",
    crmStatus: "PURCHASE",
  },
  "#RỚT": {
    code: "#RỚT",
    color: "#cac93b",
    stt: 18,
    label: "Khách ghé chi nhánh tư vấn rớt => Cần chăm lại",
    category: "STATUS",
    crmStatus: "RE_NURTURE",
    nurturePlan: "Chăm sóc lại khách rớt sau tư vấn",
  },
  "ROT": {
    code: "#RỚT",
    color: "#cac93b",
    stt: 18,
    label: "Khách ghé chi nhánh tư vấn rớt => Cần chăm lại",
    category: "STATUS",
    crmStatus: "RE_NURTURE",
    nurturePlan: "Chăm sóc lại khách rớt sau tư vấn",
  },

  // --- 2. DỊCH VỤ ---
  "SỨ": {
    code: "SỨ",
    color: "#cf6dab",
    stt: 10,
    label: "Dịch vụ Răng sứ / Veneer",
    category: "SERVICE",
  },
  "SU": {
    code: "SỨ",
    color: "#cf6dab",
    stt: 10,
    label: "Dịch vụ Răng sứ / Veneer",
    category: "SERVICE",
  },
  "IMP": {
    code: "IMP",
    color: "#3466a1",
    stt: 11,
    label: "Dịch vụ Implant",
    category: "SERVICE",
  },
  "IMPLANT": {
    code: "IMP",
    color: "#3466a1",
    stt: 11,
    label: "Dịch vụ Implant",
    category: "SERVICE",
  },
  "CN": {
    code: "CN",
    color: "#469ea1",
    stt: 12,
    label: "Dịch vụ Niềng / Chỉnh nha",
    category: "SERVICE",
  },
  "NIENG": {
    code: "CN",
    color: "#469ea1",
    stt: 12,
    label: "Dịch vụ Niềng / Chỉnh nha",
    category: "SERVICE",
  },
  "NIỀNG": {
    code: "CN",
    color: "#469ea1",
    stt: 12,
    label: "Dịch vụ Niềng / Chỉnh nha",
    category: "SERVICE",
  },
  "TQ": {
    code: "TQ",
    color: "#E06DBE",
    stt: 13,
    label: "Dịch vụ Tổng quát (Cạo vôi, trám, nhổ răng...)",
    category: "SERVICE",
  },
  "KHÁC": {
    code: "KHÁC",
    color: "#FFCC66",
    stt: 14,
    label: "Hỏi ngoài dịch vụ (Tuyển dụng, bán hàng...)",
    category: "SERVICE",
  },

  // --- 3. PHÂN KHÚC KHÁCH HÀNG ---
  "XA": {
    code: "XA",
    color: "#042237",
    stt: 3,
    label: "Khách ở khu vực xa",
    category: "SEGMENT",
  },
  "VK": {
    code: "VK",
    color: "#E78CE1",
    stt: 15,
    label: "Khách là Việt Kiều (sống ở nước ngoài)",
    category: "SEGMENT",
  },
  "NN": {
    code: "NN",
    color: "#4A9586",
    stt: 16,
    label: "Khách là người nước ngoài",
    category: "SEGMENT",
  },
  "OLD": {
    code: "OLD",
    color: "#3B9C9C",
    stt: 9,
    label: "Khách cũ",
    category: "SEGMENT",
  },
  "KÊNH KHÁC": {
    code: "Kênh khác",
    color: "#172d00",
    stt: 8,
    label: "Khách kênh Google / Web / TikTok / Truyền thống",
    category: "SEGMENT",
  },
  "KENH KHAC": {
    code: "Kênh khác",
    color: "#172d00",
    stt: 8,
    label: "Khách kênh Google / Web / TikTok / Truyền thống",
    category: "SEGMENT",
  },
  "KKC": {
    code: "KKC",
    color: "#040720",
    stt: 35,
    label: "Khách complain, phản hồi dịch vụ không tốt",
    category: "SEGMENT",
  },

  // --- 4. BÙNG & KỊCH BẢN CHĂM SÓC (NURTURE) ---
  "BUMKPH": {
    code: "BumKPH",
    color: "#2F74D0",
    stt: 31,
    label: "Khách không phản hồi => Chăm lại 7-14 ngày",
    category: "NURTURE",
    crmStatus: "RE_NURTURE",
    nurturePlan: "Kịch bản chăm 7-14 ngày cho khách không phản hồi",
  },
  "BUMDV": {
    code: "BumDV",
    color: "#C88141",
    stt: 32,
    label: "Khách hỏi dịch vụ chưa ghé => Chăm lại 7-14 ngày",
    category: "NURTURE",
    crmStatus: "RE_NURTURE",
    nurturePlan: "Kịch bản chăm 7-14 ngày hỏi lịch hẹn dịch vụ",
  },
  "BUMHEN": {
    code: "BumHEN",
    color: "#4BFE78",
    stt: 33,
    label: "Khách đặt hẹn chưa ghé => Nhắc hẹn 7 ngày",
    category: "NURTURE",
    crmStatus: "RE_NURTURE",
    nurturePlan: "Kịch bản chăm 7 ngày nhắc hẹn ghé sớm",
  },
  "KPH": {
    code: "KPH",
    color: "#2c373e",
    stt: 4,
    label: "Khách không phản hồi",
    category: "NURTURE",
  },
  "HẾTNC": {
    code: "HếtNC",
    color: "#1f0c25",
    stt: 5,
    label: "Khách báo hết nhu cầu",
    category: "NURTURE",
    crmStatus: "FAIL",
  },
  "HETNC": {
    code: "HếtNC",
    color: "#1f0c25",
    stt: 5,
    label: "Khách báo hết nhu cầu",
    category: "NURTURE",
    crmStatus: "FAIL",
  },
  "SPAM": {
    code: "SPAM",
    color: "#000000",
    stt: 6,
    label: "Khách spam, phá => Báo cáo Meta loại bỏ",
    category: "NURTURE",
    crmStatus: "FAIL",
    isSpam: true,
  },
  "TRÙNG": {
    code: "TRÙNG",
    color: "#1e1319",
    stt: 7,
    label: "Khách nhắn nhiều page",
    category: "NURTURE",
  },
  "TRUNG": {
    code: "TRÙNG",
    color: "#1e1319",
    stt: 7,
    label: "Khách nhắn nhiều page",
    category: "NURTURE",
  },
  "SALE": {
    code: "SALE",
    color: "#08d72d",
    stt: 34,
    label: "Khách của nhân viên cũ đã nghỉ (có thể bỏ)",
    category: "SYSTEM",
  },
  "GỬI LỖI": {
    code: "Gửi lỗi",
    color: "#999999",
    stt: 36,
    label: "Telesale không nhắn được: Cần gửi lại",
    category: "SYSTEM",
  },
  "GUI LOI": {
    code: "Gửi lỗi",
    color: "#999999",
    stt: 36,
    label: "Telesale không nhắn được: Cần gửi lại",
    category: "SYSTEM",
  },

  // --- 5. TELESALE PHỤ TRÁCH (STT 19-30) ---
  "HẬU": { code: "HẬU", color: "#8ce8df", stt: 19, label: "Telesale: Hậu", category: "TELESALE" },
  "HAU": { code: "HẬU", color: "#8ce8df", stt: 19, label: "Telesale: Hậu", category: "TELESALE" },
  "TRÚC": { code: "TRÚC", color: "#2fccf1", stt: 20, label: "Telesale: Trúc", category: "TELESALE" },
  "TRUC": { code: "TRÚC", color: "#2fccf1", stt: 20, label: "Telesale: Trúc", category: "TELESALE" },
  "QUIN": { code: "QUIN", color: "#d55f4d", stt: 21, label: "Telesale: Quỳnh", category: "TELESALE" },
  "QUỲNH": { code: "QUIN", color: "#d55f4d", stt: 21, label: "Telesale: Quỳnh", category: "TELESALE" },
  "NHUNG": { code: "NHUNG", color: "#FF0066", stt: 22, label: "Telesale: Nhung", category: "TELESALE" },
  "TRANG": { code: "TRANG", color: "#11c532", stt: 23, label: "Telesale: Trang", category: "TELESALE" },
  "TRÂN MILN": { code: "Trân Miln", color: "#38A6F4", stt: 24, label: "Telesale: Trân Miln", category: "TELESALE" },
  "TRAN MILN": { code: "Trân Miln", color: "#38A6F4", stt: 24, label: "Telesale: Trân Miln", category: "TELESALE" },
  "LIỄU": { code: "Liễu", color: "#003EFF", stt: 25, label: "Telesale: Liễu", category: "TELESALE" },
  "LIEU": { code: "Liễu", color: "#003EFF", stt: 25, label: "Telesale: Liễu", category: "TELESALE" },
  "THẢO": { code: "THẢO", color: "#C605FF", stt: 26, label: "Telesale: Thảo", category: "TELESALE" },
  "THAO": { code: "THẢO", color: "#C605FF", stt: 26, label: "Telesale: Thảo", category: "TELESALE" },
  "SINH": { code: "SINH", color: "#c1b800", stt: 27, label: "Telesale: Sinh", category: "TELESALE" },
  "HẠ": { code: "HẠ", color: "#3fc72d", stt: 28, label: "Telesale: Hạ", category: "TELESALE" },
  "HA": { code: "HẠ", color: "#3fc72d", stt: 28, label: "Telesale: Hạ", category: "TELESALE" },
  "LOAN": { code: "Loan", color: "#416840", stt: 29, label: "Telesale: Loan", category: "TELESALE" },
  "XUÂN": { code: "XUÂN", color: "#ff2b00", stt: 30, label: "Telesale: Xuân", category: "TELESALE" },
  "XUAN": { code: "XUÂN", color: "#ff2b00", stt: 30, label: "Telesale: Xuân", category: "TELESALE" },
};

export interface ParsedPancakeData {
  service?: string;
  serviceGroup?: string;
  status: "RAW_LEAD" | "QUALIFIED" | "PURCHASE" | "FAIL" | "RE_NURTURE";
  telesale?: string;
  isVietKieu: boolean;
  isForeigner: boolean;
  isSpam: boolean;
  isCustomerComplain: boolean;
  nurturePlan?: string;
  matchedTags: MasterPancakeTag[];
  notes: string[];
}

export function parsePancakeTags(tags: string[] | string): ParsedPancakeData {
  const tagList = Array.isArray(tags)
    ? tags
    : String(tags)
        .split(/[,;\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);

  let service: string | undefined;
  let serviceGroup: string | undefined;
  let status: ParsedPancakeData["status"] = "RAW_LEAD";
  let telesale: string | undefined;
  let isVietKieu = false;
  let isForeigner = false;
  let isSpam = false;
  let isCustomerComplain = false;
  let nurturePlan: string | undefined;

  const matchedTags: MasterPancakeTag[] = [];
  const notes: string[] = [];

  for (const rawTag of tagList) {
    const cleanTag = rawTag.toUpperCase().trim();
    const tagInfo = MASTER_PANCAKE_TAGS[cleanTag] || MASTER_PANCAKE_TAGS[rawTag.trim()];

    if (tagInfo) {
      matchedTags.push(tagInfo);
      notes.push(`[${tagInfo.code}] ${tagInfo.label}`);

      // 1. Phân loại dịch vụ
      if (tagInfo.category === "SERVICE") {
        if (tagInfo.code === "IMP") {
          service = "Cấy Ghép Implant";
          serviceGroup = "IMPLANT";
        } else if (tagInfo.code === "SỨ") {
          service = "Bọc Răng Sứ Thẩm Mỹ";
          serviceGroup = "RĂNG SỨ";
        } else if (tagInfo.code === "CN") {
          service = "Niềng Răng Chỉnh Nha";
          serviceGroup = "CHỈNH NHA";
        } else if (tagInfo.code === "TQ") {
          service = "Nha Khoa Tổng Quát";
          serviceGroup = "TỔNG QUÁT";
        } else if (tagInfo.code === "KHÁC") {
          service = "Khác";
          serviceGroup = "KHÁC";
        }
      }

      // 2. Phân loại Telesale
      if (tagInfo.category === "TELESALE") {
        telesale = tagInfo.code;
      }

      // 3. Phân khúc khách
      if (tagInfo.code === "VK") isVietKieu = true;
      if (tagInfo.code === "NN") isForeigner = true;
      if (tagInfo.code === "KKC") isCustomerComplain = true;

      // 4. Kịch bản nuôi dưỡng (BumKPH, BumDV, BumHEN)
      if (tagInfo.nurturePlan) {
        nurturePlan = tagInfo.nurturePlan;
      }

      // 5. Spam
      if (tagInfo.isSpam) {
        isSpam = true;
      }

      // 6. Quy chuẩn trạng thái CRM theo thứ tự ưu tiên: PURCHASE > QUALIFIED > RE_NURTURE > FAIL > RAW_LEAD
      if (tagInfo.crmStatus === "PURCHASE") {
        status = "PURCHASE";
      } else if (tagInfo.crmStatus === "QUALIFIED" && status !== "PURCHASE") {
        status = "QUALIFIED";
      } else if (tagInfo.crmStatus === "RE_NURTURE" && status !== "PURCHASE" && status !== "QUALIFIED") {
        status = "RE_NURTURE";
      } else if (tagInfo.crmStatus === "FAIL" && status !== "PURCHASE" && status !== "QUALIFIED") {
        status = "FAIL";
      }
    } else {
      notes.push(`Thẻ tùy biến: ${rawTag}`);
    }
  }

  return {
    service,
    serviceGroup,
    status,
    telesale,
    isVietKieu,
    isForeigner,
    isSpam,
    isCustomerComplain,
    nurturePlan,
    matchedTags,
    notes,
  };
}

export const PANCAKE_MASTER_TAGS = Object.values(MASTER_PANCAKE_TAGS);

export function parseBranchFromText(text: string): string {
  const t = (text || "").toLowerCase();

  // TP.HCM
  if (t.includes("gò vấp") || t.includes("quang trung gv") || t.includes("quang trung, gò vấp")) return "GÒ VẤP (TP.HCM)";
  if (t.includes("quận 3") || t.includes("q3") || t.includes("nam kỳ khởi nghĩa") || t.includes("nkkn")) return "QUẬN 3 (TP.HCM)";
  if (t.includes("quận 1") || t.includes("q1") || t.includes("cống quỳnh")) return "QUẬN 1 (TP.HCM)";
  if (t.includes("tân bình") || t.includes("cộng hòa")) return "TÂN BÌNH (TP.HCM)";
  if (t.includes("bình thạnh") || t.includes("nơ trang long")) return "BÌNH THẠNH (TP.HCM)";
  if (t.includes("quận 7") || t.includes("q7") || t.includes("huỳnh tấn phát")) return "QUẬN 7 (TP.HCM)";
  if (t.includes("bình tân") || t.includes("tên lửa")) return "BÌNH TÂN (TP.HCM)";
  if (t.includes("hóc môn") || t.includes("hoc mon")) return "HÓC MÔN (TP.HCM)";
  if (t.includes("tân phú") || t.includes("lũy bán bích") || t.includes("tan phu")) return "TÂN PHÚ (TP.HCM)";
  
  // Bình Dương
  if (t.includes("dĩ an") || t.includes("di an")) return "DĨ AN (BÌNH DƯƠNG)";
  if (t.includes("thủ dầu một") || t.includes("thu dau mot") || t.includes("thuận an") || t.includes("thuan an") || t.includes("bình dương") || t.includes("binh duong")) return "BÌNH DƯƠNG";

  // Đồng Nai
  if (t.includes("biên hòa") || t.includes("bien hoa") || t.includes("đồng nai") || t.includes("dong nai")) return "BIÊN HÒA (ĐỒNG NAI)";
  if (t.includes("gia kiệm") || t.includes("gia kiem") || t.includes("thống nhất") || t.includes("long khánh")) return "GIA KIỆM (ĐỒNG NAI)";

  // Miền Tây
  if (t.includes("cần thơ") || t.includes("can tho") || t.includes("ninh kiều") || t.includes("cái răng")) return "CẦN THƠ";
  if (t.includes("cà mau") || t.includes("ca mau")) return "CÀ MAU";
  if (t.includes("bạc liêu") || t.includes("bac lieu")) return "BẠC LIÊU";
  if (t.includes("sóc trăng") || t.includes("soc trang")) return "SÓC TRĂNG";
  if (t.includes("đồng tháp") || t.includes("dong thap") || t.includes("cao lãnh") || t.includes("sa đéc")) return "ĐỒNG THÁP";
  if (t.includes("kiên giang") || t.includes("rạch giá") || t.includes("phú quốc")) return "KIÊN GIANG";

  // Đông Nam Bộ & Tây Nguyên & Miền Trung
  if (t.includes("vũng tàu") || t.includes("bà rịa") || t.includes("xuyên mộc") || t.includes("phước tỉnh") || t.includes("brvt")) return "BÀ RỊA - VŨNG TÀU";
  if (t.includes("tây ninh") || t.includes("tay ninh")) return "TÂY NINH";
  if (t.includes("bình phước") || t.includes("đồng xoài") || t.includes("binh phuoc")) return "BÌNH PHƯỚC";
  if (t.includes("đà lạt") || t.includes("da lat") || t.includes("lâm đồng") || t.includes("bảo lộc")) return "ĐÀ LẠT (LÂM ĐỒNG)";
  if (t.includes("quy nhơn") || t.includes("quy nhon") || t.includes("bình định")) return "QUY NHƠN";
  if (t.includes("đà nẵng") || t.includes("da nang")) return "ĐÀ NẴNG";
  if (t.includes("hòa bình") || t.includes("hoa binh")) return "HÒA BÌNH";

  return "Chưa chọn chi nhánh (Đang tư vấn)";
}

export function parseServiceFromText(text: string): string {
  const t = (text || "").toLowerCase();
  if (t.includes("implant") || t.includes("trồng răng") || t.includes("cấy ghép")) return "Cấy Ghép Implant";
  if (t.includes("sứ") || t.includes("veneer") || t.includes("bọc răng")) return "Bọc Răng Sứ Thẩm Mỹ";
  if (t.includes("niềng") || t.includes("chỉnh nha") || t.includes("mắc cài") || t.includes("invisalign")) return "Niềng Răng Chỉnh Nha";
  if (t.includes("nhổ") || t.includes("trám") || t.includes("cạo vôi") || t.includes("tẩy trắng") || t.includes("chữa tủy") || t.includes("đau răng")) return "Nha Khoa Tổng Quát";
  return "CHƯA XÁC ĐỊNH";
}

export function parseTagsFromText(text: string): { tagName: string; color: string }[] {
  const tags: { tagName: string; color: string }[] = [];
  const t = (text || "").toLowerCase();

  // SĐT detection
  if (/(0[3|5|7|8|9])+([0-9]{8})\b/.test(text)) {
    tags.push({ tagName: "SDT", color: MASTER_PANCAKE_TAGS["SDT"].color });
  }

  // Dịch vụ
  if (t.includes("implant") || t.includes("trồng răng")) {
    tags.push({ tagName: "IMP", color: MASTER_PANCAKE_TAGS["IMP"].color });
  }
  if (t.includes("sứ") || t.includes("veneer")) {
    tags.push({ tagName: "SỨ", color: MASTER_PANCAKE_TAGS["SỨ"].color });
  }
  if (t.includes("niềng") || t.includes("chỉnh nha")) {
    tags.push({ tagName: "CN", color: MASTER_PANCAKE_TAGS["CN"].color });
  }

  return tags;
}

export function getAssignedStaff(tags: string[] = []): string {
  if (!Array.isArray(tags)) return "Chưa phân bổ";
  const TELESALES = ["THẢO", "NHUNG", "TRANG", "Trân Miln", "Liễu", "Loan", "SINH", "HẠ", "XUÂN", "QUIN", "TRÚC", "HẬU"];
  for (const t of tags) {
    for (const staff of TELESALES) {
      if (t.toUpperCase().includes(staff.toUpperCase())) {
        return staff;
      }
    }
  }
  return "Chưa phân bổ";
}


