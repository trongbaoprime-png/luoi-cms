import { NextResponse } from "next/server";
import { syncMetaAds365Days } from "@/lib/meta-sync-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "365", 10);

    const result = await syncMetaAds365Days({ days });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: `Lỗi đồng bộ dữ liệu 365 ngày: ${err.message}` },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const days = parseInt(body.days || "365", 10);

    const result = await syncMetaAds365Days({ days });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: `Lỗi đồng bộ dữ liệu 365 ngày: ${err.message}` },
      { status: 500 }
    );
  }
}
