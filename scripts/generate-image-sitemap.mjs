#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "public", "image-sitemap.xml");
const SITE_URL = "https://femseha.com";

const IMAGE_ENTRIES = [
  {
    page: "/cytotec-saudi-arabia",
    image: "/images/seo/cytotec-saudi-arabia-misoprostol-medical-guide.svg"
  },
  {
    page: "/articles/ijhad-dawai-fi-al-saudia",
    image: "/images/seo/medical-abortion-saudi-safety-guide.svg"
  },
  {
    page: "/articles/adwiyat-ijhad-alhaml-fi-al-saudia",
    image: "/images/seo/abortion-medicines-saudi-medical-guide.svg"
  },
  {
    page: "/articles/danger-signs-after-medical-abortion-saudi",
    image: "/images/seo/danger-signs-medical-abortion-saudi.svg"
  },
  {
    page: "/articles/bleeding-after-medical-abortion-saudi",
    image: "/images/seo/bleeding-after-medical-abortion-guide.svg"
  },
  {
    page: "/articles/ectopic-pregnancy-abortion-medicines-saudi",
    image: "/images/seo/ectopic-pregnancy-abortion-medicines-guide.svg"
  },
  {
    page: "/articles/pregnancy-danger-signs-emergency",
    image: "/images/seo/pregnancy-danger-signs-saudi-guide.svg"
  },
  {
    page: "/articles/home-pregnancy-test-accuracy",
    image: "/images/seo/home-pregnancy-test-guide.svg"
  },
  {
    page: "/articles/early-pregnancy-symptoms-guide",
    image: "/images/seo/early-pregnancy-symptoms-guide.svg"
  },
  {
    page: "/articles/delayed-period-causes-besides-pregnancy",
    image: "/images/seo/delayed-period-causes-guide.svg"
  }
];

const escapeXml = (s) => String(s)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

function buildImageSitemap() {
  const seen = new Set();
  const blocks = [];
  for (const entry of IMAGE_ENTRIES) {
    const pageUrl = new URL(entry.page, SITE_URL).href;
    const imageUrl = new URL(entry.image, SITE_URL).href;
    const key = pageUrl + "|" + imageUrl;
    if (seen.has(key)) continue;
    seen.add(key);
    const filePath = path.join(ROOT, "public", entry.image.replace(/^\//, ""));
    if (!fs.existsSync(filePath)) {
      throw new Error(`Image sitemap asset missing: ${filePath}`);
    }
    blocks.push([
      "  <url>",
      `    <loc>${escapeXml(pageUrl)}</loc>`,
      "    <image:image>",
      `      <image:loc>${escapeXml(imageUrl)}</image:loc>`,
      "    </image:image>",
      "  </url>"
    ].join("\n"));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${blocks.join("\n")}\n</urlset>\n`;
}

export function generateImageSitemap() {
  const xml = buildImageSitemap();
  fs.writeFileSync(OUTPUT, xml, "utf8");
  return { count: IMAGE_ENTRIES.length, output: OUTPUT };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const result = generateImageSitemap();
  console.log(`Image sitemap generated: ${result.count} image-page mappings at ${result.output}`);
}
