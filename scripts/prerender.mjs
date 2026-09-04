#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * توليد HTML ثابت لكل المسارات بعد vite build (Static Prerender) — منصة فصيحة.
 * ─────────────────────────────────────────────────────────────────────────────
 * المشكلة التي يصلحها (مثبتة):
 *   الموقع SPA، وكان HTML الأولي لكل المسارات هو نسخة index.html نفسها —
 *   أي أن زاحف Google يحصل على <title>/<meta description>/<link canonical>
 *   الخاصة بالصفحة الرئيسية عند طلب رابط مقال قبل تنفيذ JavaScript.
 *
 * الحل الأدنى داخل نفس المعمارية (بلا نقل إطار ولا خادم خلفي):
 *   بعد `vite build` يُعرض التطبيق فعلياً عبر Vite SSR لكل مسار عام
 *   (نفس آلية scripts/ssr-verify.mjs القائمة)، وتُكتب ملفات HTML ثابتة
 *   في dist/<route>/index.html بوسوم SEO الصحيحة لكل صفحة (title, description,
 *   canonical, robots, JSON-LD) — مع إبقاء نفس حزم JS، فتأخذ React hydration
 *   الصفحة كما هي. مسار /admin يُكتب بـ noindex + بلا canonical.
 *
 * التشغيل: node scripts/prerender.mjs   (يُستدعى تلقائياً من npm run build)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** وسوم <head> الخاصة بالمسار — تُحقن قبل إغلاق </head>. */
function buildHeadInjection({ robots, jsonLd }) {
  let out = "";
  if (robots) {
    out += `    <meta name="robots" content="${escapeHtml(robots)}" />\n`;
  }
  if (jsonLd) {
    for (const obj of jsonLd) {
      out += `    <script type="application/ld+json" data-seo="prerender">${JSON.stringify(obj)}</script>\n`;
    }
  }
  return out;
}

/** وسم <div id="root"> المعبأ بالمحتوى المعروض. */
function rootDiv(appHtml) {
  return `<div id="root" data-prerendered="true">${appHtml}</div>`;
}

