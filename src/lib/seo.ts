import { useEffect } from "react";
import { SITE, DOCTOR } from "../data/site";

export interface SeoProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  jsonLd?: object | object[];
  keywords?: string;
  image?: string;
  type?: string;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

/**
 * هوك SEO لكل صفحة: يضبط العنوان والوصف والرابط القانوني (canonical)
 * ووسوم Open Graph/Twitter وبيانات JSON-LD المهيكلة.
 */
export function useSeo(props: SeoProps = {}) {
  const { title, description, canonicalPath, canonicalUrl, jsonLd, keywords, image, type } = props;

  useEffect(() => {
    const url = canonicalUrl || (canonicalPath ? `${SITE.url}${canonicalPath}` : SITE.url);
    const ogImage = image || `${SITE.url}/banner.jpg.png`;

    if (title) document.title = title;
    if (description) upsertMeta("name", "description", description);
    if (keywords) upsertMeta("name", "keywords", keywords);
    upsertCanonical(url);

    upsertMeta("property", "og:title", title || SITE.title);
    upsertMeta("property", "og:description", description || SITE.description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:type", type || "website");
    upsertMeta("property", "og:site_name", SITE.name);
    upsertMeta("property", "og:locale", "ar_SA");
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title || SITE.title);
    upsertMeta("name", "twitter:description", description || SITE.description);
    upsertMeta("name", "twitter:image", ogImage);

    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      document.querySelectorAll('script[data-seo="page"]').forEach((n) => n.remove());
      for (const obj of items) {
        const script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        script.setAttribute("data-seo", "page");
        script.textContent = JSON.stringify(obj);
        document.head.appendChild(script);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonicalPath, canonicalUrl, JSON.stringify(jsonLd), keywords, image, type]);
}

/* ── مُنشئات البيانات المهيكلة (JSON-LD) ─────────────────────────────── */

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE?.name || "فيم صحة",
    url: SITE?.url || "https://femseha.com",
    description: SITE?.description || "",
    inLanguage: "ar"
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: SITE?.name || "فيم صحة",
    url: SITE?.url || "https://femseha.com",
    description: SITE?.description || "",
    telephone: SITE?.phone || "00966599287172",
    inLanguage: "ar"
  };
}

export function doctorJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: DOCTOR?.name || "د. هيثم الخطيب",
    medicalSpecialty: "Obstetrics and Gynecology",
    url: `${SITE?.url || "https://femseha.com"}/doctor`,
    telephone: DOCTOR?.phone || "00966599287172"
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE?.url || "https://femseha.com"}${c.href}`
    }))
  };
}

/**
 * بيانات مقال طبي مهيكلة — تعبّأ من سجل المقال المنشور (ArticleRecord).
 */
export function articleJsonLd(article?: {
  title?: string;
  summary?: string;
  publishDate?: string;
  slug?: string;
  readTime?: number;
  primaryKeyword?: string;
}) {
  if (!article) return {};
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: article.title || "",
    description: article.summary || "",
    datePublished: article.publishDate || "",
    dateModified: article.publishDate || "",
    inLanguage: "ar",
    url: `${SITE?.url || "https://femseha.com"}/articles/${article.slug || ""}`,
    keywords: article.primaryKeyword || undefined,
    timeRequired: article.readTime ? `PT${article.readTime}M` : undefined,
    author: {
      "@type": "Physician",
      name: DOCTOR?.name || "د. هيثم الخطيب",
      medicalSpecialty: "Obstetrics and Gynecology"
    },
    reviewedBy: {
      "@type": "Physician",
      name: DOCTOR?.name || "د. هيثم الخطيب"
    },
    publisher: {
      "@type": "MedicalOrganization",
      name: SITE?.name || "فيم صحة",
      url: SITE?.url || "https://femseha.com"
    }
  };
}

export default useSeo;
