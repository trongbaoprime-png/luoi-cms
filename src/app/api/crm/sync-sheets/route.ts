import { NextResponse } from "next/server";
import { syncAllTdsSheets } from "@/lib/google-sheets";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let months: number[] | undefined;

    if (body.months && Array.isArray(body.months)) {
      months = body.months.map(Number);
    } else if (body.month) {
      months = [Number(body.month)];
    } else {
      months = [6, 7, 8];
    }

    const year = body.year ? Number(body.year) : undefined;
    const result = await syncAllTdsSheets(months, year);

    return NextResponse.json({
      success: true,
      message: `Đã hoàn tất đồng bộ ${result.totalSynced} dòng dữ liệu cho các tháng (${result.sheetName})!`,
      data: result,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Sync sheets error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
