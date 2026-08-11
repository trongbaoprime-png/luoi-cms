import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cmsDb } from "@/lib/cms-db";
import { verifyPassword, generateSecureToken, needsRehash, hashPassword } from "@/lib/auth-security";
import { createAdminSession, AdminRole } from "@/lib/redis-session";

// In-Memory Rate Limiter to prevent Brute-Force attacks
const loginAttempts = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxAttempts = 5;

  const record = loginAttempts.get(ip);
  if (!record || now > record.expiresAt) {
    loginAttempts.set(ip, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count };
}

export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

    const limit = checkRateLimit(clientIp);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Bạn đã đăng nhập sai quá 5 lần. Vui lòng thử lại sau 1 phút!" },
        { status: 429 }
      );
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!" },
        { status: 400 }
      );
    }

    let authenticatedUser: {
      id: string;
      username: string;
      email: string;
      role: AdminRole;
      permissions?: string | null;
    } | null = null;

    // 1. Check against Environment SUPER_ADMIN if configured via ADMIN_PASS_HASH (Argon2id)
    const envAdminUser = process.env.ADMIN_USER;
    const envAdminPassHash = process.env.ADMIN_PASS_HASH;

    if (envAdminUser && envAdminPassHash && username === envAdminUser) {
      const isEnvValid = await verifyPassword(password, envAdminPassHash);
      if (isEnvValid) {
        authenticatedUser = {
          id: "env-super-admin",
          username: envAdminUser,
          email: `${envAdminUser}@luoidonnha.com`,
          role: "SUPER_ADMIN",
          permissions: "*",
        };
      }
    }

    const cleanUsername = username.trim().toLowerCase();

    // 2. Check against Database User Table
    if (!authenticatedUser) {
      try {
        const dbUser = await cmsDb.user.findFirst({
          where: {
            OR: [
              { email: cleanUsername },
              { name: cleanUsername },
              { email: username.trim() },
              { name: username.trim() },
              ...(cleanUsername === "admin" ? [{ email: "admin@luoidonnha.com" }] : []),
            ],
            status: "ACTIVE",
          },
        });

        if (dbUser && dbUser.password) {
          const isDbPasswordValid = await verifyPassword(password, dbUser.password);
          if (isDbPasswordValid) {
            let role: AdminRole = "ADMIN";
            const upperRole = (dbUser.role || "ADMIN").toUpperCase();
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

            // Transparent re-hash to official Argon2id if user had legacy hash
            if (needsRehash(dbUser.password)) {
              try {
                const newArgon2Hash = await hashPassword(password);
                await cmsDb.user.update({
                  where: { id: dbUser.id },
                  data: { password: newArgon2Hash },
                });
              } catch {}
            }
          }
        }
      } catch {
        // Database access error handled gracefully without exposing internal stack trace
      }
    }

    if (authenticatedUser) {
      // Clear rate limit record on successful login
      loginAttempts.delete(clientIp);

      // Generate cryptographically secure random session token
      const sessionToken = generateSecureToken(32);

      // Create session in Redis server-side
      await createAdminSession(sessionToken, {
        userId: authenticatedUser.id,
        username: authenticatedUser.username,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        permissions: authenticatedUser.permissions,
        ttlSeconds: 60 * 60 * 24 * 7, // 7 days session
      });

      const isProduction = process.env.NODE_ENV === "production";
      const isHttps = req.url.startsWith("https") || req.headers.get("x-forwarded-proto") === "https";

      const cookieStore = await cookies();
      cookieStore.set("luoi_admin_session", sessionToken, {
        httpOnly: true,
        secure: isProduction || isHttps,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({
        success: true,
        message: "Đăng nhập thành công",
        user: {
          username: authenticatedUser.username,
          role: authenticatedUser.role,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Tên đăng nhập hoặc mật khẩu không chính xác!" },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Đã xảy ra lỗi trong quá trình xác thực!" },
      { status: 500 }
    );
  }
}
