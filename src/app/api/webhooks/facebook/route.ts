import { NextRequest, NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";
import { parseTagsFromText, parseBranchFromText, parseServiceFromText } from "@/lib/pancake-tag-parser";

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || process.env.FB_VERIFY_TOKEN || "tamducsmile_meta_webhook_secret_2026";

/**
 * GET /api/webhooks/facebook
 * Meta Webhook Verification Handshake
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Meta Webhook] Xác thực Webhook thành công!");
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[Meta Webhook] Xác thực thất bại, token không khớp:", token);
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST /api/webhooks/facebook
 * Tiếp nhận tin nhắn real-time từ 52 Fanpages
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object !== "page" && body.object !== "instagram") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const entries = body.entry || [];

    for (const entry of entries) {
      const pageId = entry.id;
      const messagingEvents = entry.messaging || [];

      for (const event of messagingEvents) {
        const senderId = event.sender?.id;
        const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();

        // Chỉ xử lý tin nhắn từ khách (sender != pageId)
        if (event.message && senderId && senderId !== pageId) {
          const messageText = event.message.text || "";
          const messageId = event.message.mid || `fb_${Date.now()}_${Math.random().toString(36).substring(7)}`;

          // Bóc tách SĐT, Chi nhánh, Dịch vụ tự động
          const detectedBranch = parseBranchFromText(messageText);
          const detectedService = parseServiceFromText(messageText);
          const detectedTags = parseTagsFromText(messageText);

          // Tìm hội thoại hiện tại theo pageId và psid
          let conversation = await omniDb.omniConversation.findFirst({
            where: {
              pageId: pageId,
              psid: senderId,
            },
          });

          if (conversation) {
            let existingTags: string[] = [];
            try {
              if (conversation.tags) existingTags = JSON.parse(conversation.tags);
            } catch {}

            const mergedTags = Array.from(new Set([...existingTags, ...detectedTags.map((t) => t.tagName)]));

            conversation = await omniDb.omniConversation.update({
              where: { id: conversation.id },
              data: {
                lastMessageAt: timestamp,
                detectedBranch: detectedBranch !== "CHƯA XÁC ĐỊNH" ? detectedBranch : conversation.detectedBranch,
                detectedService: detectedService !== "CHƯA XÁC ĐỊNH" ? detectedService : conversation.detectedService,
                tags: JSON.stringify(mergedTags),
              },
            });
          } else {
            conversation = await omniDb.omniConversation.create({
              data: {
                pageId: pageId,
                psid: senderId,
                customerName: `Khách FB (${senderId.substring(0, 6)}...)`,
                lastMessageAt: timestamp,
                detectedBranch: detectedBranch,
                detectedService: detectedService,
                tags: JSON.stringify(detectedTags.map((t) => t.tagName)),
              },
            });
          }

          // Lưu Tin nhắn vào OmniMessage
          await omniDb.omniMessage.create({
            data: {
              conversationId: conversation.id,
              senderType: "CUSTOMER",
              senderId: senderId,
              text: messageText,
              mid: messageId,
              createdAt: timestamp,
            },
          });

          console.log(`[Meta Webhook] Đã lưu tin nhắn từ ${senderId} trên Page ${pageId}: "${messageText.substring(0, 40)}"`);
        }
      }
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error: any) {
    console.error("[Meta Webhook Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
