import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { hashPassword } from "@/lib/auth-security";
import { requirePermission } from "@/lib/auth-guard";

const UserCreateSchema = z.object({
  name: z.string().min(2, "Tên quá ngắn"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "TELESALE", "MARKETING", "VIEWER", "EDITOR", "AUTHOR"]).default("ADMIN"),
  permissions: z.string().optional(),
  bio: z.string().optional(),
});

export async function GET(req: Request) {
  const perm = await requirePermission("users:manage", req);
  if (!perm.authorized) {
    return perm.errorResponse || NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        status: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const perm = await requirePermission("users:manage", req);
  if (!perm.authorized) {
    return perm.errorResponse || NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = UserCreateSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email này đã được đăng ký" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(validated.password);

    const newUser = await db.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: validated.role,
        permissions: validated.permissions || (validated.role === "SUPER_ADMIN" ? "*" : JSON.stringify(["articles:read", "articles:create"])),
        bio: validated.bio,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo tài khoản thành công",
      data: newUser,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Dữ liệu không hợp lệ";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
