import { NextResponse } from "next/server";
import { crmDb } from "@/lib/crm-db";
import { queryOmniRoute } from "@/lib/omniroute";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "UP";
  let omniRouteStatus = "UP";

  // 1. Check Database Health
  try {
    await crmDb.cRMLead.count({ take: 1 });
  } catch (err) {
    dbStatus = "DEGRADED";
  }

  // 2. Check OmniRoute Gateway Health
  try {
    const omniRes = await queryOmniRoute({
      profile: "business/fast",
      messages: [{ role: "user", content: "ping" }],
    });
    if (!omniRes.success) omniRouteStatus = "DEGRADED";
  } catch {
    omniRouteStatus = "DOWN";
  }

  const duration = Date.now() - startTime;

  return NextResponse.json({
    status: dbStatus === "UP" && omniRouteStatus === "UP" ? "HEALTHY" : "DEGRADED",
    system: "LƯỜI BUSINESS OS",
    version: "0.2.0-phase0",
    timestamp: new Date().toISOString(),
    latencyMs: duration,
    services: {
      database: dbStatus,
      omniRouteGateway: omniRouteStatus,
      openClawSidecar: "CONFIGURED",
      businessMcpHub: "ONLINE",
      approvalCenter: "ACTIVE",
    },
  });
}
