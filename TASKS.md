# LƯỜI BUSINESS OS — Task Tracking Matrix

## Core Architecture Scope
> **60 Fanpages / Zalo / WhatsApp / Webchat / Form** → **1 Unified CRM** → **Phân loại Data** → **Chăm sóc** → **Remarketing & CAPI** → **Đo đơn & P&L từng Page**.
> *(Lưu ý: VTtech Chrome Extension là công cụ độc lập, không nằm trong LƯỜI CMS).*

---

## Phase 0: System Architecture & Foundation Baseline
| Task ID | Priority | Status | Description | File / Module |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-P0-01` | P0 | `DONE` | Comprehensive Documentation Suite Setup | `docs/*`, `TASKS.md` |
| `TASK-P0-02` | P0 | `DONE` | Workspace & 9-Tier RBAC Engine | `src/lib/rbac.ts` |
| `TASK-P0-03` | P0 | `DONE` | Append-Only Audit Logging Engine | `src/lib/audit.ts` |
| `TASK-P0-04` | P0 | `DONE` | AES-256 Secret Encryption Engine | `src/lib/crypto.ts` |
| `TASK-P0-05` | P0 | `DONE` | OmniRoute Model Gateway Client | `src/lib/omniroute.ts` |
| `TASK-P0-06` | P0 | `DONE` | OpenClaw Agent Sidecar Adapter | `src/lib/openclaw.ts` |
| `TASK-P0-07` | P0 | `DONE` | Business MCP Hub Namespace Registry | `src/lib/mcp-hub.ts` |
| `TASK-P0-08` | P0 | `DONE` | Approval Center Engine | `src/lib/approval.ts` |
| `TASK-P0-09` | P0 | `DONE` | Customer 360 Identity Resolution Engine | `src/lib/identity-resolution.ts` |
| `TASK-P0-10` | P0 | `DONE` | System Diagnostics & Health Check API | `src/app/api/system/health/route.ts` |

---

## Phase 1: Lười CMS & Taxonomy SEO Hub
| Task ID | Priority | Status | Description | File / Module |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-P1-01` | P1 | `DONE` | Brand Kit, Product & Category Taxonomy Schema | `prisma/schema.prisma` |
| `TASK-P1-02` | P0 | `DONE` | **Category Taxonomy Full SEO Engine** (SEO Title, Description, Canonical, OG Image, JSON-LD Schema) | `src/app/admin/categories/` |
| `TASK-P1-03` | P1 | `PLANNED` | Content Calendar & Campaign Manager | `src/app/admin/cms/` |

---

## Phase 2: Lười Sites & Multi-Platform Ad CAPI Tracking
| Task ID | Priority | Status | Description | File / Module |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-P2-01` | P0 | `DONE` | **Visual Studio / Puck Builder with Full SEO Suite** (SEO Title, Description, OG Image, Canonical, Keywords, NoIndex, SERP Preview) | `src/app/admin/pages/` |
| `TASK-P2-02` | P0 | `DONE` | **Meta CAPI Multi-Stage Engine** (`CompleteRegistration` on Form, `Lead` on Qualify/Schedule, `Purchase` on Store Payment) | `src/lib/meta-capi.ts`, `src/lib/ads-service.ts` |
| `TASK-P2-03` | P0 | `DONE` | **Google Ads AI Learning Engine** (Enhanced Conversions + OCI for `gclid`, `gbraid`, `wbraid`, hashed phone/email, purchase value) | `src/lib/google-ads.ts` |
| `TASK-P2-04` | P1 | `IN_PROGRESS` | Embedded Web Chat Widget SDK | `public/sdk/chat.js` |

---

## Phase 3: Customer 360 & Unified CRM
| Task ID | Priority | Status | Description | File / Module |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-P3-01` | P0 | `DONE` | Unified MiniCRM Dashboard (Telesale, Branch, Service, Revenue, Date filters) | `src/app/admin/crm/` |
| `TASK-P3-02` | P0 | `DONE` | 2-Way Google Sheets TDS Parser Sync Engine | `src/lib/tds-parser.ts`, `src/lib/google-sheets.ts` |
| `TASK-P3-03` | P1 | `IN_PROGRESS` | Customer 360 Full Timeline Journey View (All Touchpoints per Phone) | `src/app/admin/customers/` |
| `TASK-P3-04` | P1 | `PLANNED` | Automated Deduplication & Merge Multi-Opportunity Rule | `src/lib/identity-resolution.ts` |

---

## Phase 4: Omnichannel Inbox & Multi-Channel Connectors
| Task ID | Priority | Status | Description | File / Module |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-P4-01` | P0 | `DONE` | Omnichannel Intent & Customer Insight Analytics | `src/app/admin/omnichannel/` |
| `TASK-P4-02` | P0 | `IN_PROGRESS` | Realtime Websocket Omnichannel Live Chat Inbox | `src/app/admin/inbox/` |
| `TASK-P4-03` | P1 | `PLANNED` | Zalo OA Official API Connector & Webhook | `src/lib/connectors/zalo.ts` |
| `TASK-P4-04` | P1 | `PLANNED` | WhatsApp Business Platform Cloud API Connector | `src/lib/connectors/whatsapp.ts` |

---

## Phase 5: OpenClaw, OmniRoute & MCP Hub Integration
| Task ID | Priority | Status | Description | File / Module |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-P5-01` | P0 | `DONE` | OmniRoute Model Gateway Client & Fallback profiles | `src/lib/omniroute.ts` |
| `TASK-P5-02` | P1 | `DONE` | OpenClaw Agent Sidecar Adapter & MCP Registry | `src/lib/openclaw.ts`, `src/lib/mcp-hub.ts` |

---

## Phase 6: Workflows & SLA Care
| Task ID | Priority | Status | Description | File / Module |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-P6-01` | P0 | `DONE` | Approval Center Engine & Interceptors | `src/lib/approval.ts` |
| `TASK-P6-02` | P1 | `IN_PROGRESS` | Automated SLA Telegram Alerts when new lead > 15m unhandled | `src/lib/notification-service.ts` |

---

## Phase 7: Attribution & P&L per Fanpage (60 Pages)
| Task ID | Priority | Status | Description | File / Module |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-P7-01` | P0 | `DONE` | Meta Ads Campaign Performance Dashboard | `src/app/admin/meta-ads/` |
| `TASK-P7-02` | P0 | `DONE` | CRM Revenue Breakdown by Source & Branch | `src/app/admin/crm/` |
| `TASK-P7-03` | P0 | `IN_PROGRESS` | **P&L and Real ROAS per Fanpage** (Spend vs Actual Revenue per Page) | `src/app/admin/analytics/` |
