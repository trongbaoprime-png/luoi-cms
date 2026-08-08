import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: { clickLogs: { take: 10, orderBy: { createdAt: "desc" } } },
    });

    if (!product) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updatedProduct = await db.product.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm thành công" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
