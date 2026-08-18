import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { articles } from '../data/articles';

export default function Home() {
  const featuredArticles = articles.slice(0, 3);
  const location = useLocation();

  const stats = [
    { label: 'استشارة سريرية منجزة', val: '+12,000' },
    { label: 'نسبة نجاح بروتوكولات الخصوبة', val: '94%' },
    { label: 'أدلة وبروتوكولات معتمدة', val: '+450' },
    { label: 'سنوات الخبرة الطبية', val: '+18 عاماً' },
  ];

  const services = [
    { title: 'علاج العقم وتأخر الإنجاب والحقن المجهري', desc: 'بروتوكولات علاجية متطورة لتنشيط التبويض، علاج ضعف مخزون المبيض، وتجهيز حالات الحقن المجهري وترجيع الأجنة بأعلى نسب نجاح.', badge: 'خصوبة وإنجاب', icon: '🩺' },
    { title: 'متلازمة تكيس المبايض والاضطرابات الهرمونية', desc: 'خطة تشخيصية وسريرية شاملة لتنظيم الدورة الشهرية، ضبط مقاومة الأنسولين، وتحفيز التبويض الطبيعي بطرق حديثة.', badge: 'صحة المرأة', icon: '🌸' },
    { title: 'متابعة الحمل الحرج والمخاطر العالية', desc: 'رعاية دقيقة لحالات تسمم الحمل، سكري الحمل، المشيمة المتقدمة، ووقاية حالات الإجهاض المتكرر والولادة المبكرة.', badge: 'رعاية الحمل', icon: '🤰' },
    { title: 'إرشادات الأدوية والبروتوكولات السريرية', desc: 'أدلة طبية موثوقة حول أدوية النساء، بروتوكولات ميزوبروستول (سايتوتك) المعتمدة بالمستشفيات، والتحذيرات السريرية لسلامة الرحم.', badge: 'أدلة الأدوية', icon: '💊' },
    { title: 'جراحات ومناظير النساء والتوليد', desc: 'علاج بطانة الرحم المهاجرة (الأندومتريوزيس)، إزالة الألياف الرحمية، وفك الالتصاقات الحوضية بتقنيات المنظار الجراحي المتقدم.', badge: 'جراحة متقدمة', icon: '🔬' },
    { title: 'استشارات الخصوبة والفحوصات الشاملة', desc: 'قراءة دقيقة لتحاليل الهرمونات الشاملة (AMH, FSH, LH, Prolactin) وفحوصات السونار التخصصية للرحم والمبيضين.', badge: 'فحوصات وتشخيص', icon: '📊' }
  ];

  return (
    <div className="space-y-16 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      
      {/* قسم الصورة الأساسي */}
      <section className="rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200">
        <img src="/doctor.jpg" alt="د. هيثم الخطيب" className="w-full h-auto block" />
      </section>

      {/* قسم الإحصائيات */}
      <section className="bg-gradient-to-r from-rose-900 to-slate-900 text-white p-8 rounded-3xl shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl font-black text-white">{s.val}</div>
              <div className="text-sm text-rose-200 font-bold">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* الخدمات */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black text-center">رعاية سريرية شاملة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((srv, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-4xl mb-4">{srv.icon}</div>
              <h3 className="font-bold text-lg mb-2">{srv.title}</h3>
              <p className="text-slate-600 text-sm">{srv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* المقالات */}
      <section className="bg-slate-100 p-8 rounded-3xl">
        <h2 className="text-3xl font-black mb-8 text-center">المكتبة الطبية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredArticles.map((art) => (
            <div key={art.id} className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold mb-2">{art.title}</h3>
              <Link to={`/articles/${art.slug || art.id}`} className="text-rose-700 font-bold hover:underline">قراءة الدليل ←</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export { Home };
