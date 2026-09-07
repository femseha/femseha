import type { ArticleRecord } from "./types";
import articlesData from "./articles.json";
import seoSupportingArticles from "./seo-supporting-articles.json";
import seoContentBatch01 from "./seo-content-batch-01.json";
import seoContentBatch02 from "./seo-content-batch-02.json";
import seoContentBatch03 from "./seo-content-batch-03.json";
import seoContentBatch04 from "./seo-content-batch-04.json";
import seoContentBatch05 from "./seo-content-batch-05.json";
import seoContentBatch06 from "./seo-content-batch-06.json";
import seoContentBatch07 from "./seo-content-batch-07.json";
import seoContentBatch08 from "./seo-content-batch-08.json";
import seoContentBatch09 from "./seo-content-batch-09.json";
import seoContentBatch10 from "./seo-content-batch-10.json";
import seoContentBatch11 from "./seo-content-batch-11.json";
import seoSupportingFaq from "./seo-supporting-faq.json";
import seoClusterLinks from "./seo-cluster-links.json";
import seoPillarOverrides from "./seo-pillar-overrides.json";
import seoLegacyOverrides from "./seo-legacy-overrides.json";
import seoContentOverrides from "./seo-content-overrides.json";
import { seoGulfPillarOverrides } from "./seo-gulf-pillar-overrides";
import { seoGulfTrustSections } from "./seo-gulf-trust-sections";
import { seoGulfInternalLinks } from "./seo-gulf-internal-links";
import { isIndexableArticle, sanitizeArticle } from "./seo-quality";

const faqBySlug = seoSupportingFaq as Record<string, ArticleRecord["faq"]>;
const clusterLinksBySlug = seoClusterLinks as Record<string, string[]>;
const pillarOverrides = seoPillarOverrides as Record<string, { title?: string; summary?: string; contentPrefix?: string; contentAppend?: string }>;
const legacyOverrides = seoLegacyOverrides as Record<string, { title?: string; summary?: string; primaryKeyword?: string; contentReplace?: string; faqReplace?: ArticleRecord["faq"]; relatedReplace?: string[] }>;
const contentOverrides = seoContentOverrides as Record<string, { contentReplace?: string; sources?: ArticleRecord["sources"] }>;

const allArticles = [
  ...(articlesData as ArticleRecord[]), ...(seoSupportingArticles as ArticleRecord[]),
  ...(seoContentBatch01 as ArticleRecord[]), ...(seoContentBatch02 as ArticleRecord[]),
  ...(seoContentBatch03 as ArticleRecord[]), ...(seoContentBatch04 as ArticleRecord[]),
  ...(seoContentBatch05 as ArticleRecord[]), ...(seoContentBatch06 as ArticleRecord[]),
  ...(seoContentBatch07 as ArticleRecord[]), ...(seoContentBatch08 as ArticleRecord[]),
  ...(seoContentBatch09 as ArticleRecord[]), ...(seoContentBatch10 as ArticleRecord[]),
  ...(seoContentBatch11 as ArticleRecord[]),
];

const uniqueArticles = allArticles.filter((article, index, list) => list.findIndex((item) => item.slug === article.slug) === index);

export const articles: ArticleRecord[] = uniqueArticles.map((article) => {
  const faq = faqBySlug[article.slug]; const clusterLinks = clusterLinksBySlug[article.slug];
  const override = pillarOverrides[article.slug]; const legacyOverride = legacyOverrides[article.title]; const contentOverride = contentOverrides[article.slug]; const gulfOverride = seoGulfPillarOverrides[article.slug];
  const withFaq = !faq || article.faq?.length ? article : { ...article, faq };
  const withPillar = override ? { ...withFaq, ...(override.title ? { title: override.title } : {}), ...(override.summary ? { summary: override.summary } : {}), ...(override.contentPrefix ? { content: `${override.contentPrefix}\n\n${withFaq.content}` } : {}), ...(override.contentAppend ? { content: `${withFaq.content}\n\n${override.contentAppend}` } : {}) } : withFaq;
  const withLegacy = legacyOverride ? { ...withPillar, ...(legacyOverride.title ? { title: legacyOverride.title } : {}), ...(legacyOverride.summary ? { summary: legacyOverride.summary } : {}), ...(legacyOverride.primaryKeyword ? { primaryKeyword: legacyOverride.primaryKeyword } : {}), ...(legacyOverride.contentReplace ? { content: legacyOverride.contentReplace } : {}), ...(legacyOverride.faqReplace ? { faq: legacyOverride.faqReplace } : {}), ...(legacyOverride.relatedReplace ? { related: legacyOverride.relatedReplace } : {}) } : withPillar;
  const withContent = contentOverride ? { ...withLegacy, ...(contentOverride.contentReplace ? { content: contentOverride.contentReplace } : {}), ...(contentOverride.sources ? { sources: contentOverride.sources } : {}) } : withLegacy;
  const withGulf = gulfOverride ? { ...withContent, title: gulfOverride.title, summary: gulfOverride.summary, primaryKeyword: gulfOverride.primaryKeyword, secondaryKeywords: gulfOverride.secondaryKeywords, content: `${seoGulfTrustSections[article.slug] || ""}\n\n${gulfOverride.content}`, faq: gulfOverride.faq, sources: gulfOverride.sources, related: gulfOverride.related } : withContent;
  const gulfLinks = seoGulfInternalLinks[article.slug] || [];
  const withNetworkLinks = gulfLinks.length
    ? { ...withGulf, related: [...gulfLinks, ...(withGulf.related || [])].filter((slug, index, list) => list.indexOf(slug) === index && slug !== article.slug) }
    : withGulf;
  const withRelated = clusterLinks?.length
    ? {
        ...withNetworkLinks,
        related: [...clusterLinks, ...(withNetworkLinks.related || [])].filter((slug, index, list) => list.indexOf(slug) === index && slug !== article.slug),
      }
    : withNetworkLinks;
  return sanitizeArticle(withRelated);
});

export function getArticleBySlug(slug?: string): ArticleRecord | undefined { if (!slug) return undefined; return articles.find((article) => article.slug === slug); }
export function relatedArticles(article: ArticleRecord, limit = 3): ArticleRecord[] {
  const preferred = (article.related || [])
    .map((slug) => getArticleBySlug(slug))
    .filter((item): item is ArticleRecord => Boolean(item) && isIndexableArticle(item));
  const fallback = articles.filter((item) => item.slug !== article.slug && isIndexableArticle(item) && !preferred.some((p) => p.slug === item.slug));
  return [...preferred, ...fallback].slice(0, limit);
}
export const articleCategories = Array.from(new Map(articles.filter(isIndexableArticle).map((article) => [article.category, article.categoryName])).entries()).map(([slug, name]) => ({ slug, name }));
export const GENERATED_ARTICLES = articles;
