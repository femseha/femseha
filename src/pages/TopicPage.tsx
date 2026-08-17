import { Link } from "react-router-dom";
import { ArticleCard, Blocks, PageHero, SourceList } from "@/components/Content";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { articlesBySlugs } from "@/data/articles";
import { getTopic } from "@/data/topics";
import { breadcrumbJsonLd, organizationJsonLd, useSeo } from "@/lib/seo";
import NotFound from "./NotFound";

export default function TopicPageView({ slug }: { slug: string }) {
  const topic = getTopic(slug);
  if (!topic) return <NotFound />;
  return <TopicContent slug={slug} />;
}

function TopicContent({ slug }: { slug: string }) {
  const topic = getTopic(slug)!;
  const articles = articlesBySlugs(topic.articleSlugs);

  useSeo({
    title: topic.metaTitle,
    description: topic.metaDescription,
    path: topic.path,
    jsonLd: [
      breadcrumbJsonLd(topic.breadcrumbs),
      organizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        name: topic.h1,
        description: topic.metaDescription,
        inLanguage: "ar",
        url: `https://sehaher.com${topic.path}`,
        about: { "@type": "MedicalEntity", name: topic.h1 },
        audience: { "@type": "PeopleAudience", suggestedGender: "female" },
      },
    ],
  });

  return (
    <>
      <PageHero kicker={topic.kicker} h1={topic.h1} intro={topic.intro} crumbs={topic.breadcrumbs} />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          {topic.quickFacts && topic.quickFacts.length > 0 && (
            <dl className="mb-8 grid gap-3 sm:grid-cols-3">
              {topic.quickFacts.map((f) => (
                <div key={f.label} className="rounded-xl border border-ink-200 bg-white p-4">
                  <dt className="text-xs font-semibold text-ink-500">{f.label}</dt>
                  <dd className="mt-1 text-sm font-extrabold text-ink-900">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <Blocks blocks={topic.content} />

          {articles.length > 0 && (
            <section aria-labelledby="topic-articles" className="mt-12">
              <h2 id="topic-articles" className="text-xl font-extrabold text-ink-900">
                مقالات في هذا الموضوع
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {articles.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
          )}

          <SourceList sources={topic.sources} />
        </div>

        <aside className="space-y-6">
          <ConsultationCTA variant="compact" />
          <nav aria-labelledby="related-topics" className="rounded-2xl border border-ink-200 bg-white p-6">
            <h2 id="related-topics" className="text-base font-extrabold text-ink-900">
              مواضيع ذات صلة
            </h2>
            <ul className="mt-4 space-y-3">
              {topic.relatedTopics.map((r) => (
                <li key={r.href}>
                  <Link to={r.href} className="block rounded-xl bg-ink-50 p-3 hover:bg-brand-50">
                    <span className="block text-sm font-bold text-ink-900">{r.label}</span>
                    <span className="mt-1 block text-xs text-ink-600">{r.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="rounded-2xl border border-ink-200 bg-white p-6 text-xs leading-relaxed text-ink-600">
            <h2 className="text-sm font-extrabold text-ink-900">تنبيه</h2>
            <p className="mt-2">
              هذا المحتوى تعليمي ولا يُستخدم للتشخيص الذاتي أو العلاج. لا يبيع الموقع الأدوية ولا يقدم جرعات أو طرق
              استخدام.
            </p>
          </div>
        </aside>
      </div>

      <ConsultationCTA />
    </>
  );
}
