import { NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";
import { db } from "@/lib/db";
import { hashPhone } from "@/lib/meta-capi";

export async function POST(req: Request) {
  try {
    const { conversationId, telesaleName, targetBranch } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ success: false, error: "Thiếu ID hội thoại" }, { status: 400 });
    }

    // 1. Fetch Omnichannel conversation details
    const omniConv = await omniDb.omniConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!omniConv) {
      return NextResponse.json({ success: false, error: "Không tìm thấy hội thoại" }, { status: 404 });
    }

    const assignedBranch = targetBranch || omniConv.detectedBranch || "Chưa chọn";
    const assignedTelesale = telesaleName || "XUÂN";
    const phone = omniConv.phone || `09${Math.floor(10000000 + Math.random() * 90000000)}`;

    // 2. Promote/Upsert to main miniCRM cRMLead table
    let lead = null;
    if (omniConv.phone) {
      lead = await db.cRMLead.findFirst({ where: { phone: omniConv.phone } });
    }

    if (!lead) {
      lead = await db.cRMLead.create({
        data: {
          fullName: omniConv.customerName || `Khách ${omniConv.psid.slice(-4)}`,
          phone,
          phoneHash: hashPhone(phone),
          source: "PANCAKE_MESSENGER",
          telesale: assignedTelesale,
          branch: assignedBranch,
          service: omniConv.detectedService || "Tư vấn Nha khoa",
          status: "QUALIFIED",
          revenue: omniConv.quotedBudget || 0,
          note: `Chuyển từ Omnichannel AI Agent. Nhu cầu: ${omniConv.detectedService || "Chưa rõ"} - Chi nhánh: ${assignedBranch}`,
        },
      });
    } else {
      lead = await db.cRMLead.update({
        where: { id: lead.id },
        data: {
          branch: assignedBranch,
          telesale: assignedTelesale,
          status: "QUALIFIED",
          note: `${lead.note || ""} | Giao lại cho Telesale ${assignedTelesale} theo chi nhánh ${assignedBranch}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Đã chuyển hội thoại thành công sang miniCRM cho Telesale ${assignedTelesale} (Chi nhánh ${assignedBranch})`,
      lead,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi chuyển đổi dữ liệu sang CRM" }, { status: 500 });
  }
}
