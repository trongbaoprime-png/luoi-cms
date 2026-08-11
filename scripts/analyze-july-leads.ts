import { PrismaClient as PostgresCRMClient } from "@prisma/client-crm-pg";

async function main() {
  const crmPgUrl = process.env.CRM_DATABASE_URL || "postgresql://postgres:luoicms@127.0.0.1:5432/luoi_crm?schema=public";
  const pgCrm = new PostgresCRMClient({ datasources: { db: { url: crmPgUrl } } });

  try {
    const total = await pgCrm.cRMLead.count();
    console.log(`📊 Total in PostgreSQL: ${total}`);

    // Count by checkinDate in July 2026
    const countCheckinJuly = await pgCrm.cRMLead.count({
      where: { checkinDate: { gte: "2026-07-01", lte: "2026-07-31" } },
    });
    console.log(`📅 Count by checkinDate (2026-07-01 -> 2026-07-31): ${countCheckinJuly}`);

    // Count by createdAt in July 2026
    const countCreatedAtJuly = await pgCrm.cRMLead.count({
      where: {
        createdAt: {
          gte: new Date("2026-07-01T00:00:00.000Z"),
          lte: new Date("2026-07-31T23:59:59.999Z"),
        },
      },
    });
    console.log(`📅 Count by createdAt (July 2026): ${countCreatedAtJuly}`);

    // Status breakdown for July 2026 checkinDate
    const statusBreakdown = await pgCrm.cRMLead.groupBy({
      by: ["status"],
      where: { checkinDate: { gte: "2026-07-01", lte: "2026-07-31" } },
      _count: { id: true },
    });
    console.log("📊 Status breakdown for July 2026 checkinDate:", statusBreakdown);

    // Ref breakdown for July 2026 checkinDate
    const refBreakdown = await pgCrm.cRMLead.groupBy({
      by: ["ref"],
      where: { checkinDate: { gte: "2026-07-01", lte: "2026-07-31" } },
      _count: { id: true },
    });
    console.log("📊 Ref breakdown for July 2026 checkinDate:", refBreakdown);

    // Result breakdown for July 2026 checkinDate
    const resultBreakdown = await pgCrm.cRMLead.groupBy({
      by: ["result"],
      where: { checkinDate: { gte: "2026-07-01", lte: "2026-07-31" } },
      _count: { id: true },
    });
    console.log("📊 Result breakdown for July 2026 checkinDate:", resultBreakdown);

  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    await pgCrm.$disconnect();
  }
}

main();
