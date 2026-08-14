/**
 * LƯỜI BUSINESS OS — AI Auto-Responder & Copilot Engine
 * 
 * Capabilities:
 * 1. 24/7 Intelligent Customer Care for Zalo OA, WhatsApp & Webchat
 * 2. Automatic Extraction of Phone Number, Full Name, Service Intent & Preferred Branch
 * 3. Fallback resilient routing via OmniRoute Gateway / Gemini / Groq
 */

import { normalizeVnPhone } from "./identity-resolution";

export interface AIResponseResult {
  replyText: string;
  extractedPhone?: string;
  extractedName?: string;
  extractedService?: string;
  extractedBranch?: string;
  intent: "INQUIRY" | "PRICING" | "BOOKING" | "COMPLAINT" | "GENERAL";
  confidenceScore: number;
}

const SERVICE_KEYWORDS: Record<string, string> = {
  "giặt nệm": "Giặt Nệm Khử Khuẩn",
  "vệ sinh nệm": "Giặt Nệm Khử Khuẩn",
  "giặt sofa": "Vệ Sinh Sofa & Ghế",
  "vệ sinh sofa": "Vệ Sinh Sofa & Ghế",
  "giặt thảm": "Giặt Thảm Văn Phòng",
  "dọn nhà": "Tổng Vệ Sinh Nhà Cửa",
  "vệ sinh nhà": "Tổng Vệ Sinh Nhà Cửa",
  "vệ sinh công nghiệp": "Vệ Sinh Công Nghiệp",
  "implant": "Cấy Ghép Implant",
  "trồng răng": "Cấy Ghép Implant",
  "niềng răng": "Niềng Răng Chỉnh Nha",
  "chỉnh nha": "Niềng Răng Chỉnh Nha",
  "răng sứ": "Bọc Răng Sứ Thẩm Mỹ",
  "tẩy trắng": "Tẩy Trắng Răng",
};

const BRANCH_KEYWORDS: Record<string, string> = {
  "thủ đức": "Hồ Chí Minh - Thủ Đức",
  "gò vấp": "Hồ Chí Minh - Gò Vấp",
  "quận 1": "Hồ Chí Minh - Quận 1",
  "quận 7": "Hồ Chí Minh - Quận 7",
  "quận 10": "Hồ Chí Minh - Quận 10",
  "bình thạnh": "Hồ Chí Minh - Bình Thạnh",
  "biên hòa": "Đồng Nai - Biên Hòa",
  "đồng nai": "Đồng Nai",
  "bình dương": "Bình Dương - Thủ Dầu Một",
  "thủ dầu một": "Bình Dương - Thủ Dầu Một",
  "cần thơ": "Cần Thơ - Ninh Kiều",
  "vũng tàu": "Bà Rịa - Vũng Tàu",
  "hà nội": "Hà Nội",
};

