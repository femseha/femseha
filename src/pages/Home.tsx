import React from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';

export default function Home() {
  const featuredArticles = Array.isArray(articles) ? articles.slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* القسم الترحيبي Hero */}
      <section className="bg-gradient-to-b from-rose-50 to-slate-50 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <span>✨</span>
            <span>المرجع الطبي المعتمد لصحة المرأة والولادة</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            دليلك الطبي الموثوق للرعاية الصحية، <br className="hidden sm:block" />
            <span className="text-rose-600">متابعة الحمل، والاستشارات السريرية</span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            منصة طبية متخصصة تهدف لتقديم أدلة علمية واستشارات مباشرة بإشراف د. هيثم الخطيب، اختصاصي جراحة النساء والتوليد والعقم.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/articles"
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-sm transition-colors text-base"
            >
              تصفح الأدلة الطبية 📖
            </Link>
            <Link
              to="/doctor"
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-2xl border border-slate-200 shadow-sm transition-colors text-base"
            >
              عن الطبيب المشرف 👨‍⚕️
            </Link>
          </div>
        </div>
      </section>

      {/* بنر الاستشارة المباشرة */}
      <div className="max-w-5xl mx-auto px-4 my-8">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-3xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
            هل تحتاجين إلى استشارة طبية مباشرة؟
          </h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto text-sm sm:text-base">
            تواصلي مباشرة مع د. هيثم الخطيب للحصول على تشخيص سريري دقيق وخطة متابعة متكاملة.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/966599287172"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
            >
              <span>💬</span>
              <span>استشارة واتساب</span>
            </a>
            <a
              href="tel:00966599287172"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm"
            >
              <span>📞</span>
              <span>اتصال: 00966599287172</span>
            </a>
          </div>
        </div>
      </div>

      {/* أحدث المقالات */}
      <section className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">أحدث الأدلة الطبية</h2>
            <p className="text-sm text-slate-500">معلومات سريرية تهم صحتك وسلامة حملك</p>
          </div>
          <Link to="/articles" className="text-rose-600 font-bold hover:underline text-sm">
            عرض الكل ←
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full mb-3 inline-block">
                  {article.categoryName || 'صحة المرأة'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                  <Link to={`/articles/${article.slug || article.id}`} className="hover:text-rose-600 transition-colors">
                    {article.title}
                  </Link>
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{article.summary}</p>
              </div>
              <Link
                to={`/articles/${article.slug || article.id}`}
                className="text-rose-600 font-bold text-sm inline-flex items-center gap-1 hover:text-rose-700"
              >
                قراءة الدليل ←
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export { Home };
