# LƯỜI BUSINESS OS — Master Data Model Specification

## Domain Entity Groups

```
+-----------------------------------------------------------------------------------+
|                                  DOMAIN ENTITIES                                  |
+-------------------+-------------------+--------------------+----------------------+
| 1. PLATFORM & RBAC| 2. BRAND & CONTENT| 3. CUSTOMER 360    | 4. CONVERSATIONS     |
| - Workspace       | - Brand           | - Customer         | - Channel            |
| - User            | - Product         | - CustomerIdentity | - ChannelAccount     |
| - Role            | - Offer           | - CustomerAddress  | - Conversation       |
| - Permission      | - Campaign        | - CustomerTimeline | - Message            |
| - AuditLog        | - LandingPage     | - Lead             | - MessageAttachment  |
| - ApiKey          | - Form            | - Opportunity      | - SLAStatus          |
| - SystemSetting   | - FormSubmission  | - Order / Quote    | - AgentHandoff       |
+-------------------+-------------------+--------------------+----------------------+
| 5. TRACKING       | 6. AI & AGENTS    | 7. CONNECTORS      | 8. BRAIN & KNOWLEDGE |
| - WebSession      | - AgentDefinition | - ConnectorAccount | - KnowledgeSpace     |
| - WebEvent        | - AgentRun        | - ConnectorCred    | - KnowledgeDocument  |
| - AttributionTouch| - WorkflowRun     | - WebhookEndpoint  | - KnowledgeChunk     |
| - UTMData         | - ApprovalRequest | - SyncJob          | - WikiPage           |
+-------------------+-------------------+--------------------+----------------------+
```

---

## Complete Entity Schema Definition

### 1. Platform & Core Governance
- `Workspace`: `id`, `name`, `slug`, `domain`, `plan`, `settings`, `createdAt`, `updatedAt`
- `WorkspaceMember`: `id`, `workspaceId`, `userId`, `roleId`, `status`, `joinedAt`
- `User`: `id`, `email`, `fullName`, `phone`, `passwordHash`, `avatarUrl`, `isSuperAdmin`, `createdAt`
- `Role`: `id`, `workspaceId`, `name`, `code`, `description`, `isSystem`
- `Permission`: `id`, `roleId`, `action`, `resource`, `conditions`
- `ApiKey`: `id`, `workspaceId`, `name`, `keyHash`, `scopes`, `expiresAt`, `lastUsedAt`
- `AuditLog`: `id`, `workspaceId`, `actorId`, `actorRole`, `action`, `resource`, `resourceId`, `changesBefore`, `changesAfter`, `ipAddress`, `userAgent`, `correlationId`, `createdAt`
- `SystemSetting`: `id`, `workspaceId`, `key`, `value`, `isEncrypted`, `updatedAt`

### 2. Brand & Content Management
- `Brand`: `id`, `workspaceId`, `name`, `logoUrl`, `primaryColor`, `secondaryColor`, `typography`, `voiceGuidelines`
- `Product`: `id`, `workspaceId`, `brandId`, `sku`, `name`, `slug`, `description`, `price`, `currency`, `category`, `isActive`
- `ProductVariant`: `id`, `productId`, `sku`, `variantName`, `price`, `stockQuantity`, `attributes`
- `Offer`: `id`, `workspaceId`, `name`, `code`, `discountType`, `discountValue`, `validFrom`, `validTo`
- `Campaign`: `id`, `workspaceId`, `name`, `budget`, `startDate`, `endDate`, `status`, `targetAudience`
- `LandingPage`: `id`, `workspaceId`, `title`, `slug`, `puckData`, `seoTitle`, `seoDescription`, `isPublished`, `publishedAt`
- `Form`: `id`, `workspaceId`, `landingPageId`, `title`, `fieldsSchema`, `submitCtaText`, `successMessage`
- `FormSubmission`: `id`, `workspaceId`, `formId`, `customerIdentityId`, `rawPayload`, `utmData`, `ipAddress`, `submittedAt`

