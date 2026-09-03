import { useState } from 'react';
import { Link } from 'react-router-dom';
import { articles, articleCategories } from '../data/articles';
import { useSeo, websiteJsonLd, breadcrumbJsonLd } from '../lib/seo';

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useSeo({
    title: 'الأدلة الطبية والمقالات | منصة فصيحة الطبية',
    description:
      'مكتبة الأدلة الطبية في منصة فصيحة: مقالات موثوقة في صحة المرأة والخصوبة والحمل والأدوية بإشراف د. هيثم الخطيب.',
    canonicalPath: '/articles',
    jsonLd: [
      websiteJsonLd(),
      breadcrumbJsonLd([
        { name: 'الرئيسية', href: '/' },
        { name: 'الأدلة الطبية', href: '/articles' }
      ])
    ]
  });

  const categories = [
    { id: 'all', name: 'جميع الأدلة' },
    ...articleCategories()
  ];

  const filteredArticles = [...articles]
    .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))
    .filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || art.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="bg-slate-950 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* العنوان والترويسة */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-sky-300 bg-sky-950 border border-sky-800 px-3 py-1 rounded-full">
            مكتبة طبية بإشراف طبي
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-3 mb-3">
            الأدلة السريرية والاستشارات الطبية
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
            مقالات طبية متخصصة ومحدثة بإشراف د. هيثم الخطيب، اختصاصي جراحة النساء والتوليد والعقم.
          </p>
        </div>

        {/* أدوات البحث والتصنيف */}
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحثي عن موضوع طبي، تحليل، أو استشارة (مثال: تأخر الحمل، سايتوتك، تكيس المبايض)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* شبكة عرض المقالات */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-base">لا توجد مقالات مطابقة لبحثك حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-sky-600 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-bold text-sky-300 bg-sky-950 border border-sky-800/80 px-2.5 py-1 rounded-lg">
                      {article.categoryName}
                    </span>
                    <span className="text-[11px] text-slate-400">{article.publishDate}</span>
                  </div>

                  <h2 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-sky-300 transition">
                    <Link to={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">إشراف: د. هيثم الخطيب</span>
                  <Link
                    to={`/articles/${article.slug}`}
                    className="text-amber-400 group-hover:text-amber-300 font-bold text-xs transition-colors inline-flex items-center gap-1"
                  >
                    قراءة الدليل ←
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
