import { NextResponse } from "next/server";
import { verifyHmacSignature } from "@/lib/security";

export async function POST(req: Request) {
  const secret = process.env.WEBHOOK_SECRET || "default-secret";
  const signature = req.headers.get("x-webhook-signature") || "";

  const rawBody = await req.text();

  if (!verifyHmacSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Xác thực Chữ ký HMAC thất bại" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);
    console.log("[Webhook Received]:", payload);

    return NextResponse.json({ success: true, received: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Invalid JSON payload";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
