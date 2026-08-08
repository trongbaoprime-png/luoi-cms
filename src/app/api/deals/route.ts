import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantParam = searchParams.get("merchant") || searchParams.get("provider");

    const whereClause: any = { isActive: true };
    if (merchantParam && merchantParam.toLowerCase() !== "all") {
      whereClause.merchant = { contains: merchantParam };
    }

    let deals: any[] = await db.deal.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Default rich sample deals if DB is empty or filtered merchant has no deals yet
    const fallbackDeals = [
      {
        id: "deal-shopee-1",
        code: "LUOI50K",
        title: "Voucher Đơn Đầu Shopee Gia Dụng",
        discount: "Giảm 50.000đ",
        merchant: "Shopee",
        affiliateUrl: "https://shopee.vn",
        isHot: true,
        originalPrice: 200000,
        discountPrice: 150000,
      },
      {
        id: "deal-shopee-2",
        code: "FREESHIPMAX",
        title: "Mã Miễn Phí Vận Chuyển Toàn Quốc",
        discount: "Freeship 100%",
        merchant: "Shopee",
        affiliateUrl: "https://shopee.vn",
        isHot: true,
      },
      {
        id: "deal-btaskee-1",
        code: "BTASKEE20",
        title: "Ưu Đãi Đặt Lịch Lau Dọn Theo Giờ bTaskee",
        discount: "Giảm 20% Đơn Đầu",
        merchant: "bTaskee",
        affiliateUrl: "https://btaskee.com",
        isHot: true,
      },
      {
        id: "deal-giupviec-1",
        code: "GV24H30",
        title: "Voucher Tổng Vệ Sinh Căn Hộ Giúp Việc 24H",
        discount: "Giảm 100.000đ",
        merchant: "Giúp Việc 24h",
        affiliateUrl: "#",
        isHot: false,
      },
      {
        id: "deal-luoi-1",
        code: "LUOICLUB15",
        title: "Giảm 15% Dịch Vụ Vệ Sinh Sofa & Nệm Độc Quyền Lười Dọn Nhà",
        discount: "Giảm 15% Trực Tiếp",
        merchant: "Lười Dọn Nhà",
        affiliateUrl: "tel:0901234567",
        isHot: true,
      },
      {
        id: "deal-lzd-1",
        code: "LZDHOME30",
        title: "Voucher Gia Dụng Tiện Ích Lazada",
        discount: "Giảm 30%",
        merchant: "Lazada",
        affiliateUrl: "https://lazada.vn",
        isHot: false,
      },
    ];

    if (deals.length === 0) {
      if (merchantParam && merchantParam.toLowerCase() !== "all") {
        deals = fallbackDeals.filter((d) =>
          d.merchant.toLowerCase().includes(merchantParam.toLowerCase())
        );
        if (deals.length === 0) deals = fallbackDeals.slice(0, 3);
      } else {
        deals = fallbackDeals as any;
      }
    }

    return NextResponse.json(deals);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database query failed";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

