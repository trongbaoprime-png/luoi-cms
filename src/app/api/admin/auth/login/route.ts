import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cmsDb } from "@/lib/cms-db";
import { verifyPassword, generateSecureToken, needsRehash, hashPassword } from "@/lib/auth-security";
import { createAdminSession, AdminRole } from "@/lib/redis-session";

// In-memory limiter is a basic protection for a single Next.js process.
// A shared Redis limiter should replace this if the app is scaled horizontally.
const loginAttempts = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxAttempts = 5;
  const record = loginAttempts.get(ip);

  if (!record || now > record.expiresAt) {
    loginAttempts.set(ip, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) return { allowed: false, remaining: 0 };
  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count };
}

export async function POST(req: Request) {
  try {
    const clientIp = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1")
      .split(",")[0]
      .trim();
    const body = await req.json().catch(() => ({}));
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!" },
        { status: 400 }
      );
    }

    const limit = checkRateLimit(clientIp);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Bạn đã thử sai quá 5 lần. Hệ thống tạm khóa trong 1 phút để bảo mật!" },
        { status: 429 }
      );
    }

    const cleanUsername = username.toLowerCase();
    let authenticatedUser: {
      id: string;
      username: string;
      email: string;
      role: AdminRole;
      permissions?: string | null;
    } | null = null;

    // 1. Environment super-admin. Password must be stored only as Argon2 hash.
    const envAdminUser = process.env.ADMIN_USER?.trim();
    const envAdminPassHash = process.env.ADMIN_PASS_HASH?.trim();

    if (envAdminUser && envAdminPassHash && cleanUsername === envAdminUser.toLowerCase()) {
      const isEnvValid = await verifyPassword(password, envAdminPassHash);
      if (isEnvValid) {
        authenticatedUser = {
          id: "env-super-admin",
          username: envAdminUser,
          email: process.env.ADMIN_EMAIL || `${envAdminUser}@luoidonnha.com`,
          role: "SUPER_ADMIN",
          permissions: "*",
        };
      }
    }

    // 2. Database users.
    if (!authenticatedUser) {
      try {
        const dbUser = await cmsDb.user.findFirst({
          where: {
            OR: [
              { email: cleanUsername },
              { name: cleanUsername },
              { email: username },
              { name: username },
            ],
            status: "ACTIVE",
          },
        });

        if (dbUser?.password) {
          const isDbPasswordValid = await verifyPassword(password, dbUser.password);
          if (isDbPasswordValid) {
            let role: AdminRole = "ADMIN";
            const upperRole = String(dbUser.role || "ADMIN").toUpperCase();
            if (["SUPER_ADMIN", "ADMIN", "MANAGER", "TELESALE", "MARKETING", "VIEWER"].includes(upperRole)) {
              role = upperRole as AdminRole;
            }

            authenticatedUser = {
              id: dbUser.id,
              username: dbUser.name,
              email: dbUser.email,
              role,
              permissions: dbUser.permissions,
            };

            if (needsRehash(dbUser.password)) {
              try {
                const newArgon2Hash = await hashPassword(password);
                await cmsDb.user.update({ where: { id: dbUser.id }, data: { password: newArgon2Hash } });
              } catch {}
            }
          }
        }
      } catch {
        // Do not expose database details in auth responses.
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: "Tên đăng nhập hoặc mật khẩu không chính xác!" },
        { status: 401 }
      );
    }

    loginAttempts.delete(clientIp);
    const sessionToken = generateSecureToken(32);

    await createAdminSession(sessionToken, {
      userId: authenticatedUser.id,
      username: authenticatedUser.username,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      permissions: authenticatedUser.permissions,
      ttlSeconds: 60 * 60 * 24 * 7,
    });

    const isHttps = req.url.startsWith("https") || req.headers.get("x-forwarded-proto") === "https";
    const cookieStore = await cookies();
    cookieStore.set("luoi_admin_session", sessionToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      user: { username: authenticatedUser.username, role: authenticatedUser.role },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Đã xảy ra lỗi trong quá trình xác thực!" },
      { status: 500 }
    );
  }
}
