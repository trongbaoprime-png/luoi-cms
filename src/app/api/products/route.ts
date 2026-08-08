import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const CreateProductSchema = z.object({
  title: z.string().min(2, "Tiêu đề quá ngắn"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  description: z.string().optional(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
  image: z.string().optional(),
  rating: z.number().min(1).max(5).default(5.0),
  pros: z.string().optional(),
  cons: z.string().optional(),
  affiliateUrl: z.string().url("Link affiliate không hợp lệ"),
  merchant: z.string().default("Shopee"),
  isFeatured: z.boolean().default(false),
});

// GET /api/products - Query & Search Products
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const merchant = searchParams.get("merchant") || "";
  const featured = searchParams.get("featured") === "true";
  const limit = parseInt(searchParams.get("limit") || "20");
  const page = parseInt(searchParams.get("page") || "1");

  try {
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (merchant) whereClause.merchant = merchant;
    if (featured) whereClause.isFeatured = true;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      db.product.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// POST /api/products - Create new product
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimit = await checkRateLimit(`product-create:${ip}`, 10, 60);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Gửi yêu cầu quá nhanh" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const validatedData = CreateProductSchema.parse(body);

    const product = await db.product.create({
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      message: "Tạo sản phẩm affiliate thành công",
      data: product,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Dữ liệu sản phẩm không hợp lệ";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
