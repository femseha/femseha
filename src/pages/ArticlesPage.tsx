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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* العنوان والترويسة */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            المكتبة الطبية المعتمدة
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-3">
            الأدلة السريرية والاستشارات الطبية
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            مقالات طبية متخصصة ومحدثة بإشراف د. هيثم الخطيب، اختصاصي جراحة النساء والتوليد والعقم.
          </p>
        </div>

        {/* أدوات البحث والتصنيف */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحثي عن موضوع طبي، تحليل، أو استشارة (مثال: تأخر الحمل، سايتوتك، تكيس المبايض)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* شبكة عرض المقالات */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-base">لا توجد مقالات مطابقة لبحثك حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {article.categoryName}
                    </span>
                    <span className="text-[11px] text-slate-400">{article.publishDate}</span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug hover:text-blue-700 transition">
                    <Link to={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">إشراف: د. هيثم الخطيب</span>
                  <Link
                    to={`/articles/${article.slug}`}
                    className="text-blue-600 font-bold text-xs hover:underline inline-flex items-center gap-1"
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
