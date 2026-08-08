import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPhone, hashEmail, sendMetaCapiLeadEvent } from "@/lib/meta-capi";
import { normalizeSource, getSourceGroup, normalizeBranch, getBranchGroup, normalizeService, getServiceGroup, normalizeTelesale } from "@/lib/tds-parser";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const lead = await db.cRMLead.findUnique({
      where: { id },
      include: {
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: "Không tìm thấy Lead" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch lead failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existingLead = await db.cRMLead.findUnique({ where: { id } });
    if (!existingLead) {
      return NextResponse.json({ success: false, error: "Không tìm thấy Lead" }, { status: 404 });
    }

    const fullName = body.fullName || existingLead.fullName;
    const phone = body.phone || existingLead.phone;
    const email = body.email !== undefined ? body.email : existingLead.email;
    const status = (body.status || existingLead.status).toUpperCase();

    const rawSource = body.source || existingLead.source;
    const source = normalizeSource(rawSource);
    const sourceGroup = getSourceGroup(source);

    const branch = body.branch ? normalizeBranch(body.branch) : existingLead.branch;
    const branchGroup = branch ? getBranchGroup(branch) : existingLead.branchGroup;

    const service = body.service ? normalizeService(body.service) : existingLead.service;
    const serviceGroup = service ? getServiceGroup(service) : existingLead.serviceGroup;

    const telesale = body.telesale ? normalizeTelesale(body.telesale) : existingLead.telesale;

    const previousStatus = existingLead.status;

    const updatedLead = await db.cRMLead.update({
      where: { id },
      data: {
        fullName,
        phone,
        email,
        phoneHash: hashPhone(phone),
        emailHash: email ? hashEmail(email) : undefined,
        source,
        sourceGroup,
        telesale,
        branch,
        branchGroup,
        service,
        serviceGroup,
        status,
        note: body.note !== undefined ? body.note : existingLead.note,
        revenue: body.revenue !== undefined ? Number(body.revenue) : existingLead.revenue,
        actualRevenue: body.actualRevenue !== undefined ? Number(body.actualRevenue) : existingLead.actualRevenue,
        caTheoRevenue: body.caTheoRevenue !== undefined ? Number(body.caTheoRevenue) : existingLead.caTheoRevenue,
        value: body.value !== undefined ? Number(body.value) : existingLead.value,
      },
    });

    if (previousStatus !== status) {
      await db.cRMStatusHistory.create({
        data: {
          leadId: id,
          previousStatus,
          newStatus: status,
          updatedBy: body.updatedBy || "ADMIN_UI",
        },
      });

      // Dispatch CAPI if status changed
      let metaEventName: "Lead" | "Contact" | "Purchase" | null = null;
      if (status === "QUALIFIED" || status === "SCHEDULED") metaEventName = "Lead";
      else if (status === "CHECKIN") metaEventName = "Contact";
      else if (status === "PURCHASE") metaEventName = "Purchase";

      if (metaEventName) {
        sendMetaCapiLeadEvent({
          eventName: metaEventName,
          leadId: updatedLead.leadId || undefined,
          phone: updatedLead.phone,
          email: updatedLead.email || undefined,
          fullName: updatedLead.fullName,
          value: updatedLead.revenue || updatedLead.value || undefined,
          currency: updatedLead.currency || "VND",
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin Khách hàng thành công!",
      lead: updatedLead,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Update lead failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await db.cRMLead.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xóa Lead thành công" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Delete lead failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
