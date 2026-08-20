import React from 'react';
import { Link } from 'react-router-dom';
import { GENERATED_ARTICLES } from '../data/generated-articles';

export default function Home() {
  // استخدام المقالات المولدة لتعرض في الصفحة الرئيسية ديناميكياً
  const articles = GENERATED_ARTICLES || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            موقع فصيحة (Femseha)
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            دليلك الطبي الموثوق لصحة المرأة والأسرة والارشاد السريري
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article: any, index: number) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
              <div className="p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {article.category || 'صحة المرأة'}
                </span>
                <h2 className="mt-4 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  {article.title}
                </h2>
                <p className="mt-3 text-base text-gray-600 line-clamp-3">
                  {article.excerpt}
                </p>
              </div>
              <div className="px-6 pb-6 pt-0">
                <Link
                  to={`/article/${article.slug}`}
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                >
                  <span>قراءة المقال كاملاً</span>
                  <span className="mr-2">←</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
