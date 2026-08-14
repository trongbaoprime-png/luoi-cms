"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  Check,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface AffiliatePartner {
  id: string;
  name: string;
  code: string;
  phone: string;
  type: "KOC" | "KOL" | "EMPLOYEE" | "PARTNER";
  commissionRate: number;
  clicks: number;
  leads: number;
  actualRevenue: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  status: "ACTIVE" | "PAUSED";
}

export default function AffiliateAdminPage() {
  const [partners, setPartners] = useState<AffiliatePartner[]>([]);
  const [kpis, setKpis] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    phone: "",
    type: "KOC",
    commissionRate: 0.08,
  });

  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliate/portal");
      const data = await res.json();
      if (data.success) {
        setPartners(data.partners);
        setKpis(data.kpis);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const handleCopyLink = (code: string) => {
    const link = `https://luoidonnha.com/?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/affiliate/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setNotice(data.message);
        setFormData({ name: "", code: "", phone: "", type: "KOC", commissionRate: 0.08 });
        fetchAffiliates();
      }
    } catch {
      alert("Lỗi khi thêm đối tác");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="bg-[#0a3b37] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00c9b7]/20 text-[#00c9b7] font-bold text-[11px] font-mono">
              GIAI ĐOẠN 3
            </span>
            <span className="text-white/60 text-xs font-mono">Cổng Đối Tác &amp; Hoa Hồng</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">KOC / KOL &amp; Affiliate Referral Portal</h1>
          <p className="text-stone-300 text-xs mt-1">
            Theo dõi lưu lượng truy cập, số lead phát sinh, doanh thu thực tế và đối soát hoa hồng tự động cho đối tác.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#00c9b7] hover:bg-[#00b3a2] text-stone-950 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Thêm Đối Tác Mới</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold font-mono flex items-center justify-between">
          <span>✅ {notice}</span>
          <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* KPI Header Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase block mb-1">Tổng Số Đối Tác</span>
          <p className="text-2xl font-black text-stone-900">{kpis.totalPartners || 0}</p>
          <span className="text-[11px] text-stone-400 font-mono mt-1 block">KOCs, KOLs &amp; Telesales</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase block mb-1">Doanh Thu Qua Affiliate</span>
          <p className="text-2xl font-black text-emerald-700">{kpis.formattedReferredRevenue || "0 Tỷ"}</p>
          <span className="text-[11px] text-emerald-600 font-mono mt-1 block">Thực thu tại phòng khám</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase block mb-1">Hoa Hồng Đã Phát Sinh</span>
          <p className="text-2xl font-black text-blue-700">{kpis.formattedCommission || "0 Triệu"}</p>
          <span className="text-[11px] text-blue-600 font-mono mt-1 block">Tỷ lệ TB: 8.5%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase block mb-1">Hoa Hồng Chờ Chi Trả</span>
          <p className="text-2xl font-black text-purple-700">{kpis.formattedPending || "0 Triệu"}</p>
          <span className="text-[11px] text-purple-600 font-mono mt-1 block">Đối soát cuối tháng</span>
        </div>
      </div>

      {/* Partner Directory Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-stone-900">Danh Sách KOC &amp; Đối Tác Giới Thiệu</h2>
          <span className="text-xs font-mono text-stone-400">Hiển thị {partners.length} đối tác</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-50 text-stone-500 uppercase font-mono text-[10px] border-b">
              <tr>
                <th className="py-3 px-4">Đối Tác</th>
                <th className="py-3 px-3">Loại</th>
                <th className="py-3 px-3">Mã &amp; Link Giới Thiệu</th>
                <th className="py-3 px-3">Clicks / Leads</th>
                <th className="py-3 px-3">Doanh Thu Giới Thiệu</th>
                <th className="py-3 px-3">Hoa Hồng (Rate %)</th>
                <th className="py-3 px-3">Chờ Chi Trả</th>
                <th className="py-3 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-stone-900">{p.name}</p>
                    <p className="text-[11px] text-stone-400 font-mono">{p.phone}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        p.type === "KOC"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : p.type === "PARTNER"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {p.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border">
                        {p.code}
                      </span>
                      <button
                        onClick={() => handleCopyLink(p.code)}
                        className="p-1 text-stone-400 hover:text-emerald-700 rounded transition-colors"
                        title="Copy link giới thiệu"
                      >
                        {copiedCode === p.code ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="text-stone-700 font-bold">{p.clicks.toLocaleString()}</span> clicks /{" "}
                    <strong className="text-emerald-700">{p.leads} leads</strong>
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-stone-900">
                    {(p.actualRevenue / 1000000).toFixed(1)}M VNĐ
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="text-blue-700 font-bold">{(p.totalCommission / 1000000).toFixed(1)}M</span>{" "}
                    <span className="text-stone-400 text-[10px]">({(p.commissionRate * 100).toFixed(0)}%)</span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span
                      className={`font-bold ${
                        p.pendingCommission > 0 ? "text-purple-700 font-black" : "text-stone-400"
                      }`}
                    >
                      {(p.pendingCommission / 1000000).toFixed(1)}M VNĐ
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <button
                      onClick={() => alert(`Đã tạo yêu cầu thanh toán ${(p.pendingCommission / 1000000).toFixed(1)}M cho ${p.name}`)}
                      disabled={p.pendingCommission === 0}
                      className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold text-[11px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Thanh Toán
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Partner Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900">Đăng Ký Đối Tác Affiliate / KOC Mới</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Tên Đối Tác / KOC:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Võ Hà Linh, BS Nguyễn Văn A..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Mã Giới Thiệu (Ref Code):</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="HALINH_2026"
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Số Điện Thoại:</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0908123456"
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Phân Loại:</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="KOC">KOC Review</option>
                    <option value="KOL">KOL Người nổi tiếng</option>
                    <option value="PARTNER">Bác Sĩ / Đối Tác</option>
                    <option value="EMPLOYEE">Telesale Nội Bộ</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tỷ Lệ Hoa Hồng (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="0.5"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0a3b37] hover:bg-[#062422] text-white font-bold rounded-xl shadow-sm transition-colors"
                >
                  Xác Nhận Đăng Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
