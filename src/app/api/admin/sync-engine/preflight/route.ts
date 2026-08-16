import { NextRequest, NextResponse } from "next/server";
import { runPreflightScan } from "@/lib/sync-engine/sync-queue";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get("module") || "ALL";

    const report = await runPreflightScan(module);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi quét tiền kiểm tra khối lượng",
      },
      { status: 500 }
    );
  }
}
