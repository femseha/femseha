import type { ArticleRecord } from "./types";
import articlesData from "./articles.json";

// ─────────────────────────────────────────────────────────────────────────────
// مصدر بيانات المقالات الوحيد للموقع العام.
// البيانات محفوظة في: src/data/articles.json
// ويحدَّث تلقائياً بواسطة خط النشر الآلي: scripts/generate-article.js
// (النشر لا يحدث إلا بعد اجتياز فحوصات الجودة والسلامة وتفرّد الموضوع).
// ─────────────────────────────────────────────────────────────────────────────

export const articles: ArticleRecord[] = articlesData as ArticleRecord[];

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
