export type ImageSeoOverride = {
  image: string;
  imageAlt: string;
};

/**
 * صور حقيقية مرفوعة إلى جذر المستودع وتُنقل إلى public/images/seo أثناء البناء.
 * كل صورة مرتبطة بمقال سعودي ذي صلة مباشرة، مع ALT وصفي طبيعي دون حشو كلمات مفتاحية.
 */
export const IMAGE_SEO_OVERRIDES: Record<string, ImageSeoOverride> = {
  "cytotec-misoprostol-saudi-riyadh-guide": {
    image: "/images/seo/saudi-cytotec-medical-guide.webp",
    imageAlt: "دليل طبي حول سايتوتك وميزوبروستول في السعودية",
  },
  "ijhad-dawai-fi-al-saudia": {
    image: "/images/seo/saudi-cytotec-doctor-consultation.webp",
    imageAlt: "استشارة طبية حول الإجهاض الدوائي في السعودية",
  },
  "adwiyat-ijhad-alhaml-fi-al-saudia": {
    image: "/images/seo/cytotec-misoprostol-saudi-guide.webp",
    imageAlt: "معلومات طبية عن أدوية الإجهاض وميزوبروستول في السعودية",
  },
  "danger-signs-after-medical-abortion-saudi": {
    image: "/images/seo/cytotec-medical-safety-warning-saudi.webp",
    imageAlt: "علامات الخطر والتحذيرات الطبية بعد الإجهاض الدوائي",
  },
  "bleeding-after-medical-abortion-saudi": {
    image: "/images/seo/saudi-cytotec-safety-guide.webp",
    imageAlt: "إرشادات السلامة الطبية حول النزيف بعد الإجهاض الدوائي",
  },
  "ectopic-pregnancy-abortion-medicines-saudi": {
    image: "/images/seo/cytotec-misoprostol-medical-information.webp",
    imageAlt: "معلومات طبية عن الحمل خارج الرحم ومخاطر أدوية الإجهاض",
  },
  "pregnancy-danger-signs-emergency": {
    image: "/images/seo/cytotec-medical-consultation-saudi.webp",
    imageAlt: "استشارة طبية حول علامات الخطر أثناء الحمل",
  },
  "home-pregnancy-test-accuracy": {
    image: "/images/seo/saudi-womens-health-medical-consultation.webp",
    imageAlt: "استشارة طبية حول الحمل وصحة المرأة",
  },
  "early-pregnancy-symptoms-guide": {
    image: "/images/seo/saudi-womens-health-medical-consultation.webp",
    imageAlt: "استشارة طبية حول أعراض الحمل المبكرة وصحة المرأة",
  },
};

export function imageSeoForArticle(slug?: string): ImageSeoOverride | null {
  if (!slug) return null;
  return IMAGE_SEO_OVERRIDES[slug] || null;
}
