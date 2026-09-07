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

  // صفحات سعودية قائمة تتلقى ظهورًا على نوايا سايتوتك/الإجهاض؛
  // نعيد توجيه القوة الداخلية إلى الركيزة بدل إنشاء صفحات جديدة.
  "misoprostol-in-saudi-arabia": ["cytotec-misoprostol-saudi-riyadh-guide"],
  "misoprostol": ["cytotec-misoprostol-saudi-riyadh-guide"],
  "cytotec-200-medical-uses-risks-unauthorized-websites": ["cytotec-misoprostol-saudi-riyadh-guide"],
  "cytotec-in-saudi-arabia": ["cytotec-misoprostol-saudi-riyadh-guide"],
  "حبوب-سايتوتك-في-السعودية": ["cytotec-misoprostol-saudi-riyadh-guide"],
  "حبوب-سايتوتك-في-السعودية-أسرار-فترة-الملكة-والتسبيع-والتنبيه-الطبي": ["cytotec-misoprostol-saudi-riyadh-guide"],
  "أسماء-حبوب-الإجهاض-ومجهضات-الحمل-الأخرى-وأضرارها-دكتور-هيثم-الخطيب": ["cytotec-misoprostol-saudi-riyadh-guide"],
  "الأدوية-المستخدمة-طبياً-للإجهاض-في-السعودية": ["cytotec-misoprostol-saudi-riyadh-guide"],
  "حبوب-الميفيبريستون-بالسعودية": ["cytotec-misoprostol-saudi-riyadh-guide"],
};
