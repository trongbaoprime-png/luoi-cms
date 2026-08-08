import { NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";

export async function GET(req: Request) {
  try {
    const totalConversations = await omniDb.omniConversation.count();

    // Group count by detectedBranch
    const branchStats = await omniDb.omniConversation.groupBy({
      by: ["detectedBranch"],
      _count: { _all: true },
      orderBy: { _count: { detectedBranch: "desc" } },
    });

    // Group count by detectedService
    const serviceStats = await omniDb.omniConversation.groupBy({
      by: ["detectedService"],
      _count: { _all: true },
      orderBy: { _count: { detectedService: "desc" } },
    });

    // Group count by customerIntent
    const intentStats = await omniDb.omniConversation.groupBy({
      by: ["customerIntent"],
      _count: { _all: true },
      orderBy: { _count: { customerIntent: "desc" } },
    });

    // Fetch top recent conversations with AI insights
    const recentInsights = await omniDb.omniConversation.findMany({
      take: 20,
      orderBy: { lastMessageAt: "desc" },
      include: {
        fanpage: { select: { pageName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalConversations,
        branchStats: branchStats.map((b: any) => ({
          branch: b.detectedBranch || "CHƯA XÁC ĐỊNH",
          count: b._count._all,
          percentage: totalConversations > 0 ? Math.round((b._count._all / totalConversations) * 100) : 0,
        })),
        serviceStats: serviceStats.map((s: any) => ({
          service: s.detectedService || "CHƯA XÁC ĐỊNH",
          count: s._count._all,
          percentage: totalConversations > 0 ? Math.round((s._count._all / totalConversations) * 100) : 0,
        })),
        intentStats: intentStats.map((i: any) => ({
          intent: i.customerIntent || "KHÁC",
          count: i._count._all,
        })),
        recentInsights,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi tải báo cáo Omnichannel" }, { status: 500 });
  }
}
