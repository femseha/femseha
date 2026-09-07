/**
 * شبكة الربط الداخلي لعنقود سايتوتك/الميزوبروستول.
 * الهدف: جعل صفحة السعودية هي المرجع المحوري، وربط صفحات الخليج ببعضها
 * وبصفحات السلامة ذات الصلة دون إنشاء صفحات متنافسة لنفس نية البحث.
 */
export const seoGulfInternalLinks: Record<string, string[]> = {
  "cytotec-misoprostol-saudi-riyadh-guide": [
    "abortion-medicines-kuwait-medical-guide",
    "abortion-regulations-bahrain-medical-guide",
    "abortion-regulations-uae-medical-guide",
    "abortion-regulations-qatar-medical-guide",
    "danger-signs-after-medical-abortion-saudi",
    "bleeding-after-medical-abortion-saudi",
  ],
  "abortion-regulations-bahrain-medical-guide": [
    "cytotec-misoprostol-saudi-riyadh-guide",
    "abortion-medicines-kuwait-medical-guide",
    "abortion-regulations-uae-medical-guide",
    "abortion-regulations-qatar-medical-guide",
    "abortion-medicines-bahrain-medical-guide",
  ],
  "abortion-medicines-kuwait-medical-guide": [
    "cytotec-misoprostol-saudi-riyadh-guide",
    "abortion-regulations-bahrain-medical-guide",
    "abortion-regulations-uae-medical-guide",
    "abortion-regulations-qatar-medical-guide",
  ],
  "abortion-regulations-uae-medical-guide": [
    "cytotec-misoprostol-saudi-riyadh-guide",
    "abortion-medicines-kuwait-medical-guide",
    "abortion-regulations-bahrain-medical-guide",
    "abortion-regulations-qatar-medical-guide",
  ],
  "abortion-regulations-qatar-medical-guide": [
    "cytotec-misoprostol-saudi-riyadh-guide",
    "abortion-medicines-kuwait-medical-guide",
    "abortion-regulations-bahrain-medical-guide",
    "abortion-regulations-uae-medical-guide",
  ],
};
