import React from 'react';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      
      {/* 1. العنوان الترحيبي */}
      <div className="bg-rose-900 text-white p-10 rounded-3xl text-center shadow-xl">
        <h1 className="text-4xl font-bold mb-4">منصة د. هيثم الخطيب الطبية</h1>
        <p className="text-xl">اختصاصي جراحة النساء والتوليد والعقم</p>
      </div>

      {/* 2. الصورة المرفوعة (doctor.jpg.png) */}
      <div className="my-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
        <img 
          src="/doctor.jpg.png" 
          alt="د. هيثم الخطيب" 
          className="w-full h-auto block"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/banner.jpg.png';
          }}
        />
      </div>

      {/* 3. زر التواصل المباشر */}
      <div className="text-center">
        <a 
          href="https://wa.me/966599287172" 
          className="bg-emerald-600 text-white px-10 py-4 rounded-full text-2xl font-bold shadow-lg hover:bg-emerald-700 transition"
        >
          💬 تواصل معنا عبر واتساب
        </a>
      </div>

    </div>
  );
}

export { Home };
