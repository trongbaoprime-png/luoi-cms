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

  const now = new Date();
  const endDateStr = now.toISOString().split("T")[0];

  const startDateObj = new Date(now);
  startDateObj.setDate(startDateObj.getDate() - daysToSync);
  const startDateStr = startDateObj.toISOString().split("T")[0];

  console.log(`[Meta365Sync] Starting ${daysToSync}-day sync from ${startDateStr} to ${endDateStr} for ${accountIds.length} accounts...`);

  let totalRecordsSaved = 0;
  const accountSummaries: Record<string, number> = {};

  // Process all accounts in parallel batches
  await Promise.allSettled(
    accountIds.map(async (accId) => {
      const actId = accId.startsWith("act_") ? accId : `act_${accId}`;

      try {
        const url = new URL(`https://graph.facebook.com/v25.0/${actId}/insights`);
        url.searchParams.set("access_token", config.accessToken);
        url.searchParams.set("level", "adset");
        url.searchParams.set(
          "fields",
          "account_id,account_name,campaign_id,campaign_name,adset_id,adset_name,date_start,date_stop,spend,reach,impressions,cpm,ctr,cpc,clicks,actions"
        );
        url.searchParams.set("time_range", JSON.stringify({ since: startDateStr, until: endDateStr }));
        url.searchParams.set("time_increment", "1"); // Daily level breakdown
        url.searchParams.set("limit", "500");

        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[Meta365Sync] Error fetching account ${actId}:`, errText);
          return;
        }

        const data = await res.json();
        const rows = data.data || [];
        let accSaved = 0;

        for (const row of rows) {
          const date = row.date_start;
          if (!date) continue;

          const metrics = parseActionMetrics(row.actions);
          const campaignId = row.campaign_id || "unknown";
          const adsetId = row.adset_id || "";

          try {
            await db.metaAdDailyStat.upsert({
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
            accSaved++;
          } catch (dbErr) {
            console.error(`[Meta365Sync] DB Upsert error:`, dbErr);
          }
        }

        accountSummaries[accId] = accSaved;
        totalRecordsSaved += accSaved;
      } catch (err: any) {
        console.error(`[Meta365Sync] Failed to process account ${actId}:`, err.message);
      }
    })
  );

  return {
    ok: true,
    message: `Đồng bộ thành công ${totalRecordsSaved} bản ghi dữ liệu Meta Ads (${daysToSync} ngày qua) vào PostgreSQL Database!`,
    daysSynced: daysToSync,
    startDate: startDateStr,
    endDate: endDateStr,
    totalRecordsSaved,
    accountsCount: accountIds.length,
    accountSummaries,
  };
}
