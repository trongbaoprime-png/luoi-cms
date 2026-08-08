import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMetaCapiLeadEvent } from "@/lib/meta-capi";
import { parseTdsPayload } from "@/lib/tds-parser";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = parseTdsPayload(body);

    const leadId = body.leadId || body.id;
    const phone = parsed.phone || body.phone;

    if (!leadId && !phone) {
      return NextResponse.json(
        { success: false, error: "Thiếu leadId hoặc phone để tìm Lead" },
        { status: 400 }
      );
    }

    // Determine final status if explicitly passed in body (e.g. from Admin UI dropdown) vs parsed from sheet columns
    const finalStatus = (body.status || parsed.status).toUpperCase();
    const finalValue = body.value !== undefined ? Number(body.value) : parsed.revenue > 0 ? parsed.revenue : parsed.actualRevenue;

    // 1. Find Lead by ID or Phone
    const lead = await db.cRMLead.findFirst({
      where: leadId ? { id: leadId } : { phone },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thông tin Khách hàng trong miniCRM" },
        { status: 404 }
      );
    }

    const previousStatus = lead.status;

    // 2. Update Lead in Database with full TDS metadata
    const updatedLead = await db.cRMLead.update({
      where: { id: lead.id },
      data: {
        status: finalStatus,
        source: parsed.source || lead.source,
        sourceGroup: parsed.sourceGroup || lead.sourceGroup,
        telesale: parsed.telesale || lead.telesale,
        branch: parsed.branch || lead.branch,
        branchGroup: parsed.branchGroup || lead.branchGroup,
        service: parsed.service || lead.service,
        serviceGroup: parsed.serviceGroup || lead.serviceGroup,
        checkinDate: parsed.checkinDate || lead.checkinDate,
        isMonthNote: parsed.isMonthNote ?? lead.isMonthNote,
        result: parsed.result || lead.result,
        isOldCustomer: parsed.isOldCustomer ?? lead.isOldCustomer,
        revenue: parsed.revenue || lead.revenue,
        actualRevenue: parsed.actualRevenue || lead.actualRevenue,
        caTheoRevenue: parsed.caTheoRevenue || lead.caTheoRevenue,
        ...(body.fullName ? { fullName: String(body.fullName).trim() } : {}),
        ...(body.note !== undefined ? { note: body.note } : {}),
        ...(finalValue > 0 ? { value: finalValue } : {}),
        ...(body.currency ? { currency: body.currency } : {}),
      },
    });

    // Record Status Change History
    await db.cRMStatusHistory.create({
      data: {
        leadId: lead.id,
        previousStatus,
        newStatus: finalStatus,
        updatedBy: body.updatedBy || "TELE_SHEET",
      },
    });

    // 3. Map CRM Status to Meta CAPI Lead Event & Dispatch CAPI
    let metaEventName: "Lead" | "Contact" | "Purchase" | null = null;

    if (finalStatus === "QUALIFIED" || finalStatus === "SCHEDULED") metaEventName = "Lead";
    else if (finalStatus === "CHECKIN") metaEventName = "Contact";
    else if (finalStatus === "PURCHASE") metaEventName = "Purchase";

    let capiResult = null;
    if (metaEventName) {
      capiResult = await sendMetaCapiLeadEvent({
        eventName: metaEventName,
        leadId: updatedLead.leadId || undefined,
        phone: updatedLead.phone,
        email: updatedLead.email || undefined,
        fullName: updatedLead.fullName,
        fbclid: updatedLead.fbclid || undefined,
        fbp: updatedLead.fbp || undefined,
        fbc: updatedLead.fbc || undefined,
        value: updatedLead.value || undefined,
        currency: updatedLead.currency || "VND",
      });

      // Update CAPI sync flag
      if (capiResult.success) {
        await db.cRMLead.update({
          where: { id: updatedLead.id },
          data: {
            syncedToMeta: true,
            metaEventResponse: JSON.stringify(capiResult.data),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật trạng thái Lead thành ${finalStatus} và gửi CAPI Meta thành công!`,
      data: updatedLead,
      capiResult,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Sheet status update failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
