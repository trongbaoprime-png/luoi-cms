import { cmsDb } from "../src/lib/cms-db";
import { hashPassword } from "../src/lib/auth-security";

async function main() {
  const targetPassword = process.argv[2];
  if (!targetPassword || targetPassword.length < 12) {
    console.error("Usage: npx tsx scripts/reset-all-passwords.ts '<strong-password-at-least-12-chars>'");
    process.exit(2);
  }

  console.log("🔐 Hashing supplied password using Argon2id...");
  const hashedPassword = await hashPassword(targetPassword);

  const adminUser = await cmsDb.user.findFirst({
    where: { OR: [{ email: "admin@luoidonnha.com" }, { name: "admin" }, { name: "Beni" }] },
  });

  if (!adminUser) {
    await cmsDb.user.create({
      data: {
        name: "admin",
        email: "admin@luoidonnha.com",
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log("✅ Created default admin identity. Password was not printed.");
  }

  const result = await cmsDb.user.updateMany({
    data: { password: hashedPassword, status: "ACTIVE" },
  });

  console.log(`✅ Successfully reset passwords for ${result.count} user accounts. Password was not printed.`);

  const allUsers = await cmsDb.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  console.log("📋 Current Active System Users:");
  allUsers.forEach((u) => {
    console.log(`  - Username: '${u.name}' | Email: '${u.email}' | Role: ${u.role}`);
  });

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Reset all passwords failed:", err);
  process.exit(1);
});
