#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Prerender SEO Head — منصة FemSeha | فيم صحة
 * ═══════════════════════════════════════════════════════════════════════════
 * لماذا هذا الملف موجود (عطل مثبت في الإنتاج):
 *   الموقع تطبيق Vite/React أحادي الصفحة، وVercel يعيد كتابة كل المسارات إلى
 *   index.html نفسه. لذلك كان HTML الأولي (قبل تنفيذ JavaScript) لأي مقال
 *   يحمل عنوان الصفحة الرئيسية ووصفها، والأخطر:
 *       <link rel="canonical" href="https://femseha.com/">
 *   أي أن كل صفحة مقال كانت تعلن canonical للصفحة الرئيسية في مصدر الصفحة.
 *
 * الإصلاح (أقل تغيير ممكن داخل نفس المعمارية — بلا SSR وبلا تغيير framework):
 *   بعد `vite build` نكتب نسخة ثابتة من نفس الغلاف لكل مسار حقيقي، مع
 *   <title> و<meta description> و<link canonical> ووسوم OG/Twitter وبيانات
 *   JSON-LD الصحيحة لذلك المسار. جسم الصفحة يبقى كما هو (نفس تطبيق React)،
 *   فلا يتغير أي سلوك للمستخدم ولا يُعاد تصميم أي شيء.
 *
 * مصدر البيانات الوحيد: src/data/articles.json + src/lib/seo.ts (نفس مولّدات
 * JSON-LD التي يستخدمها التطبيق) — لا تُكرَّر أي قيمة ولا تُخترع بيانات.
 *
 * التشغيل: node scripts/prerender-seo.mjs   (مربوط بـ npm run build)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const SHELL = path.join(DIST, "index.html");

const escapeAttr = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeJsonLd = (s) => String(s).replace(/</g, "\\u003c");

