import { Link, useLocation } from 'react-router-dom';
import { useSeo, breadcrumbJsonLd } from '../lib/seo';
import { DOCTOR, WHATSAPP_LINK } from '../data/site';
import { CLUSTER_PAGES, type ClusterPageData } from '../data/cluster-pages';

function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((x) => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a }
    }))
  };
}

function getPage(pathname: string): ClusterPageData {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  return CLUSTER_PAGES[normalized] || CLUSTER_PAGES['/cytotec-saudi-arabia'];
}

export default function ClusterPage() {
  const { pathname } = useLocation();
  const page = getPage(pathname);

  useSeo({
    title: page.title,
    description: page.description,
    canonicalPath: page.path,
    keywords: page.keywords.join(', '),
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'الرئيسية', href: '/' },
        ...(page.breadcrumb || []).map((x) => ({ name: x, href: page.path }))
      ]),
      faqJsonLd(page.faqs)
    ]
  });

  return (
    <article className="bg-slate-50 pb-20">
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-bold text-sky-200 mb-5">
              FemSeha | د. هيثم الخطيب
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">{page.h1}</h1>
            <p className="mt-5 text-base sm:text-lg leading-8 text-slate-200">{page.intro}</p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-amber-400 px-6 py-3.5 text-center font-black text-slate-950 hover:bg-amber-300">
                تواصل عبر واتساب
              </a>
              <Link to="/consultation" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-center font-bold text-white hover:bg-white/15">
                الاستشارات الطبية
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {page.sections.map((section) => (
          <section key={section.heading} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-9 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{section.heading}</h2>
            <div className="mt-5 space-y-4 text-slate-700 leading-8">
              {section.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
            {section.bullets?.length ? (
              <ul className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.bullets.map((b) => <li key={b} className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm font-semibold text-slate-700">✓ {b}</li>)}
              </ul>
            ) : null}
          </section>
        ))}

        {page.commercial ? (
          <section className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl p-6 sm:p-9 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">المنتجات والطلب والتوصيل</h2>
            <div className="mt-5 space-y-4 text-slate-700 leading-8">
              <p>نوضح الجانب التجاري بصورة منفصلة عن المعلومات الطبية: الاستفسار عن المنتجات، التحقق من التوفر، الطلب، وخدمات التوصيل تتم عبر القنوات والصيدليات المرخصة ذات الصلة، ووفق الوصفة والاشتراطات النظامية عندما تكون مطلوبة.</p>
              <p>لا يعني ظهور مدينة أو كلمة بحث محلية أن المخزون متاح في كل فرع أو أن الخدمة متاحة في كل وقت. التوفر الفعلي يُؤكد عبر القناة الرسمية وقت الطلب.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="rounded-lg bg-slate-900 text-white px-5 py-3 font-bold">المنتجات</Link>
              <Link to="/order" className="rounded-lg bg-slate-900 text-white px-5 py-3 font-bold">كيفية الطلب</Link>
              <Link to="/delivery" className="rounded-lg bg-slate-900 text-white px-5 py-3 font-bold">التوصيل</Link>
              <Link to="/pharmacies" className="rounded-lg bg-slate-900 text-white px-5 py-3 font-bold">الصيدليات</Link>
            </div>
          </section>
        ) : null}

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-9">
          <h2 className="text-2xl font-extrabold text-slate-900">أسئلة شائعة</h2>
          <div className="mt-5 divide-y divide-slate-200">
            {page.faqs.map((f) => (
              <details key={f.q} className="py-4 group">
                <summary className="cursor-pointer font-bold text-slate-800 list-none flex items-center justify-between gap-4">
                  <span>{f.q}</span><span className="text-sky-600">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {page.links?.length ? (
          <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-9">
            <h2 className="text-2xl font-extrabold">استكشف المحاور المرتبطة</h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {page.links.map((x) => (
                <Link key={x.href} to={x.href} className="rounded-xl bg-white/10 border border-white/10 p-4 font-bold hover:bg-white/15">{x.label}</Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-slate-900">مصادر ومواقع مرتبطة بالموضوع</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">روابط سياقية لمواقع ضمن شبكة المحتوى، تظهر بحسب موضوع الصفحة ولا تُستخدم كحشو روابط.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {pathname.includes('misoprostol') || pathname.includes('cytotec') ? (
              <a href="https://cytotecom.com/" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-sky-400">Cytotecom — أدلة سايتوتك وميسوبروستول</a>
            ) : null}
            {pathname.includes('cytotec') || pathname.includes('saudi') ? (
              <a href="https://saudiersaa.com/" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-sky-400">Saudiersaa — محتوى السعودية</a>
            ) : null}
            {pathname === '/misoprostol' || pathname === '/consultation' ? (
              <a href="https://sehaher.com/" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-sky-400">SehaHer — صحة المرأة</a>
            ) : null}
            {page.commercial && !pathname.includes('pharmacies') ? (
              <a href="https://taxiporteu.com/" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-sky-400">TaxiPortEU — المحتوى والخدمات المرتبطة</a>
            ) : null}
          </div>
        </section>

        <section className="text-center text-xs text-slate-500 leading-7">
          <p>المحتوى الطبي للتثقيف العام ولا يحل محل تقييم الطبيب. المعلومات التجارية تخضع للتوفر الفعلي والأنظمة والاشتراطات المعمول بها.</p>
          <p className="mt-1">المراجعة الطبية: {DOCTOR.name} — {DOCTOR.profession}</p>
        </section>
      </div>
    </article>
  );
}
