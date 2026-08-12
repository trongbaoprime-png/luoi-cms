import { crmDb } from "@/lib/crm-db";
import { db } from "@/lib/db";
import {
  parseTdsPayload,
  isRealName,
  getPriorityRef,
  normalizeSource,
  getSourceGroup,
  normalizeBranch,
  getBranchGroup,
  normalizeService,
  getServiceGroup,
  normalizeTelesale,
} from "@/lib/tds-parser";
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

export const SALE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1OFV2VM_KbCHZUFTZ-qgrmcC0FTxfs7HPoMeGMU_d4So/gviz/tq?tqx=out:json&sheet=SALE";

export function parseSheetDate(rawVal: any, formattedVal?: string): Date {
  if (formattedVal) {
    const match = String(formattedVal).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (match) {
      const [_, d, m, y, h = "0", min = "0", s = "0"] = match;
      return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s));
    }
  }
  const strVal = String(rawVal || "");
  if (strVal.startsWith("Date(")) {
    const parts = strVal.replace("Date(", "").replace(")", "").split(",").map(Number);
    if (parts.length >= 3) {
      return new Date(parts[0], parts[1], parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0);
    }
  }
  const parsed = new Date(strVal);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Synchronize Qualify leads from Google Sheet "SALE" (Rows B6:J) into miniCRM Database.
 * All leads are assigned status "QUALIFIED". Deduplicates by phone number.
 * Default minMonth = 3 (March 2026 onwards).
 */
export async function syncSaleSheet(minMonth: number = 3) {
  try {
    const res = await fetch(`${SALE_SHEET_URL}&t=${Date.now()}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });

    if (!res.ok) {
      return { success: false, message: `Lỗi kết nối Google Sheet HTTP ${res.status}` };
    }

    const text = await res.text();
    const jsonStr = text.substring(47, text.length - 2);
    const data = JSON.parse(jsonStr);
    const rows = data.table?.rows || [];

    const leadMap = new Map<string, {
      phone: string;
      fullName: string;
      source: string;
      sourceGroup: string;
      branch: string;
      branchGroup: string;
      service: string;
      serviceGroup: string;
      telesale: string;
      createdAt: Date;
    }>();

    for (let i = 4; i < rows.length; i++) {
      const c = rows[i]?.c;
      if (!c) continue;

      let phone = String(c[3]?.v || "").trim().replace(/\D/g, "");
      if (phone.length === 9 && !phone.startsWith("0")) phone = "0" + phone;
      if (!phone || phone.length < 8) continue;

      const createdAt = parseSheetDate(c[1]?.v, c[1]?.f);
      // Lọc từ tháng 3 năm 2026 trở đi
      if (createdAt.getFullYear() === 2026 && (createdAt.getMonth() + 1) < minMonth) {
        continue;
      }

      const rawName = String(c[2]?.v || "").trim();
      const rawSource = String(c[4]?.v || "").trim();
      const rawBranch = String(c[5]?.v || "").trim();
      const rawService = String(c[6]?.v || "").trim();
      const rawTelesale = String(c[9]?.v || "").trim();

      const source = normalizeSource(rawSource);
      const sourceGroup = getSourceGroup(source);
      const branch = normalizeBranch(rawBranch);
      const branchGroup = getBranchGroup(branch);
      const service = normalizeService(rawService);
      const serviceGroup = getServiceGroup(service);
      const telesale = normalizeTelesale(rawTelesale);

      if (!leadMap.has(phone)) {
        leadMap.set(phone, {
          phone,
          fullName: isRealName(rawName) ? rawName : "Khách",
          source,
          sourceGroup,
          branch,
          branchGroup,
          service,
          serviceGroup,
          telesale,
          createdAt,
        });
      }
    }

    const uniqueLeads = Array.from(leadMap.values());
    let totalSynced = 0;
    const CHUNK_SIZE = 100;

    for (let idx = 0; idx < uniqueLeads.length; idx += CHUNK_SIZE) {
      const chunk = uniqueLeads.slice(idx, idx + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (item) => {
          const phoneHash = hashPhone(item.phone);
          try {
            await (crmDb.cRMLead as any).upsert({
              where: { phone: item.phone },
              update: {
                fullName: item.fullName,
                source: item.source,
                sourceGroup: item.sourceGroup,
                branch: item.branch,
                branchGroup: item.branchGroup,
                service: item.service,
                serviceGroup: item.serviceGroup,
                telesale: item.telesale,
                createdAt: item.createdAt,
                ref: "SALE_SHEET",
              },
              create: {
                phone: item.phone,
                phoneHash,
                fullName: item.fullName,
                source: item.source,
                sourceGroup: item.sourceGroup,
                branch: item.branch,
                branchGroup: item.branchGroup,
                service: item.service,
                serviceGroup: item.serviceGroup,
                telesale: item.telesale,
                status: "QUALIFIED",
                ref: "SALE_SHEET",
                createdAt: item.createdAt,
              },
            });
            totalSynced++;
          } catch {
            // Ignore race conditions
          }
        })
      );
    }

    return {
      success: true,
      sheetName: "SALE (Tháng 3 trở đi)",
      totalSynced,
      totalRawRows: Math.max(0, rows.length - 4),
      totalUniqueLeads: uniqueLeads.length,
      message: `Đã đồng bộ ${totalSynced} Khách Qualify (từ Tháng 03/2026 trở đi) từ Sheet SALE vào CRM`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Sync SALE sheet failed";
    return { success: false, error: errorMsg };
  }
}
