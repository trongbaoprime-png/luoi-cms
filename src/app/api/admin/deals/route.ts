import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

const DealSchema = z.object({
  code: z.string().min(2, "Mã voucher quá ngắn"),
  title: z.string().min(2, "Tiêu đề không hợp lệ"),
  discount: z.string().min(1, "Vui lòng nhập mức giảm"),
  merchant: z.string().default("Shopee"),
  affiliateUrl: z.string().url("Link affiliate không hợp lệ"),
  expiresAt: z.string().optional(),
  isHot: z.boolean().default(false),
});

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return auth.errorResponse || NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deals = await db.deal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: deals });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return auth.errorResponse || NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = DealSchema.parse(body);

    const deal = await db.deal.create({
      data: {
        ...validated,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo voucher thành công",
      data: deal,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Dữ liệu voucher không hợp lệ";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
