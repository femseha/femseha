import React from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';

export default function Home() {
  const featuredArticles = articles.slice(0, 3);

  const services = [
    { title: 'علاج العقم وتأخر الإنجاب', icon: '🩺' },
    { title: 'تكيس المبايض والهرمونات', icon: '🌸' },
    { title: 'متابعة الحمل الحرج', icon: '🤰' },
    { title: 'إرشادات الأدوية الطبية', icon: '💊' },
    { title: 'جراحات ومناظير النساء', icon: '🔬' },
    { title: 'فحوصات الخصوبة الشاملة', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* المربع الترحيبي */}
        <div className="bg-rose-900 text-white p-8 rounded-3xl text-center shadow-2xl">
          <h1 className="text-4xl font-bold">منصة د. هيثم الخطيب الطبية</h1>
          <p className="mt-2 opacity-90">اختصاصي جراحة النساء والتوليد والعقم وتأخر الإنجاب</p>
        </div>

        {/* الصورة الرئيسية (باستخدام الاسم الصحيح المرفوع) */}
        <div className="rounded-3xl overflow-hidden shadow-2xl bg-white border-2 border-gray-100">
          <img 
            src="/doctor.jpg.png" 
            alt="د. هيثم الخطيب" 
            className="w-full h-auto block"
          />
        </div>

        {/* أزرار التواصل */}
        <div className="flex justify-center gap-4">
          <a href="https://wa.me/966599287172" className="bg-emerald-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-emerald-700 transition shadow-lg">
            💬 تواصل عبر واتساب
          </a>
        </div>

        {/* قسم من نحن */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">من نحن</h2>
          <p className="text-gray-600 leading-relaxed">
            منصة طبية متخصصة تحت إشراف د. هيثم الخطيب، نهدف لتقديم أدلة طبية موثوقة واستشارات سريرية دقيقة في مجالات الخصوبة وصحة المرأة والحمل الحرج وفق أعلى المعايير.
          </p>
        </div>

        {/* الخدمات */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((srv, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="text-2xl mb-2">{srv.icon}</div>
              <h3 className="font-bold text-sm">{srv.title}</h3>
            </div>
          ))}
        </div>

        {/* المقالات */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">أهم المقالات الطبية</h2>
          <div className="space-y-4">
            {featuredArticles.map((art) => (
              <div key={art.id} className="flex justify-between items-center border-b pb-4">
                <h3 className="font-semibold">{art.title}</h3>
                <Link to={`/articles/${art.slug || art.id}`} className="text-rose-700 font-bold hover:underline">قراءة ←</Link>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/articles" className="text-rose-900 font-bold underline">عرض جميع المقالات</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export { Home };
