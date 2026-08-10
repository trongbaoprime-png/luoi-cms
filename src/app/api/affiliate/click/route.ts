import { NextResponse } from "next/server";
import { cmsDb } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  const productId = searchParams.get("productId") || undefined;
  const merchant = searchParams.get("merchant") || "Shopee";

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing target url" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";

  // Asynchronously log click
  try {
    await cmsDb.clickLog.create({
      data: {
        productId,
        targetUrl,
        merchant,
        ipAddress: ip,
        userAgent,
      },
    });

    if (productId) {
      await cmsDb.product.update({
        where: { id: productId },
        data: { clicks: { increment: 1 } },
      }).catch(() => null);
    }
  } catch (e) {
    console.warn("Click log failed:", e);
  }

  return NextResponse.redirect(targetUrl, 302);
}
