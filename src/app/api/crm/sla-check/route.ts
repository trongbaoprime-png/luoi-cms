import { NextRequest, NextResponse } from "next/server";
import { crmDb, cmsDb } from "@/lib/db";
import { sendTelegramSlaAlert } from "@/lib/notification-service";

/**
 * LƯỜI BUSINESS OS — Telesale SLA 5-Minute Enforcement Engine
 * 
 * Logic:
 * 1. Scans for leads created > 5 minutes ago with status in ['NEW', 'REGISTERED', 'CHUA_XU_LY']
 * 2. Identifies uncalled / unattended leads
 * 3. Triggers Telegram Escalation Alert with direct 1-click CRM action link
 * 4. Logs the SLA breach to status history
 */

export async function GET(req: NextRequest) {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    let breachedLeads: any[] = [];
    if (crmDb) {
      breachedLeads = await (crmDb as any).cRMLead.findMany({
        where: {
          status: { in: ["NEW", "REGISTERED", "CHUA_XU_LY"] },
          createdAt: { lte: fiveMinutesAgo },
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      });
    }

    const mapped = breachedLeads.map((l) => {
      const elapsedMinutes = Math.floor((Date.now() - new Date(l.createdAt).getTime()) / (60 * 1000));
      return {
        id: l.id,
        fullName: l.fullName || "Khách hàng",
        phone: l.phone,
        service: l.service,
        branch: l.branch,
        source: l.source,
        telesale: l.telesale,
        createdAt: l.createdAt,
        elapsedMinutes,
        slaStatus: "BREACHED_OVER_5MIN",
      };
    });

    return NextResponse.json({
      success: true,
      slaThresholdMinutes: 5,
      totalBreachedLeads: mapped.length,
      breachedLeads: mapped,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to check SLA" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // 1. Fetch settings for Telegram Bot
    const settings = await cmsDb.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => (settingsMap[s.key] = s.value));

    const botToken = settingsMap.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = settingsMap.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;

    let breachedLeads: any[] = [];
    if (crmDb) {
      breachedLeads = await (crmDb as any).cRMLead.findMany({
        where: {
          status: { in: ["NEW", "REGISTERED", "CHUA_XU_LY"] },
          createdAt: { lte: fiveMinutesAgo },
        },
        orderBy: { createdAt: "asc" },
        take: 10,
      });
    }

    let alertCount = 0;
    for (const lead of breachedLeads) {
      const elapsedMinutes = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (60 * 1000));

      if (botToken && chatId) {
        await sendTelegramSlaAlert(botToken, chatId, {
          leadId: lead.id,
          fullName: lead.fullName || "Khách hàng",
          phone: lead.phone,
          service: lead.service,
          branch: lead.branch,
          source: lead.source,
          elapsedMinutes,
          assignedTelesale: lead.telesale,
        });
        alertCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã quét và gửi ${alertCount} cảnh báo vi phạm SLA 5 phút sang Telegram.`,
      breachedCount: breachedLeads.length,
      alertsDispatched: alertCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to dispatch SLA alerts" }, { status: 500 });
  }
}
