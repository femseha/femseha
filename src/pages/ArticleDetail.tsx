import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { articles } from '../data/articles';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug || a.id === slug) || articles[0];

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center" dir="rtl">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">المقال غير متوفر</h1>
        <Link to="/articles" className="text-rose-600 font-bold hover:underline">العودة للأدلة الطبية</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
        <div className="mb-6">
          <Link to="/articles" className="text-rose-600 text-sm font-bold hover:underline mb-4 inline-block">
            ← العودة لجميع الأدلة
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-400 border-b border-slate-100 pb-4">
            <span>إشراف طبي: د. هيثم الخطيب</span>
            <span>•</span>
            <span>{article.publishDate || '2026'}</span>
          </div>
        </div>

        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8"
          />
        )}

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-base">
          <p className="font-semibold text-slate-800 text-lg leading-relaxed bg-rose-50/50 p-4 rounded-2xl border-r-4 border-rose-500">
            {article.summary}
          </p>
          <div className="pt-4 whitespace-pre-line">
            {article.content || article.summary}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center mt-10">
          <h3 className="font-bold text-slate-900 mb-2 text-base">هل لديكِ استفسار حول هذه الحالة الطبية؟</h3>
          <p className="text-xs text-slate-500 mb-4">يمكنك استشارة د. هيثم الخطيب مباشرة عبر القنوات المعتمدة</p>
          <div className="flex justify-center gap-3">
            <a
              href="https://wa.me/966599287172"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              استشارة واتساب
            </a>
            <a
              href="tel:00966599287172"
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
            >
              اتصال بالعيادة
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

export { ArticleDetail };
