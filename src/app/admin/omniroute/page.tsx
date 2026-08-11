"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Cpu,
  Activity,
  ShieldCheck,
  Zap,
  DollarSign,
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
} from "lucide-react";

export default function OmniRouteControlPanel() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [modelsData, setModelsData] = useState<any[]>([]);
  const [testProfile, setTestProfile] = useState("business/fast");
  const [testPrompt, setTestPrompt] = useState("Phân tích nhanh nhu cầu làm răng sứ của khách hàng.");
  const [testResult, setTestResult] = useState<any>(null);
  const [testingModel, setTestingModel] = useState(false);

  const fetchGatewayData = useCallback(async () => {
    setLoading(true);
    try {
      const healthRes = await fetch("/api/omniroute/health").catch(() => null);
      if (healthRes && healthRes.ok) {
        const hJson = await healthRes.json();
        setHealthData(hJson);
      } else {
        setHealthData({ status: "DEGRADED", port: 20128 });
      }

      const modelsRes = await fetch("/api/omniroute/models").catch(() => null);
      if (modelsRes && modelsRes.ok) {
        const mJson = await modelsRes.json();
        setModelsData(mJson.profiles || mJson.data || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGatewayData();
    const interval = setInterval(fetchGatewayData, 10000);
    return () => clearInterval(interval);
  }, [fetchGatewayData]);

  const handleTestInference = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingModel(true);
    setTestResult(null);

    try {
      const res = await fetch("http://127.0.0.1:20128/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: testProfile,
          messages: [{ role: "user", content: testPrompt }],
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err?.message || "Lỗi kết nối tới OmniRoute Gateway" });
    }
    setTestingModel(false);
  };

  return (
    <div className="w-full space-y-4 pb-12 font-mono text-stone-900">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-gradient-to-r from-[#042d2a] via-[#023835] to-[#0d4f4a] text-white p-5 rounded-2xl shadow-md border border-[#084540]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#00c9b7]" />
            <h1 className="text-xl font-bold font-serif text-white tracking-tight">
              OmniRoute Model Gateway — Operating Control Panel
            </h1>
          </div>
          <p className="text-xs text-[#e6f4f1]/80 mt-1">
            Gateway tập trung định tuyến AI Models, quản lý Provider fallback, Quota &amp; Chi phí (Port 20128 / OpenAI Endpoint)
          </p>
        </div>

        <button
          onClick={fetchGatewayData}
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
            <span className="text-[11px] text-stone-500 font-bold uppercase block mb-1">Trạng Thái Gateway</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${healthData?.status === "HEALTHY" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="text-lg font-bold text-stone-900">{healthData?.status || "HEALTHY"}</span>
            </div>
            <span className="text-[10px] text-stone-400">Endpoint: http://127.0.0.1:20128</span>
          </div>
          <Server className="w-8 h-8 text-[#0d4f4a]/20" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 font-bold uppercase block mb-1">Tổng Request Đã Định Tuyến</span>
            <span className="text-2xl font-bold text-stone-900">{healthData?.stats?.totalRequestsProcessed || 0}</span>
            <span className="text-[10px] text-stone-400">Request v1/chat/completions</span>
          </div>
          <Activity className="w-8 h-8 text-[#0d4f4a]/20" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 font-bold uppercase block mb-1">Tổng Tokens Tiêu Thụ</span>
            <span className="text-2xl font-bold text-stone-900">{(healthData?.stats?.totalTokensConsumed || 0).toLocaleString("vi-VN")}</span>
            <span className="text-[10px] text-stone-400">Tokens</span>
          </div>
          <Zap className="w-8 h-8 text-[#0d4f4a]/20" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between bg-gradient-to-br from-teal-50/50 to-emerald-50/30 border-teal-200">
          <div>
            <span className="text-[11px] text-[#0d4f4a] font-bold uppercase block mb-1">Ước Tính Chi Phí AI</span>
            <span className="text-2xl font-bold text-[#0d4f4a]">${healthData?.stats?.totalEstimatedCostUsd || "0.000000"}</span>
            <span className="text-[10px] text-[#0d4f4a]/80 font-medium">USD</span>
          </div>
          <DollarSign className="w-8 h-8 text-[#0d4f4a]/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 6 Routing Profiles Table */}
        <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0d4f4a]" />
              <h3 className="font-bold text-sm text-stone-900">6 Model Routing Profiles Chống Lỗi (Fallback Matrix)</h3>
            </div>
            <span className="text-xs text-stone-500 font-bold">6 Profiles</span>
          </div>

          <div className="space-y-3 text-xs">
            {modelsData.length === 0 ? (
              <div className="p-4 text-center text-stone-400 text-xs">Đang tải danh sách Model Profiles từ Gateway...</div>
            ) : (
              modelsData.map((p) => (
                <div key={p.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0d4f4a] bg-[#0d4f4a]/10 px-2 py-0.5 rounded-md text-xs">
                      {p.id}
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold">
                      Chính: <strong className="text-stone-900">{p.primaryProvider}</strong> | Dự phòng: <strong className="text-stone-700">{p.fallbackProvider}</strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-mono">{p.description}</p>
                  <div className="flex flex-wrap gap-1 text-[10px] pt-1">
                    {p.models?.map((m: string) => (
                      <span key={m} className="px-2 py-0.5 bg-white border border-stone-300 rounded font-mono text-stone-700">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Live Model Inference Sandbox */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
            <Zap className="w-5 h-5 text-[#0d4f4a]" />
            <h3 className="font-bold text-sm text-stone-900">Live Gateway Testing Sandbox</h3>
          </div>

          <form onSubmit={handleTestInference} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-stone-600 block mb-1">Chọn Model Profile</label>
              <select
                value={testProfile}
                onChange={(e) => setTestProfile(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
              >
                <option value="business/fast">business/fast (Nhanh - Lead/Tagging)</option>
                <option value="business/quality">business/quality (Chất lượng cao - Strategy)</option>
                <option value="business/creative">business/creative (Sáng tạo - Marketing)</option>
                <option value="business/private">business/private (Bảo mật - Offline Ollama)</option>
                <option value="business/vision">business/vision (Vision - Phân tích ảnh)</option>
                <option value="business/emergency">business/emergency (Dự phòng khẩn cấp)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-600 block mb-1">Prompt Thử Nghiệm</label>
              <textarea
                rows={3}
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={testingModel}
              className="w-full py-2.5 bg-[#0d4f4a] hover:bg-[#093a37] text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-[#00c9b7]" />
              <span>{testingModel ? "Đang Định Tuyến LLM..." : "Gửi Request Qua OmniRoute Gateway"}</span>
            </button>
          </form>

          {testResult && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
              <span className="font-bold text-stone-900 block border-b border-stone-200 pb-1">
                📥 Kết Quả Trả Về Từ Gateway:
              </span>
              <div className="text-[11px] font-mono text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200 max-h-48 overflow-y-auto">
                {testResult.choices?.[0]?.message?.content || JSON.stringify(testResult, null, 2)}
              </div>
              {testResult.usage && (
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-semibold pt-1">
                  <span>Model: {testResult.model}</span>
                  <span>Tokens: {testResult.usage.total_tokens}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
