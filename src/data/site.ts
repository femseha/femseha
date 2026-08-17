export const SITE = {
  name: "دليل صحة المرأة",
  brand: "SehaHer",
  url: "https://sehaher.com",
  tagline: "منصة تثقيف طبي عربية لصحة المرأة والحمل والأدوية",
  description:
    "منصة تثقيف طبي عربية تقدم معلومات تعليمية موثوقة عن صحة المرأة والحمل والأدوية، مع الاعتماد على مصادر طبية معتمدة. الموقع لا يبيع الأدوية ولا يقدم خططًا علاجية فردية.",
  locale: "ar_SA",
  copyright: "© 2026 دليل صحة المرأة — جميع الحقوق محفوظة",
} as const;

export const DOCTOR = {
  name: "د. هيثم الخطيب",
  profession: "طبيب نساء وولادة",
  phoneDisplay: "00966599287172",
  phoneLink: "tel:+966599287172",
} as const;

export const NAV: { label: string; href: string }[] = [
  { label: "الرئيسية", href: "/" },
  { label: "صحة المرأة", href: "/womens-health" },
  { label: "الحمل", href: "/pregnancy" },
  { label: "الأدوية", href: "/medications" },
  { label: "سايتوتك", href: "/cytotec" },
  { label: "ميزوبروستول", href: "/misoprostol" },
  { label: "أدوية الإجهاض", href: "/abortion-medications" },
  { label: "تأخر الدورة", href: "/delayed-period" },
  { label: "الحمل خارج الرحم", href: "/ectopic-pregnancy" },
  { label: "السونار والحمل", href: "/ultrasound" },
  { label: "المقالات الطبية", href: "/articles" },
  { label: "عن د. هيثم", href: "/doctor" },
  { label: "تواصل معنا", href: "/contact" },
];

export const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "عن الموقع", href: "/about" },
  { label: "عن الطبيب", href: "/doctor" },
  { label: "المراجعة الطبية", href: "/medical-review" },
  { label: "المصادر", href: "/sources" },
  { label: "إخلاء المسؤولية الطبية", href: "/medical-disclaimer" },
  { label: "سياسة الخصوصية", href: "/privacy" },
  { label: "تواصل معنا", href: "/contact" },
];

export const NO_SALE_NOTICE =
  "هذا الموقع منصة تثقيف طبي فقط. لا نبيع الأدوية ولا نروّج لبيعها، ولا نقدم أسعارًا أو طرق شراء أو توصيل أو جرعات فردية. الأدوية الموصوفة تُستخدم فقط تحت إشراف طبي مباشر.";
