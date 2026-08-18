import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { articles, categories } from '../data/articles';

export default function Articles() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            الأدلة والمقالات الطبية السريرية
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            دليلك الموثوق لصحة المرأة، متابعة الحمل، وفحوصات الهرمونات بإشراف د. هيثم الخطيب.
          </p>
        </div>

        {/* أزرار الفئات */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* عرض شبكة المقالات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full inline-block mb-3">
                    {article.categoryName || 'صحة المرأة'}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                    <Link to={`/articles/${article.slug || article.id}`} className="hover:text-rose-600 transition-colors">
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
                  <span className="text-xs text-slate-400">{article.publishDate || '2026'}</span>
                  <Link
                    to={`/articles/${article.slug || article.id}`}
                    className="text-rose-600 font-bold text-sm hover:underline"
                  >
                    قراءة الدليل ←
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Articles };
