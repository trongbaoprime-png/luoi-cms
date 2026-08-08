import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.deal.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xóa mã giảm giá thành công" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Xóa mã thất bại";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
