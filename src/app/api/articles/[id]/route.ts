import { NextResponse } from "next/server";
import { cmsDb } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const post = await cmsDb.post.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: "Bài viết không tồn tại" }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { title, slug, summary, content, categoryId, categoryName, seoTitle, seoDesc, status, coverImage, schemaJson, readTimeMinutes } = body;

    let targetCategoryId = categoryId;
    if (!targetCategoryId && categoryName) {
      const catSlug = categoryName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      const existingCat = await cmsDb.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: { name: categoryName, slug: catSlug },
      });
      targetCategoryId = existingCat.id;
    }

    const updatedPost = await cmsDb.post.update({
      where: { id },
      data: {
        title,
        slug,
        summary,
        content,
        seoTitle,
        seoDescription: seoDesc,
        status,
        categoryId: targetCategoryId || undefined,
        coverImage: coverImage || undefined,
        schemaJson: schemaJson || undefined,
        readTimeMinutes: readTimeMinutes ? Number(readTimeMinutes) : undefined,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Cập nhật bài viết thất bại";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await cmsDb.post.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xóa bài viết thành công" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Xóa bài viết thất bại";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}
