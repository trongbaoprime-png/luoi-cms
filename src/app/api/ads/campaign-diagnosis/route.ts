import { NextResponse } from "next/server";
import { metaDb } from "@/lib/meta-db";
import { getMetaRealtimeData } from "@/lib/meta-realtime-service";
import { diagnoseAllCampaigns, CampaignStatsInput } from "@/lib/campaign-diagnosis";
import { detectService, detectBranch } from "@/lib/meta-detection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since") || searchParams.get("from") || "";
    const until = searchParams.get("until") || searchParams.get("to") || "";
    const serviceFilter = searchParams.get("service") || "";
    const branchFilter = searchParams.get("branch") || "";
    const accountFilter = searchParams.get("account") || "";
    const fresh = searchParams.get("fresh") === "1";

    let rawCampaigns: any[] = [];

    // 1. Try reading from metaDb first for ultra-fast response (<50ms)
    try {
      const dbAggregated = await metaDb.metaAdDailyStat.groupBy({
        by: ["accountId", "accountName", "campaignId", "campaignName"],
        where: {
          ...(since && until ? { date: { gte: since, lte: until } } : {}),
          ...(accountFilter ? { accountId: accountFilter } : {}),
        },
        _sum: {
          spend: true,
          impressions: true,
          reach: true,
          clicks: true,
          messagesNew: true,
          messagingTotal: true,
          leads: true,
        },
      });

      if (dbAggregated && dbAggregated.length > 0) {
        rawCampaigns = dbAggregated.map((item) => {
          const spend = item._sum.spend || 0;
          const impressions = item._sum.impressions || 0;
          const reach = item._sum.reach || 0;
          const clicks = item._sum.clicks || 0;
          const messagesNew = item._sum.messagesNew || 0;
          const leads = item._sum.leads || 0;
          const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
          const cpc = clicks > 0 ? spend / clicks : 0;
          const frequency = reach > 0 ? impressions / reach : 1;

          const row = {
            campaign_id: item.campaignId,
            campaign_name: item.campaignName || "Campaign",
            service: "",
            branch: "",
          };

          return {
            campaignId: item.campaignId,
            campaignName: item.campaignName || "Campaign",
            service: detectService(row),
            branch: detectBranch(row),
            spend,
            reach,
            impressions,
            frequency: Number(frequency.toFixed(2)),
            cpm: Math.round(cpm),
            ctr: Number(ctr.toFixed(2)),
            cpc: Math.round(cpc),
            clicks,
            messagesNew,
            leads,
          };
        });
      }
    } catch {}

    // 2. Fallback to realtime cache/API if DB has 0 records
    if (rawCampaigns.length === 0) {
      const rtData = await getMetaRealtimeData("all", since, until, fresh);
      if (rtData.campaigns && rtData.campaigns.length > 0) {
        rawCampaigns = rtData.campaigns.map((c: any) => ({
          campaignId: c.campaign_id || "",
          campaignName: c.campaign_name || "Campaign",
          service: c.service || detectService(c),
          branch: c.branch || detectBranch(c),
          spend: c.spend || 0,
          reach: c.reach || 0,
          impressions: c.impressions || 0,
          frequency: c.frequency || 1,
          cpm: c.cpm || 0,
          ctr: c.ctr || 0,
          cpc: c.cpc || 0,
          clicks: c.clicks || 0,
          messagesNew: c.messagesNew || 0,
          leads: c.leads || 0,
        }));
      }
    }

    // Apply Service & Branch filters if requested
    let filtered = rawCampaigns;
    if (serviceFilter && serviceFilter !== "ALL") {
      filtered = filtered.filter((c) =>
        c.service.toLowerCase().includes(serviceFilter.toLowerCase())
      );
    }
    if (branchFilter && branchFilter !== "ALL") {
      filtered = filtered.filter((c) =>
        c.branch.toLowerCase().includes(branchFilter.toLowerCase())
      );
    }

    // Run Diagnosis Engine
    const diagnosis = diagnoseAllCampaigns(filtered);

    return NextResponse.json({
      success: true,
      timeRange: { since, until },
      filters: { service: serviceFilter, branch: branchFilter, account: accountFilter },
      data: diagnosis,
    });
  } catch (err: any) {
    console.error("Diagnosis Route Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi chẩn đoán chiến dịch" },
      { status: 500 }
    );
  }
}
