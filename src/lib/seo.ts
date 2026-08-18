import { useEffect } from 'react';
import { SITE, DOCTOR } from '@/data/site';

interface SeoProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  jsonLd?: object;
}

export function useSeo({ title, description, canonicalPath, jsonLd }: SeoProps = {}) {
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
  }, [title, description, canonicalPath, jsonLd]);
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE.name,
    "url": SITE.url,
    "description": SITE.description
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": SITE.name,
    "url": SITE.url,
    "telephone": SITE.phone
  };
}

export function doctorJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": DOCTOR.name,
    "medicalSpecialty": "Obstetrics and Gynecology",
    "telephone": DOCTOR.phone
  };
}
