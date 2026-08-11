import { PrismaClient as PostgresCRMClient } from "@prisma/client-crm-pg";

async function main() {
  const crmPgUrl = process.env.CRM_DATABASE_URL || "postgresql://postgres:luoicms@127.0.0.1:5432/luoi_crm?schema=public";
  const pgCrm = new PostgresCRMClient({ datasources: { db: { url: crmPgUrl } } });

  try {
    console.log("🔍 ĐANG PHÂN TÍCH DỮ LIỆU THÁNG 8/2026 (01/08/2026 -> 31/08/2026)...");

    // 1. Lấy tất cả leads theo checkinDate trong Tháng 8
    const checkinAugust = await pgCrm.cRMLead.findMany({
      where: { checkinDate: { gte: "2026-08-01", lte: "2026-08-31" } },
    });
    console.log(`📊 Số leads có checkinDate thuộc Tháng 8/2026: ${checkinAugust.length}`);

    // Breakdown ref cho checkinDate Tháng 8
    const refCounts: Record<string, number> = {};
    for (const l of checkinAugust) {
      const r = l.ref || "NULL";
      refCounts[r] = (refCounts[r] || 0) + 1;
    }
    console.log("📊 Phân loại theo ref (checkinDate Tháng 8):", refCounts);

    // Breakdown ref cho ALL leads có ref = "Checkin" & checkinDate Tháng 8
    const checkinSheetLeads = checkinAugust.filter(l => l.ref === "Checkin");
    console.log(`📊 Leads từ Sheet Telesale (ref = "Checkin") trong Tháng 8: ${checkinSheetLeads.length}`);

    // Breakdown status cho ref = "Checkin" Tháng 8
    const statusCounts: Record<string, number> = {};
    for (const l of checkinSheetLeads) {
      const s = l.status || "NULL";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    }
    console.log("📊 Status của ref = Checkin Tháng 8:", statusCounts);

    // Result breakdown của ref = "Checkin" Tháng 8
    const resultCounts: Record<string, number> = {};
    for (const l of checkinSheetLeads) {
      const res = l.result || "NULL";
      resultCounts[res] = (resultCounts[res] || 0) + 1;
    }
    console.log("📊 Result (Đậu/Rớt) của ref = Checkin Tháng 8:", resultCounts);

  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    await pgCrm.$disconnect();
  }
}

main();
