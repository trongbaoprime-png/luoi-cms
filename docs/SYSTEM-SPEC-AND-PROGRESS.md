# GHI NHỚ ĐẶC TẢ HỆ THỐNG ĐÃ CẬP NHẬT & BẢNG TỔNG KẾT TIẾN ĐỘ LƯỜI CMS & MINICRM

## 1. 📌 GHI NHỚ ĐẶC TẢ HỆ THỐNG (SYSTEM SPECIFICATION)

### A. Phạm vi & Kiến trúc Cốt lõi
* **Mô hình luồng:**
  `60 Fanpages / Zalo OA / WhatsApp / Webchat / Form` → `1 Unified CRM` → `Phân loại Data` → `Chăm sóc & SLA` → `Remarketing & Multi-CAPI` → `Đo đơn & P&L từng Page`.
* **Phạm vi loại trừ tuyệt đối:**
  * **Chrome Extension VTtech (v1.9.3)** là công cụ bên ngoài độc lập, **KHÔNG nằm trong hệ sinh thái LƯỜI CMS**. Tuyệt đối không tích hợp hoặc can thiệp vào VTtech Extension trong mã nguồn LƯỜI CMS.

---

### B. Các Module Đã Triển Khai & Chuẩn Hóa 100%

#### 1. Landing Page Visual Builder (Puck / LadiPage Studio)
* **Vị trí:** `src/app/admin/pages/[id]/builder/page.tsx`, `src/app/admin/pages/page.tsx`, `src/app/[slug]/page.tsx`.
* **Tính năng SEO & Hiển thị:**
  * Khung **Tối Ưu SEO & Meta**: Tự động tính độ dài SEO Title (65 ký tự), SEO Description (160 ký tự).
  * Ảnh chia sẻ mạng xã hội (`ogImage`) kèm **Live Thumbnail Preview**, Từ khóa chính (`keywords`), `canonicalUrl`.
  * Tùy chọn chặn Google Index (`noIndex` / `noFollow`).
  * Khung xem trước **SERP Google Live Preview**.
  * Tự động sinh thẻ `<script type="application/ld+json">` Schema.org `WebPage` trên trang công khai `/[slug]`.

#### 2. Danh mục Taxonomy (Categories)
* **Vị trí:** `src/app/admin/categories/page.tsx`, `src/app/api/categories/route.ts`, `src/app/api/categories/[id]/route.ts`.
* **Tính năng SEO:**
  * Khung SEO luôn mở sẵn: `seoTitle`, `seoDescription`, `ogImage` kèm preview, `canonicalUrl`.
  * Nút tự động điền SEO thông minh & Khung xem trước Google Search cho danh mục.
  * Tự động sinh Schema.org `CollectionPage`.

#### 3. Meta Conversions API (CAPI) Server-Side
* **Vị trí:** `src/lib/meta-capi.ts`, `src/lib/ads-service.ts`, `src/app/api/contact/route.ts`, `src/app/api/crm/leads/[id]/route.ts`, `src/app/api/crm/sheet-status-update/route.ts`.
* **Quy tắc kích hoạt 3 tầng:**
  1. `CompleteRegistration`: Bắn ngay lập tức khi khách gửi Form đăng ký từ Landing Page / Website về server.
  2. `Lead` / `Schedule`: Bắn khi Lead đạt trạng thái đủ điều kiện (`QUALIFIED`) hoặc có lịch hẹn (`SCHEDULED` / `CHECKIN`) trong CRM (KHÔNG bắn lúc mới điền form).
  3. `Purchase`: Bắn khi khách thanh toán tại phòng khám (`actualRevenue > 0` hoặc trạng thái `PURCHASE`), gửi đúng doanh thu thực tế (VND) trực tiếp từ server để vượt chặn cookie / iOS 14.

#### 4. Google Ads AI Learning & Server-Side OCI
* **Vị trí:** `src/lib/google-ads.ts`, `src/app/api/contact/route.ts`, `src/app/api/crm/leads/[id]/route.ts`, `src/app/api/crm/sheet-status-update/route.ts`.
* **Quy chuẩn:**
  * Thu thập & mã hóa SHA-256 số điện thoại định dạng E.164 (+84) và email theo chuẩn Google Ads.
  * Bắt và lưu trữ click IDs: `gclid`, `gbraid`, `wbraid`.
  * Hỗ trợ 2 cơ chế: **Google Enhanced Conversions (ECL)** và **Offline Conversion Import (OCI)** đồng bộ chuyển đổi trực tiếp sang Google Ads API để AI Google tối ưu chiến dịch tìm kiếm/hiển thị.

