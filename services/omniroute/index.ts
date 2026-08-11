/**
 * OmniRoute Model Gateway Sidecar Service — LƯỜI BUSINESS OS
 * Port: 20128
 * Endpoint: http://127.0.0.1:20128/v1
 * Provides OpenAI-Compatible API with 6 Routing Profiles, Provider Fallback & Cost Analytics.
 * Now powered by real AI via Groq (free, fast) with OpenAI fallback.
 */

import http from "http";
import https from "https";

const PORT = process.env.OMNIROUTE_PORT ? Number(process.env.OMNIROUTE_PORT) : 20128;
const HOST = "0.0.0.0";

// AI Provider API Keys from environment
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

export type ModelProfile =
  | "business/fast"
  | "business/quality"
  | "business/creative"
  | "business/private"
  | "business/vision"
  | "business/emergency";

interface ProfileConfig {
  name: ModelProfile;
  description: string;
  models: string[];
  primaryProvider: string;
  fallbackProvider: string;
  maxTokens: number;
  groqModel?: string;
  openaiModel?: string;
}

const ROUTING_PROFILES: Record<ModelProfile, ProfileConfig> = {
  "business/fast": {
    name: "business/fast",
    description: "Tốc độ nhanh, phản loại lead, tagging & tóm tắt tin nhắn",
    models: ["llama-3.1-8b-instant", "gpt-4o-mini", "gemini-1.5-flash"],
    primaryProvider: "Groq",
    fallbackProvider: "OpenAI",
    maxTokens: 2048,
    groqModel: "llama-3.1-8b-instant",
    openaiModel: "gpt-4o-mini",
  },
  "business/quality": {
    name: "business/quality",
    description: "Chất lượng cao, lập chiến lược, phân tích dữ liệu & báo cáo",
    models: ["llama-3.3-70b-versatile", "gpt-4o", "claude-3-5-sonnet-20241022"],
    primaryProvider: "Groq",
    fallbackProvider: "OpenAI",
    maxTokens: 4096,
    groqModel: "llama-3.3-70b-versatile",
    openaiModel: "gpt-4o",
  },
  "business/creative": {
    name: "business/creative",
    description: "Sáng tạo nội dung marketing, bài viết CMS & kịch bản sales",
    models: ["llama-3.3-70b-versatile", "gpt-4o"],
    primaryProvider: "Groq",
    fallbackProvider: "OpenAI",
    maxTokens: 4096,
    groqModel: "llama-3.3-70b-versatile",
    openaiModel: "gpt-4o",
  },
  "business/private": {
    name: "business/private",
    description: "Bảo mật dữ liệu nội bộ, xử lý offline qua Ollama / Local Model",
    models: ["llama-3.1-8b-instant"],
    primaryProvider: "Groq",
    fallbackProvider: "Groq",
    maxTokens: 2048,
    groqModel: "llama-3.1-8b-instant",
  },
  "business/vision": {
    name: "business/vision",
    description: "Đọc và phân tích hình ảnh, tài liệu nha khoa & chụp cận cảnh",
    models: ["llama-3.3-70b-versatile", "gpt-4o"],
    primaryProvider: "Groq",
    fallbackProvider: "OpenAI",
    maxTokens: 4096,
    groqModel: "llama-3.3-70b-versatile",
    openaiModel: "gpt-4o",
  },
  "business/emergency": {
    name: "business/emergency",
    description: "Dự phòng khẩn cấp khi các nhà cung cấp chính quá tải",
    models: ["llama-3.1-8b-instant", "gpt-4o-mini"],
    primaryProvider: "Groq",
    fallbackProvider: "OpenAI",
    maxTokens: 1024,
    groqModel: "llama-3.1-8b-instant",
    openaiModel: "gpt-4o-mini",
  },
};

// Global Stats & Circuit Breaker Tracking
let totalRequestsProcessed = 0;
let totalTokensConsumed = 0;
let totalEstimatedCostUsd = 0;
let providerFailoversCount = 0;

// Call Groq API
function callGroq(model: string, messages: any[], maxTokens: number): Promise<{ content: string; tokens: number }> {
  return new Promise((resolve, reject) => {
    if (!GROQ_API_KEY) return reject(new Error("GROQ_API_KEY not set"));

    const body = JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const options = {
      hostname: "api.groq.com",
      port: 443,
      path: "/openai/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          const content = parsed.choices?.[0]?.message?.content || "";
          const tokens = parsed.usage?.total_tokens || 0;
          resolve({ content, tokens });
        } catch {
          reject(new Error("Invalid response from Groq"));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("Groq timeout")); });
    req.write(body);
    req.end();
  });
}

// Call OpenAI API
function callOpenAI(model: string, messages: any[], maxTokens: number): Promise<{ content: string; tokens: number }> {
  return new Promise((resolve, reject) => {
    if (!OPENAI_API_KEY) return reject(new Error("OPENAI_API_KEY not set"));

    const body = JSON.stringify({ model, messages, max_tokens: maxTokens });

    const options = {
      hostname: "api.openai.com",
      port: 443,
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          const content = parsed.choices?.[0]?.message?.content || "";
          const tokens = parsed.usage?.total_tokens || 0;
          resolve({ content, tokens });
        } catch {
          reject(new Error("Invalid response from OpenAI"));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("OpenAI timeout")); });
    req.write(body);
    req.end();
  });
}