export async function processCustomerMessageWithAI(
  message: string,
  customerName?: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<AIResponseResult> {
  const lowerMsg = message.toLowerCase();

  // 1. Regex Extraction for Phone Number (Vietnamese standard formats)
  let extractedPhone: string | undefined;
  const phoneMatch = message.match(/(?:0|\+84)[3|5|7|8|9][0-9]{8}\b/);
  if (phoneMatch) {
    extractedPhone = normalizeVnPhone(phoneMatch[0]);
  }

  // 2. Keyword Detection for Service & Branch
  let extractedService: string | undefined;
  for (const [kw, serviceName] of Object.entries(SERVICE_KEYWORDS)) {
    if (lowerMsg.includes(kw)) {
      extractedService = serviceName;
      break;
    }
  }

  let extractedBranch: string | undefined;
  for (const [kw, branchName] of Object.entries(BRANCH_KEYWORDS)) {
    if (lowerMsg.includes(kw)) {
      extractedBranch = branchName;
      break;
    }
  }

  // 3. Determine Intent
  let intent: AIResponseResult["intent"] = "GENERAL";
  if (lowerMsg.includes("giá") || lowerMsg.includes("nhiêu") || lowerMsg.includes("báo giá") || lowerMsg.includes("chi phí")) {
    intent = "PRICING";
  } else if (lowerMsg.includes("đặt lịch") || lowerMsg.includes("hẹn") || lowerMsg.includes("khảo sát") || lowerMsg.includes("khi nào")) {
    intent = "BOOKING";
  } else if (lowerMsg.includes("khiếu nại") || lowerMsg.includes("chậm") || lowerMsg.includes("không sạch") || lowerMsg.includes("hư")) {
    intent = "COMPLAINT";
  } else if (extractedService || lowerMsg.includes("tư vấn") || lowerMsg.includes("hỏi")) {
    intent = "INQUIRY";
  }

  // 4. Generate AI Reply via OmniRoute Gateway if available
  let replyText = "";
  try {
    const omniEndpoint = process.env.OMNIROUTE_BASE_URL || "http://127.0.0.1:20128/v1";
    const systemPrompt = `Bạn là Trợ lý AI Chăm sóc Khách hàng chuyên nghiệp của hệ thống LƯỜI DỌN NHÀ & NHA KHOA.
Nhiệm vụ:
- Trả lời thân thiện, lịch sự, ngắn gọn và hữu ích (dưới 100 từ).
- Luôn khuyến khích khách để lại số điện thoại hoặc đặt lịch để chuyên viên tư vấn chi tiết và nhận ưu đãi giảm 20-40%.
- Nếu khách đã cung cấp số điện thoại, cảm ơn và xác nhận chuyên viên sẽ liên hệ trong 5 phút.
- Khách hàng: ${customerName || "Quý khách"}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-3),
      { role: "user", content: message },
    ];

    const res = await fetch(`${omniEndpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer omniroute-default-key",
      },
      body: JSON.stringify({
        model: "groq/llama-3.3-70b-versatile",
        messages,
        temperature: 0.6,
        max_tokens: 300,
      }),
      signal: AbortSignal.timeout(4000), // Fast 4s timeout
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && content.trim().length > 0) {
        replyText = content.trim();
      }
    }
  } catch (aiErr) {
    // Graceful fallback to deterministic high-converting script templates
  }

  // 5. Deterministic High-Converting Fallback Templates if AI is offline
  if (!replyText) {
    if (extractedPhone) {
      replyText = `Dạ Lười Dọn Nhà xin cảm ơn ${customerName || "Quý khách"}! Em đã ghi nhận số điện thoại ${extractedPhone}. Chuyên viên tư vấn bên em sẽ gọi lại hỗ trợ chi tiết và áp dụng mã giảm giá tốt nhất cho mình trong ít phút nhé ạ! ❤️`;
    } else if (intent === "PRICING") {
      replyText = `Dạ chào ${customerName || "Quý khách"}! Bảng giá dịch vụ bên em đang có ưu đãi giảm 30% hôm nay. Để em báo giá chính xác theo diện tích/nhu cầu, mình cho em xin số điện thoại Zalo để gửi bảng giá chi tiết kèm hình ảnh tham khảo nhé ạ!`;
    } else if (intent === "BOOKING") {
      replyText = `Dạ bên em có lịch khảo sát và làm việc tất cả các ngày trong tuần. ${customerName || "Quý khách"} vui lòng để lại số điện thoại và địa chỉ để bên em xếp lịch phục vụ mình chu đáo nhất nhé!`;
    } else {
      replyText = `Dạ Lười Dọn Nhà xin chào ${customerName || "Quý khách"}! Em có thể hỗ trợ thông tin dịch vụ hoặc chương trình ưu đãi nào cho mình hôm nay ạ? Mình có thể để lại SĐT để được tư vấn nhanh nhất nhé!`;
    }
  }

  return {
    replyText,
    extractedPhone,
    extractedName: customerName,
    extractedService,
    extractedBranch,
    intent,
    confidenceScore: extractedPhone ? 0.98 : 0.85,
  };
}
