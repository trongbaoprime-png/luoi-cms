/**
 * miniCRM Auto-Sync Background Daemon
 * Periodically syncs Google Sheets (current and previous month) into local database every 5 minutes.
 */

const fetch = require("node-fetch").default || globalThis.fetch;

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const API_URL = process.env.CRM_AUTO_SYNC_URL || "http://127.0.0.1:3000/api/crm/auto-sync?key=luoidonnha_cron_sync_2026";

console.log("[miniCRM Sync Worker] Started. Polling every 5 minutes...");

async function runSync() {
  const timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  console.log(`[miniCRM Sync Worker] [${timestamp}] Starting automated sync cycle...`);

  try {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: { "User-Agent": "miniCRM-Sync-Daemon/1.0" },
      timeout: 60000,
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[miniCRM Sync Worker] [${timestamp}] SUCCESS: ${data.message || "Synced successfully"}`);
    } else {
      console.error(`[miniCRM Sync Worker] [${timestamp}] HTTP Error: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error(`[miniCRM Sync Worker] [${timestamp}] Sync failed:`, err.message || err);
  }
}

// Initial run after 15 seconds to allow Next.js to start
setTimeout(() => {
  runSync();
  setInterval(runSync, SYNC_INTERVAL_MS);
}, 15000);
