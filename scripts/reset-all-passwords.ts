import { cmsDb } from "../src/lib/cms-db";
import { hashPassword } from "../src/lib/auth-security";

async function main() {
  const targetPassword = process.argv[2] || "B@oph@m021991";
  console.log(`🔐 Hashing password '${targetPassword}' using Argon2id...`);
  const hashedPassword = await hashPassword(targetPassword);

  // 1. Ensure primary admin user exists
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
    console.log(`✅ Created default admin user: 'admin@luoidonnha.com' / 'admin'`);
  }

  // 2. Reset password for ALL users in the database
  const result = await cmsDb.user.updateMany({
    data: {
      password: hashedPassword,
      status: "ACTIVE",
    },
  });

  console.log(`✅ Successfully reset password for ALL ${result.count} user accounts in database to: '${targetPassword}'`);

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
