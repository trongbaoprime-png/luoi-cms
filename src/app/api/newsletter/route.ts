import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { NewsletterSchema } from "@/lib/validation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate limit: 3 requests per 60 seconds
  const rateLimitResult = await checkRateLimit(`newsletter:${ip}`, 3, 60);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Bạn đã đăng ký quá nhiều lần. Vui lòng thử lại sau." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const validatedData = NewsletterSchema.parse(body);

    const subscriber = await prisma.subscriber.upsert({
      where: { email: validatedData.email },
      update: { status: "ACTIVE", name: validatedData.name },
      create: { email: validatedData.email, name: validatedData.name },
    });

    return NextResponse.json({
      success: true,
      message: "Đăng ký nhận mẹo nhà gọn thành công!",
      data: subscriber,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Dữ liệu không hợp lệ";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
