import { NextResponse } from "next/server";
import { syncSaleSheet } from "@/lib/google-sheets";

export async function POST(req: Request) {
  try {
    const result = await syncSaleSheet();

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Sync sheets error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
