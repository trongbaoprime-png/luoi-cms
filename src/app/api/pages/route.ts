import { NextResponse } from "next/server";
import { cmsDb } from "@/lib/db";
import { z } from "zod";

const PageSchema = z.object({
  title: z.string().min(2, "Tiêu đề quá ngắn"),
  slug: z.string().min(1, "Slug không hợp lệ"),
  content: z.string().optional(),
  blocks: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
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
