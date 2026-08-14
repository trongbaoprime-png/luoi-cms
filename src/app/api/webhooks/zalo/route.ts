import { NextRequest, NextResponse } from "next/server";
import { crmDb } from "@/lib/db";
import { processCustomerMessageWithAI } from "@/lib/ai-auto-responder";

/**
 * Zalo Official Account (OA) Webhook & AI Auto-Responder Handler
 * Supports:
 * 1. Verification of webhook challenge from Zalo Developer Platform
 * 2. Receiving user messages, analyzing with AI Auto-Responder
 * 3. Ingesting leads/messages directly into Unified CRM with automatic phone & service extraction
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("challenge") || searchParams.get("hub.challenge");
  
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({ status: "Zalo OA Webhook Active", timestamp: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventName = body.event_name || body.event;
    
    // Process user sending message to Zalo OA
    if (eventName === "user_send_text" || eventName === "user_send_image" || eventName === "user_received_message") {
      const senderId = body.sender?.id || body.user_id_by_app;
      const customerName = body.sender?.name || "Khách Zalo";
      const messageText = body.message?.text || "[Hình ảnh/Tệp đính kèm]";
      const timestamp = body.timestamp ? new Date(Number(body.timestamp)) : new Date();

      // 1. Process with AI Auto-Responder
      const aiResult = await processCustomerMessageWithAI(messageText, customerName);

      // 2. Log into CRM database if crmDb is available
      if (crmDb && senderId) {
        try {
          const leadPhone = aiResult.extractedPhone || `zalo_${senderId}`;
          await (crmDb as any).cRMLead.upsert({
            where: { phone: leadPhone },
            update: {
              fullName: customerName,
              service: aiResult.extractedService || undefined,
              branch: aiResult.extractedBranch || undefined,
              note: `[Zalo OA ${timestamp.toLocaleTimeString("vi-VN")}]: ${messageText} \n[AI Intent: ${aiResult.intent}] -> Reply: ${aiResult.replyText}`,
              updatedAt: new Date(),
            },
            create: {
              fullName: customerName,
              phone: leadPhone,
              source: "Zalo OA",
              sourceGroup: "ZALO",
              service: aiResult.extractedService || "Tư vấn dịch vụ",
              branch: aiResult.extractedBranch || "Hồ Chí Minh",
              status: "NEW",
              note: `[Zalo Message]: ${messageText} \n[AI Intent]: ${aiResult.intent}`,
              createdAt: timestamp,
            },
          });
        } catch (dbErr) {
          console.warn("[Zalo OA Webhook] CRM Lead upsert notice:", dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        event: eventName,
        processed: true,
        aiResponse: aiResult,
      });
    }

    // Follow / Unfollow events
    if (eventName === "follow" || eventName === "unfollow") {
      return NextResponse.json({ success: true, event: eventName });
    }

    return NextResponse.json({ success: true, message: "Event received" });
  } catch (error: any) {
    console.error("[Zalo OA Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to process Zalo webhook" }, { status: 500 });
  }
}
