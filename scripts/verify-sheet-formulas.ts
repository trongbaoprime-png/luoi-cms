import { PrismaClient as PostgresCRMClient } from "@prisma/client-crm-pg";

async function main() {
  const crmPgUrl = process.env.CRM_DATABASE_URL || "postgresql://postgres:luoicms@127.0.0.1:5432/luoi_crm?schema=public";
  const pgCrm = new PostgresCRMClient({ datasources: { db: { url: crmPgUrl } } });

  try {
    console.log("🔍 ĐỐI SOÁT CÔNG THỨC SHEET THÁNG 8/2026...");

    const whereAug: any = {
      checkinDate: { gte: "2026-08-01", lte: "2026-08-31" },
    };

    // 1. TỔNG KHÁCH (Sheet DATHEN / Form Lead: ref != 'Checkin')
    const tongKhachDatHen = await pgCrm.cRMLead.count({
      where: {
        ...whereAug,
        OR: [{ ref: "App" }, { ref: "Form" }, { ref: null }],
      },
    });

    // 2. CHECK-IN (Sheet Telesale: ref == 'Checkin')
    const checkinSheetCount = await pgCrm.cRMLead.count({
      where: {
        ...whereAug,
        ref: "Checkin",
      },
    });

    // 3. ĐẬU
    const dauCount = await pgCrm.cRMLead.count({
      where: {
        ...whereAug,
        ref: "Checkin",
        result: "Đậu",
      },
    });

    // 4. RỚT
    const rotCount = await pgCrm.cRMLead.count({
      where: {
        ...whereAug,
        ref: "Checkin",
        result: "Rớt",
      },
    });

    console.log(`📌 TỔNG KHÁCH (Sheet DATHEN): ${tongKhachDatHen} (Kỳ vọng Sheet: 699)`);
    console.log(`📌 CHECK-IN (Sheet Telesale): ${checkinSheetCount} (Kỳ vọng Sheet: 369)`);
    console.log(`📌 ĐẬU (Sheet Telesale): ${dauCount} (Kỳ vọng Sheet: 199)`);
    console.log(`📌 RỚT (Sheet Telesale): ${rotCount} (Kỳ vọng Sheet: 129)`);
    if (checkinSheetCount > 0) {
      console.log(`📌 TỶ LỆ ĐẬU: ${((dauCount / checkinSheetCount) * 100).toFixed(2)}% (Kỳ vọng Sheet: 53.93%)`);
    }

  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    await pgCrm.$disconnect();
  }
}

main();
