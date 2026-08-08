"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, ExternalLink, Flame } from "lucide-react";

interface Deal {
  id: string;
  code: string;
  title: string;
  discount: string;
  merchant: string;
  affiliateUrl: string;
  isHot: boolean;
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [merchant, setMerchant] = useState("Shopee");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [isHot, setIsHot] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDeals = () => {
    fetch("/api/admin/deals")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDeals(data.data);
      });
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, title, discount, merchant, affiliateUrl, isHot }),
      });
      const data = await res.json();
      if (data.success) {
        setCode("");
        setTitle("");
        setDiscount("");
        setAffiliateUrl("");
        setIsHot(false);
        fetchDeals();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa voucher này?")) return;
    await fetch(`/api/admin/deals/${id}`, { method: "DELETE" });
    fetchDeals();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Tag className="w-6 h-6 text-[#0d9488]" />
          Quản Lý Voucher & Deal Hot ({deals.length})
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deal Form */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#0d9488]" />
            Thêm Mã Giảm Giá Mới
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Mã Voucher (Code)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: LUOI50K"
                className="w-full px-3 py-2 border rounded-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tiêu Đề Voucher</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Voucher Đơn Đầu Shopee Choice"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Mức Giảm</label>
              <input
                type="text"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="Giảm 50.000đ"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Sàn Thương Mại</label>
              <select
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
              >
                <option value="Shopee">Shopee</option>
                <option value="Lazada">Lazada</option>
                <option value="Tiki">Tiki</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Link Đích (Affiliate)</label>
              <input
                type="url"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                placeholder="https://shopee.vn/..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                required
              />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <input
                type="checkbox"
                id="isHot"
                checked={isHot}
                onChange={(e) => setIsHot(e.target.checked)}
                className="w-4 h-4 text-[#0d4f4a] rounded border-stone-300 focus:ring-[#0d4f4a]"
              />
              <label htmlFor="isHot" className="font-bold text-amber-700 flex items-center gap-1 cursor-pointer">
                <Flame className="w-4 h-4 fill-current text-amber-500" />
                Đánh dấu Deal Hot (Ưu tiên hiển thị)
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0d4f4a] text-white font-mono font-bold text-xs rounded-xl hover:bg-[#083b37] transition-colors cursor-pointer shadow-xs"
            >
              {loading ? "Đang lưu..." : "Thêm Voucher"}
            </button>
          </form>
        </div>

        {/* Deals List */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs font-mono">
          <h2 className="text-lg font-bold text-stone-900 mb-4">Danh Sách Voucher Hiện Có</h2>
          <div className="divide-y divide-stone-100">
            {deals.map((deal) => (
              <div key={deal.id} className="py-3 flex items-center justify-between hover:bg-stone-50 px-2 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-stone-100 px-2 py-0.5 rounded-lg text-stone-800 border border-stone-200">
                      {deal.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#0d4f4a]/10 text-[#0d4f4a] border border-[#0d4f4a]/30 uppercase">
                      {deal.merchant}
                    </span>
                    {deal.isHot && <span className="text-xs font-bold text-amber-600">🔥 HOT</span>}
                  </div>
                  <h3 className="font-semibold text-stone-900 text-sm mt-1">{deal.title}</h3>
                  <p className="text-xs text-stone-500">{deal.discount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={deal.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-stone-500 hover:text-[#0d9488]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(deal.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
