"use client";

import { useState, useEffect } from "react";
import { Mail, Trash2, CheckCircle2, Clock } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AdminInboxPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const fetchMessages = () => {
    fetch("/api/admin/contacts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMessages(data.data);
      });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkRead = async (id: string) => {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "READ" }),
    });
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa tin nhắn này?")) return;
    await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    fetchMessages();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Mail className="w-6 h-6 text-[#0d9488]" />
          Hòm Thư Liên Hệ ({messages.length})
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-stone-400">Chưa có tin nhắn mới nào.</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 transition-colors ${
                msg.status === "UNREAD" ? "bg-amber-50/40" : "bg-white hover:bg-stone-50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900">{msg.name}</h3>
                    <span className="text-xs text-stone-500 font-mono">({msg.email})</span>
                    {msg.status === "UNREAD" ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Chưa đọc
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã đọc
                      </span>
                    )}
                  </div>
                  {msg.subject && <p className="text-sm font-semibold text-stone-700 mt-1">{msg.subject}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {msg.status === "UNREAD" && (
                    <button
                      onClick={() => handleMarkRead(msg.id)}
                      className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded hover:bg-stone-200"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-stone-600 mt-2 bg-stone-50/80 p-3 rounded border border-stone-100 whitespace-pre-wrap">
                {msg.message}
              </p>
              <div className="text-xs text-stone-400 mt-2 flex items-center gap-4">
                <span>Gửi ngày: {new Date(msg.createdAt).toLocaleString("vi-VN")}</span>
                {msg.ipAddress && <span>IP: {msg.ipAddress}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
