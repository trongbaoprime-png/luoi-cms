import { PrismaClient } from '@prisma/client';
import {
  normalizeSource,
  getSourceGroup,
  normalizeBranch,
  getBranchGroup,
  normalizeService,
  getServiceGroup,
  normalizeTelesale,
  parseRevenueJ,
  parseMoney,
  isValidCaTheo,
  isRot,
  isDauValue,
  getResult,
  isKoMkt,
  isNguoiNuocNgoai,
  isVietKieu,
  isOldCustomerByColumnO,
  isMonthNoteH,
  isSpecificDateH,
  getCheckinDateKey,
  CONFIG_YEAR,
  normalizePhoneNumber,
  isRealName,
  getPriorityRef,
} from './src/lib/tds-parser';
import crypto from 'crypto';

const prisma = new PrismaClient();

const CONFIG = {
  year: 2026,
  telesales: [
    { name: 'XUÂN', url: 'https://docs.google.com/spreadsheets/d/1pxmzcZ3T0y28NeCGDqMBjWeGPDk-kc8eygb2PCBzp1U/' },
    { name: 'NHI', url: 'https://docs.google.com/spreadsheets/d/1ihTl-vYgtKUixWxBa5aZscwAUmQMz8MySmEZKuLhdK0/' },
    { name: 'QUYÊN', url: 'https://docs.google.com/spreadsheets/d/1UwXReFeX3UjK4izpQcjw09j28l7oRxVpAlEUhy7YDl8/' },
    { name: 'HẬU', url: 'https://docs.google.com/spreadsheets/d/1W-GmpqS6R8FrYtVEcN3BsxE4h989VUpoPHGqd16OwDQ/' },
    { name: 'TRANG', url: 'https://docs.google.com/spreadsheets/d/1_PQpFRDbROnxAi5-XPqn-jNGKSaNVJCMwesxqTX9CXk/' },
    { name: 'LIỄU', url: 'https://docs.google.com/spreadsheets/d/1gpd1_rY9nIewF_57fsh8grRi5I0XISjuYQXV8V1cAAE/' },
    { name: 'TRÂN', url: 'https://docs.google.com/spreadsheets/d/1PfhNKBLF5BvqLl2Crj4XKYo3JCw6KA5oKW51nYe6crU/' },
    { name: 'LOAN', url: 'https://docs.google.com/spreadsheets/d/1MBRu8GVxMU1Objo23VJCxBXT3nhcsVVS74Meu-VTky0/' },
    { name: 'SINH', url: 'https://docs.google.com/spreadsheets/d/1Og0jD71x-NguQ1RYi5i0WCX8B9ER_nXMMyg-PCGFnHc/' },
    { name: 'NHUNG', url: 'https://docs.google.com/spreadsheets/d/1CAbfidfSX1ODONN0EULnd7YP7eTyOdMVVLNU9iaxVqY/' },
    { name: 'THẢO', url: 'https://docs.google.com/spreadsheets/d/16_aBPIrzYJ69Y2qOlWLMJT--k67W4WHsBijBTjGeMgs/' },
    { name: 'HẠ', url: 'https://docs.google.com/spreadsheets/d/13_JfIxys9DxKjY_RpvB1O5FZXpddhW_j_SvH9SfE3HI/' },
    { name: 'TRÚC', url: 'https://docs.google.com/spreadsheets/d/104QyODw2m0wjqpG_hPMqZHT94h7xuc8XfktnCJgXyhM/' },
    { name: 'VI', url: 'https://docs.google.com/spreadsheets/d/11S3wvEoqMQZl9ahMGveQ3g4HZJ-pHG2XGvogf5mIvlU/' },
    { name: 'TELEVOI', url: 'https://docs.google.com/spreadsheets/d/1dCfOnW29zox7kODLhMi8mkNU2kEuEqhaKLwr_Odh9nQ/' }
  ]
};

function extractSpreadsheetId(url: string): string {
  const m = url.match(/\/d\/([^\/]+)/);
  return m ? m[1] : '';
}

function hashPhone(phone: string): string {
  return crypto.createHash('sha256').update(phone.trim()).digest('hex');
}

