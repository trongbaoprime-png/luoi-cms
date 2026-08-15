"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Search,
  TrendingDown,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldAlert,
  Zap,
  Filter,
  DollarSign,
} from "lucide-react";
import { diagnoseAllCampaigns, CampaignStatsInput, CampaignDiagnosisResult } from "@/lib/campaign-diagnosis";

interface MetaDiagnosisSubtabProps {
  campaigns: any[];
}

export default function MetaDiagnosisSubtab({ campaigns }: MetaDiagnosisSubtabProps) {
  const [selectedHealth, setSelectedHealth] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  const diagnosisInput: CampaignStatsInput[] = useMemo(() => {
    return campaigns.map((c) => ({
      campaignId: c.campaign_id || c.campaignId || "",
      campaignName: c.campaign_name || c.campaignName || "Campaign",
      service: c.service,
      branch: c.branch,
      spend: c.spend || 0,
      reach: c.reach || 0,
      impressions: c.impressions || 0,
      frequency: c.frequency || 1,
      cpm: c.cpm || 0,
      ctr: c.ctr || 0,
      cpc: c.cpc || 0,
      clicks: c.clicks || 0,
      messagesNew: c.messagesNew || 0,
      leads: c.leads || 0,
    }));
  }, [campaigns]);

  const diagnosis = useMemo(() => {
    return diagnoseAllCampaigns(diagnosisInput);
  }, [diagnosisInput]);

  const filteredResults = useMemo(() => {
    return diagnosis.results.filter((r) => {
      if (selectedHealth !== "ALL" && r.overallHealth !== selectedHealth) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = r.campaignName.toLowerCase().includes(q);
        const matchService = r.service.toLowerCase().includes(q);
        const matchBranch = r.branch.toLowerCase().includes(q);
        if (!matchName && !matchService && !matchBranch) return false;
      }
      return true;
    });
  }, [diagnosis, selectedHealth, searchQuery]);

  return (
    <div className="space-y-5 font-sans">
      {/* Top KPI Cards — Chẩn đoán sức khỏe tổng thể */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Campaigns */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold font-mono">
            <span>TỔNG CAMPAIGN</span>
            <Activity size={16} className="text-stone-400" />
          </div>
          <div className="text-2xl font-black text-stone-900 mt-2 font-mono">
            {diagnosis.summary.total}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Đang hoạt động trong kỳ</p>
        </div>

        {/* Healthy */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold font-mono">
            <span>KHỎE MẠNH (HEALTHY)</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {diagnosis.summary.healthy}
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1">Chỉ số ổn định, có thể scale</p>
        </div>

        {/* At Risk */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold font-mono">
            <span>CẦN TỐI ƯU (AT RISK)</span>
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2 font-mono">
            {diagnosis.summary.atRisk}
          </div>
          <p className="text-[11px] text-amber-700/80 mt-1">Có 1-2 chỉ số bất thường</p>
        </div>

        {/* Critical */}
        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-800 text-xs font-bold font-mono">
            <span>BÁO ĐỘNG (CRITICAL)</span>
            <AlertOctagon size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2 font-mono">
            {diagnosis.summary.critical}
          </div>
          <p className="text-[11px] text-rose-700/80 mt-1">Thất thoát hiệu quả nghiêm trọng</p>
        </div>

        {/* Estimated Wasted Spend */}
        <div className="bg-stone-900 text-white p-4 rounded-2xl shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-stone-400 text-xs font-bold font-mono">
            <span>LÃNG PHÍ ƯỚC TÍNH</span>
            <TrendingDown size={16} className="text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400 mt-2 font-mono">
            {diagnosis.summary.wastedSpendEstimated.toLocaleString()}đ
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Do camp lỗi / bão hòa tệp</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedHealth("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
              selectedHealth === "ALL"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            Tất cả ({diagnosis.results.length})
          </button>
          <button
            onClick={() => setSelectedHealth("CRITICAL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
              selectedHealth === "CRITICAL"
                ? "bg-rose-700 text-white"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            🔴 Báo động ({diagnosis.summary.critical})
          </button>
          <button
            onClick={() => setSelectedHealth("AT_RISK")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
              selectedHealth === "AT_RISK"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            🟡 Cần tối ưu ({diagnosis.summary.atRisk})
          </button>
          <button
            onClick={() => setSelectedHealth("HEALTHY")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
              selectedHealth === "HEALTHY"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            🟢 Khỏe mạnh ({diagnosis.summary.healthy})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tên camp, dịch vụ, chi nhánh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
          />
        </div>
      </div>

      {/* Diagnosis Cards List */}
      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
            Không tìm thấy chiến dịch nào phù hợp với bộ lọc.
          </div>
        ) : (
          filteredResults.map((item) => {
            const isExpanded = expandedCampaignId === item.campaignId;
            return (
              <div
                key={item.campaignId}
                className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${
                  item.overallHealth === "CRITICAL"
                    ? "border-rose-300 hover:border-rose-400"
                    : item.overallHealth === "AT_RISK"
                    ? "border-amber-300 hover:border-amber-400"
                    : "border-stone-200 hover:border-emerald-300"
                }`}
              >
                {/* Main Card Header */}
                <div
                  onClick={() => setExpandedCampaignId(isExpanded ? null : item.campaignId)}
                  className="p-4 cursor-pointer hover:bg-stone-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Health Status Icon & Score */}
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-mono font-black ${
                        item.overallHealth === "CRITICAL"
                          ? "bg-rose-100 text-rose-700 border border-rose-300"
                          : item.overallHealth === "AT_RISK"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      <span className="text-sm">{item.healthScore}</span>
                      <span className="text-[9px] uppercase font-bold">điểm</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase ${
                            item.overallHealth === "CRITICAL"
                              ? "bg-rose-600 text-white"
                              : item.overallHealth === "AT_RISK"
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {item.overallHealth === "CRITICAL"
                            ? "🔴 Báo Động"
                            : item.overallHealth === "AT_RISK"
                            ? "🟡 Cần Tối Ưu"
                            : "🟢 Khỏe Mạnh"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700 font-mono">
                          {item.service}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700 font-mono">
                          {item.branch}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-stone-900 mt-1 font-mono">
                        {item.campaignName}
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {item.keyTakeaway}
                      </p>
                    </div>
                  </div>

                  {/* Summary Metrics Pill */}
                  <div className="flex items-center gap-3 shrink-0 font-mono text-xs text-stone-600">
                    <div className="text-right">
                      <div className="text-[11px] text-stone-400">Chi tiêu / CPTN</div>
                      <div className="font-bold text-stone-900">
                        {Math.round(item.spend).toLocaleString()}đ / {item.cptn.toLocaleString()}đ
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-stone-400">Tin nhắn / Lead</div>
                      <div className="font-bold text-[#0d4f4a]">
                        {item.messagesNew} TN / {item.leads} Lead
                      </div>
                    </div>
                    <span className="text-stone-400 font-mono text-xs">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded Details & Diagnosis Breakdown */}
                {isExpanded && (
                  <div className="p-4 bg-stone-50/70 border-t border-stone-200 space-y-4">
                    {/* Funnel Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-400 block">Frequency</span>
                        <span className={`font-bold ${item.frequency > 3.5 ? "text-rose-600" : "text-stone-900"}`}>
                          {item.frequency}x
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-400 block">CPM</span>
                        <span className="font-bold text-stone-900">
                          {Math.round(item.cpm).toLocaleString()}đ
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-400 block">CTR</span>
                        <span className={`font-bold ${item.ctr < 0.8 ? "text-rose-600" : "text-emerald-700"}`}>
                          {item.ctr.toFixed(2)}%
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-400 block">CPC</span>
                        <span className="font-bold text-stone-900">
                          {Math.round(item.cpc).toLocaleString()}đ
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-400 block">Clicks</span>
                        <span className="font-bold text-stone-900">{item.clicks}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-400 block">CPL</span>
                        <span className="font-bold text-[#0d4f4a]">
                          {item.cpl > 0 ? `${item.cpl.toLocaleString()}đ` : "Chưa có Lead"}
                        </span>
                      </div>
                    </div>

                    {/* Detected Issues */}
                    {item.issues.length > 0 ? (
                      <div className="space-y-2.5">
                        <div className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <ShieldAlert size={14} className="text-rose-600" />
                          <span>Chi Tiết Bệnh Lý &amp; Hướng Xử Lý ({item.issues.length})</span>
                        </div>

                        {item.issues.map((iss, i) => (
                          <div
                            key={i}
                            className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded font-mono font-bold bg-stone-900 text-white text-[10px]">
                                  {iss.code}
                                </span>
                                <span className="font-bold text-stone-900">{iss.name}</span>
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                                  iss.severity === "CRITICAL"
                                    ? "bg-rose-100 text-rose-700"
                                    : iss.severity === "HIGH"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {iss.severity}
                              </span>
                            </div>

                            {/* Symptoms list */}
                            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                              {iss.symptoms.map((sym, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md border border-stone-200"
                                >
                                  <strong>{sym.metric}:</strong> {sym.value} ({sym.note})
                                </span>
                              ))}
                            </div>

                            {/* Root Cause */}
                            <div className="text-stone-600 text-xs">
                              <strong>Nguyên nhân gốc rễ:</strong> {iss.rootCause}
                            </div>

                            {/* Remedy Action */}
                            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-start gap-2">
                              <Zap size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                              <div>
                                <strong>Hành động đề xuất:</strong> {iss.recommendation}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>Không phát hiện điểm bất thường. Chiến dịch đang vận hành tối ưu.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
