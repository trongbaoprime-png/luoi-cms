import { db } from "./db";

// Fallback Branch List
export const DEFAULT_BRANCHES = [
  "CÀ MAU",
  "BIÊN HÒA",
  "THỦ ĐỨC",
  "GÒ VẤP",
  "TÂY NINH",
  "ĐÀ LẠT",
  "QUẬN 7",
  "TÂN BÌNH",
  "CẦN THƠ",
  "AN GIANG",
];

// Configurable Service List
export const DEFAULT_SERVICES = [
  { main: "RĂNG SỨ", subs: ["Răng sứ Zirconia", "Răng sứ Cercon", "Veneer Sứ"] },
  { main: "IMPLANT", subs: ["Trồng răng Implant đơn lẻ", "Implant All-on-4", "Implant All-on-6"] },
  { main: "NIỀNG RĂNG", subs: ["Niềng răng Mắc cài kim loại", "Niềng răng Mắc cài sứ", "Niềng răng Trong suốt Invisalign"] },
  { main: "TẨY TRẮNG", subs: ["Tẩy trắng răng tại phòng khám", "Máng tẩy trắng tại nhà"] },
  { main: "CẠO VÔI", subs: ["Cạo vôi đánh bóng 2 hàm"] },
];

export interface ConversationInsightResult {
  detectedBranch: string | null;
  branchStatus: "MENTIONED" | "CONFIRMED" | null;
  detectedService: string | null;
  subService: string | null;
  budgetMentioned: number | null;
  customerIntent: "BÁO_GIÁ" | "ĐẶT_LỊCH" | "KHUYẾN_MÃI" | "KHIẾU_NẠI" | "HỎI_ĐỊA_CHỈ";
  summary: string;
}

export class AIAgentService {
  /**
   * Đọc danh sách Chi nhánh & Dịch vụ thực tế từ bảng cRMLead trong miniCRM DB
   */
  static async getRealTaxonomy() {
    try {
      const branches = await db.cRMLead.groupBy({
        by: ["branch"],
        _count: { _all: true },
        orderBy: { _count: { branch: "desc" } },
      });
      const services = await db.cRMLead.groupBy({
        by: ["service"],
        _count: { _all: true },
        orderBy: { _count: { service: "desc" } },
      });

      const realBranches = branches.map((b) => b.branch).filter((b): b is string => Boolean(b));
      const realServices = services.map((s) => s.service).filter((s): s is string => Boolean(s));

      return {
        branches: realBranches.length > 0 ? realBranches : DEFAULT_BRANCHES,
        services: realServices.length > 0 ? realServices : DEFAULT_SERVICES.map((s) => s.main),
      };
    } catch {
      return { branches: DEFAULT_BRANCHES, services: DEFAULT_SERVICES.map((s) => s.main) };
    }
  }
  /**
   * Phân tích lịch sử chat của KHÁCH HÀNG (Loại bỏ hoàn toàn tin nhắn của Nhân viên)
   */
  static async analyzeCustomerIntent(
    customerMessages: string[],
    customBranches?: string[]
  ): Promise<ConversationInsightResult> {
    let activeBranches: string[] = customBranches || [];
    if (activeBranches.length === 0) {
      const taxonomy = await this.getRealTaxonomy();
      activeBranches = taxonomy.branches;
    }
    if (!customerMessages || customerMessages.length === 0) {
      return {
        detectedBranch: null,
        branchStatus: null,
        detectedService: null,
        subService: null,
        budgetMentioned: null,
        customerIntent: "BÁO_GIÁ",
        summary: "Chưa có nội dung chat từ khách",
      };
    }

    const conversationText = customerMessages.map((m, i) => `Khách: "${m}"`).join("\n");

    const prompt = `
Bạn là Trợ Lý AI Chuyên Phân Tích Ý Định Khách Hàng Chuỗi Nha Khoa.
Dưới đây là các tin nhắn DO CHÍNH KHÁCH HÀNG GỬI (Đã loại bỏ toàn bộ tin nhắn nhân viên):

--- NỘI DUNG CHAT CỦA KHÁCH ---
${conversationText}
-------------------------------

DANH SÁCH CHI NHÁNH ĐƯỢC CHẤP NHẬN: ${activeBranches.join(", ")}

Nhiệm vụ của bạn:
1. Xác định KHÁCH HÀNG MUỐN GHÉ CHI NHÁNH NÀO? Khách nhắn tên chi nhánh hoặc tỉnh/thành phố (Ví dụ: Cà Mau, Biên Hòa, Thủ Đức...). Nếu thuộc danh sách chi nhánh trên, trả về TÊN CHI NHÁNH IN HOA. Nếu không nhắc tới, trả về null.
2. Dịch vụ chính khách quan tâm (RĂNG SỨ, IMPLANT, NIỀNG RĂNG, TẨY TRẮNG, CẠO VÔI...).
3. Dịch vụ chi tiết/dòng sản phẩm nếu khách đề cập (Zirconia, All-on-4, Invisalign...).
4. Ý định chính của khách: BÁO_GIÁ, ĐẶT_LỊCH, KHUYẾN_MÃI, HỎI_ĐỊA_CHỈ, KHIẾU_NẠI.
5. Trả về KẾT QUẢ DUY NHẤT BẰNG ĐỊNH DẠNG JSON như sau:

{
  "detectedBranch": "CÀ MAU",
  "branchStatus": "CONFIRMED",
  "detectedService": "RĂNG SỨ",
  "subService": "Răng sứ Zirconia",
  "budgetMentioned": 20000000,
  "customerIntent": "ĐẶT_LỊCH",
  "summary": "Khách muốn ghé Cà Mau làm bộ răng sứ 20 triệu vào tuần sau"
}
`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback Keyword Matching if Gemini Key is not set yet
        return this.fallbackKeywordMatching(customerMessages, activeBranches);
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ConversationInsightResult;
      }
    } catch (err) {
      console.error("Lỗi AI Agent bóc tách hội thoại:", err);
    }

    return this.fallbackKeywordMatching(customerMessages, activeBranches);
  }

  /**
   * Bộ lọc khớp từ khóa dự phòng khi chưa cấu hình Gemini Key
   */
  private static fallbackKeywordMatching(
    messages: string[],
    branches: string[]
  ): ConversationInsightResult {
    const fullText = messages.join(" ").toUpperCase();
    let detectedBranch: string | null = null;
    let detectedService: string | null = null;

    for (const b of branches) {
      if (fullText.includes(b)) {
        detectedBranch = b;
        break;
      }
    }

    if (fullText.includes("SỨ") || fullText.includes("BỌC RĂNG")) detectedService = "RĂNG SỨ";
    else if (fullText.includes("IMPLANT") || fullText.includes("TRỒNG RĂNG")) detectedService = "IMPLANT";
    else if (fullText.includes("NIỀNG") || fullText.includes("CHỈNH NHA")) detectedService = "NIỀNG RĂNG";
    else if (fullText.includes("TẨY TRẮNG")) detectedService = "TẨY TRẮNG";

    return {
      detectedBranch,
      branchStatus: detectedBranch ? "MENTIONED" : null,
      detectedService,
      subService: null,
      budgetMentioned: null,
      customerIntent: fullText.includes("HẸN") || fullText.includes("LỊCH") ? "ĐẶT_LỊCH" : "BÁO_GIÁ",
      summary: detectedBranch ? `Khách có từ khóa quan tâm chi nhánh ${detectedBranch}` : "Khách nhắn tin hỏi dịch vụ",
    };
  }
}
