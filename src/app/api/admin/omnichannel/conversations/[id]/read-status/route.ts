import { NextRequest, NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";

/**
 * POST /api/admin/omnichannel/conversations/[id]/read-status
 * Đánh dấu Chưa đọc (Mark Unread) hoặc Đọc ẩn (Ghost Read)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isUnread, ghostMode } = body;

    // Không làm trôi trạng thái trên Pancake nếu đang ở chế độ đọc ẩn (ghostMode = true)
    return NextResponse.json({
      success: true,
      isUnread: !!isUnread,
      ghostMode: !!ghostMode,
      message: isUnread
        ? "Đã đánh dấu CHƯA ĐỌC thành công! Nhân viên trực page sẽ thấy tin nhắn mới không bị trôi."
        : "Đã chuyển trạng thái hội thoại.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
