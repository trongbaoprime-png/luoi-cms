"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  Zap,
  TrendingUp,
  FileText,
  Clock,
  DollarSign,
  Users,
  Activity,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function VerticalSliceControlRoom() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("Lê Thị Thanh");
  const [formPhone, setFormPhone] = useState("0912345678");
  const [formService, setFormService] = useState("Răng Sứ Thẩm Mỹ");
  const [formNote, setFormNote] = useState("Tư vấn bọc răng sứ 16 răng ưu đãi T8");
  const [submittingForm, setSubmittingForm] = useState(false);

  // Order State
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [orderAmount, setOrderAmount] = useState("22000000");
  const [convertingOrder, setConvertingOrder] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vertical-slice/execute");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleSimulateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingForm(true);
    setActionNotice(null);
    try {
      const res = await fetch("/api/vertical-slice/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_form",
          fullName: formName,
          phone: formPhone,
          service: formService,
          note: formNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`✅ Form submitted! Created Lead for ${data.customer.fullName} (${data.customer.primaryPhone}). Triggered Telegram Alert & AI Draft.`);
        fetchMetrics();
      }
    } catch {
      setActionNotice("❌ Error processing form submission");
    }
    setSubmittingForm(false);
  };

  const handleApproveDraft = async (requestId: string) => {
    try {
      const res = await fetch("/api/vertical-slice/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_draft",
          requestId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`✅ AI Response Draft Approved by Manager! Dispatched to Customer.`);
        fetchMetrics();
      }
    } catch {}
  };

  const handleConvertOrder = async () => {
    setConvertingOrder(true);
    try {
      const res = await fetch("/api/vertical-slice/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "convert_order",
          leadId: selectedLeadId,
          orderAmount: Number(orderAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`🎉 Order #${data.order.orderNumber} successfully created! Lifetime Value updated: ${data.customer.lifetimeValue.toLocaleString("vi-VN")}đ.`);
        fetchMetrics();
      }
    } catch {}
    setConvertingOrder(false);
  };

  return (
    <div className="w-full space-y-4 pb-12 font-mono text-stone-900">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-gradient-to-r from-[#042d2a] via-[#023835] to-[#0d4f4a] text-white p-5 rounded-2xl shadow-md border border-[#084540]">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00c9b7]" />
            <h1 className="text-xl font-bold font-serif text-white tracking-tight">
              LƯỜI BUSINESS OS — Live Vertical Slice Control Room
            </h1>
          </div>
          <p className="text-xs text-[#e6f4f1]/80 mt-1">
            Luồng vận hành sống 360°: Web Form → Customer 360 → Telegram Alert → AI Draft → Approval Center → Order Conversion → Analytics
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-sm transition-all border border-white/10 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Làm Mới Dữ Liệu</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-xl flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {/* Funnel Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 font-bold uppercase block mb-1">1. Lượt Xem Web</span>
          <p className="text-2xl font-bold text-stone-900">{metrics?.visitors || 150}</p>
          <span className="text-[10px] text-stone-400">Visitors</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 font-bold uppercase block mb-1">2. Form Tư Vấn</span>
          <p className="text-2xl font-bold text-stone-900">{metrics?.forms || 0}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{metrics?.formConversionRate || 0}% CR</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 font-bold uppercase block mb-1">3. Lead Khách Hàng</span>
          <p className="text-2xl font-bold text-stone-900">{metrics?.leads || 0}</p>
          <span className="text-[10px] text-stone-500">Phân công Sales</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 font-bold uppercase block mb-1">4. Đơn Hàng Thành Công</span>
          <p className="text-2xl font-bold text-emerald-700">{metrics?.orders || 0}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{metrics?.orderConversionRate || 0}% Lead → Order</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs bg-gradient-to-br from-teal-50/50 to-emerald-50/30 border-teal-200">
          <span className="text-[11px] text-[#0d4f4a] font-bold uppercase block mb-1">5. Tổng Doanh Thu</span>
          <p className="text-xl font-bold text-[#0d4f4a]">{(metrics?.revenue || 0).toLocaleString("vi-VN")}đ</p>
          <span className="text-[10px] text-[#0d4f4a]/80 font-medium">Attribution Ghi Nhận</span>
        </div>
      </div>

      {/* Main Interactive Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Actions */}
        <div className="lg:col-span-5 space-y-4">
          {/* STEP 1: Simulate Landing Page Form Submit */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
              <div className="w-6 h-6 rounded-full bg-[#0d4f4a] text-white flex items-center justify-center font-bold text-xs">1</div>
              <h3 className="font-bold text-sm text-stone-900">Giả Lập Điền Form Landing Page</h3>
            </div>

            <form onSubmit={handleSimulateFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-600 block mb-1">Họ và Tên Khách Hàng</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-stone-600 block mb-1">Số Điện Thoại VN (Tự động chuẩn hóa)</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-stone-600 block mb-1">Dịch Vụ Quan Tâm</label>
                <select
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                >
                  <option value="Răng Sứ Thẩm Mỹ">Răng Sứ Thẩm Mỹ</option>
                  <option value="Trồng Răng Implant">Trồng Răng Implant</option>
                  <option value="Niềng Răng Trong Suốt">Niềng Răng Trong Suốt</option>
                  <option value="Tẩy Trắng Răng Premium">Tẩy Trắng Răng Premium</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-600 block mb-1">Ghi Chú Yêu Cầu</label>
                <textarea
                  rows={2}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingForm}
                className="w-full py-2.5 bg-[#0d4f4a] hover:bg-[#093a37] text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-[#00c9b7]" />
                <span>{submittingForm ? "Đang Xử Lý..." : "Gửi Form & Tạo Customer 360"}</span>
              </button>
            </form>
          </div>

          {/* STEP 3: Convert Lead to Order */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
              <div className="w-6 h-6 rounded-full bg-[#0d4f4a] text-white flex items-center justify-center font-bold text-xs">3</div>
              <h3 className="font-bold text-sm text-stone-900">Chuyển Đổi Lead Thành Đơn Hàng</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-600 block mb-1">Giá Trị Đơn Hàng (VNĐ)</label>
                <input
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                />
              </div>

              <button
                onClick={handleConvertOrder}
                disabled={convertingOrder}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-emerald-200" />
                <span>{convertingOrder ? "Đang Chuyển Đổi..." : "Tạo Đơn Hàng & Cập Nhật LTV"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Stream, Approvals & Timeline */}
        <div className="lg:col-span-7 space-y-4">
          {/* STEP 2: Approval Center Pending Requests */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0d4f4a]" />
                <h3 className="font-bold text-sm text-stone-900">Approval Center — Chờ Phê Duyệt AI Draft</h3>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                {metrics?.approvalQueue?.length || 0} Yêu Cầu Chờ
              </span>
            </div>

            {(!metrics?.approvalQueue || metrics.approvalQueue.length === 0) ? (
              <div className="p-6 text-center text-stone-400 text-xs">
                Chưa có yêu cầu AI Draft nào chờ phê duyệt. Hãy giả lập gửi form ở cột bên trái!
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {metrics.approvalQueue.map((item: any) => (
                  <div key={item.requestId} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">
                        Khách: {item.customer?.fullName} ({item.customer?.primaryPhone})
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${item.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-stone-200 text-stone-700 font-mono text-[11px]">
                      <span className="text-[10px] text-stone-400 block font-bold mb-1">🤖 AI Agent Draft Response:</span>
                      "{item.aiDraft}"
                    </div>

                    {item.status === "PENDING" && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleApproveDraft(item.requestId)}
                          className="px-3 py-1.5 bg-[#0d4f4a] hover:bg-[#093a37] text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Duyệt &amp; Gửi Tin Nhắn</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STEP 4: Live Customer 360 Interaction Timeline */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
              <Activity className="w-5 h-5 text-[#0d4f4a]" />
              <h3 className="font-bold text-sm text-stone-900">Hồ Sơ Customer 360 — Live Interaction Timeline</h3>
            </div>

            <div className="space-y-3 text-xs">
              {metrics?.recentTimelineEvents?.map((evt: any) => (
                <div key={evt.id} className="flex items-start gap-3 p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="w-2 h-2 rounded-full bg-[#0d4f4a] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-stone-900">{evt.title}</span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(evt.timestamp).toLocaleTimeString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 font-mono">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
