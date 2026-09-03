import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { articles, getArticleBySlug, relatedArticles } from '../data/articles';
import { DOCTOR, WHATSAPP_LINK } from '../data/site';
import { useSeo, articleJsonLd, breadcrumbJsonLd, websiteJsonLd } from '../lib/seo';
import NotFoundPage from './NotFoundPage';

/* ── عرض النص الآمن: يدعم **الخط العريض** و[نص الرابط](/المسار) ── */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) {
      parts.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-bold text-slate-900">
          {tok.slice(2, -2)}
        </strong>
      );
    } else {
      const mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
      if (mm) {
        const [, label, href] = mm;
        if (href.startsWith('/')) {
          parts.push(
            <Link key={`${keyPrefix}-l${i}`} to={href} className="text-blue-700 font-semibold hover:underline">
              {label}
            </Link>
          );
        } else {
          parts.push(
            <a
              key={`${keyPrefix}-l${i}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 font-semibold hover:underline"
            >
              {label}
            </a>
          );
        }
      }
    }
    last = m.index + tok.length;
    i += 1;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/* ── محول محتوى المقال (نص منسّق بسيط) إلى عناصر React آمنة ── */
function ContentBlocks({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = (idx: number) => {
    if (listItems.length === 0) return;
    const items = listItems.map((t, j) => (
      <li key={`li-${idx}-${j}`} className="text-slate-700 leading-loose">
        {renderInline(t, `li-${idx}-${j}`)}
      </li>
    ));
    if (listType === 'ol') {
      blocks.push(
        <ol key={`ol-${idx}`} className="list-decimal pr-6 space-y-2 mb-4">
          {items}
        </ol>
      );
    } else {
      blocks.push(
        <ul key={`ul-${idx}`} className="list-disc pr-6 space-y-2 mb-4">
          {items}
        </ul>
      );
    }
    listItems = [];
    listType = null;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) {
      flushList(idx);
      return;
    }
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line)) {
      flushList(idx);
      blocks.push(<hr key={`hr-${idx}`} className="my-6 border-slate-200" />);
      return;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^#{1,3}\s+(.*)$/))) {
      flushList(idx);
      blocks.push(
        <h2 key={`h-${idx}`} className="text-xl font-bold text-slate-900 mt-8 mb-3 leading-snug">
          {renderInline(m[1], `h-${idx}`)}
        </h2>
      );
      return;
    }
    if ((m = line.match(/^#{4,6}\s+(.*)$/))) {
      flushList(idx);
      blocks.push(
        <h3 key={`h3-${idx}`} className="text-lg font-bold text-slate-800 mt-6 mb-2 leading-snug">
          {renderInline(m[1], `h3-${idx}`)}
        </h3>
      );
      return;
    }
    if ((m = line.match(/^[*•]\s+(.*)$/))) {
      if (listType !== 'ul') {
        flushList(idx);
        listType = 'ul';
      }
      listItems.push(m[1]);
      return;
    }
    if ((m = line.match(/^\d+[.)]\s+(.*)$/))) {
      if (listType !== 'ol') {
        flushList(idx);
        listType = 'ol';
      }
      listItems.push(m[1]);
      return;
    }
    flushList(idx);
    blocks.push(
      <p key={`p-${idx}`} className="text-slate-700 text-base leading-loose mb-4">
        {renderInline(line, `p-${idx}`)}
      </p>
    );
  });
  flushList(lines.length);
  return <>{blocks}</>;
}

/**
 * صورة المقالات الافتراضية (بانر واتساب) — مرتبطة برابط الواتساب الرسمي.
 * ملاحظة: banner.jpg.png يبقى حصراً للـHero الرئيسية وصورة OG، ولا يُستخدم كصورة مقال.
 */
const WHATSAPP_ARTICLE_BANNER = '/whatsapp-consult.png';
const LEGACY_DEFAULT_ARTICLE_IMAGES = ['banner.jpg.png', 'banner.webp', 'banner.png'];

/** هل يملك المقال صورة أصلية خاصة به؟ (دعم صور المقالات المستقبلية) */
function hasCustomImage(image?: string): boolean {
  if (!image) return false;
  return !LEGACY_DEFAULT_ARTICLE_IMAGES.some((f) => image.includes(f));
}

export default function ArticleView() {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug);
  const hasOwnImage = hasCustomImage(article?.image);

  useSeo({
    title: article ? `${article.title} | منصة فصيحة الطبية` : 'المقال غير متوفر | منصة فصيحة الطبية',
    description: article ? article.summary.slice(0, 160) : undefined,
    // slug غير صحيح = soft-404: يُعرض محتوى 404 مع noindex وبلا canonical،
    // ولا يسقط أبداً إلى مقال آخر (لا fallback لأول مقال).
    canonicalPath: article ? `/articles/${article.slug}` : undefined,
    robots: article ? undefined : 'noindex, follow',
    noCanonical: !article,
    type: 'article',
    jsonLd: article
      ? [
          websiteJsonLd(),
          articleJsonLd(article),
          breadcrumbJsonLd([
            { name: 'الرئيسية', href: '/' },
            { name: 'الأدلة الطبية', href: '/articles' },
            { name: article.title, href: `/articles/${article.slug}` }
          ]),
          ...(article.faq && article.faq.length
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: article.faq.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a }
                  }))
                }
              ]
            : [])
        ]
      : undefined
  });

  if (!article) return <NotFoundPage />;

  const explicitRelated = (article.related || [])
    .map((s) => articles.find((a) => a.slug === s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const related = [
    ...explicitRelated,
    ...relatedArticles(article, 3 - explicitRelated.length)
  ].slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
        <div className="mb-6">
          {/* مسار التنقل */}
          <nav aria-label="مسار التنقل" className="text-xs text-slate-400 mb-4">
            <Link to="/" className="hover:text-blue-600">الرئيسية</Link>
            <span className="mx-2">‹</span>
            <Link to="/articles" className="hover:text-blue-600">الأدلة الطبية</Link>
            <span className="mx-2">‹</span>
            <span className="text-slate-600 font-semibold">{article.title}</span>
          </nav>

          <Link to="/articles" className="text-blue-600 text-sm font-bold hover:underline mb-4 inline-block">
            ← العودة لجميع الأدلة
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-b border-slate-100 pb-4">
            <span>إشراف طبي: {DOCTOR.name}</span>
            <span>•</span>
            <span>{article.publishDate}</span>
            <span>•</span>
            <span>{article.readTime} دقائق قراءة</span>
          </div>
        </div>

        {hasOwnImage ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8"
          />
        ) : (
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="استشارة طبية عبر واتساب مع د. هيثم الخطيب"
            className="block mb-8"
          >
            <img
              src={WHATSAPP_ARTICLE_BANNER}
              alt="تواصل معنا عبر واتساب - استشارة طبية آمنة وسرية مع د. هيثم الخطيب"
              className="w-full h-auto rounded-2xl"
              loading="lazy"
            />
          </a>
        )}

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-base">
          <p className="font-semibold text-slate-800 text-lg leading-relaxed bg-blue-50/60 p-4 rounded-2xl border-r-4 border-blue-600">
            {article.summary}
          </p>
          <div className="pt-4">
            <ContentBlocks content={article.content} />
          </div>
        </div>

        {/* الأسئلة الشائعة */}
        {article.faq && article.faq.length > 0 && (
          <section className="mt-10" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-xl font-bold text-slate-900 mb-4">
              أسئلة شائعة
            </h2>
            <div className="space-y-4">
              {article.faq.map((f, i) => (
                <div key={i} className="border border-slate-200 rounded-2xl p-4">
                  <h3 className="font-bold text-slate-900 text-sm mb-2">{f.q}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* المراجع والمصادر */}
        {article.sources && article.sources.length > 0 && (
          <section className="mt-10" aria-labelledby="sources-heading">
            <h2 id="sources-heading" className="text-xl font-bold text-slate-900 mb-4">
              المراجع والمصادر
            </h2>
            <ul className="space-y-2 text-sm">
              {article.sources.map((s, i) => (
                <li key={i} className="text-slate-600">
                  <span className="font-semibold text-slate-800">{s.publisher}:</span>{' '}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* الروابط الداخلية ذات الصلة */}
        {related.length > 0 && (
          <section className="mt-10" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-bold text-slate-900 mb-4">
              اقرئي أيضاً
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/articles/${r.slug}`}
                  className="block border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:bg-blue-50/40 transition"
                >
                  <span className="block text-[11px] font-bold text-blue-600 mb-1">{r.categoryName}</span>
                  <span className="block text-sm font-bold text-slate-900 leading-snug">{r.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* الاستشارة الطبية */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center mt-10">
          <h3 className="font-bold text-slate-900 mb-2 text-base">هل لديكِ استفسار حول هذه الحالة الطبية؟</h3>
          <p className="text-xs text-slate-500 mb-4">يمكنك استشارة د. هيثم الخطيب مباشرة عبر قنوات التواصل الرسمية للمنصة</p>
          <div className="flex justify-center gap-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              استشارة واتساب
            </a>
            <a
              href={DOCTOR.phoneLink}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              اتصال بالعيادة
            </a>
          </div>
        </div>

        {/* إخلاء المسؤولية الطبية الدائم */}
        <div className="mt-8 border border-slate-200 bg-white rounded-2xl p-4 text-xs leading-relaxed text-slate-500">
          <strong className="text-slate-700">إخلاء مسؤولية طبية:</strong> هذا المحتوى تثقيفي عام
          بإشراف د. هيثم الخطيب، ولا يُغني عن التقييم الطبي المباشر، ولا يُستخدم للتشخيص الذاتي أو العلاج.
          لا تبيع منصة فصيحة أي أدوية ولا تقدم جرعات أو خططاً علاجية فردية. في الحالات الطارئة توجهي فوراً
          إلى أقرب قسم طوارئ.
        </div>
      </article>
    </div>
  );
}
