import React, { useState } from 'react';

interface Article {
  id: number;
  title: string;
  category: string;
  summary: string;
  date: string;
  readTime: string;
}

export function App() {
  const [articles] = useState<Article[]>([
    {
      id: 1,
      title: "أهمية الفحص الدوري ودوره في الوقاية المبكرة",
      category: "صحة عامة",
      summary: "تعرف على الأسباب الجوهرية التي تجعل الفحص الطبي المنتظم خط الدفاع الأول ضد الأمراض المزمنة.",
      date: "أغسطس 2026",
      readTime: "4 دقائق"
    },
    {
      id: 2,
      title: "دليلك الشامل لنمط حياة صحي وغذاء متوازن",
      category: "تغذية صحية",
      summary: "خطوات عملية وعلمية لتحسين جودة طعامك، وزيادة طاقتك اليومية بطرق ميسرة.",
      date: "أغسطس 2026",
      readTime: "6 دقائق"
    },
    {
      id: 3,
      title: "كيف تؤثر الضغوط النفسية على الصحة الجسدية؟",
      category: "صحة نفسية",
      summary: "نظرة علمية على العلاقة المباشرة بين التوتر المستمر ووظائف الجسم وكيفية إدارتها بفاعلية.",
      date: "أغسطس 2026",
      readTime: "5 دقائق"
    },
    {
      id: 4,
      title: "نصائح طبية هامة للعناية بالصحة العامة في فصل الصيف",
      category: "إرشادات وقائية",
      summary: "أبرز الإرشادات الطبية للحفاظ على ترطيب الجسم وتجنب ضربات الشمس والإجهاد الحراري.",
      date: "أغسطس 2026",
      readTime: "3 دقائق"
    },
    {
      id: 5,
      title: "التعامل السليم مع اضطرابات النوم المزمنة",
      category: "طب النوم",
      summary: "أسباب الأرق وطرق استعادة الساعة البيولوجية للجسم لنوم هادئ وعميق.",
      date: "أغسطس 2026",
      readTime: "5 دقائق"
    }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" dir="rtl">
      {/* الهيدر العلوي */}
      <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight">منصة فصيحة الطبية</h1>
            <p className="text-xs text-slate-500 mt-0.5">إشراف د. هيثم الخطيب</p>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <span className="text-blue-600 cursor-pointer">الرئيسية</span>
            <span className="hover:text-blue-600 cursor-pointer">المقالات</span>
            <span className="hover:text-blue-600 cursor-pointer">عن المنصة</span>
            <span className="hover:text-blue-600 cursor-pointer">اتصل بنا</span>
          </nav>
        </div>
      </header>

      {/* قسم الترحيب الرئيسي */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-6 mb-10 text-center shadow-inner">
        <div className="max-w-3xl mx-auto">
          <span className="bg-blue-600/60 text-blue-100 text-xs px-3 py-1.5 rounded-full font-medium inline-block mb-4">
            بوابة التوعية الطبية الموثوقة
          </span>
          <h2 className="text-4xl font-black mb-4 leading-tight">مرحباً بك في منصة فصيحة</h2>
          <p className="text-lg text-blue-100 font-light leading-relaxed">
            نقدم لك محتوى طبياً ومقالات إرشادية دقيقة وموثوقة لرفع الوعي الصحي وتوفير دليل مبسط للعناية بالصحة العامة.
          </p>
        </div>
      </section>

      {/* قسم عرض المقالات */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900 border-r-4 border-blue-600 pr-3">
            أحدث المقالات الطبية
          </h3>
          <span className="text-sm text-slate-500 font-medium">عدد المقالات: 5</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div 
              key={article.id} 
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-400">{article.readTime} قراءة</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  {article.title}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {article.summary}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <span>{article.date}</span>
                <button className="text-blue-600 font-semibold hover:underline">
                  قراءة المقال ←
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* الفوتر السفلي */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-500">
        <p>جميع الحقوق محفوظة © 2026 منصة فصيحة الطبية - إشراف د. هيثم الخطيب</p>
      </footer>
    </div>
  );
}

export default App;
