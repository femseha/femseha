import type { Article } from "./types";
import { S } from "./sources";

const AUTHOR = "فريق تحرير دليل صحة المرأة";
const REVIEWER = "د. هيثم الخطيب";

export const ARTICLES: Article[] = [
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
  }
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
