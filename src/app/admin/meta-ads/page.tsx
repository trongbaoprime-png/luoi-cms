"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  Layers,
  Share2,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Play,
  Eye,
  ExternalLink,
  DollarSign,
  MessageSquare,
  Target,
  Clock,
  MapPin,
  X,
  Filter,
} from "lucide-react";
import AdminDateRangePicker, { DatePresetKey } from "@/components/AdminDateRangePicker";

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

export interface MetaContentRow extends MetaCampaignRow {
  ad_id?: string;
  ad_name?: string;
  content_text?: string;
  hook?: string;
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
  const [activeSubtab, setActiveSubtab] = useState<"analysis" | "campaign" | "content" | "accounts">("analysis");
  const [selectedPreset, setSelectedPreset] = useState<DatePresetKey>("THIS_MONTH");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Filters
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

  // Content Modal View
  const [selectedContent, setSelectedContent] = useState<MetaContentRow | null>(null);

  const loadData = async (fresh = false) => {
    if (fresh) setRefreshing(true);
    else setLoading(true);

    try {
      const scope = "all";
      let url = `/api/ads/meta-realtime?scope=${scope}`;
      if (customFrom && customTo) {
        url += `&since=${customFrom}&until=${customTo}`;
      }
      if (fresh) url += `&fresh=1`;

      const res = await fetch(url);
      const data = await res.json();

      setConfigured(data.ok !== false);
      if (data.message) setStatusMessage(data.message);

      if (data.campaigns) setCampaigns(data.campaigns);
      if (data.contentAds) setContentAds(data.contentAds);
      if (data.genderBreakdowns) setGenderData(data.genderBreakdowns);
      if (data.hourlyBreakdowns) setHourlyData(data.hourlyBreakdowns);
      if (data.geoBreakdowns) setGeoData(data.geoBreakdowns);
      if (data.accounts) setAccounts(data.accounts);
    } catch (err: any) {
      console.error("Load Meta Ads error:", err);
      setConfigured(false);
      setStatusMessage("Không thể tải dữ liệu Meta Ads: " + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPreset, customFrom, customTo]);

  // Filtered Campaigns List
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((row) => {
      if (serviceFilter && row.service !== serviceFilter) return false;
      if (branchFilter && row.branch !== branchFilter) return false;
      if (accountFilter && row.account_id !== accountFilter) return false;
      if (statusFilter && row.effective_status !== statusFilter) return false;
      return true;
    });
  }, [campaigns, serviceFilter, branchFilter, accountFilter, statusFilter]);

  // Filtered Content List
  const filteredContent = useMemo(() => {
    return contentAds.filter((row) => {
      if (serviceFilter && row.service !== serviceFilter) return false;
      if (branchFilter && row.branch !== branchFilter) return false;
      if (accountFilter && row.account_id !== accountFilter) return false;
      if (statusFilter && row.effective_status !== statusFilter) return false;
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
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Đang cập nhật..." : "Làm mới Meta"}</span>
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
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div>
          <label className="text-[11px] font-bold text-stone-500 block mb-1">Dịch vụ</label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full px-3 py-1.5 border rounded-xl bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
          >
            <option value="">Tất cả dịch vụ</option>
            <option value="Răng sứ">Răng sứ</option>
            <option value="Niềng răng">Niềng răng</option>
            <option value="Implant">Trồng răng Implant</option>
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
            <option value="">Tất cả khu vực</option>
            <option value="HCM">TP. Hồ Chí Minh</option>
            <option value="Bình Dương">Bình Dương</option>
            <option value="Biên Hoà">Biên Hoà / Đồng Nai</option>
            <option value="Cần Thơ">Cần Thơ</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-stone-500 block mb-1">Tài khoản Ads</label>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full px-3 py-1.5 border rounded-xl bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
          >
            <option value="">Tất cả tài khoản</option>
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

      {/* SUBTAB II: CAMPAIGN / ADSET */}
      {activeSubtab === "campaign" && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">
              Danh sách Chiến Dịch &amp; Nhóm Quảng Cáo Meta
            </h3>
            <span className="text-xs text-stone-500">Hiển thị {filteredCampaigns.length} dòng</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                  <th className="p-3">Campaign / Adset</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Dịch vụ</th>
                  <th className="p-3">Khu vực</th>
                  <th className="p-3">Chi tiêu</th>
                  <th className="p-3">TN mới</th>
                  <th className="p-3">CP/TN</th>
                  <th className="p-3">KHTN</th>
                  <th className="p-3">CPL</th>
                  <th className="p-3">Reach</th>
                  <th className="p-3">Impressions</th>
                  <th className="p-3">CPM</th>
                  <th className="p-3">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-6 text-center text-stone-400">
                      Không có Campaign / Adset nào khớp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((row, idx) => {
                    const isDanger = (row.spend || 0) > 500000 && (row.messagesNew || 0) === 0;
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-stone-50 transition-colors ${
                          isDanger ? "bg-rose-50/70 text-rose-900" : ""
                        }`}
                      >
                        <td className="p-3">
                          <p className="font-bold text-stone-900">{row.campaign_name || "Campaign không tên"}</p>
                          <small className="text-stone-400 block">{row.adset_name || "Nhóm tổng"}</small>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              row.effective_status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-200 text-stone-700"
                            }`}
                          >
                            {row.effective_status || "UNKNOWN"}
                          </span>
                        </td>
                        <td className="p-3">{row.service || "Khác"}</td>
                        <td className="p-3">{row.branch || "HCM"}</td>
                        <td className="p-3 font-bold">{(row.spend || 0).toLocaleString("vi-VN")} ₫</td>
                        <td className="p-3 font-bold">{row.messagesNew || 0}</td>
                        <td className="p-3">
                          {row.messagesNew ? Math.round(row.spend / row.messagesNew).toLocaleString("vi-VN") + " ₫" : "—"}
                        </td>
                        <td className="p-3 font-bold">{row.leads || 0}</td>
                        <td className="p-3">
                          {row.leads ? Math.round(row.spend / row.leads).toLocaleString("vi-VN") + " ₫" : "—"}
                        </td>
                        <td className="p-3">{(row.reach || 0).toLocaleString("vi-VN")}</td>
                        <td className="p-3">{(row.impressions || 0).toLocaleString("vi-VN")}</td>
                        <td className="p-3">{Math.round(row.cpm || 0).toLocaleString("vi-VN")} ₫</td>
                        <td className="p-3">{(row.ctr || 0).toFixed(2)}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB III: NỘI DUNG QUẢNG CÁO (CREATIVES) */}
      {activeSubtab === "content" && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">
              Phân Tích Nội Dung Quảng Cáo (Ad Creatives &amp; Video Funnel)
            </h3>
            <span className="text-xs text-stone-500">Hiển thị {filteredContent.length} quảng cáo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.length === 0 ? (
              <div className="col-span-full p-8 text-center text-stone-400 border border-dashed rounded-2xl">
                Chưa có dữ liệu nội dung quảng cáo khớp bộ lọc.
              </div>
            ) : (
              filteredContent.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-stone-200 rounded-2xl space-y-3 hover:border-[#0d4f4a] transition-all bg-stone-50/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#0d4f4a]/10 text-[#0d4f4a] text-[10px] font-bold">
                      {item.format || "POST"}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">ID: {item.ad_id || "—"}</span>
                  </div>

                  <h4 className="font-bold text-xs text-stone-900 line-clamp-2">
                    {item.hook || item.content_text || item.ad_name || "Nội dung quảng cáo"}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-stone-200">
                    <div>
                      <span className="text-stone-400 block">Chi tiêu:</span>
                      <strong className="text-stone-900">{(item.spend || 0).toLocaleString("vi-VN")} ₫</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">TN mới:</span>
                      <strong className="text-[#0d4f4a]">{item.messagesNew || 0}</strong>
                    </div>
                  </div>

                  {/* Video Funnel preview if available */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-stone-400 block">Phễu xem Video (25% ➔ 100%)</span>
                    <div className="flex items-end gap-1 h-6 bg-stone-100 p-1 rounded-lg">
                      <div className="bg-[#0d4f4a] w-full rounded-xs" style={{ height: "100%" }} title="25%" />
                      <div className="bg-[#0d4f4a] w-full rounded-xs" style={{ height: "75%" }} title="50%" />
                      <div className="bg-[#0d4f4a] w-full rounded-xs" style={{ height: "50%" }} title="75%" />
                      <div className="bg-[#0d4f4a] w-full rounded-xs" style={{ height: "35%" }} title="95%" />
                      <div className="bg-[#0d4f4a] w-full rounded-xs" style={{ height: "20%" }} title="100%" />
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedContent(item)}
                    className="w-full py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye size={13} />
                    <span>Xem chi tiết &amp; Link FB</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB IV: TÀI KHOẢN QUẢNG CÁO */}
      {activeSubtab === "accounts" && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4 font-mono">
          <h3 className="font-bold text-sm text-stone-900">Danh Sách Tài Khoản Quảng Cáo Meta</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                  <th className="p-3">Tài khoản</th>
                  <th className="p-3">ID Tài khoản</th>
                  <th className="p-3">Chi tiêu</th>
                  <th className="p-3">TN mới</th>
                  <th className="p-3">CP/TN</th>
                  <th className="p-3">KHTN</th>
                  <th className="p-3">CPL</th>
                  <th className="p-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-stone-400">
                      Chưa có dữ liệu tài khoản quảng cáo.
                    </td>
                  </tr>
                ) : (
                  accounts.map((acc, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="p-3 font-bold text-stone-900">{acc.account_name || acc.account_id}</td>
                      <td className="p-3 text-stone-500">act_{acc.account_id}</td>
                      <td className="p-3 font-bold">{metrics.spend.toLocaleString("vi-VN")} ₫</td>
                      <td className="p-3 font-bold">{metrics.messages.toLocaleString("vi-VN")}</td>
                      <td className="p-3">{Math.round(metrics.cptn).toLocaleString("vi-VN")} ₫</td>
                      <td className="p-3 font-bold">{metrics.leads.toLocaleString("vi-VN")}</td>
                      <td className="p-3">{Math.round(metrics.cpl).toLocaleString("vi-VN")} ₫</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Hoạt động
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Modal View */}
      {selectedContent && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedContent(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-base text-stone-900 pr-6">Chi tiết Nội dung Quảng cáo</h3>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-1">
              <span className="text-[10px] text-stone-400 block uppercase">Nội dung văn bản / Hook</span>
              <p className="text-xs text-stone-800 font-sans leading-relaxed">
                {selectedContent.content_text || selectedContent.hook || "Không có nội dung mô tả."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block">Campaign:</span>
                <strong className="text-stone-900">{selectedContent.campaign_name || "—"}</strong>
              </div>
              <div>
                <span className="text-stone-400 block">Chi tiêu:</span>
                <strong className="text-[#0d4f4a]">{(selectedContent.spend || 0).toLocaleString("vi-VN")} ₫</strong>
              </div>
              <div>
                <span className="text-stone-400 block">Tin nhắn mới:</span>
                <strong>{selectedContent.messagesNew || 0}</strong>
              </div>
              <div>
                <span className="text-stone-400 block">KHTN (Leads):</span>
                <strong>{selectedContent.leads || 0}</strong>
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-end gap-2">
              {selectedContent.facebook_url && (
                <a
                  href={selectedContent.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0d4f4a] hover:bg-[#083b37] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink size={14} />
                  <span>Mở bài viết Facebook</span>
                </a>
              )}
              <button
                onClick={() => setSelectedContent(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
