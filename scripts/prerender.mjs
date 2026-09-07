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
execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', 'build', '--ssr', 'src/entry-server.tsx', '--outDir', '.ssr-build'], { stdio: 'inherit' });

const server = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href);
const template = readFileSync(join(distDir, 'index.html'), 'utf8');
const urls = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname)
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
  const head = [
    `<title>${escapeHtml(result.title)}</title>`,
    `<meta name="description" content="${escapeHtml(result.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(result.canonical)}" />`,
    `<meta property="og:type" content="${escapeHtml(result.type)}" />`,
    `<meta property="og:title" content="${escapeHtml(result.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(result.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(result.canonical)}" />`,
    `<meta property="og:site_name" content="FemSeha | فيم صحة" />`,
    `<meta property="og:locale" content="ar_SA" />`,
    `<meta property="og:image" content="https://femseha.com/banner.webp" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(result.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(result.description)}" />`,
    `<meta name="twitter:image" content="https://femseha.com/banner.webp" />`,
    ...result.jsonLd.map((item) => `<script type="application/ld+json">${jsonForScript(item)}</script>`)
  ].join('\n');

  const html = template
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<link rel="canonical"[^>]*>/i, '')
    .replace(/<div id="root"><\/div>/i, `<div id="root">${result.html}</div>`)
    .replace('</head>', `${head}\n</head>`);

  const output = url === '/' ? join(distDir, 'index.html') : join(distDir, url.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, html, 'utf8');
}

rmSync(ssrDir, { recursive: true, force: true });
console.log(`Prerendered ${new Set(urls).size} sitemap routes.`);
