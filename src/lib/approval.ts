/**
 * LƯỜI BUSINESS OS — Approval Center Engine
 * Governs Sensitive Execution Levels (Read Only, Draft, Execute) and Approval Decisions.
 */

import { recordAuditLog } from "./audit";

export type ExecutionLevel = "READ_ONLY" | "DRAFT" | "EXECUTE";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED" | "EXPIRED" | "CANCELLED";

export interface ApprovalPolicyRule {
  actionType: string;
  isMandatory: boolean;
  requiredRole: "OWNER" | "ADMIN" | "MANAGER";
  autoApproveThresholdMax?: number;
}

export interface ApprovalRequestPayload {
  workspaceId: string;
  requesterId: string;
  requesterRole: string;
  actionType: string; // e.g. "AD_SPEND_CHANGE", "REFUND", "DELETE_CUSTOMER", "PRICE_OVERRIDE"
  resource: string;
  resourceId?: string;
  payload: Record<string, unknown>;
  description: string;
}

/**
 * Mandatory Approval Action Rules
 */
const MANDATORY_APPROVAL_POLICIES: Record<string, ApprovalPolicyRule> = {
  AD_SPEND_CHANGE: { actionType: "AD_SPEND_CHANGE", isMandatory: true, requiredRole: "MANAGER", autoApproveThresholdMax: 5000000 },
  REFUND_PROCESS: { actionType: "REFUND_PROCESS", isMandatory: true, requiredRole: "MANAGER" },
  DATA_DELETION: { actionType: "DATA_DELETION", isMandatory: true, requiredRole: "ADMIN" },
  PRICE_OVERRIDE: { actionType: "PRICE_OVERRIDE", isMandatory: true, requiredRole: "MANAGER" },
  BROADCAST_SEND: { actionType: "BROADCAST_SEND", isMandatory: true, requiredRole: "MANAGER" },
  ROLE_ESCALATION: { actionType: "ROLE_ESCALATION", isMandatory: true, requiredRole: "OWNER" },
};

/**
 * Check whether an action requires an approval request
 */
export function requiresApprovalCheck(actionType: string, amount?: number): boolean {
  const policy = MANDATORY_APPROVAL_POLICIES[actionType];
  if (!policy) return false;

  if (policy.autoApproveThresholdMax && amount && amount <= policy.autoApproveThresholdMax) {
    return false;
  }

  return policy.isMandatory;
}

/**
 * Create a new Pending Approval Request
 */
export async function createApprovalRequest(request: ApprovalRequestPayload): Promise<{ requestId: string; status: ApprovalStatus }> {
  const requestId = `appr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  await recordAuditLog({
    workspaceId: request.workspaceId,
    actorId: request.requesterId,
    actorRole: request.requesterRole,
    action: `approval:create_request:${request.actionType}`,
    resource: request.resource,
    resourceId: request.resourceId,
    changesAfter: request.payload,
  });

  return {
    requestId,
    status: "PENDING",
  };
}

/**
 * Process Approval Decision (Approve / Reject)
 */
export async function processApprovalDecision(
  requestId: string,
  decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED",
  decidedByUserId: string,
  decidedByUserRole: string,
  workspaceId: string,
  comment?: string
): Promise<{ success: boolean; status: ApprovalStatus; error?: string }> {
  // Only Manager, Admin, or Owner can approve
  if (!["OWNER", "ADMIN", "MANAGER"].includes(decidedByUserRole)) {
    return {
      success: false,
      status: "PENDING",
      error: "Forbidden: Only Manager, Admin, or Owner can approve requests.",
    };
  }

  await recordAuditLog({
    workspaceId,
    actorId: decidedByUserId,
    actorRole: decidedByUserRole,
    action: `approval:decision:${decision.toLowerCase()}`,
    resource: "approval_request",
    resourceId: requestId,
    changesAfter: { decision, comment },
  });

  return {
    success: true,
    status: decision,
  };
}
