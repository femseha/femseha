import { Link } from "react-router-dom";
import type { Article, Block, Crumb, SourceRef } from "@/data/types";
import { Breadcrumbs } from "./Breadcrumbs";

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-ar">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="mt-9 mb-3 text-xl font-extrabold text-ink-900 sm:text-2xl">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-6 mb-2 text-lg font-bold text-ink-800">
                {block.text}
              </h3>
            );
          case "p":
            return <p key={i}>{block.text}</p>;
          case "ul":
            return (
              <ul key={i} className="my-4 space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="my-4 space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">
                      {j + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            );
          case "note":
            return (
              <div key={i} className="my-6 rounded-xl border-r-4 border-brand-600 bg-brand-50 p-4 text-sm text-ink-700">
                {block.text}
              </div>
            );
          case "warning":
            return (
              <div key={i} className="my-6 rounded-xl border border-rose-200 bg-rose-50 p-5">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-rose-800">
                  <span aria-hidden="true">⚠</span>
                  {block.title}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-rose-900">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export function SourceList({ sources, title = "المصادر الطبية" }: { sources: SourceRef[]; title?: string }) {
  if (!sources.length) return null;
  return (
    <section aria-labelledby="sources-heading" className="mt-10 rounded-2xl border border-ink-200 bg-ink-50 p-6">
      <h2 id="sources-heading" className="text-lg font-extrabold text-ink-900">
        {title}
      </h2>
      <ol className="mt-4 space-y-3">
        {sources.map((s) => (
          <li key={s.url} className="text-sm leading-relaxed">
            <span className="font-semibold text-ink-800">{s.publisher}</span>
            {" — "}
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-brand-700 underline underline-offset-4 hover:text-brand-800"
            >
              {s.title}
            </a>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-ink-500">
        تُراجَع المصادر دوريًا. المحتوى تعليمي ولا يُستخدم كبديل عن التقييم الطبي المباشر.
      </p>
    </section>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-6 transition-colors hover:border-brand-300">
      <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
        <Link to={article.categoryHref} className="rounded-md bg-brand-50 px-2 py-1 hover:bg-brand-100">
          {article.category}
        </Link>
        <span className="text-ink-400">·</span>
        <span className="text-ink-500">
          <span className="arabic-numbers">{article.readingTime}</span> دقائق قراءة
        </span>
      </div>
      <h3 className="mt-3 text-base font-extrabold leading-7 text-ink-900 group-hover:text-brand-800">
        <Link to={`/articles/${article.slug}`}>{article.title}</Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{article.excerpt}</p>
      <Link
        to={`/articles/${article.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800"
      >
        اقرئي المقال
        <span aria-hidden="true">←</span>
      </Link>
    </article>
  );
}

export function TopicCard({
  label,
  href,
  description,
  icon,
}: {
  label: string;
  href: string;
  description: string;
  icon?: string;
}) {
  return (
    <Link
      to={href}
      className="group flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-6 transition-all hover:border-brand-300 hover:shadow-sm"
    >
      {icon && (
        <span
          aria-hidden="true"
          className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-lg"
        >
          {icon}
        </span>
      )}
      <h3 className="text-base font-extrabold text-ink-900 group-hover:text-brand-800">{label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{description}</p>
      <span className="mt-4 text-sm font-bold text-brand-700">اقرئي المزيد ←</span>
    </Link>
  );
}

export function PageHero({
  kicker,
  h1,
  intro,
  crumbs,
}: {
  kicker?: string;
  h1: string;
  intro?: string;
  crumbs?: Crumb[];
}) {
  return (
    <div className="border-b border-ink-200 bg-gradient-to-l from-brand-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {kicker && <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{kicker}</p>}
        <h1 className="mt-2 text-2xl font-extrabold leading-snug text-ink-900 sm:text-4xl">{h1}</h1>
        {intro && <p className="mt-4 text-base leading-loose text-ink-600">{intro}</p>}
      </div>
    </div>
  );
}
