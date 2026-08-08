import { NextResponse } from "next/server";
import { cmsDb } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const page = await cmsDb.page.findUnique({
      where: { id },
    });
    if (!page) {
      return NextResponse.json({ error: "Không tìm thấy trang" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: page });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updateData: any = {};

    if (body.title) updateData.title = body.title;
    if (body.slug) updateData.slug = body.slug;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.blocks !== undefined) updateData.blocks = body.blocks;
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    if (body.useDefaultHeader !== undefined) updateData.useDefaultHeader = body.useDefaultHeader;
    if (body.useDefaultFooter !== undefined) updateData.useDefaultFooter = body.useDefaultFooter;

    const updatedPage = await cmsDb.page.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedPage });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Cập nhật trang thất bại";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await cmsDb.page.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xóa trang thành công" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Xóa trang thất bại";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
