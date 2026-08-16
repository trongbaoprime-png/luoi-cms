import { NextRequest, NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";
import { metaDb } from "@/lib/meta-db";
import { crmDb } from "@/lib/crm-db";
import { cmsDb } from "@/lib/cms-db";

export const dynamic = "force-dynamic";

export interface DynamicResourceItem {
  id: string;
  name: string;
  countLabel: string;
  excluded: boolean;
  statusText: string;
  extraInfo?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get("module") || "ALL";

    const result: Record<string, DynamicResourceItem[]> = {
      OMNICHANNEL: [],
      META_ADS: [],
      CRM_LEADS: [],
      SEO_INDEXING: [],
    };

    // 1. Fetch REAL Omnichannel Fanpages
    if (module === "ALL" || module === "OMNICHANNEL") {
      const realPages = await omniDb.omniFanpage.findMany({
        select: {
          pageId: true,
          pageName: true,
          isActive: true,
          _count: { select: { conversations: true } },
        },
        orderBy: { pageName: "asc" },
      });

      result.OMNICHANNEL = realPages.map((p) => ({
        id: p.pageId,
        name: p.pageName || `Fanpage ${p.pageId}`,
        countLabel: `Page ID: ${p.pageId} • ${p._count.conversations} hội thoại`,
        excluded: !p.isActive,
        statusText: p.isActive ? "sẽ đồng bộ" : "excluded — Tạm ngưng",
        extraInfo: `${p._count.conversations} hội thoại`,
      }));
    }

    // 2. Fetch REAL Meta Ad Accounts
    if (module === "ALL" || module === "META_ADS") {
      const realAccounts = await metaDb.metaAdAccount.findMany({
        select: {
          accountId: true,
          accountName: true,
          currency: true,
          isActive: true,
          _count: { select: { campaigns: true, dailyStats: true } },
        },
        orderBy: { accountName: "asc" },
      });

      result.META_ADS = realAccounts.map((acc) => ({
        id: acc.accountId,
        name: acc.accountName || `Tài khoản Ads ${acc.accountId}`,
        countLabel: `ID: ${acc.accountId} • ${acc._count.campaigns} campaigns • ${acc._count.dailyStats} ngày stats`,
        excluded: !acc.isActive,
        statusText: acc.isActive ? "sẽ đồng bộ" : "excluded — Không kích hoạt",
        extraInfo: `${acc._count.campaigns} campaigns`,
      }));
    }

    // 3. Fetch REAL miniCRM Branches & Pipelines
    if (module === "ALL" || module === "CRM_LEADS") {
      const realBranches = await crmDb.cRMLead.groupBy({
        by: ["branch"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      });

      result.CRM_LEADS = realBranches.map((b) => {
        const branchName = b.branch || "Chưa phân loại chi nhánh";
        return {
          id: `branch_${encodeURIComponent(branchName)}`,
          name: `Chi nhánh ${branchName}`,
          countLabel: `${b._count.id.toLocaleString("vi-VN")} khách hàng tiềm năng`,
          excluded: false,
          statusText: "sẽ đồng bộ",
          extraInfo: `${b._count.id} leads`,
        };
      });
    }

    // 4. Fetch REAL SEO Posts & Pages
    if (module === "ALL" || module === "SEO_INDEXING") {
      const realPosts = await cmsDb.post.findMany({
        select: { id: true, title: true, slug: true, status: true },
        take: 30,
        orderBy: { updatedAt: "desc" },
      });

      const realPages = await cmsDb.page.findMany({
        select: { id: true, title: true, slug: true },
        take: 30,
      });

      result.SEO_INDEXING = [
        ...realPosts.map((p) => ({
          id: `post_${p.id}`,
          name: `[Bài viết] ${p.title}`,
          countLabel: `Slug: /blog/${p.slug} • Trạng thái: ${p.status}`,
          excluded: false,
          statusText: "sẽ đồng bộ",
        })),
        ...realPages.map((pg) => ({
          id: `page_${pg.id}`,
          name: `[Trang Builder] ${pg.title}`,
          countLabel: `Slug: /${pg.slug}`,
          excluded: false,
          statusText: "sẽ đồng bộ",
        })),
      ];
    }

    return NextResponse.json({
      success: true,
      data: module === "ALL" ? result : result[module] || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi truy vấn danh sách tài nguyên thực tế",
      },
      { status: 500 }
    );
  }
}
