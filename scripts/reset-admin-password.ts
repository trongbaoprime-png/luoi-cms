import { cmsDb } from "../src/lib/cms-db";
import { hashPassword } from "../src/lib/auth-security";

async function resetPassword() {
  const newPassword = process.argv[2] || "Admin@123456";
  const hashedPassword = await hashPassword(newPassword);

  const user = await cmsDb.user.findFirst({
    where: {
      OR: [{ email: "admin@luoidonnha.com" }, { name: "Beni" }, { name: "admin" }],
    },
  });

  if (user) {
    await cmsDb.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, status: "ACTIVE" },
    });
    console.log(`✅ Reset password for user '${user.email}' (${user.name}) to: '${newPassword}'`);
  } else {
    const newUser = await cmsDb.user.create({
      data: {
        name: "Beni",
        email: "admin@luoidonnha.com",
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log(`✅ Created admin user '${newUser.email}' with password: '${newPassword}'`);
  }
  process.exit(0);
}

resetPassword().catch((err) => {
  console.error("❌ Reset password failed:", err);
  process.exit(1);
});
