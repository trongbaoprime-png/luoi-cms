/**
 * LƯỜI BUSINESS OS — Vertical Slice MVP Orchestration Engine
 * Unifies the live end-to-end customer journey:
 * Form Submit -> Customer 360 & Lead -> Sales & Telegram Alert -> AI Draft -> Approval -> Order -> Analytics.
 */

import { normalizeVnPhone, normalizeEmail } from "./identity-resolution";
import { queryOmniRoute } from "./omniroute";
import { createApprovalRequest, processApprovalDecision, ApprovalStatus } from "./approval";
import { recordAuditLog } from "./audit";

export interface FormSubmitPayload {
  workspaceId?: string;
  fullName: string;
  phone: string;
  email?: string;
  service?: string;
  note?: string;
  landingPageSlug?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface Customer360Record {
  id: string;
  workspaceId: string;
  fullName: string;
  primaryPhone: string;
  primaryEmail?: string;
  lifecycleStage: "ANONYMOUS" | "LEAD" | "CONTACTED" | "QUALIFIED" | "QUOTED" | "CUSTOMER" | "POST_PURCHASE";
  leadScore: number;
  lifetimeValue: number;
  assignedSalesId?: string;
  assignedSalesName?: string;
  createdAt: string;
}

export interface Lead360Record {
  id: string;
  customerId: string;
  workspaceId: string;
  source: string;
  campaign?: string;
  status: "NEW" | "ASSIGNED" | "QUALIFIED" | "IN_PROGRESS" | "CONVERTED" | "LOST";
  score: number;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
}

export interface Order360Record {
  id: string;
  workspaceId: string;
  customerId: string;
  orderNumber: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "COMPLETED" | "CANCELLED";
  paidAt?: string;
}

export interface TimelineEventRecord {
  id: string;
  customerId: string;
  eventType: string;
  title: string;
  description: string;
  timestamp: string;
}

// In-Memory Repository for Vertical Slice Live Demonstration
class VerticalSliceStore {
  customers: Map<string, Customer360Record> = new Map();
  leads: Map<string, Lead360Record> = new Map();
  orders: Map<string, Order360Record> = new Map();
  timeline: Map<string, TimelineEventRecord[]> = new Map();
  approvals: Map<string, any> = new Map();

  // Metrics
  visitorsCount = 150;
  formsSubmittedCount = 0;
  leadsCreatedCount = 0;
  ordersConvertedCount = 0;
  totalRevenueAmount = 0;

  constructor() {
    this.seedDemoData();
  }

  private seedDemoData() {
    const custId = "cust_demo_853";
    const phone = "+84908000853";

    const demoCust: Customer360Record = {
      id: custId,
      workspaceId: "ws_default_001",
      fullName: "Trần Văn An",
      primaryPhone: phone,
      primaryEmail: "an.tran@gmail.com",
      lifecycleStage: "CUSTOMER",
      leadScore: 92,
      lifetimeValue: 15500000,
      assignedSalesId: "sales_nam_01",
      assignedSalesName: "Nguyễn Văn Nam (Sales)",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    };

    this.customers.set(custId, demoCust);
    this.formsSubmittedCount = 42;
    this.leadsCreatedCount = 42;
    this.ordersConvertedCount = 18;
    this.totalRevenueAmount = 245000000;

    this.addTimelineEvent(custId, "FORM_SUBMIT", "Điền Form Đăng Ký Tư Vấn", "Chiến dịch Landing Page Răng Sứ - UTM Facebook Ads");
    this.addTimelineEvent(custId, "SALES_ASSIGNED", "Phân Công Sales", "Giao cho chuyên viên Nguyễn Văn Nam");
    this.addTimelineEvent(custId, "AI_DRAFT_CREATED", "AI Soạn Bản Báo Giá Nháp", "Tự động tra cứu Knowledge Base dịch vụ Răng Sứ");
    this.addTimelineEvent(custId, "ORDER_CREATED", "Phát Sinh Đơn Hàng Thành Công", "Đơn hàng #ORD-853 trị giá 15.500.000đ");
  }

