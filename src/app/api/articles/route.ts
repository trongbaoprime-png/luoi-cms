import { NextResponse } from "next/server";
import { cmsDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth-guard";

export async function GET() {
  try {
    const posts = await cmsDb.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
      take: 50,
    });
    return NextResponse.json({ success: true, posts });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const perm = await requirePermission("articles:create", req);
  if (!perm.authorized) {
    return perm.errorResponse || NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, slug, summary, content, categoryId, categoryName, coverImage, seoTitle, seoDesc, schemaJson, status } = body;

    let targetCategoryId = categoryId;

    // If categoryId not passed but categoryName is, find or create category
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

    const post = await cmsDb.post.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        summary,
        content,
        coverImage: coverImage || undefined,
        seoTitle: seoTitle || title,
        seoDescription: seoDesc || summary,
        schemaJson: schemaJson || undefined,
        status: status || "PUBLISHED",
        categoryId: targetCategoryId || undefined,
      },
      include: { category: true },
    });

    // Auto Trigger Instant Indexing for Google & Bing IndexNow
    if (post.status === "PUBLISHED") {
      try {
        const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
        fetch(`${origin}/api/admin/indexing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: `/blog/${post.slug}` }),
        }).catch(() => {});
      } catch {}
    }

    return NextResponse.json({ success: true, post });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Save post failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
