export interface LeadDataPayload {
  time?: string;
  name: string;
  phone: string;
  email?: string;
  service?: string;
  gift?: string;
  branch?: string;
  address?: string;
  url?: string;
  source?: string;
  medium?: string;
  ip?: string;
  device?: string;
  userAgent?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  enabledFields?: Record<string, boolean>;
}

// Parse User-Agent string to human-readable Device & Browser/App string
export function parseUserAgent(ua: string): string {
  if (!ua) return "Chưa rõ thiết bị";

  let os = "Desktop";
  if (/iPhone/i.test(ua)) os = "📱 iPhone";
  else if (/iPad/i.test(ua)) os = "📱 iPad";
  else if (/Android/i.test(ua)) os = "📱 Android";
  else if (/Windows/i.test(ua)) os = "💻 Windows PC";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "💻 Mac";
  else if (/Linux/i.test(ua)) os = "💻 Linux";

  let appOrBrowser = "Browser";
  if (/Zalo/i.test(ua)) appOrBrowser = "Zalo In-App";
  else if (/FBAV|FBAN/i.test(ua)) appOrBrowser = "Facebook In-App";
  else if (/musical_ly|TikTok/i.test(ua)) appOrBrowser = "TikTok In-App";
  else if (/Instagram/i.test(ua)) appOrBrowser = "Instagram In-App";
  else if (/CocCoc/i.test(ua)) appOrBrowser = "Cốc Cốc";
  else if (/Edg/i.test(ua)) appOrBrowser = "Edge";
  else if (/Chrome/i.test(ua)) appOrBrowser = "Chrome";
  else if (/Safari/i.test(ua)) appOrBrowser = "Safari";
  else if (/Firefox/i.test(ua)) appOrBrowser = "Firefox";

  return `${os} (${appOrBrowser})`;
}

// Format current Vietnam Time (ICT / UTC+7) "DD/MM/YYYY HH:mm:ss"
export function getVietnamFormattedTime(): string {
  const now = new Date();
  const timeZone = "Asia/Ho_Chi_Minh";
  const dateStr = now.toLocaleDateString("vi-VN", { timeZone, day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("vi-VN", { timeZone, hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return `${dateStr} ${timeStr}`;
}

// 1. Send Instant Telegram Bot Notification
export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  lead: LeadDataPayload
) {
  if (!botToken || !chatId) return { success: false, message: "Thiếu Telegram Bot Token hoặc Chat ID" };

  const time = lead.time || getVietnamFormattedTime();
  const fields = lead.enabledFields || {
    time: true,
    name: true,
    phone: true,
    email: true,
    service: true,
    gift: true,
    branch: true,
    source: true,
    url: true,
    ip: true,
    device: true,
  };

  // Determine Source channel
  let detectedSource = lead.source || lead.utmSource || "DIRECT";
  if (lead.fbclid) detectedSource = "FACEBOOK ADS (fbclid)";
  else if (lead.gclid) detectedSource = "GOOGLE ADS (gclid)";
  else if (lead.ttclid) detectedSource = "TIKTOK ADS (ttclid)";

  const deviceStr = lead.device || (lead.userAgent ? parseUserAgent(lead.userAgent) : "📱 iPhone / Android");

  let msg = `🔔 *KHÁCH HÀNG MỚI ĐĂNG KÝ FORM!*\n`;
  if (fields.time !== false) msg += `⏰ *Thời gian:* \`${time}\` (Giờ VN)\n`;
  if (fields.name !== false) msg += `👤 *Họ tên:* *${lead.name}*\n`;
  if (fields.phone !== false) msg += `📞 *Số điện thoại:* \`${lead.phone}\`\n`;
  if (fields.email !== false && lead.email) msg += `📧 *Email:* \`${lead.email}\`\n`;
  if (fields.service !== false && lead.service) msg += `🦷 *Dịch vụ/Tư vấn:* ${lead.service}\n`;
  if (fields.gift !== false && lead.gift) msg += `🎁 *Quà tặng:* ${lead.gift}\n`;
  if (fields.branch !== false && (lead.branch || lead.address)) msg += `🏢 *Chi nhánh/Địa chỉ:* ${lead.branch || lead.address}\n`;
  if (fields.source !== false) msg += `📣 *Nguồn Tracking:* \`${detectedSource}\`\n`;
  if (fields.device !== false) msg += `💻 *Thiết bị/Trình duyệt:* \`${deviceStr}\`\n`;
  if (fields.url !== false && lead.url) msg += `🌐 *URL Đăng ký:* ${lead.url}\n`;
  if (fields.ip !== false && lead.ip) msg += `📍 *IP Khách:* \`${lead.ip}\`\n`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi gửi Telegram" };
  }
}

// 2. Push Lead Row to Google Sheets Webhook App Script
export async function pushToGoogleSheetsWebhook(
  sheetsWebhookUrl: string,
  lead: LeadDataPayload
) {
  if (!sheetsWebhookUrl) return { success: false, message: "Thiếu Google Sheets Webhook URL" };

  const time = lead.time || getVietnamFormattedTime();
  let detectedSource = lead.source || lead.utmSource || "DIRECT";
  if (lead.fbclid) detectedSource = "FACEBOOK ADS";
  else if (lead.gclid) detectedSource = "GOOGLE ADS";
  else if (lead.ttclid) detectedSource = "TIKTOK ADS";

  const deviceStr = lead.device || (lead.userAgent ? parseUserAgent(lead.userAgent) : "Mobile / Desktop");

  const rowData = {
    Time: time,
    "Họ Tên": lead.name,
    "Số điện thoại": lead.phone,
    "Nội dung tư vấn/dịch vụ": lead.service || "",
    "Quà tặng vòng quay": lead.gift || "",
    "Địa chỉ": lead.branch || lead.address || "",
    URL: lead.url || "https://luoidonnha.com",
    NGUỒN: detectedSource,
    Medium: lead.medium || lead.utmMedium || "Web",
    "Thiết bị": deviceStr,
    Ip: lead.ip || "127.0.0.1",
    Email: lead.email || "",
    Gclid: lead.gclid || "",
    Fbclid: lead.fbclid || "",
    Ttclid: lead.ttclid || "",
  };

  try {
    const res = await fetch(sheetsWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rowData),
    });

    return { success: res.ok, message: "Đã đẩy dữ liệu về Google Sheets!" };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Lỗi kết nối Google Sheets Webhook" };
  }
}
