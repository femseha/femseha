import React from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      
      {/* 1. رأس الصفحة */}
      <div className="bg-rose-900 text-white p-8 rounded-3xl shadow-xl text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">منصة د. هيثم الخطيب</h1>
        <p className="text-xl opacity-90">اختصاصي جراحة النساء والتوليد والعقم</p>
      </div>

      {/* 2. الصورة (مع رابط بديل لضمان ظهورها) */}
      <div className="my-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
        <img 
          src="/doctor.jpg.png" 
          alt="د. هيثم الخطيب" 
          className="w-full h-auto block"
          onError={(e) => { e.currentTarget.src = 'https://i.postimg.cc/85145826/doctor.jpg'; }}
        />
      </div>

      {/* 3. الأزرار الأساسية */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <a href="https://wa.me/966599287172" className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-center text-xl font-bold hover:bg-emerald-700 transition">
          💬 تواصل واتساب
        </a>
        <Link to="/articles" className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-center text-xl font-bold hover:bg-slate-900 transition">
          📚 المقالات الطبية
        </Link>
      </div>

      {/* 4. نبذة مختصرة لضمان وجود محتوى */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold mb-4">خدماتنا</h2>
        <p className="text-lg text-slate-600">نقدم رعاية طبية متخصصة في متابعة الحمل، وعلاج العقم وتأخر الإنجاب وفق أحدث المعايير الطبية.</p>
      </div>

    </div>
  );
}

export { Home };
