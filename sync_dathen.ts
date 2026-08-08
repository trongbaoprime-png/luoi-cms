import { PrismaClient } from '@prisma/client';
import {
  normalizeSource,
  getSourceGroup,
  normalizeBranch,
  getBranchGroup,
  normalizeService,
  getServiceGroup,
  normalizeTelesale,
  normalizePhoneNumber,
  isVietKieu,
  isRealName,
} from './src/lib/tds-parser';
import crypto from 'crypto';

const prisma = new PrismaClient();

const SPREADSHEET_ID = '1zq0nnHqKgtsZBZnEKknM55qI_wjnm_Z5MzPBDLBD1jc';
const SHEET_NAME = 'DATHEN';

function hashPhone(phone: string): string {
  return crypto.createHash('sha256').update(phone.trim()).digest('hex');
}

function parseGvizDate(raw: string): string {
  const m = raw.match(/Date\((\d+),(\d+),(\d+)/);
  if (!m) return '';
  const year = Number(m[1]);
  const month = Number(m[2]) + 1;
  const day = Number(m[3]);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function fetchDatHenRows(): Promise<any[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const text = await res.text();
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?\s*$/);
  if (!jsonMatch) throw new Error('Could not parse gviz response');
  
  const parsed = JSON.parse(jsonMatch[1]);
  const rows = parsed?.table?.rows;
  if (!Array.isArray(rows)) throw new Error('No rows in gviz response');
  return rows;
}

function getCellValue(cell: any): string {
  if (!cell) return '';
  if (cell.v === null || cell.v === undefined) return '';
  if (typeof cell.v === 'string' && cell.v.startsWith('Date(')) {
    return cell.f || parseGvizDate(cell.v);
  }
  return String(cell.v).trim();
}

async function syncDatHen() {
  console.log('=== FAST SYNC DATHEN SHEET ===');
  
  const rows = await fetchDatHenRows();
  console.log(`Fetched ${rows.length} rows from DATHEN sheet`);
  
  // 1. In-memory dedup & preparation
  const leadMap = new Map<string, any>();
  let skipped = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.c || [];
    
    const colA = getCellValue(cells[0]); // Ngày nhập liệu
    const colB = getCellValue(cells[1]); // Họ tên
    const colC = getCellValue(cells[2]); // SĐT
    const colD = getCellValue(cells[3]); // Nguồn
    const colE = getCellValue(cells[4]); // Chi nhánh
    const colF = getCellValue(cells[5]); // DV chính
    const colI = getCellValue(cells[8]); // Sale hẹn
    const colJ = getCellValue(cells[9]); // Cũ/Mới
    
    if (!colC && !colB) {
      skipped++;
      continue;
    }
    
    const rawPhone = colC || colB || `DH${String(i + 1).padStart(6, '0')}`;
    const phone = normalizePhoneNumber(rawPhone) || rawPhone;
    const fullName = colB || `Khách Đặt Hẹn #${i + 1}`;
    const isVKVal = isVietKieu('', phone);
    
    let checkinDate = '';
    const fVal = cells[0]?.f || '';
    if (fVal) {
      const dm = fVal.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dm) {
        const d = String(dm[1]).padStart(2, '0');
        const mo = String(dm[2]).padStart(2, '0');
        const y = dm[3];
        checkinDate = `${y}-${mo}-${d}`;
      }
    }
    
    const source = normalizeSource(colD);
    const sourceGroup = getSourceGroup(source);
    const branch = normalizeBranch(colE);
    const branchGroup = getBranchGroup(branch);
    const service = normalizeService(colF);
    const serviceGroup = getServiceGroup(service);
    const telesale = normalizeTelesale(colI);
    const isOldCustomer = /^(CŨ|CU|OLD)$/i.test(colJ.trim());
    const phoneHash = hashPhone(phone);

    const existingInMap = leadMap.get(phone);
    if (existingInMap) {
      // Merge in memory
      if (isRealName(fullName)) {
        existingInMap.fullName = fullName;
      }
      if (checkinDate) existingInMap.checkinDate = checkinDate;
      if (source !== 'Chưa rõ') { existingInMap.source = source; existingInMap.sourceGroup = sourceGroup; }
      if (branch !== 'Chưa rõ') { existingInMap.branch = branch; existingInMap.branchGroup = branchGroup; }
      if (service !== 'Chưa rõ') { existingInMap.service = service; existingInMap.serviceGroup = serviceGroup; }
      if (telesale !== 'Chưa rõ') { existingInMap.telesale = telesale; }
      if (isVKVal) existingInMap.isVietKieu = true;
    } else {
      leadMap.set(phone, {
        fullName,
        phone,
        phoneHash,
        source,
        sourceGroup,
        branch,
        branchGroup,
        service,
        serviceGroup,
        telesale,
        checkinDate: checkinDate || '',
        isMonthNote: false,
        result: 'Chưa có',
        isOldCustomer,
        isKoMkt: false,
        isVietKieu: isVKVal,
        isNN: false,
        revenue: 0,
        actualRevenue: 0,
        caTheoRevenue: 0,
        status: 'QUALIFIED',
        ref: 'App',
      });
    }
  }
  
  const preparedLeads = Array.from(leadMap.values());
  console.log(`Unique DATHEN leads to upsert into DB: ${preparedLeads.length}`);
  
  // 2. High-speed Database Chunk Insert
  const CHUNK_SIZE = 1000;
  for (let i = 0; i < preparedLeads.length; i += CHUNK_SIZE) {
    const chunk = preparedLeads.slice(i, i + CHUNK_SIZE);
    
    // Fetch existing phones in DB for this chunk
    const chunkPhones = chunk.map(l => l.phone);
    const existingInDb = await prisma.cRMLead.findMany({
      where: { phone: { in: chunkPhones } },
      select: { id: true, phone: true, ref: true }
    });
    const existingMap = new Map(existingInDb.map(e => [e.phone, e]));
    
    const newLeadsToInsert: any[] = [];
    const idsToUpdateApp: string[] = [];

    for (const leadItem of chunk) {
      const existing = existingMap.get(leadItem.phone);
      if (existing) {
        if (existing.ref !== 'Form' && existing.ref !== 'App') {
          idsToUpdateApp.push(existing.id);
        }
      } else {
        newLeadsToInsert.push(leadItem);
      }
    }

    if (idsToUpdateApp.length > 0) {
      await prisma.cRMLead.updateMany({
        where: { id: { in: idsToUpdateApp } },
        data: { ref: 'App' }
      });
    }
    
    if (newLeadsToInsert.length > 0) {
      await prisma.cRMLead.createMany({
        data: newLeadsToInsert,
      });
    }
  }
  
  console.log('=== DONE FAST DATHEN SYNC ===');
  const totalInDB = await prisma.cRMLead.count();
  console.log(`Total leads in DB after DATHEN sync: ${totalInDB}`);
  
  await prisma.$disconnect();
}

syncDatHen().catch(e => {
  console.error('Fatal error in syncDatHen:', e);
  process.exit(1);
});
