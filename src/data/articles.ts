import baseArticles from "./articles.json";
import seoSupportingArticles from "./seo-supporting-articles.json";
import seoBatch01 from "./seo-content-batch-01.json";
import seoBatch02 from "./seo-content-batch-02.json";
import seoBatch03 from "./seo-content-batch-03.json";
import seoBatch04 from "./seo-content-batch-04.json";
import seoBatch05 from "./seo-content-batch-05.json";
import seoBatch06 from "./seo-content-batch-06.json";
import seoBatch07 from "./seo-content-batch-07.json";
import seoBatch08 from "./seo-content-batch-08.json";
import seoBatch09 from "./seo-content-batch-09.json";
import seoBatch10 from "./seo-content-batch-10.json";
import seoBatch11 from "./seo-content-batch-11.json";
import seoFaq from "./seo-supporting-faq.json";
import seoClusterLinks from "./seo-cluster-links.json";
import legacyOverrides from "./seo-legacy-overrides.json";
import seoPillarOverrides from "./seo-pillar-overrides.json";
import { seoGulfPillarOverrides } from "./seo-gulf-pillar-overrides";
import { seoGulfTrustSections } from "./seo-gulf-trust-sections";
import { seoGulfInternalLinks } from "./seo-gulf-internal-links";
import type { ArticleRecord } from "./types";
import { isIndexableArticle } from "./seo-quality";

type RawArticle = Partial<ArticleRecord> & { slug: string; title: string; summary: string };

const allRaw = [
  ...(baseArticles as RawArticle[]),
  ...(seoSupportingArticles as RawArticle[]),
  ...(seoBatch01 as RawArticle[]),
  ...(seoBatch02 as RawArticle[]),
  ...(seoBatch03 as RawArticle[]),
  ...(seoBatch04 as RawArticle[]),
  ...(seoBatch05 as RawArticle[]),
  ...(seoBatch06 as RawArticle[]),
  ...(seoBatch07 as RawArticle[]),
  ...(seoBatch08 as RawArticle[]),
  ...(seoBatch09 as RawArticle[]),
  ...(seoBatch10 as RawArticle[]),
  ...(seoBatch11 as RawArticle[]),
];

const faqMap = seoFaq as Record<string, ArticleRecord["faq"]>;
const clusterMap = seoClusterLinks as Record<string, string[]>;

function sanitizeArticle(article: RawArticle): ArticleRecord {
  const fallbackCategory = article.category || "general";
  const fallbackCategoryName = article.categoryName || "صحة المرأة";
  return {
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    content: article.content || "",
    category: fallbackCategory,
    categoryName: fallbackCategoryName,
    ...(article.author ? { author: article.author } : {}),
    ...(article.publishDate ? { publishDate: article.publishDate } : {}),
    ...(article.modifiedDate ? { modifiedDate: article.modifiedDate } : {}),
    ...(article.readTime ? { readTime: article.readTime } : {}),
    ...(article.primaryKeyword ? { primaryKeyword: article.primaryKeyword } : {}),
    ...(article.secondaryKeywords ? { secondaryKeywords: article.secondaryKeywords } : {}),
    ...(article.faq ? { faq: article.faq } : {}),
    ...(article.sources ? { sources: article.sources } : {}),
    ...(article.related ? { related: article.related } : {}),
    ...(article.image ? { image: article.image } : {}),
  };
}

const merged = new Map<string, RawArticle>();
for (const item of allRaw) {
  const existing = merged.get(item.slug);
  merged.set(item.slug, existing ? { ...existing, ...item } : item);
}

export const articles: ArticleRecord[] = Array.from(merged.values()).map((article) => {
  const legacy = legacyOverrides[article.slug as keyof typeof legacyOverrides] as Partial<ArticleRecord> | undefined;
  const pillar = seoPillarOverrides[article.slug as keyof typeof seoPillarOverrides] as Partial<ArticleRecord> | undefined;
  const gulfOverride = seoGulfPillarOverrides[article.slug];
  const clusterLinks = clusterMap[article.slug];
  const faq = faqMap[article.slug];
  const withLegacy = legacy ? { ...article, ...legacy } : article;
  const withPillar = pillar ? { ...withLegacy, ...pillar } : withLegacy;
  const withFaq = faq?.length ? { ...withPillar, faq } : withPillar;
  const withContent = withFaq;
  const withGulf = gulfOverride
    ? {
        ...withContent,
        title: gulfOverride.title,
        summary: gulfOverride.summary,
        primaryKeyword: gulfOverride.primaryKeyword,
        secondaryKeywords: gulfOverride.secondaryKeywords,
        content: `${seoGulfTrustSections[article.slug] || ""}\n\n${gulfOverride.content}`,
        faq: gulfOverride.faq,
        sources: gulfOverride.sources,
        related: gulfOverride.related,
      }
    : withContent;
  const gulfLinks = seoGulfInternalLinks[article.slug] || [];
  const withNetworkLinks = gulfLinks.length
    ? {
        ...withGulf,
        related: [...gulfLinks, ...(withGulf.related || [])].filter(
          (slug, index, list) => list.indexOf(slug) === index && slug !== article.slug,
        ),
      }
    : withGulf;
  const withRelated = clusterLinks?.length
    ? {
        ...withNetworkLinks,
        related: [...clusterLinks, ...(withNetworkLinks.related || [])].filter(
          (slug, index, list) => list.indexOf(slug) === index && slug !== article.slug,
        ),
      }
    : withNetworkLinks;
  return sanitizeArticle(withRelated);
});

export function getArticleBySlug(slug?: string): ArticleRecord | undefined {
  if (!slug) return undefined;
  return articles.find((article) => article.slug === slug);
}

export function relatedArticles(article: ArticleRecord, limit = 3): ArticleRecord[] {
  const preferred = (article.related || [])
    .map((slug) => getArticleBySlug(slug))
    .filter((item): item is ArticleRecord => item !== undefined && isIndexableArticle(item));
  const fallback = articles.filter(
    (item) => article.slug !== item.slug && isIndexableArticle(item) && !preferred.some((p) => p.slug === item.slug),
  );
  return [...preferred, ...fallback].slice(0, limit);
}

export const articleCategories = Array.from(
  new Map(articles.filter(isIndexableArticle).map((article) => [article.category, article.categoryName])).entries(),
).map(([slug, name]) => ({ slug, name }));

export const GENERATED_ARTICLES = articles;
