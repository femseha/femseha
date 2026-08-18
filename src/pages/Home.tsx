import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* اللوجو في الأعلى (كما هو موجود في ملفاتك) */}
        <div className="flex justify-center">
          <img src="/logo.png.png" alt="Logo" className="w-24 h-24 object-contain" />
        </div>

        {/* المربع الترحيبي */}
        <div className="bg-rose-900 text-white p-8 rounded-3xl text-center shadow-2xl">
          <h1 className="text-3xl font-bold">منصة د. هيثم الخطيب الطبية</h1>
        </div>

        {/* صورة البانر (بالاسم الدقيق الموجود في مجلدك) */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
          <img 
            src="/banner.jpg.png" 
            alt="د. هيثم الخطيب" 
            className="w-full h-auto block"
          />
        </div>

        {/* أزرار التواصل */}
        <div className="flex justify-center gap-4">
          <a 
            href="https://wa.me/966599287172" 
            className="bg-emerald-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-emerald-700 transition shadow-lg"
          >
            💬 تواصل عبر واتساب
          </a>
        </div>

      </div>
    </div>
  );
}

export { Home };
