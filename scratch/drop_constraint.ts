import { PrismaClient } from "@prisma/client-crm-pg";

async function main() {
  const client = new PrismaClient({
    datasources: { db: { url: "postgresql://postgres:luoicms@127.0.0.1:5432/luoi_crm?schema=public" } }
  });
  try {
    console.log("Dropping constraint CRMLead_phone_key if exists...");
    await client.$executeRawUnsafe(`ALTER TABLE "CRMLead" DROP CONSTRAINT IF EXISTS "CRMLead_phone_key" CASCADE;`);
    console.log("Constraint dropped successfully!");
  } catch (err: any) {
    console.log("Error:", err.message);
  } finally {
    await client.$disconnect();
  }
}

main();
