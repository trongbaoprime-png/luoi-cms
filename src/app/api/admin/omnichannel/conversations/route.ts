import { NextRequest, NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";

/**
 * GET /api/admin/omnichannel/conversations
 * Lấy danh sách hội thoại đa kênh với Bộ Lọc Chi Tiết Toàn Diện
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("pageId");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const branch = searchParams.get("branch");
    const telesale = searchParams.get("telesale");
    const phoneFilter = searchParams.get("phoneFilter");
    const dateRange = searchParams.get("dateRange");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: any = {};

    // 1. Lọc theo Page
    if (pageId && pageId !== "ALL") {
      where.pageId = pageId;
    }

    // 2. Lọc theo Chi nhánh
    if (branch && branch !== "ALL") {
      where.detectedBranch = branch;
    }

    // 3. Lọc theo Telesale
    if (telesale && telesale !== "ALL") {
      where.tags = { contains: telesale };
    }

    // 4. Lọc theo Thẻ Tag
    if (tag && tag !== "ALL") {
      where.tags = { contains: tag };
    }

    // 5. Lọc theo Số điện thoại
    if (phoneFilter && phoneFilter !== "ALL") {
      if (phoneFilter === "HAS_PHONE") {
        where.OR = [
          { phone: { not: null } },
          { tags: { contains: "SDT" } },
        ];
      } else if (phoneFilter === "NO_PHONE") {
        where.phone = null;
        where.NOT = { tags: { contains: "SDT" } };
      }
    }

    // 6. Lọc theo Ngày tháng
    if (dateRange && dateRange !== "ALL") {
      const now = new Date();
      let start = new Date();

      if (dateRange === "TODAY") {
        start.setHours(0, 0, 0, 0);
        where.lastMessageAt = { gte: start };
      } else if (dateRange === "YESTERDAY") {
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        where.lastMessageAt = { gte: start, lte: end };
      } else if (dateRange === "7DAYS") {
        start.setDate(start.getDate() - 7);
        where.lastMessageAt = { gte: start };
      } else if (dateRange === "30DAYS") {
        start.setDate(start.getDate() - 30);
        where.lastMessageAt = { gte: start };
      } else if (dateRange === "CUSTOM" && startDate && endDate) {
        where.lastMessageAt = {
          gte: new Date(startDate),
          lte: new Date(`${endDate}T23:59:59.999Z`),
        };
      }
    }

    // 7. Tìm kiếm Full-Text (Tên, SĐT, PSID)
    if (search && search.trim()) {
      where.OR = [
        { customerName: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim() } },
        { psid: { contains: search.trim() } },
      ];
    }

    const [totalInDb, conversations] = await Promise.all([
      omniDb.omniConversation.count({ where }),
      omniDb.omniConversation.findMany({
        where,
        include: {
          fanpage: {
            select: { pageName: true, pageId: true, category: true },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { text: true, createdAt: true },
          },
        },
        orderBy: { lastMessageAt: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    const parsed = conversations.map((c) => {
      let tagsArray: string[] = [];
      try {
        if (c.tags) tagsArray = JSON.parse(c.tags);
      } catch {
        if (c.tags) tagsArray = [c.tags];
      }

      return {
        id: c.id,
        pageId: c.pageId,
        customerId: c.psid,
        customerName: c.customerName || `Khách FB (${c.psid.substring(0, 6)}...)`,
        customerPhone: c.phone,
        platform: c.igsid ? "INSTAGRAM" : "FACEBOOK",
        lastMessageText: c.messages?.[0]?.text || "",
        lastMessageAt: c.lastMessageAt,
        unreadCount: 0,
        detectedBranch: c.detectedBranch || "CHƯA XÁC ĐỊNH",
        detectedService: c.detectedService || "CHƯA XÁC ĐỊNH",
        tags: tagsArray,
        fanpage: c.fanpage,
      };
    });

    return NextResponse.json({
      success: true,
      data: parsed,
      totalInDb,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
