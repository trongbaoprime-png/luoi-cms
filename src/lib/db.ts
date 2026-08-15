import cmsDb from "./cms-db";
import crmDb from "./crm-db";
import omniDb, { omnichannelDb } from "./omni-db";
import metaDb from "./meta-db";
import trackingDb from "./tracking-db";

// Unified CMS Database export for all content, articles, pages, categories, settings
export const db = cmsDb;

export { cmsDb, crmDb, omniDb, omnichannelDb, metaDb, trackingDb };
export default db;