### 3. Customer 360 & CRM
- `Customer`: `id`, `workspaceId`, `primaryPhone`, `primaryEmail`, `fullName`, `lifecycleStage`, `leadScore`, `lifetimeValue`, `assignedSalesId`, `createdAt`, `updatedAt`
- `CustomerIdentity`: `id`, `customerId`, `identityType` (PHONE, EMAIL, MESSENGER, ZALO, TELEGRAM, PANCAKE, WHATSAPP, COOKIE), `identityValue`, `isVerified`, `linkedAt`
- `CustomerAddress`: `id`, `customerId`, `street`, `ward`, `district`, `city`, `country`, `isDefault`
- `CustomerTimelineEvent`: `id`, `customerId`, `eventType`, `title`, `payload`, `actorType`, `actorId`, `occurredAt`
- `Lead`: `id`, `workspaceId`, `customerId`, `source`, `campaignId`, `status`, `score`, `assignedToId`, `createdAt`
- `Pipeline`: `id`, `workspaceId`, `name`, `stages`
- `Opportunity`: `id`, `workspaceId`, `customerId`, `pipelineStageId`, `expectedValue`, `closeDate`, `status`
- `Quote`: `id`, `workspaceId`, `customerId`, `quoteNumber`, `totalAmount`, `status`, `validUntil`
- `Order`: `id`, `workspaceId`, `customerId`, `orderNumber`, `status`, `totalAmount`, `paymentStatus`, `paidAt`

### 4. Omnichannel Conversations
- `Channel`: `id`, `workspaceId`, `provider` (WEB_CHAT, TELEGRAM, ZALO, MESSENGER, PANCAKE, WHATSAPP), `name`, `isActive`
- `ChannelAccount`: `id`, `channelId`, `accountExternalId`, `accountName`, `credentialsRef`, `status`
- `Conversation`: `id`, `workspaceId`, `channelAccountId`, `customerId`, `externalId`, `status`, `assignedAgentId`, `lastMessageAt`
- `Message`: `id`, `conversationId`, `senderType` (CUSTOMER, AGENT, BOT, SYSTEM), `senderId`, `content`, `attachments`, `externalId`, `createdAt`

### 5. Tracking & Attribution
- `WebSession`: `id`, `workspaceId`, `visitorId`, `ipAddress`, `userAgent`, `landingPage`, `referrer`, `utmSource`, `utmMedium`, `utmCampaign`, `startedAt`
- `AttributionTouch`: `id`, `customerId`, `sessionId`, `touchType` (FIRST_TOUCH, LAST_TOUCH, ASSISTED), `channel`, `campaign`, `timestamp`

### 6. AI & Automation
- `AgentDefinition`: `id`, `workspaceId`, `name`, `code` (CEO, MARKETING, SALES, CSKH), `systemRole`, `allowedTools`, `modelProfile`, `maxActionLimit`
- `AgentRun`: `id`, `workspaceId`, `agentDefinitionId`, `triggerSource`, `status`, `totalTokens`, `totalCost`, `startedAt`, `completedAt`
- `ApprovalRequest`: `id`, `workspaceId`, `requesterType`, `requesterId`, `actionType`, `resource`, `payload`, `status` (PENDING, APPROVED, REJECTED, EXPIRED), `decidedById`, `decidedAt`

### 7. Connectors & External Integrations
- `ConnectorAccount`: `id`, `workspaceId`, `connectorType`, `name`, `healthStatus`, `lastHealthCheckAt`
- `WebhookEndpoint`: `id`, `workspaceId`, `path`, `secretRef`, `isActive`

### 8. Knowledge & Brain Engine
- `KnowledgeSpace`: `id`, `workspaceId`, `name`, `description`
- `KnowledgeDocument`: `id`, `spaceId`, `title`, `content`, `format`, `version`, `sourceUrl`
- `KnowledgeChunk`: `id`, `documentId`, `chunkIndex`, `text`, `embedding`
