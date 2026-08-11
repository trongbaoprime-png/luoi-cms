"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  Activity,
  Play,
  CheckCircle2,
  RefreshCw,
  Zap,
  Layers,
  ShieldCheck,
  Server,
} from "lucide-react";

export default function OpenClawControlPanel() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("SALES");
  const [taskPrompt, setTaskPrompt] = useState("Soạn tin nhắn chào mừng và tư vấn trồng răng Implant cho khách hàng.");
  const [runResult, setRunResult] = useState<any>(null);
  const [executingAgent, setExecutingAgent] = useState(false);

  const fetchOpenClawData = useCallback(async () => {
    setLoading(true);
    try {
      const healthRes = await fetch("http://127.0.0.1:20180/api/health").catch(() => null);
      if (healthRes && healthRes.ok) {
        const hJson = await healthRes.json();
        setHealthData(hJson);
      } else {
        setHealthData({ status: "DEGRADED", port: 20180 });
      }

      const agentsRes = await fetch("http://127.0.0.1:20180/api/agents").catch(() => null);
      if (agentsRes && agentsRes.ok) {
        const aJson = await agentsRes.json();
        setAgentsList(aJson.agents || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOpenClawData();
    const interval = setInterval(fetchOpenClawData, 10000);
    return () => clearInterval(interval);
  }, [fetchOpenClawData]);

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setExecutingAgent(true);
    setRunResult(null);

    try {
      const res = await fetch("http://127.0.0.1:20180/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentCode: selectedAgent,
          inputPrompt: taskPrompt,
          workspaceId: "ws_default_001",
        }),
      });

      const data = await res.json();
      setRunResult(data);
    } catch (err: any) {
      setRunResult({ error: err?.message || "Lỗi kết nối tới OpenClaw Runtime" });
    }
    setExecutingAgent(false);
  };

  return (
    <div className="w-full space-y-4 pb-12 font-mono text-stone-900">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-gradient-to-r from-[#042d2a] via-[#023835] to-[#0d4f4a] text-white p-5 rounded-2xl shadow-md border border-[#084540]">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#00c9b7]" />
            <h1 className="text-xl font-bold font-serif text-white tracking-tight">
              OpenClaw Agent Runtime — Control Panel
            </h1>
          </div>
          <p className="text-xs text-[#e6f4f1]/80 mt-1">
            Quản lý AI Agents (CEO, Marketing, Sales, CSKH), Skill Execution &amp; Channel Bridge Adapter (Port 20180)
          </p>
        </div>

        <button
          onClick={fetchOpenClawData}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-sm transition-all border border-white/10 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Làm Mới Trạng Thái</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 font-bold uppercase block mb-1">Trạng Thái Runtime</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${healthData?.status === "HEALTHY" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="text-lg font-bold text-stone-900">{healthData?.status || "HEALTHY"}</span>
            </div>
            <span className="text-[10px] text-stone-400">Endpoint: http://127.0.0.1:20180</span>
          </div>
          <Server className="w-8 h-8 text-[#0d4f4a]/20" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 font-bold uppercase block mb-1">Số Agent Đang Hoạt Động</span>
            <span className="text-2xl font-bold text-stone-900">{healthData?.stats?.registeredAgentsCount || 4}</span>
            <span className="text-[10px] text-stone-400">CEO, Marketing, Sales, CSKH</span>
          </div>
          <Bot className="w-8 h-8 text-[#0d4f4a]/20" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 font-bold uppercase block mb-1">Tổng Số Agent Runs</span>
            <span className="text-2xl font-bold text-stone-900">{healthData?.stats?.totalAgentRunsExecuted || 0}</span>
            <span className="text-[10px] text-stone-400">Phiên Đã Thực Thi</span>
          </div>
          <Activity className="w-8 h-8 text-[#0d4f4a]/20" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between bg-gradient-to-br from-teal-50/50 to-emerald-50/30 border-teal-200">
          <div>
            <span className="text-[11px] text-[#0d4f4a] font-bold uppercase block mb-1">OmniRoute Gateway</span>
            <span className="text-sm font-bold text-[#0d4f4a]">CONNECTED</span>
            <span className="text-[10px] text-[#0d4f4a]/80 block font-mono">http://127.0.0.1:20128</span>
          </div>
          <Zap className="w-8 h-8 text-[#0d4f4a]/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Agents List */}
        <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#0d4f4a]" />
              <h3 className="font-bold text-sm text-stone-900">Danh Sách AI Agents Đã Đăng Ký Trong Hệ Thống</h3>
            </div>
            <span className="text-xs text-stone-500 font-bold">4 System Agents</span>
          </div>

          <div className="space-y-3 text-xs">
            {agentsList.length === 0 ? (
              <div className="p-4 text-center text-stone-400 text-xs">Đang tải danh sách Agents từ OpenClaw Runtime...</div>
            ) : (
              agentsList.map((a) => (
                <div key={a.code} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white bg-[#0d4f4a] px-2 py-0.5 rounded-md text-xs">
                        {a.code}
                      </span>
                      <span className="font-bold text-stone-900 text-sm">{a.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-500 bg-stone-200 px-2 py-0.5 rounded">
                      Profile: {a.defaultProfile}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 font-mono">{a.role}</p>

                  <div className="pt-1 border-t border-stone-200/60">
                    <span className="text-[10px] text-stone-500 font-bold block mb-1">Tool Allowlist Đã Cấp Quyền:</span>
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {a.allowedTools?.map((t: string) => (
                        <span key={t} className="px-2 py-0.5 bg-white border border-stone-300 rounded font-mono text-stone-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Trigger Agent Sandbox */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
            <Play className="w-5 h-5 text-[#0d4f4a]" />
            <h3 className="font-bold text-sm text-stone-900">Kích Hoạt Phiên Thực Thi Agent (Sandbox)</h3>
          </div>

          <form onSubmit={handleRunAgent} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-stone-600 block mb-1">Chọn Agent Thực Thi</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
              >
                <option value="SALES">SALES Agent (Tư vấn, báo giá, lead scoring)</option>
                <option value="MARKETING">MARKETING Agent (Chiến dịch, content, ROAS)</option>
                <option value="CSKH">CSKH Agent (Chăm sóc sau mua, ticket, SOP)</option>
                <option value="CEO">CEO Agent (Báo cáo tổng quan, SLA &amp; phê duyệt)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-600 block mb-1">Yêu Cầu / Nhiệm Vụ Cho Agent</label>
              <textarea
                rows={3}
                value={taskPrompt}
                onChange={(e) => setTaskPrompt(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={executingAgent}
              className="w-full py-2.5 bg-[#0d4f4a] hover:bg-[#093a37] text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#00c9b7]" />
              <span>{executingAgent ? "Agent Đang Xử Lý..." : "Kích Hoạt OpenClaw Agent Run"}</span>
            </button>
          </form>

          {runResult && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                <span className="font-bold text-stone-900">🤖 Agent Run Result</span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  {runResult.status}
                </span>
              </div>
              <div className="text-[11px] font-mono text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200 max-h-48 overflow-y-auto">
                {runResult.output || JSON.stringify(runResult, null, 2)}
              </div>
              {runResult.runId && (
                <div className="text-[10px] text-stone-500 font-mono">
                  Run ID: {runResult.runId} | Profile: {runResult.profileUsed}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
