// Force Turbopack HMR Cache Refresh - Verified Clean
import { NextResponse } from "next/server";
import { crmDb, cmsDb } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/auth-guard";

export async function GET(req: Request) {
  // Server-side Admin Auth Guard
  const auth = await verifyAdminAuth();
  if (!auth.authenticated) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const sourceGroup = searchParams.get("sourceGroup") || "ALL";
    const telesale = searchParams.get("telesale") || "ALL";
    const branchGroup = searchParams.get("branchGroup") || "ALL";
    const branch = searchParams.get("branch") || "ALL";
    const serviceGroup = searchParams.get("serviceGroup") || "ALL";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(200, Math.max(10, Number(searchParams.get("pageSize")) || 50));

    const conditions: any[] = [];

    if (search) {
      // Khi gõ từ khóa tìm kiếm (SĐT, Tên, Email, Ghi chú): Ưu tiên tìm kiếm toàn hệ thống
      conditions.push({
        OR: [
          { fullName: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
          { note: { contains: search } },
        ],
      });
    } else {
      // Khi KHÔNG nhập ô tìm kiếm: Áp dụng đầy đủ bộ lọc phân loại Nguồn, Chi nhánh, Dịch vụ, Khoảng ngày
      if (status !== "ALL") {
        if (status === "QUALIFIED") {
          conditions.push({ status: { in: ["QUALIFIED", "SCHEDULED"] } });
        } else {
          conditions.push({ status });
        }
      }

      if (sourceGroup !== "ALL") {
        conditions.push({ sourceGroup });
      }

      if (telesale !== "ALL") {
        conditions.push({ telesale });
      }

      if (branchGroup !== "ALL") {
        conditions.push({ branchGroup });
      }

      if (branch !== "ALL") {
        conditions.push({ branch: { contains: branch } });
      }

      if (serviceGroup !== "ALL") {
        conditions.push({ serviceGroup });
      }

      if (dateFrom || dateTo) {
        const fromStr = normalizeToIsoDate(dateFrom) || "2020-01-01";
        const toStr = normalizeToIsoDate(dateTo) || "2030-12-31";

        conditions.push({
          checkinDate: {
            gte: fromStr,
            lte: toStr,
          },
        });
      }
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    // High performance parallel database queries (Paginated + Aggregated)
    const [
      totalCount,
      paginatedLeads,
      qualifiedCount,
      checkinCount,
      passCount,
      failCount,
      purchaseCount,
      revenueAggregate,
      revFb,
      revWebGg,
      revTT,
      revHotline,
      revNewAgg,
      revOldAgg,
      actualNewAgg,
      actualOldAgg,
      revOldPSAgg,
      revVietKieuAgg,
      revNNAgg,
      revKoMktAgg,
      caTheoCount,
    ] = await Promise.all([
      crmDb.cRMLead.count({ where }),
      crmDb.cRMLead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      crmDb.cRMLead.count({
        where: { ...where, status: { in: ["QUALIFIED", "SCHEDULED"] } },
      }),
      crmDb.cRMLead.count({
        where: {
          ...where,
          OR: [{ status: "CHECKIN" }, { status: "PURCHASE" }, { checkinDate: { not: "" } }],
        },
      }),
      crmDb.cRMLead.count({
        where: {
          ...where,
          OR: [{ status: "PURCHASE" }, { result: "Đậu" }],
        },
      }),
      crmDb.cRMLead.count({
        where: { ...where, result: "Rớt" },
      }),
      crmDb.cRMLead.count({
        where: { ...where, status: "PURCHASE" },
      }),
      crmDb.cRMLead.aggregate({
        where,
        _sum: {
          revenue: true,
          actualRevenue: true,
          caTheoRevenue: true,
          value: true,
        },
      }),
      // Sources
      crmDb.cRMLead.aggregate({ where: { ...where, sourceGroup: "FACEBOOK" }, _sum: { revenue: true } }),
      crmDb.cRMLead.aggregate({ where: { ...where, sourceGroup: "WEBSITE" }, _sum: { revenue: true } }),
      crmDb.cRMLead.aggregate({ where: { ...where, sourceGroup: "TIKTOK" }, _sum: { revenue: true } }),
      crmDb.cRMLead.aggregate({ where: { ...where, sourceGroup: "HOTLINE" }, _sum: { revenue: true } }),
      // New vs Old Revenue
      crmDb.cRMLead.aggregate({ where: { ...where, isOldCustomer: false }, _sum: { revenue: true }, _count: { id: true } }),
      crmDb.cRMLead.aggregate({ where: { ...where, isOldCustomer: true }, _sum: { revenue: true }, _count: { id: true } }),
      // New vs Old Actual Revenue
      crmDb.cRMLead.aggregate({ where: { ...where, isOldCustomer: false, actualRevenue: { gt: 0 } }, _sum: { actualRevenue: true }, _count: { id: true } }),
      crmDb.cRMLead.aggregate({ where: { ...where, isOldCustomer: true, actualRevenue: { gt: 0 } }, _sum: { actualRevenue: true }, _count: { id: true } }),
      // Old Customer PS & Special Segments
      crmDb.cRMLead.aggregate({ where: { ...where, isMonthNote: true }, _sum: { revenue: true }, _count: { id: true } }),
      crmDb.cRMLead.aggregate({ where: { ...where, isVietKieu: true }, _sum: { revenue: true }, _count: { id: true } }),
      crmDb.cRMLead.aggregate({ where: { ...where, isNN: true }, _sum: { revenue: true }, _count: { id: true } }),
      crmDb.cRMLead.aggregate({ where: { ...where, isKoMkt: true }, _sum: { revenue: true }, _count: { id: true } }),
      crmDb.cRMLead.count({ where: { ...where, caTheoRevenue: { gt: 0 } } }),
    ]);

    const totalRevenue = revenueAggregate._sum.revenue || 0;
    const totalActualRevenue = revenueAggregate._sum.actualRevenue || 0;
    const totalCaTheoRevenue = revenueAggregate._sum.caTheoRevenue || 0;
    const passRate = checkinCount > 0 ? (passCount / checkinCount) * 100 : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const revenueFacebook = revFb._sum.revenue || 0;
    const revenueWebGg = revWebGg._sum.revenue || 0;
    const revenueTikTok = revTT._sum.revenue || 0;
    const revenueHotline = revHotline._sum.revenue || 0;

    const revenueKoMkt = revKoMktAgg._sum.revenue || 0;
    const koMktCount = revKoMktAgg._count.id || 0;

    const revenueMkt = Math.max(0, totalRevenue - revenueKoMkt);
    const revenueMktFb = revenueFacebook;
    const revenueMktWebGg = revenueWebGg;
    const revenueMktTT = revenueTikTok;
    const revenueMktHotline = revenueHotline;

    const actualNewRevenue = actualNewAgg._sum.actualRevenue || 0;
    const actualNewCount = actualNewAgg._count.id || 0;
    const actualOldRevenue = actualOldAgg._sum.actualRevenue || 0;
    const actualOldCount = actualOldAgg._count.id || 0;
    const actualCount = actualNewCount + actualOldCount;

    const revenueNew = revNewAgg._sum.revenue || 0;
    const revenueNewCount = revNewAgg._count.id || 0;
    const revenueOld = revOldAgg._sum.revenue || 0;
    const revenueOldCount = revOldAgg._count.id || 0;

    const revenueOldPS = revOldPSAgg._sum.revenue || 0;
    const revenueOldPSCount = revOldPSAgg._count.id || 0;

    const revenueVietKieu = revVietKieuAgg._sum.revenue || 0;
    const vietKieuCount = revVietKieuAgg._count.id || 0;

    const revenueNN = revNNAgg._sum.revenue || 0;
    const nnCount = revNNAgg._count.id || 0;

    // Ad Budget metrics: Tra cứu cấu hình chi phí từ CSDL Setting theo tháng (Mặc định 0đ nếu người dùng chưa nhập)
    let adSpend = 0;
    let adBudgetVat = 0;
    let adCostToMktRatio = 0;

    const isoFrom = normalizeToIsoDate(dateFrom);
    const targetMonthKey = isoFrom ? isoFrom.slice(0, 7).replace("-", "_") : "2026_08";
    const adSpendSetting = await cmsDb.setting.findUnique({
      where: { key: `ad_spend_${targetMonthKey}` },
    });

    if (adSpendSetting && adSpendSetting.value) {
      try {
        const parsed = JSON.parse(adSpendSetting.value);
        adSpend = Number(parsed.adSpend || 0);
        adBudgetVat = Number(parsed.adBudgetVat || 0);
      } catch {}
    }

    if (adBudgetVat > 0 && revenueMkt > 0) {
      adCostToMktRatio = Math.round((adBudgetVat / revenueMkt) * 10000) / 100;
    }

    return NextResponse.json({
      success: true,
      leads: paginatedLeads,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
      kpi: {
        totalLeads: totalCount,
        qualifiedCount,
        scheduledCount: 0,
        checkinCount,
        passCount,
        failCount,
        purchaseCount,
        totalRevenue,
        totalActualRevenue,
        totalCaTheoRevenue,
        passRate: Math.round(passRate * 10) / 10,

        // New Card Breakdown Metrics
        revenueFacebook,
        revenueWebGg,
        revenueTikTok,
        revenueHotline,

        revenueMkt,
        revenueMktFb,
        revenueMktWebGg,
        revenueMktTT,
        revenueMktHotline,

        adSpend,
        adBudgetVat,
        adCostToMktRatio,

        actualCount,
        actualNewRevenue,
        actualNewCount,
        actualOldRevenue,
        actualOldCount,

        revenueNew,
        revenueNewCount,
        revenueOld,
        revenueOldCount,

        revenueOldPS,
        revenueOldPSCount,
        caTheoCount,

        revenueVietKieu,
        vietKieuCount,
        revenueNN,
        nnCount,
        revenueKoMkt,
        koMktCount,
      },
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch leads failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

function normalizeToIsoDate(str: string) {
  if (!str) return "";
  const s = str.trim();
  if (s.includes("/")) {
    const parts = s.split("/");
    if (parts.length === 3) {
      const d = parts[0].padStart(2, "0");
      const m = parts[1].padStart(2, "0");
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
  }
  if (s.includes("-")) {
    const parts = s.split("-");
    if (parts.length === 3) {
      const y = parts[0];
      const m = parts[1].padStart(2, "0");
      const d = parts[2].padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  return s;
}
