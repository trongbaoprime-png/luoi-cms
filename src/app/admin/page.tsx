"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminDateRangePicker, { DatePresetKey } from "@/components/AdminDateRangePicker";
import {
  FileText,
  Eye,
  Bot,
  Share2,
  Plus,
  Sparkles,
  CheckCircle2,
  ShoppingBag,
  Tag,
  Mail,
  Users,
  MousePointer,
  ArrowUpRight,
  Zap,
  Flame,
  TrendingUp,
  BarChart3,
  Globe,
  Award,
  DollarSign,
  PhoneCall,
  CheckSquare,
} from "lucide-react";

interface AnalyticsData {
  summary: {
    totalPosts: number;
    totalProducts: number;
    totalDeals: number;
    totalSubscribers: number;
    totalContacts?: number;
    unreadContacts: number;
    totalClicks: number;
    totalViews: number;
  };
  onlineVisitors?: {
    activeNow: number;
    funnel: {
      views: number;
      submits: number;
      leads: number;
      checkins: number;
      purchases: number;
    };
    platformEvents: Array<{
      name: string;
      code: string;
      color: string;
      submits: number;
      leads: number;
      purchases: number;
    }>;
  };
  capiSignal?: {
    successRate: number;
    totalEvents: number;
    purchaseEvents: number;
    leadEvents: number;
  };
  platformBreakdown?: Array<{
    platform: string;
    type?: string;
    code: string;
    color: string;
    badgeColor: string;
    pageviews: number;
    registrations: number;
    leads: number;
    bookings: number;
    purchases: number;
    revenue: number;
  }>;
  topPerformingPages?: {
    mostViewed: Array<{ title: string; slug: string; views: number; category: string }>;
    mostRegistrations: Array<{ title: string; registrations: number; conversionRate: string }>;
    topLeads: Array<{ title: string; leads: number; qualifiedRate: string }>;
    topRevenue: Array<{ title: string; revenue: number; purchases: number }>;
  };
  topProducts: Array<{
    id: string;
    title: string;
    merchant: string;
    clicks: number;
    price?: number;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTabTop, setActiveTabTop] = useState<"VIEWS" | "REGS" | "LEADS" | "REVENUE">("VIEWS");
  const [platformFilter, setPlatformFilter] = useState<"ALL" | "PAID" | "ORGANIC">("ALL");
  const [selectedDatePreset, setSelectedDatePreset] = useState<DatePresetKey>("TODAY");

