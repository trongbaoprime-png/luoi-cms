import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await db.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Cập nhật danh mục thất bại";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xóa danh mục thành công" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Xóa danh mục thất bại";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
