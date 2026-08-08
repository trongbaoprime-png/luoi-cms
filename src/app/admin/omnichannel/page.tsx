"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  MapPin,
  Stethoscope,
  Target,
  RefreshCw,
  Sparkles,
  Bot,
  Users,
  PieChart,
  BarChart3,
  TrendingUp,
  Clock,
  Send,
  CheckCircle2,
  Copy,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";

interface BranchStat {
  branch: string;
  count: number;
  percentage: number;
}

interface ServiceStat {
  service: string;
  count: number;
  percentage: number;
}

interface IntentStat {
  intent: string;
  count: number;
}

interface ConversationItem {
  id: string;
  customerName: string | null;
  phone: string | null;
  detectedBranch: string | null;
  detectedService: string | null;
  subService: string | null;
  customerIntent: string | null;
  branchStatus: string | null;
  lastMessageAt: string;
  fanpage: { pageName: string } | null;
}

export default function OmnichannelAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [totalConversations, setTotalConversations] = useState(0);
  const [branchStats, setBranchStats] = useState<BranchStat[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [intentStats, setIntentStats] = useState<IntentStat[]>([]);
  const [recentInsights, setRecentInsights] = useState<ConversationItem[]>([]);
  
  // Interactive Filters & Modals
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("ALL");
  const [copilotModalOpen, setCopilotModalOpen] = useState(false);
  const [activeCopilotData, setActiveCopilotData] = useState<any>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/omnichannel/analytics");
      const data = await res.json();

      if (data.success && data.data) {
        setTotalConversations(data.data.totalConversations);
        setBranchStats(data.data.branchStats);
        setServiceStats(data.data.serviceStats);
        setIntentStats(data.data.intentStats);
        setRecentInsights(data.data.recentInsights);
      }
    } catch {
      console.error("Lỗi nạp báo cáo Omnichannel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleOpenCopilot = async (conversationId: string) => {
    setCopilotLoading(true);
    setCopilotModalOpen(true);
    setCopied(false);
    try {
      const res = await fetch("/api/admin/omnichannel/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveCopilotData(data.data);
      }
    } catch {
      console.error("Lỗi gọi AI Copilot");
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleAssignToCrm = async (item: ConversationItem) => {
    setAssigningId(item.id);
    try {
      const res = await fetch("/api/admin/omnichannel/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: item.id,
          targetBranch: item.detectedBranch,
          telesaleName: "XUÂN",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        setTimeout(() => setActionNotice(null), 5000);
      }
    } catch {
      alert("Lỗi chuyển đổi dữ liệu sang CRM");
    } finally {
      setAssigningId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const filteredInsights = selectedBranchFilter === "ALL"
    ? recentInsights
    : recentInsights.filter((item) => item.detectedBranch === selectedBranchFilter);

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12">
      {/* Header Banner - Synchronized Brand Guide Teal */}
      <div className="bg-gradient-to-r from-[#042d2a] via-[#023835] to-[#0d4f4a] text-white p-6 rounded-2xl shadow-xl border border-[#084540]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif flex items-center gap-3">
              <Bot className="text-[#00c9b7]" size={28} />
              <span>Omnichannel AI Agent — Báo Cáo Nhu Cầu Chi Nhánh</span>
            </h1>
            <p className="text-sm text-[#e6f4f1]/80 mt-1">
              Trợ lý AI tự động bóc tách tin nhắn khách hàng từ 60 Fanpages, xác định chuẩn 100% Chi nhánh quan tâm &amp; Dịch vụ mong muốn!
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00c9b7] hover:bg-[#0d9488] text-[#023835] font-bold text-sm shadow-md transition-all cursor-pointer shrink-0"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span>Làm Mới Báo Cáo</span>
          </button>
        </div>

        {/* Counter Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-[#084540]">
          <div className="bg-[#084540]/60 p-3.5 rounded-xl border border-[#00c9b7]/20 font-mono">
            <div className="text-xs text-[#e6f4f1]/80 font-medium">Tổng Hội Thoại Đã Phân Tích</div>
            <div className="text-2xl font-bold text-[#00c9b7] mt-1">{totalConversations.toLocaleString()}</div>
          </div>
          <div className="bg-[#084540]/60 p-3.5 rounded-xl border border-[#00c9b7]/20 font-mono">
            <div className="text-xs text-[#e6f4f1]/80 font-medium">Lọc Ngữ Cảnh AI</div>
            <div className="text-xs font-bold text-[#00c9b7] mt-2 flex items-center gap-1">
              <Sparkles size={14} /> 100% Chỉ đọc tin nhắn Khách
            </div>
          </div>
          <div className="bg-[#084540]/60 p-3.5 rounded-xl border border-[#00c9b7]/20 font-mono">
            <div className="text-xs text-[#e6f4f1]/80 font-medium">Phân Luồng Chi Nhánh</div>
            <div className="text-xs font-semibold text-[#00c9b7] mt-2">
              Bật 1-Click chia tệp cho Telesale
            </div>
          </div>
          <div className="bg-[#084540]/60 p-3.5 rounded-xl border border-[#00c9b7]/20 font-mono">
            <div className="text-xs text-[#e6f4f1]/80 font-medium">Bảo Mật Dữ Liệu</div>
            <div className="text-xs font-semibold text-emerald-300 mt-2">
              SSL / TLS Encrypted
            </div>
          </div>
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
            <div className="text-xs text-slate-400 font-medium">Database Độc Lập</div>
            <div className="text-xs font-bold text-sky-400 mt-2">
              omnichannel.db (Không lo phình CMS)
            </div>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600" size={18} />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-stone-400 hover:text-stone-600">×</button>
        </div>
      )}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Share Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <MapPin className="text-teal-600" size={20} />
              <span>Nhu Cầu Theo Chi Nhánh</span>
            </h2>
            <span className="text-xs text-stone-400 font-medium">AI Classification</span>
          </div>

          <div className="space-y-3">
            {branchStats.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">Đang chờ tin nhắn từ Webhook...</div>
            ) : (
              branchStats.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedBranchFilter(item.branch)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${selectedBranchFilter === item.branch ? "bg-teal-50 border-teal-500" : "border-transparent hover:bg-stone-50"}`}
                >
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span>📍 {item.branch}</span>
                    <span className="text-teal-700">{item.count} khách ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Service Interest Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Stethoscope className="text-indigo-600" size={20} />
              <span>Dịch Vụ Khách Quan Tâm</span>
            </h2>
            <span className="text-xs text-stone-400 font-medium">NLP Extraction</span>
          </div>

          <div className="space-y-3">
            {serviceStats.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">Đang chờ tin nhắn từ Webhook...</div>
            ) : (
              serviceStats.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span>🦷 {item.service}</span>
                    <span className="text-indigo-700">{item.count} khách ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Intent Breakdown Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Target className="text-amber-600" size={20} />
              <span>Phân Loại Ý Định Khách Hàng</span>
            </h2>
            <span className="text-xs text-stone-400 font-medium">Intent Classifier</span>
          </div>

          <div className="space-y-2.5">
            {intentStats.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">Đang chờ tin nhắn từ Webhook...</div>
            ) : (
              intentStats.map((item, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">🎯 {item.intent}</span>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-lg">
                    {item.count} lượt
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Branch Selector Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 md:pb-0">
          <span className="text-xs font-bold text-stone-500 shrink-0 flex items-center gap-1">
            <Filter size={14} /> Lọc Chi Nhánh:
          </span>
          <button
            onClick={() => setSelectedBranchFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${selectedBranchFilter === "ALL" ? "bg-slate-900 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
          >
            Tất Cả ({recentInsights.length})
          </button>
          {branchStats.map((b, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedBranchFilter(b.branch)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${selectedBranchFilter === b.branch ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
            >
              📍 {b.branch} ({b.count})
            </button>
          ))}
        </div>
      </div>

      {/* Recent AI Realtime Stream Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="text-amber-500" size={16} />
            <span>Luồng Phân Tích Real-time Mới Nhất Dành Cho Telesale</span>
          </h3>
          <span className="text-xs text-stone-500">Tự động bóc tách 24/7 từ Webhook</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50/50 border-b border-stone-200 text-xs font-bold uppercase text-stone-600 tracking-wider">
              <tr>
                <th className="p-3.5">Thời Gian</th>
                <th className="p-3.5">Khách Hàng</th>
                <th className="p-3.5">Fanpage Nguồn</th>
                <th className="p-3.5">Chi Nhánh AI Phát Hiện</th>
                <th className="p-3.5">Dịch Vụ AI Bóc Tách</th>
                <th className="p-3.5">Thao Tác 1-Click</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredInsights.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    Chưa có tin nhắn nào thuộc bộ lọc chi nhánh này. Dữ liệu sẽ tự động chảy về đây!
                  </td>
                </tr>
              ) : (
                filteredInsights.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 text-xs text-stone-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-stone-400" />
                        <span>{formatDate(item.lastMessageAt)}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {item.customerName || "Khách Ẩn Danh"}
                      {item.phone && <div className="text-xs font-mono text-emerald-600 font-bold">{item.phone}</div>}
                    </td>
                    <td className="p-3.5 text-xs text-stone-500">
                      {item.fanpage?.pageName || "Fanpage"}
                    </td>
                    <td className="p-3.5">
                      {item.detectedBranch ? (
                        <span className="px-2.5 py-1 bg-teal-50 text-teal-800 font-extrabold rounded-lg text-xs border border-teal-200/60 inline-flex items-center gap-1">
                          <MapPin size={12} /> {item.detectedBranch}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {item.detectedService ? (
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 font-bold rounded-lg text-xs border border-indigo-200/60 inline-flex items-center gap-1">
                          <Stethoscope size={12} /> {item.detectedService}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-3.5 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenCopilot(item.id)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Sparkles size={14} /> AI Copilot
                      </button>
                      <button
                        disabled={assigningId === item.id}
                        onClick={() => handleAssignToCrm(item)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <ArrowRight size={14} /> {assigningId === item.id ? "Đang chuyển..." : "Đẩy Sang CRM"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Copilot Modal */}
      {copilotModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} />
                <span>AI Copilot Smart Reply — Gợi Ý Tin Nhắn Chốt Sale</span>
              </h3>
              <button
                onClick={() => setCopilotModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {copilotLoading ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <RefreshCw className="animate-spin inline-block text-amber-500" size={24} />
                <p className="text-xs font-semibold">AI đang đọc hiểu lịch sử chat và soạn tin nhắn...</p>
              </div>
            ) : activeCopilotData ? (
              <div className="space-y-4">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-xs">
                  <div><span className="font-bold text-stone-600">Chi nhánh phát hiện:</span> <span className="font-extrabold text-teal-700">📍 {activeCopilotData.branch}</span></div>
                  <div><span className="font-bold text-stone-600">Dịch vụ quan tâm:</span> <span className="font-bold text-indigo-700">🦷 {activeCopilotData.service}</span></div>
                </div>

                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-stone-800 text-xs font-medium leading-relaxed relative">
                  <div className="text-[10px] font-bold uppercase text-amber-700 mb-1">Mẫu tin nhắn cá nhân hóa AI soạn sẵn:</div>
                  "{activeCopilotData.suggestedReply}"
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeCopilotData.suggestedReply);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 3000);
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="text-emerald-400" size={16} /> : <Copy size={16} />}
                  <span>{copied ? "Đã Sao Chép Tin Nhắn!" : "Sao Chép Mẫu Tin Nhắn AI Dán Sang Pancake"}</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
