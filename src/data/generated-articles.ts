import type { Article } from "./types";

export const GENERATED_ARTICLES: Article[] = [
  {
    slug: "sample-medical-article",
    title: "دليل الإرشادات الطبية المعتمدة",
    excerpt: "دليل شامل وموسع حول الاشتراطات والتحذيرات الطبية اللازمة.",
    category: "صحة المرأة",
    categoryHref: "/womens-health",
    primaryKeyword: "الإرشادات الطبية",
    author: "فريق تحرير دليل صحة المرأة",
    medicalReviewer: "د. هيثم الخطيب",
    datePublished: "2026-08-20",
    dateModified: "2026-08-20",
    readingTime: 5,
    content: [
      {
        type: "p",
        text: "يُعد هذا المقال مرجعاً أساسياً للإرشادات الطبية المعتمدة وفقاً للبروتوكولات السريرية الحديثة."
      }
    ],
    sources: ["https://femseha.com/"],
    relatedArticles: []
  }
];
