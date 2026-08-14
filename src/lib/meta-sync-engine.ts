import { db } from "@/lib/db";
import { getMetaConfig, discoverAdAccounts } from "@/lib/meta-realtime-service";

interface SyncOptions {
  days?: number; // Default 365
}

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

// Split total days into 30-day chunks for memory safety
function getChunkedDateRanges(daysToSync: number): Array<{ since: string; until: string }> {
  const ranges: Array<{ since: string; until: string }> = [];
  const chunkSize = 30;
  const now = new Date();

  for (let offset = 0; offset < daysToSync; offset += chunkSize) {
    const untilDate = new Date(now);
    untilDate.setDate(untilDate.getDate() - offset);

    const sinceDate = new Date(now);
    const sinceDays = Math.min(offset + chunkSize - 1, daysToSync - 1);
    sinceDate.setDate(sinceDate.getDate() - sinceDays);

    ranges.push({
      since: sinceDate.toISOString().split("T")[0],
      until: untilDate.toISOString().split("T")[0],
    });
  }
  return ranges;
}

// Batch upsert stats to PostgreSQL using $transaction (chunk size 50)
async function batchUpsertStats(rows: any[], accId: string): Promise<number> {
  if (!rows || rows.length === 0) return 0;
  let savedCount = 0;
  const BATCH_SIZE = 50;

  const upsertOps = rows
    .map((row) => {
      const date = row.date_start;
      if (!date) return null;

      const metrics = parseActionMetrics(row.actions);
      const campaignId = row.campaign_id || "unknown";
      const adsetId = row.adset_id || "";

      return db.metaAdDailyStat.upsert({
        where: {
          meta_daily_stat_key: {
            date,
            accountId: accId,
            campaignId,
            adsetId,
          },
        },
        create: {
          date,
          accountId: accId,
          accountName: row.account_name || "",
          campaignId,
          campaignName: row.campaign_name || "",
          adsetId,
          adsetName: row.adset_name || "",
          spend: Number(row.spend || 0),
          impressions: Number(row.impressions || 0),
          reach: Number(row.reach || 0),
          clicks: Number(row.clicks || 0),
          cpm: Number(row.cpm || 0),
          ctr: Number(row.ctr || 0),
          cpc: Number(row.cpc || 0),
          messagesNew: metrics.messagesNew,
          messagingTotal: metrics.totalMessagingContacts,
          leads: metrics.leads,
        },
        update: {
          accountName: row.account_name || "",
          campaignName: row.campaign_name || "",
          adsetName: row.adset_name || "",
          spend: Number(row.spend || 0),
          impressions: Number(row.impressions || 0),
          reach: Number(row.reach || 0),
          clicks: Number(row.clicks || 0),
          cpm: Number(row.cpm || 0),
          ctr: Number(row.ctr || 0),
          cpc: Number(row.cpc || 0),
          messagesNew: metrics.messagesNew,
          messagingTotal: metrics.totalMessagingContacts,
          leads: metrics.leads,
          updatedAt: new Date(),
        },
      });
    })
    .filter(Boolean) as any[];

  for (let i = 0; i < upsertOps.length; i += BATCH_SIZE) {
    const chunk = upsertOps.slice(i, i + BATCH_SIZE);
    try {
      await db.$transaction(chunk);
      savedCount += chunk.length;
    } catch {
      for (const op of chunk) {
        try {
          if (op) {
            await op;
            savedCount++;
          }
        } catch {}
      }
    }
  }

  return savedCount;
}

export async function syncMetaAds365Days(options: SyncOptions = {}) {
  const daysToSync = options.days || 365;
  const config = await getMetaConfig();

  if (!config.accessToken) {
    return {
      ok: false,
      message: "Chưa cấu hình Access Token. Vui lòng nhập Token trong Cấu hình Ads APIs.",
    };
  }

  let accountIds = config.accountIds;
  if (accountIds.length === 0) {
    accountIds = await discoverAdAccounts(config.accessToken);
  }

  if (accountIds.length === 0) {
    return {
      ok: false,
      message: "Không tìm thấy tài khoản quảng cáo Meta nào.",
    };
  }

  const dateRanges = getChunkedDateRanges(daysToSync);
  const startDateStr = dateRanges[dateRanges.length - 1].since;
  const endDateStr = dateRanges[0].until;

  console.log(`[Meta365Sync] Starting optimized ${daysToSync}-day sync in ${dateRanges.length} date chunks for ${accountIds.length} accounts...`);

  let totalRecordsSaved = 0;
  const accountSummaries: Record<string, number> = {};

  // Process accounts with limited concurrency (max 2 at a time) to prevent CPU spikes
  const CONCURRENCY = 2;
  for (let i = 0; i < accountIds.length; i += CONCURRENCY) {
    const batchAccounts = accountIds.slice(i, i + CONCURRENCY);

    await Promise.allSettled(
      batchAccounts.map(async (accId) => {
        const actId = accId.startsWith("act_") ? accId : `act_${accId}`;
        let accTotalSaved = 0;

        for (const range of dateRanges) {
          try {
            let nextUrl: string | null = `https://graph.facebook.com/v25.0/${actId}/insights?access_token=${encodeURIComponent(config.accessToken)}&level=adset&fields=account_id,account_name,campaign_id,campaign_name,adset_id,adset_name,date_start,date_stop,spend,reach,impressions,cpm,ctr,cpc,clicks,actions&time_range=${encodeURIComponent(JSON.stringify(range))}&time_increment=1&limit=500`;

            while (nextUrl) {
              const res: Response = await fetch(nextUrl, {
                headers: { Accept: "application/json" },
              });

              if (!res.ok) {
                const errText = await res.text();
                console.error(`[Meta365Sync] Error fetching account ${actId} range ${range.since}-${range.until}:`, errText);
                break;
              }

              const data: any = await res.json();
              const rows = data.data || [];
              const saved = await batchUpsertStats(rows, accId);
              accTotalSaved += saved;

              nextUrl = data.paging?.next || null;
            }
          } catch (err: any) {
            console.error(`[Meta365Sync] Failed chunk ${range.since}-${range.until} for account ${actId}:`, err.message);
          }
        }

        accountSummaries[accId] = (accountSummaries[accId] || 0) + accTotalSaved;
        totalRecordsSaved += accTotalSaved;
      })
    );
  }

  const syncTimestamp = new Date().toISOString();
  const summaryPayload = {
    ok: true,
    message: `Đồng bộ thành công ${totalRecordsSaved} bản ghi dữ liệu Meta Ads (${daysToSync} ngày qua) vào PostgreSQL Database!`,
    daysSynced: daysToSync,
    startDate: startDateStr,
    endDate: endDateStr,
    totalRecordsSaved,
    accountsCount: accountIds.length,
    accountSummaries,
    lastSyncedAt: syncTimestamp,
  };

  try {
    await db.setting.upsert({
      where: { key: "meta_last_daily_sync" },
      create: { key: "meta_last_daily_sync", value: JSON.stringify(summaryPayload) },
      update: { value: JSON.stringify(summaryPayload), updatedAt: new Date() },
    });
  } catch (err) {
    console.error("[Meta365Sync] Failed to save sync timestamp setting:", err);
  }

  return summaryPayload;
}

export async function getLastMetaSyncInfo() {
  try {
    const setting = await db.setting.findUnique({
      where: { key: "meta_last_daily_sync" },
    });
    if (setting && setting.value) {
      return JSON.parse(setting.value);
    }
  } catch {}
  return null;
}
