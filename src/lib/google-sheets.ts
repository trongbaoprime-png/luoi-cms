import { crmDb } from "@/lib/crm-db";
import { db } from "@/lib/db";
import { parseTdsPayload, isRealName, getPriorityRef } from "@/lib/tds-parser";
import { hashPhone } from "@/lib/meta-capi";

export interface SheetLeadPayload {
  leadId: string;
  fullName: string;
  phone: string;
  email?: string;
  source: string;
  status: string;
  createdAt: string;
  note?: string;
}

export const DEFAULT_TDS_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzvgZOK2BUB84mZDDE28icogiLbcVy8L5zK1kp_99Wwv_KqUp-Ns6i770qSpLd9P0I/exec";

/**
 * Push new lead row to Google Sheets via Webhook
 */
export async function pushLeadToGoogleSheet(payload: SheetLeadPayload) {
  try {
    const sheetSetting = await db.setting.findUnique({
      where: { key: "google_sheet_webhook_url" },
    });

    if (!sheetSetting || !sheetSetting.value) {
      return { success: false, message: "Chưa cấu hình Google Sheet Webhook URL trong Cài Đặt." };
    }

    const res = await fetch(sheetSetting.value, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return { success: res.ok };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Sync to sheet failed";
    return { success: false, error: errorMsg };
  }
}

/**
 * High-speed sync of all 15 Telesale Sheets + DATHEN Sheet into miniCRM Database.
 * Supports multi-month ingestion (e.g. Months [6, 7, 8]).
 */
export async function syncAllTdsSheets(monthsToSync?: number[], yearNum?: number) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const defaultMonths: number[] = [];
  for (let m = 4; m <= currentMonth; m++) {
    defaultMonths.push(m);
  }
  const targetMonths = monthsToSync && monthsToSync.length > 0 ? monthsToSync : defaultMonths;
  const year = yearNum || 2026;

  // 1. Fetch configured Apps Script Webhook URL or use default TDS endpoint
  const urlSetting = await db.setting.findUnique({
    where: { key: "tds_apps_script_url" },
  });
  const endpoint = urlSetting?.value || DEFAULT_TDS_APPS_SCRIPT_URL;

  let totalSynced = 0;
  let totalErrors = 0;
  const logs: Array<{ name: string; status: string; count: number; message: string }> = [];

  for (const m of targetMonths) {
    const sheetName = `${String(m).padStart(2, "0")}.${String(year).slice(-2)}`;
    try {
      const fetchUrl = `${endpoint}?month=${m}&t=${Date.now()}`;
      const res = await fetch(fetchUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        redirect: "follow",
      });

      if (!res.ok) {
        totalErrors++;
        logs.push({ name: `Tháng ${m}`, status: "❌", count: 0, message: `Lỗi kết nối Apps Script HTTP ${res.status}` });
        continue;
      }

      const text = await res.text();
      let payload: any = null;
      try {
        payload = JSON.parse(text);
      } catch {
        totalErrors++;
        logs.push({ name: `Tháng ${m}`, status: "⚠️", count: 0, message: `Tháng ${m} đang tính toán lại trên Apps Script (Vui lòng bấm lại sau)` });
        continue;
      }

      if (!payload || !payload.records || !Array.isArray(payload.records)) {
        logs.push({ name: `Tháng ${m}`, status: "⚠️", count: 0, message: `Không có dữ liệu trong tháng ${m}` });
        continue;
      }

      let monthSyncedCount = 0;
      const records = payload.records;

      // 1. Prepare parsed records in memory
      const parsedRecords: Array<{ r: any; parsed: any; phoneHash: string; status: string; isDathen: boolean }> = [];

      for (let idx = 0; idx < records.length; idx++) {
        const r = records[idx];
        const isDathen = String(r.type || "").toUpperCase() === "DATHEN";

        const nameFromCol = isDathen
          ? (r.colB || r.fullName || r.hoTen || r.name || "")
          : (r.colC || r.fullName || r.hoTen || r.name || "");
        const phoneFromCol = isDathen
          ? (r.colC || r.phone || r.so_dt || r.soDt || "")
          : (r.colD || r.phone || r.so_dt || r.soDt || "");

        const rawPhone = String(
          phoneFromCol ||
          r.phone || r.so_dt || r.soDt ||
          `09${String(m).padStart(2, "0")}${String(idx + 1).padStart(6, "0")}`
        ).trim();

        const rawName = (
          nameFromCol ||
          String(r.fullName || r.hoTen || r.ho_ten || r.customerName || r.name || "").trim()
        ).trim();

        // === PARSE CHECKIN DATE ===
        // Không ép year-month nếu date đã có đầy đủ YYYY-MM-DD từ sheet
        let rawCheckinDate = r.checkinDate || (r.appointmentDate ? r.appointmentDate : "");

        if (!isDathen && rawCheckinDate) {
          const trimmed = rawCheckinDate.trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            // Đã có YYYY-MM-DD đầy đủ → giữ nguyên, KHÔNG ép tháng sync
            rawCheckinDate = trimmed;
          } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
            // Dạng DD/MM/YYYY → convert
            const [d, mo, y] = trimmed.split("/");
            rawCheckinDate = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
          } else if (/^\d{1,2}\/\d{1,2}$/.test(trimmed)) {
            // Dạng D/M hoặc DD/MM (không có năm) → dùng năm-tháng sheet đang sync
            const [d, mo] = trimmed.split("/");
            rawCheckinDate = `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
          } else if (/^\d{1,2}$/.test(trimmed)) {
            // Chỉ có số ngày → dùng tháng sheet đang sync
            rawCheckinDate = `${year}-${String(m).padStart(2, "0")}-${trimmed.padStart(2, "0")}`;
          } else {
            // Không parse được → để trống
            rawCheckinDate = "";
          }
        } else if (!isDathen) {
          rawCheckinDate = "";
        }

        const parsed = parseTdsPayload({
          type: r.type,
          fullName: rawName,
          phone: rawPhone,
          colB: r.colB,
          colC: r.colC,
          colD: r.colD,
          colE: r.colE,
          colF: r.colF,
          colH: r.colH,
          colK: r.colK || r.koMkt,
          colL: r.colL,
          colM: r.colM,
          colN: r.colN || r.nnCustomer || r.vietKieuRevenue,
          source: r.source || r.sourceGroup,
          branch: r.branch || r.branchGroup,
          service: r.service || r.serviceGroup,
          telesale: r.telesale,
          checkinDate: rawCheckinDate,
          revenueStr: r.revenue,
          actualRevenueStr: r.actualRevenue,
          colO: r.oldCustomer || r.appointmentOld ? "OLD" : "",
        });

        const phoneHash = hashPhone(parsed.phone);

        // Xác định status dựa trên dữ liệu thực từ sheet
        let status = parsed.status;
        if (isDathen) {
          status = "QUALIFIED";
        } else if (r.pass === 1 || r.result === "Đậu") {
          status = "PURCHASE";
        } else if (r.checkin === 1 || r.checkinDate || rawCheckinDate) {
          status = "CHECKIN";
        }

        parsedRecords.push({ r, parsed, phoneHash, status, isDathen });
      }

      // === UPSERT: phone là anchor duy nhất ===
      // - phone tồn tại → UPDATE trạng thái (checkinDate, checkinMonth, status, revenue, result...)
      // - phone chưa có → CREATE mới
      // - Không bao giờ tạo duplicate theo phone
      const CHUNK_SIZE = 200;
      const syncMonthStr = `${year}-${String(m).padStart(2, "0")}`;

      for (let cIdx = 0; cIdx < parsedRecords.length; cIdx += CHUNK_SIZE) {
        const chunk = parsedRecords.slice(cIdx, cIdx + CHUNK_SIZE);

        for (const item of chunk) {
          const { r, parsed, phoneHash, status, isDathen } = item;
          const checkinDate = parsed.checkinDate || "";
          const checkinMonth = checkinDate.length >= 7 ? checkinDate.slice(0, 7) : syncMonthStr;
          const revenue = Number(r.revenue || parsed.revenue || 0);
          const actualRevenue = Number(r.actualRevenue || parsed.actualRevenue || 0);
          const caTheoRevenue = Number(r.caTheoRevenue || parsed.caTheoRevenue || 0);

          try {
            await (crmDb.cRMLead as any).upsert({
              where: { phone: String(parsed.phone) },

              // Phone tồn tại → chỉ CẬP NHẬT trạng thái & thông tin mới
              update: {
                // Tên: chỉ cập nhật nếu tên mới hợp lệ
                ...(isRealName(parsed.fullName) ? { fullName: String(parsed.fullName) } : {}),
                // Trạng thái hành trình: nâng cấp trạng thái (PURCHASE > CHECKIN > QUALIFIED)
                status,
                ...(checkinDate ? { checkinDate, checkinMonth: checkinDate.slice(0, 7) } : {}),
                isMonthNote: Boolean(parsed.isMonthNote),
                result: parsed.result || undefined,
                // Thông tin liên hệ & phân loại
                telesale: String(parsed.telesale || "Chưa gán"),
                branch: String(parsed.branch || ""),
                branchGroup: String(parsed.branchGroup || ""),
                service: String(parsed.service || ""),
                serviceGroup: String(parsed.serviceGroup || ""),
                isOldCustomer: Boolean(parsed.isOldCustomer),
                // Doanh thu
                revenue,
                actualRevenue,
                caTheoRevenue,
                ref: isDathen ? "App" : "Checkin",
              },

              // Phone chưa có → TẠO MỚI hoàn chỉnh
              create: {
                phone: String(parsed.phone),
                phoneHash,
                fullName: String(parsed.fullName || "Khách"),
                source: String(parsed.source || "TDS_EXCEL"),
                sourceGroup: String(parsed.sourceGroup || "Khác"),
                telesale: String(parsed.telesale || "Chưa gán"),
                branch: String(parsed.branch || ""),
                branchGroup: String(parsed.branchGroup || ""),
                service: String(parsed.service || ""),
                serviceGroup: String(parsed.serviceGroup || ""),
                checkinDate,
                checkinMonth,
                isMonthNote: Boolean(parsed.isMonthNote),
                result: String(parsed.result || ""),
                isOldCustomer: Boolean(parsed.isOldCustomer),
                revenue,
                actualRevenue,
                caTheoRevenue,
                status,
                ref: isDathen ? "App" : "Checkin",
              },
            });
          } catch {
            // Bỏ qua lỗi race condition — phone đã được xử lý
          }

          monthSyncedCount++;
        }
      }


      totalSynced += monthSyncedCount;
      logs.push({ name: `Tháng ${m} (${sheetName})`, status: "✅", count: monthSyncedCount, message: `Đã nạp ${monthSyncedCount} dòng` });
    } catch (err: unknown) {
      totalErrors++;
      const msg = err instanceof Error ? err.message : "Lỗi nạp tháng";
      logs.push({ name: `Tháng ${m}`, status: "❌", count: 0, message: msg });
    }
  }

  return {
    success: true,
    sheetName: targetMonths.map((m) => `${String(m).padStart(2, "0")}.${String(year).slice(-2)}`).join(", "),
    totalSynced,
    totalErrors,
    logs,
  };
}
