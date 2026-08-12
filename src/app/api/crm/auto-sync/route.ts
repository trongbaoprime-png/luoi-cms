import { NextResponse } from "next/server";
import { syncSaleSheet } from "@/lib/google-sheets";

/**
 * Automated Cron Endpoint for Realtime Schedule & SALE Sheet Sync
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    const expectedKey = process.env.CRON_SECRET || "luoidonnha_cron_sync_2026";
    if (key && key !== expectedKey) {
      return NextResponse.json({ success: false, error: "Unauthorized cron key" }, { status: 401 });
    }

    const result = await syncSaleSheet();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: result.message,
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
