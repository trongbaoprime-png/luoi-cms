import { NextRequest, NextResponse } from "next/server";
import { crmDb } from "@/lib/db";
import { predictLeadLTV } from "@/lib/predictive-ltv";

/**
 * LƯỜI BUSINESS OS — AI Predictive LTV & VIP Scorer API
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    if (leadId && crmDb) {
      const lead = await (crmDb as any).cRMLead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        return NextResponse.json({ error: "Không tìm thấy Lead" }, { status: 404 });
      }

      const prediction = predictLeadLTV({
        id: lead.id,
        service: lead.service,
        branch: lead.branch,
        source: lead.source,
        actualRevenue: lead.actualRevenue,
        revenue: lead.revenue,
      });

      return NextResponse.json({ success: true, prediction });
    }

    // Batch overview for top high value prospects
    let topLeads: any[] = [];
    if (crmDb) {
      topLeads = await (crmDb as any).cRMLead.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
      });
    }

    const scored = topLeads.map((l) =>
      predictLeadLTV({
        id: l.id,
        service: l.service,
        branch: l.branch,
        source: l.source,
        actualRevenue: l.actualRevenue,
        revenue: l.revenue,
      })
    );

    const diamondCount = scored.filter((s) => s.tier === "DIAMOND").length;
    const goldCount = scored.filter((s) => s.tier === "GOLD").length;

    return NextResponse.json({
      success: true,
      summary: {
        totalAnalyzed: scored.length,
        diamondVipCount: diamondCount,
        goldVipCount: goldCount,
        averagePredictedLtv: Math.round(
          scored.reduce((acc, curr) => acc + curr.predictedLtvVnd, 0) / (scored.length || 1)
        ),
      },
      scoredLeads: scored,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to predict LTV" }, { status: 500 });
  }
}