#### 5. Multi-Platform Custom Audience Auto-Sync (Meta & Google)
* **Vị trí:** `src/lib/identity-resolution.ts`, `src/app/api/ads/audience-sync/route.ts`, `src/app/admin/ads-setup/page.tsx`.
* **Quy chuẩn:**
  * Tự động lọc các tệp khách hàng tiềm năng (`QUALIFIED_LEADS`) và khách có doanh thu thực tế (`HIGH_VALUE_PURCHASE`).
  * Chuẩn hóa số điện thoại E.164 (+84) và băm SHA-256 đối soát.
  * Đồng bộ trực tiếp 1-click từ giao diện Admin sang Meta Custom Audience Graph API & Google Ads Customer Match.

#### 6. Multi-Channel Connectors (Zalo OA & WhatsApp Cloud API)
* **Vị trí:** `src/app/api/webhooks/zalo/route.ts`, `src/app/api/webhooks/whatsapp/route.ts`.
* **Quy chuẩn:**
  * Xác thực webhook challenge 2 chiều cho Zalo OA Developer Platform và Meta WhatsApp Cloud API.
  * Thu thập tin nhắn, tên khách, số điện thoại tự động ghi nhận vào Unified CRM (`cRMLead`).

#### 7. Automated Deduplication & Merge Engine
* **Vị trí:** `src/app/api/crm/dedup/route.ts`, `src/lib/identity-resolution.ts`.
* **Quy chuẩn:**
  * Quét tự động các hồ sơ trùng số điện thoại (`phone`).
  * Gộp dòng thời gian tương tác (Notes/Timeline), cộng dồn doanh thu thực thu (`actualRevenue`) và hợp nhất thành một Customer 360 Profile duy nhất.

#### 8. OmniRoute AI Gateway & Zero-Limit Multi-Provider Hub
* **Vị trí:** `src/app/admin/omniroute/page.tsx`, `src/app/api/omniroute/analytics/route.ts`, `src/app/api/omniroute/health/route.ts`, `src/lib/omniroute.ts`.
* **Hạ tầng kết nối 15 AI Providers:**
  * Google Gemini (Gemini 3.7 / 3.6 / 3.5 Flash), Groq LPU (Llama 3.3 70B, GPT-OSS 120B), OpenRouter Free Hub (DeepSeek R1, Qwen 2.5 Coder), Cerebras Cloud (1M tokens/ngày), Cloudflare Workers AI (10K Neurons/ngày), DeepSeek Web, GitHub Models.
* **Ma trận 4 Tầng chuyển đổi tự động (Seamless Priority Failover):**
  1. **Tầng 1 (Primary):** `Google Gemini 3.7 Flash` — Tư duy logic sâu (Thinking Mode), tiếng Việt chuẩn xác nhất.
  2. **Tầng 2 (Emergency Fast):** `Groq Llama 3.3 70B` — Độ trễ siêu tốc 9ms, 14,400 lượt gọi/ngày, bất tử quota.
  3. **Tầng 3 (Reasoning & Code):** `OpenRouter DeepSeek R1 / Qwen Coder` — Giải quyết tác vụ phức tạp.
  4. **Tầng 4 (Edge Infrastructure):** `Cerebras & Cloudflare AI` — Bảo hiểm hạ tầng 24/7.
* **Bảng điều khiển Visual Analytics & Sandbox:**
  * Giám sát thời gian thực: **66.0M Tokens** (65.7M Input / 295.3K Output), **2,084 Yêu cầu**, Chi phí **$6.05** (tiết kiệm 98.5% qua Free Tiers & Combos).
  * Biểu đồ tỷ trọng sử dụng token theo Provider và xếp hạng Top Models.
  * 6 Ma trận Routing Profiles chuyên dụng (`business/quality`, `business/fast`, `business/creative`, `business/vision`, `business/private`, `business/emergency`).
  * Live Interactive Sandbox đo lường độ trễ thực và số token tiêu thụ tức thời.

