"use client";

import { useEffect } from "react";

export function ContactClickTracker() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href") || "";
      if (!href) return;

      let channel: "HOTLINE" | "ZALO" | "MESSENGER" | "WHATSAPP" | null = null;

      if (href.startsWith("tel:")) {
        channel = "HOTLINE";
      } else if (href.includes("zalo.me") || href.includes("zalo.vn")) {
        channel = "ZALO";
      } else if (href.includes("m.me/") || href.includes("facebook.com/messages") || href.includes("messenger.com")) {
        channel = "MESSENGER";
      } else if (href.includes("wa.me/") || href.includes("api.whatsapp.com")) {
        channel = "WHATSAPP";
      }

      if (!channel) return;

      // Extract cookies for Click IDs
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
        return "";
      };

      const gclid = getCookie("_gclid") || localStorage.getItem("gclid") || "";
      const fbclid = getCookie("_fbclid") || localStorage.getItem("fbclid") || "";
      const fbc = getCookie("_fbc") || localStorage.getItem("fbc") || "";
      const fbp = getCookie("_fbp") || localStorage.getItem("fbp") || "";
      const ttclid = getCookie("_ttclid") || localStorage.getItem("ttclid") || "";

      // 1. Client-side Pixel Triggers
      if (typeof window !== "undefined") {
        // Meta Pixel
        if ((window as any).fbq) {
          (window as any).fbq("track", "Contact", { channel, targetUrl: href });
          (window as any).fbq("trackCustom", `Click_${channel}`, { targetUrl: href });
        }
        // TikTok Pixel
        if ((window as any).ttq) {
          (window as any).ttq.track("Contact", { button_name: channel, target_url: href });
        }
        // Google Ads Gtag
        if ((window as any).gtag) {
          (window as any).gtag("event", "conversion", {
            send_to: "AW-CONTACT",
            event_category: "Outbound Contact",
            event_label: channel,
            value: 100000,
            currency: "VND",
          });
        }
      }

      // 2. Server-side CAPI Postback Trigger
      const payload = {
        channel,
        targetUrl: href,
        sourceUrl: window.location.href,
        gclid,
        fbclid,
        fbc,
        fbp,
        ttclid,
      };

      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/ads/click-contact", JSON.stringify(payload));
        } else {
          fetch("/api/ads/click-contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {}
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
