"use client";

import { useState, useEffect } from "react";
import { Share2, Check, Send, AlertCircle, Save, Smartphone, Code, Layers, Sparkles, UploadCloud, Link2, FileSpreadsheet, Bot, MessageSquare, Zap as ZapIcon } from "lucide-react";

export default function AdsSetupPage() {
  const [activeTab, setActiveTab] = useState<"META" | "TIKTOK" | "GOOGLE" | "TELEGRAM" | "BATCH" | "WEBHOOK">("META");

  // Meta Settings
  const [metaPixelId, setMetaPixelId] = useState("1357317496553239");
  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [metaTestCode, setMetaTestCode] = useState("test099");

  // TikTok Settings
  const [tiktokPixelCode, setTiktokPixelCode] = useState("");
  const [tiktokAccessToken, setTiktokAccessToken] = useState("");
  const [tiktokTestCode, setTiktokTestCode] = useState("");

  // Google Ads Settings
  const [googleConversionId, setGoogleConversionId] = useState("AW-123456789");
  const [googleConversionLabel, setGoogleConversionLabel] = useState("AbCdEfGhIjKlMnOp");

  // Telegram Bot & Google Sheets Outbound Integration Settings
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [googleSheetsWebhookUrl, setGoogleSheetsWebhookUrl] = useState("");
  const [telegramFields, setTelegramFields] = useState<Record<string, boolean>>({
    time: true,
    name: true,
    phone: true,
    email: true,
    service: true,
    gift: true,
    branch: true,
    source: true,
    url: true,
    ip: true,
  });

  // Batch Historical Import State
  const [batchJsonText, setBatchJsonText] = useState(`[
  { "name": "Nguyễn Văn A", "phone": "0912345678", "email": "nguyenvana@gmail.com", "service": "Răng sứ", "status": "đặt hẹn", "revenue": 0 },
  { "name": "Trần Thị B", "phone": "0987654321", "email": "tranthib@gmail.com", "service": "Implant", "status": "mua hàng", "revenue": 25000000 },
  { "name": "Lê Văn C", "phone": "0909123456", "email": "levanc@gmail.com", "service": "Niềng răng", "status": "checkin", "revenue": 0 }
]`);
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Event Testing State
  const [phone, setPhone] = useState("0839186099");
  const [email, setEmail] = useState("khachhang.test@luoidonnha.com");
  const [eventName, setEventName] = useState<"CompleteRegistration" | "Lead" | "Contact" | "AuditBooking" | "Purchase">("CompleteRegistration");
  const [testResult, setTestResult] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Master ON/OFF Toggles for Development / Production
  const [metaCapiEnabled, setMetaCapiEnabled] = useState(false);
  const [tiktokAdsEnabled, setTiktokAdsEnabled] = useState(false);
  const [googleAdsEnabled, setGoogleAdsEnabled] = useState(false);

  // Load existing settings on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setMetaCapiEnabled(data.data.meta_capi_enabled === "1");
          setTiktokAdsEnabled(data.data.tiktok_ads_enabled === "1");
          setGoogleAdsEnabled(data.data.google_ads_enabled === "1");

          if (data.data.meta_pixel_id) setMetaPixelId(data.data.meta_pixel_id);
          if (data.data.meta_access_token) setMetaAccessToken(data.data.meta_access_token);
          if (data.data.meta_test_code) setMetaTestCode(data.data.meta_test_code);

          if (data.data.tiktok_pixel_code) setTiktokPixelCode(data.data.tiktok_pixel_code);
          if (data.data.tiktok_access_token) setTiktokAccessToken(data.data.tiktok_access_token);

          if (data.data.google_conversion_id) setGoogleConversionId(data.data.google_conversion_id);
          if (data.data.google_conversion_label) setGoogleConversionLabel(data.data.google_conversion_label);

          if (data.data.telegram_bot_token) setTelegramBotToken(data.data.telegram_bot_token);
          if (data.data.telegram_chat_id) setTelegramChatId(data.data.telegram_chat_id);
          if (data.data.google_sheets_webhook_url) setGoogleSheetsWebhookUrl(data.data.google_sheets_webhook_url);
          if (data.data.telegram_fields) {
            try { setTelegramFields(JSON.parse(data.data.telegram_fields)); } catch {}
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSaveSuccess(false);

    try {
      const payload = {
        meta_capi_enabled: metaCapiEnabled ? "1" : "0",
        tiktok_ads_enabled: tiktokAdsEnabled ? "1" : "0",
        google_ads_enabled: googleAdsEnabled ? "1" : "0",
        meta_pixel_id: metaPixelId,
        meta_access_token: metaAccessToken,
        meta_test_code: metaTestCode,
        tiktok_pixel_code: tiktokPixelCode,
        tiktok_access_token: tiktokAccessToken,
        google_conversion_id: googleConversionId,
        google_conversion_label: googleConversionLabel,
        telegram_bot_token: telegramBotToken,
        telegram_chat_id: telegramChatId,
        google_sheets_webhook_url: googleSheetsWebhookUrl,
        telegram_fields: JSON.stringify(telegramFields),
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      alert("Lỗi lưu cấu hình Ads APIs.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSendTestMeta = async () => {
    if (!metaPixelId || !metaAccessToken) {
      alert("Vui lòng nhập Meta Pixel ID và Access Token!");
      return;
    }
    setSending(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/ads/meta-capi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixelId: metaPixelId,
          accessToken: metaAccessToken,
          testCode: metaTestCode,
          event: {
            eventName,
            phone,
            email,
            value: 7999000,
            currency: "VND",
            sourceUrl: "https://luoidonnha.com/audit",
          },
        }),
      });

      const data = await res.json();
      setTestResult(data);

      if (data.success) {
        // Auto-save test-verified Meta CAPI credentials to database
        handleSaveSettings();
      }
    } catch {
      setTestResult({ success: false, error: "Lỗi kết nối API Meta CAPI" });
    } finally {
      setSending(false);
    }
  };

  const handleSendTestTikTok = async () => {
    if (!tiktokPixelCode || !tiktokAccessToken) {
      alert("Vui lòng nhập TikTok Pixel Code và Access Token!");
      return;
    }
    setSending(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/ads/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixelCode: tiktokPixelCode,
          accessToken: tiktokAccessToken,
          testCode: tiktokTestCode,
          event: {
            eventName,
            phone,
            email,
            value: 7999000,
            currency: "VND",
            sourceUrl: "https://luoidonnha.com/audit",
          },
        }),
      });

      const data = await res.json();
      setTestResult(data);

      if (data.success) {
        // Auto-save test-verified TikTok credentials to database
        handleSaveSettings();
      }
    } catch {
      setTestResult({ success: false, error: "Lỗi kết nối API TikTok Events" });
    } finally {
      setSending(false);
    }
  };

  const handleSendTestGoogle = async () => {
    if (!googleConversionId) {
      alert("Vui lòng nhập Google Ads Conversion ID (AW-XXXXXXXXX)!");
      return;
    }
    setSending(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/ads/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversionId: googleConversionId,
          conversionLabel: googleConversionLabel,
          event: {
            eventName,
            phone,
            email,
            value: 7999000,
            currency: "VND",
            sourceUrl: "https://luoidonnha.com/audit",
          },
        }),
      });

      const data = await res.json();
      setTestResult(data);

      if (data.success) {
        // Auto-save test-verified Google credentials to database
        handleSaveSettings();
      }
    } catch {
      setTestResult({ success: false, error: "Lỗi tạo cấu hình Google Enhanced Conversions" });
    } finally {
      setSending(false);
    }
  };

  const handleSendTestTelegram = async () => {
    if (!telegramBotToken || !telegramChatId) {
      alert("Vui lòng nhập Telegram Bot Token và Chat ID!");
      return;
    }
    setSending(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/telegram-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: telegramBotToken,
          chatId: telegramChatId,
          enabledFields: telegramFields,
        }),
      });

      const data = await res.json();
      setTestResult(data);

      if (data.success) {
        handleSaveSettings();
      }
    } catch {
      setTestResult({ success: false, error: "Lỗi kết nối API Telegram Bot" });
    } finally {
      setSending(false);
    }
  };

  const handleBatchImport = async () => {
    try {
      const rows = JSON.parse(batchJsonText);
      setBatchProcessing(true);
      setTestResult(null);

      const res = await fetch("/api/ads/batch-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch {
      alert("Định dạng JSON chưa đúng cú pháp. Vui lòng kiểm tra lại mảng JSON đầu vào!");
    } finally {
      setBatchProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#0f172a] flex items-center gap-2">
            <Share2 className="text-[#0284c7]" size={26} />
            <span>Cấu Hình &amp; Kiểm Thử Multi-Platform Ads APIs (Meta CAPI / TikTok / Google)</span>
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            Tự động đẩy dữ liệu chuyển đổi cuộc gọi, form đăng ký &amp; đơn hàng chuẩn mã hóa SHA-256 từ Server về Meta, TikTok &amp; Google Ads.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d4f4a] hover:bg-[#083b37] text-white font-mono font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
        >
          {saveSuccess ? <Check size={16} /> : <Save size={16} />}
          <span>{savingSettings ? "Đang lưu..." : saveSuccess ? "Đã lưu thành công!" : "Lưu Cấu Hình Ads APIs"}</span>
        </button>
      </div>

      {/* MASTER SWITCHES CARD */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs font-mono space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* META CAPI TOGGLE */}
          <div className={`p-4 rounded-2xl border transition-all ${metaCapiEnabled ? "bg-[#0d4f4a]/10 border-[#0d4f4a]/30" : "bg-stone-50 border-stone-200/80"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-stone-900">Meta Conversions API</span>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold ${metaCapiEnabled ? "bg-[#0d4f4a] text-white" : "bg-stone-200 text-stone-600"}`}>
                {metaCapiEnabled ? "ĐANG BẬT (LIVE)" : "ĐANG TẮT (DEV)"}
              </span>
            </div>
            <button
              onClick={() => {
                setMetaCapiEnabled(!metaCapiEnabled);
                setTimeout(handleSaveSettings, 100);
              }}
              className={`w-full py-2 rounded-xl font-mono font-bold text-xs cursor-pointer transition-all ${metaCapiEnabled ? "bg-[#0d4f4a] hover:bg-[#083b37] text-white shadow-xs" : "bg-white border border-stone-300 hover:bg-stone-100 text-stone-700"}`}
            >
              {metaCapiEnabled ? "🔴 Nhấn để TẮT Meta CAPI" : "🟢 Nhấn để BẬT Meta CAPI"}
            </button>
          </div>

          {/* TIKTOK ADS TOGGLE */}
          <div className={`p-4 rounded-2xl border transition-all ${tiktokAdsEnabled ? "bg-[#0d4f4a]/10 border-[#0d4f4a]/30" : "bg-stone-50 border-stone-200/80"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-stone-900">TikTok Events API</span>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold ${tiktokAdsEnabled ? "bg-[#0d4f4a] text-white" : "bg-stone-200 text-stone-600"}`}>
                {tiktokAdsEnabled ? "ĐANG BẬT (LIVE)" : "ĐANG TẮT (DEV)"}
              </span>
            </div>
            <button
              onClick={() => {
                setTiktokAdsEnabled(!tiktokAdsEnabled);
                setTimeout(handleSaveSettings, 100);
              }}
              className={`w-full py-2 rounded-xl font-mono font-bold text-xs cursor-pointer transition-all ${tiktokAdsEnabled ? "bg-[#0d4f4a] hover:bg-[#083b37] text-white shadow-xs" : "bg-white border border-stone-300 hover:bg-stone-100 text-stone-700"}`}
            >
              {tiktokAdsEnabled ? "🔴 Nhấn để TẮT TikTok API" : "🟢 Nhấn để BẬT TikTok API"}
            </button>
          </div>

          {/* GOOGLE ADS TOGGLE */}
          <div className={`p-4 rounded-2xl border transition-all ${googleAdsEnabled ? "bg-[#0d4f4a]/10 border-[#0d4f4a]/30" : "bg-stone-50 border-stone-200/80"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-stone-900">Google Ads Conversion</span>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold ${googleAdsEnabled ? "bg-[#0d4f4a] text-white" : "bg-stone-200 text-stone-600"}`}>
                {googleAdsEnabled ? "ĐANG BẬT (LIVE)" : "ĐANG TẮT (DEV)"}
              </span>
            </div>
            <button
              onClick={() => {
                setGoogleAdsEnabled(!googleAdsEnabled);
                setTimeout(handleSaveSettings, 100);
              }}
              className={`w-full py-2 rounded-xl font-mono font-bold text-xs cursor-pointer transition-all ${googleAdsEnabled ? "bg-[#0d4f4a] hover:bg-[#083b37] text-white shadow-xs" : "bg-white border border-stone-300 hover:bg-stone-100 text-stone-700"}`}
            >
              {googleAdsEnabled ? "🔴 Nhấn để TẮT Google Ads" : "🟢 Nhấn để BẬT Google Ads"}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Platform Tabs */}
      <div className="flex border-b border-stone-200 gap-6 font-mono text-xs pt-1 px-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("META");
            setTestResult(null);
          }}
          className={`pb-2.5 font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === "META"
              ? "border-[#0d4f4a] text-[#0d4f4a]"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <span>🔵 Meta Conversions API (CAPI)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("TIKTOK");
            setTestResult(null);
          }}
          className={`pb-2.5 font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === "TIKTOK"
              ? "border-[#0d4f4a] text-[#0d4f4a]"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <span>🎵 TikTok Events API (Pixel)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("GOOGLE");
            setTestResult(null);
          }}
          className={`pb-2.5 font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === "GOOGLE"
              ? "border-[#0d4f4a] text-[#0d4f4a]"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <span>🔴 Google Ads &amp; GTAG</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("TELEGRAM");
            setTestResult(null);
          }}
          className={`pb-2.5 font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === "TELEGRAM"
              ? "border-[#0d4f4a] text-[#0d4f4a]"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <Bot size={15} />
          <span>🤖 Telegram Bot Alert</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("BATCH");
            setTestResult(null);
          }}
          className={`pb-2.5 font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === "BATCH"
              ? "border-[#0d4f4a] text-[#0d4f4a]"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <UploadCloud size={15} />
          <span>⚡ Batch Import Khách Cũ</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("WEBHOOK");
            setTestResult(null);
          }}
          className={`pb-2.5 font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === "WEBHOOK"
              ? "border-[#0d4f4a] text-[#0d4f4a]"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <Link2 size={15} />
          <span>🔗 Realtime Google Sheets / CRM</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Form & Testing */}
        <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-xs">
          {/* TAB 1: META CAPI */}
          {activeTab === "META" && (
            <>
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-base font-bold font-serif text-[#0f172a]">Meta Conversions API (CAPI)</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                  ✓ Chuẩn SHA-256 Verified
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1">
                  Meta Pixel ID *
                </label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="Ví dụ: 1357317496553239"
                  className="w-full p-2.5 text-sm border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1">
                  System User Access Token *
                </label>
                <input
                  type="password"
                  value={metaAccessToken}
                  onChange={(e) => setMetaAccessToken(e.target.value)}
                  placeholder="EAAG..."
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1">
                  Mã kiểm thử (Test Event Code - Không bắt buộc)
                </label>
                <input
                  type="text"
                  value={metaTestCode}
                  onChange={(e) => setMetaTestCode(e.target.value)}
                  placeholder="Ví dụ: test099"
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 space-y-3">
                <h3 className="text-xs font-bold font-mono uppercase text-stone-700">Bắn Thử Sự Kiện Sang Meta</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-500 font-medium mb-1">Tên sự kiện</label>
                    <select
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value as any)}
                      className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-medium"
                    >
                      <option value="CompleteRegistration">CompleteRegistration (Hoàn tất đăng ký form)</option>
                      <option value="Lead">Lead (Khách tiềm năng đã qua chăm sóc)</option>
                      <option value="Contact">Contact (Liên hệ / Call)</option>
                      <option value="AuditBooking">AuditBooking (Đặt lịch)</option>
                      <option value="Purchase">Purchase (Hoàn tất thanh toán)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 font-medium mb-1">SĐT Khách test (tự động mã hóa E.164 SHA-256)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0839186099"
                      className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-500 font-medium mb-1">Email Khách test</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="khachhang.test@luoidonnha.com"
                    className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendTestMeta}
                  disabled={sending}
                  className="w-full py-3 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-mono font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={16} />
                  <span>{sending ? "Đang mã hóa SHA-256 & Bắn Event..." : "Bắn Thử CAPI Sang Meta"}</span>
                </button>
              </div>
            </>
          )}

          {/* TAB 2: TIKTOK EVENTS API */}
          {activeTab === "TIKTOK" && (
            <>
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-base font-bold font-serif text-[#0f172a]">TikTok Events API (Pixel &amp; Server)</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-black text-white font-mono font-bold">
                  TikTok Open API v1.3
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1">
                  TikTok Pixel Code *
                </label>
                <input
                  type="text"
                  value={tiktokPixelCode}
                  onChange={(e) => setTiktokPixelCode(e.target.value)}
                  placeholder="Ví dụ: C1234567890ABCDEF"
                  className="w-full p-2.5 text-sm border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1">
                  TikTok Access Token (Events API) *
                </label>
                <input
                  type="password"
                  value={tiktokAccessToken}
                  onChange={(e) => setTiktokAccessToken(e.target.value)}
                  placeholder="Nhập Access Token TikTok Ads..."
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1">
                  Mã kiểm thử (TikTok Test Code - Không bắt buộc)
                </label>
                <input
                  type="text"
                  value={tiktokTestCode}
                  onChange={(e) => setTiktokTestCode(e.target.value)}
                  placeholder="Ví dụ: TEST_TT_123"
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 space-y-3">
                <h3 className="text-xs font-bold font-mono uppercase text-stone-700">Bắn Thử Sự Kiện Sang TikTok</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-500 font-medium mb-1">Tên sự kiện TikTok</label>
                    <select
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value as any)}
                      className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-medium"
                    >
                      <option value="CompleteRegistration">CompleteRegistration (Hoàn tất đăng ký form)</option>
                      <option value="Lead">SubmitForm (Khách gửi Form)</option>
                      <option value="Contact">Contact (Liên hệ tư vấn)</option>
                      <option value="Purchase">CompletePayment (Hoàn tất mua hàng)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 font-medium mb-1">SĐT Khách test (mã hóa E.164)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0839186099"
                      className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestTikTok}
                  disabled={sending}
                  className="w-full py-3 bg-black hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={16} />
                  <span>{sending ? "Đang gửi sang TikTok..." : "Bắn Thử Event Sang TikTok Ads"}</span>
                </button>
              </div>
            </>
          )}

          {/* TAB 3: GOOGLE ADS & GTAG */}
          {activeTab === "GOOGLE" && (
            <>
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-base font-bold font-serif text-[#0f172a]">Google Ads Enhanced Conversions API</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono font-bold">
                  Google Tag (GTAG / GTM)
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1">
                  Google Ads Conversion ID (AW-ID) *
                </label>
                <input
                  type="text"
                  value={googleConversionId}
                  onChange={(e) => setGoogleConversionId(e.target.value)}
                  placeholder="Ví dụ: AW-123456789"
                  className="w-full p-2.5 text-sm border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1">
                  Conversion Label (Nhãn chuyển đổi) *
                </label>
                <input
                  type="text"
                  value={googleConversionLabel}
                  onChange={(e) => setGoogleConversionLabel(e.target.value)}
                  placeholder="Ví dụ: AbCdEfGhIjKlMnOp"
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 space-y-3">
                <h3 className="text-xs font-bold font-mono uppercase text-stone-700">Tạo Payload &amp; Bắn Thử Google Event</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-500 font-medium mb-1">Tên sự kiện</label>
                    <select
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value as any)}
                      className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-medium"
                    >
                      <option value="CompleteRegistration">CompleteRegistration (Hoàn tất đăng ký form)</option>
                      <option value="Lead">conversion (Khách hàng tiềm năng)</option>
                      <option value="Purchase">purchase (Mua sắm sản phẩm)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 font-medium mb-1">SĐT Khách test (tự động mã hóa +84)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0839186099"
                      className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestGoogle}
                  disabled={sending}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={16} />
                  <span>{sending ? "Đang tạo mã GTAG..." : "Tạo Snippet & Bắn Thử Google Ads Event"}</span>
                </button>
              </div>
            </>
          )}

          {/* TAB 4: TELEGRAM BOT NOTIFICATION & FIELD SELECTION */}
          {activeTab === "TELEGRAM" && (
            <>
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-base font-bold font-serif text-[#0f172a] flex items-center gap-2">
                  <Bot size={20} className="text-[#0088cc]" />
                  <span>Cấu Hình Bot Telegram Tự Động Bắn Báo Cáo Lead Mới</span>
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono font-bold">
                  Instant Telegram Alert
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1">
                  Telegram Bot Token *
                </label>
                <input
                  type="text"
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder="Ví dụ: 123456789:ABCdefGhIJKlmNoPQRstUVwxyZ"
                  className="w-full p-2.5 text-sm border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-[#0088cc]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1">
                  Telegram Chat ID / Channel ID *
                </label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="Ví dụ: -100123456789 hoặc @TenKenhCuaBan"
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-[#0088cc]"
                />
              </div>

              {/* FIELD SELECTION CHECKBOXES */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <label className="block text-xs font-mono font-bold uppercase text-stone-700">
                  ☑️ Tick chọn các trường thông tin cần gửi sang Telegram &amp; Google Sheets:
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramFields.time !== false}
                      onChange={(e) => setTelegramFields({ ...telegramFields, time: e.target.checked })}
                      className="rounded border-stone-300 text-[#0088cc]"
                    />
                    <span>⏰ Thời gian (Giờ Việt Nam)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramFields.name !== false}
                      onChange={(e) => setTelegramFields({ ...telegramFields, name: e.target.checked })}
                      className="rounded border-stone-300 text-[#0088cc]"
                    />
                    <span>👤 Họ và Tên</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramFields.phone !== false}
                      onChange={(e) => setTelegramFields({ ...telegramFields, phone: e.target.checked })}
                      className="rounded border-stone-300 text-[#0088cc]"
                    />
                    <span>📞 Số điện thoại</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramFields.email !== false}
                      onChange={(e) => setTelegramFields({ ...telegramFields, email: e.target.checked })}
                      className="rounded border-stone-300 text-[#0088cc]"
                    />
                    <span>📧 Email (Nếu có)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramFields.service !== false}
                      onChange={(e) => setTelegramFields({ ...telegramFields, service: e.target.checked })}
                      className="rounded border-stone-300 text-[#0088cc]"
                    />
                    <span>🦷 Nội dung tư vấn / Dịch vụ</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramFields.gift !== false}
                      onChange={(e) => setTelegramFields({ ...telegramFields, gift: e.target.checked })}
                      className="rounded border-stone-300 text-[#0088cc]"
                    />
                    <span>🎁 Quà tặng vòng quay</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramFields.branch !== false}
                      onChange={(e) => setTelegramFields({ ...telegramFields, branch: e.target.checked })}
                      className="rounded border-stone-300 text-[#0088cc]"
                    />
                    <span>🏢 Chi nhánh / Địa chỉ</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramFields.source !== false}
                      onChange={(e) => setTelegramFields({ ...telegramFields, source: e.target.checked })}
                      className="rounded border-stone-300 text-[#0088cc]"
                    />
                    <span>📣 Nguồn (UTM / Tracking)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramFields.device !== false}
                      onChange={(e) => setTelegramFields({ ...telegramFields, device: e.target.checked })}
                      className="rounded border-stone-300 text-[#0088cc]"
                    />
                    <span>💻 Thiết bị &amp; Trình duyệt (iPhone, Android, Zalo, Chrome...)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramFields.url !== false}
                      onChange={(e) => setTelegramFields({ ...telegramFields, url: e.target.checked })}
                      className="rounded border-stone-300 text-[#0088cc]"
                    />
                    <span>🌐 URL Đăng Ký</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramFields.ip !== false}
                      onChange={(e) => setTelegramFields({ ...telegramFields, ip: e.target.checked })}
                      className="rounded border-stone-300 text-[#0088cc]"
                    />
                    <span>📍 IP Khách Hàng</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestTelegram}
                  disabled={sending}
                  className="w-full py-3 bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  <Send size={16} />
                  <span>{sending ? "Đang bắn sang Telegram..." : "🤖 Bắn Thử Thông Báo Sang Telegram Bot"}</span>
                </button>
              </div>
            </>
          )}

          {/* TAB 4: BATCH IMPORT KHÁCH CŨ (EXCEL/JSON) */}
          {activeTab === "BATCH" && (
            <>
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-base font-bold font-serif text-[#0f172a] flex items-center gap-2">
                  <UploadCloud size={20} className="text-amber-600" />
                  <span>Bắn Batch CAPI Cho Tập Khách Hàng Cũ</span>
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold">
                  Batch Multi-Platform
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase text-stone-600">
                  Dán dữ liệu mảng JSON khách hàng cũ (Từ file Excel / CRM):
                </label>
                <textarea
                  rows={9}
                  value={batchJsonText}
                  onChange={(e) => setBatchJsonText(e.target.value)}
                  className="w-full p-3 text-xs font-mono bg-stone-900 text-amber-300 rounded-xl border border-stone-800 leading-relaxed focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={handleBatchImport}
                disabled={batchProcessing}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud size={18} />
                <span>{batchProcessing ? "Đang mã hóa & Bắn Batch CAPI..." : "⚡ Bắn Batch CAPI Cho Danh Sách Trên"}</span>
              </button>
            </>
          )}

          {/* TAB 5: REALTIME GOOGLE SHEETS / CRM WEBHOOK INTEGRATION */}
          {activeTab === "WEBHOOK" && (
            <>
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-base font-bold font-serif text-[#0f172a] flex items-center gap-2">
                  <Link2 size={20} className="text-emerald-700" />
                  <span>Kết Nối Realtime CRM &amp; Google Sheets</span>
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                  Automated Realtime API
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                  <p className="font-bold font-mono text-xs">🔗 Endpoint Webhook Tự Động Bắn Realtime:</p>
                  <code className="block bg-white p-2 rounded border border-emerald-300 font-mono text-[11px] text-stone-900 select-all">
                    POST https://luoidonnha.com/api/webhooks/crm
                  </code>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-stone-600 mb-1">
                    Mã Google Sheets Apps Script (Copy dán vào Tools ➡️ Script Editor):
                  </label>
                  <pre className="p-3 bg-stone-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-[220px] leading-relaxed border border-stone-800">
{`function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  var col = range.getColumn();
  var row = range.getRow();

  // Cột 7 (G): Trạng thái (đặt hẹn / checkin / mua hàng)
  if (col === 7 && row > 1) {
    var status = range.getValue();
    var name = sheet.getRange(row, 2).getValue();   // Cột B
    var phone = sheet.getRange(row, 3).getValue();  // Cột C
    var email = sheet.getRange(row, 4).getValue();  // Cột D
    var service = sheet.getRange(row, 5).getValue();// Cột E
    var revenue = sheet.getRange(row, 6).getValue();// Cột F

    var payload = {
      name: name,
      phone: phone,
      email: email,
      service: service,
      status: status,
      revenue: revenue
    };

    UrlFetchApp.fetch("https://luoidonnha.com/api/webhooks/crm", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });
  }
}`}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Real-time API Response JSON Console */}
        <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-stone-200 flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="text-base font-bold font-serif text-[#0f172a] border-b pb-3 flex items-center justify-between">
              <span>Kết Quả Phản Hồi Từ API</span>
              {testResult && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                    testResult.success
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {testResult.success ? "✓ Thành công (200 OK)" : "✕ Lỗi API"}
                </span>
              )}
            </h2>

            {testResult ? (
              <div className="mt-4 space-y-3">
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold font-mono ${
                    testResult.success
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-rose-50 text-rose-900 border-rose-200"
                  }`}
                >
                  {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>
                    {testResult.success
                      ? `Sự kiện ${eventName} đã được xử lý thành công!`
                      : testResult.message || "Lỗi gửi API Ads"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase text-stone-500">Raw JSON Payload Response:</span>
                  <pre className="p-4 bg-stone-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-[380px] leading-relaxed border border-stone-800">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center py-16 text-stone-400 space-y-3 border-2 border-dashed border-stone-200 rounded-2xl">
                <Code className="mx-auto text-stone-300" size={40} />
                <p className="text-xs font-medium">Bấm nút "Bắn Thử Event" để kiểm thử phản hồi thực tế từ API.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed space-y-1">
            <p className="font-bold font-mono text-stone-700">🔒 Tiêu chuẩn bảo mật dữ liệu khách hàng (GDPR &amp; Meta CAPI Rules):</p>
            <p>- Toàn bộ SĐT và Email đều được chuẩn hóa dạng quốc tế E.164 trước khi mã hóa 1 chiều bằng thuật toán SHA-256 (64 ký tự hex).</p>
            <p>- Địa chỉ IP và Browser User-Agent tự động kèm theo để tối ưu điểm tỉ lệ so khớp (Match Quality Score) trên Meta Event Manager &amp; TikTok Business.</p>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE PLATFORM DOCUMENTATION & THANK YOU PAGE GUIDE */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <Layers className="text-[#0d9488]" size={24} />
            <span>📚 Hướng Dẫn Cài Đặt Chuyển Hướng Form &amp; Đo Lường Chuyển Đổi Nền Tảng</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Quy trình chuẩn hóa chuyển hướng trang Cảm Ơn (/cam-on) và cấu hình đo lường 2 chiều (Browser Pixel + Server CAPI) theo tài liệu chính thức Meta, TikTok &amp; Google Ads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Guide 1: Meta CAPI */}
          <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-3">
            <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#0284c7]">
              <span>🔵 Meta Conversions API (CAPI)</span>
            </div>
            <h3 className="text-sm font-bold text-stone-900 font-serif">Chuẩn Mã Hóa SHA-256 &amp; Deduplication</h3>
            <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
              <li>
                • <strong>Mã Hóa 1 Chiều:</strong> Theo tài liệu <a href="https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library" target="_blank" rel="noreferrer" className="text-[#0284c7] underline">Meta Parameter Builder</a>, các trường <code className="bg-white px-1 py-0.5 rounded text-[10px] font-mono">ph</code> (phone) và <code className="bg-white px-1 py-0.5 rounded text-[10px] font-mono">em</code> (email) bắt buộc phải là chuỗi SHA-256 (64 ký tự hex). SĐT Việt Nam được tự động chuyển từ <code className="bg-white px-1 py-0.5 rounded text-[10px] font-mono">0839186099</code> ➡️ <code className="bg-white px-1 py-0.5 rounded text-[10px] font-mono">84839186099</code> trước khi hash.
              </li>
              <li>
                • <strong>Tránh Trùng Lặp (Deduplication):</strong> Hệ thống tự động gán <code className="bg-white px-1 py-0.5 rounded text-[10px] font-mono">event_id</code> trùng khớp giữa Browser Pixel và Server CAPI để Meta chỉ đếm 1 chuyển đổi duy nhất.
              </li>
            </ul>
          </div>

          {/* Guide 2: TikTok Events */}
          <div className="p-5 rounded-2xl bg-stone-900 text-white space-y-3">
            <div className="flex items-center gap-2 font-mono font-bold text-xs text-amber-300">
              <span>🎵 TikTok Events API (v1.3)</span>
            </div>
            <h3 className="text-sm font-bold font-serif">Server-Side Tracking &amp; Match Score</h3>
            <ul className="text-xs text-stone-300 space-y-2 leading-relaxed">
              <li>
                • <strong>Cấu Hình API Token:</strong> Lấy <code className="bg-stone-800 px-1 py-0.5 rounded text-[10px] font-mono">Access-Token</code> trong TikTok Event Manager ➡️ Settings ➡️ Generate Access Token.
              </li>
              <li>
                • <strong>Tối Ưu Điểm So Khớp:</strong> Sự kiện <code className="bg-stone-800 px-1 py-0.5 rounded text-[10px] font-mono">SubmitForm</code> được truyền đầy đủ <code className="bg-stone-800 px-1 py-0.5 rounded text-[10px] font-mono">phone_number</code> mã hóa SHA-256 + IP và User-Agent giúp thuật toán TikTok phân phối quảng cáo chính xác khách hàng tiềm năng.
              </li>
            </ul>
          </div>

          {/* Guide 3: Google Ads & Thank You Page */}
          <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 font-mono font-bold text-xs text-rose-700">
              <span>🔴 Google Ads &amp; Trang Cảm Ơn (/cam-on)</span>
            </div>
            <h3 className="text-sm font-bold text-stone-900 font-serif">Quy Trình Chuyển Hướng Form</h3>
            <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
              <li>
                • <strong>Tự Động Chuyển Hướng:</strong> Khi khách hàng gửi Form đăng ký trên bất kỳ Shortcode Block hay Bài viết nào, Hệ thống sẽ ghi nhận thông tin vào DB, tự động kích hoạt CAPI và chuyển hướng khách sang <code className="bg-white px-1 py-0.5 rounded text-[10px] font-mono">/cam-on</code>.
              </li>
              <li>
                • <strong>Bắn Mã Chuyển Đổi Kép:</strong> Trang <code className="bg-white px-1 py-0.5 rounded text-[10px] font-mono">/cam-on</code> tự động kích hoạt mã <code className="bg-white px-1 py-0.5 rounded text-[10px] font-mono">gtag('event', 'conversion')</code>, <code className="bg-white px-1 py-0.5 rounded text-[10px] font-mono">fbq('track', 'CompleteRegistration')</code> và <code className="bg-white px-1 py-0.5 rounded text-[10px] font-mono">ttq.track('CompleteRegistration')</code> đảm bảo đo lường chuyển đổi chính xác 100%.
              </li>
            </ul>
          </div>
        </div>

        {/* SECTION 4: OFFLINE CONVERSION IMPORT (OCI) & ENHANCED CONVERSIONS FOR LEADS (ECL) */}
        <div className="pt-6 border-t border-stone-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} />
                <span>⚡ Chiến Lược Offline Conversion Import (OCI) &amp; Click ID Tracking (GCLID / FBCLID / TTCLID)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Giải pháp chống vòng lặp tự hủy của AI Bidding (chỉ đấu thầu traffic rẻ nhưng rác) bằng cách phản hồi dữ liệu khách hàng thực tế (Lead đủ điều kiện &amp; Doanh thu thực) về cho AI quảng cáo học.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full shrink-0">
              Cơ Chế Bắn Chuyển Đổi Kép Kín (Auto Postback)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box A: GCLID / Click ID vs ECL */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <h4 className="font-bold text-stone-900 font-serif text-sm">1. Hai Phương Pháp Bắt Mã Đối Chiếu (Matching)</h4>
              <p className="text-stone-600 leading-relaxed">
                • <strong>GCLID / FBCLID / TTCLID Upload:</strong> Bắt mã click trực tiếp trên URL ➡️ Lưu cookie 90 ngày (chuẩn <code className="font-mono bg-white px-1">_gclid</code>, <code className="font-mono bg-white px-1">_fbc</code>, <code className="font-mono bg-white px-1">_ttclid</code>). Cho độ chính xác so khớp ~100% đối với lead đăng ký qua Form website.
              </p>
              <p className="text-stone-600 leading-relaxed">
                • <strong>Enhanced Conversions for Leads (ECL):</strong> Dùng SĐT chuẩn E.164 (<code className="font-mono bg-white px-1">+84839186099</code>) và Email đã mã hóa SHA-256. Cho độ chính xác 60-80% cho lead gọi Hotline / Zalo (nhóm không có GCLID).
              </p>
            </div>

            {/* Box B: 4-Tier Value Ladder */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <h4 className="font-bold text-stone-900 font-serif text-sm">2. Thang Bậc Chuyển Đổi 4 Tầng Cho AI Bidding</h4>
              <ul className="space-y-1.5 text-stone-700">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span><strong>Tầng 1 (Form Submit):</strong> <code className="font-mono bg-stone-200 px-1 text-[11px]">CompleteRegistration</code> - Gửi ngầm từ Server khi vừa đăng ký.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0284c7] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span><strong>Tầng 2 (Qualified Lead):</strong> <code className="font-mono bg-sky-100 text-[#0284c7] px-1 text-[11px]">Lead</code> - Telesale gọi điện xác nhận lead có nhu cầu thực.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                  <span><strong>Tầng 3 (Appointment):</strong> <code className="font-mono bg-purple-100 text-purple-800 px-1 text-[11px]">AuditBooking</code> - Đã chốt ngày giờ tư vấn / hẹn gặp.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">4</span>
                  <span><strong>Tầng 4 (Paid Customer):</strong> <code className="font-mono bg-emerald-100 text-emerald-800 px-1 text-[11px]">Purchase</code> - Hoàn tất thanh toán tiền thực tế (Giá trị thực).</span>
                </li>
              </ul>
            </div>

            {/* Box C: 3 Cấp Độ Đo Lường Hotline/Zalo/Messenger/WhatsApp */}
            <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-200 space-y-2 text-xs md:col-span-2">
              <h4 className="font-bold text-stone-900 font-serif text-sm flex items-center justify-between">
                <span>3. Giải Pháp Đo Lường 3 Cấp Độ Cho Nút Bấm Hotline / Zalo / Messenger / WhatsApp</span>
                <span className="text-[10px] font-mono bg-[#0284c7] text-white px-2 py-0.5 rounded-full font-bold">
                  Real-time Outbound Tracking
                </span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-white rounded-lg border border-sky-100 space-y-1">
                  <span className="font-bold text-sky-900">🔹 Cấp Độ 1: Auto Click Interceptor</span>
                  <p className="text-stone-600 text-[11px]">
                    Tự động lắng nghe nút <code className="bg-stone-100 px-1 font-mono">tel:</code>, <code className="bg-stone-100 px-1 font-mono">zalo.me</code>, <code className="bg-stone-100 px-1 font-mono">m.me</code> ➡️ Bắn Pixel + Meta CAPI <code className="font-mono bg-sky-50 text-sky-800 px-1">Contact</code> + Telegram Bot Alert ngay lập tức.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-sky-100 space-y-1">
                  <span className="font-bold text-purple-900">🔹 Cấp Độ 2: 90-Day Cookie Matching</span>
                  <p className="text-stone-600 text-[11px]">
                    Bắt mã <code className="bg-stone-100 px-1 font-mono">gclid</code>, <code className="bg-stone-100 px-1 font-mono">fbclid</code>, <code className="bg-stone-100 px-1 font-mono">ttclid</code> lưu 90 ngày. Khi khách chốt đơn qua Zalo/Hotline ➡️ Postback CAPI khớp 100% tài khoản Ads.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-sky-100 space-y-1">
                  <span className="font-bold text-emerald-900">🔹 Cấp Độ 3: Dynamic Call Tracking</span>
                  <p className="text-stone-600 text-[11px]">
                    Tích hợp Webhook Tổng đài ảo (Stringee, Omicall, MiTCALL) ➡️ Đẩy doanh thu cuộc gọi thực tế về Google Ads OCI &amp; Meta CAPI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4.5: STEP-BY-STEP GOOGLE SHEETS CONNECTION GUIDE */}
        <div className="pt-6 border-t border-stone-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-2">
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <FileSpreadsheet className="text-emerald-600" size={20} />
                <span>📊 Hướng Dẫn Từng Bước Kết Nối Google Sheets Auto Realtime (Telesale Trigger)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Chỉ cần cài 1 lần duy nhất cho Google Sheets của Telesale. Mỗi khi Telesale đổi chữ ở cột Trạng Thái, file sẽ tự động gọi Webhook về hệ thống để mã hóa SHA-256 &amp; bắn CAPI.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full shrink-0">
              ⚡ Tự Động Bắn Postback 1 Giây
            </span>
          </div>

          {/* 5-Step Steps List */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="font-bold text-stone-900">Mở File Google Sheet</h4>
              <p className="text-stone-500 text-[11px]">Mở trang tính CRM quản lý danh sách khách hàng của Telesale.</p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="font-bold text-stone-900">Vào Apps Script</h4>
              <p className="text-stone-500 text-[11px]">Trên menu chọn <strong>Tiện ích mở rộng (Extensions)</strong> ➡️ <strong>Apps Script</strong>.</p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono font-bold text-xs flex items-center justify-center">3</span>
              <h4 className="font-bold text-stone-900">Dán Mã Kịch Bản</h4>
              <p className="text-stone-500 text-[11px]">Copy đoạn mã JavaScript bên dưới và dán thay thế toàn bộ vào ô chỉnh sửa.</p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono font-bold text-xs flex items-center justify-center">4</span>
              <h4 className="font-bold text-stone-900">Cài Trình Kích Hoạt</h4>
              <p className="text-stone-500 text-[11px]">Bấm icon Trình kích hoạt (⏰) ➡️ Add Trigger ➡️ Chọn hàm <code className="font-mono bg-white px-1">onEdit</code> ➡️ Loại: <code className="font-mono bg-white px-1">On edit</code>.</p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono font-bold text-xs flex items-center justify-center">5</span>
              <h4 className="font-bold text-stone-900">Thử Đổi Trạng Thái</h4>
              <p className="text-stone-500 text-[11px]">Chọn ô Cột G sang <strong>"đặt hẹn"</strong>, <strong>"checkin"</strong> hoặc <strong>"mua hàng"</strong> để kích hoạt CAPI.</p>
            </div>
          </div>

          {/* Full Code Box & Copy Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-stone-700 uppercase">
                📜 Mã Google Sheets Apps Script Chuẩn (Copy Toàn Bộ Code):
              </span>
              <span className="text-[11px] font-mono text-stone-500">Endpoint: POST https://luoidonnha.com/api/webhooks/crm</span>
            </div>

            <pre className="p-4 bg-stone-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-[300px] leading-relaxed border border-stone-800 select-all">
{`/**
 * Mã Tự Động Gửi Webhook Postback CAPI Khi Telesale Đổi Trạng Thái Trên Google Sheets
 * Đã cấu hình hỗ trợ: đặt hẹn (Lead), checkin (AuditBooking), mua hàng (Purchase có doanh thu)
 */
function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  var col = range.getColumn();
  var row = range.getRow();

  // GIẢ ĐỊNH THỨ TỰ CÁC CỘT TRÊN GOOGLE SHEETS:
  // Cột 1 (A): Ngày | Cột 2 (B): Họ tên | Cột 3 (C): SĐT | Cột 4 (D): Email 
  // Cột 5 (E): Dịch vụ | Cột 6 (F): Doanh thu | Cột 7 (G): Trạng thái (đặt hẹn / checkin / mua hàng)
  
  if (col === 7 && row > 1) {
    var status = range.getValue();
    if (!status) return;

    var name = sheet.getRange(row, 2).getValue() || "Khách từ Google Sheet";
    var phone = sheet.getRange(row, 3).getValue();
    var email = sheet.getRange(row, 4).getValue();
    var service = sheet.getRange(row, 5).getValue() || "Dịch vụ chung";
    var revenue = sheet.getRange(row, 6).getValue() || 0;

    if (!phone && !email) return;

    var payload = {
      name: String(name),
      phone: String(phone),
      email: String(email),
      service: String(service),
      status: String(status),
      revenue: Number(revenue) || 0
    };

    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    try {
      var response = UrlFetchApp.fetch("https://luoidonnha.com/api/webhooks/crm", options);
      Logger.log("✅ CAPI Realtime Webhook Response: " + response.getContentText());
    } catch (err) {
      Logger.log("✕ Lỗi gửi Webhook: " + err.toString());
    }
  }
}`}
            </pre>
          </div>
        </div>

        {/* SECTION 5: MASTER CONNECTION CHEATSHEET & INTEGRATION MATRIX */}
        <div className="pt-6 border-t border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
              <FileSpreadsheet className="text-indigo-600" size={20} />
              <span>📑 Bảng Tra Cứu Tất Cả Phương Thức Kết Nối Hệ Thống (Master Integration Matrix)</span>
            </h3>
            <span className="text-[11px] font-mono font-bold text-stone-500">Tư liệu kết nối khi cần</span>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="bg-stone-100 font-mono text-[11px] text-stone-800 uppercase border-b border-stone-200">
                <tr>
                  <th className="p-3">Phương Thức Kết Nối</th>
                  <th className="p-3">API Endpoint / Snippet</th>
                  <th className="p-3">Thông Số / Headers</th>
                  <th className="p-3">Giai Đoạn Kích Hoạt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white font-mono text-[11px]">
                <tr className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-900">🔗 Realtime CRM / Sheet Webhook</td>
                  <td className="p-3"><code className="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded border border-emerald-200">POST /api/webhooks/crm</code></td>
                  <td className="p-3">JSON: <code className="text-stone-600">{`{ phone, email, name, service, status, revenue }`}</code></td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">Realtime khi Telesale đổi ô</span></td>
                </tr>

                <tr className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-900">⚡ Batch Import Khách Cũ</td>
                  <td className="p-3"><code className="bg-amber-50 text-amber-900 px-1 py-0.5 rounded border border-amber-200">POST /api/ads/batch-import</code></td>
                  <td className="p-3">JSON: <code className="text-stone-600">{`{ rows: [ { phone, email, status, revenue } ] }`}</code></td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold">Bắn thủ công theo đợt</span></td>
                </tr>

                <tr className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-900">🔵 Meta Conversions API</td>
                  <td className="p-3"><code className="text-sky-700">graph.facebook.com/v19.0/&#123;pixel_id&#125;/events</code></td>
                  <td className="p-3">Header: <code className="text-stone-600">access_token</code>, Payload: <code className="text-stone-600">user_data (ph, em, fbc, fbp SHA-256)</code></td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full text-[10px] font-bold">Form submit + Postback</span></td>
                </tr>

                <tr className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-900">🎵 TikTok Events API (v1.3)</td>
                  <td className="p-3"><code className="text-stone-900">business-api.tiktok.com/open_api/v1.3/event/track/</code></td>
                  <td className="p-3">Header: <code className="text-stone-600">Access-Token</code>, Payload: <code className="text-stone-600">context.user (phone SHA-256, ttclid)</code></td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-stone-900 text-white rounded-full text-[10px] font-bold">Form submit + Postback</span></td>
                </tr>

                <tr className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-900">🔴 Google Ads Enhanced Conversions</td>
                  <td className="p-3"><code className="text-rose-700">gtag('event', 'conversion', &#123; user_data &#125;)</code></td>
                  <td className="p-3">Params: <code className="text-stone-600">AW-ID/Label, gclid, sha256_phone_number</code></td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">Trang /cam-on + OCI</span></td>
                </tr>

                <tr className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-900">📌 Auto Click ID Cookies</td>
                  <td className="p-3"><code className="text-purple-700">AttributionTracker.tsx</code></td>
                  <td className="p-3">Cookies: <code className="text-stone-600">_gclid, _fbc, _fbp, _ttclid (Lưu 90 ngày)</code></td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">Tự động trên toàn site</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
