/**
 * Affiliate Link Builder & UTM Parameter Injector
 */

export interface AffiliateTrackingOptions {
  merchant?: "Shopee" | "Lazada" | "Tiki" | string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  subId?: string;
}

export function buildAffiliateUrl(originalUrl: string, options: AffiliateTrackingOptions = {}): string {
  try {
    const url = new URL(originalUrl);
    const source = options.utmSource || "luoidonnha";
    const medium = options.utmMedium || "website";
    const campaign = options.utmCampaign || "organic";

    url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", medium);
    url.searchParams.set("utm_campaign", campaign);

    if (options.subId) {
      if (options.merchant?.toLowerCase() === "shopee") {
        url.searchParams.set("sub_id", options.subId);
      } else if (options.merchant?.toLowerCase() === "lazada") {
        url.searchParams.set("aff_sub", options.subId);
      }
    }

    return url.toString();
  } catch {
    return originalUrl;
  }
}
