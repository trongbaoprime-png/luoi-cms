import { db } from './src/lib/db';
import { syncAllTdsSheets } from './src/lib/google-sheets';
import { execSync } from 'child_process';

async function runMasterSync() {
  console.log('====================================================');
  console.log('🚀 MASTER SYNC: DATHEN + TELESALES MONTHS 4..8');
  console.log('====================================================\n');

  // Step 1: Sync DATHEN Sheet
  console.log('--- STEP 1: Syncing DATHEN Sheet ---');
  try {
    const outDathen = execSync('npx tsx sync_dathen.ts', { encoding: 'utf-8' });
    console.log(outDathen);
  } catch (e: any) {
    console.error('Error syncing DATHEN:', e.message);
  }

  // Step 2: Sync Telesale Sheets for Months 4, 5, 6, 7, 8
  console.log('\n--- STEP 2: Syncing Telesale Sheets (Months 4, 5, 6, 7, 8) ---');
  const syncRes = await syncAllTdsSheets([4, 5, 6, 7, 8], 2026);
  console.log('Sync Result:', JSON.stringify(syncRes.logs, null, 2));

  // Step 3: Run Monthly Audit Report
  console.log('\n====================================================');
  console.log('📊 MONTHLY REVENUE & METRICS AUDIT REPORT');
  console.log('====================================================\n');

  const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];

  for (const m of months) {
    const leads = await db.cRMLead.findMany({
      where: { checkinDate: { startsWith: m } },
    });

    let totalRev = 0;
    let actualRev = 0;
    let caTheoRev = 0;
    let koMktRev = 0;
    let newRev = 0;
    let oldRev = 0;
    let oldPSRev = 0;
    let vietKieuRev = 0;
    let nnRev = 0;

    let checkinCount = 0;
    let passCount = 0;
    let failCount = 0;

    leads.forEach((l) => {
      const rev = l.revenue || 0;
      totalRev += rev;
      actualRev += l.actualRevenue || 0;
      caTheoRev += l.caTheoRevenue || 0;

      if (l.isKoMkt) koMktRev += rev;
      if (l.isOldCustomer) oldRev += rev; else newRev += rev;
      if (l.isMonthNote) oldPSRev += rev;
      if (l.isVietKieu) vietKieuRev += rev;
      if (l.isNN) nnRev += rev;

      if (l.checkinDate) checkinCount++;
      if (l.result === 'Đậu' || l.status === 'PURCHASE') passCount++;
      if (l.result === 'Rớt') failCount++;
    });

    const mktRev = totalRev - koMktRev;

    console.log(`📅 MONTH ${m}:`);
    console.log(`   • Total Leads      : ${leads.length.toLocaleString('vi-VN')}`);
    console.log(`   • Checkin Count    : ${checkinCount.toLocaleString('vi-VN')}`);
    console.log(`   • Pass (Đậu) Count : ${passCount.toLocaleString('vi-VN')}`);
    console.log(`   • Fail (Rớt) Count : ${failCount.toLocaleString('vi-VN')}`);
    console.log(`   -------------------------------------------------`);
    console.log(`   • TỔNG DOANH THU   : ${totalRev.toLocaleString('vi-VN')}đ`);
    console.log(`   • DT TÍNH MKT      : ${mktRev.toLocaleString('vi-VN')}đ`);
    console.log(`   • THỰC THU         : ${actualRev.toLocaleString('vi-VN')}đ`);
    console.log(`   • DT MỚI           : ${newRev.toLocaleString('vi-VN')}đ`);
    console.log(`   • DT CŨ            : ${oldRev.toLocaleString('vi-VN')}đ`);
    console.log(`   • DT CŨ PS (Tháng) : ${oldPSRev.toLocaleString('vi-VN')}đ`);
    console.log(`   • DT CA THEO       : ${caTheoRev.toLocaleString('vi-VN')}đ`);
    console.log(`   • DT VIỆT KIỀU     : ${vietKieuRev.toLocaleString('vi-VN')}đ`);
    console.log(`   • DT NGƯỜI NƯỚC NGOÀI: ${nnRev.toLocaleString('vi-VN')}đ`);
    console.log(`   • DT KO MKT        : ${koMktRev.toLocaleString('vi-VN')}đ\n`);
  }

  const grandTotal = await db.cRMLead.count();
  console.log(`🎉 GRAND TOTAL CRM LEADS IN DATABASE: ${grandTotal.toLocaleString('vi-VN')}`);
}

runMasterSync().catch((e) => {
  console.error('Fatal error in Master Sync:', e);
  process.exit(1);
});
