import type { ArticleRecord } from './types';

export const SAUDI_CYTOTEC_PILLAR = 'cytotec-misoprostol-saudi-riyadh-guide';

/** إصلاح آثار النصوص العربية التي تسربت إليها أحرف لاتينية منفردة. */
export function normalizeArabicArtifacts(text: string): string {
  return text
    .replace(/الD(?=[\u0600-\u06FF])/g, 'الد')
    .replace(/الM(?=[\u0600-\u06FF])/g, 'الم')
    .replace(/الR(?=[\u0600-\u06FF])/g, 'الر')
    .replace(/الW(?=[\u0600-\u06FF])/g, 'الو')
    .replace(/الm(?=[\u0600-\u06FF])/g, 'الم')
    .replace(/([\u0600-\u06FF])D(?=[\u0600-\u06FF])/g, '$1د')
    .replace(/([\u0600-\u06FF])M(?=[\u0600-\u06FF])/g, '$1م')
    .replace(/([\u0600-\u06FF])R(?=[\u0600-\u06FF])/g, '$1ر')
    .replace(/([\u0600-\u06FF])W(?=[\u0600-\u06FF])/g, '$1و')
    .replace(/([\u0600-\u06FF])m(?=[\u0600-\u06FF])/g, '$1م')
    .replace(/([\u0600-\u06FF])m(?=\s|$|[،,.!?؛:])/g, '$1م')
    .replace(/منصة\s+فصيحة(?:\s+الطبية)?/g, 'منصة FemSeha')
    .replace(/فصيحة الطبية/g, 'FemSeha الطبية');
}

/** إزالة الفقرات المتطابقة المكررة مع الإبقاء على أول نسخة فقط. */
export function dedupeContent(content: string): string {
  const blocks = content.split(/\n\s*\n/);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;
    const key = block.replace(/\s+/g, ' ').trim();
    if (key.length >= 120) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    result.push(block);
  }

  return result.join('\n\n');
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 200));
}

export function sanitizeArticle(article: ArticleRecord): ArticleRecord {
  const title = normalizeArabicArtifacts(article.title);
  const summary = normalizeArabicArtifacts(article.summary);
  const content = dedupeContent(normalizeArabicArtifacts(article.content));

  return { ...article, title, summary, content, readTime: estimateReadTime(content) };
}

export function isConsolidatedCytotecArticle(article: ArticleRecord): boolean {
  if (article.slug === SAUDI_CYTOTEC_PILLAR) return false;
  if (article.slug === 'cytotec-in-saudi-arabia-medical-info-risks') return true;

  const title = normalizeArabicArtifacts(article.title);
  const keyword = normalizeArabicArtifacts(article.primaryKeyword || '');

  return (
    keyword === 'حبوب سايتوتك في السعودية' ||
    /ميزوبرستول في السعودية\s*\|\s*الموقع الرسمي/i.test(title) ||
    /سايتوتك في السعودية\s*\|\s*بقلم/i.test(title) ||
    /حبوب سايتوتك في السعودية\s*:\s*أسرار/i.test(title) ||
    /حبوب سايتوتك الأصلية في السعودية/i.test(title)
  );
}

export function isIndexableArticle(article: ArticleRecord): boolean {
  return !isConsolidatedCytotecArticle(article);
}
