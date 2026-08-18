import React from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';

export default function Home() {
  const featuredArticles = articles.slice(0, 3);
  
  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      
      {/* القسم الرئيسي */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 text-white p-8 sm:p-14 lg:p-16 shadow-2xl border border-rose-800/40">
        <h1 className="text-3xl sm:text-5xl font-black text-white">رعايتك الصحية والسريرية بأعلى المعايير</h1>
        <p className="text-lg mt-4 text-slate-100">بإشراف د. هيثم الخطيب - اختصاصي جراحة النساء والتوليد والعقم.</p>
        <div className="mt-8">
           <a href="https://wa.me/966599287172" className="bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl">💬 استشارة واتساب</a>
        </div>
      </section>

      {/* هنا الصورة المباشرة التي أرسلتها لي */}
      <section className="rounded-3xl shadow-2xl overflow-hidden">
        <img 
          src="https://i.postimg.cc/85145826/doctor.jpg" 
          alt="د. هيثم الخطيب" 
          className="w-full h-auto"
        />
      </section>

      {/* باقي الأقسام */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200">
        <h2 className="text-3xl font-black">د. هيثم الخطيب</h2>
        <p className="mt-4 text-slate-700 text-lg">اختصاصي جراحة النساء والتوليد والعقم وتأخر الإنجاب. خبرة سريرية متقدمة في إدارة حالات الحمل عالي الخطورة.</p>
      </section>

    </div>
  );
}

export { Home };
