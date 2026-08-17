import { useMemo, useState } from "react";
import { ArticleCard, PageHero } from "@/components/Content";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { ARTICLES, LATEST_ARTICLES } from "@/data/articles";
import { breadcrumbJsonLd, canonicalFor, useSeo } from "@/lib/seo";

const CRUMBS = [
  { name: "الرئيسية", href: "/" },
  { name: "المقالات الطبية", href: "/articles" },
];

export default function Articles() {
  const [category, setCategory] = useState<string>("الكل");

  const categories = useMemo(() => ["الكل", ...Array.from(new Set(ARTICLES.map((a) => a.category)))], []);
  const list = useMemo(
    () => (category === "الكل" ? LATEST_ARTICLES : LATEST_ARTICLES.filter((a) => a.category === category)),
    [category],
  );

  useSeo({
    title: "المقالات الطبية | دليل صحة المرأة",
    description:
      "مقالات طبية تعليمية عن صحة المرأة والحمل والأدوية: سايتوتك، ميزوبروستول، تأخر الدورة، اختبار الحمل، الحمل خارج الرحم والسونار، مع ذكر المصادر وتاريخ التحديث.",
    path: "/articles",
    jsonLd: [
      breadcrumbJsonLd(CRUMBS),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "المقالات الطبية",
        url: canonicalFor("/articles"),
        inLanguage: "ar",
        hasPart: LATEST_ARTICLES.map((a) => ({
          "@type": "Article",
          headline: a.title,
          url: canonicalFor(`/articles/${a.slug}`),
          datePublished: a.datePublished,
          dateModified: a.dateModified,
        })),
      },
    ],
  });

  return (
    <>
      <PageHero
        kicker="المكتبة الطبية"
        h1="المقالات الطبية"
        intro="مجموعة مقالات تأسيسية مكتوبة بلغة عربية واضحة ومستندة إلى مصادر طبية معتمدة، مع توضيح كاتب المقال وحالة المراجعة الطبية وتاريخ آخر تحديث."
        crumbs={CRUMBS}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-wrap gap-2" role="group" aria-label="تصفية حسب القسم">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                category === c ? "bg-brand-700 text-white" : "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>

      <ConsultationCTA />
    </>
  );
}
