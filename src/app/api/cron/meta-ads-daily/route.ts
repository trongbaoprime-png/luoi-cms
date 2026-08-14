import { NextResponse } from "next/server";
import { syncMetaAds365Days, getLastMetaSyncInfo } from "@/lib/meta-sync-engine";

/**
 * Daily Automated Cron Endpoint for Meta Ads Data Sync (07:00 AM Daily)
 * Can be triggered by Vercel Cron, system crontab, background daemon worker, or manual API call.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const scope = searchParams.get("scope") || "info"; // 'info' or 'sync'

    const expectedKey = process.env.CRON_SECRET || "luoidonnha_cron_sync_2026";
    if (key && key !== expectedKey) {
      return NextResponse.json({ success: false, error: "Unauthorized cron secret key" }, { status: 401 });
    }

    // If request only asks for last sync info status
    if (scope === "info") {
      const lastInfo = await getLastMetaSyncInfo();
      return NextResponse.json({
        success: true,
        cronSchedule: "07:00 AM (Asia/Ho_Chi_Minh) Hằng Ngày",
        lastSync: lastInfo,
      });
    }

    // Run full 365-day sync
    console.log("[MetaDailyCron] Executing scheduled 07:00 AM Meta Ads 365-day sync...");
    const syncResult = await syncMetaAds365Days({ days: 365 });

    return NextResponse.json({
      success: syncResult.ok !== false,
      executedAt: new Date().toISOString(),
      cronSchedule: "07:00 AM (Asia/Ho_Chi_Minh) Hằng Ngày",
      data: syncResult,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Daily cron sync failed";
    console.error("[MetaDailyCron] Error executing daily cron:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
