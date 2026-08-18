import React from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';

export default function Home() {
  const featuredArticles = articles.slice(0, 3);

  const stats = [
    { label: 'استشارة سريرية منجزة', val: '+12,000' },
    { label: 'نسبة نجاح بروتوكولات الخصوبة', val: '94%' },
    { label: 'أدلة وبروتوكولات معتمدة', val: '+450' },
    { label: 'سنوات الخبرة الطبية', val: '+18 عاماً' },
  ];

  const services = [
    { title: 'علاج العقم وتأخر الإنجاب والحقن المجهري', desc: 'بروتوكولات علاجية متطورة لتنشيط التبويض، علاج ضعف مخزون المبيض.', badge: 'خصوبة وإنجاب', icon: '🩺' },
    { title: 'متلازمة تكيس المبايض والاضطرابات الهرمونية', desc: 'خطة تشخيصية وسريرية شاملة لتنظيم الدورة الشهرية.', badge: 'صحة المرأة', icon: '🌸' },
    { title: 'متابعة الحمل الحرج والمخاطر العالية', desc: 'رعاية دقيقة لحالات تسمم الحمل، سكري الحمل، والمشيمة المتقدمة.', badge: 'رعاية الحمل', icon: '🤰' }
  ];

  return (
    <div className="space-y-12 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      
      {/* الصورة الاحترافية المرفوعة */}
      <section className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
        <img src="/doctor.jpg.png" alt="د. هيثم الخطيب" className="w-full h-auto block" />
      </section>

      {/* قسم الإحصائيات */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="text-3xl font-black text-rose-900">{s.val}</div>
            <div className="text-sm text-slate-500 font-bold">{s.label}</div>
          </div>
        ))}
      </section>

      {/* قسم الخدمات */}
      <section>
        <h2 className="text-3xl font-black mb-8 text-center">الخدمات التخصصية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((srv, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-4xl mb-4">{srv.icon}</div>
              <h3 className="font-bold text-lg mb-2">{srv.title}</h3>
              <p className="text-slate-600 text-sm">{srv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* قسم المقالات */}
      <section className="bg-slate-100 p-8 rounded-3xl">
        <h2 className="text-3xl font-black mb-8 text-center">المكتبة الطبية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredArticles.map((art) => (
            <div key={art.id} className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold mb-2">{art.title}</h3>
              <Link to={`/articles/${art.slug || art.id}`} className="text-rose-700 font-bold hover:underline">قراءة المزيد ←</Link>
            </div>
          ))}
        </div>
      </section>

      {/* التواصل */}
      <div className="text-center">
        <a href="https://wa.me/966599287172" className="bg-emerald-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:bg-emerald-700 transition shadow-lg">
          💬 تواصل معنا عبر واتساب
        </a>
      </div>
    </div>
  );
}

export { Home };
