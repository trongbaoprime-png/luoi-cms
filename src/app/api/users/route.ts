import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

const UserCreateSchema = z.object({
  name: z.string().min(2, "Tên quá ngắn"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]).default("EDITOR"),
  permissions: z.string().optional(),
  bio: z.string().optional(),
});

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function GET() {
  try {
    let users = await db.user.findMany({
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

    if (users.length === 0) {
      // Auto-seed initial system accounts
      await db.user.createMany({
        data: [
          {
            name: "Admin Quản Trị Hệ Thống",
            email: "admin@luoidonnha.com",
            password: hashPassword("admin123"),
            role: "ADMIN",
            permissions: JSON.stringify([
              "articles:read",
              "articles:create",
              "articles:edit",
              "articles:delete",
              "categories:manage",
              "products:manage",
              "deals:manage",
              "pages:manage",
              "media:upload",
              "media:delete",
              "ai:generate",
              "settings:manage",
            ]),
            bio: "Quản trị viên toàn quyền hệ thống Lười Dọn Nhà",
            status: "ACTIVE",
          },
          {
            name: "Biên Tập Viên Nội Dung",
            email: "editor@luoidonnha.com",
            password: hashPassword("editor123"),
            role: "EDITOR",
            permissions: JSON.stringify([
              "articles:read",
              "articles:create",
              "articles:edit",
              "media:upload",
              "ai:generate",
            ]),
            bio: "Biên tập viên chuyên trách nội dung Blog & SEO",
            status: "ACTIVE",
          },
        ],
      });

      users = await db.user.findMany({
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
    }

    return NextResponse.json({ success: true, data: users });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = UserCreateSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email này đã được đăng ký" }, { status: 400 });
    }

    const newUser = await db.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashPassword(validated.password),
        role: validated.role,
        permissions: validated.permissions || JSON.stringify(["articles:read", "articles:create"]),
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
