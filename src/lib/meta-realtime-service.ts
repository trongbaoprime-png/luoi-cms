import fs from "fs";
import path from "path";
import os from "os";
import { db } from "@/lib/db";

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

function readCache(key: string, ttlMs: number): any | null {
  try {
    ensureCacheDir();
    const filePath = getCacheFilePath(key);
    if (!fs.existsSync(filePath)) return null;

    const stat = fs.statSync(filePath);
    const ageMs = Date.now() - stat.mtimeMs;
    if (ageMs > ttlMs) return null;

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

// Read Meta Configuration from DB Settings or env
export async function getMetaConfig() {
  const settings = await db.setting.findMany({
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
  const timeoutId = setTimeout(() => controller.abort(), 15000);

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

// Main Realtime Data Fetcher
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
  const ttlMs = isToday ? 5 * 60 * 1000 : 60 * 60 * 1000; // 5 min for today, 1h for historical

  // Read cache if not forced fresh
  if (!fresh) {
    const cached = readCache(cacheKey, ttlMs);
    if (cached) {
      return { ...cached, servedFromCache: true };
    }
  }

  // Auto-discover accounts if empty
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

  for (const accId of accountIds) {
    const actId = accId.startsWith("act_") ? accId : `act_${accId}`;

    try {
      // 1. Fetch Account Info
      const accInfo = await fetchMetaGraph(actId, config.accessToken, {
        fields: "id,name,account_status,currency,timezone_name,amount_spent",
      });

      accounts.push({
        account_id: accId,
        ad_account_id: actId,
        account_name: accInfo.name || `Tài khoản ${accId.slice(-4)}`,
        account_status: accInfo.account_status,
        currency: accInfo.currency || "VND",
        timezone_name: accInfo.timezone_name || "Asia/Ho_Chi_Minh",
      });

      // 2. Fetch Core Insights (Adsets & Campaigns)
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
              campaignRows.push({
                date_start: row.date_start || startDate,
                date_stop: row.date_stop || endDate,
                account_id: accId,
                ad_account_id: actId,
                account_name: row.account_name || accInfo.name,
                campaign_id: row.campaign_id || "",
                campaign_name: row.campaign_name || "Campaign không tên",
                adset_id: row.adset_id || "",
                adset_name: row.adset_name || "Nhóm tổng",
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
              });
            });
          }
        } catch (e) {
          console.error(`Core insights fetch error for ${actId}:`, e);
        }
      }

      // 3. Fetch Breakdowns (Gender, Hourly, Geo)
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
              genderRows.push({ ...r, spend: Number(r.spend || 0), messagesNew: m.messagesNew, leads: m.leads });
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
              hourlyRows.push({ ...r, spend: Number(r.spend || 0), messagesNew: m.messagesNew, leads: m.leads });
            });
          }
        } catch {}
      }
    } catch (err: any) {
      console.error(`Error processing account ${accId}:`, err);
    }
  }

  const resultPayload = {
    ok: true,
    source: "meta-graph-direct",
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

  // Cache in background file cache
  writeCache(cacheKey, resultPayload);

  return resultPayload;
}
