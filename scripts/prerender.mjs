import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const distDir = resolve(root, 'dist');
const ssrDir = resolve(root, '.ssr-build');
const sitemapPath = join(root, 'public', 'sitemap.xml');

if (!existsSync(distDir)) throw new Error('dist/ does not exist. Run the client build before prerendering.');
if (!existsSync(sitemapPath)) throw new Error('public/sitemap.xml does not exist. Generate the sitemap before prerendering.');

rmSync(ssrDir, { recursive: true, force: true });
execFileSync(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), 'build', '--ssr', 'src/entry-server.tsx', '--outDir', '.ssr-build'], { stdio: 'inherit' });

const server = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href);
const template = readFileSync(join(distDir, 'index.html'), 'utf8');
const urls = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((m) => decodeURIComponent(new URL(m[1]).pathname))
  .filter((path) => path && !path.includes(':') && !path.endsWith('.xml'));

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const jsonForScript = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

for (const url of [...new Set(urls)]) {
  const result = server.render(url);
  const preferredImage = result.image || 'https://femseha.com/banner.webp';
  const head = [
    `<title>${escapeHtml(result.title)}</title>`,
    `<meta name="description" content="${escapeHtml(result.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(result.canonical)}" />`,
    `<meta property="og:type" content="${escapeHtml(result.type)}" />`,
    `<meta property="og:title" content="${escapeHtml(result.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(result.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(result.canonical)}" />`,
    `<meta property="og:site_name" content="سايتوتيك - السعودية" />`,
    `<meta property="og:locale" content="ar_SA" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta property="og:image" content="${escapeHtml(preferredImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(result.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(result.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(preferredImage)}" />`,
    ...result.jsonLd.map((item) => `<script type="application/ld+json">${jsonForScript(item)}</script>`)
  ].join('\n');

  // Preserve the existing homepage metadata. For every other route, remove
  // route-owned tags from the template before inserting the route-specific head.
  const routeTemplate = url === '/' ? template : template
    .replace(/<title>[\\s\\S]*?<\\/title>/gi, '')
    .replace(/<meta\\s+name=["'](?:description|robots|keywords|twitter:[^"']+)["'][^>]*>/gi, '')
    .replace(/<meta\\s+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/<link\\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<script\\s+type=["']application\\/ld\\+json["'][^>]*>[\\s\\S]*?<\\/script>/gi, '');
  const routeHead = url === '/' ? '' : `\\n${head}\\n`;
  const html = routeTemplate
    .replace(/<div id="root"><\\/div>/i, `<div id="root">${result.html}</div>`)
    .replace('</head>', `${routeHead}</head>`);

  const output = url === '/' ? join(distDir, 'index.html') : join(distDir, url.replace(/^\\//, ''), 'index.html');
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, html, 'utf8');

  const count = (pattern) => (html.match(pattern) || []).length;
  const requiredHeadTags = [
    ['title', /<title>/gi],
    ['meta description', /<meta\\s+name=["']description["']/gi],
    ['canonical', /<link\\s+rel=["']canonical["']/gi],
    ['robots', /<meta\\s+name=["']robots["']/gi],
    ['Open Graph title', /<meta\\s+property=["']og:title["']/gi],
    ['Twitter title', /<meta\\s+name=["']twitter:title["']/gi]
  ];
  for (const [label, pattern] of requiredHeadTags) {
    if (count(pattern) !== 1) throw new Error(`${url}: expected exactly one ${label}, found ${count(pattern)}`);
  }
  const canonicalMatch = html.match(/<link\\s+rel=["']canonical["']\\s+href=["']([^"']+)["']/i);
  if (!canonicalMatch || canonicalMatch[1] !== result.canonical) {
    throw new Error(`${url}: canonical mismatch (expected ${result.canonical})`);
  }
  const h1Count = count(/<h1(?:\\s|>)/gi);
  if (h1Count !== 1) throw new Error(`${url}: expected exactly one H1 in prerendered body, found ${h1Count}`);
  if (url !== '/' && count(/<script\\s+type=["']application\\/ld\\+json["']/gi) === 0) {
    throw new Error(`${url}: route-specific JSON-LD missing`);
  }
}

rmSync(ssrDir, { recursive: true, force: true });
console.log(`Prerendered ${new Set(urls).size} sitemap routes.`);
