/**
 * Auto Internal Linker Utility (Standard SEO Engine inspired by Rank Math AI Link Genius & Link Whisper)
 * Automatically scans content HTML and replaces targeted keywords with internal links safely without messing up existing HTML tags.
 */

export interface KeywordMapRule {
  targetUrl: string;
  primaryKeyword: string;
  variations: string[];
  maxLinksPerPost?: number;
}

export function applyAutoInternalLinks(
  htmlContent: string,
  rules: KeywordMapRule[],
  currentPostSlug?: string
): string {
  if (!htmlContent || !rules || rules.length === 0) return htmlContent;

  let processedHtml = htmlContent;

  // Track already linked URLs in this article to avoid duplicate internal links to the same page
  const linkedUrlsInArticle = new Set<string>();

  // Extract existing links in content to prevent re-linking to the same URL
  const existingLinkRegex = /href=["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = existingLinkRegex.exec(htmlContent)) !== null) {
    linkedUrlsInArticle.add(match[1].toLowerCase());
  }

  for (const rule of rules) {
    const { targetUrl, primaryKeyword, variations, maxLinksPerPost = 1 } = rule;

    // Skip if target URL is the current post itself or already linked
    if (
      (currentPostSlug && targetUrl.includes(currentPostSlug)) ||
      linkedUrlsInArticle.has(targetUrl.toLowerCase())
    ) {
      continue;
    }

    // Combine primary keyword and variations
    const allKeywords = [primaryKeyword, ...variations].filter(Boolean);
    let appliedCount = 0;

    for (const keyword of allKeywords) {
      if (appliedCount >= maxLinksPerPost) break;

      // Escape special characters for regex
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      /**
       * REGEX MATCHING RULE:
       * Match keyword ONLY if it appears inside a <p> tag text content
       * and NOT inside existing <a> tags, <h1>-<h6> tags, <code>, or HTML attributes.
       */
      const pattern = new RegExp(
        `(?<=(?:<p[^>]*>|\\s))(?!(?:[^<]|<(?!\/a>))*<\/a>)(${escapedKeyword})(?=(?:[^<]|<(?!\/a>))*<\/p>|\\s|[.,!?:;])`,
        "gi"
      );

      // Simple safe replacement using HTML parser split approach
      const parts = processedHtml.split(/(<[^>]+>)/g);
      let inAnchor = false;
      let inHeading = false;
      let inCode = false;
      let replacedInThisRun = false;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // Check if token is HTML Tag
        if (part.startsWith("<")) {
          const lowerTag = part.toLowerCase();
          if (lowerTag.startsWith("<a ") || lowerTag === "<a>") inAnchor = true;
          if (lowerTag === "</a>") inAnchor = false;

          if (/^<h[1-6]/i.test(lowerTag)) inHeading = true;
          if (/^<\/h[1-6]>/i.test(lowerTag)) inHeading = false;

          if (lowerTag.startsWith("<code") || lowerTag.startsWith("<pre")) inCode = true;
          if (lowerTag === "</code>" || lowerTag === "</pre>") inCode = false;
        } else if (!inAnchor && !inHeading && !inCode && !replacedInThisRun) {
          // It is clean text node! Search for keyword
          const regexExact = new RegExp(`\\b(${escapedKeyword})\\b`, "i");
          if (regexExact.test(part)) {
            parts[i] = part.replace(
              regexExact,
              `<a href="${targetUrl}" title="$1" class="internal-seo-link font-semibold text-[#0d9488] hover:underline" data-auto-linked="true">$1</a>`
            );
            replacedInThisRun = true;
            appliedCount++;
            linkedUrlsInArticle.add(targetUrl.toLowerCase());
            break;
          }
        }
      }

      if (replacedInThisRun) {
        processedHtml = parts.join("");
      }
    }
  }

  return processedHtml;
}