function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(title)}</title>`);
}

function setMeta(html, attr, key, content) {
  const re = new RegExp(`<meta\\s+${attr}=["']${key}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function setCanonical(html, url) {
  const re = /<link\s+rel=["']canonical["'][^>]*>/i;
  const tag = `<link rel="canonical" href="${escapeAttr(url)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function appendJsonLd(html, items) {
  const scripts = items
    .filter(Boolean)
    .map(
      (obj) =>
        `    <script type="application/ld+json" data-seo="page">${escapeJsonLd(JSON.stringify(obj))}</script>`
    )
    .join("\n");
  if (!scripts) return html;
  return html.replace(/<\/head>/i, `${scripts}\n  </head>`);
}

/** بناء صفحة ثابتة لمسار واحد من غلاف البناء */
function buildPage(shell, { url, title, description, type, jsonLd, image }) {
  let html = shell;
  html = setTitle(html, title);
  html = setMeta(html, "name", "description", description);
  html = setCanonical(html, url);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:type", type || "website");
  if (image) html = setMeta(html, "property", "og:image", image);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  if (image) html = setMeta(html, "name", "twitter:image", image);
  html = appendJsonLd(html, jsonLd || []);
  return html;
}

function writePage(routePath, html) {
  const dir = routePath === "/" ? DIST : path.join(DIST, routePath.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "index.html");
  fs.writeFileSync(file, html, "utf8");
  return file;
}

async function main() {
  if (!fs.existsSync(SHELL)) {
    console.error("✖ prerender-seo: لا يوجد dist/index.html — شغّل vite build أولاً.");
    process.exit(1);
  }
  const shell = fs.readFileSync(SHELL, "utf8");

  const server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });

  let failures = 0;
  try {
    const seo = await server.ssrLoadModule("/src/lib/seo.ts");
    const siteMod = await server.ssrLoadModule("/src/data/site.ts");
    const articlesMod = await server.ssrLoadModule("/src/data/articles.ts");
    const SITE = siteMod.SITE;
    const DOCTOR = siteMod.DOCTOR;
    const articles = articlesMod.articles;
    const base = SITE.url.replace(/\/+$/, "");
    const defaultImage = `${base}/banner.jpg.png`;

    /** المسارات الثابتة — مطابقة لاستدعاءات useSeo في صفحاتها (المصدر: src/pages/*) */
    const staticRoutes = [
      {
        path: "/articles",
        title: "الأدلة الطبية والمقالات | منصة فصيحة الطبية",
        description:
          "مكتبة الأدلة الطبية في منصة فصيحة: مقالات موثوقة في صحة المرأة والخصوبة والحمل والأدوية بإشراف د. هيثم الخطيب.",
        jsonLd: [
          seo.websiteJsonLd(),
          seo.breadcrumbJsonLd([
            { name: "الرئيسية", href: "/" },
            { name: "الأدلة الطبية", href: "/articles" },
          ]),
        ],
      },
      {
        path: "/doctor",
        title: `عن الطبيب | ${DOCTOR.name} | منصة فصيحة الطبية`,
        description: `${DOCTOR.name} — ${DOCTOR.title}. ${DOCTOR.experience}. استشارات طبية تخصصية في صحة المرأة والتوليد والعقم.`,
        jsonLd: [
          seo.websiteJsonLd(),
          seo.doctorJsonLd(),
          seo.breadcrumbJsonLd([
            { name: "الرئيسية", href: "/" },
            { name: "عن الطبيب", href: "/doctor" },
          ]),
        ],
      },
      {
        path: "/consultation",
        title: "الاستشارة الطبية | د. هيثم الخطيب | منصة فصيحة الطبية",
        description:
          "احجزي استشارتك الطبية مع د. هيثم الخطيب، اختصاصي جراحة النساء والتوليد والعقم، عبر الهاتف أو واتساب بسرية تامة.",
        jsonLd: [
          seo.websiteJsonLd(),
          seo.doctorJsonLd(),
          seo.breadcrumbJsonLd([
            { name: "الرئيسية", href: "/" },
            { name: "الاستشارة الطبية", href: "/consultation" },
          ]),
        ],
      },
      {
        path: "/medical-disclaimer",
        title: "إخلاء المسؤولية الطبية | منصة فصيحة الطبية",
        description:
          "إخلاء المسؤولية الطبية لمنصة فصيحة: المحتوى تثقيفي عام بإشراف د. هيثم الخطيب ولا يغني عن التقييم الطبي المباشر.",
        jsonLd: [seo.websiteJsonLd()],
      },
    ];

    const pages = [];

    for (const route of staticRoutes) {
      pages.push({
        route: route.path,
        url: `${base}${route.path}`,
        title: route.title,
        description: route.description,
        type: "website",
        image: defaultImage,
        jsonLd: route.jsonLd,
      });
    }

    // صفحات المقالات — نفس قيم ArticleView تماماً (العنوان/الوصف/canonical/JSON-LD)
    for (const article of articles) {
      const title = `${article.title} | منصة فصيحة الطبية`;
      const description = (article.summary || "").slice(0, 160);
      pages.push({
        route: `/articles/${article.slug}`,
        url: `${base}/articles/${article.slug}`,
        title,
        description,
        type: "article",
        image: defaultImage,
        jsonLd: [
          seo.websiteJsonLd(),
          seo.articleJsonLd(article),
          seo.breadcrumbJsonLd([
            { name: "الرئيسية", href: "/" },
            { name: "الأدلة الطبية", href: "/articles" },
            { name: article.title, href: `/articles/${article.slug}` },
          ]),
          ...(article.faq && article.faq.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: article.faq.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                },
              ]
            : []),
        ],
      });
    }

    for (const page of pages) {
      const html = buildPage(shell, page);
      const file = writePage(page.route, html);

      // تحقق فوري من الملف المكتوب (لا نعلن نجاحاً دون فحص)
      const written = fs.readFileSync(file, "utf8");
      const canonicals = [...written.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/gi)].map(
        (m) => m[1]
      );
      const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(written);
      const descMatch = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i.exec(written);
      const problems = [];
      if (canonicals.length !== 1) problems.push(`عدد وسوم canonical = ${canonicals.length}`);
      else if (canonicals[0] !== page.url) problems.push(`canonical خاطئ: ${canonicals[0]}`);
      if (!titleMatch || titleMatch[1] !== escapeAttr(page.title)) problems.push("title غير مطابق");
      if (!descMatch || !descMatch[1]) problems.push("description مفقود");
      if (/<meta\s+name=["']robots["']/i.test(written)) problems.push("وسم robots غير متوقع في HTML الأولي");
      if (!/id="root"/.test(written)) problems.push("غلاف التطبيق مفقود (id=root)");

      if (problems.length) {
        failures += 1;
        console.log(`FAIL  ${page.route}  →  ${problems.join(" | ")}`);
      } else {
        console.log(`PASS  ${page.route}`);
      }
    }

    console.log(
      failures === 0
        ? `\n✔ prerender-seo: ${pages.length} صفحة ثابتة بوسوم SEO صحيحة.`
        : `\n✖ prerender-seo: ${failures} صفحة فشلت.`
    );
  } finally {
    await server.close();
  }

  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(`✖ prerender-seo: ${e.stack || e.message}`);
  process.exit(1);
});
