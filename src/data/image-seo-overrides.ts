export type ImageSeoOverride = {
  image: string;
  imageAlt: string;
};

export const IMAGE_SEO_OVERRIDES: Record<string, ImageSeoOverride> = {
  "ijhad-dawai-fi-al-saudia": {
    image: "/images/seo/medical-abortion-saudi-safety-guide.svg",
    imageAlt: "الإجهاض الدوائي في السعودية: معلومات طبية عن السلامة وعلامات الخطر"
  },
  "adwiyat-ijhad-alhaml-fi-al-saudia": {
    image: "/images/seo/abortion-medicines-saudi-medical-guide.svg",
    imageAlt: "أدوية إجهاض الحمل في السعودية: التقييم الطبي والسلامة والتحذيرات"
  },
  "danger-signs-after-medical-abortion-saudi": {
    image: "/images/seo/danger-signs-medical-abortion-saudi.svg",
    imageAlt: "علامات الخطر بعد الإجهاض الدوائي في السعودية ومتى تحتاجين إلى رعاية عاجلة"
  },
  "bleeding-after-medical-abortion-saudi": {
    image: "/images/seo/bleeding-after-medical-abortion-guide.svg",
    imageAlt: "النزيف بعد الإجهاض الدوائي: متى يكون متوقعًا ومتى يحتاج إلى تقييم طبي"
  },
  "ectopic-pregnancy-abortion-medicines-saudi": {
    image: "/images/seo/ectopic-pregnancy-abortion-medicines-guide.svg",
    imageAlt: "الحمل خارج الرحم وأدوية الإجهاض: أهمية تأكيد مكان الحمل أولًا"
  },
  "pregnancy-danger-signs-emergency": {
    image: "/images/seo/pregnancy-danger-signs-saudi-guide.svg",
    imageAlt: "علامات الخطر في الحمل ومتى تحتاجين إلى رعاية طبية عاجلة"
  },
  "home-pregnancy-test-accuracy": {
    image: "/images/seo/home-pregnancy-test-guide.svg",
    imageAlt: "اختبار الحمل المنزلي: التوقيت الأدق وتفسير النتائج المتضاربة"
  },
  "early-pregnancy-symptoms-guide": {
    image: "/images/seo/early-pregnancy-symptoms-guide.svg",
    imageAlt: "أعراض الحمل المبكرة وكيف تفرقين بينها وبين أعراض الدورة"
  },
  "delayed-period-causes-besides-pregnancy": {
    image: "/images/seo/delayed-period-causes-guide.svg",
    imageAlt: "تأخر الدورة الشهرية بدون حمل: الأسباب الطبية ومتى يصبح التأخر مقلقًا"
  }
};

export function imageSeoForArticle(slug?: string): ImageSeoOverride | null {
  if (!slug) return null;
  return IMAGE_SEO_OVERRIDES[slug] || null;
}
