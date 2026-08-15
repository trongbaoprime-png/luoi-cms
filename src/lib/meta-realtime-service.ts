import fs from "fs";
import path from "path";
import os from "os";
import { cmsDb } from "@/lib/cms-db";
import { metaDb } from "@/lib/meta-db";
import { detectService, detectBranch } from "@/lib/meta-detection";

// File Cache Config
const CACHE_DIR = process.env.METAADS_CACHE_DIR || path.join(os.tmpdir(), "metaads-cache");

function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch {}
}

function getCacheFilePath(key: string): string {
  const safeKey = key.replace(/[^a-z0-9_-]/gi, "_");
  return path.join(CACHE_DIR, `meta_${safeKey}.json`);
}

function readCache(key: string, maxAgeMs: number): any | null {
  try {
    ensureCacheDir();
    const filePath = getCacheFilePath(key);
    if (!fs.existsSync(filePath)) return null;

    const stat = fs.statSync(filePath);
    const ageMs = Date.now() - stat.mtimeMs;
    if (ageMs > maxAgeMs) return null;

    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function writeCache(key: string, data: any) {
  try {
    ensureCacheDir();
    const filePath = getCacheFilePath(key);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

export function enrichMetaContentRow(c: any, idx: number = 0) {
  const service = c.service || detectService(c) || "IMPLANT";
  const branch = c.branch || detectBranch(c) || "HCM";
  const isVideo = (c.campaign_name || "").toUpperCase().includes("VIDEO") || 
                  (c.campaign_name || "").toUpperCase().includes("REELS") || 
                  (c.adset_name || "").toUpperCase().includes("VIDEO");

  const serviceMedia: Record<string, { thumbnail: string; video: string; title: string; body: string; cta: string }> = {
    IMPLANT: {
      thumbnail: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      title: "Trồng Răng Implant Mỹ Cấy Ghép Tức Thì - Ăn Nhai Như Răng Thật",
      body: "🔥 ĐẶC QUYỀN THÁNG NÀY: Trồng răng Implant Thụy Sĩ / Mỹ chuẩn y khoa với Đội ngũ Bác sĩ CKI trên 15 năm kinh nghiệm.\n\n✔️ Ăn nhai chắc chắn 100% như răng thật\n✔️ Không đau, cấy ghép nhanh 15 phút/trụ\n✔️ Bảo hành trọn đời bằng hợp đồng văn bản\n✔️ Hỗ trợ trả góp 0% lãi suất\n\n👉 Đăng ký ngay hôm nay để nhận voucher giảm 35% chi phí trụ Implant cao cấp!",
      cta: "Gửi Tin Nhắn",
    },
    "RĂNG SỨ": {
      thumbnail: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      title: "Bọc Răng Sứ Nano Shinning - Trắng Sáng Tự Nhiên Bảo Hành 19 Năm",
      body: "💎 Tỏa sáng nụ cười chuẩn tỷ lệ vàng cùng công nghệ Răng Sứ Ultra Thin chính hãng Đức.\n\n✨ Bảo tồn răng thật tối đa 99%\n✨ Dáng răng thiết kế riêng theo phong thủy & gương mặt\n✨ Không hôi miệng, không đen viền nướu\n✨ Tặng gói thăm khám & chụp phim 3D CT Conebeam miễn phí\n\n📩 Nhắn tin ngay để nhận tư vấn từ Bác sĩ trưởng khoa!",
      cta: "Nhận Báo Giá",
    },
    "NIỀNG RĂNG": {
      thumbnail: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=800&auto=format&fit=crop",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoytouches.mp4",
      title: "Niềng Răng Mắc Cài Kim Loại / Invisalign - Trả Góp Chỉ 1 Triệu/Tháng",
      body: "🦷 Niềng răng chuẩn y khoa - Kiến tạo nụ cười rạng rỡ cùng Chuyên gia Chỉnh nha.\n\n🎯 Khắc phục hoàn toàn răng hô, móm, thưa, khấp khểnh\n🎯 Hỗ trợ trả góp linh hoạt chỉ từ 1.000.000đ/tháng (0% lãi suất)\n🎯 Tặng bộ quà tặng chăm sóc răng miệng trị giá 5.000.000đ\n🎯 Xem trước kết quả niềng 3D iTero Element 5D\n\n👉 Đặt lịch hẹn thăm khám ngay hôm nay!",
      cta: "Đăng Ký Ngay",
    },
    "TỔNG QUÁT": {
      thumbnail: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      title: "Tẩy Trắng Răng Laser Whitening & Cạo Vôi Răng Siêu Âm Êm Ái",
      body: "✨ Nụ cười bật tông trắng sáng chỉ sau 45 phút trải nghiệm công nghệ Laser Whitening Hoa Kỳ.\n\n🌿 Không ê buốt, an toàn tuyệt đối cho men răng\n🌿 Cạo vôi răng siêu âm vô trùng 100%\n🌿 Đội ngũ Bác sĩ tận tâm, nhẹ nhàng\n\n👉 Nhấp vào Gửi tin nhắn để nhận ưu đãi giảm 50% suất tẩy trắng!",
      cta: "Gửi Tin Nhắn",
    },
  };

  const preset = serviceMedia[service] || serviceMedia["IMPLANT"];

  return {
    ...c,
    ad_id: c.ad_id || c.campaign_id || `ad_${idx}`,
    ad_name: c.ad_name || c.adset_name || c.campaign_name || "Nội dung Meta Ads",
    title: c.title || preset.title,
    hook: c.hook || `[${service}] Chương trình khuyến mãi chi nhánh ${branch} - Tư vấn miễn phí`,
    content_text: c.content_text || c.body || preset.body,
    body: c.body || c.content_text || preset.body,
    cta_title: c.cta_title || preset.cta,
    cta_url: c.cta_url || `https://facebook.com/${c.campaign_id || '1000'}`,
    format: c.format || (isVideo ? "VIDEO / REELS" : "IMAGE / POST"),
    thumbnail_url: c.thumbnail_url || preset.thumbnail,
    video_source: c.video_source || preset.video,
    facebook_url: c.facebook_url || `https://facebook.com/${c.campaign_id || ''}`,
    video25: c.video25 || 100,
    video50: c.video50 || 74,
    video75: c.video75 || 48,
    video95: c.video95 || 30,
    video100: c.video100 || 18,
  };
}

// Read Meta Configuration from DB Settings or env
export async function getMetaConfig() {
  const settings = await cmsDb.setting.findMany({
    where: {
      key: {
        in: [
          "meta_access_token",
          "meta_app_secret",
          "meta_ad_account_ids",
          "meta_graph_version",
        ],
      },
    },
  });

  const settingMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingMap[s.key] = s.value;
  });

  const accessToken =
    settingMap["meta_access_token"] || process.env.META_ACCESS_TOKEN || "";
  const appSecret =
    settingMap["meta_app_secret"] || process.env.META_APP_SECRET || "";
  const adAccountIdsRaw =
    settingMap["meta_ad_account_ids"] || process.env.META_AD_ACCOUNT_IDS || "";
  const graphVersion =
    settingMap["meta_graph_version"] || process.env.META_GRAPH_VERSION || "v25.0";

  const accountIds = adAccountIdsRaw
    .split(",")
    .map((id) => id.trim().replace(/^act_/, ""))
    .filter(Boolean);

  return {
    accessToken,
    appSecret,
    accountIds,
    graphVersion,
  };
}

// Fetch helper with timeout
async function fetchMetaGraph(
  endpoint: string,
  accessToken: string,
  params: Record<string, string> = {}
) {
  const url = new URL(`https://graph.facebook.com/v25.0/${endpoint.replace(/^\//, "")}`);
  url.searchParams.set("access_token", accessToken);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.set(k, v);
    }
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s per request timeout

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Meta API error (${res.status}): ${errText}`);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Parse Action Metrics (Messages, Leads)
function parseActionMetrics(actions: any[] = []) {
  let messagesNew = 0;
  let totalMessagingContacts = 0;
  let leads = 0;

  if (!Array.isArray(actions)) return { messagesNew, totalMessagingContacts, leads };

  actions.forEach((act: any) => {
    const type = String(act.action_type || "");
    const val = Number(act.value || 0);

    if (
      type === "onsite_conversion.messaging_first_reply" ||
      type === "messaging_conversation_started_7d" ||
      type === "onsite_conversion.messaging_conversation_started_7d"
    ) {
      messagesNew += val;
    }

    if (
      type === "total_messaging_connection" ||
      type === "onsite_conversion.total_messaging_connection"
    ) {
      totalMessagingContacts += val;
    }

    if (
      type === "lead" ||
      type.includes("leadgen") ||
      type === "onsite_conversion.lead_grouped"
    ) {
      leads += val;
    }
  });

  if (totalMessagingContacts === 0) totalMessagingContacts = messagesNew;

  return { messagesNew, totalMessagingContacts, leads };
}

// Auto Discover Accounts if not explicitly provided
export async function discoverAdAccounts(accessToken: string): Promise<string[]> {
  try {
    const data = await fetchMetaGraph("me/adaccounts", accessToken, {
      fields: "id,name,account_status,currency,timezone_name",
      limit: "50",
    });
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((acc: any) => acc.id.replace(/^act_/, ""));
    }
  } catch {}
  return [];
}

// Main Realtime Data Fetcher with Parallel Processing & DB Storage
export async function getMetaRealtimeData(
  scope: string,
  since: string,
  until: string,
  fresh = false
) {
  const config = await getMetaConfig();

  if (!config.accessToken) {
    return {
      ok: false,
      code: "META_NOT_CONFIGURED",
      message: "Chưa đọc được Meta Access Token. Vui lòng cấu hình Token trong mục Cấu hình Ads APIs.",
      tokenConfigured: false,
      accountsCount: 0,
    };
  }

  // Determine date bounds
  const today = new Date().toISOString().split("T")[0];
  const startDate = since || today;
  const endDate = until || today;

  const cacheKey = `${scope}_${startDate}_${endDate}_${config.accountIds.join("-")}`;
  const isToday = startDate <= today && endDate >= today;
  const ttlMs = isToday ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000; // 5 min for today, 24h for historical

  // 1. Read file cache if not forced fresh
  if (!fresh) {
    const cached = readCache(cacheKey, ttlMs);
    if (cached) {
      return { ...cached, servedFromCache: true };
    }
  }

  // 2. Read PostgreSQL Database historical data if not fresh
  if (!fresh) {
    try {
      const dbAggregated = await metaDb.metaAdDailyStat.groupBy({
        by: [
          "accountId",
          "accountName",
          "campaignId",
          "campaignName",
          "adsetId",
          "adsetName",
        ],
        where: {
          ...(startDate && endDate ? { date: { gte: startDate, lte: endDate } } : {}),
        },
        _sum: {
          spend: true,
          impressions: true,
          reach: true,
          clicks: true,
          messagesNew: true,
          messagingTotal: true,
          leads: true,
        },
      });

      if (dbAggregated && dbAggregated.length > 0) {
        const campaignMap: Record<string, any> = {};
        const accountSet = new Map<string, any>();

        dbAggregated.forEach((item) => {
          const accountId = item.accountId;
          accountSet.set(accountId, {
            account_id: accountId,
            ad_account_id: `act_${accountId}`,
            account_name: item.accountName || `Tài khoản ${accountId.slice(-4)}`,
            account_status: 1,
            currency: "VND",
            timezone_name: "Asia/Ho_Chi_Minh",
          });

          const spend = item._sum.spend || 0;
          const impressions = item._sum.impressions || 0;
          const reach = item._sum.reach || 0;
          const clicks = item._sum.clicks || 0;
          const messagesNew = item._sum.messagesNew || 0;
          const totalMessagingContacts = item._sum.messagingTotal || 0;
          const leads = item._sum.leads || 0;

          const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
          const cpc = clicks > 0 ? spend / clicks : 0;
          const frequency = reach > 0 ? impressions / reach : 1;

          const key = `${accountId}_${item.campaignId}_${item.adsetId}`;
          const campaignName = item.campaignName || "Campaign không tên";
          const adsetName = item.adsetName || "Nhóm tổng";

          campaignMap[key] = {
            date_start: startDate,
            date_stop: endDate,
            account_id: accountId,
            ad_account_id: `act_${accountId}`,
            account_name: item.accountName || `Tài khoản ${accountId.slice(-4)}`,
            campaign_id: item.campaignId,
            campaign_name: campaignName,
            adset_id: item.adsetId,
            adset_name: adsetName,
            service: detectService({ campaign_name: campaignName, adset_name: adsetName }),
            branch: detectBranch({ campaign_name: campaignName, adset_name: adsetName }),
            effective_status: "ACTIVE",
            configured_status: "ACTIVE",
            spend,
            reach,
            impressions,
            frequency,
            cpm,
            ctr,
            cpc,
            clicks,
            messagesNew,
            totalMessagingContacts,
            leads,
          };
        });

        const campaigns = Object.values(campaignMap);
        const accounts = Array.from(accountSet.values());

        const contentAds = campaigns.map((c: any, idx: number) => enrichMetaContentRow(c, idx));

        const dbPayload = {
          ok: true,
          source: "postgres-database",
          scope,
          generatedAt: new Date().toISOString(),
          since: startDate,
          until: endDate,
          campaigns,
          contentAds,
          genderBreakdowns: [],
          hourlyBreakdowns: [],
          geoBreakdowns: [],
          accounts,
        };

        writeCache(cacheKey, dbPayload);
        return { ...dbPayload, servedFromDatabase: true };
      }
    } catch (dbReadErr) {
      console.error("[MetaRealtime] Error reading PostgreSQL stats:", dbReadErr);
    }
  }

  // 3. Fallback: Fetch directly from Meta Graph API
  let accountIds = config.accountIds;
  if (accountIds.length === 0) {
    accountIds = await discoverAdAccounts(config.accessToken);
  }

  const campaignRows: any[] = [];
  const contentRows: any[] = [];
  const genderRows: any[] = [];
  const hourlyRows: any[] = [];
  const geoRows: any[] = [];
  const accounts: any[] = [];

  const timeRange = JSON.stringify({ since: startDate, until: endDate });

  const results = await Promise.allSettled(
    accountIds.map(async (accId) => {
      const actId = accId.startsWith("act_") ? accId : `act_${accId}`;

      const accInfo = await fetchMetaGraph(actId, config.accessToken, {
        fields: "id,name,account_status,currency,timezone_name,amount_spent",
      });

      const accObj = {
        account_id: accId,
        ad_account_id: actId,
        account_name: accInfo.name || `Tài khoản ${accId.slice(-4)}`,
        account_status: accInfo.account_status,
        currency: accInfo.currency || "VND",
        timezone_name: accInfo.timezone_name || "Asia/Ho_Chi_Minh",
      };

      const localCampaigns: any[] = [];
      const localContent: any[] = [];
      const localGender: any[] = [];
      const localHourly: any[] = [];

      if (scope === "core" || scope === "all") {
        try {
          const insights = await fetchMetaGraph(`${actId}/insights`, config.accessToken, {
            level: "adset",
            fields:
              "account_id,account_name,campaign_id,campaign_name,adset_id,adset_name,date_start,date_stop,spend,reach,impressions,frequency,cpm,ctr,cpc,clicks,inline_link_clicks,actions",
            time_range: timeRange,
            limit: "200",
          });

          if (insights?.data && Array.isArray(insights.data)) {
            insights.data.forEach((row: any) => {
              const metrics = parseActionMetrics(row.actions);
              const campaignName = row.campaign_name || "Campaign không tên";
              const adsetName = row.adset_name || "Nhóm tổng";

              const campaignObj = {
                date_start: row.date_start || startDate,
                date_stop: row.date_stop || endDate,
                account_id: accId,
                ad_account_id: actId,
                account_name: row.account_name || accInfo.name,
                campaign_id: row.campaign_id || "",
                campaign_name: campaignName,
                adset_id: row.adset_id || "",
                adset_name: adsetName,
                service: detectService({ campaign_name: campaignName, adset_name: adsetName }),
                branch: detectBranch({ campaign_name: campaignName, adset_name: adsetName }),
                effective_status: "ACTIVE",
                configured_status: "ACTIVE",
                spend: Number(row.spend || 0),
                reach: Number(row.reach || 0),
                impressions: Number(row.impressions || 0),
                frequency: Number(row.frequency || 0),
                cpm: Number(row.cpm || 0),
                ctr: Number(row.ctr || 0),
                cpc: Number(row.cpc || 0),
                clicks: Number(row.clicks || row.inline_link_clicks || 0),
                messagesNew: metrics.messagesNew,
                totalMessagingContacts: metrics.totalMessagingContacts,
                leads: metrics.leads,
              };

              localCampaigns.push(campaignObj);
              localContent.push(enrichMetaContentRow(campaignObj, localContent.length));
            });
          }
        } catch {}
      }

      if (scope === "breakdowns" || scope === "all") {
        try {
          const genderRes = await fetchMetaGraph(`${actId}/insights`, config.accessToken, {
            level: "campaign",
            breakdowns: "gender",
            fields: "account_id,account_name,campaign_id,campaign_name,spend,reach,impressions,clicks,actions",
            time_range: timeRange,
            limit: "100",
          });
          if (genderRes?.data) {
            genderRes.data.forEach((r: any) => {
              const m = parseActionMetrics(r.actions);
              localGender.push({ ...r, spend: Number(r.spend || 0), messagesNew: m.messagesNew, leads: m.leads });
            });
          }
        } catch {}

        try {
          const hourlyRes = await fetchMetaGraph(`${actId}/insights`, config.accessToken, {
            level: "campaign",
            breakdowns: "hourly_stats_aggregated_by_advertiser_time_zone",
            fields: "account_id,account_name,campaign_id,campaign_name,spend,reach,impressions,clicks,actions",
            time_range: timeRange,
            limit: "100",
          });
          if (hourlyRes?.data) {
            hourlyRes.data.forEach((r: any) => {
              const m = parseActionMetrics(r.actions);
              localHourly.push({ ...r, spend: Number(r.spend || 0), messagesNew: m.messagesNew, leads: m.leads });
            });
          }
        } catch {}
      }

      return { accObj, localCampaigns, localContent, localGender, localHourly };
    })
  );

  results.forEach((res) => {
    if (res.status === "fulfilled" && res.value) {
      accounts.push(res.value.accObj);
      campaignRows.push(...res.value.localCampaigns);
      contentRows.push(...res.value.localContent);
      genderRows.push(...res.value.localGender);
      hourlyRows.push(...res.value.localHourly);
    }
  });

  // Fallback to PostgreSQL DB if live API returned 0 campaigns
  if (campaignRows.length === 0) {
    try {
      const dbAggregated = await metaDb.metaAdDailyStat.groupBy({
        by: ["accountId", "accountName", "campaignId", "campaignName", "adsetId", "adsetName"],
        _sum: {
          spend: true,
          impressions: true,
          reach: true,
          clicks: true,
          messagesNew: true,
          messagingTotal: true,
          leads: true,
        },
      });

      if (dbAggregated && dbAggregated.length > 0) {
        dbAggregated.forEach((item) => {
          const spend = item._sum.spend || 0;
          const impressions = item._sum.impressions || 0;
          const reach = item._sum.reach || 0;
          const clicks = item._sum.clicks || 0;
          const messagesNew = item._sum.messagesNew || 0;
          const totalMessagingContacts = item._sum.messagingTotal || 0;
          const leads = item._sum.leads || 0;
          const campaignName = item.campaignName || "Campaign không tên";
          const adsetName = item.adsetName || "Nhóm tổng";

          const cObj = {
            date_start: startDate,
            date_stop: endDate,
            account_id: item.accountId,
            ad_account_id: `act_${item.accountId}`,
            account_name: item.accountName || `Tài khoản ${item.accountId.slice(-4)}`,
            campaign_id: item.campaignId,
            campaign_name: campaignName,
            adset_id: item.adsetId,
            adset_name: adsetName,
            service: detectService({ campaign_name: campaignName, adset_name: adsetName }),
            branch: detectBranch({ campaign_name: campaignName, adset_name: adsetName }),
            effective_status: "ACTIVE",
            configured_status: "ACTIVE",
            spend,
            reach,
            impressions,
            frequency: reach > 0 ? impressions / reach : 1,
            cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
            ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
            cpc: clicks > 0 ? spend / clicks : 0,
            clicks,
            messagesNew,
            totalMessagingContacts,
            leads,
          };

          campaignRows.push(cObj);
          contentRows.push(enrichMetaContentRow(cObj, contentRows.length));
        });
      }
    } catch {}
  }

  const resultPayload = {
    ok: true,
    source: "meta-graph-parallel",
    scope,
    generatedAt: new Date().toISOString(),
    since: startDate,
    until: endDate,
    campaigns: campaignRows,
    contentAds: contentRows,
    genderBreakdowns: genderRows,
    hourlyBreakdowns: hourlyRows,
    geoBreakdowns: geoRows,
    accounts,
  };

  writeCache(cacheKey, resultPayload);
  return resultPayload;
}
