"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  Layers,
  Terminal,
  Search,
  Filter,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  ChevronRight,
  Server,
  FileText,
  Video,
  Users,
  Share2,
} from "lucide-react";
import { SyncJob, PreflightReport } from "@/lib/sync-engine/sync-queue";

interface ResourceOption {
  id: string;
  name: string;
  countLabel: string;
  excluded: boolean;
  statusText: string;
}

export default function SyncEnginePage() {
  const [selectedModule, setSelectedModule] = useState<string>("OMNICHANNEL");
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false);
  const [triggeringJob, setTriggeringJob] = useState<boolean>(false);

  // Pre-flight State
  const [isPreflightModalOpen, setIsPreflightModalOpen] = useState(false);
  const [preflightData, setPreflightData] = useState<PreflightReport | null>(null);
  const [scanningPreflight, setScanningPreflight] = useState(false);

  // Filter & Search Log State
  const [logSearch, setLogSearch] = useState<string>("");
  const [logLevelFilter, setLogLevelFilter] = useState<string>("ALL");

  // Selected Resources State
  const [resources, setResources] = useState<Record<string, ResourceOption[]>>({
    OMNICHANNEL: [
      { id: "pancake_vip9", name: "9 Fanpages Chạy Ads Chính (Ưu tiên)", countLabel: "484755, 101372...", excluded: false, statusText: "sẽ đồng bộ" },
      { id: "pancake_satellites", name: "59 Fanpages Vệ Tinh & Chi Nhánh", countLabel: "59 trang kết nối", excluded: false, statusText: "sẽ đồng bộ" },
      { id: "staff_locked", name: "Hội thoại Nhân viên đang chốt", countLabel: "142 cuộc chat", excluded: true, statusText: "excluded — Bảo vệ dữ liệu nhân viên" },
      { id: "manual_branch", name: "Chi nhánh Khách đã chọn thủ công", countLabel: "Đã chốt lịch", excluded: true, statusText: "excluded — Không ghi đè" },
    ],
    META_ADS: [
      { id: "meta_11_accounts", name: "11 Tài khoản Quảng cáo Tâm Đức", countLabel: "11 Ad Accounts", excluded: false, statusText: "sẽ đồng bộ" },
      { id: "meta_advideos", name: "Video Ads MP4 CDN & Âm thanh", countLabel: "52 video thực tế", excluded: false, statusText: "sẽ đồng bộ" },
      { id: "meta_creatives", name: "918 Mẫu Creative & Post Facebook", countLabel: "918 creatives", excluded: false, statusText: "sẽ đồng bộ" },
      { id: "meta_daily_insights", name: "Số liệu Thống kê Ngày (Spend, CPTN)", countLabel: "2.046 records", excluded: false, statusText: "sẽ đồng bộ" },
    ],
    CRM_LEADS: [
      { id: "crm_leads_new", name: "Khách hàng Tiềm năng mới có SĐT", countLabel: "Hôm nay & Hôm qua", excluded: false, statusText: "sẽ đồng bộ" },
      { id: "crm_doctor_notes", name: "Ghi chú & Hồ sơ Bác sĩ đã nhập", countLabel: "Protected fields", excluded: true, statusText: "excluded — Giữ nguyên hồ sơ" },
    ],
    SEO_INDEXING: [
      { id: "seo_articles", name: "Bài viết Kiến thức Nha khoa mới", countLabel: "65 bài viết", excluded: false, statusText: "sẽ đồng bộ" },
      { id: "seo_indexnow", name: "IndexNow Protocol (Bing & Yandex)", countLabel: "Realtime ping", excluded: false, statusText: "sẽ đồng bộ" },
    ],
  });

  // Content Scope Rules Checkboxes
  const [contentRules, setContentRules] = useState({
    conversations: true,
    branchDetection: true,
    customerInfo: true,
    videoMedia: true,
    dailyStats: true,
    seoMeta: true,
  });

  const [deltaOnly, setDeltaOnly] = useState(true);
  const [excludeConflicts, setExcludeConflicts] = useState(true);

  // Fetch Jobs
  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/admin/sync-engine/jobs");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setJobs(json.data);
        if (!selectedJobId && json.data.length > 0) {
          setSelectedJobId(json.data[0].id);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchJobs();
    const timer = setInterval(fetchJobs, 4000);
    return () => clearInterval(timer);
  }, []);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Pre-flight Scan Handler ("Đếm khối lượng")
  const handlePreflightScan = async () => {
    setScanningPreflight(true);
    try {
      const res = await fetch(`/api/admin/sync-engine/preflight?module=${selectedModule}`);
      const json = await res.json();
      if (json.success) {
        setPreflightData(json.data);
        setIsPreflightModalOpen(true);
      }
    } catch {
    } finally {
      setScanningPreflight(false);
    }
  };

  // Trigger Sync Job Handler
  const handleTriggerSync = async () => {
    setTriggeringJob(true);
    try {
      const res = await fetch("/api/admin/sync-engine/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: selectedModule,
          jobName: `${selectedModule.toLowerCase()}-delta-sync`,
          deltaOnly,
          excludeConflicts,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsPreflightModalOpen(false);
        await fetchJobs();
        if (json.data?.id) setSelectedJobId(json.data.id);
      }
    } catch {
    } finally {
      setTriggeringJob(false);
    }
  };

  // Retry Job Handler
  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/admin/sync-engine/jobs/${jobId}/retry`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        await fetchJobs();
        if (json.data?.id) setSelectedJobId(json.data.id);
      }
    } catch {}
  };

  // Filter logs for selected job
  const filteredLogs = (selectedJob?.logs || []).filter((log) => {
    const matchLevel = logLevelFilter === "ALL" || log.level === logLevelFilter;
    const matchSearch =
      !logSearch ||
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.level.toLowerCase().includes(logSearch.toLowerCase());
    return matchLevel && matchSearch;
  });

  const activeResources = resources[selectedModule] || resources["OMNICHANNEL"];
  const syncableCount = activeResources.filter((r) => !r.excluded).length;

  return (
    <div className="min-h-screen bg-[#0c0e14] text-stone-100 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00c9b7]/10 border border-[#00c9b7]/30 flex items-center justify-center text-[#00c9b7] shadow-inner">
            <Zap size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Sync Engine & Background Job Queue
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00c9b7]/20 text-[#00c9b7] border border-[#00c9b7]/30">
                LƯỜI OS COCKPIT
              </span>
            </div>
            <p className="text-xs text-stone-400 font-mono">
              Hệ thống điều phối hàng đợi tác vụ, đồng bộ vi sai (Delta Sync) và nhật ký sự kiện thời gian thực.
            </p>
          </div>
        </div>

        {/* Database Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1 bg-stone-900 border border-stone-800 rounded-lg flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-stone-300">PostgreSQL (5 Schemas)</span>
            <span className="text-emerald-400 font-bold">127.0.0.1:5432</span>
          </div>

          <div className="px-3 py-1 bg-stone-900 border border-stone-800 rounded-lg flex items-center gap-2 text-xs font-mono">
            <Server size={13} className="text-[#00c9b7]" />
            <span className="text-stone-400">VPS PM2:</span>
            <span className="text-stone-200 font-bold">4 Active daemons</span>
          </div>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800/80 pb-2 overflow-x-auto font-mono text-xs">
        {[
          { key: "OMNICHANNEL", label: "💬 Omnichannel (68 Fanpages)", icon: Layers },
          { key: "META_ADS", label: "📊 Meta Ads (11 Ad Accounts)", icon: Video },
          { key: "CRM_LEADS", label: "👥 miniCRM & Leads", icon: Users },
          { key: "SEO_INDEXING", label: "🌐 SEO & IndexNow", icon: Share2 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedModule(tab.key)}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              selectedModule === tab.key
                ? "bg-[#181b24] text-[#00c9b7] border border-[#00c9b7]/30 shadow-xs"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900/50"
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Top 2-Column Configuration Cards (Storekit Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Tài nguyên & Phạm vi nguồn */}
        <div className="bg-[#141720] border border-stone-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
              <Database size={16} className="text-[#00c9b7]" />
              <span>Phạm Vi Tài Nguyên & Quy Tắc Loại Trừ</span>
            </h3>
            <span className="text-[11px] font-mono text-stone-400">
              {syncableCount}/{activeResources.length} sẵn sàng đồng bộ
            </span>
          </div>

          {/* Safety Rule Notice */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-mono flex items-start gap-2">
            <ShieldCheck size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Tick = loại trừ:</strong> Dữ liệu nhân viên đang chăm sóc hoặc đã chốt lịch hẹn sẽ được bảo vệ tuyệt đối, auto-sync sẽ không ghi đè.
            </span>
          </div>

          {/* Resource Checklist */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {activeResources.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  item.excluded
                    ? "bg-stone-900/40 border-stone-800/60 opacity-75"
                    : "bg-[#181b26] border-stone-800 hover:border-[#00c9b7]/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!item.excluded}
                    onChange={() => {
                      setResources((prev) => ({
                        ...prev,
                        [selectedModule]: prev[selectedModule].map((r) =>
                          r.id === item.id ? { ...r, excluded: !r.excluded } : r
                        ),
                      }));
                    }}
                    className="w-4 h-4 rounded-md accent-[#00c9b7] cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-stone-200">{item.name}</div>
                    <div className="text-[10px] text-stone-500 font-mono">{item.countLabel}</div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    item.excluded
                      ? "bg-stone-800 text-stone-400 border border-stone-700"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {item.statusText}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Nội dung & Quy tắc Delta Sync */}
        <div className="bg-[#141720] border border-stone-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <Layers size={16} className="text-[#00c9b7]" />
                <span>Nội Dung & Quy Tắc Đồng Bộ Vi Sai (Delta Hashing)</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                Chế độ an toàn
              </span>
            </div>

            {/* Smart Delta Notice */}
            <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-300 font-mono leading-relaxed">
              💡 <strong>Chỉ đồng bộ key chưa có bản dịch/dữ liệu hoặc nguồn đã đổi:</strong> Chạy lại an toàn không tốn Token/Quota. Dữ liệu đã xử lý qua flow push sẽ tự động được giữ nguyên.
            </div>

            {/* Content Checkboxes Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <label className="flex items-center gap-2 p-2 bg-[#181b26] border border-stone-800 rounded-lg cursor-pointer hover:border-stone-700">
                <input
                  type="checkbox"
                  checked={contentRules.conversations}
                  onChange={(e) => setContentRules({ ...contentRules, conversations: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#00c9b7]"
                />
                <span>Tin nhắn & Hội thoại</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-[#181b26] border border-stone-800 rounded-lg cursor-pointer hover:border-stone-700">
                <input
                  type="checkbox"
                  checked={contentRules.customerInfo}
                  onChange={(e) => setContentRules({ ...contentRules, customerInfo: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#00c9b7]"
                />
                <span>SĐT & Tên khách</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-[#181b26] border border-stone-800 rounded-lg cursor-pointer hover:border-stone-700">
                <input
                  type="checkbox"
                  checked={contentRules.videoMedia}
                  onChange={(e) => setContentRules({ ...contentRules, videoMedia: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#00c9b7]"
                />
                <span>Video MP4 & Creative</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-[#181b26] border border-stone-800 rounded-lg cursor-pointer hover:border-stone-700">
                <input
                  type="checkbox"
                  checked={contentRules.branchDetection}
                  onChange={(e) => setContentRules({ ...contentRules, branchDetection: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#00c9b7]"
                />
                <span>Chi nhánh & Dịch vụ</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-[#181b26] border border-stone-800 rounded-lg cursor-pointer hover:border-stone-700">
                <input
                  type="checkbox"
                  checked={contentRules.dailyStats}
                  onChange={(e) => setContentRules({ ...contentRules, dailyStats: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#00c9b7]"
                />
                <span>Thống kê Ngày (Spend)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-[#181b26] border border-stone-800 rounded-lg cursor-pointer hover:border-stone-700">
                <input
                  type="checkbox"
                  checked={contentRules.seoMeta}
                  onChange={(e) => setContentRules({ ...contentRules, seoMeta: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#00c9b7]"
                />
                <span>SEO & IndexNow</span>
              </label>
            </div>
          </div>

          {/* Action Buttons: Đếm khối lượng + Đồng bộ */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3 font-mono">
            <button
              onClick={handlePreflightScan}
              disabled={scanningPreflight}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Search size={14} className={scanningPreflight ? "animate-spin text-[#00c9b7]" : "text-stone-400"} />
              <span>{scanningPreflight ? "Đang quét..." : "Đếm khối lượng"}</span>
            </button>

            <button
              onClick={handleTriggerSync}
              disabled={triggeringJob || syncableCount === 0}
              className="px-5 py-2.5 bg-[#00c9b7] hover:bg-[#00b3a2] text-[#023835] font-black text-xs rounded-xl transition-all shadow-lg shadow-[#00c9b7]/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play size={14} className={triggeringJob ? "animate-spin" : ""} />
              <span>{triggeringJob ? "Đang khởi chạy..." : `Đồng bộ ${syncableCount} nhóm mục`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom 2-Pane Section: Recent Jobs (Left) + Live Event Log (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Recent Jobs Queue (5 cols) */}
        <div className="lg:col-span-5 bg-[#141720] border border-stone-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#00c9b7]" />
              <h3 className="font-bold text-sm text-stone-100 font-sans">Recent Jobs (Hàng Đợi Gần Đây)</h3>
            </div>
            <button
              onClick={fetchJobs}
              className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-200 transition-colors"
              title="Làm mới hàng đợi"
            >
              <RefreshCw size={13} className={loadingJobs ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Jobs List */}
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {jobs.length === 0 ? (
              <div className="p-8 text-center text-stone-500 font-mono text-xs">
                Chưa có Job nào trong hàng đợi.
              </div>
            ) : (
              jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const isRunning = job.status === "RUNNING";
                const isFailed = job.status === "FAILED";
                const isPartial = job.status === "PARTIAL_FAILED";

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer font-mono ${
                      isSelected
                        ? "bg-[#1c2130] border-[#00c9b7] shadow-md shadow-[#00c9b7]/5 ring-1 ring-[#00c9b7]/30"
                        : "bg-[#181b26] border-stone-800/80 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isRunning
                              ? "bg-amber-400 animate-ping"
                              : isFailed
                              ? "bg-rose-500"
                              : isPartial
                              ? "bg-amber-500"
                              : "bg-emerald-400"
                          }`}
                        />
                        <span className="font-bold text-stone-200 truncate max-w-[170px]">
                          {job.jobName}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {new Date(job.startedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400">
                          {job.processedItems}/{job.totalItems}
                        </span>
                        {job.failedItems > 0 && (
                          <span className="text-rose-400 font-bold">
                            {job.failedItems} failed
                          </span>
                        )}
                        {job.status === "COMPLETED" && (
                          <span className="text-emerald-400 font-bold">Done</span>
                        )}
                      </div>

                      <span className="text-[10px] text-stone-500 font-mono">
                        {job.durationMs ? `${(job.durationMs / 1000).toFixed(1)}s` : "Running..."}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFailed
                            ? "bg-rose-500"
                            : isPartial
                            ? "bg-amber-500"
                            : "bg-[#00c9b7]"
                        }`}
                        style={{
                          width: `${Math.round((job.processedItems / Math.max(1, job.totalItems)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Live Event Log Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-[#141720] border border-stone-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            {/* Header with Search & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-[#00c9b7]" />
                <h3 className="font-bold text-sm text-stone-100 font-sans">
                  Event Log Stream: <span className="text-[#00c9b7] font-mono">{selectedJob?.jobName || "No job"}</span>
                </h3>
              </div>

              {/* Log Level Filter & Action Buttons */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <select
                  value={logLevelFilter}
                  onChange={(e) => setLogLevelFilter(e.target.value)}
                  className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-300 focus:outline-none focus:border-[#00c9b7]"
                >
                  <option value="ALL">Tất cả Logs ({selectedJob?.logs?.length || 0})</option>
                  <option value="ERROR">Chỉ Lỗi (Errors)</option>
                  <option value="WARN">Cảnh báo (Warnings)</option>
                  <option value="SUCCESS">Thành công (Success)</option>
                  <option value="INFO">Thông tin (Info)</option>
                </select>

                {selectedJob?.failedItems && selectedJob.failedItems > 0 ? (
                  <button
                    onClick={() => handleRetryJob(selectedJob.id)}
                    className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold hover:bg-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Retry ({selectedJob.failedItems})</span>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Search within log */}
            <div className="relative font-mono">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Lọc sự kiện trong log (e.g. error, fanpage, crm, upsert)..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#00c9b7]"
              />
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="bg-[#0b0d13] border border-stone-900 rounded-xl p-4 font-mono text-xs text-stone-300 min-h-[300px] max-h-[340px] overflow-y-auto space-y-2 shadow-inner">
            {!selectedJob || filteredLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-stone-600">
                <span>Select a job to see its event log.</span>
              </div>
            ) : (
              filteredLogs.map((log, idx) => {
                const isError = log.level === "ERROR";
                const isWarn = log.level === "WARN";
                const isSuccess = log.level === "SUCCESS";

                return (
                  <div key={log.id || idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-stone-600 text-[10px] shrink-0">{log.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-bold rounded shrink-0 ${
                        isError
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : isWarn
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : isSuccess
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      }`}
                    >
                      {log.level}
                    </span>
                    <span
                      className={`break-all ${
                        isError
                          ? "text-rose-300"
                          : isWarn
                          ? "text-amber-200"
                          : isSuccess
                          ? "text-emerald-300"
                          : "text-stone-300"
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pre-flight Scanner Modal ("Đếm khối lượng") */}
      {isPreflightModalOpen && preflightData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 font-sans">
          <div className="bg-[#141720] border border-stone-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#00c9b7]" />
                <h3 className="font-bold text-base text-white">Báo Cáo Tiền Kiểm Tra ("Đếm Khối Lượng")</h3>
              </div>
              <button
                onClick={() => setIsPreflightModalOpen(false)}
                className="text-stone-500 hover:text-stone-300 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {/* Summary Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl">
                <span className="text-[10px] text-stone-400 block">Tổng Quét:</span>
                <strong className="text-lg text-stone-100">{preflightData.summary.totalScanned}</strong>
              </div>

              <div className="p-3 bg-[#00c9b7]/10 border border-[#00c9b7]/30 rounded-xl">
                <span className="text-[10px] text-[#00c9b7] block">Cần Đồng Bộ Delta:</span>
                <strong className="text-lg text-[#00c9b7]">+{preflightData.summary.newOrModified}</strong>
              </div>

              <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl">
                <span className="text-[10px] text-stone-400 block">Thời Gian Ước Tính:</span>
                <strong className="text-lg text-emerald-400">~{preflightData.summary.estimatedDurationSec}s</strong>
              </div>
            </div>

            {/* Resource Breakdown List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-400 font-mono block uppercase">
                Chi tiết từng phân hệ:
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {preflightData.breakdown.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-stone-200">{b.resource}</div>
                      <div className="text-[10px] text-stone-400">{b.status}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      +{b.pendingDelta} mục
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3 font-mono">
              <button
                onClick={() => setIsPreflightModalOpen(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold rounded-xl"
              >
                Hủy Bỏ
              </button>

              <button
                onClick={handleTriggerSync}
                disabled={triggeringJob}
                className="px-5 py-2 bg-[#00c9b7] hover:bg-[#00b3a2] text-[#023835] text-xs font-black rounded-xl shadow-lg shadow-[#00c9b7]/10 flex items-center gap-2 cursor-pointer"
              >
                <Play size={13} />
                <span>Tiến Hành Đồng Bộ Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
