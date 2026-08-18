import React from 'react';
import { Link } from 'react-router-dom';

export default function Doctor() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            👨‍⚕️
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">د. هيثم الخطيب</h1>
          <p className="text-rose-600 font-bold text-lg">اختصاصي جراحة النساء والتوليد والعقم وتأخر الإنجاب</p>
        </div>

        <div className="space-y-6 text-slate-700 leading-relaxed text-base">
          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-3">نبذة سريرية</h2>
            <p>
              طبيب استشاري متخصص في رعاية صحة المرأة، متابعة حالات الحمل الحرج، وجراحات أمراض النساء والتوليد، مع خبرة واسعة في تشخيص وعلاج اضطرابات الهرمونات وتأخر الإنجاب بأحدث البروتوكولات الطبية المعتمدة.
            </p>
          </section>

          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-3">مجالات الاختصاص</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>متابعة الحمل ومتابعة نمو الجنين والولادة الآمنة.</li>
              <li>علاج وتأهيل حالات تكيس المبايض والاضطرابات الهرمونية.</li>
              <li>استشارات الخصوبة وتأخر الإنجاب والحقن المجهري.</li>
              <li>الجراحات النسائية المتقدمة والمناظير.</li>
            </ul>
          </section>

          {/* تواصل مباشر */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6 text-center mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-2">لحجز موعد أو استشارة سريرية مباشرة</h3>
            <p className="text-sm text-slate-600 mb-6">يمكنك التواصل مباشرة عبر الواتساب أو الهاتف</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/966599287172"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm"
              >
                💬 استشارة واتساب
              </a>
              <a
                href="tel:00966599287172"
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-sm"
              >
                📞 اتصال: 00966599287172
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Doctor };
