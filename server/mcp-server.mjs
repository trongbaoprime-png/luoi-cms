import http from "node:http";
import crypto from "node:crypto";
import { PrismaClient as CRMPrismaClientPG } from "@prisma/client-crm-pg";
import { PrismaClient as OmniPrismaClientPG } from "@prisma/client-omni-pg";

const PORT = Number(process.env.MCP_PORT || 3100);
const HOST = process.env.MCP_HOST || "127.0.0.1";
const MCP_API_KEY = process.env.MCP_API_KEY || "";
const SERVER_NAME = "luoi-business-os";
const SERVER_VERSION = "1.0.0";
const MODERN_PROTOCOL = "2026-07-28";
const LEGACY_PROTOCOLS = ["2025-11-25", "2025-06-18"];

const crmUrl = process.env.CRM_DATABASE_URL || process.env.CRM_POSTGRES_URL || "";
const omniUrl = process.env.OMNI_DATABASE_URL || process.env.OMNI_POSTGRES_URL || "";

const crmDb = crmUrl
  ? new CRMPrismaClientPG({ datasources: { db: { url: crmUrl } }, log: ["error"] })
  : null;
const omniDb = omniUrl
  ? new OmniPrismaClientPG({ datasources: { db: { url: omniUrl } }, log: ["error"] })
  : null;

function schema(properties = {}, required = []) {
  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
}

