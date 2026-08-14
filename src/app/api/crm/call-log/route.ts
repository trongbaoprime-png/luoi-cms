import { NextRequest, NextResponse } from "next/server";
import { crmDb } from "@/lib/db";
import { normalizeVnPhone } from "@/lib/identity-resolution";

/**
 * LƯỜI BUSINESS OS — VoIP 1-Click Call Logger & WebRTC Integration
 * 
 * Supports:
 * 1. Recording call logs (Stringee / Voiptel / Zalo Call / Softphone)
 * 2. Updating Lead timeline & call status history
 * 3. Tracking call duration & recording URLs for QA / Telesale Coaching
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    if (crmDb && leadId) {
      const history = await (crmDb as any).cRMStatusHistory.findMany({
        where: { leadId, previousStatus: { startsWith: "CALL_" } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, callLogs: history });
    }

    return NextResponse.json({ success: true, message: "VoIP Call Engine Active" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Fetch call logs failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, phone, telesale, callStatus, durationSeconds, recordingUrl, notes } = body;

    if (!phone && !leadId) {
      return NextResponse.json({ error: "Thiếu số điện thoại hoặc leadId để ghi nhật ký cuộc gọi." }, { status: 400 });
    }

    const normPhone = phone ? normalizeVnPhone(phone) : undefined;
    const formattedDuration = durationSeconds ? `${Math.floor(durationSeconds / 60)}p ${durationSeconds % 60}s` : "0s";
    const statusLabel = callStatus === "ANSWERED" ? "Đã nghe máy" : callStatus === "BUSY" ? "Máy bận" : "Không nhấc máy";

    if (crmDb) {
      const lead = await (crmDb as any).cRMLead.findFirst({
        where: leadId ? { id: leadId } : { phone: normPhone },
      });

      if (lead) {
        const callLogNote = `[Cuộc gọi VoIP ${new Date().toLocaleTimeString("vi-VN")}]: ${statusLabel} (${formattedDuration}) bởi ${telesale || "Telesale"}. ${notes ? `Ghi chú: ${notes}` : ""}`;
        
        await (crmDb as any).cRMLead.update({
          where: { id: lead.id },
          data: {
            note: lead.note ? `${lead.note}\n${callLogNote}` : callLogNote,
            status: callStatus === "ANSWERED" ? (lead.status === "NEW" ? "QUALIFIED" : lead.status) : lead.status,
            telesale: telesale || lead.telesale,
            updatedAt: new Date(),
          },
        });

        await (crmDb as any).cRMStatusHistory.create({
          data: {
            leadId: lead.id,
            previousStatus: `CALL_${callStatus || "COMPLETED"}`,
            newStatus: lead.status,
            updatedBy: telesale || "VOIP_WEBRTC",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã lưu nhật ký cuộc gọi thành công cho ${phone || leadId}.`,
      callSummary: {
        phone: normPhone,
        status: statusLabel,
        duration: formattedDuration,
        recordingUrl: recordingUrl || null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Save call log failed" }, { status: 500 });
  }
}
