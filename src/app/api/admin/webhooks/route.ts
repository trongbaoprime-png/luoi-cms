import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const WebhookSchema = z.object({
  name: z.string().min(2, "Tên webhook quá ngắn"),
  url: z.string().url("URL không hợp lệ"),
  events: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 sự kiện"),
});

export async function GET() {
  try {
    const webhooks = await db.webhook.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: webhooks });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = WebhookSchema.parse(body);

    const webhook = await db.webhook.create({
      data: {
        name: validated.name,
        url: validated.url,
        events: JSON.stringify(validated.events),
        isEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo Webhook thành công",
      data: webhook,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Dữ liệu không hợp lệ";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
