import { useEffect } from "react";
import { SITE } from "@/data/site";

type SeoOptions = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, unknown>[];
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function canonicalFor(path: string) {
  if (path === "/") return `${SITE.url}/`;
  return `${SITE.url}${path}`;
}

export function useSeo({
  title,
  description,
  path,
  type = "website",
  noindex = false,
  jsonLd = [],
}: SeoOptions) {
  useEffect(() => {
    const canonical = canonicalFor(path);
    document.title = title;

    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", SITE.name);
    setMeta("property", "og:locale", SITE.locale);
    setMeta("property", "og:image", `${SITE.url}/og-image.jpg`);
    setMeta("name", "twitter:image", `${SITE.url}/og-image.jpg`);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;

    const scripts: HTMLScriptElement[] = jsonLd.map((data) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute("data-seo", "page");
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
      return s;
    });

    return () => {
      scripts.forEach((s) => s.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, type, noindex, JSON.stringify(jsonLd)]);
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonicalFor(item.href),
    })),
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  name: SITE.name,
  alternateName: SITE.brand,
  url: `${SITE.url}/`,
  description: SITE.tagline,
  inLanguage: "ar",
  areaServed: ["SA", "AE", "KW", "QA", "BH", "OM"],
  medicalSpecialty: "ObstetricsAndGynecology",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+966599287172",
    contactType: "استشارة طبية",
    availableLanguage: ["ar"],
  },
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: `${SITE.url}/`,
  inLanguage: "ar",
  description: SITE.tagline,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE.url}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const doctorJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "د. هيثم الخطيب",
  jobTitle: "طبيب نساء وولادة",
  telephone: "+966599287172",
  url: `${SITE.url}/doctor`,
  worksFor: {
    "@type": "MedicalOrganization",
    name: SITE.name,
    url: `${SITE.url}/`,
  },
};