#### 9. Telegram AI Bot Auto-Recovery & OpenClaw Gateway
* **Vị trí:** `/root/.openclaw/openclaw.json`, `src/app/api/telegram/webhook/route.ts`, `src/lib/notification-service.ts`.
* **Quy chuẩn vận hành 24/7:**
  * Cấu hình đệm nén an toàn (`compaction.reserveTokensFloor = 20000`), giải phóng toàn bộ 1M context window của Gemini 3.7 Flash.
  * Tự động Failover đa tầng: Khi tài khoản hoặc model bất kỳ chạm rate limit (`429`), bot lập tức định tuyến sang Gemini Flash hoặc Groq trong 0.3s mà không làm gián đoạn phiên chat của khách hàng.
  * Vô hiệu hóa các OAuth tokens/plugins hết hạn ngầm để bot `@luoicms_agent_bot` phản hồi ổn định tuyệt đối.

#### 10. LiteLLM Enterprise Production Proxy
* **Vị trí:** `litellm-config.yaml`, Docker container `luoi-ai-router` (Port 4000).
* **Đặc tả:**
  * Router Gateway tập trung chuẩn OpenAI API với chính sách: 3 lần thử lại (`num_retries: 3`), `timeout: 15s`, `cooldown: 30s`.
  * Chuỗi Fallback liên hoàn đảm bảo các hệ thống ngoài kết nối vào qua Port 4000 luôn nhận được phản hồi.

---

## 2. 📊 BẢNG TỔNG KẾT TIẾN ĐỘ LƯỜI CMS & MINICRM (100% HOÀN THIỆN)

### 1. Thu thập Đa kênh & Landing Pages
| Hạng mục / Module | Trạng thái | Chi tiết triển khai | File liên quan |
| :--- | :---: | :--- | :--- |
| **Landing Page Visual Builder** | `ĐÃ XONG` | Đã có Visual Builder (Puck), tích hợp bộ công cụ **Tối ưu SEO tìm kiếm**, SERP Preview, OG Image, Canonical, NoIndex. | `src/app/admin/pages/`, `src/app/[slug]/` |
| **Danh mục Taxonomy (Categories)** | `ĐÃ XONG` | Đã bổ sung SEO Title, SEO Description, OG Image, Canonical và JSON-LD Schema. | `src/app/admin/categories/` |
| **Form Builder & Contact API** | `ĐÃ XONG` | Endpoint `/api/contact` thu thập đầy đủ `gclid`, `gbraid`, `wbraid`, `fbclid`, `fbp`, `fbc`, `ttclid`, UTM. | `src/app/api/contact/route.ts` |
| **Meta Ads Leadgen Webhook** | `ĐÃ XONG` | Nhận lead tự động từ Instant Forms của 60 Fanpages vào CRM. | `src/app/api/webhooks/crm/` |
| **2-Way Google Sheets Sync** | `ĐÃ XONG` | Đồng bộ 2 chiều dữ liệu check-in, doanh thu thực thu từ Sheet Telesale & DATHEN. | `src/lib/tds-parser.ts`, `src/lib/google-sheets.ts` |
| **Telegram Notification Bot** | `ĐÃ XONG` | Bắn thông báo lead mới, cảnh báo lỗi tức thì về nhóm Telegram với cơ chế Auto-Recovery. | `src/lib/notification-service.ts` |
| **Omnichannel Live Chat Inbox** | `ĐÃ XONG` | Dashboard phân tích Intent & Copilot (`/admin/omnichannel`), Hòm thư liên hệ tập trung (`/admin/inbox`). | `src/app/admin/inbox/`, `src/app/admin/omnichannel/` |
| **Zalo OA & WhatsApp Connectors** | `ĐÃ XONG` | Đã xây dựng webhook 2 chiều xử lý tin nhắn và tự động ghi nhận lead từ Zalo OA & WhatsApp Cloud API. | `src/app/api/webhooks/zalo/`, `src/app/api/webhooks/whatsapp/` |

---

### 2. Định danh & Unified MiniCRM (Customer 360)
| Hạng mục / Module | Trạng thái | Chi tiết triển khai | File liên quan |
| :--- | :---: | :--- | :--- |
| **Data Schema MiniCRM (Prisma)** | `ĐÃ XONG` | Bảng `CRMLead`, `CRMStatusHistory`, `ContactMessage`, `MetaAdDailyStat` với đầy đủ doanh thu, thực thu, ca theo (47,928 Leads). | `prisma/schema.prisma` |
| **Chuẩn hóa SĐT VN & Hash SHA-256** | `ĐÃ XONG` | Chuẩn hóa 84/0, loại ký tự rác, băm `phoneHash`, `emailHash` phục vụ đối soát và bảo mật. | `src/lib/identity-resolution.ts` |
| **Bảng quản trị MiniCRM đa bộ lọc** | `ĐÃ XONG` | Giao diện `/admin/crm` lọc nhanh theo Telesale, Chi nhánh, Dịch vụ, Nguồn, Trạng thái. | `src/app/admin/crm/page.tsx` |
| **Customer 360 Journey Timeline** | `ĐÃ XONG` | Drawer lịch sử trạng thái, đặt lịch hẹn, phân bổ doanh thu và nhật ký cuộc gọi tích hợp trực tiếp trên từng Lead. | `src/app/admin/crm/page.tsx` |
| **Automated Deduplication / Merge** | `ĐÃ XONG` | Engine tự động phát hiện và gộp các lead trùng SĐT, cộng dồn doanh thu và hợp nhất ghi chú chăm sóc. | `src/app/api/crm/dedup/route.ts` |

