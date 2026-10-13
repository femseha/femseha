export type ImageSeoOverride = {
  image: string;
  imageAlt: string;
};

/**
 * صور المقالات المرتبطة بموضوعها مباشرة.
 * نصوص ALT وصفية بالعربية وتراعي سياق الصورة دون تكرار الكلمات المفتاحية بلا داعٍ.
 */
export const IMAGE_SEO_OVERRIDES: Record<string, ImageSeoOverride> = {
  "cytotec-misoprostol-saudi-riyadh-guide": {
    image: "/images/seo/saudi-cytotec-medical-guide.webp",
    imageAlt: "سايتوتك في السعودية: معلومات طبية عن ميزوبروستول وتحذيرات السلامة",
  },
  "ijhad-dawai-fi-al-saudia": {
    image: "/images/seo/saudi-cytotec-doctor-consultation.webp",
    imageAlt: "استشارة طبية ومعلومات توعوية عن الإجهاض الدوائي في السعودية",
  },
  "adwiyat-ijhad-alhaml-fi-al-saudia": {
    image: "/images/seo/cytotec-misoprostol-saudi-guide.webp",
    imageAlt: "حبوب إجهاض الحمل في السعودية: معلومات طبية ومخاطر الاستخدام دون إشراف",
  },
  "danger-signs-after-medical-abortion-saudi": {
    image: "/images/seo/cytotec-medical-safety-warning-saudi.webp",
    imageAlt: "علامات الخطر والتحذيرات الطبية بعد الإجهاض الدوائي",
  },
  "bleeding-after-medical-abortion-saudi": {
    image: "/images/seo/saudi-cytotec-safety-guide.webp",
    imageAlt: "معلومات طبية عن النزيف بعد الإجهاض الدوائي ومتى تلزم الرعاية العاجلة",
  },
  "ectopic-pregnancy-abortion-medicines-saudi": {
    image: "/images/seo/cytotec-misoprostol-medical-information.webp",
    imageAlt: "الحمل خارج الرحم ومخاطر أدوية الإجهاض: معلومات طبية توعوية",
  },
  "pregnancy-danger-signs-emergency": {
    image: "/images/seo/cytotec-medical-consultation-saudi.webp",
    imageAlt: "علامات الخطر أثناء الحمل ومتى يجب طلب الرعاية الطبية العاجلة",
  },
  "home-pregnancy-test-accuracy": {
    image: "/images/seo/saudi-womens-health-medical-consultation.webp",
    imageAlt: "استشارة طبية حول اختبار الحمل وتفسير النتائج",
  },
  "early-pregnancy-symptoms-guide": {
    image: "/images/seo/saudi-womens-health-medical-consultation.webp",
    imageAlt: "أعراض الحمل المبكرة وكيفية تمييزها عن أعراض الدورة الشهرية",
  },
};

export function imageSeoForArticle(slug?: string): ImageSeoOverride | null {
  if (!slug) return null;
  return IMAGE_SEO_OVERRIDES[slug] || null;
}