const TOOLS = [
  {
    name: "crm.search_leads",
    title: "Search CRM Leads",
    description: "Tìm lead CRM theo tên, SĐT, email và các bộ lọc trạng thái/nguồn/chi nhánh/dịch vụ/telesale. Chỉ đọc dữ liệu.",
    inputSchema: schema({
      q: { type: "string", description: "Tên, SĐT, email hoặc ghi chú cần tìm" },
      status: { type: "string" },
      sourceGroup: { type: "string" },
      branchGroup: { type: "string" },
      branch: { type: "string" },
      serviceGroup: { type: "string" },
      telesale: { type: "string" },
      dateFrom: { type: "string", description: "YYYY-MM-DD, lọc theo createdAt" },
      dateTo: { type: "string", description: "YYYY-MM-DD, lọc theo createdAt" },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "crm.get_lead",
    title: "Get CRM Lead",
    description: "Lấy hồ sơ lead, lịch sử trạng thái và ghi chú theo CRM ID hoặc SĐT. Chỉ đọc dữ liệu.",
    inputSchema: schema({
      id: { type: "string" },
      phone: { type: "string" },
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "crm.get_customer_360",
    title: "Get Customer 360",
    description: "Ghép CRM lead với hội thoại Omnichannel gần nhất theo SĐT để tạo Customer 360. Chỉ đọc dữ liệu.",
    inputSchema: schema({
      id: { type: "string" },
      phone: { type: "string" },
      conversationLimit: { type: "integer", minimum: 1, maximum: 20, default: 5 },
      messagesPerConversation: { type: "integer", minimum: 1, maximum: 50, default: 10 },
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "crm.list_appointments",
    title: "List CRM Appointments",
    description: "Danh sách khách có lịch hẹn theo ngày, chi nhánh, telesale hoặc trạng thái lịch hẹn. Chỉ đọc dữ liệu.",
    inputSchema: schema({
      dateFrom: { type: "string", description: "YYYY-MM-DD" },
      dateTo: { type: "string", description: "YYYY-MM-DD" },
      branch: { type: "string" },
      telesale: { type: "string" },
      appointmentStatus: { type: "string" },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 50 },
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "omni.search_conversations",
    title: "Search Omnichannel Conversations",
    description: "Tìm hội thoại Omnichannel theo tên/SĐT, dịch vụ, chi nhánh hoặc intent AI. Chỉ đọc dữ liệu.",
    inputSchema: schema({
      q: { type: "string" },
      detectedService: { type: "string" },
      detectedBranch: { type: "string" },
      customerIntent: { type: "string" },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "omni.get_conversation",
    title: "Get Omnichannel Conversation",
    description: "Lấy một hội thoại Omnichannel và các tin nhắn gần nhất. Chỉ đọc dữ liệu.",
    inputSchema: schema({
      id: { type: "string" },
      messageLimit: { type: "integer", minimum: 1, maximum: 200, default: 100 },
    }, ["id"]),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "analytics.crm_summary",
    title: "CRM Summary",
    description: "Tổng hợp lead, trạng thái, doanh thu và thực thu trong một khoảng ngày theo createdAt. Mặc định 30 ngày gần nhất, tối đa 366 ngày.",
    inputSchema: schema({
      dateFrom: { type: "string", description: "YYYY-MM-DD" },
      dateTo: { type: "string", description: "YYYY-MM-DD" },
      branchGroup: { type: "string" },
      serviceGroup: { type: "string" },
      sourceGroup: { type: "string" },
      telesale: { type: "string" },
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "analytics.revenue_by_dimension",
    title: "Revenue by Dimension",
    description: "Nhóm doanh thu/thực thu theo nguồn, nhóm chi nhánh, nhóm dịch vụ hoặc telesale trong khoảng ngày. Chỉ đọc dữ liệu.",
    inputSchema: schema({
      dimension: { type: "string", enum: ["sourceGroup", "branchGroup", "serviceGroup", "telesale"] },
      dateFrom: { type: "string", description: "YYYY-MM-DD" },
      dateTo: { type: "string", description: "YYYY-MM-DD" },
    }, ["dimension"]),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
];

function safeLimit(value, fallback, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(max, Math.trunc(n)));
}

function parseIsoDate(value, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null;
  const suffix = endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  const d = new Date(`${value}${suffix}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function boundedDateRange(dateFrom, dateTo) {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 29 * 86400000);
  let from = parseIsoDate(dateFrom) || new Date(Date.UTC(defaultFrom.getUTCFullYear(), defaultFrom.getUTCMonth(), defaultFrom.getUTCDate()));
  let to = parseIsoDate(dateTo, true) || now;
  if (from > to) [from, to] = [to, from];
  const maxMs = 366 * 86400000;
  if (to.getTime() - from.getTime() > maxMs) {
    from = new Date(to.getTime() - maxMs);
  }
  return { from, to };
}

function publicLeadSelect() {
  return {
    id: true,
    leadId: true,
    fullName: true,
    phone: true,
    email: true,
    source: true,
    sourceGroup: true,
    status: true,
    telesale: true,
    branch: true,
    branchGroup: true,
    service: true,
    serviceGroup: true,
    checkinDate: true,
    result: true,
    revenue: true,
    actualRevenue: true,
    caTheoRevenue: true,
    note: true,
    currency: true,
    appointmentDate: true,
    appointmentTime: true,
    appointmentBranch: true,
    appointmentDoctor: true,
    appointmentStatus: true,
    appointmentNote: true,
    campaignId: true,
    adsetId: true,
    adId: true,
    createdAt: true,
    updatedAt: true,
  };
}

function assertCrm() {
  if (!crmDb) throw new Error("CRM database is not configured. Set CRM_POSTGRES_URL or CRM_DATABASE_URL.");
  return crmDb;
}

function assertOmni() {
  if (!omniDb) throw new Error("Omnichannel database is not configured. Set OMNI_POSTGRES_URL or OMNI_DATABASE_URL.");
  return omniDb;
}

async function searchLeads(args) {
  const db = assertCrm();
  const conditions = [];
  if (args.q) {
    conditions.push({
      OR: [
        { fullName: { contains: String(args.q) } },
        { phone: { contains: String(args.q) } },
        { email: { contains: String(args.q) } },
        { note: { contains: String(args.q) } },
      ],
    });
  }
  for (const key of ["status", "sourceGroup", "branchGroup", "serviceGroup", "telesale"]) {
    if (args[key]) conditions.push({ [key]: String(args[key]) });
  }
  if (args.branch) conditions.push({ branch: { contains: String(args.branch) } });
  const from = parseIsoDate(args.dateFrom);
  const to = parseIsoDate(args.dateTo, true);
  if (from || to) conditions.push({ createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } });
  const where = conditions.length ? { AND: conditions } : {};
  const limit = safeLimit(args.limit, 20, 100);
  const [total, leads] = await Promise.all([
    db.cRMLead.count({ where }),
    db.cRMLead.findMany({ where, select: publicLeadSelect(), orderBy: { createdAt: "desc" }, take: limit }),
  ]);
  return { total, returned: leads.length, leads };
}

async function getLead(args) {
  const db = assertCrm();
  if (!args.id && !args.phone) throw new Error("Provide id or phone.");
  const where = args.id ? { id: String(args.id) } : { phone: String(args.phone) };
  const lead = await db.cRMLead.findUnique({
    where,
    include: {
      statusHistory: { orderBy: { createdAt: "desc" }, take: 100 },
      notes: { orderBy: { createdAt: "desc" }, take: 100 },
    },
  });
  if (!lead) throw new Error("Lead not found.");
  const { phoneHash, emailHash, metaEventResponse, ...safeLead } = lead;
  return safeLead;
}

async function getCustomer360(args) {
  const lead = await getLead(args);
  const conversationLimit = safeLimit(args.conversationLimit, 5, 20);
  const messagesPerConversation = safeLimit(args.messagesPerConversation, 10, 50);
  let conversations = [];
  if (lead.phone && omniDb) {
    conversations = await omniDb.omniConversation.findMany({
      where: { phone: lead.phone },
      orderBy: { lastMessageAt: "desc" },
      take: conversationLimit,
      include: {
        fanpage: { select: { pageId: true, pageName: true } },
        messages: { orderBy: { createdAt: "desc" }, take: messagesPerConversation },
      },
    });
  }
  return {
    lead,
    omnichannel: {
      matchedBy: lead.phone ? "phone" : null,
      conversations,
    },
  };
}

async function listAppointments(args) {
  const db = assertCrm();
  const conditions = [{ appointmentDate: { not: null } }];
  if (args.dateFrom || args.dateTo) {
    conditions.push({ appointmentDate: { ...(args.dateFrom ? { gte: String(args.dateFrom) } : {}), ...(args.dateTo ? { lte: String(args.dateTo) } : {}) } });
  }
  if (args.branch) conditions.push({ appointmentBranch: { contains: String(args.branch) } });
  if (args.telesale) conditions.push({ telesale: String(args.telesale) });
  if (args.appointmentStatus) conditions.push({ appointmentStatus: String(args.appointmentStatus) });
  const where = { AND: conditions };
  const limit = safeLimit(args.limit, 50, 100);
  const [total, appointments] = await Promise.all([
    db.cRMLead.count({ where }),
    db.cRMLead.findMany({ where, select: publicLeadSelect(), orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }], take: limit }),
  ]);
  return { total, returned: appointments.length, appointments };
}

async function searchConversations(args) {
  const db = assertOmni();
  const conditions = [];
  if (args.q) {
    conditions.push({ OR: [{ customerName: { contains: String(args.q) } }, { phone: { contains: String(args.q) } }] });
  }
  for (const key of ["detectedService", "detectedBranch", "customerIntent"]) {
    if (args[key]) conditions.push({ [key]: { contains: String(args[key]) } });
  }
  const where = conditions.length ? { AND: conditions } : {};
  const limit = safeLimit(args.limit, 20, 100);
  const [total, conversations] = await Promise.all([
    db.omniConversation.count({ where }),
    db.omniConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      take: limit,
      include: { fanpage: { select: { pageId: true, pageName: true } } },
    }),
  ]);
  return { total, returned: conversations.length, conversations };
}

async function getConversation(args) {
  const db = assertOmni();
  const conversation = await db.omniConversation.findUnique({
    where: { id: String(args.id) },
    include: {
      fanpage: { select: { pageId: true, pageName: true } },
      messages: { orderBy: { createdAt: "desc" }, take: safeLimit(args.messageLimit, 100, 200) },
    },
  });
  if (!conversation) throw new Error("Conversation not found.");
  return conversation;
}

async function crmSummary(args) {
  const db = assertCrm();
  const { from, to } = boundedDateRange(args.dateFrom, args.dateTo);
  const filters = [{ createdAt: { gte: from, lte: to } }];
  for (const key of ["branchGroup", "serviceGroup", "sourceGroup", "telesale"]) {
    if (args[key]) filters.push({ [key]: String(args[key]) });
  }
  const where = { AND: filters };
  const [totalLeads, qualified, scheduled, checkin, purchase, junk, revenue] = await Promise.all([
    db.cRMLead.count({ where }),
    db.cRMLead.count({ where: { ...where, status: "QUALIFIED" } }),
    db.cRMLead.count({ where: { ...where, status: "SCHEDULED" } }),
    db.cRMLead.count({ where: { ...where, status: "CHECKIN" } }),
    db.cRMLead.count({ where: { ...where, status: "PURCHASE" } }),
    db.cRMLead.count({ where: { ...where, status: "JUNK" } }),
    db.cRMLead.aggregate({ where, _sum: { revenue: true, actualRevenue: true, caTheoRevenue: true } }),
  ]);
  return {
    range: { from: from.toISOString(), to: to.toISOString() },
    totalLeads,
    status: { qualified, scheduled, checkin, purchase, junk },
    revenue: {
      totalRevenue: revenue._sum.revenue || 0,
      actualRevenue: revenue._sum.actualRevenue || 0,
      caTheoRevenue: revenue._sum.caTheoRevenue || 0,
    },
  };
}

async function revenueByDimension(args) {
  const db = assertCrm();
  const allowed = new Set(["sourceGroup", "branchGroup", "serviceGroup", "telesale"]);
  const dimension = String(args.dimension || "");
  if (!allowed.has(dimension)) throw new Error("Invalid dimension.");
  const { from, to } = boundedDateRange(args.dateFrom, args.dateTo);
  const rows = await db.cRMLead.groupBy({
    by: [dimension],
    where: { createdAt: { gte: from, lte: to } },
    _count: { id: true },
    _sum: { revenue: true, actualRevenue: true, caTheoRevenue: true },
    orderBy: { _sum: { revenue: "desc" } },
  });
  return {
    dimension,
    range: { from: from.toISOString(), to: to.toISOString() },
    rows: rows.map((row) => ({
      key: row[dimension] || "(empty)",
      count: row._count.id,
      revenue: row._sum.revenue || 0,
      actualRevenue: row._sum.actualRevenue || 0,
      caTheoRevenue: row._sum.caTheoRevenue || 0,
    })),
  };
}

const HANDLERS = {
  "crm.search_leads": searchLeads,
  "crm.get_lead": getLead,
  "crm.get_customer_360": getCustomer360,
  "crm.list_appointments": listAppointments,
  "omni.search_conversations": searchConversations,
  "omni.get_conversation": getConversation,
  "analytics.crm_summary": crmSummary,
  "analytics.revenue_by_dimension": revenueByDimension,
};

function isAuthorized(req) {
  if (!MCP_API_KEY) return false;
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return false;
  const supplied = auth.slice(7).trim();
  const a = Buffer.from(supplied);
  const b = Buffer.from(MCP_API_KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function serverMeta() {
  return { "io.modelcontextprotocol/serverInfo": { name: SERVER_NAME, version: SERVER_VERSION } };
}

function jsonRpcResult(id, result, modern = false) {
  const finalResult = modern
    ? { resultType: "complete", ...result, _meta: { ...(result?._meta || {}), ...serverMeta() } }
    : result;
  return { jsonrpc: "2.0", id, result: finalResult };
}

function jsonRpcError(id, code, message, data) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message, ...(data !== undefined ? { data } : {}) } };
}

function toolResult(data, modern) {
  return {
    content: [{ type: "text", text: JSON.stringify(data) }],
    structuredContent: data,
    ...(modern ? {} : {}),
  };
}

function protocolContext(req, message) {
  const headerVersion = String(req.headers["mcp-protocol-version"] || "");
  const metaVersion = message?.params?._meta?.["io.modelcontextprotocol/protocolVersion"] || "";
  const modern = headerVersion === MODERN_PROTOCOL || metaVersion === MODERN_PROTOCOL || message?.method === "server/discover";
  if (modern && headerVersion && metaVersion && headerVersion !== metaVersion) {
    return { modern: true, error: jsonRpcError(message?.id, -32020, "MCP protocol header does not match request _meta.") };
  }
  if (modern && headerVersion && headerVersion !== MODERN_PROTOCOL) {
    return { modern: true, error: jsonRpcError(message?.id, -32022, `Unsupported MCP protocol version: ${headerVersion}`) };
  }
  return { modern };
}

async function dispatch(req, message) {
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return { status: 400, body: jsonRpcError(message?.id, -32600, "Invalid Request") };
  }

  const { modern, error } = protocolContext(req, message);
  if (error) return { status: 400, body: error };

  const { id, method, params = {} } = message;

  if (method === "notifications/initialized" || method === "notifications/cancelled") {
    return { status: 202, body: null };
  }

  if (method === "server/discover") {
    return {
      status: 200,
      body: jsonRpcResult(id, {
        supportedVersions: [MODERN_PROTOCOL],
        capabilities: { tools: { listChanged: false } },
        instructions: "LƯỜI Business OS MCP: read-only CRM, appointment, omnichannel and analytics tools. Do not infer missing customer facts; use tools to retrieve them.",
        ttlMs: 300000,
        cacheScope: "private",
      }, true),
    };
  }

  if (method === "initialize") {
    const requested = String(params.protocolVersion || "");
    const protocolVersion = LEGACY_PROTOCOLS.includes(requested) ? requested : LEGACY_PROTOCOLS[0];
    return {
      status: 200,
      body: jsonRpcResult(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        instructions: "LƯỜI Business OS MCP: read-only CRM, appointment, omnichannel and analytics tools.",
      }, false),
    };
  }

  if (method === "ping") {
    return { status: 200, body: jsonRpcResult(id, {}, modern) };
  }

  if (method === "tools/list") {
    return { status: 200, body: jsonRpcResult(id, { tools: TOOLS }, modern) };
  }

  if (method === "tools/call") {
    const name = String(params.name || "");
    const handler = HANDLERS[name];
    if (!handler) return { status: 200, body: jsonRpcError(id, -32602, `Unknown tool: ${name}`) };
    try {
      const data = await handler(params.arguments || {});
      return { status: 200, body: jsonRpcResult(id, toolResult(data, modern), modern) };
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "Tool execution failed";
      return {
        status: 200,
        body: jsonRpcResult(id, {
          content: [{ type: "text", text: messageText }],
          isError: true,
        }, modern),
      };
    }
  }

  return { status: 200, body: jsonRpcError(id, -32601, `Method not found: ${method}`) };
}

function sendJson(res, status, body) {
  const text = body === null ? "" : JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

async function readJson(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > 1024 * 1024) throw new Error("Request body too large");
    chunks.push(chunk);
  }
  if (!chunks.length) return null;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && url.pathname === "/healthz") {
      return sendJson(res, 200, {
        ok: true,
        service: SERVER_NAME,
        version: SERVER_VERSION,
        crmConfigured: Boolean(crmDb),
        omniConfigured: Boolean(omniDb),
      });
    }

    if (url.pathname !== "/mcp") {
      return sendJson(res, 404, { error: "Not found" });
    }

    if (!isAuthorized(req)) {
      res.setHeader("www-authenticate", 'Bearer realm="luoi-mcp"');
      return sendJson(res, 401, { error: "Unauthorized" });
    }

    if (req.method !== "POST") {
      res.setHeader("allow", "POST");
      return sendJson(res, 405, { error: "Method not allowed" });
    }

    const contentType = String(req.headers["content-type"] || "");
    if (!contentType.toLowerCase().includes("application/json")) {
      return sendJson(res, 415, { error: "Content-Type must be application/json" });
    }

    const payload = await readJson(req);
    if (Array.isArray(payload)) {
      const results = [];
      let status = 200;
      for (const item of payload) {
        const out = await dispatch(req, item);
        status = Math.max(status, out.status);
        if (out.body !== null) results.push(out.body);
      }
      return sendJson(res, results.length ? status : 202, results.length ? results : null);
    }

    const out = await dispatch(req, payload);
    return sendJson(res, out.status, out.body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return sendJson(res, message === "Request body too large" ? 413 : 500, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[luoi-mcp] listening on http://${HOST}:${PORT}/mcp`);
  if (!MCP_API_KEY) console.error("[luoi-mcp] MCP_API_KEY is missing; all MCP requests will be rejected.");
  if (!crmDb) console.error("[luoi-mcp] CRM database URL is not configured.");
  if (!omniDb) console.error("[luoi-mcp] Omnichannel database URL is not configured.");
});

async function shutdown(signal) {
  console.log(`[luoi-mcp] ${signal}: shutting down`);
  server.close(async () => {
    await Promise.allSettled([crmDb?.$disconnect(), omniDb?.$disconnect()].filter(Boolean));
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
