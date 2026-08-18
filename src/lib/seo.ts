import { useEffect } from 'react';
import { SITE, DOCTOR } from '../data/site';

export interface SeoProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  jsonLd?: object | object[];
  keywords?: string;
  image?: string;
}

export function useSeo(props: SeoProps = {}) {
  const { title, description, jsonLd } = props;
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
    if (jsonLd) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, jsonLd]);
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE?.name || "فيم صحة",
    "url": SITE?.url || "https://www.femseha.com",
    "description": SITE?.description || ""
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": SITE?.name || "فيم صحة",
    "url": SITE?.url || "https://www.femseha.com",
    "telephone": SITE?.phone || "00966599287172"
  };
}

export function doctorJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": DOCTOR?.name || "د. هيثم الخطيب",
    "medicalSpecialty": "Obstetrics and Gynecology",
    "telephone": DOCTOR?.phone || "00966599287172"
  };
}

export function articleJsonLd(article?: any) {
  if (!article) return {};
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "headline": article.title || "",
    "description": article.summary || article.metaDescription || "",
    "datePublished": article.publishDate || article.date || "",
    "author": {
      "@type": "Physician",
      "name": article.author || DOCTOR?.name || "د. هيثم الخطيب"
    }
  };
}

export default useSeo;
