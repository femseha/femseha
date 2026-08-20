import type { Article } from "./types";
import { S } from "./sources";

// محاولة جلب المقالات المولدة بأمان تام لضمان عدم فشل البناء أبداً
let generatedArticlesList: Article[] = [];
try {
  // @ts-ignore
  const generated = require("./generated-articles");
  if (generated && generated.GENERATED_ARTICLES) {
    generatedArticlesList = generated.GENERATED_ARTICLES;
  }
} catch (e) {
  generatedArticlesList = [];
}

const AUTHOR = "فريق تحرير دليل صحة المرأة";
const REVIEWER = "د. هيثم الخطيب";

export const ARTICLES: Article[] = [
  {
    slug: "saudi-abortion-medications-legal-medical-guide",
    title: "الوضع القانوني والطبي لأدوية الإجهاض في السعودية: التشريعات والمخاطر السريرية بإشراف د. هيثم الخطيب",
    excerpt: "دليل طبي واستشاري شامل حول الوضع القانوني لأدوية الإجهاض والسايتوتك والميزوبروستول في السعودية، المخاطر الطبية والشروط النظامية.",
    category: "صحة المرأة",
    categoryHref: "/womens-health",
    primaryKeyword: "أدوية الإجهاض",
    author: AUTHOR,
    medicalReviewer: REVIEWER,
    datePublished: "2026-08-20",
    dateModified: "2026-08-20",
    readingTime: 7,
    content: [
      {
        type: "p",
        text: "يُمنع نظاماً وصرفاً بيع أو تداول أدوية الإجهاض في الصيدليات العامة داخل المملكة العربية السعودية، ولا يمكن الحصول عليها أو استخدامها إلا داخل المستشفيات وبقرار لجان طبية متخصصة وفق شروط صارمة."
      },
      {
        type: "p",
        text: "فيما يلي التفاصيل القانونية والطبية المنظمة لهذه الأدوية في السعودية، مع توفير مراجع إضافية للتثقيف الصحي عبر دليل صحة المرأة:"
      },
      {
        type: "h2",
        text: "الوضع القانوني والرقابي"
      },
      {
        type: "ul",
        items: [
          "منع الصرف التجاري: تمنع وزارة الصحة السعودية الصيدليات التجارية منعاً باتاً من بيع الأدوية المسببة للإجهاض (مثل السايتوتك أو الميزوبروستول).",
          "المسؤولية القانونية: شراء هذه الأدوية من الإنترنت أو السوق السوداء يُعد مخالفة قانونية يعاقب عليها النظام، فضلاً عن خطورة الحصول على أدوية مغشوشة أو منتهية الصلاحية تفرز مضاعفات قاتلة.",
          "الشرعية النظامية: لا يتم اللجوء للإجهاض الدوائي أو الجراحي في المستشفيات إلا إذا كان استمرار الحمل يشكل خطراً مؤكداً على حياة الأم، أو في حال ثبوت تشوه الجنين تشوهاً خطيراً غير قابل للحياة (وفق تقرير تقره لجنة مكونة من 3 أطباء استشاريين قبل نفخ الروح)."
        ]
      },
      {
        type: "h2",
        text: "الأنواع العلمية المستخدمة بالمستشفيات"
      },
      {
        type: "p",
        text: "في الحالات الطبية المعتمدة نظاماً داخل المنشآت الصحية المعتمدة، يتم استخدام بروتوكول دوائي دقيق يتضمن:"
      },
      {
        type: "ul",
        items: [
          "ميزوبروستول (Misoprostol): (المعروف تجارياً بـ سايتوتك) يعمل على تحفيز انقباضات الرحم وتوسيع عنقه لطرد أنسجة الحمل تحت الملاحظة السريرية.",
          "ميفيبريستون (Mifepristone): يعمل على كتل هرمون البروجسترون الضروري لاستمرار نمو الحمل (يستخدم في بعض البروتوكولات المشتركة)."
        ]
      },
      {
        type: "h2",
        text: "المخاطر والتحذيرات الطبية"
      },
      {
        type: "p",
        text: "استخدام هذه الأدوية بشكل عشوائي دون إشراف طبي مباشر داخل المستشفى يرفع احتمالية التعرض للمخاطر التالية بشكل حاد:"
      },
      {
        type: "ul",
        items: [
          "النزيف الحاد: قد يؤدي إلى هبوط حاد في الدورة الدموية يستدعي نقلاً فورياً للدم والتدخل الإسعافي الفوري.",
          "الإجهاض غير الكامل: بقاء أجزاء من الجنين أو المشيمة داخل الرحم، مما يسبب تسمماً في الدم أو التهابات حادة قد تنتهي باستئصال الرحم أو الوفاة.",
          "تمزق الرحم: خاصة لدى النساء اللواتي خضعن لعمليات قيصرية سابقة."
        ]
      },
      {
        type: "note",
        text: "إخلاء مسؤولية طبية واستشارية: يهدف هذا المقال إلى التثقيف الصحي والتوعية بالأنظمة الطبية والقانونية المعتمدة في المملكة العربية السعودية. لا يُغني هذا المحتوى عن الاستشارة الطبية المباشرة والفحص السريري في المؤسسات الصحية الرسمية."
      }
    ],
    sources: [
      "https://femseha.com/",
      "https://sehaher.com/",
      "https://taxiporteu.com/"
    ],
    relatedArticles: [
      "misoprostol-uses-safety",
      "delayed-period-causes",
      "when-to-see-obgyn"
    ]
  },
  {
    slug: "misoprostol-uses-safety",
    title: "استخدامات حبوب سايتوتك ومواصفاتها الطبية والتحذيرات اللازمة",
    excerpt: "تعرف على دواعي استخدام ميزوبروستول (سايتوتك)، مواصفاته العلمية، والاشتراطات الطبية المعتمدة لاستخدامه الآمن.",
    category: "صحة المرأة",
    categoryHref: "/womens-health",
    primaryKeyword: "حبوب سايتوتك",
    author: AUTHOR,
    medicalReviewer: REVIEWER,
    datePublished: "2026-08-15",
    dateModified: "2026-08-15",
    readingTime: 5,
    content: [
      {
        type: "p",
        text: "يُعد عقار سايتوتك (Cytotec) الذي يحتوي على المادة الفعالة ميزوبروستول (Misoprostol) أحد الأدوية الحساسة التي تخضع لرقابة طبية صارمة في المنشآت الصحية المعتمدة."
      },
      {
        type: "h2",
        text: "المواصفات العلمية والدوائية"
      },
      {
        type: "p",
        text: "يستخدم الدواء طبياً ضمن بروتوكولات محددة تحت إشراف استشاري النساء والتوليد، ويُمنع تداوله عشوائياً خارج المستشفيات حفاظاً على السلامة العامة."
      }
    ],
    sources: [S.WHO, S.MIN_HEALTH],
    relatedArticles: ["delayed-period-causes", "when-to-see-obgyn"]
  },
  ...generatedArticlesList
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function articlesBySlugs(slugs: string[]): Article[] {
  return slugs.map((s) => getArticle(s)).filter((a): a is Article => Boolean(a));
}

export const LATEST_ARTICLES = [...ARTICLES].sort((a, b) =>
  b.datePublished.localeCompare(a.datePublished),
);
