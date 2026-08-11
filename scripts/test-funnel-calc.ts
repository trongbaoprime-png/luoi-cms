import { PrismaClient as PostgresCRMClient } from "@prisma/client-crm-pg";

async function main() {
  const crmPgUrl = process.env.CRM_DATABASE_URL || "postgresql://postgres:luoicms@127.0.0.1:5432/luoi_crm?schema=public";
  const pgCrm = new PostgresCRMClient({ datasources: { db: { url: crmPgUrl } } });

  try {
    const where: any = {
      checkinDate: { gte: "2026-07-01", lte: "2026-07-31" },
      sourceGroup: "FACEBOOK",
    };

    const total = await pgCrm.cRMLead.count({ where });

    const qualify = await pgCrm.cRMLead.count({
      where: {
        ...where,
        OR: [
          { status: { in: ["QUALIFIED", "SCHEDULED", "CHECKIN", "PURCHASE"] } },
          { ref: "Checkin" },
          { result: { in: ["Đậu", "Rớt"] } },
          { revenue: { gt: 0 } },
        ],
      },
    });

    const contact = await pgCrm.cRMLead.count({
      where: {
        ...where,
        OR: [
          { status: { in: ["CHECKIN", "PURCHASE"] } },
          { ref: "Checkin" },
          { result: { in: ["Đậu", "Rớt"] } },
          { actualRevenue: { gt: 0 } },
        ],
      },
    });

    const purchase = await pgCrm.cRMLead.count({
      where: {
        ...where,
        OR: [{ status: "PURCHASE" }, { result: "Đậu" }, { actualRevenue: { gt: 0 } }],
      },
    });

    console.log("📊 KẾT QUẢ FUNNEL CHUẨN DÀNH CHO FACEBOOK THÁNG 7/2026:");
    console.log(`- TỔNG KHÁCH: ${total}`);
    console.log(`- QUALIFY (Khách thật): ${qualify} (${((qualify/total)*100).toFixed(1)}% tổng khách)`);
    console.log(`- CONTACT (Check-in thực tế): ${contact} (${((contact/qualify)*100).toFixed(1)}% trên Qualify)`);
    console.log(`- PURCHASE (Chốt đơn/Đậu): ${purchase} (${((purchase/contact)*100).toFixed(1)}% trên Contact)`);

  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    await pgCrm.$disconnect();
  }
}

main();
