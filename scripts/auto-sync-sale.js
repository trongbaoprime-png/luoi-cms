const http = require("http");

console.log("[Auto-Sync-Sale] Periodic Google Sheet 'SALE' sync background worker started.");

async function triggerSync() {
  const timestamp = new Date().toISOString();
  console.log(`[Auto-Sync-Sale] [${timestamp}] Running scheduled sync for 'SALE' sheet (Qualify leads)...`);
  
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 3000,
        path: "/api/crm/auto-sync",
        method: "GET",
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          console.log(`[Auto-Sync-Sale] HTTP ${res.statusCode} Response:`, body.substring(0, 250));
          resolve();
        });
      }
    );
    req.on("error", (err) => {
      console.error("[Auto-Sync-Sale] Connection error:", err.message);
      resolve();
    });
    req.end();
  });
}

// Run immediately on boot
triggerSync();

// Repeat every 5 minutes (300,000 ms)
setInterval(triggerSync, 5 * 60 * 1000);
