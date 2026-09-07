#!/usr/bin/env node

const SITE = "https://femseha.com";
const CRITICAL_PATHS = [
  "/",
  "/articles",
  "/doctor",
  "/consultation",
  "/medical-disclaimer",
  "/articles/cytotec-misoprostol-saudi-riyadh-guide",
  "/articles/abortion-regulations-bahrain-medical-guide",
  "/articles/abortion-medicines-kuwait-medical-guide",
  "/articles/abortion-regulations-uae-medical-guide",
  "/articles/abortion-regulations-qatar-medical-guide",
];

const timeoutMs = 20_000;
let errors = 0;
const error = (message) => {
  errors += 1;
  console.error(`✖ ${message}`);
};
const ok = (message) => console.log(`✔ ${message}`);

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "FemSeha-SEO-Guardian/1.0" },
    });
    const body = await response.text();
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

function canonicalFrom(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
  return match?.[1] || null;
}

function titleFrom(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null;
}

function hasNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
    || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
}

console.log("FemSeha SEO Guardian — production check");
console.log(`Site: ${SITE}`);

let sitemap;
try {
  sitemap = await fetchText(`${SITE}/sitemap.xml`);
  if (!sitemap.response.ok) error(`sitemap.xml returned HTTP ${sitemap.response.status}`);
  else if (!sitemap.body.includes("<urlset")) error("sitemap.xml is not a valid urlset");
  else ok("sitemap.xml is reachable");
} catch (err) {
  error(`sitemap.xml request failed: ${err.message}`);
}

if (sitemap?.body) {
  for (const path of CRITICAL_PATHS) {
    if (!sitemap.body.includes(`<loc>${SITE}${path === "/" ? "/" : path}</loc>`)) {
      error(`critical URL missing from sitemap: ${path}`);
    }
  }
}

for (const path of CRITICAL_PATHS) {
  const url = `${SITE}${path}`;
  try {
    const { response, body } = await fetchText(url);
    if (!response.ok) {
      error(`${path}: HTTP ${response.status}`);
      continue;
    }
    const expectedCanonical = `${SITE}${path === "/" ? "/" : path}`;
    const canonical = canonicalFrom(body);
    if (canonical !== expectedCanonical) error(`${path}: canonical is ${canonical || "missing"}`);
    if (hasNoindex(body)) error(`${path}: production HTML contains noindex`);
    if (!titleFrom(body)) error(`${path}: title is missing`);
    else ok(`${path}: HTTP ${response.status}, canonical/title/indexable HTML OK`);
  } catch (err) {
    error(`${path}: request failed: ${err.message}`);
  }
}

console.log(`SEO Guardian result: errors=${errors}`);
if (errors) process.exit(1);
console.log("SEO Guardian PASSED");
