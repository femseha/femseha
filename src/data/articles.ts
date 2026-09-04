import type { ArticleRecord } from "./types";
import articlesData from "./articles.json";
import seoSupportingArticles from "./seo-supporting-articles.json";
import seoSupportingFaq from "./seo-supporting-faq.json";

// ─────────────────────────────────────────────────────────────────────────────
// مصدر بيانات المقالات المنشورة للموقع العام.
// البيانات الأساسية محفوظة في: src/data/articles.json
// والمحتوى الداعم المركّز يُحفظ في: src/data/seo-supporting-articles.json
// ─────────────────────────────────────────────────────────────────────────────

const faqBySlug = seoSupportingFaq as Record<string, ArticleRecord["faq"]>;

const allArticles = [
  ...(articlesData as ArticleRecord[]),
  ...(seoSupportingArticles as ArticleRecord[]),
];

export const articles: ArticleRecord[] = allArticles.map((article) => {
  const faq = faqBySlug[article.slug];
  if (!faq || article.faq?.length) return article;
  return { ...article, faq };
});

/** البحث عن مقال بالمعرّف أو بالـ slug */
export function getArticleBySlug(slug?: string): ArticleRecord | undefined {
  if (!slug) return undefined;
  return articles.find((a) => a.slug === slug || a.id === slug);
}

/** مقالات ذات صلة (نفس التصنيف أولاً ثم الأحدث) */
export function relatedArticles(current: ArticleRecord, max = 3): ArticleRecord[] {
  const sameCategory = articles.filter(
    (a) => a.slug !== current.slug && a.category === current.category
  );
  const others = articles.filter(
    (a) => a.slug !== current.slug && a.category !== current.category
  );
  return [...sameCategory, ...others].slice(0, max);
}

/** قائمة التصنيفات الموجودة فعلياً في البيانات */
export function articleCategories(): { id: string; name: string }[] {
  const map = new Map<string, string>();
  for (const a of articles) {
    if (!map.has(a.category)) map.set(a.category, a.categoryName);
  }
  return [...map.entries()].map(([id, name]) => ({ id, name }));
}

// توافق مع الواجهات القديمة
export { GENERATED_ARTICLES } from "./generated-articles";
