import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/builder/[slug] — Lấy JSON layout đã lưu
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const key = `puck_layout_${slug}`;
  const setting = await db.setting.findUnique({ where: { key } });
  if (!setting?.value) {
    return NextResponse.json({ success: true, data: null });
  }
  try {
    return NextResponse.json({ success: true, data: JSON.parse(setting.value) });
  } catch {
    return NextResponse.json({ success: true, data: null });
  }
}

// POST /api/builder/[slug] — Lưu JSON layout mới
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const key = `puck_layout_${slug}`;
    await db.setting.upsert({
      where: { key },
      update: { value: JSON.stringify(body) },
      create: { key, value: JSON.stringify(body) },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[builder] save error:", err);
    return NextResponse.json({ success: false, error: "Lưu thất bại" }, { status: 500 });
  }
}
