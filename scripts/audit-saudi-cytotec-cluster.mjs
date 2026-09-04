import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const articlesPath = path.join(root, 'src/data/articles.json');
const supportingPath = path.join(root, 'src/data/seo-supporting-articles.json');
const sitemapPath = path.join(root, 'public/sitemap.xml');

const PILLAR_SLUG = 'cytotec-misoprostol-saudi-riyadh-guide';
const SUPPORTING_SLUGS = [
  'danger-signs-after-medical-abortion-saudi',
  'bleeding-after-medical-abortion-saudi',
  'ectopic-pregnancy-abortion-medicines-saudi',
];

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const articles = [
  ...readJson(articlesPath),
  ...readJson(supportingPath),
];
const sitemap = fs.readFileSync(sitemapPath, 'utf8');

const bySlug = new Map(articles.map((article) => [article.slug, article]));
const pillar = bySlug.get(PILLAR_SLUG);

if (!pillar) fail(`pillar missing: ${PILLAR_SLUG}`);
if (pillar?.primaryKeyword !== 'سايتوتك في السعودية') {
  fail('pillar primary keyword must remain exactly: سايتوتك في السعودية');
}

for (const slug of SUPPORTING_SLUGS) {
  const article = bySlug.get(slug);
  if (!article) {
    fail(`supporting article missing: ${slug}`);
    continue;
  }

  if (!article.primaryKeyword) fail(`${slug}: missing primaryKeyword`);
  if (article.primaryKeyword === pillar?.primaryKeyword) {
    fail(`${slug}: cannibalizes the pillar primary keyword`);
  }

  const body = `${article.title}\n${article.summary}\n${article.content}`;
  if (!body.includes(`/articles/${PILLAR_SLUG}`)) {
    fail(`${slug}: must link to the Saudi pillar`);
  }

  const unsafePatterns = [
    /اطلب(?:ي)?\s+(?:سايتوتك|ميزوبروستول)/i,
    /اشتر(?:ي)?\s+(?:سايتوتك|ميزوبروستول)/i,
    /(?:شراء|بيع|توصيل|سعر|أسعار)\s+(?:سايتوتك|ميزوبروستول)/i,
    /(?:جرعة|جرعات)\s+(?:سايتوتك|ميزوبروستول)/i,
  ];
  for (const pattern of unsafePatterns) {
    if (pattern.test(body)) {
      fail(`${slug}: unsafe commercial or dosing pattern detected: ${pattern}`);
    }
  }
}

const primaryKeywords = articles
  .map((article) => article.primaryKeyword)
  .filter(Boolean);
const keywordCounts = new Map();
for (const keyword of primaryKeywords) {
  keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
}
for (const [keyword, count] of keywordCounts) {
  if (count > 1 && keyword === 'سايتوتك في السعودية') {
    fail(`duplicate pillar primary keyword detected: ${keyword}`);
  }
}

for (const slug of [PILLAR_SLUG, ...SUPPORTING_SLUGS]) {
  const marker = `https://femseha.com/articles/${slug}`;
  if (!sitemap.includes(marker)) fail(`missing sitemap URL: ${marker}`);
}

if (process.exitCode) {
  console.error('Saudi Cytotec cluster audit failed. Do not merge.');
} else {
  console.log('PASS: Saudi Cytotec cluster guardrails are satisfied.');
  console.log(`- pillar: ${PILLAR_SLUG}`);
  console.log(`- supporting articles: ${SUPPORTING_SLUGS.length}`);
  console.log('- pillar keyword is unique');
  console.log('- supporting articles link to pillar');
  console.log('- sitemap contains all cluster URLs');
  console.log('- no targeted commercial/dosing patterns found');
}
