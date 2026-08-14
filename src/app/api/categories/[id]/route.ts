import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription;
    if (body.ogImage !== undefined) updateData.ogImage = body.ogImage;
    if (body.canonicalUrl !== undefined) updateData.canonicalUrl = body.canonicalUrl;
    if (body.schemaJson !== undefined) updateData.schemaJson = body.schemaJson;

    const updated = await db.category.update({
      where: { id },
      data: updateData,
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