function getCellValue(cell: any): string {
  if (!cell) return '';
  if (cell.v === null || cell.v === undefined) return '';
  if (typeof cell.v === 'string' && cell.v.startsWith('Date(')) {
    const m = cell.v.match(/Date\((\d+),(\d+),(\d+)/);
    if (m) {
      const year = Number(m[1]);
      const month = String(Number(m[2]) + 1).padStart(2, '0');
      const day = String(Number(m[3])).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return cell.f || '';
  }
  return cell.f !== undefined && cell.f !== null ? String(cell.f).trim() : String(cell.v).trim();
}

function isHeaderOrGuideRow(cName: string, dPhone: string, eSource: string, fBranch: string, gService: string, hDate: string): boolean {
  if (!cName && !dPhone && !eSource && !fBranch && !gService && !hDate) return true;
  const cn = cName.toUpperCase();
  const dp = dPhone.toUpperCase();
  const es = eSource.toUpperCase();
  const fb = fBranch.toUpperCase();
  const gs = gService.toUpperCase();
  const hd = hDate.toUpperCase();

  if (cn.includes('HO TEN') || dp.includes('SO DT') || es === 'NGUON' || fb.includes('CHI NHANH') || gs === 'DVU') return true;
  if (hd.includes('NGAY') && hd.includes('CHECK')) return true;
  if (cn.includes('MUON NOTE') || dp.includes('MUON NOTE') || hd.includes('NGAY KHACH DEN')) return true;

  return false;
}

async function fetchSheetRows(spreadsheetId: string, sheetName: string): Promise<any[]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return [];
    const text = await res.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?\s*$/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[1]);
    return parsed?.table?.rows || [];
  } catch {
    return [];
  }
}

