import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const CategorySchema = z.object({
  name: z.string().min(2, "Tên danh mục quá ngắn"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { posts: true } } },
    });
    return NextResponse.json(
      { success: true, data: categories },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CategorySchema.parse(body);

    const category = await db.category.create({
      data: validated,
    });

    return NextResponse.json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Dữ liệu không hợp lệ";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
