import { NextResponse } from "next/server";
import { syncAllTdsSheets } from "@/lib/google-sheets";

/**
 * Automated Cron Endpoint for Daily / Realtime Schedule Sync
 * Can be invoked by Cron-job.org, Vercel Cron, or Google Apps Script Triggers.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    // Optional secret key check for security if needed
    const expectedKey = process.env.CRON_SECRET || "luoidonnha_cron_sync_2026";
    if (key && key !== expectedKey) {
      return NextResponse.json({ success: false, error: "Unauthorized cron key" }, { status: 401 });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const months = Array.from(new Set([prevMonth, currentMonth]));

    const result = await syncAllTdsSheets(months, now.getFullYear());

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: `Tự động đồng bộ thành công ${result.totalSynced} dòng dữ liệu cho các tháng (${result.sheetName})!`,
      data: result,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Auto sync failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
