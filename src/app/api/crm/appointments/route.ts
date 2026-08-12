import { NextResponse } from "next/server";
import { crmDb, cmsDb } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/auth-guard";
import { sendMetaCapiLeadEvent } from "@/lib/meta-capi";
import { sendTelegramNotification, getVietnamFormattedTime } from "@/lib/notification-service";

/**
 * GET /api/crm/appointments
 * Lấy danh sách Lịch Hẹn theo khoảng ngày, Chi nhánh, Trạng thái
 */
export async function GET(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const branch = searchParams.get("branch") || "ALL";
    const appointmentStatus = searchParams.get("appointmentStatus") || "ALL";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(200, Math.max(10, Number(searchParams.get("pageSize")) || 50));

    const whereConditions: any[] = [
      {
        OR: [
          { status: "SCHEDULED" },
          { appointmentDate: { not: null } },
          { ref: "App" },
        ],
      },
    ];

    if (dateFrom && dateTo) {
      whereConditions.push({
        appointmentDate: {
          gte: dateFrom,
          lte: dateTo,
        },
      });
    }

    if (branch !== "ALL") {
      whereConditions.push({
        OR: [
          { appointmentBranch: branch },
          { branch: branch },
        ],
      });
    }

    if (appointmentStatus !== "ALL") {
      whereConditions.push({ appointmentStatus });
    }

    const where = { AND: whereConditions };

    const [totalCount, appointments] = await Promise.all([
      crmDb.cRMLead.count({ where }),
      crmDb.cRMLead.findMany({
        where,
        orderBy: [
          { appointmentDate: "asc" },
          { appointmentTime: "asc" },
        ],
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      appointments,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch appointments failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * POST /api/crm/appointments
 * Tạo hoặc cập nhật Lịch Hẹn 1-Click cho Khách hàng
 */
export async function POST(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await req.json();
    const {
      leadId,
      phone,
      appointmentDate,
      appointmentTime,
      appointmentBranch,
      appointmentDoctor,
      appointmentStatus = "PENDING",
      appointmentNote,
      updatedBy = "ADMIN_UI",
    } = body;

    if (!leadId && !phone) {
      return NextResponse.json(
        { success: false, error: "Vui lòng truyền leadId hoặc phone của khách hàng" },
        { status: 400 }
      );
    }

    // 1. Tìm Lead trong DB
    const lead = leadId
      ? await crmDb.cRMLead.findUnique({ where: { id: leadId } })
      : await crmDb.cRMLead.findUnique({ where: { phone } });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khách hàng để đặt lịch" },
        { status: 404 }
      );
    }

    const previousStatus = lead.status;
    const newLeadStatus = lead.status === "CHECKIN" || lead.status === "PURCHASE" ? lead.status : "SCHEDULED";

    // 2. Cập nhật Lead với thông tin Đặt Hẹn
    const updatedLead = await crmDb.cRMLead.update({
      where: { id: lead.id },
      data: {
        status: newLeadStatus,
        appointmentDate: appointmentDate || lead.appointmentDate,
        appointmentTime: appointmentTime || lead.appointmentTime,
        appointmentBranch: appointmentBranch || lead.branch || lead.appointmentBranch,
        appointmentDoctor: appointmentDoctor || lead.appointmentDoctor,
        appointmentStatus,
        appointmentNote: appointmentNote !== undefined ? appointmentNote : lead.appointmentNote,
        branch: appointmentBranch || lead.branch,
      },
    });

    // 3. Ghi Lịch Sử Chuyển Trạng Thái nếu có thay đổi status
    if (previousStatus !== newLeadStatus) {
      await crmDb.cRMStatusHistory.create({
        data: {
          leadId: lead.id,
          previousStatus,
          newStatus: newLeadStatus,
          updatedBy,
        },
      });
    }

    // 4. Bắn Meta CAPI Event `Schedule`
    sendMetaCapiLeadEvent({
      eventName: "Schedule",
      leadId: updatedLead.leadId || undefined,
      phone: updatedLead.phone,
      email: updatedLead.email || undefined,
      fullName: updatedLead.fullName,
      currency: "VND",
    }).catch(() => {});

    // 5. Gửi thông báo Telegram Alert tới Group Chi Nhánh
    try {
      const telegramTokenSetting = await cmsDb.setting.findUnique({ where: { key: "telegram_bot_token" } });
      const telegramChatIdSetting = await cmsDb.setting.findUnique({ where: { key: "telegram_chat_id" } });

      if (telegramTokenSetting?.value && telegramChatIdSetting?.value) {
        const branchName = appointmentBranch || updatedLead.branch || "Tâm Đức Smile";
        const apptDateStr = appointmentDate ? `${appointmentTime ? appointmentTime + " " : ""}${appointmentDate}` : "Chờ xác nhận";
        
        await sendTelegramNotification(telegramTokenSetting.value, telegramChatIdSetting.value, {
          name: `📅 [LỊCH HẸN MỚI] ${updatedLead.fullName}`,
          fullName: `📅 [LỊCH HẸN MỚI] ${updatedLead.fullName}`,
          phone: updatedLead.phone,
          service: updatedLead.service || "Khám & Tư Vấn",
          source: updatedLead.source || "miniCRM",
          note: `📍 Chi nhánh: ${branchName}\n🕒 Thời gian hẹn: ${apptDateStr}\n👩‍💼 Telesale: ${updatedLead.telesale || "N/A"}\n📝 Ghi chú: ${appointmentNote || "Không"}`,
          createdAt: getVietnamFormattedTime(),
        });
      }
    } catch (teleErr) {
      console.error("[Appointments API] Send Telegram notification failed:", teleErr);
    }

    return NextResponse.json({
      success: true,
      message: "Đặt lịch hẹn thành công!",
      appointment: updatedLead,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Create appointment failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
