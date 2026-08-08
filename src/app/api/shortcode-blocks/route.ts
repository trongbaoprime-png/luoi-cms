import { NextResponse } from "next/server";
import { cmsDb } from "@/lib/db";

let defaultBlocksSeeded = false;

async function ensureDefaultBlocks() {
  if (defaultBlocksSeeded) return;
  try {
    const existing = await cmsDb.shortcodeBlock.findUnique({
      where: { key: "form-header" },
    });
    if (!existing) {
      await cmsDb.shortcodeBlock.create({
        data: {
          name: "Form Đăng Ký Tư Vấn Header (Mặc Định)",
          key: "form-header",
          type: "FORM",
          configJson: JSON.stringify({
            title: "Đăng Ký Tư Vấn & Nhận Mã Giảm Giá",
            subtitle: "Để lại thông tin, chuyên viên sẽ gọi điện tư vấn trực tiếp sau 5 phút!",
            badge: "FORM TƯƠNG TÁC POPUP",
            submitText: "GỬI YÊU CẦU TƯ VẤN NGAY",
            successTitle: "Gửi Thông Tin Thành Công!",
            successMsg: "Cảm ơn bạn! Chuyên viên tư vấn sẽ liên hệ lại với số điện thoại của bạn trong ít phút.",
            layout: "1_COL",
            antiSpamEnabled: true,
            antiSpamText: "Tôi xác minh không phải là robot (Xác minh chống Spam)",
            customColors: {
              bg: "#ffffff",
              titleColor: "#1c1917",
              textColor: "#78716c",
              buttonBg: "#0d9488",
              buttonText: "#ffffff",
              borderColor: "#e7e5e4",
            },
            fields: [
              { id: "f1", label: "Họ và Tên", name: "name", type: "text", placeholder: "VD: Nguyễn Văn A", required: true },
              { id: "f2", label: "Số Điện Thoại", name: "phone", type: "tel", placeholder: "VD: 0912 743 327", required: true },
              {
                id: "f_branch",
                label: "Chi Nhánh Gần Bạn",
                name: "branch",
                type: "select",
                options: [
                  "Chi nhánh TP. Hồ Chí Minh",
                  "Chi nhánh Hà Nội",
                  "Chi nhánh Đà Nẵng",
                  "Chi nhánh Cần Thơ",
                  "Chi nhánh Bình Dương",
                  "Chi nhánh Đồng Nai",
                ],
              },
              { id: "f3", label: "Nhu cầu tư vấn / Ghi chú", name: "note", type: "textarea", placeholder: "Nội dung dịch vụ hoặc thắc mắc cần hỗ trợ..." },
            ],
          }),
        },
      });
    }
    defaultBlocksSeeded = true;
  } catch {}
}

export async function GET(req: Request) {
  try {
    await ensureDefaultBlocks();
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key) {
      const block = await cmsDb.shortcodeBlock.findUnique({
        where: { key },
      });
      if (!block) {
        return NextResponse.json({ success: false, error: "Block không tồn tại" }, { status: 404 });
      }
      return NextResponse.json(
        { success: true, block },
        {
          headers: {
            "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const blocks = await cmsDb.shortcodeBlock.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(
      { success: true, blocks },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, key, type, configJson } = body;

    if (!name || !key || !type || !configJson) {
      return NextResponse.json(
        { success: false, error: "Thiếu dữ liệu bắt buộc (name, key, type, configJson)" },
        { status: 400 }
      );
    }

    // Clean key format
    const cleanKey = key
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w-]/g, "-")
      .replace(/-+/g, "-");

    const block = await cmsDb.shortcodeBlock.upsert({
      where: { key: cleanKey },
      update: {
        name,
        type,
        configJson: typeof configJson === "object" ? JSON.stringify(configJson) : configJson,
      },
      create: {
        name,
        key: cleanKey,
        type,
        configJson: typeof configJson === "object" ? JSON.stringify(configJson) : configJson,
      },
    });

    return NextResponse.json({ success: true, block });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
