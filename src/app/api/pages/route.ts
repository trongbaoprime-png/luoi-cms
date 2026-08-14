import { NextResponse } from "next/server";
import { cmsDb } from "@/lib/db";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-guard";

const PageSchema = z.object({
  title: z.string().min(2, "Tiêu đề quá ngắn"),
  slug: z.string().min(1, "Slug không hợp lệ"),
  content: z.string().optional().nullable(),
  blocks: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  ogTitle: z.string().optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
  noIndex: z.boolean().default(false),
  schemaJson: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
  useDefaultHeader: z.boolean().default(true),
  useDefaultFooter: z.boolean().default(true),
});

export async function GET() {
  try {
    const pages = await cmsDb.page.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: pages });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const perm = await requirePermission("pages:manage", req);
  if (!perm.authorized) {
    return perm.errorResponse || NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = PageSchema.parse(body);

    const existingPage = await cmsDb.page.findUnique({
      where: { slug: validated.slug },
    });

    if (existingPage) {
      return NextResponse.json({ error: "Slug đường dẫn này đã tồn tại" }, { status: 400 });
    }

    const page = await cmsDb.page.create({
      data: validated,
    });

    return NextResponse.json({
      success: true,
      message: "Tạo trang thành công",
      data: page,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Dữ liệu không hợp lệ";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
