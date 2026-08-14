import { NextRequest, NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";
import { parseBranchFromText, parseServiceFromText } from "@/lib/pancake-tag-parser";

const PANCAKE_API_BASE = "https://pages.fm/api/v1";

function cleanHtmlText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/div><div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/**
 * GET /api/admin/omnichannel/conversations/[id]/messages
 * Lấy lịch sử tin nhắn của 1 hội thoại & Tự động phát hiện Chi Nhánh / Nhu Cầu Bước 1
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const conversation = await omniDb.omniConversation.findUnique({
      where: { id },
      include: {
        fanpage: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Không tìm thấy hội thoại" }, { status: 404 });
    }

    const pancakeToken = process.env.PANCAKE_ACCESS_TOKEN;

    // Nếu chưa có tin nhắn hoặc chỉ có 1 tin snippet -> Tự động kéo full thread từ Pancake
    if (conversation.messages.length <= 1 && pancakeToken && conversation.pancakeCustomerId) {
      try {
        const pancakeConvId = `${conversation.pageId}_${conversation.psid}`;
        const fetchUrl = `${PANCAKE_API_BASE}/pages/${conversation.pageId}/conversations/${pancakeConvId}/messages?customer_id=${conversation.pancakeCustomerId}&access_token=${pancakeToken}`;

        const res = await fetch(fetchUrl, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const pMsgs = data.messages || [];

          if (Array.isArray(pMsgs) && pMsgs.length > 0) {
            await omniDb.omniMessage.deleteMany({
              where: { conversationId: id },
            });

            for (const m of pMsgs) {
              const text = cleanHtmlText(m.message || "");
              if (!text) continue;

              const isPage = m.from?.id === conversation.pageId;
              const senderType = isPage ? "STAFF" : "CUSTOMER";
              const senderName = m.from?.name || (isPage ? "Telesale" : conversation.customerName || "Khách Hàng");

              let msgDate = new Date();
              if (m.inserted_at) {
                const isoStr = m.inserted_at.endsWith("Z") ? m.inserted_at : `${m.inserted_at}Z`;
                msgDate = new Date(isoStr);
              }

              await omniDb.omniMessage.create({
                data: {
                  conversationId: id,
                  senderType,
                  senderId: senderName,
                  text,
                  mid: m.id ? String(m.id) : undefined,
                  createdAt: isNaN(msgDate.getTime()) ? new Date() : msgDate,
                },
              });
            }

            // Lấy lại danh sách tin nhắn mới
            const refreshed = await omniDb.omniMessage.findMany({
              where: { conversationId: id },
              orderBy: { createdAt: "asc" },
            });

            // Tự động phân tích Chi nhánh và Dịch vụ từ toàn bộ tin nhắn
            const allText = refreshed.map((m) => m.text).join(" \n ");
            const detectedBr = parseBranchFromText(allText);
            const detectedSvc = parseServiceFromText(allText);

            const updateData: any = {};
            if (detectedBr && detectedBr !== "Chưa chọn chi nhánh (Đang tư vấn)") {
              updateData.detectedBranch = detectedBr;
            }
            if (detectedSvc && detectedSvc !== "CHƯA XÁC ĐỊNH") {
              updateData.detectedService = detectedSvc;
            }

            if (Object.keys(updateData).length > 0) {
              await omniDb.omniConversation.update({
                where: { id },
                data: updateData,
              });
            }

            return NextResponse.json({
              success: true,
              data: refreshed.map((m) => ({
                id: m.id,
                senderType: m.senderType,
                senderId: m.senderId || "Telesale",
                content: m.text,
                createdAt: m.createdAt,
              })),
              detectedBranch: updateData.detectedBranch || conversation.detectedBranch,
              detectedService: updateData.detectedService || conversation.detectedService,
            });
          }
        }
      } catch (err: any) {
        console.warn("[Auto-fetch Pancake Messages Warning]:", err?.message);
      }
    }

    // Phân tích nhanh từ các tin nhắn hiện có nếu chưa phát hiện chi nhánh
    if (conversation.messages.length > 0) {
      const allText = conversation.messages.map((m) => m.text).join(" \n ");
      const detectedBr = parseBranchFromText(allText);
      const detectedSvc = parseServiceFromText(allText);

      const updateData: any = {};
      if (detectedBr && detectedBr !== "Chưa chọn chi nhánh (Đang tư vấn)" && detectedBr !== conversation.detectedBranch) {
        updateData.detectedBranch = detectedBr;
      }
      if (detectedSvc && detectedSvc !== "CHƯA XÁC ĐỊNH" && detectedSvc !== conversation.detectedService) {
        updateData.detectedService = detectedSvc;
      }

      if (Object.keys(updateData).length > 0) {
        await omniDb.omniConversation.update({
          where: { id },
          data: updateData,
        });
      }
    }

    const formatted = conversation.messages.map((m) => ({
      id: m.id,
      senderType: m.senderType,
      senderId: m.senderId || "Telesale",
      content: m.text,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/omnichannel/conversations/[id]/messages
 * Gửi tin nhắn phản hồi tới khách hàng qua Facebook Messenger API
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content, senderName } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Nội dung tin nhắn không được để trống" }, { status: 400 });
    }

    const conversation = await omniDb.omniConversation.findUnique({
      where: { id },
      include: { fanpage: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Không tìm thấy hội thoại" }, { status: 404 });
    }

    let fbMessageId = `agent_${Date.now()}`;
    if (conversation.fanpage?.accessToken && conversation.psid) {
      try {
        const sendUrl = `https://graph.facebook.com/v20.0/me/messages?access_token=${conversation.fanpage.accessToken}`;
        const fbRes = await fetch(sendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { id: conversation.psid },
            message: { text: content.trim() },
          }),
        });

        const fbData = await fbRes.json();
        if (fbData.message_id) {
          fbMessageId = fbData.message_id;
        } else if (fbData.error) {
          console.warn("[Send FB Message Warning]:", fbData.error.message);
        }
      } catch (err: any) {
        console.warn("[Send FB Message Error]:", err.message);
      }
    }

    const newMsg = await omniDb.omniMessage.create({
      data: {
        conversationId: id,
        senderType: "STAFF",
        senderId: senderName || "Telesale",
        text: content.trim(),
        mid: fbMessageId,
        createdAt: new Date(),
      },
    });

    await omniDb.omniConversation.update({
      where: { id },
      data: {
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newMsg.id,
        senderType: newMsg.senderType,
        senderId: newMsg.senderId,
        content: newMsg.text,
        createdAt: newMsg.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
