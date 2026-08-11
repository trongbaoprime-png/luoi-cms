# LƯỜI BUSINESS OS — Unified Connector Framework & Capabilities

## Unified Connector Interface (`ConnectorAdapter`)

Every channel integration implements a standard lifecycle and event normalization pipeline:

```typescript
export interface ConnectorAdapter {
  id: string;
  name: string;
  provider: "WEB_FORM" | "WEB_CHAT" | "TELEGRAM" | "ZALO_OA" | "META_MESSENGER" | "PANCAKE" | "WHATSAPP" | "EMAIL";
  
  // Lifecycle
  connect(config: Record<string, unknown>): Promise<{ success: boolean; connectionId?: string; error?: string }>;
  disconnect(connectionId: string): Promise<boolean>;
  validateCredentials(credentials: Record<string, unknown>): Promise<boolean>;
  healthCheck(connectionId: string): Promise<{ status: "HEALTHY" | "DEGRADED" | "DOWN"; latencyMs: number }>;

  // Event Normalization
  receiveWebhook(rawBody: string, headers: Record<string, string>): Promise<NormalizedEvent[]>;
  normalizeInboundMessage(rawMessage: unknown): NormalizedMessage;

  // Messaging Outbound
  sendMessage(conversationId: string, content: string, options?: MessageOptions): Promise<SendResult>;
  sendAttachment(conversationId: string, fileUrl: string, fileType: string): Promise<SendResult>;
  
  // Capabilities
  listCapabilities(): ConnectorCapabilities;
}
```

---

## Connector Capability Matrix

| Connector | Type | Webhook Signature | Idempotency Key | Realtime Outbound | Official API? | Production Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Web Form Receiver** | Inbound | Secret Token | Yes (`submissionId`) | No | Yes | Production Ready |
| **Web Chat Widget** | 2-Way | HMAC-SHA256 | Yes (`messageId`) | Yes (Websockets) | Yes | Production Ready |
| **Telegram Bot** | 2-Way | Secret Token | Yes (`update_id`) | Yes (HTTP API) | Yes | Production Ready |
| **Zalo OA Official** | 2-Way | MAC Verification | Yes (`msg_id`) | Yes (OpenAPI) | Yes | Production Ready |
| **Meta Messenger** | 2-Way | SHA256 Signature | Yes (`mid`) | Yes (Graph API) | Yes | Production Ready |
| **Pancake API** | 2-Way | HMAC Token | Yes (`id`) | Yes (Pancake API) | Yes | Production Ready |
| **WhatsApp Business**| 2-Way | SHA256 Signature | Yes (`wamid`) | Yes (Cloud API) | Yes | Production Ready |
| **Zalo Personal (Experimental)** | 2-Way | None | Best Effort | Best Effort | No (Unofficial) | **Experimental (Warning)** |

---

## Webhook Processing Architecture

```
+-------------------+      HMAC / Token       +-------------------------+
| External Provider | ---------------------> | /api/connectors/webhook |
| (Meta/Zalo/etc.)  |                         +-------------------------+
+-------------------+                                      |
                                                           v
                                              +-------------------------+
                                              | 1. Signature Verify     |
                                              | 2. Idempotency Dedupe   |
                                              | 3. Raw Event Storage    |
                                              +-------------------------+
                                                           |
                                                           v
                                              +-------------------------+
                                              | Normalize Inbound Event |
                                              +-------------------------+
                                                           |
                                                           v
                                              +-------------------------+
                                              | Customer Identity Match |
                                              | & Timeline Stream Update|
                                              +-------------------------+
```
