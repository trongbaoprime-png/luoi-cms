import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function nukeAll() {
  console.log('=== FULL DB WIPE ===');
  
  try {
    const h = await prisma.cRMStatusHistory.deleteMany({});
    console.log('Deleted cRMStatusHistory:', h.count);
  } catch (e: any) {
    console.log('cRMStatusHistory skip:', e.message?.slice(0, 80));
  }

  const l = await prisma.cRMLead.deleteMany({});
  console.log('Deleted cRMLead:', l.count);

  const remaining = await prisma.cRMLead.count();
  console.log('Remaining cRMLead count:', remaining);
  
  await prisma.$disconnect();
  console.log('=== DONE ===');
}

nukeAll().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
