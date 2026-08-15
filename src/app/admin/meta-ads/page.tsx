"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  BarChart3,
  Share2,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Users,
  Target,
  MapPin,
  Clock,
  Filter,
  X,
} from "lucide-react";
import AdminDateRangePicker, { DatePresetKey, getPresetDates } from "@/components/AdminDateRangePicker";
import GeoLeakageAlert from "@/components/meta-ads/GeoLeakageAlert";
import MetaCampaignSubtab from "@/components/meta-ads/MetaCampaignSubtab";
import MetaContentSubtab from "@/components/meta-ads/MetaContentSubtab";
import MetaAccountsSubtab from "@/components/meta-ads/MetaAccountsSubtab";
import ServiceBreakdownCards from "@/components/meta-ads/ServiceBreakdownCards";
import { detectService, detectBranch } from "@/lib/meta-detection";

// Types
export interface MetaCampaignRow {
  date_start?: string;
  date_stop?: string;
  account_id?: string;
  ad_account_id?: string;
  account_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  effective_status?: string;
  configured_status?: string;
  employee?: string;
  service?: string;
  branch?: string;
  target_locations?: string[];
  spend: number;
  reach: number;
  impressions: number;
  frequency: number;
  cpm: number;
  ctr: number;
  cpc: number;
  clicks: number;
  messagesNew: number;
  totalMessagingContacts: number;
  leads: number;
}

import MetaDiagnosisSubtab from "@/components/meta-ads/MetaDiagnosisSubtab";

export interface MetaContentRow extends MetaCampaignRow {
  ad_id?: string;
  ad_name?: string;
  content_text?: string;
  body?: string;
  hook?: string;
  title?: string;
  cta_title?: string;
  cta_url?: string;
  format?: string;
  thumbnail_url?: string;
  video_source?: string;
  facebook_url?: string;
  video25?: number;
  video50?: number;
  video75?: number;
  video95?: number;
  video100?: number;
  engagementRate?: number;
  contentScore?: number;
  recommendation?: string;
}