function writeRouteFile(relPath, html) {
  const file = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, "utf8");
}

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error("✖ prerender: مجلد dist غير موجود — شغّل vite build أولاً.");
    process.exit(1);
  }

  const indexHtml = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

  // خادم Vite SSR للعرض الفعلي (نفس آلية ssr-verify.mjs / seo-validate.mjs)
  const server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
    root: ROOT,
  });

  let failures = 0;
  try {
    const { renderRoute } = await server.ssrLoadModule("/scripts/ssr-entry.tsx");
    const seoMod = await server.ssrLoadModule("/src/lib/seo.ts");
    const siteMod = await server.ssrLoadModule("/src/data/site.ts");
    const articlesMod = await server.ssrLoadModule("/src/data/articles.ts");

    const SITE = siteMod.SITE;
    const articles = articlesMod.articles;

    const render = (routePath) => {
      const appHtml = renderRoute(routePath);
      if (typeof appHtml !== "string" || appHtml.length < 400) {
        throw new Error(`العرض أقصر من المتوقع للمسار ${routePath}`);
      }
      return appHtml;
    };

    /** يحقن وسوم الرأس ويستبدل #root بالمحتوى المعروض. */
    const compose = (baseHtml, { appHtml, title, description, canonical, robots, jsonLd, ogUrl }) => {
      let html = baseHtml;
      // 1) العنوان
      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
      // 2) الوصف
      html = html.replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
      );
      // 3) canonical: القالب يحمل واحد ثابت؛ نستبدله. صفحات noindex بلا canonical تزيله.
      if (canonical) {
        html = html.replace(
          /<link rel="canonical"[^>]*>/,
          `<link rel="canonical" href="${escapeHtml(canonical)}" />`
        );
      } else {
        html = html.replace(/\s*<link rel="canonical"[^>]*>/, "");
      }
      // 4) OG url/title/description
      if (ogUrl !== false) {
        const url = typeof ogUrl === "string" ? ogUrl : canonical || `${SITE.url}/`;
        html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${escapeHtml(url)}" />`);
      }
      html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
      html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
      html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
      html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);

      // 5) robots + JSON-LD إضافي قبل </head>
      const inject = buildHeadInjection({ robots, jsonLd: jsonLd || null });
      html = html.replace("</head>", `${inject}  </head>`);

      // 6) المحتوى المعروض داخل #root (hydration لاحقاً من نفس حزم JS)
      html = html.replace(/<div id="root"><\/div>/, rootDiv(appHtml));
      return html;
    };

    const writeStatic = (routePath, fileRelPath, head, appHtml) => {
      const html = compose(indexHtml, { appHtml, ...head });
      writeRouteFile(fileRelPath, html);
    };

    /* ── الصفحات الثابتة العامة ─────────────────────────────────────────── */
    const staticPages = [
      {
        route: "/",
        file: "index.html",
        head: {
          title: "فيم صحة | منصة د. هيثم الخطيب لصحة المرأة",
          description:
            "منصة فصيحة الطبية: أدلة ومقالات طبية موثوقة في صحة المرأة، الحمل، الدورة الشهرية والخصوبة، بإشراف د. هيثم الخطيب اختصاصي جراحة النساء والتوليد والعقم.",
          canonical: `${SITE.url}/`,
          jsonLd: [seoMod.websiteJsonLd(), seoMod.organizationJsonLd(), seoMod.doctorJsonLd()],
        },
      },
      {
        route: "/articles",
        file: path.join("articles", "index.html"),
        head: {
          title: "الأدلة الطبية والمقالات | منصة فصيحة الطبية",
          description:
            "مكتبة الأدلة الطبية في منصة فصيحة: مقالات موثوقة في صحة المرأة والخصوبة والحمل والأدوية بإشراف د. هيثم الخطيب.",
          canonical: `${SITE.url}/articles`,
          jsonLd: [seoMod.websiteJsonLd()],
        },
      },
      {
        route: "/doctor",
        file: path.join("doctor", "index.html"),
        head: {
          title: `عن الطبيب | ${siteMod.DOCTOR.name} | منصة فصيحة الطبية`,
          description: `${siteMod.DOCTOR.name} — ${siteMod.DOCTOR.title}. ${siteMod.DOCTOR.experience}. استشارات طبية تخصصية في صحة المرأة والتوليد والعقم.`,
          canonical: `${SITE.url}/doctor`,
          jsonLd: [seoMod.websiteJsonLd(), seoMod.doctorJsonLd()],
        },
      },
      {
        route: "/consultation",
        file: path.join("consultation", "index.html"),
        head: {
          title: "الاستشارة الطبية | د. هيثم الخطيب | منصة فصيحة الطبية",
          description:
            "احجزي استشارتك الطبية مع د. هيثم الخطيب، اختصاصي جراحة النساء والتوليد والعقم، عبر الهاتف أو واتساب بسرية تامة.",
          canonical: `${SITE.url}/consultation`,
          jsonLd: [seoMod.websiteJsonLd(), seoMod.doctorJsonLd()],
        },
      },
      {
        route: "/medical-disclaimer",
        file: path.join("medical-disclaimer", "index.html"),
        head: {
          title: "إخلاء المسؤولية الطبية | منصة فصيحة الطبية",
          description:
            "إخلاء المسؤولية الطبية لمنصة فصيحة: المحتوى تثقيفي عام بإشراف د. هيثم الخطيب ولا يغني عن التقييم الطبي المباشر.",
          canonical: `${SITE.url}/medical-disclaimer`,
          jsonLd: [seoMod.websiteJsonLd()],
        },
      },
    ];

    for (const p of staticPages) {
      try {
        const appHtml = render(p.route);
        writeStatic(p.route, p.file, p.head, appHtml);
        console.log(`PASS  prerender ${p.route} → ${p.file} (${appHtml.length} محرف)`);
      } catch (e) {
        failures++;
        console.error(`FAIL  prerender ${p.route}: ${e.message}`);
      }
    }

    /* ── صفحات المقالات: title/description/canonical/JSON-LD لكل slug ──── */
    for (const article of articles) {
      const route = `/articles/${article.slug}`;
      try {
        const appHtml = render(route);
        const title = `${article.title} | منصة فصيحة الطبية`;
        const description = (article.summary || "").slice(0, 160);
        const canonical = `${SITE.url}/articles/${article.slug}`;
        const jsonLd = [
          seoMod.websiteJsonLd(),
          seoMod.articleJsonLd(article),
          seoMod.breadcrumbJsonLd([
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
        ];
        const html = compose(indexHtml, {
          appHtml,
          title,
          description,
          canonical,
          jsonLd,
        });
        writeRouteFile(path.join("articles", article.slug, "index.html"), html);
        console.log(`PASS  prerender ${route} (${appHtml.length} محرف)`);
      } catch (e) {
        failures++;
        console.error(`FAIL  prerender ${route}: ${e.message}`);
      }
    }

    /* ─ـ /admin: noindex + بلا canonical (صفحة تشغيلية غير عامة) ────────── */
    try {
      const appHtml = render("/admin");
      const html = compose(indexHtml, {
        appHtml,
        title: "لوحة الإدارة | منصة فصيحة الطبية",
        description: "لوحة إدارة المحتوى لمنصة فصيحة الطبية.",
        canonical: null,
        robots: "noindex, nofollow",
        jsonLd: null,
        ogUrl: false,
      });
      writeRouteFile(path.join("admin", "index.html"), html);
      console.log(`PASS  prerender /admin (noindex، بلا canonical)`);
    } catch (e) {
      failures++;
      console.error(`FAIL  prerender /admin: ${e.message}`);
    }

    /* ── صفحة 404 افتراضية (noindex) — أي مسار آخر يظل SPA fallback كما هو ── */
    try {
      const appHtml = render("/صفحة-غير-موجودة-اختبار-prerender");
      const html = compose(indexHtml, {
        appHtml,
        title: "الصفحة غير موجودة | منصة فصيحة الطبية",
        description: "الصفحة المطلوبة غير متوفرة. يمكنك العودة إلى الرئيسية أو تصفح الأدلة الطبية.",
        canonical: null,
        robots: "noindex, follow",
        jsonLd: null,
        ogUrl: false,
      });
      writeRouteFile(path.join("404.html"), html);
      console.log(`PASS  prerender /404.html (noindex)`);
    } catch (e) {
      failures++;
      console.error(`FAIL  prerender 404: ${e.message}`);
    }
  } finally {
    await server.close();
  }

  if (failures > 0) {
    console.error(`\n✖ prerender فشل في ${failures} مسار(ات).`);
    process.exit(1);
  }
  console.log("\n✔ اكتمل التوليد المسبق (prerender) لكل المسارات بوسوم SEO الصحيحة.");
}

main().catch((e) => {
  console.error(`✖ فشل prerender: ${e.message}`);
  process.exit(1);
});
