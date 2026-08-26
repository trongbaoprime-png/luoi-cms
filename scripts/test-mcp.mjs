const baseUrl = process.env.MCP_TEST_URL || "http://127.0.0.1:3100/mcp";
const apiKey = process.env.MCP_API_KEY;

if (!apiKey) {
  console.error("MCP_API_KEY is required.");
  process.exit(2);
}

let nextId = 1;

async function rpc(method, params = {}) {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text}`);
  const body = text ? JSON.parse(text) : null;
  if (body?.error) throw new Error(JSON.stringify(body.error));
  return body?.result;
}

async function main() {
  const initialize = await rpc("initialize", {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo: { name: "luoi-mcp-smoke-test", version: "1.0.0" },
  });
  console.log("✅ initialize", initialize?.serverInfo || initialize);

  const tools = await rpc("tools/list");
  console.log(`✅ tools/list: ${tools?.tools?.length || 0} tools`);
  for (const tool of tools?.tools || []) console.log(`  - ${tool.name}`);

  const summary = await rpc("tools/call", {
    name: "analytics.crm_summary",
    arguments: {},
  });
  console.log("✅ analytics.crm_summary");
  console.log(JSON.stringify(summary?.structuredContent || summary, null, 2));
}

main().catch((err) => {
  console.error("❌ MCP smoke test failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
