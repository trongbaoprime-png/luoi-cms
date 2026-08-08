import { NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";

export async function POST(req: Request) {
  try {
    const { conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ success: false, error: "Thiếu ID hội thoại" }, { status: 400 });
    }

    const conv = await omniDb.omniConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          where: { senderType: "CUSTOMER" },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!conv) {
      return NextResponse.json({ success: false, error: "Không tìm thấy hội thoại" }, { status: 404 });
    }

    const branch = conv.detectedBranch || "gần nhất";
    const service = conv.detectedService || "chăm sóc răng miệng";
    const name = conv.customerName || "chị";

    // AI Copilot Smart Reply Generation Logic
    let suggestedReply = `Dạ em chào ${name}! Thấy ${name} đang quan tâm dịch vụ ${service} bên em. Hiện tại chi nhánh ${branch} đang có suất ưu đãi khám & chụp X-quang miễn phí 100%. Em giữ lịch hẹn cho ${name} chiều mai lúc 14h nha!`;

    if (conv.customerIntent === "BÁO_GIÁ") {
      suggestedReply = `Dạ em chào ${name}! Chi phí dịch vụ ${service} tại chi nhánh ${branch} bên em hiện đang có gói khuyến mãi áp dụng giảm đến 20% tuần này. ${name} cho em xin SĐT để bác sĩ trưởng khoa hỗ trợ báo giá chi tiết và gửi ưu đãi giữ suất cho mình nhé!`;
    } else if (conv.customerIntent === "HỎI_ĐỊA_CHỈ") {
      suggestedReply = `Dạ em chào ${name}! Chi nhánh ${branch} của bên em mở cửa từ 8h00 - 20h00 hàng ngày. ${name} ghé khung giờ nào chiều nay để em nhắn tư vấn viên đón mình ngay nha!`;
    }

    return NextResponse.json({
      success: true,
      data: {
        suggestedReply,
        branch,
        service,
        intent: conv.customerIntent,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi AI Copilot gợi ý" }, { status: 500 });
  }
}
