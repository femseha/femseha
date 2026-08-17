import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArticleCard, PageHero } from "@/components/Content";
import { ARTICLES } from "@/data/articles";
import { TOPICS } from "@/data/topics";
import { useSeo } from "@/lib/seo";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const q = initial.trim();

  useSeo({
    title: q ? `نتائج البحث عن: ${q} | دليل صحة المرأة` : "البحث | دليل صحة المرأة",
    description: "ابحثي في محتوى دليل صحة المرأة عن المواضيع الطبية والمقالات التعليمية.",
    path: "/search",
    noindex: true,
  });

  const articleResults = useMemo(() => {
    if (!q) return [];
    const needle = q.toLowerCase();
    return ARTICLES.filter((a) =>
      [a.title, a.excerpt, a.category, a.primaryKeyword].join(" ").toLowerCase().includes(needle),
    );
  }, [q]);

  const topicResults = useMemo(() => {
    if (!q) return [];
    const needle = q.toLowerCase();
    return TOPICS.filter((t) => [t.h1, t.intro, t.metaDescription].join(" ").toLowerCase().includes(needle));
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(value.trim() ? { q: value.trim() } : {});
  };

  return (
    <>
      <PageHero
        kicker="البحث"
        h1="البحث في المحتوى الطبي"
        intro="ابحثي عن موضوع أو مقال داخل الموقع. صفحات البحث غير مفهرسة في محركات البحث."
        crumbs={[
          { name: "الرئيسية", href: "/" },
          { name: "البحث", href: "/search" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <form role="search" onSubmit={submit} className="flex gap-2">
          <label htmlFor="site-search" className="sr-only">
            كلمة البحث
          </label>
          <input
            id="site-search"
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="مثال: تأخر الدورة، ميزوبروستول، السونار"
            className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-600"
          />
          <button type="submit" className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white hover:bg-brand-800">
            بحث
          </button>
        </form>

        {q && (
          <p className="mt-6 text-sm text-ink-600">
            نتائج البحث عن «{q}»:{" "}
            <span className="arabic-numbers font-bold">{articleResults.length + topicResults.length}</span> نتيجة
          </p>
        )}

        {topicResults.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-extrabold text-ink-900">مواضيع</h2>
            <ul className="mt-4 space-y-2">
              {topicResults.map((t) => (
                <li key={t.path}>
                  <Link to={t.path} className="block rounded-xl border border-ink-200 bg-white p-4 hover:border-brand-300">
                    <span className="block text-sm font-bold text-ink-900">{t.h1}</span>
                    <span className="mt-1 block text-xs text-ink-600">{t.intro}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {articleResults.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-extrabold text-ink-900">مقالات</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {articleResults.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}

        {q && articleResults.length === 0 && topicResults.length === 0 && (
          <div className="mt-8 rounded-2xl border border-ink-200 bg-ink-50 p-6 text-sm text-ink-600">
            لا توجد نتائج مطابقة. جرّبي كلمات أخرى مثل «الحمل» أو «الدورة» أو «سايتوتك»، أو تصفّحي{" "}
            <Link to="/articles" className="font-bold text-brand-700 underline underline-offset-4">
              كل المقالات
            </Link>
            .
          </div>
        )}
      </div>
    </>
  );
}
