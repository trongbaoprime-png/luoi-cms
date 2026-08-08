import cmsDb from "./luoi/cms/db";
import crmDb from "./luoi/minicrm/db";
import omniDb from "./luoi/omni/db";

async function verifyLuoi() {
  console.log("==================================================");
  console.log("AUDITING /luoi/ CONDENSED 4-MODULE ARCHITECTURE");
  console.log("==================================================");

  try {
    const posts = await cmsDb.post.findMany();
    const pages = await cmsDb.page.findMany();
    const shortcodes = await cmsDb.shortcodeBlock.findMany();
    const media = await cmsDb.media.count();
    const settings = await cmsDb.setting.count();

    console.log("1. Module LƯỜI CMS (luoi/cms/cms.db):");
    console.log(`   - Posts (Bài viết): ${posts.length}`);
    console.log(`   - Pages (Trang tĩnh): ${pages.length}`);
    console.log(`   - Shortcode Blocks: ${shortcodes.length} (${shortcodes.map((s: any) => s.key).join(", ")})`);
    console.log(`   - Media Items: ${media}`);
    console.log(`   - Settings: ${settings}`);
  } catch (e: any) {
    console.error("❌ Module CMS Error:", e.message);
  }

  try {
    const totalLeads = await crmDb.cRMLead.count();
    const sampleLead = await crmDb.cRMLead.findFirst({ select: { id: true, fullName: true, phone: true, status: true } });

    console.log("\n2. Module miniCRM (luoi/minicrm/minicrm.db):");
    console.log(`   - Total Qualified CRM Leads: ${totalLeads}`);
    if (sampleLead) {
      console.log(`   - Sample Lead: ${sampleLead.fullName} (${sampleLead.phone}) - Status: ${sampleLead.status}`);
    }
  } catch (e: any) {
    console.error("❌ Module miniCRM Error:", e.message);
  }

  try {
    const conversations = await omniDb.omniConversation.count();
    console.log("\n3. Module Omnichannel (luoi/omni/omni.db):");
    console.log(`   - Total Conversations: ${conversations}`);
  } catch (e: any) {
    console.error("❌ Module Omnichannel Error:", e.message);
  }

  console.log("==================================================");
  process.exit(0);
}

verifyLuoi();
