"use client";

import { useState, useEffect } from "react";
import { Activity, Webhook, Plus, Trash2, Send, History } from "lucide-react";

interface AuditLogItem {
  id: string;
  userName?: string;
  action: string;
  entity: string;
  details?: string;
  createdAt: string;
}

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string;
  isEnabled: boolean;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["article.created"]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = () => {
    fetch("/api/admin/audit-logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLogs(data.data);
      });
  };

  const fetchWebhooks = () => {
    fetch("/api/admin/webhooks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWebhooks(data.data);
      });
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchWebhooks();
  }, []);

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, events: selectedEvents }),
      });
      const data = await res.json();
      if (data.success) {
        setName("");
        setUrl("");
        fetchWebhooks();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Xóa webhook này?")) return;
    await fetch(`/api/admin/webhooks/${id}`, { method: "DELETE" });
    fetchWebhooks();
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-12 font-mono">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#0d4f4a]" />
          Nhật Ký Thao Tác (Audit Logs) &amp; Webhooks System
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Theo dõi lịch sử hoạt động toàn bộ người dùng và phát tín hiệu sự kiện Webhook miễn phí kết nối Telegram / Discord.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Webhooks Config */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 font-mono">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Webhook className="w-5 h-5 text-[#0d4f4a]" />
            Cấu Hình Webhook Tích Hợp (Free &amp; Open Source)
          </h2>
          <form onSubmit={handleCreateWebhook} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Tên Webhook</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Thông báo bài mới lên Telegram"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Target Endpoint URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.telegram.org/... hoặc https://discord.com/api/webhooks/..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0d4f4a]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Sự kiện kích hoạt</label>
              <div className="flex flex-wrap gap-2 text-xs">
                {["article.created", "product.created", "deal.created", "user.login"].map((evt) => (
                  <button
                    key={evt}
                    type="button"
                    onClick={() =>
                      setSelectedEvents((prev) =>
                        prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt]
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedEvents.includes(evt)
                        ? "bg-[#0d4f4a] text-white border-[#0d4f4a] shadow-xs"
                        : "bg-stone-50 text-stone-600 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    {evt}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0d4f4a] hover:bg-[#083b37] text-white font-mono font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>{loading ? "Đang lưu..." : "Thêm Webhook Mới"}</span>
            </button>
          </form>

          {/* Webhooks Active List */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <h3 className="text-xs font-bold text-stone-700 uppercase">Webhooks Đang Hoạt Động ({webhooks.length})</h3>
            {webhooks.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Chưa có Webhook nào được tạo.</p>
            ) : (
              webhooks.map((w) => (
                <div key={w.id} className="p-3 bg-stone-50 rounded-xl flex items-center justify-between border border-stone-200/80">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-[#0d4f4a]" />
                      {w.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-mono truncate max-w-xs">{w.url}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteWebhook(w.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Logs View */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 font-mono">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <History className="w-5 h-5 text-[#0d4f4a]" />
            Lịch Sử Thao Tác Hệ Thống (Audit Trail)
          </h2>
          <div className="divide-y divide-stone-100 max-h-[420px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                Chưa có thao tác mới. Hệ thống sẽ tự động ghi lại lịch sử khi có hoạt động.
              </div>
            ) : (
              logs.map((item) => (
                <div key={item.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">{item.userName || "System Admin"}</span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(item.createdAt).toLocaleTimeString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono font-bold">
                      {item.action}
                    </span>
                    <span className="text-stone-500">{item.entity}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
