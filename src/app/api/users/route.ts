import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { hashPassword } from "@/lib/auth-security";
import { requirePermission } from "@/lib/auth-guard";

const UserCreateSchema = z.object({
  name: z.string().min(2, "Tên quá ngắn"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "MARKETING",
    "CMS_EDITOR",
    "TELESALE_STAFF",
    "CSKH_OMNICHANNEL",
    "DEVOPS",
    "CUSTOM",
    "MANAGER",
    "TELESALE",
    "VIEWER",
    "EDITOR",
    "AUTHOR",
  ]).default("ADMIN"),
  permissions: z.string().optional(),
  bio: z.string().optional(),
});

export async function GET(req: Request) {
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
      },
    });

    // Auto-seed default accounts if empty
    if (users.length === 0) {
      const defaultPass = await hashPassword("Admin@123456");
      const seedUsers = [
        {
          name: "Nguyễn Văn Bảo (Admin Tổng)",
          email: "admin@tamducsmile.vn",
          password: defaultPass,
          role: "ADMIN",
          permissions: JSON.stringify(["*"]),
          bio: "Quản trị viên toàn hệ thống Lưới Business OS",
          status: "ACTIVE",
        },
        {
          name: "Trần Marketing Lead",
          email: "marketing@tamducsmile.vn",
          password: defaultPass,
          role: "MARKETING",
          permissions: JSON.stringify([
            "ads:campaigns:view", "ads:diagnosis:view", "ads:diagnosis:apply", "ads:accounts:manage", "ads:forms:view",
            "ads:cards:kpi", "ads:cards:wasted", "ads:col:spend:view", "ads:col:roas:view",
            "rawleads:forms:view", "rawleads:channels:view", "rawleads:subscribers:view", "rawleads:export",
            "crm:leads:view", "crm:cards:kpi", "crm:cards:revenue", "crm:notes:manage",
            "omni:inbox:access", "omni:cards:analytics", "omni:pancake:sync",
            "tracking:sessions:view", "tracking:pixel:manage",
            "cms:articles:view", "cms:cards:overview",
            "privacy:phone:unmask", "privacy:email:unmask", "privacy:revenue:unmask",
          ]),
          bio: "Trưởng phòng Marketing & Ads",
          status: "ACTIVE",
        },
        {
          name: "Võ Thị CSKH Đa Kênh",
          email: "cskh@tamducsmile.vn",
          password: defaultPass,
          role: "CSKH_OMNICHANNEL",
          permissions: JSON.stringify([
            "omni:inbox:access", "omni:inbox:reply", "omni:copilot:use", "omni:branch:assign", "omni:pancake:sync", "omni:crm:push",
            "crm:leads:view", "crm:leads:edit", "crm:notes:manage",
          ]),
          bio: "Tư vấn viên CSKH 68 Fanpages",
          status: "ACTIVE",
        },
        {
          name: "Lê Telesale Pro",
          email: "telesale@tamducsmile.vn",
          password: defaultPass,
          role: "TELESALE_STAFF",
          permissions: JSON.stringify([
            "crm:leads:view", "crm:leads:edit", "crm:notes:manage",
            "omni:inbox:access", "omni:inbox:reply", "omni:copilot:use", "omni:branch:assign",
          ]),
          bio: "Chuyên viên Telesale & Chăm sóc lịch hẹn",
          status: "ACTIVE",
        },
      ];

      for (const u of seedUsers) {
        await db.user.create({ data: u });
      }

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
        },
      });
    }

    return NextResponse.json({ success: true, data: users });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
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
