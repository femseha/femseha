
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';
import { useSeo, websiteJsonLd, organizationJsonLd, doctorJsonLd } from '../lib/seo';

export default function HomePage() {
  useSeo({
    title: 'فيم صحة | منصة د. هيثم الخطيب لصحة المرأة',
    description:
      'منصة فصيحة الطبية: أدلة ومقالات طبية موثوقة في صحة المرأة، الحمل، الدورة الشهرية والخصوبة، بإشراف د. هيثم الخطيب اختصاصي جراحة النساء والتوليد والعقم.',
    canonicalPath: '/',
    jsonLd: [websiteJsonLd(), organizationJsonLd(), doctorJsonLd()]
  });

  const sorted = [...articles].sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1));

  return (
    <>
      {/* قسم الترحيب الرئيسي */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-6 mb-10 text-center shadow-inner">
        <div className="max-w-3xl mx-auto">
          <span className="bg-blue-600/60 text-blue-100 text-xs px-3 py-1.5 rounded-full font-medium inline-block mb-4">
            بوابة التوعية الطبية الموثوقة
          </span>
          <h2 className="text-4xl font-black mb-4 leading-tight">مرحباً بك في منصة فصيحة</h2>
          <p className="text-lg text-blue-100 font-light leading-relaxed">
            نقدم لك محتوى طبياً ومقالات إرشادية دقيقة وموثوقة لرفع الوعي الصحي وتوفير دليل مبسط للعناية بالصحة العامة.
          </p>
          <Link
            to="/articles"
            className="inline-block mt-6 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm px-6 py-3 rounded-xl transition shadow"
          >
            تصفح الأدلة الطبية
          </Link>
        </div>
      </section>

      {/* قسم عرض المقالات */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900 border-r-4 border-blue-600 pr-3">
            أحدث المقالات الطبية
          </h3>
          <span className="text-sm text-slate-500 font-medium">عدد المقالات: {sorted.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {article.categoryName}
                  </span>
                  <span className="text-xs text-slate-400">{article.readTime} دقائق قراءة</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  <Link to={`/articles/${article.slug}`} className="hover:text-blue-700 transition-colors">
                    {article.title}
                  </Link>
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {article.summary}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <span>{article.publishDate}</span>
                <Link
                  to={`/articles/${article.slug}`}
                  className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                >
                  قراءة المقال ←
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