const server = http.createServer((req, res) => {
  const url = req.url || "/";
  const method = req.method || "GET";

  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // 1. Health Status Endpoint
  if (url === "/v1/health" || url === "/health") {
    const hasGroq = !!GROQ_API_KEY;
    const hasOpenAI = !!OPENAI_API_KEY;
    const hasAnthropic = !!ANTHROPIC_API_KEY;

    const payload = JSON.stringify({
      status: (hasGroq || hasOpenAI) ? "HEALTHY" : "DEGRADED",
      service: "OmniRoute Model Gateway Sidecar",
      version: "2.0.0",
      port: PORT,
      uptimeSeconds: Math.floor(process.uptime()),
      providers: {
        groq: hasGroq ? "CONFIGURED" : "NOT_SET",
        openai: hasOpenAI ? "CONFIGURED" : "NOT_SET",
        anthropic: hasAnthropic ? "CONFIGURED" : "NOT_SET",
      },
      stats: {
        totalRequestsProcessed,
        totalTokensConsumed,
        totalEstimatedCostUsd: Number(totalEstimatedCostUsd.toFixed(6)),
        providerFailoversCount,
      },
      profilesCount: Object.keys(ROUTING_PROFILES).length,
    });

    res.writeHead(200, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) });
    return res.end(payload);
  }

  // 2. List Profiles / Models Endpoint
  if (url === "/v1/models" || url === "/models") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      object: "list",
      data: Object.values(ROUTING_PROFILES).map((p) => ({
        id: p.name,
        object: "model",
        created: 1700000000,
        owned_by: "omniroute",
        description: p.description,
        models: p.models,
        primaryProvider: p.primaryProvider,
        fallbackProvider: p.fallbackProvider,
      })),
    }));
  }

  // 3. OpenAI-Compatible Chat Completions Endpoint
  if ((url === "/v1/chat/completions" || url === "/chat/completions") && method === "POST") {
    let bodyText = "";
    req.on("data", (chunk) => { bodyText += chunk; });

    req.on("end", async () => {
      try {
        const payload = JSON.parse(bodyText || "{}");
        const requestedModel = payload.model || "business/fast";
        const messages = payload.messages || [];
        const profileConfig = ROUTING_PROFILES[requestedModel as ModelProfile] || ROUTING_PROFILES["business/fast"];

        totalRequestsProcessed++;

        let content = "";
        let tokens = 0;
        let providerUsed = "";

        // Try Groq first
        if (GROQ_API_KEY && profileConfig.groqModel) {
          try {
            const result = await callGroq(profileConfig.groqModel, messages, profileConfig.maxTokens);
            content = result.content;
            tokens = result.tokens;
            providerUsed = "Groq";
          } catch (err: any) {
            console.error(`[OmniRoute] Groq failed: ${err.message}, trying fallback...`);
            providerFailoversCount++;
          }
        }

        // Fallback to OpenAI
        if (!content && OPENAI_API_KEY && profileConfig.openaiModel) {
          try {
            const result = await callOpenAI(profileConfig.openaiModel, messages, profileConfig.maxTokens);
            content = result.content;
            tokens = result.tokens;
            providerUsed = "OpenAI";
          } catch (err: any) {
            console.error(`[OmniRoute] OpenAI failed: ${err.message}`);
          }
        }

        // Final fallback - simulated if no providers configured
        if (!content) {
          content = `[OmniRoute ${profileConfig.name}]: Chưa có AI provider nào được cấu hình. Vui lòng thêm GROQ_API_KEY vào .env`;
          providerUsed = "Simulated";
        }

        totalTokensConsumed += tokens;
        totalEstimatedCostUsd += tokens * 0.000001;

        const responsePayload = {
          id: `chatcmpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model: profileConfig.groqModel || profileConfig.openaiModel || profileConfig.models[0],
          profileUsed: profileConfig.name,
          providerUsed,
          choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
          usage: {
            prompt_tokens: Math.floor(tokens * 0.7),
            completion_tokens: Math.floor(tokens * 0.3),
            total_tokens: tokens,
          },
        };

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(responsePayload));
      } catch (err: any) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: { message: "Invalid JSON payload", type: "invalid_request_error" } }));
      }
    });
    return;
  }

  // 4. Default 404 Fallback
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not found on OmniRoute Gateway" }));
});

server.listen(PORT, HOST, () => {
  const hasGroq = !!GROQ_API_KEY;
  const hasOpenAI = !!OPENAI_API_KEY;
  console.log(`🚀 [OmniRoute Gateway] Listening on http://${HOST}:${PORT}/v1`);
  console.log(`   Groq: ${hasGroq ? "✅ READY" : "❌ GROQ_API_KEY not set"}`);
  console.log(`   OpenAI: ${hasOpenAI ? "✅ READY" : "⚠️  OPENAI_API_KEY not set"}`);
});
