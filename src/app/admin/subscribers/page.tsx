"use client";

import { useState, useEffect } from "react";
import { Users, Download } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: string;
  createdAt: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/subscribers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSubscribers(data.data);
      });
  }, []);

  const filtered = subscribers.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.email.toLowerCase().includes(q) || (s.name || "").toLowerCase().includes(q);
  });

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + ["Email,Status,Date", ...filtered.map((s) => `${s.email},${s.status},${s.createdAt}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers_tamducsmile.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-[#0d4f4a]" />
          Danh Sách Email Đăng Ký ({subscribers.length})
        </h1>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 bg-[#0d4f4a] text-white text-xs font-mono font-bold rounded-xl hover:bg-[#083b37] transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4 text-[#00c9b7]" />
          Xuất File CSV
        </button>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Tìm theo email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
        />
        <div className="text-xs text-stone-500 font-mono">
          Hiển thị: <strong>{filtered.length}</strong> / {subscribers.length} email
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-xs font-mono font-bold text-stone-700 uppercase">
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4">Ngày đăng ký</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {filtered.map((sub) => (
              <tr key={sub.id} className="hover:bg-stone-50">
                <td className="py-3 px-4 font-mono font-medium text-stone-900">{sub.email}</td>
                <td className="py-3 px-4">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    {sub.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-stone-500 text-xs">
                  {new Date(sub.createdAt).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
