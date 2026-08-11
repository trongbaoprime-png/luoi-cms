/**
 * LƯỜI BUSINESS OS — OpenClaw Agent Sidecar Adapter
 * Manages Agent sessions, workflows, crons, channels, and skill execution.
 */

import { queryOmniRoute, ModelProfile } from "./omniroute";

export interface AgentRunParams {
  agentCode: "CEO" | "MARKETING" | "SALES" | "CSKH";
  workspaceId: string;
  inputPrompt: string;
  contextData?: Record<string, unknown>;
  userRole?: string;
}

export interface AgentRunResult {
  runId: string;
  agentCode: string;
  status: "COMPLETED" | "FAILED" | "APPROVAL_REQUIRED";
  output?: string;
  proposedActions?: Array<{ toolName: string; args: Record<string, unknown>; requiresApproval: boolean }>;
  totalTokens?: number;
  costUsd?: number;
  error?: string;
}

const AGENT_PROFILES: Record<string, ModelProfile> = {
  CEO: "business/quality",
  MARKETING: "business/creative",
  SALES: "business/fast",
  CSKH: "business/fast",
};

/**
 * Trigger an OpenClaw Agent execution session
 */
export async function triggerAgentRun(params: AgentRunParams): Promise<AgentRunResult> {
  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const profile = AGENT_PROFILES[params.agentCode] || "business/fast";

  const systemPrompt = `You are the ${params.agentCode} Agent for LƯỜI BUSINESS OS (Workspace: ${params.workspaceId}).
Your role is to assist enterprise users with accurate, brand-aligned actions.
Always return structured responses and adhere strictly to permission and approval rules.`;

  const omniRes = await queryOmniRoute({
    profile,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Context: ${JSON.stringify(params.contextData || {})}\nTask: ${params.inputPrompt}` },
    ],
    workspaceId: params.workspaceId,
  });

  if (!omniRes.success) {
    return {
      runId,
      agentCode: params.agentCode,
      status: "FAILED",
      error: omniRes.error || "Agent execution failed via OmniRoute",
    };
  }

  return {
    runId,
    agentCode: params.agentCode,
    status: "COMPLETED",
    output: omniRes.content,
    totalTokens: omniRes.totalTokens,
    costUsd: omniRes.estimatedCostUsd,
  };
}
