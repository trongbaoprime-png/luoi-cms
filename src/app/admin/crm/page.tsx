"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CRMErrorBoundary } from "@/components/crm/ErrorBoundary";
import {
  Users as UsersIcon,
  CheckCircle2,
  FileText,
  CalendarDays,
  ShoppingBag as ShoppingBagIcon,
  RefreshCw as RefreshCwIcon,
  FileSpreadsheet as FileSpreadsheetIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  ShieldCheck as ShieldCheckIcon,
  TrendingUp as TrendingUpIcon,
  XCircle as XCircleIcon,
  UserCheck as UserCheckIcon,
  DollarSign as DollarSignIcon,
  Building2 as Building2Icon,
  Stethoscope as StethoscopeIcon,
  Headphones as HeadphonesIcon,
  Plus as PlusIcon,
  Edit3 as EditIcon,
  Trash2 as TrashIcon,
  Download as DownloadIcon,
  Zap as ZapIcon,
  ChevronDown,
  Calendar as CalendarIcon,
} from "lucide-react";
import { formatDisplayDate, isRealName } from "@/lib/tds-parser";

interface LeadItem {
  id: string;
  leadId?: string;
  fullName: string;
  phone: string;
  email?: string;
  source: string;
  sourceGroup: string;
  status: string;
  telesale?: string;
  branch?: string;
  branchGroup?: string;
  service?: string;
  serviceGroup?: string;
  checkinDate?: string;
  result?: string;
  isOldCustomer?: boolean;
  revenue?: number;
  actualRevenue?: number;
  caTheoRevenue?: number;
  value?: number;
  currency: string;
  syncedToMeta: boolean;
  ref?: string;
  note?: string;
  createdAt: string;
}

interface KPI {
  totalLeads: number;
  qualifiedCount: number;
  scheduledCount: number;
  checkinCount: number;
  passCount: number;
  failCount: number;
  purchaseCount: number;
  totalRevenue: number;
  totalActualRevenue: number;
  totalCaTheoRevenue: number;
  passRate: number;
  // Source breakdown
  revenueFacebook?: number;
  revenueWebGg?: number;
  revenueTikTok?: number;
  revenueHotline?: number;
  // MKT revenue
  revenueMkt?: number;
  revenueMktFb?: number;
  revenueMktWebGg?: number;
  revenueMktTT?: number;
  revenueMktHotline?: number;
  // Ad spend
  adSpend?: number;
  adBudgetVat?: number;
  adCostToMktRatio?: number;
  // Actual revenue breakdown
  actualCount?: number;
  actualNewRevenue?: number;
  actualNewCount?: number;
  actualOldRevenue?: number;
  actualOldCount?: number;
  // New vs Old DT
  revenueNew?: number;
  revenueNewCount?: number;
  revenueOld?: number;
  revenueOldCount?: number;
  // Special segments
  revenueOldPS?: number;
  revenueOldPSCount?: number;
  caTheoCount?: number;
  revenueVietKieu?: number;
  vietKieuCount?: number;
  revenueNN?: number;
  nnCount?: number;
  revenueKoMkt?: number;
  koMktCount?: number;
}

const isoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatVnDate = (isoStr: string) => {
  if (!isoStr) return "";
  const [y, m, d] = isoStr.split("-");
  return `${d}/${m}/${y}`;
};

const getSourceBadgeStyle = (src?: string) => {
  const s = (src || "").toUpperCase();
  if (s.includes("FB") || s.includes("FACEBOOK")) {
    return "bg-[#1877f2]/10 text-[#1877f2] border border-[#1877f2]/30 font-bold font-mono px-1.5 py-0.5 rounded-xs text-[10px]";
  }
  if (s.includes("TIKTOK") || s.includes("TT")) {
    return "bg-stone-900 text-stone-100 border border-stone-800 font-bold font-mono px-1.5 py-0.5 rounded-xs text-[10px]";
  }
  if (s.includes("ZALO")) {
    return "bg-[#0068ff]/10 text-[#0068ff] border border-[#0068ff]/30 font-bold font-mono px-1.5 py-0.5 rounded-xs text-[10px]";
  }
  if (s.includes("HOTLINE") || s.includes("CALL") || s.includes("PHONE")) {
    return "bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold font-mono px-1.5 py-0.5 rounded-xs text-[10px]";
  }
  // Default WEBSITE / GOOGLE / FORM
  return "bg-[#0d4f4a]/10 text-[#0d4f4a] border border-[#0d4f4a]/30 font-bold font-mono px-1.5 py-0.5 rounded-xs text-[10px]";
};

const PRESET_OPTIONS = [
  { key: "month4", label: "Tháng 4 (04/2026)" },
  { key: "month5", label: "Tháng 5 (05/2026)" },
  { key: "month6", label: "Tháng 6 (06/2026)" },
  { key: "month7", label: "Tháng 7 (07/2026)" },
  { key: "month8", label: "Tháng 8 (08/2026)" },
  { key: "thisMonth", label: "Tháng này" },
  { key: "lastMonth", label: "Tháng trước" },
  { key: "today", label: "Hôm nay" },
  { key: "yesterday", label: "Hôm qua" },
  { key: "today_yesterday", label: "Hôm nay và hôm qua" },
  { key: "7days", label: "7 ngày qua" },
  { key: "14days", label: "14 ngày qua" },
  { key: "28days", label: "28 ngày qua" },
  { key: "30days", label: "30 ngày qua" },
  { key: "thisWeek", label: "Tuần này" },
  { key: "lastWeek", label: "Tuần trước" },
  { key: "all", label: "Tối đa" },
];

const getPresetDates = (presetKey: string) => {
  const now = new Date();
  let a = new Date(now);
  let b = new Date(now);

  if (presetKey === "month4") {
    return { from: "2026-04-01", to: "2026-04-30" };
  } else if (presetKey === "month5") {
    return { from: "2026-05-01", to: "2026-05-31" };
  } else if (presetKey === "month6") {
    return { from: "2026-06-01", to: "2026-06-30" };
  } else if (presetKey === "month7") {
    return { from: "2026-07-01", to: "2026-07-31" };
  } else if (presetKey === "month8") {
    return { from: "2026-08-01", to: "2026-08-31" };
  } else if (presetKey === "today") {
    // Today
  } else if (presetKey === "yesterday") {
    a.setDate(a.getDate() - 1);
    b = new Date(a);
  } else if (presetKey === "today_yesterday") {
    a.setDate(a.getDate() - 1);
  } else if (presetKey === "7days") {
    a.setDate(a.getDate() - 6);
  } else if (presetKey === "14days") {
    a.setDate(a.getDate() - 13);
  } else if (presetKey === "28days") {
    a.setDate(a.getDate() - 27);
  } else if (presetKey === "30days") {
    a.setDate(a.getDate() - 29);
  } else if (presetKey === "thisWeek") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    a = new Date(now.setDate(diff));
    b = new Date();
  } else if (presetKey === "lastWeek") {
    const day = now.getDay();
    const diffToLastMon = now.getDate() - day - 6 + (day === 0 ? -6 : 1);
    a = new Date(now.setDate(diffToLastMon));
    b = new Date(a);
    b.setDate(b.getDate() + 6);
  } else if (presetKey === "thisMonth") {
    a = new Date(now.getFullYear(), now.getMonth(), 1);
    b = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (presetKey === "lastMonth") {
    a = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    b = new Date(now.getFullYear(), now.getMonth(), 0);
  } else if (presetKey === "all") {
    return { from: "", to: "" };
  }

  return { from: isoDate(a), to: isoDate(b) };
};

