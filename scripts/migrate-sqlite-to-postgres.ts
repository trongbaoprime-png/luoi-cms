import { PrismaClient as SQLiteCRMClient } from "@prisma/client-crm";
import { PrismaClient as SQLiteOmniClient } from "@prisma/client-omni";
import { PrismaClient as PostgresCRMClient } from "@prisma/client-crm";
import { PrismaClient as PostgresOmniClient } from "@prisma/client-omni";

/**
 * SCRIPT CHUYỂN ĐỔI TOÀN BỘ DỮ LIỆU TỪ SQLITE SANG POSTGRESQL TRÊN VPS
 * Chạy lệnh: npx tsx scripts/migrate-sqlite-to-postgres.ts
 */

async function main() {
  console.log("🚀 Bắt đầu quá trình đồng bộ dữ liệu từ SQLite sang PostgreSQL...");

  // 1. Kiểm tra biến môi trường PostgreSQL
  const crmPgUrl = process.env.CRM_DATABASE_URL || process.env.CRM_POSTGRES_URL;
  const omniPgUrl = process.env.OMNI_DATABASE_URL || process.env.OMNI_POSTGRES_URL;

  if (!crmPgUrl || !crmPgUrl.startsWith("postgresql://")) {
    console.error("❌ Thiếu CRM_DATABASE_URL định dạng postgresql:// trong file .env!");
    process.exit(1);
  }

  if (!omniPgUrl || !omniPgUrl.startsWith("postgresql://")) {
    console.error("❌ Thiếu OMNI_DATABASE_URL định dạng postgresql:// trong file .env!");
    process.exit(1);
  }

  console.log("✅ Đã xác nhận kết nối PostgreSQL CRM & Omnichannel.");

  // Khởi tạo Client
  const sqliteCrm = new SQLiteCRMClient({ datasources: { db: { url: "file:./prisma/minicrm.db" } } });
  const sqliteOmni = new SQLiteOmniClient({ datasources: { db: { url: "file:./prisma/omnichannel.db" } } });

  const pgCrm = new PostgresCRMClient({ datasources: { db: { url: crmPgUrl } } });
  const pgOmni = new PostgresOmniClient({ datasources: { db: { url: omniPgUrl } } });

  try {
    // --------------------------------------------------------------------------
    // A. CHUYỂN ĐỔI MINICRM (48.156 LEADS + STATUS HISTORY)
    // --------------------------------------------------------------------------
    console.log("\n📦 [1/2] Đang chuyển đổi dữ liệu MiniCRM...");
    const leads = await sqliteCrm.cRMLead.findMany();
    console.log(` -> Tìm thấy ${leads.length} Leads trong SQLite minicrm.db`);

    let crmMigrated = 0;
    const chunkSize = 500;
    for (let i = 0; i < leads.length; i += chunkSize) {
      const chunk = leads.slice(i, i + chunkSize);
      await (pgCrm as any).cRMLead.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      crmMigrated += chunk.length;
      console.log(`    ✓ Đã đẩy ${crmMigrated}/${leads.length} Leads vào PostgreSQL.`);
    }

    const histories = await sqliteCrm.cRMStatusHistory.findMany();
    console.log(` -> Tìm thấy ${histories.length} Status History trong SQLite minicrm.db`);
    for (let i = 0; i < histories.length; i += chunkSize) {
      const chunk = histories.slice(i, i + chunkSize);
      await (pgCrm as any).cRMStatusHistory.createMany({
        data: chunk,
        skipDuplicates: true,
      });
    }
    console.log("✅ Hoàn tất chuyển đổi dữ liệu MiniCRM sang PostgreSQL!");

    // --------------------------------------------------------------------------
    // B. CHUYỂN ĐỔI OMNICHANNEL (FANPAGES, TAGS, CONVERSATIONS, MESSAGES, REPORTS)
    // --------------------------------------------------------------------------
    console.log("\n📦 [2/2] Đang chuyển đổi dữ liệu Omnichannel...");
    const fanpages = await (sqliteOmni as any).omniFanpage.findMany();
    if (fanpages && fanpages.length > 0) {
      await (pgOmni as any).omniFanpage.createMany({ data: fanpages, skipDuplicates: true });
      console.log(`    ✓ Đã đẩy ${fanpages.length} Fanpages vào PostgreSQL.`);
    }

    const tags = await (sqliteOmni as any).omniPancakeTag.findMany();
    if (tags && tags.length > 0) {
      await (pgOmni as any).omniPancakeTag.createMany({ data: tags, skipDuplicates: true });
      console.log(`    ✓ Đã đẩy ${tags.length} Pancake Tags vào PostgreSQL.`);
    }

    const conversations = await (sqliteOmni as any).omniConversation.findMany();
    if (conversations && conversations.length > 0) {
      await (pgOmni as any).omniConversation.createMany({ data: conversations, skipDuplicates: true });
      console.log(`    ✓ Đã đẩy ${conversations.length} Conversations vào PostgreSQL.`);
    }

    const messages = await (sqliteOmni as any).omniMessage.findMany();
    if (messages && messages.length > 0) {
      await (pgOmni as any).omniMessage.createMany({ data: messages, skipDuplicates: true });
      console.log(`    ✓ Đã đẩy ${messages.length} Messages vào PostgreSQL.`);
    }

    console.log("\n🎉 HOÀN TẤT MIGRATION 100% TỪ SQLITE SANG POSTGRESQL!");
  } catch (error) {
    console.error("❌ Lỗi trong quá trình Migration:", error);
  } finally {
    await sqliteCrm.$disconnect();
    await sqliteOmni.$disconnect();
    await pgCrm.$disconnect();
    await pgOmni.$disconnect();
  }
}

main();
