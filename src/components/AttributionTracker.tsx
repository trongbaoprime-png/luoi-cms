"use client";

import { useEffect } from "react";

export function AttributionTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const gclid = urlParams.get("gclid");
      const wbraid = urlParams.get("wbraid");
      const gbraid = urlParams.get("gbraid");
      const fbclid = urlParams.get("fbclid");
      const ttclid = urlParams.get("ttclid");
      const utmSource = urlParams.get("utm_source");
      const utmMedium = urlParams.get("utm_medium");
      const utmCampaign = urlParams.get("utm_campaign");

      const now = Date.now();
      const expireDays = 90;
      const expireDate = new Date(now + expireDays * 24 * 60 * 60 * 1000).toUTCString();

      // Utility: Set cookie helper
      const setCookie = (name: string, value: string) => {
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expireDate}; path=/; SameSite=Lax`;
      };

      // 1. Google Ads GCLID / WBRAID / GBRAID
      if (gclid) {
        setCookie("gclid", gclid);
        localStorage.setItem("gclid", gclid);
      }
      if (wbraid) {
        setCookie("wbraid", wbraid);
        localStorage.setItem("wbraid", wbraid);
      }
      if (gbraid) {
        setCookie("gbraid", gbraid);
        localStorage.setItem("gbraid", gbraid);
      }

      // 2. Meta Ads FBCLID & FBC/FBP
      if (fbclid) {
        setCookie("fbclid", fbclid);
        localStorage.setItem("fbclid", fbclid);

        // Generate fbc cookie format: fb.1.timestamp.fbclid
        const fbcValue = `fb.1.${now}.${fbclid}`;
        setCookie("_fbc", fbcValue);
        localStorage.setItem("_fbc", fbcValue);
      }

      // Ensure _fbp cookie exists if not present
      const fbpMatch = document.cookie.match(/(?:^|;\s*)_fbp=([^;]*)/);
      if (!fbpMatch) {
        const randId = Math.floor(Math.random() * 2147483647);
        const fbpValue = `fb.1.${now}.${randId}`;
        setCookie("_fbp", fbpValue);
        localStorage.setItem("_fbp", fbpValue);
      }

      // 3. TikTok Ads TTCLID
      if (ttclid) {
        setCookie("ttclid", ttclid);
        localStorage.setItem("ttclid", ttclid);
      }

      // 4. UTM Parameters
      if (utmSource) localStorage.setItem("utm_source", utmSource);
      if (utmMedium) localStorage.setItem("utm_medium", utmMedium);
      if (utmCampaign) localStorage.setItem("utm_campaign", utmCampaign);
      // 5. Inject Qini Home AFP Conversion Tracking Script
      const scriptId = "qini-afp-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://qini-home.afp.ad";
        script.async = true;
        document.head.appendChild(script);
      }
    } catch {}
  }, []);

  return null;
}

// Utility: Helper function for client forms to retrieve stored Click IDs
export function getStoredAttribution() {
  if (typeof window === "undefined") return {};

  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  };

  return {
    gclid: getCookie("gclid") || localStorage.getItem("gclid") || undefined,
    wbraid: getCookie("wbraid") || localStorage.getItem("wbraid") || undefined,
    gbraid: getCookie("gbraid") || localStorage.getItem("gbraid") || undefined,
    fbclid: getCookie("fbclid") || localStorage.getItem("fbclid") || undefined,
    fbc: getCookie("_fbc") || localStorage.getItem("_fbc") || undefined,
    fbp: getCookie("_fbp") || localStorage.getItem("_fbp") || undefined,
    ttclid: getCookie("ttclid") || localStorage.getItem("ttclid") || undefined,
    utmSource: localStorage.getItem("utm_source") || undefined,
    utmMedium: localStorage.getItem("utm_medium") || undefined,
    utmCampaign: localStorage.getItem("utm_campaign") || undefined,
  };
}