async function syncTelesalesForMonths(months: number[]) {
  console.log('=== SYNC TELESALES SHEETS VIA GVIZ API ===');
  console.log('Target Months:', months.join(', '));
  
  let totalIngested = 0;
  let totalUpdated = 0;
  let totalCreated = 0;
  
  for (const m of months) {
    const sheetName = `${String(m).padStart(2, '0')}.${String(CONFIG.year).slice(-2)}`;
    console.log(`\nProcessing Month ${m} (${sheetName})...`);
    
    let monthIngested = 0;
    
    for (const ts of CONFIG.telesales) {
      const ssId = extractSpreadsheetId(ts.url);
      if (!ssId) continue;
      
      const rows = await fetchSheetRows(ssId, sheetName);
      if (rows.length === 0) continue;
      
      let tsCount = 0;
      
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].c || [];
        
        // Col C = cell[2] (HỌ TÊN), Col D = cell[3] (SỐ ĐT)
        // Col E = cell[4] (NGUỒN), Col F = cell[5] (CHI NHÁNH), Col G = cell[6] (DVU)
        // Col H = cell[7] (NGÀY CHECK IN), Col I = cell[8] (QUYỀN), Col J = cell[9] (DOANH THU)
        // Col K = cell[10] (KO MKT), Col L = cell[11] (CA THEO), Col M = cell[12] (THỰC THU)
        // Col N = cell[13] (VK/NN), Col O = cell[14] (CŨ/MỚI), Col P = cell[15] (CTKM)
        
        const rawName = getCellValue(cells[2]);
        const rawPhone = getCellValue(cells[3]);
        const rawSource = getCellValue(cells[4]);
        const rawBranch = getCellValue(cells[5]);
        const rawService = getCellValue(cells[6]);
        const rawCheckinH = getCellValue(cells[7]);
        const rawTelesaleI = getCellValue(cells[8]) || ts.name;
        const rawRevJ = getCellValue(cells[9]);
        const rawKoMktK = getCellValue(cells[10]);
        const rawCaTheoL = getCellValue(cells[11]);
        const rawActualM = getCellValue(cells[12]);
        const rawVkNnN = getCellValue(cells[13]);
        const rawOldNewO = getCellValue(cells[14]);
        const rawCtkmP = getCellValue(cells[15]);
        
        if (isHeaderOrGuideRow(rawName, rawPhone, rawSource, rawBranch, rawService, rawCheckinH)) {
          continue;
        }
        
        if (!rawName && !rawPhone) continue;
        
        const rawCleanPhone = normalizePhoneNumber(rawPhone);
        const phone = rawCleanPhone || rawPhone || `TDS${m}_${ts.name}_${i + 1}`;
        const fullName = rawName || `Khách ${ts.name} #${i + 1}`;
        
        // Process Date according to TDS Month rule
        const targetYearMonth = `${CONFIG.year}-${String(m).padStart(2, '0')}`;
        let checkinDateKey = getCheckinDateKey(rawCheckinH, CONFIG.year);
        const hasMonthNote = isMonthNoteH(rawCheckinH);
        const hasSpecificDate = isSpecificDateH(rawCheckinH);
        
        if (checkinDateKey && /^\d{4}-\d{2}-\d{2}$/.test(checkinDateKey)) {
          const dayPart = checkinDateKey.slice(8, 10);
          checkinDateKey = `${targetYearMonth}-${dayPart}`;
        } else {
          checkinDateKey = `${targetYearMonth}-01`;
        }
        
        const source = normalizeSource(rawSource || 'Chưa rõ');
        const sourceGroup = getSourceGroup(source);
        const branch = normalizeBranch(rawBranch || 'Chưa rõ');
        const branchGroup = getBranchGroup(branch);
        const service = normalizeService(rawService || 'Chưa rõ');
        const serviceGroup = getServiceGroup(service);
        const telesale = normalizeTelesale(rawTelesaleI);
        
        const revenue = parseRevenueJ(rawRevJ);
        const actualRevenue = parseMoney(rawActualM);
        const caTheoRevenue = isValidCaTheo(rawCaTheoL) ? parseMoney(rawCaTheoL) : 0;
        
        const isOldCustomer = isOldCustomerByColumnO(rawOldNewO);
        const isKoMktVal = isKoMkt(rawKoMktK);
        const isNNVal = isNguoiNuocNgoai(rawVkNnN);
        const isVKVal = isVietKieu(rawVkNnN, phone);
        
        const checkin = hasSpecificDate ? 1 : 0;
        const result = getResult(rawRevJ, checkin);
        
        let status: 'CHECKIN' | 'PURCHASE' | 'QUALIFIED' = 'QUALIFIED';
        if (checkin === 1 || hasMonthNote) {
          if (result === 'Đậu' && revenue > 0) {
            status = 'PURCHASE';
          } else {
            status = 'CHECKIN';
          }
        }
        
        const phoneHash = hashPhone(phone);
        const existing = await prisma.cRMLead.findFirst({
          where: { phone },
        });

        if (existing) {
          const updatedName = isRealName(fullName)
            ? fullName
            : (isRealName(existing.fullName) ? existing.fullName : fullName);
          
          await prisma.cRMLead.update({
            where: { id: existing.id },
            data: {
              fullName: updatedName,
              source,
              sourceGroup,
              telesale,
              branch,
              branchGroup,
              service,
              serviceGroup,
              checkinDate: checkinDateKey,
              isMonthNote: hasMonthNote,
              result,
              isOldCustomer,
              isKoMkt: isKoMktVal,
              isVietKieu: isVKVal,
              isNN: isNNVal,
              revenue,
              actualRevenue,
              caTheoRevenue,
              status,
              ref: getPriorityRef(existing.ref, 'Checkin'),
            },
          });
          totalUpdated++;
        } else {
          await prisma.cRMLead.create({
            data: {
              fullName,
              phone,
              phoneHash,
              source,
              sourceGroup,
              telesale,
              branch,
              branchGroup,
              service,
              serviceGroup,
              checkinDate: checkinDateKey,
              isMonthNote: hasMonthNote,
              result,
              isOldCustomer,
              isKoMkt: isKoMktVal,
              isVietKieu: isVKVal,
              isNN: isNNVal,
              revenue,
              actualRevenue,
              caTheoRevenue,
              status,
              ref: 'Checkin',
            },
          });
          totalCreated++;
        }
        
        tsCount++;
        monthIngested++;
        totalIngested++;
      }
      
      console.log(`  - Telesale ${ts.name.padEnd(8)}: ${tsCount} rows ingested`);
    }
    
    console.log(`Month ${m} Total Ingested: ${monthIngested}`);
  }
  
  console.log('\n=== FINAL SUMMARY ===');
  console.log(`Total Ingested Rows: ${totalIngested}`);
  console.log(`Created: ${totalCreated}`);
  console.log(`Updated: ${totalUpdated}`);
  
  const totalDB = await prisma.cRMLead.count();
  console.log(`Total Leads in Database: ${totalDB}`);
  
  await prisma.$disconnect();
}

syncTelesalesForMonths([4, 5, 6, 7, 8]).catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
