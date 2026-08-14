import { NextRequest, NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";
import { crmDb } from "@/lib/crm-db";

/**
 * PATCH /api/admin/omnichannel/conversations/[id]
 * Cập nhật Chi nhánh mong muốn, Dịch vụ, Nhu cầu chi tiết (Customer Intent/Wishes)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { detectedBranch, detectedService, customerIntent, phone, customerName } = body;

    const dataToUpdate: any = {};
    if (detectedBranch !== undefined) dataToUpdate.detectedBranch = detectedBranch;
    if (detectedService !== undefined) dataToUpdate.detectedService = detectedService;
    if (customerIntent !== undefined) dataToUpdate.customerIntent = customerIntent;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (customerName !== undefined) dataToUpdate.customerName = customerName;

    const updated = await omniDb.omniConversation.update({
      where: { id },
      data: dataToUpdate,
    });

    // Nếu có SĐT và trên MiniCRM đã có, đồng bộ luôn chi nhánh và dịch vụ sang MiniCRM
    if (updated.phone) {
      const cleanPhone = updated.phone.trim().replace(/\D/g, "");
      try {
        await crmDb.cRMLead.updateMany({
          where: { phone: { contains: cleanPhone } },
          data: {
            branch: updated.detectedBranch || undefined,
            service: updated.detectedService || undefined,
          },
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Đã cập nhật thông tin nhu cầu & chi nhánh thành công!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
