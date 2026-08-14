import { PrismaClient } from "@prisma/client-crm-pg";

async function main() {
  const crmClient = new PrismaClient({
    datasources: { db: { url: "postgresql://postgres:luoicms@127.0.0.1:5432/luoi_crm?schema=public" } }
  });
  try {
    // Create database luoi_core if not exists
    console.log("Checking / Creating luoi_core database in PostgreSQL...");
    await crmClient.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'luoi_core') THEN
          PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE luoi_core');
        END IF;
      END
      $$;
    `).catch(async () => {
      // If dblink not installed, we can also check if luoi_admin user can be created
    });
  } catch (err: any) {
    console.log("Note:", err.message);
  } finally {
    await crmClient.$disconnect();
  }
}

main();