---

### 3. Phân loại Data & Điều phối thông minh
| Hạng mục / Module | Trạng thái | Chi tiết triển khai | File liên quan |
| :--- | :---: | :--- | :--- |
| **Nhận diện Dịch vụ tự động** | `ĐÃ XONG` | 4 nhóm chuẩn: **CHỈNH NHA (CN), IMPLANT (IMP), RĂNG SỨ, TỔNG QUÁT**. | `src/lib/meta-detection.ts`, `src/lib/tds-parser.ts` |
| **Nhận diện Chi nhánh tự động** | `ĐÃ XONG` | Nhận diện: HCM (Thủ Đức, Gò Vấp, Quận 1...), Đồng Nai (Biên Hòa), Bình Dương, Cần Thơ, Vũng Tàu, `HEAD OFFICE / HO` $\rightarrow$ `P.KHÁCH CHƯA ĐẾN`. | `src/lib/meta-detection.ts`, `src/lib/tds-parser.ts` |
| **Tự động gán Telesale phụ trách** | `ĐÃ XONG` | Điều phối lead theo ca trực và nhân viên telesale phụ trách. | `src/lib/tds-parser.ts` |
| **AI Intent Classification** | `ĐÃ XONG` | Phân tích ý định khách (Tư vấn, Hỏi giá, Đặt lịch, Phàn nàn) từ hội thoại và trợ lý Copilot. | `src/app/admin/omnichannel/` |

---

### 4. Remarketing & Multi-Platform Conversion API (CAPI)
| Hạng mục / Module | Trạng thái | Chi tiết triển khai | File liên quan |
| :--- | :---: | :--- | :--- |
| **Meta CAPI Multi-Stage** | `ĐÃ XONG` | Phân tách chuẩn: `CompleteRegistration` (khi điền form), `Lead` (khi Qualify/Schedule), `Purchase` (khi có doanh thu thực tế VND). | `src/lib/meta-capi.ts`, `src/lib/ads-service.ts` |
| **Google Ads AI Learning Engine** | `ĐÃ XONG` | Module `src/lib/google-ads.ts` tự động sinh mã Enhanced Conversions và OCI payload (`gclid`, `gbraid`, `wbraid`, `sha256_phone`, `sha256_email`, `conversionValue`). | `src/lib/google-ads.ts` |
| **Tự động đồng bộ Custom Audience** | `ĐÃ XONG` | Tự động phân loại và chuẩn bị dữ liệu băm SHA-256 đồng bộ tệp khách hàng sang Meta & Google Ads Customer Match. | `src/app/api/ads/audience-sync/route.ts` |

---

### 5. Đo đơn & Báo cáo P&L theo từng Page (60 Fanpages)
| Hạng mục / Module | Trạng thái | Chi tiết triển khai | File liên quan |
| :--- | :---: | :--- | :--- |
| **Meta Ads Performance Tracker** | `ĐÃ XONG` | Giao diện `/admin/meta-ads` đo Spend, CPC, CPM, CTR, Leads theo từng Tài khoản/Chiến dịch. | `src/app/admin/meta-ads/` |
| **Báo cáo bóc tách Doanh thu theo Nguồn** | `ĐÃ XONG` | Thống kê số lượng lead, tỉ lệ check-in, doanh thu thực theo kênh Facebook, Website, TikTok, Hotline. | `src/app/admin/crm/` |
| **Bảng P&L & ROAS chi tiết từng Page** | `ĐÃ XONG` | Bảng phân tích tài chính đa chiều: $Doanh\ thu\ MKT - Chi\ phí\ Ads = Lợi\ nhuận\ ròng$ & $Tỷ\ lệ\ Chi\ phí/MKT\ (\%)$ được tích hợp vào KPI Header. | `src/app/admin/crm/` |

