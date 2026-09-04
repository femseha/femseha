import { useParams, Link } from 'react-router-dom';
import { articles, getArticleBySlug, relatedArticles } from '../data/articles';
import { DOCTOR, WHATSAPP_LINK } from '../data/site';
import { useSeo, articleJsonLd, breadcrumbJsonLd, websiteJsonLd } from '../lib/seo';
import NotFoundPage from './NotFoundPage';
import ArticleImage from '../components/ArticleImage';
import { ContentBlocks } from '../lib/markdown';
import { normalizeImageUrl } from '../lib/image-url';

/* صورة المقالات العامة (هيرو الرئيسية) — لا تُعرض أبداً كصورة افتراضية لمقال.
   تلتقط أيضاً الملفات الواردة من أرشيف البيانات مثل banner.jpg.png */
function isHomepageBanner(url: string): boolean {
  const clean = url.split('?')[0];
  const base = clean.split('/').pop() || clean;
  return /^banner\./i.test(base) || /^dr-haitham-hero\./i.test(base);
}

export default function ArticleView() {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug);

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

  // قاعدة الفصل البصري: صورة الهيرو/البانر العامة لا تُعرض أبداً كصورة مقال افتراضية.
  // تُعرض فقط صورة خاصة بالمقال إن كانت موجودة وليست البانر العام.
  const resolvedImage = normalizeImageUrl(article.image);
  const articleImage = resolvedImage && !isHomepageBanner(resolvedImage) ? resolvedImage : null;

  return (
    <div className="bg-slate-50 min-h-[60vh] py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
        {/* بانر استشارة واتساب الأصلي — Header → Banner → Title → Content */}
        <div className="flex justify-center mb-6">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="استشارة طبية عبر واتساب مع دكتور هيثم الخطيب"
            className="block w-full max-w-[500px]"
          >
            <img
              src="/images/whatsapp-consultation.png"
              alt="استشارة طبية عبر واتساب مع دكتور هيثم الخطيب"
              width={1024}
              height={683}
              loading="lazy"
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </a>
        </div>

        <div className="mb-6">
          {/* مسار التنقل */}
          <nav aria-label="مسار التنقل" className="text-xs text-slate-500 mb-4">
            <Link to="/" className="hover:text-blue-700">الرئيسية</Link>
            <span className="mx-2">‹</span>
            <Link to="/articles" className="hover:text-blue-700">الأدلة الطبية</Link>
            <span className="mx-2">‹</span>
            <span className="text-slate-800 font-semibold">{article.title}</span>
          </nav>

          <Link to="/articles" className="text-blue-700 text-sm font-bold hover:underline mb-4 inline-block">
            ← العودة لجميع الأدلة
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-200 pb-4">
            <span>إشراف طبي: {DOCTOR.name}</span>
            <span>•</span>
            <span>{article.publishDate}</span>
            <span>•</span>
            <span>{article.readTime} دقائق قراءة</span>
          </div>
        </div>

        <ArticleImage src={articleImage} title={article.title} />

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-base">
          <p className="font-semibold text-slate-800 text-lg leading-relaxed bg-sky-50 p-4 rounded-2xl border-r-4 border-sky-500">
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
                <div key={i} className="border border-slate-200 bg-slate-50 rounded-2xl p-4">
                  <h3 className="font-bold text-slate-900 text-sm mb-2">{f.q}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{f.a}</p>
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
                <li key={i} className="text-slate-700">
                  <span className="font-semibold text-slate-900">{s.publisher}:</span>{' '}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 font-semibold hover:underline"
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
                  className="block border border-slate-200 bg-white rounded-2xl p-4 hover:border-sky-500 hover:bg-slate-50 transition"
                >
                  <span className="block text-[11px] font-bold text-blue-700 mb-1">{r.categoryName}</span>
                  <span className="block text-sm font-bold text-slate-900 leading-snug">{r.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* الاستشارة الطبية */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center mt-10">
          <h3 className="font-bold text-slate-900 mb-2 text-base">هل لديكِ استفسار حول هذه الحالة الطبية؟</h3>
          <p className="text-xs text-slate-600 mb-4">يمكنك استشارة د. هيثم الخطيب مباشرة عبر قنوات التواصل الرسمية للمنصة</p>
          <div className="flex justify-center gap-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              استشارة واتساب
            </a>
            <a
              href={DOCTOR.phoneLink}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              اتصال بالعيادة
            </a>
          </div>
        </div>

        {/* إخلاء المسؤولية الطبية الدائم */}
        <div className="mt-8 border border-slate-200 bg-slate-50 rounded-2xl p-4 text-xs leading-relaxed text-slate-600">
          <strong className="text-slate-900">إخلاء مسؤولية طبية:</strong> هذا المحتوى تثقيفي عام
          بإشراف د. هيثم الخطيب، ولا يُغني عن التقييم الطبي المباشر، ولا يُستخدم للتشخيص الذاتي أو العلاج.
          لا تبيع منصة فصيحة أي أدوية ولا تقدم جرعات أو خططاً علاجية فردية. في الحالات الطارئة توجهي فوراً
          إلى أقرب قسم طوارئ.
        </div>
      </article>
    </div>
  );
}