  addTimelineEvent(customerId: string, eventType: string, title: string, description: string) {
    const list = this.timeline.get(customerId) || [];
    list.unshift({
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      customerId,
      eventType,
      title,
      description,
      timestamp: new Date().toISOString(),
    });
    this.timeline.set(customerId, list);
  }
}

export const store = new VerticalSliceStore();

/**
 * 1. Step 1: Process Form Submission & Identity Resolution
 */
export async function processFormSubmission(payload: FormSubmitPayload): Promise<{
  success: boolean;
  customer: Customer360Record;
  lead: Lead360Record;
  telegramAlertPayload: Record<string, unknown>;
  aiDraft: string;
  approvalRequestId: string;
}> {
  const wsId = payload.workspaceId || "ws_default_001";
  const normalizedPhone = normalizeVnPhone(payload.phone);
  const normalizedMail = payload.email ? normalizeEmail(payload.email) : undefined;

  // 1. Customer Identity Resolution & Merge
  let customer: Customer360Record | undefined;
  for (const c of Array.from(store.customers.values())) {
    if (c.primaryPhone === normalizedPhone) {
      customer = c;
      break;
    }
  }

  if (!customer) {
    const custId = `cust_${Date.now()}`;
    customer = {
      id: custId,
      workspaceId: wsId,
      fullName: payload.fullName,
      primaryPhone: normalizedPhone,
      primaryEmail: normalizedMail,
      lifecycleStage: "LEAD",
      leadScore: 60,
      lifetimeValue: 0,
      assignedSalesId: "sales_nam_01",
      assignedSalesName: "Nguyễn Văn Nam (Sales)",
      createdAt: new Date().toISOString(),
    };
    store.customers.set(custId, customer);
  } else {
    customer.fullName = payload.fullName || customer.fullName;
    customer.primaryEmail = normalizedMail || customer.primaryEmail;
    customer.lifecycleStage = "LEAD";
    customer.leadScore += 15;
  }

  store.formsSubmittedCount++;
  store.leadsCreatedCount++;

  // 2. Create Lead Record
  const leadId = `lead_${Date.now()}`;
  const lead: Lead360Record = {
    id: leadId,
    customerId: customer.id,
    workspaceId: wsId,
    source: payload.utmSource || "Website Landing Page",
    campaign: payload.utmCampaign || "Chương trình Tư vấn 2026",
    status: "NEW",
    score: customer.leadScore,
    assignedToId: "sales_nam_01",
    assignedToName: "Nguyễn Văn Nam (Sales)",
    createdAt: new Date().toISOString(),
  };

  store.leads.set(leadId, lead);

  // 3. Record Customer Timeline Event
  store.addTimelineEvent(
    customer.id,
    "FORM_SUBMITTED",
    "Gửi Form Tư Vấn Kênh Web",
    `Dịch vụ: ${payload.service || "Chưa chọn"} | Ghi chú: ${payload.note || "Không"} | UTM: ${payload.utmSource || "direct"}`
  );

  // 4. Generate Real-time Telegram Alert Payload
  const telegramAlertPayload = {
    chatId: "-10019827364",
    text: `🚨 **LEAD MỚI NÓNG từ Landing Page!**\n\n👤 **Khách hàng**: ${customer.fullName}\n📞 **SĐT**: ${customer.primaryPhone}\n🏥 **Dịch vụ**: ${payload.service || "Tư vấn tổng quát"}\n🎯 **Nguồn**: ${payload.utmSource || "Website Direct"}\n👤 **Phân công**: Nguyễn Văn Nam (Sales)\n\n👉 [Xem chi tiết Hồ sơ Customer 360](http://localhost:3001/admin/customers/${customer.id})`,
  };

  // 5. Generate AI Consultation Response Draft via OmniRoute Gateway
  const omniRes = await queryOmniRoute({
    profile: "business/fast",
    messages: [
      {
        role: "system",
        content: "Bạn là Sales AI Agent chuyên nghiệp cho nha khoa Tâm Đức Smile. Hãy soạn tin nhắn tư vấn và chào mừng cá nhân hóa cho khách hàng vừa điền form.",
      },
      {
        role: "user",
        content: `Khách hàng: ${customer.fullName}, SĐT: ${customer.primaryPhone}, Dịch vụ quan tâm: ${payload.service || "Răng Sứ"}, Ghi chú: ${payload.note || "Cần báo giá"}`,
      },
    ],
    workspaceId: wsId,
  });

  const aiDraft = omniRes.content || `Chào ${customer.fullName}, em là Nam từ Tâm Đức Smile. Em đã nhận được yêu cầu tư vấn dịch vụ ${payload.service || "Nha khoa"} của anh/chị. Em xin phép gửi thông tin chi tiết ạ!`;

  // 6. Submit AI Response Draft to Approval Center
  const appr = await createApprovalRequest({
    workspaceId: wsId,
    requesterId: "sales_agent_ai",
    requesterRole: "AGENT_SERVICE_ACCOUNT",
    actionType: "SEND_CUSTOMER_MESSAGE",
    resource: "conversation",
    resourceId: leadId,
    payload: {
      customerId: customer.id,
      phone: customer.primaryPhone,
      messageDraft: aiDraft,
    },
    description: `Gửi tin nhắn tư vấn tự động cho Lead ${customer.fullName} (${customer.primaryPhone})`,
  });

  store.approvals.set(appr.requestId, {
    requestId: appr.requestId,
    status: appr.status,
    customer,
    lead,
    aiDraft,
    createdAt: new Date().toISOString(),
  });

  // Audit Log
  await recordAuditLog({
    workspaceId: wsId,
    actorId: "system_form_handler",
    actorRole: "SYSTEM",
    action: "sites:form_submit",
    resource: "customer",
    resourceId: customer.id,
    changesAfter: { customer, lead, approvalRequestId: appr.requestId },
  });

  return {
    success: true,
    customer,
    lead,
    telegramAlertPayload,
    aiDraft,
    approvalRequestId: appr.requestId,
  };
}

/**
 * 2. Step 2: Approve AI Response Draft & Dispatch Message
 */
export async function approveDraftAndDispatch(
  requestId: string,
  managerUserId: string,
  approvedContent?: string
): Promise<{ success: boolean; message: string; approvalStatus: ApprovalStatus }> {
  const item = store.approvals.get(requestId);
  if (!item) {
    return { success: false, message: "Approval request not found", approvalStatus: "CANCELLED" };
  }

  const decision = await processApprovalDecision(requestId, "APPROVED", managerUserId, "MANAGER", item.customer.workspaceId);

  item.status = decision.status;
  if (approvedContent) item.aiDraft = approvedContent;

  store.addTimelineEvent(
    item.customer.id,
    "MESSAGE_DISPATCHED",
    "Gửi Tin Nhắn Tư Vấn Cho Khách",
    `Nội dung tin nhắn: "${item.aiDraft.slice(0, 80)}..." (Đã phê duyệt bởi Manager)`
  );

  return {
    success: true,
    message: `Đã phê duyệt và gửi tin nhắn tư vấn tới khách hàng ${item.customer.fullName}!`,
    approvalStatus: decision.status,
  };
}

/**
 * 3. Step 3: Convert Lead to Order & Update Lifetime Value
 */
export async function convertLeadToOrder(
  leadId: string,
  orderAmount: number,
  orderItemsDescription?: string
): Promise<{ success: boolean; order: Order360Record; customer: Customer360Record }> {
  let lead: Lead360Record | undefined;
  for (const l of Array.from(store.leads.values())) {
    if (l.id === leadId) {
      lead = l;
      break;
    }
  }

  const customerId = lead ? lead.customerId : Array.from(store.customers.keys())[0];
  const customer = store.customers.get(customerId)!;

  // 1. Create Order Record
  const orderId = `ord_${Date.now()}`;
  const order: Order360Record = {
    id: orderId,
    workspaceId: customer.workspaceId,
    customerId: customer.id,
    orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    totalAmount: orderAmount,
    status: "PAID",
    paidAt: new Date().toISOString(),
  };

  store.orders.set(orderId, order);

  // 2. Update Customer Lifecycle Stage & LTV
  customer.lifecycleStage = "CUSTOMER";
  customer.lifetimeValue += orderAmount;
  if (lead) lead.status = "CONVERTED";

  store.ordersConvertedCount++;
  store.totalRevenueAmount += orderAmount;

  // 3. Record Customer Timeline Event
  store.addTimelineEvent(
    customer.id,
    "ORDER_COMPLETED",
    `Đơn Hàng Mới ${order.orderNumber}`,
    `Chi tiết: ${orderItemsDescription || "Dịch vụ Nha khoa Răng Sứ Thẩm Mỹ"} | Giá trị: ${orderAmount.toLocaleString("vi-VN")}đ`
  );

  // 4. Create Post-Purchase Follow-up Task Timeline Event
  store.addTimelineEvent(
    customer.id,
    "POST_PURCHASE_TASK",
    "Lên Lịch Chăm Sóc Sau Mua (CSKH D+3)",
    "Hệ thống tự động lên lịch nhắc CSKH gọi điện hỏi thăm sự hài lòng sau 3 ngày."
  );

  return {
    success: true,
    order,
    customer,
  };
}

/**
 * 4. Step 4: Get Real-time Funnel & Conversion Analytics Metrics
 */
export function getVerticalSliceFunnelMetrics() {
  const visitors = store.visitorsCount;
  const forms = store.formsSubmittedCount;
  const leads = store.leadsCreatedCount;
  const orders = store.ordersConvertedCount;
  const revenue = store.totalRevenueAmount;

  const formConversionRate = visitors > 0 ? Number(((forms / visitors) * 100).toFixed(1)) : 0;
  const orderConversionRate = leads > 0 ? Number(((orders / leads) * 100).toFixed(1)) : 0;

  return {
    visitors,
    forms,
    leads,
    orders,
    revenue,
    formConversionRate,
    orderConversionRate,
    recentTimelineEvents: Array.from(store.timeline.values()).flat().slice(0, 10),
    approvalQueue: Array.from(store.approvals.values()).slice(0, 5),
  };
}
