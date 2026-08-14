import { PrismaClient } from "@prisma/client-cms";

async function testConn(url: string, name: string) {
  const client = new PrismaClient({
    datasources: { db: { url } },
    log: ["error"],
  });
  try {
    const res = await client.$queryRaw`SELECT 1 as result`;
    console.log(`[OK] Connection to ${name} successful:`, res);
    await client.$disconnect();
    return true;
  } catch (err: any) {
    console.log(`[FAIL] Connection to ${name} failed:`, err.message);
    await client.$disconnect();
    return false;
  }
}

async function main() {
  await testConn("postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_core?schema=public", "luoi_admin @ luoi_core");
  await testConn("postgresql://postgres:luoicms@127.0.0.1:5432/luoi_core?schema=public", "postgres:luoicms @ luoi_core");
  await testConn("postgresql://postgres:luoicms@127.0.0.1:5432/luoi_crm?schema=public", "postgres:luoicms @ luoi_crm");
  process.exit(0);
}

main();