export function MiniCrmAdminPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [kpi, setKpi] = useState<KPI>({
    totalLeads: 0,
    qualifiedCount: 0,
    scheduledCount: 0,
    checkinCount: 0,
    passCount: 0,
    failCount: 0,
    purchaseCount: 0,
    totalRevenue: 0,
    totalActualRevenue: 0,
    totalCaTheoRevenue: 0,
    passRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [telesaleFilter, setTelesaleFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [specificBranchFilter, setSpecificBranchFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");

  // Date Filter States
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [dateFrom, setDateFrom] = useState(getPresetDates("thisMonth").from);
  const [dateTo, setDateTo] = useState(getPresetDates("thisMonth").to);
  const [tempPreset, setTempPreset] = useState("thisMonth");
  const [tempFrom, setTempFrom] = useState(getPresetDates("thisMonth").from);
  const [tempTo, setTempTo] = useState(getPresetDates("thisMonth").to);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [copiedCode, setCopiedCode] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Inline Name Edit State
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [savingNameId, setSavingNameId] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadItem | null>(null);
  const [journeyLead, setJourneyLead] = useState<LeadItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    source: "META_INSTANT_FORM",
    telesale: "XUÂN",
    branch: "Thủ Đức",
    service: "Chỉnh nha",
    status: "QUALIFIED",
    revenue: 0,
    note: "",
  });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sourceFilter, telesaleFilter, branchFilter, specificBranchFilter, serviceFilter, dateFrom, dateTo]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (sourceFilter !== "ALL") params.append("sourceGroup", sourceFilter);
      if (telesaleFilter !== "ALL") params.append("telesale", telesaleFilter);
      if (branchFilter !== "ALL") params.append("branchGroup", branchFilter);
      if (specificBranchFilter !== "ALL") params.append("branch", specificBranchFilter);
      if (serviceFilter !== "ALL") params.append("serviceGroup", serviceFilter);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      params.append("page", String(currentPage));
      params.append("pageSize", String(pageSize));

      const res = await fetch(`/api/crm/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
        if (data.kpi) setKpi(data.kpi);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.totalCount || 0);
        }
      }
    } catch {}
    setLoading(false);
  }, [searchTerm, statusFilter, sourceFilter, telesaleFilter, branchFilter, specificBranchFilter, serviceFilter, dateFrom, dateTo, currentPage]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleApplyDateRange = () => {
    setDatePreset(tempPreset);
    setDateFrom(tempFrom);
    setDateTo(tempTo);
    setIsDatePickerOpen(false);
  };

  const handleSelectPreset = (presetKey: string) => {
    setTempPreset(presetKey);
    const { from, to } = getPresetDates(presetKey);
    setTempFrom(from);
    setTempTo(to);
    setDatePreset(presetKey);
    setDateFrom(from);
    setDateTo(to);
    setIsDatePickerOpen(false);
  };

  const handleSyncSheets = async (monthsToSync?: number[]) => {
    setSyncing(true);
    setSyncNotice(null);
    try {
      const res = await fetch("/api/crm/sync-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months: monthsToSync || [6, 7, 8] }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncNotice(data.message);
        fetchLeads();
      } else {
        setSyncNotice(`Lỗi: ${data.error}`);
      }
    } catch {
      setSyncNotice("Lỗi kết nối khi đồng bộ Sheet");
    }
    setSyncing(false);
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId);
    try {
      const res = await fetch("/api/crm/sheet-status-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
      }
    } catch {}
    setUpdatingId(null);
  };

  const handleSaveName = async (leadId: string) => {
    if (!editingNameValue.trim()) return;
    setSavingNameId(leadId);
    try {
      const res = await fetch("/api/crm/sheet-status-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, fullName: editingNameValue.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingNameId(null);
        fetchLeads();
      }
    } catch {}
    setSavingNameId(null);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLead) {
        const res = await fetch(`/api/crm/leads/${editingLead.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setEditingLead(null);
          fetchLeads();
        }
      } else {
        const res = await fetch("/api/crm/lead-webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setIsCreateModalOpen(false);
          fetchLeads();
        }
      }
    } catch {}
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa Khách hàng này khỏi miniCRM?")) return;
    try {
      const res = await fetch(`/api/crm/leads/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
      }
    } catch {}
  };

  const handleExportCsv = () => {
    if (!leads.length) return;
    const headers = [
      "ID",
      "Họ Tên",
      "SĐT",
      "Email",
      "Nguồn",
      "Chi Nhánh",
      "Dịch Vụ",
      "Telesale",
      "Trạng Thái",
      "Ngày Checkin",
      "Kết Quả",
      "Doanh Thu (VND)",
      "Thực Thu (VND)",
      "Sync CAPI",
      "Ngày Tạo",
    ];

    const rows = leads.map((l) => [
      l.id,
      `"${l.fullName.replace(/"/g, '""')}"`,
      `"${currentUserRole === "ADMIN" ? l.phone : l.phone ? l.phone.replace(/(\d{4})\d+(\d{3})/, "$1****$2") : ""}"`,
      `"${l.email || ""}"`,
      `"${l.sourceGroup || l.source}"`,
      `"${l.branch || ""}"`,
      `"${l.serviceGroup || l.service || ""}"`,
      `"${l.telesale || ""}"`,
      `"${l.status}"`,
      `"${l.checkinDate || ""}"`,
      `"${l.result || ""}"`,
      l.revenue || l.value || 0,
      l.actualRevenue || 0,
      l.syncedToMeta ? "Đã Sync" : "Chưa Sync",
      `"${new Date(l.createdAt).toLocaleString("vi-VN")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `miniCRM_TDS_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const appsScriptCode = `/**
 * Tâm Đức Smile (TDS) - Google Apps Script 2-Way Sync
 * Dán mã này vào Extensions > Apps Script của các Sheet Telesale
 */
function onEdit(e) {
  var range = e.range;
  var sheet = range.getSheet();
  var row = range.getRow();
  if (row < 3) return; // Bỏ qua tiêu đề (dòng 1-2)
  
  var col = range.getColumn();
  // Theo dõi các cột chính: H (8: Checkin), J (10: Doanh thu/Rớt), L (12: Ca theo), M (13: Thực thu), O (15: Cũ/Mới)
  if (col === 8 || col === 10 || col === 12 || col === 13 || col === 15) {
    var hoTen = sheet.getRange(row, 3).getValue();    // Cột C (Họ tên)
    var phone = sheet.getRange(row, 4).getValue();    // Cột D (SĐT)
    var nguon = sheet.getRange(row, 5).getValue();    // Cột E (Nguồn)
    var chiNhanh = sheet.getRange(row, 6).getValue(); // Cột F (Chi nhánh)
    var dvu = sheet.getRange(row, 7).getValue();      // Cột G (Dịch vụ)
    var colH = sheet.getRange(row, 8).getValue();     // Cột H (Ngày check-in)
    var colJ = sheet.getRange(row, 10).getValue();    // Cột J (Doanh thu / Rớt)
    var colL = sheet.getRange(row, 12).getValue();    // Cột L (Ca theo)
    var colM = sheet.getRange(row, 13).getValue();    // Cột M (Thực thu)
    var colO = sheet.getRange(row, 15).getValue();    // Cột O (Cũ/Mới)
    
    var payload = {
      name: String(hoTen),
      phone: String(phone),
      source: String(nguon),
      branch: String(chiNhanh),
      service: String(dvu),
      telesale: sheet.getName(),
      colH: String(colH),
      colJ: String(colJ),
      colL: String(colL),
      colM: String(colM),
      colO: String(colO)
    };
    
    var url = "https://luoidonnha.com/api/crm/sheet-status-update";
    
    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });
  }
}`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const [currentUserRole, setCurrentUserRole] = useState<string>("ADMIN");
  const [currentUserPermissions, setCurrentUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("luoi_active_user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u && u.role) setCurrentUserRole(u.role);
        if (u && u.permissions) {
          try { setCurrentUserPermissions(JSON.parse(u.permissions)); } catch {}
        }
      } else {
        fetch("/api/users")
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
              const active = data.data.find((u: any) => u.role === "ADMIN") || data.data[0];
              if (active?.role) setCurrentUserRole(active.role);
              if (active?.permissions) {
                try { setCurrentUserPermissions(JSON.parse(active.permissions)); } catch {}
              }
            }
          });
      }
    } catch {}
  }, []);

  const activePresetLabel = PRESET_OPTIONS.find((p) => p.key === datePreset)?.label || "Tùy chỉnh";

  return (
    <div className="w-full space-y-3 pb-8">
      {/* Header Banner - Synchronized Brand Guide Teal */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-gradient-to-r from-[#042d2a] via-[#023835] to-[#0d4f4a] text-white py-3.5 px-5 rounded-2xl shadow-md border border-[#084540]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheckIcon className="w-5 h-5 text-[#00c9b7]" />
            <h1 className="text-lg font-bold font-serif text-[#ffffff]">miniCRM — Quản Lý Khách Hàng</h1>
          </div>
          <p className="text-xs text-[#e6f4f1]/80">
            Đồng bộ quản lý khách hàng, tự động phát Meta CAPI Lead/Contact/Purchase &amp; Telegram alert
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
          {/* Real-time Date Picker Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                setTempPreset(datePreset);
                setTempFrom(dateFrom);
                setTempTo(dateTo);
                setIsDatePickerOpen(!isDatePickerOpen);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-sm transition-all border border-white/10 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#00c9b7]" />
              <span>
                {activePresetLabel}: {formatVnDate(dateFrom)} – {formatVnDate(dateTo)}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-300" />
            </button>

            {/* Date Range Modal / Popover */}
            {isDatePickerOpen && (
              <div className="absolute right-0 top-11 w-[680px] max-w-[95vw] bg-white text-stone-900 rounded-2xl shadow-2xl border border-stone-200 z-50 p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left Panel: Radio Presets */}
                <div className="md:col-span-4 border-r pr-3 space-y-1 text-xs font-mono">
                  <p className="font-bold text-stone-400 text-[10px] uppercase tracking-wider mb-1.5">Chọn nhanh kỳ</p>
                  {PRESET_OPTIONS.map((p) => (
                    <label
                      key={p.key}
                      onClick={() => handleSelectPreset(p.key)}
                      className={`flex items-center gap-2 px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                        tempPreset === p.key ? "bg-[#0d4f4a]/10 text-[#0d4f4a] font-bold" : "hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="datePreset"
                        checked={tempPreset === p.key}
                        onChange={() => {}}
                        className="accent-[#0d4f4a]"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>

                {/* Right Panel: Custom Date Inputs & Action Buttons */}
                <div className="md:col-span-8 flex flex-col justify-between space-y-3 font-mono">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 mb-0.5">Khoảng Thời Gian Lọc Dữ Liệu</h4>
                    <p className="text-[11px] text-stone-500 mb-3">
                      Tất cả KPI, tỷ lệ Đậu/Rớt và danh sách Khách hàng sẽ được tính toán lại theo khoảng thời gian này.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-600 block mb-1">Từ Ngày</label>
                        <input
                          type="date"
                          value={tempFrom}
                          onChange={(e) => {
                            setTempFrom(e.target.value);
                            setTempPreset("custom");
                          }}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-600 block mb-1">Đến Ngày</label>
                        <input
                          type="date"
                          value={tempTo}
                          onChange={(e) => {
                            setTempTo(e.target.value);
                            setTempPreset("custom");
                          }}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 bg-stone-50 rounded-xl text-[11px] text-stone-500 border border-stone-100">
                      🕒 Giờ hiển thị theo Múi giờ Việt Nam (GMT+7). Dữ liệu tự động cập nhật khi áp dụng.
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2.5 border-t">
                    <button
                      onClick={() => setIsDatePickerOpen(false)}
                      className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleApplyDateRange}
                      className="px-4 py-1.5 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                    >
                      Cập Nhật
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setFormData({
                fullName: "",
                phone: "",
                email: "",
                source: "META_INSTANT_FORM",
                telesale: "XUÂN",
                branch: "Thủ Đức",
                service: "Chỉnh nha",
                status: "QUALIFIED",
                revenue: 0,
                note: "",
              });
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00c9b7] hover:bg-[#00b0a1] text-[#023835] font-bold text-xs rounded-xl shadow transition-all cursor-pointer shrink-0 whitespace-nowrap font-mono"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Tạo Lead Mới</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap font-mono"
          >
            <DownloadIcon className="w-4 h-4 text-[#00c9b7]" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Table Selection Tabs: miniCRM vs Khách đăng ký */}
      <div className="flex border-b border-stone-200 gap-6 font-mono text-xs pt-1 px-2">
        <Link
          href="/admin/crm"
          className="pb-2.5 font-bold flex items-center gap-1.5 transition-all border-b-2 border-[#0d4f4a] text-[#0d4f4a]"
        >
          <ShieldCheckIcon size={15} />
          <span>miniCRM</span>
        </Link>
        <Link
          href="/admin/raw-leads"
          className="pb-2.5 font-medium flex items-center gap-1.5 transition-all border-b-2 border-transparent text-stone-500 hover:text-stone-900 cursor-pointer"
        >
          <FileText size={15} />
          <span>Khách đăng ký</span>
        </Link>
      </div>

      {syncNotice && (
        <div className="p-2.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{syncNotice}</span>
          <button onClick={() => setSyncNotice(null)} className="text-stone-400 hover:text-stone-600">×</button>
        </div>
      )}

      {/* Comprehensive KPI Cards Grid - Clean 1px Minimalist Palette */}
      <div className="space-y-3 font-mono">
        {/* ROW 0: 4 Funnel Stage Cards (Tổng khách, Qualify, Contact, Purchase) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: TỔNG KHÁCH */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-stone-600 mb-1">
                <UsersIcon className="w-4 h-4 text-[#0d4f4a]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">TỔNG KHÁCH</span>
              </div>
              <p className="text-2xl font-bold text-stone-900">{(kpi.totalLeads || 0).toLocaleString("vi-VN")}</p>
              <span className="text-[10px] text-stone-500">Toàn bộ dữ liệu CRM</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#0d4f4a]/10 border border-[#0d4f4a]/30 flex items-center justify-center text-[#0d4f4a] font-bold text-xs">
              ALL
            </div>
          </div>

          {/* Card 2: QUALIFY (Khách thật) */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[#0d4f4a] mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">QUALIFY (KHÁCH THẬT)</span>
              </div>
              <p className="text-2xl font-bold text-stone-900">{(kpi.qualifiedCount || 0).toLocaleString("vi-VN")}</p>
              <span className="text-[10px] text-[#0d4f4a] font-semibold">
                {kpi.totalLeads > 0 ? (((kpi.qualifiedCount || 0) / kpi.totalLeads) * 100).toFixed(1) : 0}% tổng khách
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#0d4f4a]/10 border border-[#0d4f4a]/30 flex items-center justify-center text-[#0d4f4a] font-bold text-xs">
              LEAD
            </div>
          </div>

          {/* Card 3: CONTACT (Check-in) */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[#0d4f4a] mb-1">
                <UserCheckIcon className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">CONTACT (CHECK-IN)</span>
              </div>
              <p className="text-2xl font-bold text-stone-900">{(kpi.checkinCount || 0).toLocaleString("vi-VN")}</p>
              <span className="text-[10px] text-[#0d4f4a] font-semibold">
                {kpi.qualifiedCount > 0 ? (((kpi.checkinCount || 0) / kpi.qualifiedCount) * 100).toFixed(1) : 0}% trên Qualify
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#0d4f4a]/10 border border-[#0d4f4a]/30 flex items-center justify-center text-[#0d4f4a] font-bold text-xs">
              CHK
            </div>
          </div>

          {/* Card 4: PURCHASE (Chốt đơn) */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[#0d4f4a] mb-1">
                <ShoppingBagIcon className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">PURCHASE (CHỐT ĐƠN)</span>
              </div>
              <p className="text-2xl font-bold text-stone-900">{(kpi.passCount || kpi.purchaseCount || 0).toLocaleString("vi-VN")}</p>
              <span className="text-[10px] text-[#0d4f4a] font-semibold">
                {kpi.checkinCount > 0 ? (((kpi.passCount || kpi.purchaseCount || 0) / kpi.checkinCount) * 100).toFixed(1) : 0}% trên Contact
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#0d4f4a]/10 border border-[#0d4f4a]/30 flex items-center justify-center text-[#0d4f4a] font-bold text-xs">
              BUY
            </div>
          </div>
        </div>

        {/* ROW 1: 4 Large Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Card 1: TỔNG DOANH THU */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-[#0d4f4a]/10 border border-[#0d4f4a]/30 flex items-center justify-center text-[#0d4f4a] font-bold text-xs">
                đ
              </div>
              <span className="text-xs font-bold tracking-wider text-stone-700 uppercase">TỔNG DOANH THU</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 tracking-tight mb-2">
              {(kpi.totalRevenue || 0).toLocaleString("vi-VN")}đ
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 block font-medium">Facebook</span>
                <span className="font-bold text-stone-900 block text-xs truncate">{(kpi.revenueFacebook || 0).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 block font-medium">Website / Google</span>
                <span className="font-bold text-stone-900 block text-xs truncate">{(kpi.revenueWebGg || 0).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 block font-medium">TikTok</span>
                <span className="font-bold text-stone-900 block text-xs truncate">{(kpi.revenueTikTok || 0).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 block font-medium">Hotline</span>
                <span className="font-bold text-[#0d4f4a] block text-xs truncate">{(kpi.revenueHotline || 0).toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>

          {/* Card 2: DT TÍNH MKT */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-[#0d4f4a]/10 border border-[#0d4f4a]/30 flex items-center justify-center text-[#0d4f4a] font-bold text-xs">
                đ
              </div>
              <span className="text-xs font-bold tracking-wider text-stone-700 uppercase">DT TÍNH MKT</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 tracking-tight mb-2">
              {(kpi.revenueMkt ?? kpi.totalRevenue ?? 0).toLocaleString("vi-VN")}đ
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 block font-medium">Facebook</span>
                <span className="font-bold text-stone-900 block text-xs truncate">{(kpi.revenueMktFb ?? kpi.revenueFacebook ?? 0).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 block font-medium">Website / Google</span>
                <span className="font-bold text-stone-900 block text-xs truncate">{(kpi.revenueMktWebGg ?? kpi.revenueWebGg ?? 0).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 block font-medium">TikTok</span>
                <span className="font-bold text-stone-900 block text-xs truncate">{(kpi.revenueMktTT ?? kpi.revenueTikTok ?? 0).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 block font-medium">Hotline</span>
                <span className="font-bold text-[#0d4f4a] block text-xs truncate">{(kpi.revenueMktHotline ?? kpi.revenueHotline ?? 0).toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>

          {/* Card 3: TỔNG CHECK-IN */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0d4f4a]/10 border border-[#0d4f4a]/30 flex items-center justify-center text-[#0d4f4a] shadow-xs">
                    <UserCheckIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold tracking-wider text-stone-700 uppercase">TỔNG CHECK-IN</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-2xl font-bold text-stone-900">{(kpi.checkinCount || 0).toLocaleString("vi-VN")}</span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium mb-2">
                Trên {(kpi.totalLeads || 0).toLocaleString("vi-VN")} tổng khách
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0d4f4a] uppercase">CA ĐẬU</span>
                <div className="text-right">
                  <span className="text-base font-bold text-[#0d4f4a]">{(kpi.passCount || 0).toLocaleString("vi-VN")}</span>
                  <span className="text-[10px] text-stone-500 block">{kpi.passRate || 0}% check-in</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-500 uppercase">CA RỚT</span>
                <div className="text-right">
                  <span className="text-base font-bold text-stone-700">{(kpi.failCount || 0).toLocaleString("vi-VN")}</span>
                  <span className="text-[10px] text-stone-500 block">
                    {kpi.checkinCount > 0 ? (100 - (kpi.passRate || 0)).toFixed(1) : 0}% check-in
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: CHI PHÍ QUẢNG CÁO */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0d4f4a]/10 border border-[#0d4f4a]/30 flex items-center justify-center text-[#0d4f4a] font-bold text-xs">
                    đ
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-wider text-stone-700 uppercase block">CHI PHÍ QUẢNG CÁO</span>
                    <span className="text-[10px] text-stone-400 block font-normal">
                      {kpi.adSpend && kpi.adSpend > 0 ? "Báo cáo chi phí quảng cáo" : "Chưa có dữ liệu ngân sách"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-500 block font-bold uppercase">ĐÃ CHI</span>
                  <span className="font-bold text-stone-900 text-xs truncate block">{(kpi.adSpend ?? 0).toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-500 block font-bold uppercase">NS GỒM VAT</span>
                  <span className="font-bold text-stone-900 text-xs truncate block">{(kpi.adBudgetVat ?? 0).toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <span className="font-bold text-stone-600 text-[11px]">% NS GỒM VAT / DT TÍNH MKT</span>
              <span className="font-bold text-[#0d4f4a] text-sm">{kpi.adCostToMktRatio ?? 0}%</span>
            </div>
          </div>
        </div>

        {/* ROW 2: 5 Clean 1px Bordered Cards (Thực thu & Doanh thu Mới/Cũ) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1: THỰC THU */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-[#0d4f4a] shadow-xs flex items-center justify-between transition-colors">
            <div>
              <span className="text-[11px] font-bold text-stone-600 uppercase block">THỰC THU</span>
              <p className="text-base font-bold text-stone-900">{(kpi.totalActualRevenue || 0).toLocaleString("vi-VN")}đ</p>
              <span className="text-[10px] text-[#0d4f4a] font-medium block">
                {kpi.totalRevenue > 0 ? ((kpi.totalActualRevenue / kpi.totalRevenue) * 100).toFixed(1) : 0}% tổng doanh thu
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0d4f4a]">{(kpi.actualCount || 0).toLocaleString("vi-VN")}</span>
              <span className="text-[10px] text-stone-400 font-medium uppercase block">KHÁCH</span>
            </div>
          </div>

          {/* Card 2: THỰC THU MỚI */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-[#0d4f4a] shadow-xs flex items-center justify-between transition-colors">
            <div>
              <span className="text-[11px] font-bold text-stone-600 uppercase block">THỰC THU MỚI</span>
              <p className="text-base font-bold text-stone-900">{(kpi.actualNewRevenue || 0).toLocaleString("vi-VN")}đ</p>
              <span className="text-[10px] text-[#0d4f4a] font-medium block">
                {kpi.totalActualRevenue > 0 ? (((kpi.actualNewRevenue || 0) / kpi.totalActualRevenue) * 100).toFixed(1) : 0}% thực thu
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0d4f4a]">{(kpi.actualNewCount || 0).toLocaleString("vi-VN")}</span>
              <span className="text-[10px] text-stone-400 font-medium uppercase block">KHÁCH</span>
            </div>
          </div>

          {/* Card 3: THỰC THU CŨ */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-[#0d4f4a] shadow-xs flex items-center justify-between transition-colors">
            <div>
              <span className="text-[11px] font-bold text-stone-600 uppercase block">THỰC THU CŨ</span>
              <p className="text-base font-bold text-stone-900">{(kpi.actualOldRevenue || 0).toLocaleString("vi-VN")}đ</p>
              <span className="text-[10px] text-[#0d4f4a] font-medium block">
                {kpi.totalActualRevenue > 0 ? (((kpi.actualOldRevenue || 0) / kpi.totalActualRevenue) * 100).toFixed(1) : 0}% thực thu
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0d4f4a]">{(kpi.actualOldCount || 0).toLocaleString("vi-VN")}</span>
              <span className="text-[10px] text-stone-400 font-medium uppercase block">KHÁCH</span>
            </div>
          </div>

          {/* Card 4: DT MỚI */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-[#0d4f4a] shadow-xs flex items-center justify-between transition-colors">
            <div>
              <span className="text-[11px] font-bold text-stone-600 uppercase block">DT MỚI</span>
              <p className="text-base font-bold text-stone-900">{(kpi.revenueNew || 0).toLocaleString("vi-VN")}đ</p>
              <span className="text-[10px] text-[#0d4f4a] font-medium block">
                {kpi.totalRevenue > 0 ? (((kpi.revenueNew || 0) / kpi.totalRevenue) * 100).toFixed(1) : 0}% tổng DT
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0d4f4a]">{(kpi.revenueNewCount || 0).toLocaleString("vi-VN")}</span>
              <span className="text-[10px] text-stone-400 font-medium uppercase block">KHÁCH</span>
            </div>
          </div>

          {/* Card 5: DT CŨ */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-[#0d4f4a] shadow-xs flex items-center justify-between transition-colors">
            <div>
              <span className="text-[11px] font-bold text-stone-600 uppercase block">DT CŨ</span>
              <p className="text-base font-bold text-stone-900">{(kpi.revenueOld || 0).toLocaleString("vi-VN")}đ</p>
              <span className="text-[10px] text-[#0d4f4a] font-medium block">
                {kpi.totalRevenue > 0 ? (((kpi.revenueOld || 0) / kpi.totalRevenue) * 100).toFixed(1) : 0}% tổng DT
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0d4f4a]">{(kpi.revenueOldCount || 0).toLocaleString("vi-VN")}</span>
              <span className="text-[10px] text-stone-400 font-medium uppercase block">KHÁCH</span>
            </div>
          </div>
        </div>

        {/* ROW 3: 5 Clean 1px Bordered Cards (Khách cũ PS, Ca theo, Việt Kiều, NN, Ko MKT) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1: DT KHÁCH CŨ PS */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-[#0d4f4a] shadow-xs flex items-center justify-between transition-colors">
            <div>
              <span className="text-[11px] font-bold text-stone-600 uppercase block">DT KHÁCH CŨ PS</span>
              <p className="text-base font-bold text-stone-900">{(kpi.revenueOldPS || 0).toLocaleString("vi-VN")}đ</p>
              <span className="text-[10px] text-[#0d4f4a] font-medium block">
                {kpi.totalRevenue > 0 ? (((kpi.revenueOldPS || 0) / kpi.totalRevenue) * 100).toFixed(1) : 0}% tổng DT
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0d4f4a]">{(kpi.revenueOldPSCount || 0).toLocaleString("vi-VN")}</span>
              <span className="text-[10px] text-stone-400 font-medium uppercase block">KHÁCH</span>
            </div>
          </div>

          {/* Card 2: DT CA THEO */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-[#0d4f4a] shadow-xs flex items-center justify-between transition-colors">
            <div>
              <span className="text-[11px] font-bold text-stone-600 uppercase block">DT CA THEO</span>
              <p className="text-base font-bold text-stone-900">{(kpi.totalCaTheoRevenue || 0).toLocaleString("vi-VN")}đ</p>
              <span className="text-[10px] text-stone-500 font-medium block">Chỉ số theo dõi riêng</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0d4f4a]">{(kpi.caTheoCount || 0).toLocaleString("vi-VN")}</span>
              <span className="text-[10px] text-stone-400 font-medium uppercase block">KHÁCH</span>
            </div>
          </div>

          {/* Card 3: DT VIỆT KIỀU */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-[#0d4f4a] shadow-xs flex items-center justify-between transition-colors">
            <div>
              <span className="text-[11px] font-bold text-stone-600 uppercase block">DT VIỆT KIỀU</span>
              <p className="text-base font-bold text-stone-900">{(kpi.revenueVietKieu || 0).toLocaleString("vi-VN")}đ</p>
              <span className="text-[10px] text-[#0d4f4a] font-medium block">
                {kpi.totalRevenue > 0 ? (((kpi.revenueVietKieu || 0) / kpi.totalRevenue) * 100).toFixed(1) : 0}% tổng DT
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0d4f4a]">{(kpi.vietKieuCount || 0).toLocaleString("vi-VN")}</span>
              <span className="text-[10px] text-stone-400 font-medium uppercase block">KHÁCH</span>
            </div>
          </div>

          {/* Card 4: DT NN */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-[#0d4f4a] shadow-xs flex items-center justify-between transition-colors">
            <div>
              <span className="text-[11px] font-bold text-stone-600 uppercase block">DT NN</span>
              <p className="text-base font-bold text-stone-900">{(kpi.revenueNN || 0).toLocaleString("vi-VN")}đ</p>
              <span className="text-[10px] text-[#0d4f4a] font-medium block">
                {kpi.totalRevenue > 0 ? (((kpi.revenueNN || 0) / kpi.totalRevenue) * 100).toFixed(1) : 0}% tổng DT
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0d4f4a]">{(kpi.nnCount || 0).toLocaleString("vi-VN")}</span>
              <span className="text-[10px] text-stone-400 font-medium uppercase block">KHÁCH</span>
            </div>
          </div>

          {/* Card 5: DT KO MKT */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-[#0d4f4a] shadow-xs flex items-center justify-between transition-colors">
            <div>
              <span className="text-[11px] font-bold text-stone-600 uppercase block">DT KO MKT</span>
              <p className="text-base font-bold text-stone-900">{(kpi.revenueKoMkt || 0).toLocaleString("vi-VN")}đ</p>
              <span className="text-[10px] text-[#0d4f4a] font-medium block">
                {kpi.totalRevenue > 0 ? (((kpi.revenueKoMkt || 0) / kpi.totalRevenue) * 100).toFixed(1) : 0}% tổng DT
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0d4f4a]">{(kpi.koMktCount || 0).toLocaleString("vi-VN")}</span>
              <span className="text-[10px] text-stone-400 font-medium uppercase block">KHÁCH</span>
            </div>
          </div>
        </div>
      </div>


      {/* Main Content & Multi-dimensional Filters */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm Tên, SĐT, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <FilterIcon className="w-4 h-4 text-stone-400" />
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
            >
              <option value="ALL">Tất cả Trạng thái</option>
              <option value="NEW">Mới (CAPI Complete)</option>
              <option value="QUALIFIED">QUALIFIED (CAPI Lead)</option>
              <option value="CHECKIN">CHECKIN (CAPI Contact)</option>
              <option value="PURCHASE">PURCHASE (CAPI Purchase)</option>
              <option value="JUNK">JUNK (Khách ảo / Hủy)</option>
            </select>

            {/* Source Group Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2.5 py-1.5 border rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
            >
              <option value="ALL">Tất cả Nguồn</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="WEBSITE">Website / Google</option>
              <option value="TIKTOK">TikTok</option>
              <option value="HOTLINE">Hotline</option>
              <option value="KHÁC">Nguồn Khác</option>
            </select>

            {/* Branch Group Filter (Khu vực) */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-2.5 py-1.5 border rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0d4f4a]"
            >
              <option value="ALL">Tất cả Khu vực</option>
              <option value="HCM">Khu vực HCM</option>
              <option value="BÌNH DƯƠNG">Bình Dương</option>
              <option value="ĐỒNG NAI">Đồng Nai</option>
              <option value="TP VŨNG TÀU">Vũng Tàu</option>
              <option value="MIỀN TÂY">Miền Tây</option>
              <option value="CN KHÁC">Chi Nhánh Khác</option>
            </select>

            {/* Specific Branch Filter (Chi nhánh cụ thể) */}
            <select
              value={specificBranchFilter}
              onChange={(e) => setSpecificBranchFilter(e.target.value)}
              className="px-2.5 py-1.5 border rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0d4f4a]"
            >
              <option value="ALL">Tất cả Chi nhánh</option>
              <option value="Thủ Đức">CN Thủ Đức</option>
              <option value="Gò Vấp">CN Gò Vấp</option>
              <option value="Tân Bình">CN Tân Bình</option>
              <option value="Quận 7">CN Quận 7</option>
              <option value="Quận 3">CN Quận 3</option>
              <option value="Quận 10">CN Quận 10</option>
              <option value="Bình Dương">CN Bình Dương</option>
              <option value="Đồng Nai">CN Đồng Nai</option>
              <option value="Tây Ninh">CN Tây Ninh</option>
              <option value="Cần Thơ">CN Cần Thơ</option>
              <option value="Vũng Tàu">CN Vũng Tàu</option>
              <option value="Hà Nội">CN Hà Nội</option>
              <option value="Đà Nẵng">CN Đà Nẵng</option>
              <option value="CN Khác">Chi Nhánh Khác</option>
            </select>

            {/* Service Group Filter */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-2.5 py-1.5 border rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0d4f4a]"
            >
              <option value="ALL">Tất cả Dịch vụ</option>
              <option value="CHỈNH NHA">Chỉnh nha</option>
              <option value="IMPLANT">Implant</option>
              <option value="RĂNG SỨ">Răng sứ</option>
              <option value="TỔNG QUÁT">Tổng quát</option>
            </select>

            {/* Telesale Filter */}
            <select
              value={telesaleFilter}
              onChange={(e) => setTelesaleFilter(e.target.value)}
              className="px-2.5 py-1.5 border rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0d4f4a]"
            >
              <option value="ALL">Tất cả Telesale</option>
              <option value="XUÂN">Telesale XUÂN</option>
              <option value="NHI">Telesale NHI</option>
              <option value="QUYÊN">Telesale QUYÊN</option>
              <option value="HẬU">Telesale HẬU</option>
              <option value="TRANG">Telesale TRANG</option>
              <option value="LIỂU">Telesale LIỂU</option>
              <option value="TRÂN">Telesale TRÂN</option>
              <option value="LOAN">Telesale LOAN</option>
              <option value="SINH">Telesale SINH</option>
              <option value="NHUNG">Telesale NHUNG</option>
              <option value="THẢO">Telesale THẢO</option>
              <option value="HẠ">Telesale HẠ</option>
              <option value="TRÚC">Telesale TRÚC</option>
              <option value="VI">Telesale VI</option>
              <option value="TELEVOI">Telesale TELEVOI</option>
            </select>
          </div>
        </div>

        {/* Lead Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[960px] lg:min-w-full">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 text-[11px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">Khách Hàng</th>
                <th className="py-2.5 px-2.5">SĐT</th>
                <th className="py-2.5 px-2.5">Nguồn / Chi Nhánh / DV</th>
                <th className="py-2.5 px-2">Telesale</th>
                <th className="py-2.5 px-2.5">Checkin / Kết Quả</th>
                <th className="py-2.5 px-2.5">Trạng Thái (CAPI Loop)</th>
                <th className="py-2.5 px-2.5 text-right">Doanh Thu</th>
                <th className="py-2.5 px-2 text-center">Meta CAPI</th>
                <th className="py-2.5 px-2 text-center">Ref</th>
                <th className="py-2.5 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {leads.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    {editingNameId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingNameValue}
                          onChange={(e) => setEditingNameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveName(item.id);
                            if (e.key === "Escape") setEditingNameId(null);
                          }}
                          autoFocus
                          className="px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d4f4a] font-semibold w-40"
                        />
                        <button
                          disabled={savingNameId === item.id}
                          onClick={() => handleSaveName(item.id)}
                          className="p-1 bg-[#0d4f4a] text-white rounded-md hover:bg-[#083b37] transition-colors"
                          title="Lưu tên khách"
                        >
                          <CheckIcon size={13} />
                        </button>
                        <button
                          onClick={() => setEditingNameId(null)}
                          className="p-1 bg-stone-100 text-stone-600 rounded-md hover:bg-stone-200 transition-colors"
                          title="Hủy"
                        >
                          <XCircleIcon size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="group flex items-center gap-1.5">
                        {isRealName(item.fullName) ? (
                          <p className="font-bold text-stone-900">{item.fullName}</p>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-stone-700">Khách hàng</span>
                            <span className="px-1.5 py-0.2 bg-stone-100 text-stone-600 font-extrabold text-[10px] rounded border border-stone-200">
                              {item.telesale ? item.telesale : "TDS"}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setEditingNameId(item.id);
                            setEditingNameValue(isRealName(item.fullName) ? item.fullName : "");
                          }}
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-[#0d4f4a] transition-opacity p-0.5"
                          title="Đổi tên khách hàng"
                        >
                          <EditIcon size={12} />
                        </button>
                      </div>
                    )}
                    {item.email && <p className="text-[11px] text-stone-500">{item.email}</p>}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono font-bold text-stone-800">
                    {currentUserRole === "ADMIN" || currentUserPermissions.includes("privacy:phone:unmask")
                      ? item.phone
                      : item.phone
                      ? item.phone.replace(/(\d{4})\d+(\d{3})/, "$1****$2")
                      : "—"}
                  </td>
                  <td className="py-2.5 px-2.5 space-y-1 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className={getSourceBadgeStyle(item.sourceGroup || item.source)}>
                        {item.sourceGroup || item.source}
                      </span>
                      {item.branch && (
                        <span className="inline-flex items-center gap-0.5 text-stone-600 text-[10px]">
                          <Building2Icon className="w-3 h-3 text-stone-400" />
                          {item.branch}
                        </span>
                      )}
                    </div>
                    {item.service && (
                      <div className="flex items-center gap-1 text-[#0d4f4a] text-[10px]">
                        <StethoscopeIcon className="w-3 h-3 text-[#0d4f4a]" />
                        {item.serviceGroup || item.service}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-2">
                    {item.telesale ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-stone-700 text-xs font-mono">
                        <HeadphonesIcon className="w-3 h-3 text-stone-400" />
                        {item.telesale}
                      </span>
                    ) : (
                      <span className="text-stone-400 font-mono">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2.5 space-y-1 font-mono">
                    {item.checkinDate ? (
                      <span className="px-2 py-0.5 text-stone-800 font-bold border border-stone-300 rounded-xs text-[10px] block w-fit bg-stone-50">
                        Checkin: {formatDisplayDate(item.checkinDate)}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-[#f7f4ed] text-[#5c564f] border border-[#d8d2c2] rounded-xs text-[10px] block w-fit font-medium">
                        Chưa checkin
                      </span>
                    )}
                    {item.result ? (
                      <span
                        className={`px-2 py-0.5 font-bold rounded-xs text-[10px] inline-block ${
                          item.result === "Đậu"
                            ? "bg-[#0d4f4a]/10 text-[#0d4f4a] border border-[#0d4f4a]/30"
                            : item.result === "Rớt"
                            ? "bg-[#800020]/10 text-[#800020] border border-[#800020]/30"
                            : "bg-[#f7f4ed] text-[#5c564f] border border-[#d8d2c2]"
                        }`}
                      >
                        {item.result}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-[#f7f4ed] text-[#5c564f] border border-[#d8d2c2] rounded-xs text-[10px] inline-block font-medium">
                        Chưa có
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono">
                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                      className={`w-full max-w-[210px] px-2 py-1 rounded-xs font-bold text-[11px] border focus:outline-none cursor-pointer truncate ${
                        item.status === "QUALIFIED" || item.status === "SCHEDULED" || item.status === "CHECKIN" || item.status === "PURCHASE"
                          ? "bg-white text-[#0d4f4a] border-[#0d4f4a]"
                          : "bg-stone-50 text-stone-600 border-stone-300"
                      }`}
                    >
                      <option value="NEW">Mới (CAPI Complete)</option>
                      <option value="QUALIFIED">QUALIFIED (CAPI Lead)</option>
                      <option value="CHECKIN">CHECKIN (CAPI Contact)</option>
                      <option value="PURCHASE">PURCHASE (CAPI Purchase)</option>
                      <option value="JUNK">JUNK (Khách ảo / Hủy)</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono font-bold text-stone-900">
                    {(item.revenue || item.value || 0) > 0 ? (
                      <span className="text-purple-700">
                        {(item.revenue || item.value || 0).toLocaleString("vi-VN")}đ
                      </span>
                    ) : (
                      <span className="text-stone-400">0đ</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {item.syncedToMeta ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Synced CAPI
                      </span>
                    ) : (
                      <span className="text-stone-400 text-[11px]">Chưa gửi</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono">
                    {(() => {
                      const refVal = item.ref || (item.source === "WEBSITE_FORM" || item.source === "FORM" ? "Form" : (item.sourceGroup === "WEBSITE" || item.status === "QUALIFIED" ? "App" : "Checkin"));
                      return (
                        <button
                          onClick={() => setJourneyLead(item)}
                          title="Bấm để xem Lộ trình hành trình khách hàng"
                          className="px-2 py-0.5 font-bold rounded-xs text-[10px] inline-flex items-center gap-1 bg-stone-100 text-stone-700 border border-stone-200 hover:border-[#0d4f4a] hover:text-[#0d4f4a] transition-all cursor-pointer font-mono"
                        >
                          <span>{refVal}</span>
                        </button>
                      );
                    })()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setJourneyLead(item)}
                        className="p-1.5 text-stone-500 hover:text-[#0d4f4a] hover:bg-stone-100 rounded-xs transition-colors border border-stone-200"
                        title="Xem Lộ Trình Hành Trình Khách Hàng"
                      >
                        <span className="text-xs">🗺️</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingLead(item);
                          setFormData({
                            fullName: item.fullName,
                            phone: item.phone,
                            email: item.email || "",
                            source: item.source,
                            telesale: item.telesale || "XUÂN",
                            branch: item.branch || "Thủ Đức",
                            service: item.service || "Chỉnh nha",
                            status: item.status,
                            revenue: item.revenue || item.value || 0,
                            note: item.note || "",
                          });
                        }}
                        className="p-1.5 text-stone-500 hover:text-[#0d4f4a] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Sửa Lead"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa Lead"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-stone-400">
                    Chưa có dữ liệu Khách hàng phù hợp bộ lọc trong miniCRM.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200 text-xs">
          <span className="text-stone-500 font-medium">
            Hiển thị <span className="font-bold text-stone-800">{leads.length}</span> / <span className="font-bold text-stone-800">{totalCount}</span> Khách Hàng (Trang {currentPage}/{totalPages})
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border rounded-xl font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trang trước
            </button>

            <span className="px-3 py-1.5 font-bold text-[#0d9488] bg-teal-50 border border-teal-200 rounded-xl">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border rounded-xl font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal Create/Edit Lead */}
      {(isCreateModalOpen || editingLead) && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl border space-y-4">
            <h3 className="font-bold text-lg text-stone-900">
              {editingLead ? "Chỉnh Sửa Khách Hàng" : "Tạo Khách Hàng Mới"}
            </h3>
            <form onSubmit={handleSaveLead} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Họ và Tên (*)</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Số Điện Thoại (*)</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Nguồn Lead</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  >
                    <option value="META_INSTANT_FORM">Meta Instant Form</option>
                    <option value="WEBSITE_FORM">Website Form</option>
                    <option value="MESSENGER">Facebook Messenger</option>
                    <option value="TIKTOK">TikTok Ads</option>
                    <option value="HOTLINE">Hotline</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Telesale Phụ Trách</label>
                  <select
                    value={formData.telesale}
                    onChange={(e) => setFormData({ ...formData, telesale: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  >
                    <option value="XUÂN">XUÂN</option>
                    <option value="NHI">NHI</option>
                    <option value="QUYÊN">QUYÊN</option>
                    <option value="HẬU">HẬU</option>
                    <option value="TRANG">TRANG</option>
                    <option value="LIỂU">LIỂU</option>
                    <option value="TRÂN">TRÂN</option>
                    <option value="LOAN">LOAN</option>
                    <option value="SINH">SINH</option>
                    <option value="NHUNG">NHUNG</option>
                    <option value="THẢO">THẢO</option>
                    <option value="HẠ">HẠ</option>
                    <option value="TRÚC">TRÚC</option>
                    <option value="VI">VI</option>
                    <option value="TELEVOI">TELEVOI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Chi Nhánh</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Dịch Vụ</label>
                  <input
                    type="text"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Trạng Thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d4f4a]"
                  >
                    <option value="NEW">Mới (CAPI Complete)</option>
                    <option value="QUALIFIED">QUALIFIED (CAPI Lead)</option>
                    <option value="CHECKIN">CHECKIN (CAPI Contact)</option>
                    <option value="PURCHASE">PURCHASE (CAPI Purchase)</option>
                    <option value="JUNK">JUNK (Khách ảo / Hủy)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Doanh Thu (VND)</label>
                  <input
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Ghi Chú</label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingLead(null);
                  }}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0d9488] text-white font-bold rounded-xl hover:bg-[#0f766e] transition-colors"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Journey Roadmap Modal */}
      {journeyLead && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 border border-stone-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-[#0d4f4a]/10 text-[#0d4f4a] border border-[#0d4f4a]/30 rounded-lg font-bold text-xs font-mono">
                    🗺️ Lộ Trình Khách Hàng (Customer Roadmap)
                  </span>
                  <span className="px-2.5 py-0.5 font-bold rounded-xs text-[11px] bg-stone-100 text-stone-700 border border-stone-200 font-mono">
                    Nguồn Gốc: {journeyLead.ref === "Form" || journeyLead.sourceGroup === "WEBSITE" ? "Form" : (journeyLead.ref || "App")}
                  </span>
                </div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  {isRealName(journeyLead.fullName) ? journeyLead.fullName : `Khách hàng [${journeyLead.telesale || "TDS"}]`}
                  <span className="text-sm font-mono font-bold text-stone-500">
                    ({currentUserRole === "ADMIN" ? journeyLead.phone : journeyLead.phone?.replace(/(\d{4})\d+(\d{3})/, "$1****$2")})
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setJourneyLead(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Roadmap Steps Flow */}
            <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-stone-200">
              {/* Step 1: Form / First Contact */}
              <div className="relative pl-10">
                <div className={`absolute left-0 top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs z-10 ${
                  journeyLead.ref === "Form" || journeyLead.sourceGroup === "WEBSITE"
                    ? "bg-amber-500 border-amber-600 text-white shadow-sm"
                    : "bg-stone-100 border-stone-300 text-stone-500"
                }`}>
                  1
                </div>
                <div className="bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span>BƯỚC 1: ĐĂNG KÝ FORM (FIRST CONTACT)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                      {journeyLead.ref === "Form" || journeyLead.sourceGroup === "WEBSITE" ? "Đăng ký Form Website / Ads" : "Mess / Call Direct"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Nguồn Marketing: <strong>{journeyLead.sourceGroup || journeyLead.source}</strong> (Mã: {journeyLead.source}) {journeyLead.email ? `(${journeyLead.email})` : ""}
                  </p>
                </div>
              </div>

              {/* Step 2: App / Schedule Booking (DATHEN) */}
              <div className="relative pl-10">
                <div className={`absolute left-0 top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs z-10 ${
                  journeyLead.status === "QUALIFIED" || journeyLead.ref === "App" || journeyLead.telesale
                    ? "bg-[#0d9488] border-teal-700 text-white shadow-sm"
                    : "bg-stone-100 border-stone-300 text-stone-500"
                }`}>
                  2
                </div>
                <div className="bg-teal-50/60 border border-teal-200/80 p-3.5 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-teal-900 text-xs">
                      <CalendarDays className="w-4 h-4 text-teal-600" />
                      <span>BƯỚC 2: LỊCH ĐẶT HẸN (APP / SHEET DATHEN)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full">
                      {journeyLead.status === "QUALIFIED" || journeyLead.ref === "App" ? "QUALIFIED - Đã chốt hẹn" : "Chưa cập nhật hẹn"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-xs text-stone-700">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Telesale:</span>
                      <span className="font-bold">{journeyLead.telesale || "Chưa rõ"}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Chi Nhánh:</span>
                      <span className="font-bold">{journeyLead.branch || "Thủ Đức"}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Dịch Vụ:</span>
                      <span className="font-bold">{journeyLead.service || "Khám tư vấn"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Checkin at Branch */}
              <div className="relative pl-10">
                <div className={`absolute left-0 top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs z-10 ${
                  journeyLead.checkinDate || journeyLead.status === "CHECKIN" || journeyLead.status === "PURCHASE"
                    ? "bg-indigo-600 border-indigo-700 text-white shadow-sm"
                    : "bg-stone-100 border-stone-300 text-stone-500"
                }`}>
                  3
                </div>
                <div className="bg-indigo-50/60 border border-indigo-200/80 p-3.5 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-indigo-900 text-xs">
                      <Building2Icon className="w-4 h-4 text-indigo-600" />
                      <span>BƯỚC 3: CHECKIN TẠI PHÒNG KHÁM (BRANCH VISIT)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                      {journeyLead.checkinDate ? `Checkin: ${formatDisplayDate(journeyLead.checkinDate)}` : "Chưa tới khám"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-stone-700">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Dịch Vụ Chốt Thực Tế:</span>
                      <span className="font-bold text-indigo-900">
                        {journeyLead.serviceGroup || journeyLead.service || "Chưa rõ"} {journeyLead.service ? `(${journeyLead.service})` : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Kết Quả Tư Vấn Chi Nhánh:</span>
                      <strong className={journeyLead.result === "Đậu" || (journeyLead.revenue || 0) > 0 ? "text-emerald-700 font-extrabold" : journeyLead.result === "Rớt" ? "text-rose-700 font-extrabold" : "text-stone-700 font-bold"}>
                        {journeyLead.result === "Đậu" ? "ĐẬU (Chốt Đơn)" : (journeyLead.revenue || 0) > 0 ? `Chốt Đơn (${(journeyLead.revenue || 0).toLocaleString("vi-VN")}đ)` : (journeyLead.result || "Chăm sóc tiếp")}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Purchase & Meta CAPI Loop */}
              <div className="relative pl-10">
                <div className={`absolute left-0 top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs z-10 ${
                  journeyLead.status === "PURCHASE" || (journeyLead.revenue || 0) > 0
                    ? "bg-purple-600 border-purple-700 text-white shadow-sm"
                    : "bg-stone-100 border-stone-300 text-stone-500"
                }`}>
                  4
                </div>
                <div className="bg-purple-50/60 border border-purple-200/80 p-3.5 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-purple-900 text-xs">
                      <DollarSignIcon className="w-4 h-4 text-purple-600" />
                      <span>BƯỚC 4: CHỐT ĐƠN & VÒNG LẶP META CAPI</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                      {journeyLead.syncedToMeta ? "✅ Synced CAPI Complete" : "Chưa bắn CAPI Purchase"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-stone-600 font-medium">Doanh thu phát sinh:</span>
                    <span className="font-black text-purple-700 text-sm">
                      {(journeyLead.revenue || journeyLead.value || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => setJourneyLead(null)}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Đóng Lộ Trình
              </button>
              <button
                onClick={() => {
                  const current = journeyLead;
                  setJourneyLead(null);
                  setEditingLead(current);
                  setFormData({
                    fullName: current.fullName,
                    phone: current.phone,
                    email: current.email || "",
                    source: current.source,
                    telesale: current.telesale || "XUÂN",
                    branch: current.branch || "Thủ Đức",
                    service: current.service || "Chỉnh nha",
                    status: current.status,
                    revenue: current.revenue || current.value || 0,
                    note: current.note || "",
                  });
                }}
                className="px-5 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <EditIcon className="w-4 h-4" />
                Chỉnh Sửa Khách Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Apps Script Code Helper Box */}
      <div className="bg-stone-900 text-stone-200 p-6 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheetIcon className="w-5 h-5 text-[#2dd4bf]" />
            <h2 className="font-bold text-sm text-white">
              Google Apps Script Sync Code (Chuẩn Tâm Đức Smile - Dán vào Google Sheet)
            </h2>
          </div>
          <button
            onClick={copyAppsScript}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            {copiedCode ? <CheckIcon className="w-4 h-4 text-emerald-300" /> : <CopyIcon className="w-4 h-4" />}
            <span>{copiedCode ? "Đã Copy Mã" : "Copy Google Apps Script"}</span>
          </button>
        </div>
        <p className="text-xs text-stone-400">
          * Hướng dẫn: Mở Sheet Telesale ➔ Vào <strong>Extensions ➔ Apps Script</strong> ➔ Dán mã này vào và bấm Lưu. Khi Telesale nhập Cột H (Checkin), Cột J (Doanh thu/Rớt), Cột L (Ca theo), Cột M (Thực thu) hoặc Cột O (Khách cũ/mới), dữ liệu sẽ tự động đẩy về miniCRM và kích hoạt Meta CAPI!
        </p>
        <pre className="p-4 bg-stone-950 rounded-xl overflow-x-auto font-mono text-[11px] text-teal-300 border border-stone-800 leading-relaxed">
          {appsScriptCode}
        </pre>
      </div>
    </div>
  );
}

export default function CRMAdminPageWrapper() {
  return (
    <CRMErrorBoundary fallbackTitle="Đã cô lập lỗi giao diện miniCRM (Lưới CMS vẫn hoạt động bình thường)">
      <MiniCrmAdminPage />
    </CRMErrorBoundary>
  );
}
