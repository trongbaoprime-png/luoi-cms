"use client";

import "@puckeditor/core/dist/index.css";

/* ── Puck panel scroll fix ─────────────────────────────────────────────────
   Puck sidebar nội bộ dùng overflow:hidden, khiến panel blocks bên trái
   không scroll được khi có nhiều blocks. Override để enable scroll.
──────────────────────────────────────────────────────────────────────────── */
import "./puck-scroll.css";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Loader2, CheckCircle2 } from "lucide-react";

// Dynamically import Puck to avoid SSR issues
import dynamic from "next/dynamic";

const PuckEditor = dynamic(
  () => import("@puckeditor/core").then((m) => m.Puck),
  { ssr: false, loading: () => <PuckLoadingScreen /> }
);

function PuckLoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-stone-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto" />
        <p className="text-sm font-semibold text-stone-600">Đang tải Page Builder...</p>
      </div>
    </div>
  );
}

export default function PuckBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "home";

  const [puckConfig, setPuckConfig] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(undefined);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load puck config and shortcodes
  useEffect(() => {
    Promise.all([
      fetch("/api/shortcode-blocks").then((r) => r.json()),
      import("@/lib/puck-config"),
    ])
      .then(([blocksRes, m]) => {
        let options: { label: string; value: string }[] = [];
        if (blocksRes?.blocks) {
          options = blocksRes.blocks.map((b: any) => ({
            label: `${b.name} (${b.type})`,
            value: b.key,
          }));
        }
        setPuckConfig(m.getPuckConfig(options));
      })
      .catch((err) => {
        console.error("Failed to load shortcodes", err);
        import("@/lib/puck-config").then((m) => {
          setPuckConfig(m.getPuckConfig([]));
        });
      });
  }, []);

  // Load saved layout from API
  useEffect(() => {
    fetch(`/api/builder/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        setInitialData(res.data || { content: [], root: {} });
      })
      .catch(() => {
        setInitialData({ content: [], root: {} });
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handlePublish = useCallback(async (data: any) => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/builder/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Lưu thất bại:", err);
    } finally {
      setSaving(false);
    }
  }, [slug]);

  if (loading || !puckConfig || initialData === undefined) {
    return <PuckLoadingScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-stone-50 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-stone-200 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Quản Lý Trang</span>
          </Link>
          <span className="text-stone-300">|</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0d9488]" />
            <span className="text-xs font-bold text-slate-800">
              Đang chỉnh sửa: <span className="text-[#0d9488]">/{slug}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#0d9488] transition-colors px-3 py-1.5 rounded-lg border border-stone-200 hover:border-[#0d9488]"
          >
            <Eye size={14} />
            <span>Xem Trang</span>
          </a>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 size={14} />
              Đã lưu!
            </span>
          )}
        </div>
      </div>

      {/* Puck Editor */}
      <div className="flex-1 overflow-hidden">
        <PuckEditor
          config={puckConfig}
          data={initialData}
          onPublish={handlePublish}
          overrides={{
            headerActions: ({ children }) => (
              <div className="flex items-center gap-2">
                {children}
                {saving && <Loader2 size={16} className="animate-spin text-stone-500" />}
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
