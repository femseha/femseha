#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Prerender — منصة FemSeha | فيم صحة
 * ─────────────────────────────────────────────────────────────────────────────
 * المشكلة المثبتة: الموقع SPA ثابت و vercel.json يعيد كل المسارات إلى
 * dist/index.html، لذا كان HTML الخام (قبل تنفيذ JavaScript) لكل صفحة — بما فيه
 * المقالات — يحمل عنوان الوصف الرئيسية وcanonical للصفحة الرئيسية، بينما تُضبط
 * وسوم كل صفحة لاحقاً عبر useSeo في المتصفح فقط.
 *
 * الحل (أقل تغيير داخل المعمارية الحالية — لا إعادة بناء ولا إطار جديد):
 *   بعد vite build يُعاد عرض كل مسار منشور عبر نفس مدخل SSR القائم
 *   (scripts/ssr-entry.tsx) ويُكتب HTML ثابت في dist/<مسار>/index.html مع
 *   وسوم <head> محسوبة من props نفسها التي يضبطها useSeo في المتصفح
 *   (عبر computeStaticHead في src/lib/seo.ts) — فيتطابق HTML الخام مع DOM
 *   بعد التنفيذ، ويبقى التطبيق يعمل كالمعتاد (createRoot يستبدل #root).
 *
 * القواعد:
 *   - المسارات المفهرسة فقط + /admin (يُكتب مع noindex,nofollow وبلا canonical
 *     كما يفعل useSeo تماماً). صفحات 404 لا تُكتب (تبقى سلوك soft-404 القائم).
 *   - لا عناوين أو أوصاف مخترعة: كل قيمة من مصدرها (useSeo/الصفحة نفسها).
 *   - robots.txt و sitemap.xml لا يُلمسان هنا (مولّدهما القائم كما هو).
 *
 * التشغيل: يُستدعى تلقائياً بعد vite build داخل npm run build،
 * أو مباشرة: node scripts/prerender.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */
import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const TEMPLATE_PATH = path.join(DIST, "index.html");
const ARTICLES_PATH = path.join(ROOT, "src", "data", "articles.json");

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error("✖ prerender: dist/index.html غير موجود — شغّل vite build أولاً (npm run build).");
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8"));

/** المسارات المولدة: الثابتة العامة + /admin (noindex) + كل مقال منشور */
function buildRoutes() {
  const routes = [
    { path: "/" },
    { path: "/articles" },
    { path: "/doctor" },
    { path: "/consultation" },
    { path: "/medical-disclaimer" },
    { path: "/admin" }, // useSeo يضبط noindex,nofollow ويحذف canonical — يُحترم كما هو
  ];
  for (const a of articles) {
    if (a && a.slug && /^[a-z0-9-]+$/.test(a.slug)) routes.push({ path: `/articles/${a.slug}` });
  }
  return routes;
}

const escapeAttr = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** JSON-LD آمن داخل وسم script (منع كسر </script>) */
const safeJsonLd = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

/** يبني وسوم <head> الخاصة بالصفحة من ناتج computeStaticHead (مرآة useSeo) */
function buildHeadTags(head) {
  const tags = [];
  tags.push(`<title>${escapeAttr(head.title)}</title>`);
  tags.push(`<meta name="description" content="${escapeAttr(head.description)}" />`);
  if (head.robots) tags.push(`<meta name="robots" content="${escapeAttr(head.robots)}" />`);
  if (head.canonicalUrl) tags.push(`<link rel="canonical" href="${escapeAttr(head.canonicalUrl)}" />`);
  tags.push(`<meta property="og:title" content="${escapeAttr(head.og.title)}" />`);
  tags.push(`<meta property="og:description" content="${escapeAttr(head.og.description)}" />`);
  tags.push(`<meta property="og:url" content="${escapeAttr(head.og.url)}" />`);
  tags.push(`<meta property="og:type" content="${escapeAttr(head.og.type)}" />`);
  tags.push(`<meta property="og:image" content="${escapeAttr(head.og.image)}" />`);
  tags.push(`<meta name="twitter:title" content="${escapeAttr(head.twitter.title)}" />`);
  tags.push(`<meta name="twitter:description" content="${escapeAttr(head.twitter.description)}" />`);
  tags.push(`<meta name="twitter:image" content="${escapeAttr(head.twitter.image)}" />`);
  for (const obj of head.jsonLd) {
    tags.push(`<script type="application/ld+json" data-seo="page">${safeJsonLd(obj)}</script>`);
  }
  return tags.join("\n    ");
}

/** يدمج وسوم الصفحة مع قالب البناء (يستبدل title/description/canonical/og/twitter) */
function mergeHead(templateHtml, pageTags, head) {
  let out = templateHtml;

  // JSON-LD الخاص بالصفحة يُضاف قبل نهاية head
  const jsonLdTags = pageTags
    .split("\n")
    .filter((l) => l.includes('data-seo="page"'))
    .join("\n    ");

  const replaceOrAppend = (re, replacement) => {
    if (re.test(out)) out = out.replace(re, replacement);
    else out = out.replace("</head>", `    ${replacement}\n  </head>`);
  };

  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(head.title)}</title>`);
  replaceOrAppend(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeAttr(head.description)}" />`);

  // robots: يُحقن عند وجوده فقط (الصفحات المفهرسة بلا وسم robots كما يفعل useSeo)
  const robotsTag = head.robots ? `<meta name="robots" content="${escapeAttr(head.robots)}" />` : "";
  if (robotsTag) replaceOrAppend(/<meta name="robots" content="[^"]*"\s*\/?>/, robotsTag);

  // canonical: يُستبدل ذاتياً أو يُزال كلياً للصفحات غير القابلة للفهرسة (admin)
  if (head.canonicalUrl) {
    replaceOrAppend(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${escapeAttr(head.canonicalUrl)}" />`);
  } else {
    out = out.replace(/<link rel="canonical" href="[^"]*"\s*\/?>\s*\n?/, "");
  }

  replaceOrAppend(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeAttr(head.og.title)}" />`);
  replaceOrAppend(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeAttr(head.og.description)}" />`);
  replaceOrAppend(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escapeAttr(head.og.url)}" />`);
  replaceOrAppend(/<meta property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${escapeAttr(head.og.type)}" />`);
  replaceOrAppend(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeAttr(head.twitter.title)}" />`);
  replaceOrAppend(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapeAttr(head.twitter.description)}" />`);

  if (jsonLdTags) out = out.replace("</head>", `    ${jsonLdTags}\n  </head>`);

  return out;
}

/* ── التنفيذ ─────────────────────────────────────────────────────────────── */

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const { renderRoute } = await server.ssrLoadModule("/scripts/ssr-entry.tsx");
  const seoMod = await server.ssrLoadModule("/src/lib/seo.ts");

  let written = 0;
  for (const route of buildRoutes()) {
    seoMod.beginSsrSeoCapture();
    const bodyHtml = renderRoute(route.path);
    const props = seoMod.capturedSsrSeo() || {};
    const head = seoMod.computeStaticHead(props);

    let html = mergeHead(template, buildHeadTags(head), head);
    const rootFilled = html.replace(
      '<div id="root"></div>',
      `<div id="root">${bodyHtml}</div>`
    );
    if (rootFilled === html) {
      throw new Error(`prerender: لم يُعثر على <div id="root"></div> في القالب (${route.path}).`);
    }
    html = rootFilled;

    const file =
      route.path === "/"
        ? TEMPLATE_PATH
        : path.join(DIST, route.path.replace(/^\//, ""), "index.html");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html, "utf8");
    written += 1;
    console.log(`✔ prerender ${route.path} → ${path.relative(ROOT, file)}`);
  }
  console.log(`\n✔ تم توليد HTML ثابت لـ ${written} مساراً (title/description/canonical/JSON-LD من مصدر useSeo نفسه).`);
} finally {
  await server.close();
}