  const fetchAnalytics = (preset: DatePresetKey) => {
    setLoading(true);
    fetch(`/api/admin/analytics?datePreset=${preset}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics(selectedDatePreset);
  }, []);

  const handleChangeDatePreset = (preset: DatePresetKey) => {
    setSelectedDatePreset(preset);
    fetchAnalytics(preset);
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      {/* Top Welcome Header with Meta Events Manager Style Date Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
            Bảng Quản Trị Multi-Platform Analytics &amp; Real-time Visitors
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Thống kê lượt xem, đăng ký form, Qualified Lead &amp; Doanh thu thực tế theo từng nền tầng Meta, Google, TikTok, Zalo &amp; SEO.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* USER REQUIREMENT: META EVENTS MANAGER STYLE DATE RANGE PICKER DROPDOWN */}
          <AdminDateRangePicker
            selectedPreset={selectedDatePreset}
            onChangePreset={handleChangeDatePreset}
          />

          <Link
            href="/admin/ads-setup"
            aria-label="Cấu Hình Ads APIs"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold hover:bg-sky-100 transition-colors shadow-2xs"
          >
            <Share2 size={15} />
            <span>Cấu Hình Ads APIs</span>
          </Link>
          <Link
            href="/admin/articles/new"
            aria-label="Bài viết mới"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0d9488] text-white rounded-xl text-xs font-bold hover:bg-[#0f766e] transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span>Bài viết mới</span>
          </Link>
        </div>
      </div>

      {/* REAL-TIME OVERVIEW & COMPACT KPI CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Card 1: Overview miniCRM (Wider 2-Column Span) */}
        <div className="xl:col-span-2 bg-white border border-stone-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0d4f4a] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0d4f4a]"></span>
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0d4f4a]">Overview miniCRM</span>
            </div>
            <span className="font-mono text-[10px] text-[#0d4f4a] bg-[#0d4f4a]/10 border border-[#0d4f4a]/30 px-2 py-0.5 rounded-lg font-bold uppercase">
              {data?.onlineVisitors?.activeNow ?? 0} ACTIVE
            </span>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
            <div className="text-[10px] font-mono font-bold text-stone-600 uppercase tracking-wider">
              Phễu Chuyển Đổi CRM
            </div>
            <div className="grid grid-cols-5 gap-1 text-center font-mono">
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-stone-500 font-medium">Pageview</span>
                <span className="text-xs font-bold text-stone-900">
                  {data?.onlineVisitors?.funnel.views ? (data.onlineVisitors.funnel.views > 1000 ? `${(data.onlineVisitors.funnel.views / 1000).toFixed(1)}k` : data.onlineVisitors.funnel.views) : 0}
                </span>
              </div>
              <div className="flex flex-col items-center border-l border-stone-200">
                <span className="text-[9px] text-[#0d4f4a] font-medium">Form Submit</span>
                <span className="text-xs font-bold text-[#0d4f4a]">
                  {data?.onlineVisitors?.funnel.submits ?? 0}
                </span>
              </div>
              <div className="flex flex-col items-center border-l border-stone-200">
                <span className="text-[9px] text-stone-700 font-medium">Lead CRM</span>
                <span className="text-xs font-bold text-stone-900">
                  {data?.onlineVisitors?.funnel.leads ?? 0}
                </span>
              </div>
              <div className="flex flex-col items-center border-l border-stone-200">
                <span className="text-[9px] text-stone-700 font-medium">Checkin</span>
                <span className="text-xs font-bold text-stone-900">
                  {data?.onlineVisitors?.funnel.checkins ?? 0}
                </span>
              </div>
              <div className="flex flex-col items-center border-l border-stone-200">
                <span className="text-[9px] text-[#0d4f4a] font-medium">Mua hàng</span>
                <span className="text-xs font-bold text-[#0d4f4a]">
                  {data?.onlineVisitors?.funnel.purchases ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* SEPARATED EVENTS BREAKDOWN FOR EACH PLATFORM */}
          <div className="space-y-1 pt-1 border-t border-stone-100">
            <div className="text-[10px] font-mono font-bold text-stone-600 uppercase tracking-wider flex items-center justify-between">
              <span>Sự Kiện Nền Tảng Phân Tách</span>
              <span className="text-[9px] text-stone-400">Submit | Lead | Mua</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono font-medium text-stone-800">
              {data?.onlineVisitors?.platformEvents?.map((p) => (
                <div key={p.code} className="flex items-center justify-between bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                  <span className="font-bold flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${p.color}`} />
                    {p.name}:
                  </span>
                  <span className="text-[9px] font-mono text-stone-700 font-bold">
                    <span>{p.submits > 1000 ? `${(p.submits / 1000).toFixed(1)}k` : p.submits} S</span> | <span>{p.leads > 1000 ? `${(p.leads / 1000).toFixed(1)}k` : p.leads} L</span> | <span className="text-[#0d4f4a]">{p.purchases} M</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SUMMARY KPI COUNTERS (3 Compact Cards) */}
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 2: Combined Bài Viết & Lượt Đọc */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-600">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Bài Viết & Lượt Đọc</span>
              <div className="flex items-center gap-1 text-[#0d4f4a]">
                <FileText size={16} />
                <Eye size={16} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 my-2 font-mono">
              <div>
                <span className="text-[10px] text-stone-500 font-bold block uppercase">Bài Viết</span>
                <span className="text-2xl font-bold text-stone-900">{loading ? "..." : data?.summary.totalPosts.toLocaleString() || 0}</span>
              </div>
              <div className="border-l border-stone-200 pl-2">
                <span className="text-[10px] text-stone-500 font-bold block uppercase">Lượt Đọc</span>
                <span className="text-2xl font-bold text-stone-900">{loading ? "..." : data?.summary.totalViews.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Clicks Affiliate */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-600">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Clicks Affiliate</span>
              <MousePointer size={18} className="text-[#0d4f4a]" />
            </div>
            <div className="text-3xl font-bold font-mono text-stone-900 my-2">
              {loading ? "..." : data?.summary.totalClicks.toLocaleString() || 0}
            </div>
          </div>

          {/* Card 4: Đăng Ký Form */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-600">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Đăng Ký Form</span>
              <CheckSquare size={18} className="text-[#0d4f4a]" />
            </div>
            <div className="text-3xl font-bold font-mono text-stone-900 my-2">
              {loading ? "..." : (data?.summary.totalContacts || data?.summary.totalSubscribers || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* REQUIREMENT 1 (HÌNH 1): MULTI-PLATFORM EVENT ANALYTICS BREAKDOWN TABLE */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={22} />
              <span>📊 Bảng Thống Kê Sự Kiện Phân Loại Quảng Cáo (Paid Ads) vs Tự Nhiên (Organic)</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Tách biệt rõ ràng hiệu quả giữa nguồn Quảng cáo trả phí (CPA/ROAS) và nguồn Tự nhiên miễn phí (SEO, Fanpage, TikTok video, Zalo).
            </p>
          </div>

          {/* Paid vs Organic Filter Switcher */}
          <div className="flex bg-stone-100 p-1 rounded-xl gap-1 shrink-0 text-xs font-mono font-bold">
            <button
              onClick={() => setPlatformFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                platformFilter === "ALL" ? "bg-stone-900 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              🌐 Tất Cả Nguồn ({data?.platformBreakdown?.length || 0})
            </button>
            <button
              onClick={() => setPlatformFilter("PAID")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                platformFilter === "PAID" ? "bg-[#0284c7] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              💰 Paid Ads Trả Phí (3)
            </button>
            <button
              onClick={() => setPlatformFilter("ORGANIC")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                platformFilter === "ORGANIC" ? "bg-emerald-600 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              🌿 Tự Nhiên / Organic (6)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-xs text-left text-stone-700">
            <thead className="bg-stone-100 font-mono text-[11px] text-stone-800 uppercase border-b border-stone-200">
              <tr>
                <th className="p-3">Nền Tảng / Kênh Web</th>
                <th className="p-3">Phân Loại Nguồn</th>
                <th className="p-3 text-right">👁️ PageViews</th>
                <th className="p-3 text-right">📝 Đăng Ký Form</th>
                <th className="p-3 text-right">📞 Qualified Lead</th>
                <th className="p-3 text-right">📅 AuditBooking</th>
                <th className="p-3 text-right">💰 Purchase (Số đơn)</th>
                <th className="p-3 text-right">💵 Doanh Thu Thực (VND)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white font-mono text-[11px]">
              {data?.platformBreakdown
                ?.filter((item) => platformFilter === "ALL" || item.type === platformFilter)
                .map((row) => (
                  <tr key={row.code} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.badgeColor}`}>
                        {row.code}
                      </span>
                      <span>{row.platform}</span>
                    </td>
                    <td className="p-3">
                      {row.type === "PAID" ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold text-[10px] border border-amber-300">
                          💰 PAID ADS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold text-[10px] border border-emerald-300">
                          🌿 ORGANIC
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right text-stone-700 font-semibold">{row.pageviews.toLocaleString()}</td>
                    <td className="p-3 text-right text-sky-700 font-bold">{row.registrations.toLocaleString()}</td>
                    <td className="p-3 text-right text-[#0284c7] font-bold">{row.leads.toLocaleString()}</td>
                    <td className="p-3 text-right text-purple-700 font-bold">{row.bookings.toLocaleString()}</td>
                    <td className="p-3 text-right text-emerald-700 font-bold">{row.purchases.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-emerald-800">
                      {(row.revenue / 1000000).toFixed(0)} Triệu VND
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REQUIREMENT 2 (HÌNH 2): TOP PERFORMING PAGES & ARTICLES MATRIX */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
              <Award className="text-amber-600" size={22} />
              <span>🏆 Top Trang &amp; Bài Viết Hiệu Quả Nhất (Top Performing Pages Matrix)</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Xếp hạng top nội dung dẫn đầu về lượt xem, tỷ lệ đăng ký form, lead chất lượng và mang lại doanh thu thực tế cao nhất.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-stone-100 p-1 rounded-xl gap-1 shrink-0 text-xs font-mono font-bold">
            <button
              onClick={() => setActiveTabTop("VIEWS")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTabTop === "VIEWS" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              👁️ Xem Nhiều Nhất
            </button>
            <button
              onClick={() => setActiveTabTop("REGS")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTabTop === "REGS" ? "bg-sky-600 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              📝 Đăng Ký Form
            </button>
            <button
              onClick={() => setActiveTabTop("LEADS")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTabTop === "LEADS" ? "bg-purple-600 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              📞 Qualified Lead
            </button>
            <button
              onClick={() => setActiveTabTop("REVENUE")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTabTop === "REVENUE" ? "bg-emerald-600 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              💰 Doanh Thu Cao
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="divide-y divide-stone-100">
          {activeTabTop === "VIEWS" &&
            data?.topPerformingPages?.mostViewed.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-mono font-bold flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900">{item.title}</h3>
                    <span className="text-[11px] text-stone-500 font-mono">Chuyên mục: {item.category} | /{item.slug}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-stone-900 text-sm">{item.views.toLocaleString()}</span>
                  <span className="block text-[10px] text-stone-500 font-mono">lượt xem</span>
                </div>
              </div>
            ))}

          {activeTabTop === "REGS" &&
            data?.topPerformingPages?.mostRegistrations.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-mono font-bold flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900">{item.title}</h3>
                    <span className="text-[11px] text-sky-700 font-mono">Tỷ lệ chuyển đổi: {item.conversionRate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sky-700 text-sm">{item.registrations} Form</span>
                  <span className="block text-[10px] text-stone-500 font-mono">Hoàn tất đăng ký</span>
                </div>
              </div>
            ))}

          {activeTabTop === "LEADS" &&
            data?.topPerformingPages?.topLeads.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-mono font-bold flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900">{item.title}</h3>
                    <span className="text-[11px] text-purple-700 font-mono">Chỉ số duyệt Lead: {item.qualifiedRate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-purple-700 text-sm">{item.leads} Qualified Leads</span>
                  <span className="block text-[10px] text-stone-500 font-mono">Đã xác nhận nhu cầu</span>
                </div>
              </div>
            ))}

          {activeTabTop === "REVENUE" &&
            data?.topPerformingPages?.topRevenue.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900">{item.title}</h3>
                    <span className="text-[11px] text-emerald-700 font-mono">Số đơn chốt: {item.purchases} đơn hàng</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-800 text-sm">{(item.revenue / 1000000).toFixed(0)} Triệu VND</span>
                  <span className="block text-[10px] text-stone-500 font-mono">Doanh thu thực tế</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Top Affiliate Products & Ads Platform Integration Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif text-[#0f172a]">Top Sản Phẩm Click Nhiều Nhất</h2>
            <Link href="/admin/products" className="text-xs text-[#0d9488] font-bold hover:underline">
              Xem tất cả
            </Link>
          </div>
          {loading ? (
            <div className="p-4 text-center text-xs text-stone-400">Đang nạp dữ liệu...</div>
          ) : !data?.topProducts || data.topProducts.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-400 italic">Chưa có dữ liệu click sản phẩm.</div>
          ) : (
            <div className="divide-y divide-stone-100">
              {data.topProducts.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#0d9488] shrink-0" />
                    <span className="font-semibold text-stone-900 line-clamp-1">{p.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">
                      {p.merchant}
                    </span>
                    <span className="font-mono font-bold text-[#0d9488]">{p.clicks} clicks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Ads Platform Connection Card */}
        <div className="bg-[#0d4f4a] p-6 rounded-xl text-white shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#99f6e4]">Tích hợp Ads Platform APIs</span>
            <h2 className="text-xl font-bold font-serif mt-2 mb-3">Tự Động Đẩy Chuyển Đổi Về Ads Manager</h2>
            <p className="text-sm text-[#ccfbf1] leading-relaxed">
              Mỗi khi khách đặt lịch audit hoặc gọi điện, hệ thống sẽ gửi sự kiện bảo mật qua Meta CAPI, Google Ads Conversion API &amp; TikTok Events API.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#115e59]">
            <Link
              href="/admin/ads-setup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#0d4f4a] text-sm font-bold hover:bg-[#f0fdf4] transition-colors"
            >
              <span>Quản lý Token CAPI &amp; Test Pixel</span> →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
