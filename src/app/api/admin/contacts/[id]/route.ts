import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await db.contactMessage.update({
      where: { id },
      data: { status: body.status || "READ" },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xóa tin nhắn" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
