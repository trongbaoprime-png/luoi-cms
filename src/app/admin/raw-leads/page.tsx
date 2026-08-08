"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  RefreshCw,
  Gift,
  Phone,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MousePointerClick,
  MessageCircle,
  PhoneCall,
  Send,
  ExternalLink,
  Filter,
} from "lucide-react";

interface RawLead {
  id: string;
  name: string;
  email: string | null;
  subject: string | null; // SĐT hoặc Đường dẫn Click
  message: string | null; // Ghi chú / Chi tiết Click
  conversionStage: string; // REGISTERED, CLICK_ZALO, CLICK_HOTLINE, CLICK_MESSENGER, CLICK_WHATSAPP
  ipAddress: string | null;
  fbclid: string | null;
  fbp: string | null;
  fbc: string | null;
  gclid: string | null;
  ttclid: string | null;
  utmSource: string | null;
  createdAt: string;
}

interface StatsData {
  totalForms: number;
  totalClicks: number;
  clickZalo: number;
  clickHotline: number;
  clickMessenger: number;
  clickWhatsapp: number;
}

export default function RawLeadsPage() {
  const [rawLeads, setRawLeads] = useState<RawLead[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalForms: 0,
    totalClicks: 0,
    clickZalo: 0,
    clickHotline: 0,
    clickMessenger: 0,
    clickWhatsapp: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"FORM" | "CLICKS">("FORM");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRawLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("pageSize", "30");
      params.append("tab", activeTab);
      if (activeTab === "CLICKS" && channelFilter !== "ALL") {
        params.append("channel", channelFilter);
      }
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/raw-leads?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setRawLeads(data.data);
        if (data.stats) setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch {
      console.error("Lỗi nạp dữ liệu khách thô");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawLeads();
  }, [page, activeTab, channelFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRawLeads();
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getChannelBadge = (stage: string) => {
    const s = stage.toUpperCase();
    if (s.includes("ZALO")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-800 font-bold border border-stone-200 rounded-xs text-xs font-mono">
          <MessageCircle size={13} className="text-[#0d4f4a]" /> Zalo Chat
        </span>
      );
    }
    if (s.includes("HOTLINE") || s.includes("CALL") || s.includes("PHONE")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-800 font-bold border border-stone-200 rounded-xs text-xs font-mono">
          <PhoneCall size={13} className="text-[#0d4f4a]" /> Hotline / Gọi
        </span>
      );
    }
    if (s.includes("MESS")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-800 font-bold border border-stone-200 rounded-xs text-xs font-mono">
          <Send size={13} className="text-[#0d4f4a]" /> Messenger
        </span>
      );
    }
    if (s.includes("WHATSAPP") || s.includes("WA")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-800 font-bold border border-stone-200 rounded-xs text-xs font-mono">
          <MessageCircle size={13} className="text-[#0d4f4a]" /> WhatsApp
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-800 font-bold border border-stone-200 rounded-xs text-xs font-mono">
        <FileText size={13} className="text-[#0d4f4a]" /> Website Form
      </span>
    );
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-3">
              <FileText className="text-[#0d4f4a]" size={26} />
              <span>Khách đăng ký &amp; Click Kênh liên hệ</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchRawLeads}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d4f4a] hover:bg-[#083b37] text-white font-mono font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span>Làm Mới</span>
            </button>
          </div>
        </div>

        {/* 5 KPI Counter Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-stone-200">
          {/* Card 1: Tổng Form */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 flex flex-col justify-between shadow-2xs">
            <div className="text-[11px] text-stone-700 font-bold uppercase tracking-wider flex items-center gap-1">
              <FileText size={13} className="text-[#0d4f4a]" />
              <span>ĐĂNG KÝ FORM</span>
            </div>
            <div className="text-2xl font-black text-[#0d4f4a] mt-1">
              {(stats.totalForms || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-500">Đã điền đủ SĐT</div>
          </div>

          {/* Card 2: Click Zalo */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 flex flex-col justify-between shadow-2xs">
            <div className="text-[11px] text-stone-700 font-bold uppercase tracking-wider flex items-center gap-1">
              <MessageCircle size={13} className="text-blue-600" />
              <span>CLICK ZALO</span>
            </div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {(stats.clickZalo || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-500">Nút Chat Zalo</div>
          </div>

          {/* Card 3: Click Hotline */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 flex flex-col justify-between shadow-2xs">
            <div className="text-[11px] text-stone-700 font-bold uppercase tracking-wider flex items-center gap-1">
              <PhoneCall size={13} className="text-emerald-700" />
              <span>CLICK HOTLINE</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {(stats.clickHotline || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-500">Nút Gọi Cuộc Gọi</div>
          </div>

          {/* Card 4: Click Messenger */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 flex flex-col justify-between shadow-2xs">
            <div className="text-[11px] text-stone-700 font-bold uppercase tracking-wider flex items-center gap-1">
              <Send size={13} className="text-indigo-600" />
              <span>CLICK MESSENGER</span>
            </div>
            <div className="text-2xl font-black text-indigo-600 mt-1">
              {(stats.clickMessenger || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-500">Nút Nhắn tin FB</div>
          </div>

          {/* Card 5: Click WhatsApp */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 flex flex-col justify-between shadow-2xs">
            <div className="text-[11px] text-stone-700 font-bold uppercase tracking-wider flex items-center gap-1">
              <MessageCircle size={13} className="text-emerald-600" />
              <span>CLICK WHATSAPP</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {(stats.clickWhatsapp || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-500">Chat WhatsApp</div>
          </div>
        </div>
      </div>

      {/* Navigation & Tab Switcher Bar */}
      <div className="flex border-b border-stone-200 gap-6 font-mono text-xs pt-1 px-2">
        <Link
          href="/admin/crm"
          className="pb-2.5 font-medium flex items-center gap-1.5 transition-all border-b-2 border-transparent text-stone-500 hover:text-stone-900 cursor-pointer"
        >
          <ShieldCheck size={16} />
          <span>miniCRM (Bảng Quản Lý)</span>
        </Link>

        <button
          onClick={() => {
            setActiveTab("FORM");
            setPage(1);
          }}
          className={`pb-2.5 font-bold flex items-center gap-1.5 transition-all cursor-pointer border-b-2 ${
            activeTab === "FORM"
              ? "border-[#0d4f4a] text-[#0d4f4a]"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <FileText size={16} />
          <span>Khách Đăng Ký Form ({stats.totalForms || 0})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("CLICKS");
            setPage(1);
          }}
          className={`pb-2.5 font-bold flex items-center gap-1.5 transition-all cursor-pointer border-b-2 ${
            activeTab === "CLICKS"
              ? "border-[#0d4f4a] text-[#0d4f4a]"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <MousePointerClick size={16} />
          <span>Thống Kê Click Kênh ({stats.totalClicks || 0})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder={activeTab === "FORM" ? "Tìm theo Tên, SĐT, Email..." : "Tìm theo Kênh, URL, Nguồn..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold shadow-xs cursor-pointer shrink-0"
          >
            Tìm
          </button>
        </form>

        {activeTab === "CLICKS" && (
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-stone-400" />
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="ALL">Tất cả Kênh Click</option>
              <option value="ZALO">Kênh Zalo</option>
              <option value="HOTLINE">Kênh Hotline / Gọi</option>
              <option value="MESSENGER">Kênh Messenger</option>
              <option value="WHATSAPP">Kênh WhatsApp</option>
            </select>
          </div>
        )}

        <div className="text-xs text-stone-500">
          Hiển thị <span className="font-bold text-slate-800">{rawLeads.length}</span> / {totalCount} bản ghi (Trang {page}/{totalPages})
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs font-bold uppercase text-stone-600 tracking-wider">
              {activeTab === "FORM" ? (
                <tr>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5">Họ &amp; Tên Khách</th>
                  <th className="p-3.5">Số Điện Thoại</th>
                  <th className="p-3.5">Nội Dung / Quà Tặng</th>
                  <th className="p-3.5">Mã Tracking (Meta fbclid)</th>
                  <th className="p-3.5">IP Address</th>
                </tr>
              ) : (
                <tr>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5">Kênh Click</th>
                  <th className="p-3.5">Nút Đích / Hành Động</th>
                  <th className="p-3.5">Nguồn &amp; Chi Tiết Click</th>
                  <th className="p-3.5">Mã Tracking CAPI</th>
                  <th className="p-3.5">IP Address</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    <RefreshCw className="animate-spin inline-block mr-2" size={20} />
                    Đang nạp dữ liệu...
                  </td>
                </tr>
              ) : rawLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    {activeTab === "FORM"
                      ? "Chưa có đăng ký thô nào từ Website."
                      : "Chưa có lượt click nút liên hệ nào từ Website."}
                  </td>
                </tr>
              ) : (
                rawLeads.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 text-xs text-stone-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-stone-400" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </td>

                    {activeTab === "FORM" ? (
                      <>
                        <td className="p-3.5 font-bold text-slate-900">
                          {item.name}
                          {item.email && <div className="text-xs font-normal text-stone-400">{item.email}</div>}
                        </td>
                        <td className="p-3.5 font-mono text-emerald-700 font-bold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Phone size={14} className="text-emerald-500" />
                            <span>{item.subject || "Chưa nhập"}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-xs max-w-xs">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 font-semibold rounded text-[11px]">
                            <Gift size={12} />
                            <span>{item.message || "Khách điền Form Website"}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-xs font-mono max-w-xs truncate">
                          {item.fbclid ? (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px] block truncate">
                              fbclid: {item.fbclid}
                            </span>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                        <td className="p-3.5 text-xs text-stone-500 font-mono">
                          {item.ipAddress || "—"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3.5">
                          {getChannelBadge(item.conversionStage)}
                        </td>
                        <td className="p-3.5 font-mono text-xs font-bold text-slate-800 max-w-xs truncate">
                          <span title={item.subject || ""}>{item.subject || item.name}</span>
                        </td>
                        <td className="p-3.5 text-xs text-stone-600 max-w-xs">
                          <p className="line-clamp-2 text-[11px] font-mono text-stone-500">
                            {item.message || "Bấm nút liên hệ nhanh"}
                          </p>
                        </td>
                        <td className="p-3.5 text-xs font-mono max-w-xs space-y-1">
                          {item.fbclid && (
                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px] block truncate">
                              fb: {item.fbclid}
                            </span>
                          )}
                          {item.gclid && (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] block truncate">
                              gg: {item.gclid}
                            </span>
                          )}
                          {item.ttclid && (
                            <span className="px-1.5 py-0.5 bg-stone-100 text-stone-800 font-bold rounded text-[10px] block truncate">
                              tt: {item.ttclid}
                            </span>
                          )}
                          {!item.fbclid && !item.gclid && !item.ttclid && (
                            <span className="text-stone-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="p-3.5 text-xs text-stone-500 font-mono">
                          {item.ipAddress || "—"}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft size={16} className="inline mr-1" /> Trang trước
          </button>
          <span className="text-xs text-stone-600 font-semibold">
            Trang {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
          >
            Trang sau <ChevronRight size={16} className="inline ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
