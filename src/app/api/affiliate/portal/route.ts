import { NextRequest, NextResponse } from "next/server";

/**
 * LƯỜI BUSINESS OS — KOC / KOL & Partner Affiliate Portal API
 */

export interface AffiliatePartner {
  id: string;
  name: string;
  code: string;
  phone: string;
  type: "KOC" | "KOL" | "EMPLOYEE" | "PARTNER";
  commissionRate: number; // e.g. 0.08 = 8%
  clicks: number;
  leads: number;
  actualRevenue: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  status: "ACTIVE" | "PAUSED";
}

let PARTNERS: AffiliatePartner[] = [
  {
    id: "aff_1",
    name: "Võ Hà Linh (KOC Review)",
    code: "HALINH_REVIEW",
    phone: "0908123456",
    type: "KOC",
    commissionRate: 0.1, // 10%
    clicks: 14250,
    leads: 680,
    actualRevenue: 1240000000, // 1.24B VND
    totalCommission: 124000000,
    paidCommission: 100000000,
    pendingCommission: 24000000,
    status: "ACTIVE",
  },
  {
    id: "aff_2",
    name: "BS. Nguyễn Văn Hùng (Bác Sĩ Đối Tác)",
    code: "BS_HUNG_TDS",
    phone: "0912987654",
    type: "PARTNER",
    commissionRate: 0.08, // 8%
    clicks: 4520,
    leads: 290,
    actualRevenue: 850000000, // 850M VND
    totalCommission: 68000000,
    paidCommission: 50000000,
    pendingCommission: 18000000,
    status: "ACTIVE",
  },
  {
    id: "aff_3",
    name: "Nguyễn Thu Trang (Telesale Nội Bộ)",
    code: "TRANG_TELE_01",
    phone: "0934567890",
    type: "EMPLOYEE",
    commissionRate: 0.05, // 5%
    clicks: 2150,
    leads: 180,
    actualRevenue: 420000000, // 420M VND
    totalCommission: 21000000,
    paidCommission: 21000000,
    pendingCommission: 0,
    status: "ACTIVE",
  },
];

export async function GET(req: NextRequest) {
  try {
    const totalRev = PARTNERS.reduce((a, b) => a + b.actualRevenue, 0);
    const totalComm = PARTNERS.reduce((a, b) => a + b.totalCommission, 0);
    const totalPending = PARTNERS.reduce((a, b) => a + b.pendingCommission, 0);

    return NextResponse.json({
      success: true,
      kpis: {
        totalPartners: PARTNERS.length,
        totalReferredRevenue: totalRev,
        formattedReferredRevenue: `${(totalRev / 1000000000).toFixed(2)} Tỷ VNĐ`,
        totalCommissionEarned: totalComm,
        formattedCommission: `${(totalComm / 1000000).toFixed(1)} Triệu VNĐ`,
        totalPendingPayout: totalPending,
        formattedPending: `${(totalPending / 1000000).toFixed(1)} Triệu VNĐ`,
      },
      partners: PARTNERS,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Fetch affiliate failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, phone, type, commissionRate } = body;

    if (!name || !code || !phone) {
      return NextResponse.json({ error: "Thiếu thông tin đối tác bắt buộc" }, { status: 400 });
    }

    const newPartner: AffiliatePartner = {
      id: `aff_${Date.now()}`,
      name,
      code: code.toUpperCase().replace(/\s+/g, "_"),
      phone,
      type: type || "KOC",
      commissionRate: commissionRate || 0.08,
      clicks: 0,
      leads: 0,
      actualRevenue: 0,
      totalCommission: 0,
      paidCommission: 0,
      pendingCommission: 0,
      status: "ACTIVE",
    };

    PARTNERS.push(newPartner);

    return NextResponse.json({
      success: true,
      message: `Đã đăng ký đối tác ${name} (${newPartner.code}) thành công!`,
      partner: newPartner,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Create affiliate partner failed" }, { status: 500 });
  }
}
