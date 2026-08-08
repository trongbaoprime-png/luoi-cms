/**
 * SEO Schema.org JSON-LD Generators
 */

export function generateArticleSchema(article: {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  updatedAt: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description || article.title,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.authorName || "Lười Dọn Nhà Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Lười Dọn Nhà",
      logo: {
        "@type": "ImageObject",
        url: "https://luoidonnha.com/images/luoidonnhalogo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
}

export function generateProductSchema(product: {
  name: string;
  description?: string;
  image?: string;
  price?: number;
  rating?: number;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: product.image ? [product.image] : undefined,
    offers: {
      "@type": "Offer",
      price: product.price || 0,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url: product.url,
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: 18,
        }
      : undefined,
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
