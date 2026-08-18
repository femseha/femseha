import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';

export default function Articles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'جميع المقالات' },
    { id: 'womens-health', name: 'صحة المرأة والحمل' },
    { id: 'pregnancy', name: 'أعراض وفحوصات الحمل' }
  ];

  const articleList = Array.isArray(articles) ? articles : [];

  const filteredArticles = articleList.filter((article) => {
    const titleMatch = article?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const summaryMatch = article?.summary?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const keywordMatch = article?.primaryKeyword?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesSearch = titleMatch || summaryMatch || keywordMatch;
    
    const matchesCategory =
      selectedCategory === 'all' || article?.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            المقالات والأدلة الطبية المتخصصة
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            دليل سريري شامل لصحة المرأة، متابعة الحمل، وفحوصات الهرمونات بإشراف د. هيثم الخطيب.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="w-full md:w-1/2">
              <input
                type="text"
                placeholder="ابحثي عن موضوع طبي، أعراض حمل، أو تحليل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-rose-600 font-semibold mb-3">
                    <span className="bg-rose-50 px-3 py-1 rounded-full">
                      {article.categoryName || 'صحة المرأة'}
                    </span>
                    <span className="text-slate-400">{article.publishDate}</span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 hover:text-rose-600 transition-colors">
                    <Link to={`/articles/${article.slug || article.id}`}>
                      {article.title}
                    </Link>
                  </h2>

                  <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-slate-50 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    بإشراف: <span className="font-medium text-slate-700">{article.author || 'د. هيثم الخطيب'}</span>
                  </div>
                  <Link
                    to={`/articles/${article.slug || article.id}`}
                    className="text-rose-600 hover:text-rose-700 text-sm font-bold inline-flex items-center gap-1"
                  >
                    قراءة الدليل ←
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500 text-lg">لم يتم العثور على مقالات تطابق بحثك حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { Articles };
