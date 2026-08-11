# LƯỜI BUSINESS OS — System Architecture Blueprint

## Architectural Overview

**LƯỜI BUSINESS OS** uses a **Modular Monolith Architecture** with sidecar services for AI capabilities. This keeps deployment simple, avoids microservice overhead, and enables high-performance internal event processing.

```
+-------------------------------------------------------------------------------+
|                             LƯỜI BUSINESS OS (Core App)                       |
|                                                                               |
|  +----------------+  +----------------+  +----------------+  +-------------+  |
|  |   Lười CMS     |  |   Lười Sites   |  |  Lười Inbox    |  | Lười CRM    |  |
|  +----------------+  +----------------+  +----------------+  +-------------+  |
|  |  Brand & Kit   |  | Landing Pages  |  | Omnichannel    |  | Customer    |  |
|  | Products/Offers|  | Forms & Widget |  |  Conversations |  | 360 & Pipeline|
|  +----------------+  +----------------+  +----------------+  +-------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                          CORE INFRASTRUCTURE ENGINE                     |  |
|  |  - Workspace Isolation & 9-Tier RBAC                                    |  |
|  |  - Customer 360 Identity Resolution Engine                              |  |
|  |  - Append-Only Audit Logging & AES-256 Secret Encryption                |  |
|  |  - Approval Center Engine (Read-Only / Draft / Execute)                 |  |
|  |  - Business MCP Hub Tool Layer (Namespaces: cms.*, customer.*, etc.)    |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
           |                                                      |
           v HTTP / JSON API                                      v OpenAI API (`/v1`)
+----------------------------+                          +-------------------------------+
|      OpenClaw Sidecar      |                          |       OmniRoute Sidecar       |
|    (Agent Runtime Service) |                          |   (AI Model Gateway Service)  |
| - Agent Session Manager    |                          | - Endpoint: http://127.0.0.1: |
| - Skill Execution Engine   |                          |   20128/v1                    |
| - Cron & Job Scheduler     |                          | - Model Profiles:             |
| - Channel Bridge Adapter   |                          |   business/fast, quality,     |
|                            |                          |   creative, private, vision   |
+----------------------------+                          +-------------------------------+
```

---

## Component Responsibilities

### 1. Core Platform Components
- **Lười CMS**: Single source of truth for brand, products, services, offers, personas, campaigns, and content versions.
- **Lười Sites**: Block-based landing pages, form builder, conversion SDK, and first/last-touch attribution tracking.
- **Lười Inbox**: Omnichannel message store aggregating Web Chat, Telegram, Zalo OA, Meta Messenger, Pancake, and WhatsApp.
- **Lười CRM 360**: Unified customer identity graph, interaction timeline, lead pipelines, quotes, orders, appointments, and tickets.
- **Lười Brain**: Enterprise knowledge base, SOPs, brand voice rules, and long-term customer memory storage.

### 2. Sidecar Services
- **OmniRoute Model Gateway**:
  - Endpoint: `http://127.0.0.1:20128/v1`
  - Responsible for model routing, provider fallback, circuit breaking, quota tracking, and cost calculation.
  - OpenAI-compatible API interface.
- **OpenClaw Agent Runtime**:
  - Manages agent definitions, session state, scheduled jobs, tool call dispatches, and channel integrations.
  - Interacts with Business MCP Hub via namespaced tool requests.

### 3. Core Engine Layer
- **Business MCP Hub**: Server-side tool execution gateway. Validates tool call parameters via JSON Schema, checks user/workspace permissions, performs audit logging, and enforces dry-run/approval policies.
- **Approval Center**: Interceptor for sensitive AI or human actions (ad spend, price overrides, data deletion, contract dispatch, refunds).
- **Customer 360 Identity Resolver**: Normalizes Vietnamese phone numbers and emails to merge multi-channel contact points into a single customer profile with undo capability.
