import { NextRequest, NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";

/**
 * GET /api/auth/facebook/pages
 * Danh sách các Fanpages & Instagram đã kết nối chính thống
 */
export async function GET(req: NextRequest) {
  try {
    const pages = await omniDb.omniFanpage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { conversations: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: pages.map((p) => ({
        id: p.id,
        pageId: p.pageId,
        pageName: p.pageName,
        category: p.category,
        isActive: p.isActive,
        totalConversations: p._count.conversations,
        hasAccessToken: !!p.accessToken,
        tokenType: "Never-Expiring Page Access Token",
        connectedAt: p.createdAt,
      })),
      totalConnected: pages.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi nạp danh sách kênh" }, { status: 500 });
  }
}

/**
 * POST /api/auth/facebook/pages
 * Bật/Tắt trạng thái hoạt động của kênh
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId, isActive } = body;

    if (!pageId) {
      return NextResponse.json({ error: "Thiếu pageId" }, { status: 400 });
    }

    const updated = await omniDb.omniFanpage.update({
      where: { pageId: String(pageId) },
      data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
