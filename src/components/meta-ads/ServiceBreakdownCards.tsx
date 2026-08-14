"use client";

import { useMemo } from "react";
import { MetaCampaignRow } from "@/app/admin/meta-ads/page";
import { Sparkles, Layers, ShieldCheck, Stethoscope } from "lucide-react";

import { detectService } from "@/lib/meta-detection";

interface ServiceBreakdownCardsProps {
  campaigns: MetaCampaignRow[];
}

export function detectServiceKey(row: MetaCampaignRow): "IMP" | "SU" | "NIENG" | "TH" {
  const service = detectService(row);
  if (service === "Implant") return "IMP";
  if (service === "Răng sứ") return "SU";
  if (service === "Niềng răng") return "NIENG";
  return "TH";
}

export default function ServiceBreakdownCards({ campaigns }: ServiceBreakdownCardsProps) {
  const serviceStats = useMemo(() => {
    const map: Record<string, { spend: number; messages: number; leads: number; count: number }> = {
      IMP: { spend: 0, messages: 0, leads: 0, count: 0 },
      SU: { spend: 0, messages: 0, leads: 0, count: 0 },
      TH: { spend: 0, messages: 0, leads: 0, count: 0 },
      NIENG: { spend: 0, messages: 0, leads: 0, count: 0 },
    };

    campaigns.forEach((row) => {
      const key = detectServiceKey(row);
      map[key].spend += row.spend || 0;
      map[key].messages += row.messagesNew || 0;
      map[key].leads += row.leads || 0;
      map[key].count += 1;
    });

    const definitions: Array<{
      key: "IMP" | "SU" | "TH" | "NIENG";
      code: string;
      name: string;
      fullName: string;
      icon: any;
      colorTheme: {
        bg: string;
        border: string;
        text: string;
        badgeBg: string;
        badgeText: string;
      };
    }> = [
      {
        key: "IMP",
        code: "IMP",
        name: "Trồng răng Implant",
        fullName: "Dịch vụ Trồng Răng Implant",
        icon: Stethoscope,
        colorTheme: {
          bg: "bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent",
          border: "border-indigo-500/20",
          text: "text-indigo-900",
          badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
          badgeText: "text-indigo-700",
        },
      },
      {
        key: "SU",
        code: "SỨ",
        name: "Răng sứ thẩm mỹ",
        fullName: "Dịch vụ Bọc Răng Sứ & Veneer",
        icon: Sparkles,
        colorTheme: {
          bg: "bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent",
          border: "border-purple-500/20",
          text: "text-purple-900",
          badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
          badgeText: "text-purple-700",
        },
      },
      {
        key: "TH",
        code: "TH",
        name: "Nha khoa tổng hợp",
        fullName: "Dịch vụ Nha Khoa Tổng Hợp",
        icon: Layers,
        colorTheme: {
          bg: "bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent",
          border: "border-teal-500/20",
          text: "text-teal-900",
          badgeBg: "bg-teal-100 text-teal-800 border-teal-200",
          badgeText: "text-teal-700",
        },
      },
      {
        key: "NIENG",
        code: "NIỀNG",
        name: "Niềng răng & Chỉnh nha",
        fullName: "Dịch vụ Niềng Răng & Chỉnh Nha",
        icon: ShieldCheck,
        colorTheme: {
          bg: "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent",
          border: "border-amber-500/20",
          text: "text-amber-900",
          badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
          badgeText: "text-amber-700",
        },
      },
    ];

    return definitions.map((def) => {
      const data = map[def.key];
      const spend = data.spend;
      const messages = data.messages;
      const leads = data.leads;
      const cptn = messages > 0 ? spend / messages : 0;
      const cpl = leads > 0 ? spend / leads : 0;

      return {
        ...def,
        spend,
        messages,
        cptn,
        leads,
        cpl,
        campaignCount: data.count,
      };
    });
  }, [campaigns]);

  return (
    <div className="space-y-4 font-mono">
      {/* Header section title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-sans text-stone-900 flex items-center gap-2">
            <span>Báo Cảnh Hiệu Suất Theo Card Dịch Vụ Nha Khoa</span>
            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px]">
              IMP • SỨ • TH • NIỀNG
            </span>
          </h3>
          <p className="text-[11px] text-stone-500 font-sans mt-0.5">
            Phân tích chi tiết Chi phí, Tin nhắn mới, CP/TN mới, KHTN &amp; CP/KHTN theo 4 nhóm dịch vụ chính.
          </p>
        </div>
      </div>

      {/* 4 Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {serviceStats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={`${item.colorTheme.bg} p-5 rounded-2xl border ${item.colorTheme.border} shadow-2xs space-y-3 relative overflow-hidden`}
            >
              {/* Top Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${item.colorTheme.badgeBg}`}>
                    {item.code}
                  </span>
                  <span className="text-xs font-bold text-stone-900 font-sans">{item.name}</span>
                </div>
                <Icon size={18} className={item.colorTheme.badgeText} />
              </div>

              {/* Chi phí */}
              <div>
                <p className="text-[11px] text-stone-500 font-sans">Chi phí</p>
                <p className="text-lg font-bold text-stone-900 font-sans">
                  {item.spend.toLocaleString("vi-VN")} ₫
                </p>
              </div>

              {/* Metrics Grid: Tin nhắn mới | CP / Tin nhắn mới | KHTN | CP / KHTN */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-stone-200/60">
                <div className="p-2 bg-white/80 rounded-xl border border-stone-100">
                  <span className="text-stone-500 block text-[10px]">Tin nhắn mới:</span>
                  <strong className="text-stone-900 text-xs">{item.messages.toLocaleString("vi-VN")}</strong>
                </div>

                <div className="p-2 bg-white/80 rounded-xl border border-stone-100">
                  <span className="text-stone-500 block text-[10px]">CP / TN mới:</span>
                  <strong className={`text-xs font-bold ${item.colorTheme.badgeText}`}>
                    {Math.round(item.cptn).toLocaleString("vi-VN")} ₫
                  </strong>
                </div>

                <div className="p-2 bg-white/80 rounded-xl border border-stone-100">
                  <span className="text-stone-500 block text-[10px]">KHTN (Leads):</span>
                  <strong className="text-stone-900 text-xs">{item.leads.toLocaleString("vi-VN")}</strong>
                </div>

                <div className="p-2 bg-white/80 rounded-xl border border-stone-100">
                  <span className="text-stone-500 block text-[10px]">CP / KHTN:</span>
                  <strong className={`text-xs font-bold ${item.colorTheme.badgeText}`}>
                    {Math.round(item.cpl).toLocaleString("vi-VN")} ₫
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Comparison Table for the 4 Services */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-800 font-sans uppercase tracking-wider">
            BẢNG THỐNG KÊ DỊCH VỤ DƯỚI CARD CHI PHÍ &amp; TIN NHẮN (IMP - SỨ - TH - NIỀNG)
          </h4>
          <span className="text-[11px] text-stone-500 font-mono">
            Tổng cộng: {campaigns.length} chiến dịch
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-100/70 text-stone-600 border-b border-stone-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-bold">Mã Dịch Vụ</th>
                <th className="py-2.5 px-4 font-bold">Tên Dịch Vụ</th>
                <th className="py-2.5 px-4 font-bold text-right">Chi Phí</th>
                <th className="py-2.5 px-4 font-bold text-right">Tin Nhắn Mới</th>
                <th className="py-2.5 px-4 font-bold text-right">Chi Phí / TN Mới</th>
                <th className="py-2.5 px-4 font-bold text-right">KHTN (Leads)</th>
                <th className="py-2.5 px-4 font-bold text-right">Chi Phí / KHTN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {serviceStats.map((row) => (
                <tr key={row.key} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${row.colorTheme.badgeBg}`}>
                      {row.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans font-bold text-stone-900">{row.name}</td>
                  <td className="py-3 px-4 text-right font-bold text-stone-900">
                    {row.spend.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="py-3 px-4 text-right">{row.messages.toLocaleString("vi-VN")}</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-700">
                    {Math.round(row.cptn).toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-800">
                    {row.leads.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    {Math.round(row.cpl).toLocaleString("vi-VN")} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