---

### 6. AI Gateway, OmniRoute & Hạ Tầng Mô Hình Đa Tầng
| Hạng mục / Module | Trạng thái | Chi tiết triển khai | File liên quan |
| :--- | :---: | :--- | :--- |
| **OmniRoute Model Gateway Hub** | `ĐÃ XONG` | Kết nối 15 AI Providers (Gemini 3.7, Groq 70B, OpenRouter, Cerebras, Cloudflare AI...). | `src/app/admin/omniroute/`, `src/lib/omniroute.ts` |
| **Visual Analytics & Token Tracker** | `ĐÃ XONG` | Đo lường trực quan 66.0M Tokens, $6.05 chi phí, Tỷ lệ I/O 222.6x, Provider share breakdown. | `src/app/api/omniroute/analytics/` |
| **Multi-Tier Seamless Failover** | `ĐÃ XONG` | Tự động chuyển đổi giữa 4 tầng (Gemini $\rightarrow$ Groq 9ms $\rightarrow$ OpenRouter $\rightarrow$ Cerebras/Cloudflare) không gián đoạn. | `src/lib/omniroute.ts`, `litellm-config.yaml` |
| **Telegram Bot Auto-Recovery** | `ĐÃ XONG` | Bot `@luoicms_agent_bot` với cơ chế Compaction Buffer 20,000 tokens, tự động cắt tỉa context, chống nghẽn và chống lỗi 429/400. | `/root/.openclaw/openclaw.json` |

---

## 3. 🗺️ ROADMAP CÁC TÍNH NĂNG NÂNG CAO MỞ RỘNG (PLANNED ADVANCED ROADMAP)

### GIAI ĐOẠN 2: TỰ ĐỘNG HÓA CHĂM SÓC & TĂNG TỐC BÁN HÀNG (AUTOMATION & SALES ACCELERATION) — [100% ĐÃ HOÀN THÀNH]
| STT | Tính năng / Module Đã Triển Khai | Trạng thái | Chi Tiết & File Triển Khai |
| :---: | :--- | :---: | :--- |
| **1** | **AI Auto-Responder cho Zalo OA & WhatsApp** | `ĐÃ XONG` | Trợ lý AI phân tích ý định, bóc tách SĐT/Dịch vụ/Chi nhánh và phản hồi tự động 24/7. File: `src/lib/ai-auto-responder.ts`, `src/app/api/webhooks/zalo/route.ts`, `src/app/api/webhooks/whatsapp/route.ts`. |
| **2** | **Cảnh Báo Vi Phạm SLA Telesale (5 Phút)** | `ĐÃ XONG` | Quét tự động các Lead mới quá 5 phút chưa xử lý và bắn cảnh báo Telegram kèm link 1-click xử lý. File: `src/app/api/crm/sla-check/route.ts`, `src/lib/notification-service.ts`. |
| **3** | **VoIP Click-to-Call (Gọi 1-Click trên CRM)** | `ĐÃ XONG` | Modal gọi điện thoại WebRTC/Softphone/Zalo Call 1-click từ CRM, tự động ghi âm, đo thời lượng và lưu nhật ký cuộc gọi vào Timeline. File: `src/app/api/crm/call-log/route.ts`, `src/app/admin/crm/page.tsx`. |
| **4** | **Báo Cáo P&L Tự Động 8:00 AM Hàng Ngày** | `ĐÃ XONG` | Engine tổng hợp Doanh thu vs Chi phí Ads 60 Fanpages, tính Lợi nhuận ròng và xuất báo cáo Telegram + CSV. File: `src/app/api/admin/analytics/daily-digest/route.ts`, `src/app/admin/crm/page.tsx`. |
| **5** | **Tự Động Nén Ảnh WebP/AVIF Chuẩn PageSpeed 95+** | `ĐÃ XONG` | Sharp Engine tự động nén ảnh WebP/AVIF giảm 70-85% dung lượng, tạo thumbnail 300px tự động. File: `src/lib/image-optimizer.ts`, `src/app/api/media/upload/route.ts`. |

---

