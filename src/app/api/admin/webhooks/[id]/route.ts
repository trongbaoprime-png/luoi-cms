import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.webhook.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xóa Webhook thành công" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Xóa Webhook thất bại";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
