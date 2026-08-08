import { NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";
import { AIAgentService } from "@/lib/ai-agent-service";

// Verification GET Endpoint for Webhook Handshake
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.PANCAKE_VERIFY_TOKEN || "luoidonnha_pancake_secret";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ success: false, message: "Invalid verify token" }, { status: 403 });
}

// Event Handling POST Endpoint
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support both Meta Webhook format & Pancake Webhook format
    const events = body.entry || [body];

    for (const entry of events) {
      const pageId = entry.id || body.page_id;
      const messagingList = entry.messaging || body.messages || [];

      for (const event of messagingList) {
        const psid = event.sender?.id || event.customer_id;
        const text = event.message?.text || event.text;
        const isFromCustomer = !event.is_page_message && event.sender?.id !== pageId;

        if (!psid || !text) continue;

        // 1. Ensure OmniFanpage exists
        if (pageId) {
          await omniDb.omniFanpage.upsert({
            where: { pageId: String(pageId) },
            update: {},
            create: {
              pageId: String(pageId),
              pageName: `Fanpage #${pageId}`,
            },
          });
        }

        // 2. Find or Create OmniConversation
        let conversation = await omniDb.omniConversation.findFirst({
          where: { psid: String(psid) },
        });

        if (!conversation && pageId) {
          conversation = await omniDb.omniConversation.create({
            data: {
              pageId: String(pageId),
              psid: String(psid),
              customerName: event.sender?.name || `Khách #${psid.slice(-4)}`,
              phone: event.phone || null,
            },
          });
        }

        if (!conversation) continue;

        // 3. Save OmniMessage
        const senderType = isFromCustomer ? "CUSTOMER" : "STAFF";
        await omniDb.omniMessage.create({
          data: {
            conversationId: conversation.id,
            senderType,
            text,
            mid: event.message?.mid || null,
          },
        });

        // 4. Trigger AI Agent Analysis ONLY IF Customer Sent a Message
        if (isFromCustomer) {
          const customerMessages = await omniDb.omniMessage.findMany({
            where: { conversationId: conversation.id, senderType: "CUSTOMER" },
            orderBy: { createdAt: "asc" },
            take: 20,
            select: { text: true },
          });

          const messageTexts = customerMessages.map((m: any) => m.text);
          const insight = await AIAgentService.analyzeCustomerIntent(messageTexts);

          // Update Conversation Intelligence
          await omniDb.omniConversation.update({
            where: { id: conversation.id },
            data: {
              detectedBranch: insight.detectedBranch,
              branchStatus: insight.branchStatus,
              detectedService: insight.detectedService,
              subService: insight.subService,
              quotedBudget: insight.budgetMentioned,
              customerIntent: insight.customerIntent,
              aiConfidence: 0.95,
              aiAnalyzedAt: new Date(),
              lastMessageAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });
  } catch (error: any) {
    console.error("Lỗi xử lý Pancake/Meta Webhook:", error?.message);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
