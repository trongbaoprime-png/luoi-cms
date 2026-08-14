/**
 * Meta Ads Daily Cron Background Daemon (07:00 AM Daily Sync)
 * Automatically triggers 365-day Meta Ads data sync into PostgreSQL DB every morning at 07:00 AM Asia/Ho_Chi_Minh.
 */

const fetch = require("node-fetch").default || globalThis.fetch;

const API_URL = process.env.META_CRON_URL || "http://127.0.0.1:3000/api/cron/meta-ads-daily?scope=sync&key=luoidonnha_cron_sync_2026";
let lastSyncedDate = "";

console.log("[MetaAds Daily Cron Worker] Background daemon active. Scheduled to run daily at 07:00 AM Asia/Ho_Chi_Minh...");

async function checkAndRunCron() {
  const now = new Date();
  const vnTimeString = now.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const todayStr = now.toISOString().split("T")[0];

  // Get current hour in Vietnam time zone
  const vnHourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "numeric",
    hour12: false,
  }).format(now);

  const currentHour = parseInt(vnHourStr, 10);

  // Trigger if it's 7 AM (or later) and hasn't run yet today
  if (currentHour >= 7 && lastSyncedDate !== todayStr) {
    console.log(`[MetaAds Daily Cron Worker] [${vnTimeString}] Triggering 07:00 AM automated 365-day sync...`);

    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: { "User-Agent": "MetaAds-Daily-Cron-Daemon/1.0" },
        timeout: 300000, // 5 min timeout for 365-day sync
      });

      if (res.ok) {
        const data = await res.json();
        lastSyncedDate = todayStr;
        console.log(`[MetaAds Daily Cron Worker] [${vnTimeString}] SUCCESS: ${data.data?.message || "Synced successfully"}`);
      } else {
        console.error(`[MetaAds Daily Cron Worker] [${vnTimeString}] HTTP Error: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error(`[MetaAds Daily Cron Worker] [${vnTimeString}] Cron execution failed:`, err.message || err);
    }
  }
}

// Check every 10 minutes
setInterval(checkAndRunCron, 10 * 60 * 1000);

// Initial check after 20 seconds startup delay
setTimeout(checkAndRunCron, 20000);