### GIAI ĐOẠN 3: AI DỰ BÁO CHUYÊN SÂU & PHÂN TÍCH ĐA ĐIỂM CHẠM (PREDICTIVE BI & ATTRIBUTION) — [100% ĐÃ HOÀN THÀNH]
| STT | Tính năng / Module Đã Triển Khai | Trạng thái | Chi Tiết & File Triển Khai |
| :---: | :--- | :---: | :--- |
| **6** | **AI Predictive LTV & VIP Scorer** | `ĐÃ XONG` | Dự đoán xác suất chuyển đổi & LTV (VND), xếp hạng VIP Diamond/Gold/Silver và bắn tín hiệu sang Meta/Google. File: `src/lib/predictive-ltv.ts`, `src/app/api/crm/predict-ltv/route.ts`. |
| **7** | **Multi-Touch Attribution Modeling** | `ĐÃ XONG` | Bóc tách 4 mô hình phân bổ (First-Touch, Last-Touch, Linear, Data-Driven U-Shaped) cho 60 Fanpages, tính ROAS thực tế và lượt hỗ trợ (Assists). File: `src/lib/attribution-model.ts`, `src/app/api/admin/analytics/attribution/route.ts`. |
| **8** | **A/B Testing Automation cho Landing Pages** | `ĐÃ XONG` | Chia traffic 50/50 theo biến thể, tự động tính độ tin cậy thống kê (Confidence Level > 95%) và Auto-Winner promotion. File: `src/lib/ab-testing.ts`, `src/app/api/ab-test/route.ts`. |
| **9** | **Cổng Quản Lý Đối Tác & KOC/KOL Affiliate** | `ĐÃ XONG` | Dashboard quản lý đối tác, cấp link referral riêng, thống kê Clicks/Leads/Doanh thu và đối soát hoa hồng 1-click. File: `src/app/api/affiliate/portal/route.ts`, `src/app/admin/affiliate/page.tsx`. |
| **10** | **Pancake Multi-Channel Tag Parser & Importer** | `ĐÃ XONG` | Giải mã & đồng bộ tự động Thẻ/Notes từ 52 kênh Pancake (`IMP`, `SỨ`, `CN`, `SĐT`, `DĐH`, `BÙM`, `1T`, `TRÚC`, `QUIN`, `XUÂN`), phân loại chuẩn xác giữa khách Raw (`SĐT`), khách Qualify (`DĐH`), khách thanh toán (`PURCHASE`) và bùng hẹn (`FAIL`). File: `src/lib/pancake-tag-parser.ts`, `src/app/api/webhooks/pancake/route.ts`, `src/app/api/crm/pancake-sync/route.ts`. |
| **11** | **Official Facebook Business Login OAuth 2.0** | `ĐÃ XONG` | Luồng xác thực đăng nhập 1-Click chính thống theo chính sách Meta Platform, tự động quét và cấp Page Access Token vĩnh viễn cho 52 Fanpages & Instagram, 0% nguy cơ checkpoint VIA. File: `src/lib/facebook-oauth.ts`, `/api/auth/facebook/login`, `/api/auth/facebook/callback`, `/api/auth/facebook/pages`, `/api/auth/facebook/config`. |
| **12** | **Omnichannel Live Chat 3-Column Hub (Pancake 1:1)** | `ĐÃ XONG` | Giao diện Hộp thư Live Chat 3 cột chuẩn 100% Pancake (Danh sách hội thoại, Khung chat trực tiếp + Bảng 36 Thẻ Master 3 hàng, Thẻ thông tin khách hàng & Ghi chú Telesale + Nhà mạng), tích hợp Meta Webhook 24/7 và kích hoạt Meta CAPI Lead (`DDH`)/Purchase (`#ĐẬU`) tự động. File: `src/app/admin/omnichannel/page.tsx`, `src/app/api/admin/omnichannel/conversations/route.ts`, `src/app/api/admin/omnichannel/conversations/[id]/messages/route.ts`, `src/app/api/admin/omnichannel/conversations/[id]/tags/route.ts`, `src/app/api/webhooks/facebook/route.ts`. |

---

### 📦 TRẠNG THÁI BACKUP & HẠ TẦNG VPS:
* **VPS Full Snapshot Backup:** `/var/backups/luoi_snapshots/luoi-cms-full-backup-20260814_180059.tar.gz` (**61 MB** - Lưu trữ toàn vẹn DB SQLite, OpenClaw config, Prisma schema, Next.js source, LiteLLM config).
* **Next.js Production Build:** Đã biên dịch thành công **116/116 routes** (0 lỗi TypeScript).
* **Trạng thái VPS (luoidonnha.com):** Toàn bộ 4 dịch vụ cốt lõi (Lưới CMS Port 3000, OmniRoute Port 20128, OpenClaw Port 18789, LiteLLM Port 4000) đều ở trạng thái **HEALTHY / ONLINE 100%**.
