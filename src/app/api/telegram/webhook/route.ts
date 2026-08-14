import { NextResponse } from "next/server";
import { queryOmniRoute } from "@/lib/omniroute";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
  };
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN || "";

/**
 * Send text message back to Telegram Chat via Telegram Bot API
 */
async function sendTelegramMessage(chatId: number, text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("[TELEGRAM WEBHOOK WARN] TELEGRAM_BOT_TOKEN is not configured in .env");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[TELEGRAM SEND ERROR]", err);
    return false;
  }
}

/**
 * Telegram Webhook Handler POST /api/telegram/webhook
 */
export async function POST(req: Request) {
  // Validate secret token if configured
  if (TELEGRAM_SECRET_TOKEN) {
    const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token");
    if (incomingSecret !== TELEGRAM_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized update token" }, { status: 401 });
    }
  }

  try {
    const update: TelegramUpdate = await req.json();

    if (!update.message || !update.message.text) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const chatId = update.message.chat.id;
    const userMessage = update.message.text.trim();
    const senderName = update.message.from.first_name || "User";

    // Handle system commands
    if (userMessage === "/start") {
      await sendTelegramMessage(
        chatId,
        `👋 Xin chào *${senderName}*!\n\nTôi là Telegram Bot kết nối qua **OmniRoute Model Gateway**.\nĐang bật chế độ tự động Fallback Model (Sử dụng mô hình phụ trong khi Codex chờ reset).`
      );
      return NextResponse.json({ success: true, handled: "start_command" });
    }

    if (userMessage === "/status") {
      const isLimit = process.env.CODEX_LIMIT_ACTIVE !== "false";
      await sendTelegramMessage(
        chatId,
        `🤖 *OmniRoute Status Report*\n\n` +
          `• Primary Model: \`chatgpt-codex\` (Limit Active: *${isLimit ? "YES (Fallback Mode)" : "NO"}*)\n` +
          `• Fallback Model: \`${process.env.OMNIROUTE_FALLBACK_MODEL || "gemini-1.5-flash"}\`\n` +
          `• Reset Schedule: *Aug 20 at 10:37 AM GMT+7*`
      );
      return NextResponse.json({ success: true, handled: "status_command" });
    }

    // Query OmniRoute with telegram/bot profile
    const omniResponse = await queryOmniRoute({
      profile: "telegram/bot",
      messages: [
        {
          role: "system",
          content: "Bạn là trợ lý AI thông minh qua Telegram Bot. Trả lời ngắn gọn, lịch sự, chính xác và định dạng Markdown.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      maxTokens: 1024,
    });

    let replyText = omniResponse.content || "Xin lỗi, không thể nhận phản hồi từ hệ thống.";

    // Append subtle fallback notice if running on secondary model
    if (omniResponse.isFallback) {
      replyText += `\n\n⚡ _[OmniRoute: Đang dùng mô hình phụ ${omniResponse.modelUsed} do ChatGPT Codex hết quota]_`;
    }

    await sendTelegramMessage(chatId, replyText);

    return NextResponse.json({
      success: true,
      modelUsed: omniResponse.modelUsed,
      isFallback: omniResponse.isFallback,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error processing Telegram update";
    console.error("[TELEGRAM WEBHOOK ERROR]", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
