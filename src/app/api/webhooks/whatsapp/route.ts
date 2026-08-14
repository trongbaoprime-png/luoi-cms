import { NextRequest, NextResponse } from "next/server";
import { crmDb } from "@/lib/db";
import { processCustomerMessageWithAI } from "@/lib/ai-auto-responder";

/**
 * WhatsApp Cloud API Webhook & AI Auto-Responder Handler
 * Supports:
 * 1. Webhook hub verification for Meta WhatsApp Cloud API
 * 2. Inbound user messages processing via AI Auto-Responder
 * 3. Synchronization to Unified CRM Lead database
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "luoi_whatsapp_verify_token_2026";

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ status: "WhatsApp Webhook Active", timestamp: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message) {
        const fromPhone = message.from; // International format e.g. 84912345678
        const customerName = value?.contacts?.[0]?.profile?.name || `Khách WhatsApp ${fromPhone.slice(-4)}`;
        const messageBody = message.text?.body || "[Phương tiện/Hình ảnh]";
        const timestamp = new Date(Number(message.timestamp) * 1000);

        // 1. Process message through AI Auto-Responder
        const aiResult = await processCustomerMessageWithAI(messageBody, customerName);

        // 2. Ingest into CRM database
        if (crmDb && fromPhone) {
          try {
            await (crmDb as any).cRMLead.upsert({
              where: { phone: fromPhone },
              update: {
                fullName: customerName,
                service: aiResult.extractedService || undefined,
                branch: aiResult.extractedBranch || undefined,
                note: `[WhatsApp ${timestamp.toLocaleTimeString("vi-VN")}]: ${messageBody} \n[AI Intent: ${aiResult.intent}] -> Reply: ${aiResult.replyText}`,
                updatedAt: new Date(),
              },
              create: {
                fullName: customerName,
                phone: fromPhone,
                source: "WhatsApp",
                sourceGroup: "WHATSAPP",
                service: aiResult.extractedService || "Tư vấn dịch vụ",
                branch: aiResult.extractedBranch || "Hồ Chí Minh",
                status: "NEW",
                note: `[WhatsApp Message]: ${messageBody} \n[AI Intent]: ${aiResult.intent}`,
                createdAt: timestamp,
              },
            });
          } catch (dbErr) {
            console.warn("[WhatsApp Webhook] CRM Lead upsert notice:", dbErr);
          }
        }

        return NextResponse.json({
          success: true,
          processed: true,
          from: fromPhone,
          aiResponse: aiResult,
        });
      }
    }

    return NextResponse.json({ success: true, message: "WhatsApp event received" });
  } catch (error: any) {
    console.error("[WhatsApp Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to process WhatsApp webhook" }, { status: 500 });
  }
}
