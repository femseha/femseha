import React, { useState, useEffect } from 'react';

export function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      {/* هيدر الموقع */}
      <header className="bg-white shadow-sm py-4 px-6 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">منصة فصيحة الطبية</h1>
          <span className="text-sm text-slate-500">إشراف د. هيثم الخطيب</span>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-slate-100">
          <h2 className="text-3xl font-extrabold mb-4 text-slate-800">مرحباً بك في منصة فصيحة</h2>
          <p className="text-lg text-slate-600 mb-6">
            الموقع يعمل الآن بنظام مستقر ونظيف وجاهز لعرض المقالات الطبية والمدونة.
          </p>
          <div className="inline-block bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-medium">
            النظام يعمل بكفاءة عالية 🚀
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
