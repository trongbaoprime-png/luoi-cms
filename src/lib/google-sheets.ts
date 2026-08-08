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

        let rawCheckinDate = r.checkinDate || (r.appointmentDate ? r.appointmentDate : "");

        if (!isDathen) {
          const targetYearMonth = `${year}-${String(m).padStart(2, "0")}`;
          if (rawCheckinDate && /^\d{4}-\d{2}-\d{2}$/.test(rawCheckinDate)) {
            const dayPart = rawCheckinDate.slice(8, 10);
            rawCheckinDate = `${targetYearMonth}-${dayPart}`;
          } else {
            rawCheckinDate = `${targetYearMonth}-01`;
          }
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

        let status = parsed.status;
        if (isDathen) {
          status = "QUALIFIED";
        } else if (r.pass === 1 || r.result === "Đậu") {
          status = "PURCHASE";
        } else if (r.checkin === 1 || r.result === "Rớt" || r.checkinDate) {
          status = "CHECKIN";
        }

        parsedRecords.push({ r, parsed, phoneHash, status, isDathen });
      }

      // 2. Perform High-Speed Chunk Processing
      const CHUNK_SIZE = 500;
      for (let cIdx = 0; cIdx < parsedRecords.length; cIdx += CHUNK_SIZE) {
        const chunk = parsedRecords.slice(cIdx, cIdx + CHUNK_SIZE);
        const phonesInChunk = chunk.map(item => item.parsed.phone);

        const existingLeadsInDb = await db.cRMLead.findMany({
          where: { phone: { in: phonesInChunk } },
        });

        const existingMap = new Map(existingLeadsInDb.map(l => [l.phone, l]));

        const newLeadsToInsert: any[] = [];

        for (const item of chunk) {
          const { r, parsed, phoneHash, status, isDathen } = item;
          const existing = existingMap.get(parsed.phone);

          if (existing) {
            const updatedName = isRealName(parsed.fullName)
              ? String(parsed.fullName)
              : (isRealName(existing.fullName) ? existing.fullName : parsed.fullName || existing.fullName);

            await db.cRMLead.update({
              where: { id: existing.id },
              data: {
                fullName: updatedName,
                source: String(parsed.source || existing.source),
                sourceGroup: String(parsed.sourceGroup || existing.sourceGroup),
                telesale: String(parsed.telesale || existing.telesale),
                branch: String(parsed.branch || existing.branch),
                branchGroup: String(parsed.branchGroup || existing.branchGroup),
                service: String(parsed.service || existing.service),
                serviceGroup: String(parsed.serviceGroup || existing.serviceGroup),
                checkinDate: String(parsed.checkinDate || existing.checkinDate),
                isMonthNote: parsed.isMonthNote ?? existing.isMonthNote,
                result: String(r.result || parsed.result || existing.result),
                isOldCustomer: parsed.isOldCustomer ?? existing.isOldCustomer,
                isKoMkt: parsed.isKoMkt ?? existing.isKoMkt,
                isVietKieu: parsed.isVietKieu ?? existing.isVietKieu,
                isNN: parsed.isNN ?? existing.isNN,
                revenue: Number(r.revenue || parsed.revenue || existing.revenue),
                actualRevenue: Number(r.actualRevenue || parsed.actualRevenue || existing.actualRevenue),
                caTheoRevenue: Number(r.caTheoRevenue || parsed.caTheoRevenue || existing.caTheoRevenue),
                status,
                ref: getPriorityRef(existing.ref, isDathen ? "App" : "Checkin"),
              },
            });
          } else {
            const newName = parsed.fullName
              ? String(parsed.fullName)
              : `${isDathen ? "Khách Đặt Hẹn" : "Khách"} ${r.telesale || "TDS"}`;

            newLeadsToInsert.push({
              fullName: newName,
              phone: String(parsed.phone),
              phoneHash,
              source: String(parsed.source),
              sourceGroup: String(parsed.sourceGroup),
              telesale: String(parsed.telesale),
              branch: String(parsed.branch),
              branchGroup: String(parsed.branchGroup),
              service: String(parsed.service),
              serviceGroup: String(parsed.serviceGroup),
              checkinDate: String(parsed.checkinDate),
              isMonthNote: parsed.isMonthNote,
              result: String(r.result || parsed.result),
              isOldCustomer: parsed.isOldCustomer,
              isKoMkt: parsed.isKoMkt,
              isVietKieu: parsed.isVietKieu,
              isNN: parsed.isNN,
              revenue: Number(r.revenue || parsed.revenue || 0),
              actualRevenue: Number(r.actualRevenue || parsed.actualRevenue || 0),
              caTheoRevenue: Number(r.caTheoRevenue || parsed.caTheoRevenue || 0),
              status,
              ref: isDathen ? "App" : "Checkin",
            });
          }

          monthSyncedCount++;
        }

        if (newLeadsToInsert.length > 0) {
          await db.cRMLead.createMany({
            data: newLeadsToInsert,
          });
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
