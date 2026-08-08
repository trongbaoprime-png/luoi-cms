import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const media = await db.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: "File không tồn tại" }, { status: 404 });
    }

    // Try deleting physical file
    try {
      const filename = path.basename(media.url);
      const filePath = path.join(process.cwd(), "public", "images", filename);
      await fs.unlink(filePath);
    } catch (e) {
      console.warn("Could not delete physical file:", e);
    }

    await db.media.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Đã xóa file media thành công" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Xóa file thất bại";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
