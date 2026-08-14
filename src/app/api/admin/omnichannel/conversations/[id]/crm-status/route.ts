import { NextRequest, NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";
import { crmDb } from "@/lib/crm-db";
import { getAssignedStaff } from "@/lib/pancake-tag-parser";

/**
 * GET /api/admin/omnichannel/conversations/[id]/crm-status
 * Tự động đối soát và phát hiện khách hàng giữa Live Chat Omnichannel và MiniCRM
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const conv = await omniDb.omniConversation.findUnique({
      where: { id },
      include: { fanpage: true },
    });

    if (!conv) {
      return NextResponse.json({ error: "Không tìm thấy hội thoại" }, { status: 404 });
    }

    let matchedLead: any = null;

    // 1. Tìm theo SĐT trước nếu có
    if (conv.phone && conv.phone.trim()) {
      const cleanPhone = conv.phone.trim().replace(/\D/g, "");
      matchedLead = await crmDb.cRMLead.findFirst({
        where: {
          phone: { contains: cleanPhone },
        },
        include: {
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      });
    }

    // 2. Nếu chưa thấy và có tên, tìm theo Họ Tên (case-insensitive)
    if (!matchedLead && conv.customerName && conv.customerName !== "Khách Hàng") {
      matchedLead = await crmDb.cRMLead.findFirst({
        where: {
          fullName: { equals: conv.customerName, mode: "insensitive" },
        },
        include: {
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        isMatched: !!matchedLead,
        lead: matchedLead ? {
          id: matchedLead.id,
          fullName: matchedLead.fullName,
          phone: matchedLead.phone,
          status: matchedLead.status,
          telesale: matchedLead.telesale,
          branch: matchedLead.branch,
          service: matchedLead.service,
          actualRevenue: matchedLead.actualRevenue || 0,
          revenue: matchedLead.revenue || 0,
          appointmentDate: matchedLead.appointmentDate,
          appointmentTime: matchedLead.appointmentTime,
          appointmentBranch: matchedLead.appointmentBranch,
          appointmentDoctor: matchedLead.appointmentDoctor,
          appointmentStatus: matchedLead.appointmentStatus,
          syncedToMeta: matchedLead.syncedToMeta,
          source: matchedLead.source,
          createdAt: matchedLead.createdAt,
          updatedAt: matchedLead.updatedAt,
        } : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/omnichannel/conversations/[id]/crm-status
 * 1-Click: Đẩy / Đồng bộ khách hàng từ Live Chat Omnichannel sang MiniCRM
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conv = await omniDb.omniConversation.findUnique({
      where: { id },
      include: { fanpage: true },
    });

    if (!conv) {
      return NextResponse.json({ error: "Không tìm thấy hội thoại" }, { status: 404 });
    }

    let tagsArray: string[] = [];
    try {
      if (conv.tags) tagsArray = JSON.parse(conv.tags);
    } catch {}

    const phone = conv.phone || `09${Math.floor(10000000 + Math.random() * 90000000)}`;
    const fullName = conv.customerName || "Khách Hàng Facebook";
    const telesale = getAssignedStaff(tagsArray);
    const branch = conv.detectedBranch || "CHƯA XÁC ĐỊNH";
    const service = conv.detectedService || "TƯ VẤN";

    const isQualified = tagsArray.includes("DDH") || tagsArray.includes("LỊCH");
    const isPurchase = tagsArray.includes("#ĐẬU") || tagsArray.includes("#");

    const status = isPurchase ? "PURCHASE" : isQualified ? "QUALIFIED" : "NEW";

    const phoneHash = Buffer.from(phone).toString("hex");

    const lead = await crmDb.cRMLead.upsert({
      where: { phone },
      update: {
        fullName,
        telesale,
        branch,
        service,
        status,
        updatedAt: new Date(),
      },
      create: {
        fullName,
        phone,
        phoneHash,
        source: "MESSENGER",
        sourceGroup: "FACEBOOK",
        status,
        telesale,
        branch,
        service,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã kết nối và đồng bộ khách hàng [${fullName}] sang MiniCRM!`,
      data: lead,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
