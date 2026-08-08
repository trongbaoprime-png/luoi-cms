import { NextResponse } from "next/server";
import { sendTelegramNotification, getVietnamFormattedTime } from "@/lib/notification-service";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return auth.errorResponse || NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { botToken, chatId, enabledFields } = body;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Telegram Bot Token và Chat ID!" },
        { status: 400 }
      );
    }

    const testLead = {
      time: getVietnamFormattedTime(),
      name: "Lê Trường Mỹ (TEST TELEGRAM)",
      phone: "0935660958",
      email: "khachtest@gmail.com",
      service: "TÔI CẦN TƯ VẤN LÀM RẮNG",
      gift: "Miễn Phí Cạo Vôi Răng",
      branch: "CN Quận 3, TPHCM",
      address: "Hồ Chí Minh",
      url: "https://uuđai.nhakhoatamducsmile.com/?fbclid=IwAR0_TEST_123",
      source: "FACEBOOK ADS",
      medium: "Send",
      device: "📱 iPhone (Zalo In-App)",
      ip: "115.73.128.226",
      fbclid: "IwAR0_TEST_123",
      enabledFields,
    };

    const res = await sendTelegramNotification(botToken, chatId, testLead);

    return NextResponse.json(res);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi kiểm thử Telegram Bot";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
