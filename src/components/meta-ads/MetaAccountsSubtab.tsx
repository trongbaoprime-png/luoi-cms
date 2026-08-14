"use client";

import { CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

interface AccountItem {
  account_id: string;
  account_name?: string;
  account_status?: number;
  currency?: string;
  timezone_name?: string;
  spend?: number;
  messagesNew?: number;
  leads?: number;
}

interface MetaAccountsSubtabProps {
  accounts: AccountItem[];
  metrics: {
    spend: number;
    messages: number;
    leads: number;
    cptn: number;
    cpl: number;
  };
}

export default function MetaAccountsSubtab({ accounts, metrics }: MetaAccountsSubtabProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-stone-900 font-sans">
            Danh Sách &amp; Hiệu Suất Tài Khoản Quảng Cáo Meta
          </h3>
          <p className="text-[11px] text-stone-500">
            Quản trị trạng thái hoạt động, tiền tệ, tổng chi tiêu &amp; chỉ số chuyển đổi từng tài khoản Meta Ads.
          </p>
        </div>
        <span className="text-xs font-bold text-[#0d4f4a] bg-[#0d4f4a]/10 px-3 py-1 rounded-xl">
          {accounts.length} Tài khoản
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-100/80 text-stone-700 font-bold">
              <th className="p-3">Tên Tài khoản</th>
              <th className="p-3">ID Tài khoản</th>
              <th className="p-3 text-right">Tổng Chi tiêu</th>
              <th className="p-3 text-right">TN mới</th>
              <th className="p-3 text-right">CP / TN</th>
              <th className="p-3 text-right">KHTN (Leads)</th>
              <th className="p-3 text-right">CPL</th>
              <th className="p-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-stone-400">
                  Chưa tìm thấy thông tin tài khoản quảng cáo.
                </td>
              </tr>
            ) : (
              accounts.map((acc, idx) => {
                const accSpend = acc.spend || metrics.spend;
                const accMessages = acc.messagesNew || metrics.messages;
                const accLeads = acc.leads || metrics.leads;
                const cptn = accMessages > 0 ? accSpend / accMessages : 0;
                const cpl = accLeads > 0 ? accSpend / accLeads : 0;

                return (
                  <tr key={idx} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#0d4f4a] shrink-0" />
                      <span>{acc.account_name || `Tài khoản ${acc.account_id}`}</span>
                    </td>
                    <td className="p-3 text-stone-500 font-mono">act_{acc.account_id}</td>
                    <td className="p-3 text-right font-bold text-stone-900">{accSpend.toLocaleString("vi-VN")} ₫</td>
                    <td className="p-3 text-right font-bold text-[#0d4f4a]">{accMessages.toLocaleString("vi-VN")}</td>
                    <td className="p-3 text-right font-bold">{Math.round(cptn).toLocaleString("vi-VN")} ₫</td>
                    <td className="p-3 text-right font-bold text-emerald-700">{accLeads.toLocaleString("vi-VN")}</td>
                    <td className="p-3 text-right font-bold">{Math.round(cpl).toLocaleString("vi-VN")} ₫</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Hoạt động</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
