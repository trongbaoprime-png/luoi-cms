import { NextResponse } from "next/server";
import { cmsDb } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const block = await cmsDb.shortcodeBlock.findUnique({
      where: { id },
    });
    if (!block) return NextResponse.json({ success: false, error: "Block không tồn tại" }, { status: 404 });
    return NextResponse.json({ success: true, block });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, key, type, configJson } = body;

    const block = await cmsDb.shortcodeBlock.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(key && { key }),
        ...(type && { type }),
        ...(configJson && { configJson: typeof configJson === "object" ? JSON.stringify(configJson) : configJson }),
      },
    });
    return NextResponse.json({ success: true, block });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await cmsDb.shortcodeBlock.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xóa thành công" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