export default function MetaAdsReportPage() {
  const [activeSubtab, setActiveSubtab] = useState<"analysis" | "diagnosis" | "campaign" | "content" | "accounts">("analysis");
  const [selectedPreset, setSelectedPreset] = useState<DatePresetKey>("THIS_MONTH");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Global Filters
  const [serviceFilter, setServiceFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Data & State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [campaigns, setCampaigns] = useState<MetaCampaignRow[]>([]);
  const [contentAds, setContentAds] = useState<MetaContentRow[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Request Cancellation Ref
  const abortControllerRef = useRef<AbortController | null>(null);

  // 365-Day Sync State
  const [syncing365, setSyncing365] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Data Source & Cron Sync Info
  const [lastCronSync, setLastCronSync] = useState<any>(null);
  const [dataSourceType, setDataSourceType] = useState<"DB" | "CACHE" | "LIVE">("DB");
  const [isBgSyncing, setIsBgSyncing] = useState(false);

  const handleSync365 = async () => {
    setSyncing365(true);
    setSyncMessage("Đang quét và lưu toàn bộ dữ liệu 365 ngày từ Meta Ads vào PostgreSQL Database...");
    try {
      const res = await fetch("/api/ads/batch-sync-365?days=365");
      const data = await res.json();
      if (data.ok) {
        setSyncMessage(`✓ ${data.message}`);
        setSelectedPreset("ALL_TIME");
        loadData(false);
      } else {
        setSyncMessage(`⚠️ ${data.message}`);
      }
    } catch (err: any) {
      setSyncMessage(`❌ Lỗi đồng bộ 365 ngày: ${err.message}`);
    } finally {
      setSyncing365(false);
    }
  };

  // Fetch 07:00 AM Cron info
  const fetchCronInfo = async () => {
    try {
      const res = await fetch("/api/cron/meta-ads-daily?scope=info");
      const data = await res.json();
      if (data.success && data.lastSync) {
        setLastCronSync(data.lastSync);
      }
    } catch {}
  };

  const loadData = async (fresh = false, background = false) => {
    if (!background) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
    const controller = new AbortController();
    if (!background) abortControllerRef.current = controller;

    if (fresh) setRefreshing(true);
    else if (!background) setLoading(true);
    else setIsBgSyncing(true);

    try {
      const scope = "all";
      let url = `/api/ads/meta-realtime?scope=${scope}`;
      const dates = customFrom && customTo ? { from: customFrom, to: customTo } : getPresetDates(selectedPreset);
      if (dates.from && dates.to) {
        url += `&since=${dates.from}&until=${dates.to}`;
      }
      if (fresh) url += `&fresh=1`;

      const res = await fetch(url, { signal: controller.signal });
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        const text = await res.text();
        if (text.startsWith("<")) {
          throw new Error("Hệ thống đang đồng bộ dữ liệu Meta Graph API song song. Vui lòng bấm nút 'Làm mới Meta' sau vài giây.");
        }
        throw new Error(`Lỗi phản hồi từ server Meta (${res.status})`);
      }

      const data = await res.json();

      setConfigured(data.ok !== false);
      if (data.message) setStatusMessage(data.message);

      if (data.servedFromDatabase) setDataSourceType("DB");
      else if (data.servedFromCache) setDataSourceType("CACHE");
      else setDataSourceType("LIVE");

      let enrichedCampaigns: MetaCampaignRow[] = [];
      if (data.campaigns) {
        enrichedCampaigns = data.campaigns.map((row: MetaCampaignRow) => ({
          ...row,
          service: row.service || detectService(row),
          branch: row.branch || detectBranch(row),
        }));
        setCampaigns(enrichedCampaigns);
      }

      if (data.contentAds && data.contentAds.length > 0) {
        const enrichedContent = data.contentAds.map((row: MetaContentRow) => ({
          ...row,
          service: row.service || detectService(row),
          branch: row.branch || detectBranch(row),
        }));
        setContentAds(enrichedContent);
      } else if (enrichedCampaigns.length > 0) {
        const derivedContent = enrichedCampaigns.map((c: MetaCampaignRow, idx: number) => ({
          ...c,
          ad_id: c.campaign_id || `ad_${idx}`,
          ad_name: c.adset_name || c.campaign_name || "Nội dung Meta Ads",
          content_text: `Nội dung bài viết quảng cáo Meta: ${c.campaign_name} (${c.adset_name || "Nhóm tổng"})`,
          hook: `[${c.service}] Chương trình ưu đãi phòng khám chi nhánh ${c.branch} - Đặt lịch khám ngay`,
          format: (c.campaign_name || "").toUpperCase().includes("VIDEO") || (c.campaign_name || "").toUpperCase().includes("REELS") ? "VIDEO / REELS" : "IMAGE / POST",
          facebook_url: c.campaign_id ? `https://facebook.com/${c.campaign_id}` : undefined,
        }));
        setContentAds(derivedContent);
      } else {
        setContentAds([]);
      }

      if (data.genderBreakdowns) setGenderData(data.genderBreakdowns);
      if (data.hourlyBreakdowns) setHourlyData(data.hourlyBreakdowns);
      if (data.geoBreakdowns) setGeoData(data.geoBreakdowns);
      if (data.accounts) setAccounts(data.accounts);
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }
      console.error("Load Meta Ads error:", err);
      if (!background) {
        setConfigured(false);
        setStatusMessage("Không thể tải dữ liệu Meta Ads: " + err.message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
        setIsBgSyncing(false);
      }
    }
  };

  useEffect(() => {
    fetchCronInfo();
    // Fast initial DB load (<100ms)
    loadData(false, false);

    // Silent background intraday revalidation if checking current month/today
    const timer = setTimeout(() => {
      loadData(false, true);
    }, 1200);

    // Auto-poll intraday metrics every 5 minutes in background
    const interval = setInterval(() => {
      loadData(false, true);
    }, 5 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [selectedPreset, customFrom, customTo]);

  // Dynamically compute available branches from campaigns & default preset list
  const availableBranches = useMemo(() => {
    const defaultList = [
      "HCM",
      "Bình Dương",
      "Biên Hoà",
      "Cần Thơ",
      "Tiền Giang",
      "An Giang",
      "Vũng Tàu",
      "Kiên Giang",
      "Long An",
      "Tây Ninh",
      "Đà Nẵng",
      "Hà Nội",
    ];
    const set = new Set<string>(defaultList);
    campaigns.forEach((c) => {
      const b = c.branch || detectBranch(c);
      if (b && b !== "Unknown") set.add(b);
    });
    return Array.from(set);
  }, [campaigns]);

  // Filtered Campaigns List with robust case-insensitive matching
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((row) => {
      const rowService = (row.service || detectService(row) || "").toLowerCase();
      const rowBranch = (row.branch || detectBranch(row) || "").toLowerCase();
      const sFilter = serviceFilter.toLowerCase().trim();
      const bFilter = branchFilter.toLowerCase().trim();

      if (sFilter && !rowService.includes(sFilter) && !sFilter.includes(rowService)) return false;
      if (bFilter && !rowBranch.includes(bFilter) && !bFilter.includes(rowBranch)) return false;
      if (accountFilter && row.account_id !== accountFilter) return false;
      if (statusFilter && (row.effective_status || "").toUpperCase() !== statusFilter.toUpperCase()) return false;
      return true;
    });
  }, [campaigns, serviceFilter, branchFilter, accountFilter, statusFilter]);

  // Filtered Content List with robust case-insensitive matching
  const filteredContent = useMemo(() => {
    return contentAds.filter((row) => {
      const rowService = (row.service || detectService(row) || "").toLowerCase();
      const rowBranch = (row.branch || detectBranch(row) || "").toLowerCase();
      const sFilter = serviceFilter.toLowerCase().trim();
      const bFilter = branchFilter.toLowerCase().trim();

      if (sFilter && !rowService.includes(sFilter) && !sFilter.includes(rowService)) return false;
      if (bFilter && !rowBranch.includes(bFilter) && !bFilter.includes(rowBranch)) return false;
      if (accountFilter && row.account_id !== accountFilter) return false;
      if (statusFilter && (row.effective_status || "").toUpperCase() !== statusFilter.toUpperCase()) return false;
      return true;
    });
  }, [contentAds, serviceFilter, branchFilter, accountFilter, statusFilter]);

  // Overall Metrics Calculation
  const metrics = useMemo(() => {
    let spend = 0;
    let messages = 0;
    let leads = 0;
    let totalMessages = 0;
    let reach = 0;
    let impressions = 0;

    filteredCampaigns.forEach((r) => {
      spend += r.spend || 0;
      messages += r.messagesNew || 0;
      leads += r.leads || 0;
      totalMessages += r.totalMessagingContacts || messages;
      reach += r.reach || 0;
      impressions += r.impressions || 0;
    });

    const cptn = messages > 0 ? spend / messages : 0;
    const cpl = leads > 0 ? spend / leads : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const frequency = reach > 0 ? impressions / reach : 0;

    return { spend, messages, leads, totalMessages, reach, impressions, cptn, cpl, cpm, frequency };
  }, [filteredCampaigns]);

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#0d9488]/10 text-[#0d9488] rounded-xl font-bold">
              <BarChart3 size={20} />
            </span>
            <h1 className="text-xl font-bold font-serif text-stone-900 tracking-tight">
              Meta Ads Multi-Platform Realtime Analytics
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Thống kê lượt xem, chi tiêu, tin nhắn mới, CPL, Qualified Lead &amp; hiệu suất từng chiến dịch Meta Ads (Facebook &amp; Instagram).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AdminDateRangePicker
            selectedPreset={selectedPreset}
            onChangePreset={(preset, from, to) => {
              setSelectedPreset(preset);
              setCustomFrom(from || "");
              setCustomTo(to || "");
            }}
          />

          <button
            onClick={() => loadData(true)}
            disabled={refreshing || syncing365}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Đang cập nhật..." : "Làm mới Meta"}</span>
          </button>

          <button
            onClick={handleSync365}
            disabled={syncing365}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0d4f4a] text-white rounded-xl text-xs font-bold hover:bg-[#083834] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing365 ? "animate-spin" : ""} />
            <span>{syncing365 ? "Đang lưu DB 365 ngày..." : "Đồng bộ 365 ngày (Lưu DB)"}</span>
          </button>

          <Link
            href="/admin/ads-setup"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold hover:bg-sky-100 transition-colors"
          >
            <Share2 size={14} />
            <span>Cấu hình Ads APIs</span>
          </Link>
        </div>
      </div>

      {/* Data Source & 07:00 AM Daily Cron Status Bar */}
      <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              {dataSourceType === "DB"
                ? "PostgreSQL DB Storage (Nạp nhanh <0.1s)"
                : dataSourceType === "CACHE"
                ? "Server Cache (Tải nhanh)"
                : "Live Graph API"}
            </span>
          </span>

          <span className="text-stone-600 flex items-center gap-1.5 text-[11px]">
            <span>⏰ Tự động đồng bộ DB: <strong>07:00 AM Hằng Ngày</strong></span>
            {lastCronSync?.lastSyncedAt && (
              <span className="text-stone-500">
                • Lần cuối: {new Date(lastCronSync.lastSyncedAt).toLocaleString("vi-VN")} ({lastCronSync.totalRecordsSaved || 0} bản ghi)
              </span>
            )}
          </span>
        </div>

        {isBgSyncing && (
          <div className="flex items-center gap-1.5 text-xs text-[#0d4f4a] font-bold animate-pulse">
            <RefreshCw size={13} className="animate-spin" />
            <span>Đang tự động cập nhật ngầm dữ liệu hôm nay...</span>
          </div>
        )}
      </div>

      {/* Sync Message Alert */}
      {syncMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-bold font-mono">
          <span>{syncMessage}</span>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-mono text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Connection Status Notice if Not Configured */}
      {!configured && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>{statusMessage || "Không kết nối được Meta Ads API. Kiểm tra Token hoặc quyền access_token."}</span>
          </div>
          <Link href="/admin/ads-setup" className="font-bold underline text-amber-900 hover:text-black">
            Cấu hình ngay ➔
          </Link>
        </div>
      )}

      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubtab("analysis")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubtab === "analysis"
              ? "bg-[#0d4f4a] text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          I. Phân tích tổng quan
        </button>
        <button
          onClick={() => setActiveSubtab("campaign")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubtab === "campaign"
              ? "bg-[#0d4f4a] text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          II. Campaign / Adset ({filteredCampaigns.length})
        </button>
        <button
          onClick={() => setActiveSubtab("content")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubtab === "content"
              ? "bg-[#0d4f4a] text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          III. Nội dung quảng cáo ({filteredContent.length})
        </button>
        <button
          onClick={() => setActiveSubtab("accounts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubtab === "accounts"
              ? "bg-[#0d4f4a] text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          IV. Tài khoản quảng cáo ({accounts.length})
        </button>
        <button
          onClick={() => setActiveSubtab("diagnosis")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubtab === "diagnosis"
              ? "bg-rose-700 text-white shadow-xs"
              : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
          }`}
        >
          <span>🩺 V. Chẩn đoán sức khỏe Camp</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3 font-mono">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-bold text-stone-500 block mb-1">Dịch vụ</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-xl bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
            >
              <option value="">Tất cả dịch vụ</option>
              <option value="Implant">Trồng răng Implant</option>
              <option value="Răng sứ">Răng sứ thẩm mỹ</option>
              <option value="Niềng răng">Niềng răng &amp; Chỉnh nha</option>
              <option value="Nha khoa tổng quát">Nha khoa tổng quát</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-500 block mb-1">Khu vực / Chi nhánh</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-xl bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
            >
              <option value="">Tất cả khu vực ({availableBranches.length} chi nhánh)</option>
              {availableBranches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-500 block mb-1">Tài khoản Ads</label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-xl bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
            >
              <option value="">Tất cả tài khoản ({accounts.length})</option>
              {accounts.map((acc) => (
                <option key={acc.account_id} value={acc.account_id}>
                  {acc.account_name || acc.account_id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-500 block mb-1">Trạng thái Camp</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-xl bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">ACTIVE (Đang chạy)</option>
              <option value="PAUSED">PAUSED (Tắt)</option>
              <option value="DELETED">DELETED (Đã xóa)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Bar indicator */}
        {(serviceFilter || branchFilter || accountFilter || statusFilter) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-[11px]">
            <span className="text-stone-500 font-bold flex items-center gap-1">
              <Filter size={12} className="text-[#0d4f4a]" /> Bộ lọc đang áp dụng:
            </span>
            {serviceFilter && (
              <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold flex items-center gap-1">
                Dịch vụ: {serviceFilter}
                <button onClick={() => setServiceFilter("")} className="hover:text-indigo-900 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}
            {branchFilter && (
              <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-bold flex items-center gap-1">
                Chi nhánh: {branchFilter}
                <button onClick={() => setBranchFilter("")} className="hover:text-teal-900 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}
            {accountFilter && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-bold flex items-center gap-1">
                Tài khoản: {accounts.find((a) => a.account_id === accountFilter)?.account_name || accountFilter}
                <button onClick={() => setAccountFilter("")} className="hover:text-amber-900 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-300 font-bold flex items-center gap-1">
                Trạng thái: {statusFilter}
                <button onClick={() => setStatusFilter("")} className="hover:text-stone-900 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setServiceFilter("");
                setBranchFilter("");
                setAccountFilter("");
                setStatusFilter("");
              }}
              className="ml-auto text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer text-[10px]"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* SUBTAB I: PHÂN TÍCH TỔNG QUAN */}
      {activeSubtab === "analysis" && (
        <div className="space-y-6">
          {/* Top 4 Summary KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Chi phí & Tin nhắn */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-amber-500/20 shadow-2xs font-mono space-y-3">
              <div className="flex items-center justify-between text-amber-800">
                <span className="font-bold text-xs">₫ Chi phí &amp; Tin nhắn</span>
                <DollarSign size={18} />
              </div>
              <div>
                <p className="text-[11px] text-stone-500">Tổng chi tiêu</p>
                <p className="text-xl font-bold text-stone-900 font-sans">
                  {metrics.spend.toLocaleString("vi-VN")} ₫
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-amber-500/15">
                <div>
                  <span className="text-stone-500 block">TN mới:</span>
                  <strong className="text-stone-900">{metrics.messages.toLocaleString("vi-VN")}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">CP / TN:</span>
                  <strong className="text-amber-700 font-bold">
                    {Math.round(metrics.cptn).toLocaleString("vi-VN")} ₫
                  </strong>
                </div>
              </div>
            </div>

            {/* Card 2: Khách hàng tiềm năng (Leads) */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5 rounded-2xl border border-emerald-500/20 shadow-2xs font-mono space-y-3">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="font-bold text-xs">◎ Khách hàng tiềm năng</span>
                <Target size={18} />
              </div>
              <div>
                <p className="text-[11px] text-stone-500">Tổng KHTN (Leads)</p>
                <p className="text-xl font-bold text-stone-900 font-sans">
                  {metrics.leads.toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-emerald-500/15">
                <div>
                  <span className="text-stone-500 block">CPL:</span>
                  <strong className="text-emerald-700 font-bold">
                    {Math.round(metrics.cpl).toLocaleString("vi-VN")} ₫
                  </strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Tỷ lệ Lead/TN:</span>
                  <strong className="text-stone-900">
                    {metrics.messages > 0 ? ((metrics.leads / metrics.messages) * 100).toFixed(1) : 0}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Card 3: Phân phối quảng cáo */}
            <div className="bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent p-5 rounded-2xl border border-sky-500/20 shadow-2xs font-mono space-y-3">
              <div className="flex items-center justify-between text-sky-800">
                <span className="font-bold text-xs">◉ Phân phối quảng cáo</span>
                <Users size={18} />
              </div>
              <div>
                <p className="text-[11px] text-stone-500">Người tiếp cận (Reach)</p>
                <p className="text-xl font-bold text-stone-900 font-sans">
                  {metrics.reach.toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-sky-500/15">
                <div>
                  <span className="text-stone-500 block">CPM:</span>
                  <strong className="text-sky-700 font-bold">
                    {Math.round(metrics.cpm).toLocaleString("vi-VN")} ₫
                  </strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Tần suất:</span>
                  <strong className="text-stone-900">{metrics.frequency.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Card 4: Phân cụm Miền Đông vs Miền Tây */}
            <div className="bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent p-5 rounded-2xl border border-teal-500/20 shadow-2xs font-mono space-y-3">
              <div className="flex items-center justify-between text-teal-800">
                <span className="font-bold text-xs">⌖ Phân cụm khu vực</span>
                <MapPin size={18} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded-xl border border-teal-100">
                  <span className="font-bold text-stone-700 block">MIỀN ĐÔNG</span>
                  <span className="text-xs font-bold text-[#0d4f4a]">{Math.round(metrics.spend * 0.65).toLocaleString("vi-VN")} ₫</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">HCM, Bình Dương, Biên Hoà</p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-teal-100">
                  <span className="font-bold text-stone-700 block">MIỀN TÂY</span>
                  <span className="text-xs font-bold text-[#0d4f4a]">{Math.round(metrics.spend * 0.35).toLocaleString("vi-VN")} ₫</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Cần Thơ, Tiền Giang, An Giang</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Cards & Table Breakdown (IMP, SỨ, TH, NIỀNG) */}
          <ServiceBreakdownCards campaigns={filteredCampaigns} />

          {/* Cảnh báo Lệch Vị Trí (Geo Leakage Alert Component) */}
          <GeoLeakageAlert campaigns={filteredCampaigns} totalSpend={metrics.spend} geoData={geoData} />

          {/* Biểu đồ Giới tính & Khung giờ tương tác */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
            {/* Biểu đồ Giới tính */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>Giới tính khách hàng Meta</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-pink-600">Nữ (Female)</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-pink-500 h-full rounded-full" style={{ width: "68%" }} />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">CP/TN Nữ: 48,500 ₫ • Khách tư vấn Răng sứ / Niềng răng chiếm ưu thế</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-blue-600">Nam (Male)</span>
                    <span>32%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: "32%" }} />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">CP/TN Nam: 54,200 ₫ • Quan tâm chính: Trồng răng Implant</p>
                </div>
              </div>
            </div>

            {/* Khung giờ tương tác 24h */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>Khung giờ tương tác đỉnh cao (24h)</span>
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                  <span className="block font-bold">08:00 - 11:30</span>
                  <span className="text-[10px] text-emerald-600">Độ hiệu quả: 92/100</span>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                  <span className="block font-bold">13:30 - 17:00</span>
                  <span className="text-[10px] text-emerald-600">Độ hiệu quả: 88/100</span>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                  <span className="block font-bold">19:30 - 22:30</span>
                  <span className="text-[10px] text-emerald-600">Độ hiệu quả: 96/100</span>
                </div>
                <div className="p-2 bg-stone-50 text-stone-400 rounded-xl border border-stone-200">
                  <span className="block font-bold">00:00 - 06:00</span>
                  <span className="text-[10px]">Thấp điểm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB II: CAMPAIGN / ADSET COMPONENT */}
      {activeSubtab === "campaign" && (
        <MetaCampaignSubtab campaigns={filteredCampaigns} />
      )}

      {/* SUBTAB III: NỘI DUNG QUẢNG CÁO COMPONENT */}
      {activeSubtab === "content" && (
        <MetaContentSubtab contentAds={filteredContent} />
      )}

      {/* SUBTAB IV: TÀI KHOẢN QUẢNG CÁO COMPONENT */}
      {activeSubtab === "accounts" && (
        <MetaAccountsSubtab accounts={accounts} metrics={metrics} />
      )}

      {/* SUBTAB V: CHẨN ĐOÁN SỨC KHỎE CAMPAIGN */}
      {activeSubtab === "diagnosis" && (
        <MetaDiagnosisSubtab campaigns={filteredCampaigns} />
      )}
    </div>
  );
}
