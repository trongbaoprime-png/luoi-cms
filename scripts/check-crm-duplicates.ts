import { PrismaClient as PostgresCRMClient } from "@prisma/client-crm-pg";
import { PrismaClient as SQLiteCRMClient } from "@prisma/client-crm-sqlite";
import path from "path";

async function main() {
  console.log("🔍 Đang kiểm tra dữ liệu Leads & Duplicate...");

  const sqliteCrmPath = path.resolve(process.cwd(), "prisma/minicrm.db");
  const sqliteCrm = new SQLiteCRMClient({ datasources: { db: { url: `file:${sqliteCrmPath}` } } });

  const crmPgUrl = process.env.CRM_DATABASE_URL || "postgresql://postgres:luoicms@127.0.0.1:5432/luoi_crm?schema=public";
  const pgCrm = new PostgresCRMClient({ datasources: { db: { url: crmPgUrl } } });

  try {
    const sqliteTotal = await sqliteCrm.cRMLead.count();
    console.log(`📊 Tổng số Leads trong SQLite minicrm.db: ${sqliteTotal}`);

    const pgTotal = await pgCrm.cRMLead.count();
    console.log(`📊 Tổng số Leads trong PostgreSQL luoi_crm: ${pgTotal}`);

    // Kiểm tra trùng lặp theo ID
    const pgUniqueIds = await pgCrm.cRMLead.groupBy({
      by: ["id"],
      _count: { id: true },
    });
    console.log(`📊 Số ID duy nhất trong PostgreSQL: ${pgUniqueIds.length}`);

    // Kiểm tra trùng lặp theo (phone + fullName + createdAt)
    const dups = await pgCrm.cRMLead.groupBy({
      by: ["phone", "fullName", "createdAt"],
      _count: { id: true },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    });
    console.log(`⚠️ Số nhóm bị trùng lặp exact (phone + fullName + createdAt): ${dups.length}`);

    if (dups.length > 0) {
      console.log("⚠️ Chi tiết 5 nhóm trùng lặp đầu tiên:", dups.slice(0, 5));
    }

    // Đếm số khách Tháng 7/2026 (01/07/2026 -> 31/07/2026)
    const t7Leads = await pgCrm.cRMLead.count({
      where: {
        OR: [
          { checkinDate: { gte: "2026-07-01", lte: "2026-07-31" } },
          {
            AND: [
              { OR: [{ checkinDate: null }, { checkinDate: "" }] },
              { createdAt: { gte: new Date("2026-07-01T00:00:00.000Z"), lte: new Date("2026-07-31T23:59:59.999Z") } },
            ],
          },
        ],
      },
    });
    console.log(`📅 Số khách Tháng 7/2026 (01/07 - 31/07): ${t7Leads}`);

  } catch (err) {
    console.error("❌ Lỗi kiểm tra:", err);
  } finally {
    await sqliteCrm.$disconnect();
    await pgCrm.$disconnect();
  }
}

main();
