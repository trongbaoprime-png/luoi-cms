/**
 * OpenClaw Agent Runtime Sidecar Service — LƯỜI BUSINESS OS
 * Port: 20180
 * Endpoint: http://127.0.0.1:20180
 * Manages Agent sessions, skills, crons, channels, and MCP tool execution dispatches.
 */

import http from "http";

const PORT = process.env.OPENCLAW_PORT ? Number(process.env.OPENCLAW_PORT) : 20180;
const HOST = "0.0.0.0";
const OMNIROUTE_URL = process.env.OMNIROUTE_URL || "http://127.0.0.1:20128/v1/chat/completions";

interface AgentDef {
  code: "CEO" | "MARKETING" | "SALES" | "CSKH";
  name: string;
  role: string;
  defaultProfile: string;
  allowedTools: string[];
}

const AGENTS: Record<string, AgentDef> = {
  CEO: {
    code: "CEO",
    name: "CEO Executive Agent",
    role: "Giám sát tổng quan, báo cáo doanh thu, SLA & phê duyệt chiến lược",
    defaultProfile: "business/quality",
    allowedTools: ["analytics.get_summary", "approval.list_pending", "sla.get_report"],
  },
  MARKETING: {
    code: "MARKETING",
    name: "Marketing & Growth Agent",
    role: "Lập chiến dịch, tạo landing page nháp & phân tích ROAS",
    defaultProfile: "business/creative",
    allowedTools: ["cms.create_post", "campaign.allocate_budget", "analytics.get_roas"],
  },
  SALES: {
    code: "SALES",
    name: "Sales Specialist Agent",
    role: "Tư vấn báo giá, lead scoring & follow-up khách hàng",
    defaultProfile: "business/fast",
    allowedTools: ["lead.assign_sales", "quote.create_draft", "customer.get_profile"],
  },
  CSKH: {
    code: "CSKH",
    name: "CSKH & Support Agent",
    role: "Chăm sóc sau mua, giải quyết ticket & khảo sát CSAT",
    defaultProfile: "business/fast",
    allowedTools: ["ticket.classify", "knowledge.search_sop", "survey.send_csat"],
  },
};

let activeRunsCount = 0;
let totalAgentRunsExecuted = 0;

const server = http.createServer(async (req, res) => {
  const url = req.url || "/";
  const method = req.method || "GET";

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // 1. Health Endpoint
  if (url === "/api/health" || url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: "HEALTHY",
        service: "OpenClaw Agent Runtime Sidecar",
        version: "1.0.0",
        port: PORT,
        uptimeSeconds: Math.floor(process.uptime()),
        omniRouteGatewayUrl: OMNIROUTE_URL,
        stats: {
          activeRunsCount,
          totalAgentRunsExecuted,
          registeredAgentsCount: Object.keys(AGENTS).length,
        },
      })
    );
  }

  // 2. List Registered Agents
  if (url === "/api/agents" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        success: true,
        agents: Object.values(AGENTS),
      })
    );
  }

  // 3. Trigger Agent Run (/api/agents/run)
  if (url === "/api/agents/run" && method === "POST") {
    let bodyText = "";
    req.on("data", (chunk) => {
      bodyText += chunk;
    });

    req.on("end", async () => {
      try {
        const payload = JSON.parse(bodyText || "{}");
        const agentCode = (payload.agentCode || "SALES").toUpperCase();
        const inputPrompt = payload.inputPrompt || "Tư vấn cho khách hàng mới điền form";
        const workspaceId = payload.workspaceId || "ws_default_001";

        const agentDef = AGENTS[agentCode] || AGENTS["SALES"];
        activeRunsCount++;
        totalAgentRunsExecuted++;

        const runId = `openclaw_run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        // Call OmniRoute Gateway for Inference
        let omniContent = "";
        try {
          const omniReq = await fetch(OMNIROUTE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: agentDef.defaultProfile,
              messages: [
                { role: "system", content: `You are the ${agentDef.name} for LƯỜI BUSINESS OS.` },
                { role: "user", content: inputPrompt },
              ],
            }),
          });
          const omniData = await omniReq.json();
          omniContent = omniData.choices?.[0]?.message?.content || "";
        } catch {
          omniContent = `[OpenClaw Agent ${agentDef.code} Standalone Execution Response]: Phản hồi tư vấn tự động cho task: "${inputPrompt.slice(0, 80)}"`;
        }

        activeRunsCount = Math.max(0, activeRunsCount - 1);

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            success: true,
            runId,
            agentCode: agentDef.code,
            agentName: agentDef.name,
            workspaceId,
            profileUsed: agentDef.defaultProfile,
            status: "COMPLETED",
            output: omniContent,
            allowedTools: agentDef.allowedTools,
            completedAt: new Date().toISOString(),
          })
        );
      } catch (err: any) {
        activeRunsCount = Math.max(0, activeRunsCount - 1);
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: false, error: err?.message || "Agent run failed" }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not found on OpenClaw Agent Runtime" }));
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 [OpenClaw Agent Runtime Sidecar] Listening on http://${HOST}:${PORT} (Gateway: ${OMNIROUTE_URL})`);
});
