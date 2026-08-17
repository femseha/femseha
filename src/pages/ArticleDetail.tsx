import { Link, useParams } from "react-router-dom";
import { ArticleCard, Blocks, SourceList } from "@/components/Content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { articlesBySlugs, getArticle } from "@/data/articles";
import { TOPICS } from "@/data/topics";
import type { Crumb } from "@/data/types";
import { breadcrumbJsonLd, canonicalFor, organizationJsonLd, useSeo } from "@/lib/seo";
import { SITE } from "@/data/site";
import NotFound from "./NotFound";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function ArticleDetail() {
  const { slug = "" } = useParams();
  const article = getArticle(slug);
  if (!article) return <NotFound />;
  return <ArticleView slug={slug} />;
}

function ArticleView({ slug }: { slug: string }) {
  const article = getArticle(slug)!;
  const related = articlesBySlugs(article.relatedArticles);
  const topic = TOPICS.find((t) => t.articleSlugs[0] === article.slug && t.path !== article.categoryHref);

  const crumbs: Crumb[] = [
    { name: "الرئيسية", href: "/" },
    { name: article.category, href: article.categoryHref },
    ...(topic ? [{ name: topic.breadcrumbs[topic.breadcrumbs.length - 1].name, href: topic.path }] : []),
    { name: article.title, href: `/articles/${article.slug}` },
  ];

  useSeo({
    title: `${article.title} | دليل صحة المرأة`,
    description: article.excerpt,
    path: `/articles/${article.slug}`,
    type: "article",
    jsonLd: [
      breadcrumbJsonLd(crumbs),
      organizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        inLanguage: "ar",
        articleSection: article.category,
        datePublished: article.datePublished,
        dateModified: article.dateModified,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonicalFor(`/articles/${article.slug}`) },
        author: { "@type": "Organization", name: article.author },
        publisher: { "@type": "Organization", name: SITE.name, url: `${SITE.url}/` },
        citation: article.sources.map((s) => ({
          "@type": "CreativeWork",
          name: s.title,
          publisher: s.publisher,
          url: s.url,
        })),
      },
    ],
  });

  return (
    <>
      <div className="border-b border-ink-200 bg-gradient-to-l from-brand-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
          <Breadcrumbs items={crumbs} />
          <p className="text-xs font-bold text-brand-700">{article.category}</p>
          <h1 className="mt-2 text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">{article.title}</h1>
          <p className="mt-4 text-base leading-loose text-ink-600">{article.excerpt}</p>

          <dl className="mt-6 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-ink-200 bg-white p-3">
              <dt className="font-semibold text-ink-500">كاتب المقال</dt>
              <dd className="mt-1 font-bold text-ink-900">{article.author}</dd>
            </div>
            <div className="rounded-xl border border-ink-200 bg-white p-3">
              <dt className="font-semibold text-ink-500">المراجع الطبي</dt>
              <dd className="mt-1 font-bold text-ink-900">
                {article.medicalReviewer ?? "لم تُوثَّق مراجعة طبية مستقلة لهذا المقال"}
              </dd>
            </div>
            <div className="rounded-xl border border-ink-200 bg-white p-3">
              <dt className="font-semibold text-ink-500">تاريخ النشر / آخر تحديث</dt>
              <dd className="mt-1 arabic-numbers font-bold text-ink-900">
                {formatDate(article.datePublished)} — {formatDate(article.dateModified)}
              </dd>
            </div>
            <div className="rounded-xl border border-ink-200 bg-white p-3">
              <dt className="font-semibold text-ink-500">مدة القراءة</dt>
              <dd className="mt-1 font-bold text-ink-900">
                <span className="arabic-numbers">{article.readingTime}</span> دقائق
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_320px]">
        <article>
          <Blocks blocks={article.content} />
          <SourceList sources={article.sources} />
          <p className="mt-6 rounded-xl bg-ink-50 p-4 text-xs leading-relaxed text-ink-600">
            هذا المقال محتوى تثقيفي عام لا يُغني عن استشارة مختص ولا يُستخدم للتشخيص الذاتي أو تحديد الجرعات. لا يبيع
            الموقع الأدوية ولا يقدم معلومات عن شرائها أو الحصول عليها.{" "}
            <Link to="/medical-disclaimer" className="font-bold text-brand-700 underline underline-offset-4">
              إخلاء المسؤولية الطبية
            </Link>
          </p>
        </article>

        <aside className="space-y-6">
          <ConsultationCTA variant="compact" />
          <nav aria-labelledby="article-related-topics" className="rounded-2xl border border-ink-200 bg-white p-6">
            <h2 id="article-related-topics" className="text-base font-extrabold text-ink-900">
              روابط سريعة
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to={article.categoryHref} className="text-brand-700 hover:underline">
                  قسم {article.category}
                </Link>
              </li>
              {topic && (
                <li>
                  <Link to={topic.path} className="text-brand-700 hover:underline">
                    {topic.breadcrumbs[topic.breadcrumbs.length - 1].name}
                  </Link>
                </li>
              )}
              <li>
                <Link to="/sources" className="text-brand-700 hover:underline">
                  المصادر الطبية
                </Link>
              </li>
              <li>
                <Link to="/medical-review" className="text-brand-700 hover:underline">
                  سياسة المراجعة الطبية
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-articles" className="border-t border-ink-200 bg-ink-50">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h2 id="related-articles" className="text-xl font-extrabold text-ink-900">
              مقالات ذات صلة
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ConsultationCTA />
    </>
  );
}
