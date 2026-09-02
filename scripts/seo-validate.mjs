import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const ARTICLES_PATH = path.join(ROOT, "src", "data", "articles.json");
const SITEMAP_PATH = path.join(ROOT, "public", "sitemap.xml");

console.log("═══ SEO Validation & Quality Check ═══");

let errors = 0;
let warnings = 0;

// 1. Check articles.json
if (!fs.existsSync(ARTICLES_PATH)) {
  console.error("✖ Missing src/data/articles.json");
  process.exit(1);
}

const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8"));
console.log(`✔ Found ${articles.length} articles.`);

const titles = new Set();
const slugs = new Set();

articles.forEach((a, idx) => {
  const wordCount = (a.content || "").split(/\s+/).length;
  console.log(`  [${idx + 1}] ${a.slug} (${wordCount} words)`);

  if (wordCount < 1500) {
    console.error(`  ✖ Error: Article ${a.slug} has ${wordCount} words (< 1500).`);
    errors++;
  }

  if (!a.title || a.title.length < 10) {
    console.error(`  ✖ Error: Article ${a.slug} missing or short title.`);
    errors++;
  }

  if (titles.has(a.title)) {
    console.error(`  ✖ Error: Duplicate title detected: "${a.title}"`);
    errors++;
  }
  titles.add(a.title);

  if (slugs.has(a.slug)) {
    console.error(`  ✖ Error: Duplicate slug detected: "${a.slug}"`);
    errors++;
  }
  slugs.add(a.slug);

  if (!a.summary || a.summary.length < 50) {
    console.warn(`  ⚠ Warning: Article ${a.slug} summary is short.`);
    warnings++;
  }
});

// 2. Check sitemap.xml
if (!fs.existsSync(SITEMAP_PATH)) {
  console.error("✖ Missing public/sitemap.xml");
  errors++;
} else {
  const sitemapContent = fs.readFileSync(SITEMAP_PATH, "utf8");
  articles.forEach(a => {
    const loc = `https://femseha.com/articles/${a.slug}`;
    if (!sitemapContent.includes(loc)) {
      console.error(`  ✖ Error: Article URL missing from sitemap: ${loc}`);
      errors++;
    }
  });
  console.log("✔ Sitemap coverage verified for all published articles.");
}

console.log(`\nValidation complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error("✖ SEO Validation FAILED.");
  process.exit(1);
} else {
  console.log("✔ SEO Validation PASSED.");
}
