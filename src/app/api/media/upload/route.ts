import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import { requirePermission } from "@/lib/auth-guard";
import { optimizeImageBuffer } from "@/lib/image-optimizer";

export async function POST(req: Request) {
  const perm = await requirePermission("media:upload", req);
  if (!perm.authorized) {
    return perm.errorResponse || NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customAlt = formData.get("alt") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Ensure public/images directory exists
    const publicImagesDir = path.join(process.cwd(), "public", "images");
    await fs.mkdir(publicImagesDir, { recursive: true });

    // Clean base name without extension
    const originalNameClean = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();

    const timestamp = Date.now();
    const webpFilename = `${timestamp}-${originalNameClean}.webp`;
    const filePath = path.join(publicImagesDir, webpFilename);

    let compressedBuffer: Buffer;
    let finalSize: number;
    let savingsRatio = "0%";

    // High Performance Sharp Compression to WebP (< 150KB target, max-width 1200px)
    if (file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|avif|gif|bmp)$/i.test(file.name)) {
      const optResult = await optimizeImageBuffer(inputBuffer, 1200);
      compressedBuffer = optResult.webpBuffer;
      finalSize = optResult.optimizedSize;
      savingsRatio = optResult.compressionRatio;
    } else {
      compressedBuffer = inputBuffer;
      finalSize = file.size;
    }

    // Save compressed WebP file to disk
    await fs.writeFile(filePath, compressedBuffer);

    // Check if CDN Domain is configured in settings
    let cdnPrefix = "";
    try {
      const cdnSetting = await db.setting.findUnique({ where: { key: "cdn_url" } });
      if (cdnSetting && cdnSetting.value) {
        cdnPrefix = cdnSetting.value.replace(/\/+$/, "");
      }
    } catch {}

    const localUrl = `/images/${webpFilename}`;
    const publicUrl = cdnPrefix ? `${cdnPrefix}/images/${webpFilename}` : localUrl;

    // Save metadata record to DB
    const media = await db.media.create({
      data: {
        filename: webpFilename,
        url: publicUrl,
        mimeType: "image/webp",
        size: finalSize,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Tải & nén ảnh WebP thành công! (Tiết kiệm ${savingsRatio} dung lượng)`,
      data: {
        ...media,
        altText: customAlt || originalNameClean.replace(/_/g, " "),
        savings: savingsRatio,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Upload file thất bại";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
