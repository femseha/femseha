import React from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Doctor from './pages/Doctor';

export function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans" dir="rtl">
      {/* شريط التنقل العلوي البارز لجميع الصفحات */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* الشعار */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                فيم<span className="text-slate-800">صحة</span>
              </span>
            </Link>

            {/* روابط الصفحات الرئيسية - ظاهرة وواضحة دائماً */}
            <nav className="flex items-center gap-2 sm:gap-6 text-sm sm:text-base font-bold text-slate-700">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl transition-colors ${
                    isActive ? 'bg-rose-50 text-rose-600' : 'hover:text-rose-600'
                  }`
                }
              >
                الرئيسية
              </NavLink>
              <NavLink
                to="/articles"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl transition-colors ${
                    isActive ? 'bg-rose-50 text-rose-600' : 'hover:text-rose-600'
                  }`
                }
              >
                الأدلة والمقالات الطبية
              </NavLink>
              <NavLink
                to="/doctor"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl transition-colors ${
                    isActive ? 'bg-rose-50 text-rose-600' : 'hover:text-rose-600'
                  }`
                }
              >
                عن الطبيب المشرف
              </NavLink>
            </nav>

            {/* أزرار التواصل السريع */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="https://wa.me/966599287172"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                <span>💬 واتساب</span>
              </a>
              <a
                href="tel:00966599287172"
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                <span>📞 اتصال</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* محتوى الصفحات المتعددة */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* الفوتر مع روابط التنقل */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-2xl font-black text-rose-500 tracking-tight block mb-4">
              فيم<span className="text-white">صحة</span>
            </span>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              دليل طبي سريري معتمد لصحة المرأة، متابعة الحمل، وفحوصات الهرمونات بإشراف د. هيثم الخطيب.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-base">صفحات الموقع</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">الرئيسية</Link></li>
              <li><Link to="/articles" className="hover:text-white transition-colors">الأدلة والمقالات الطبية</Link></li>
              <li><Link to="/doctor" className="hover:text-white transition-colors">عن الطبيب المشرف</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-base">إشراف وتواصل سريري</h4>
            <p className="text-xs text-rose-400 font-semibold mb-2">د. هيثم الخطيب - اختصاصي جراحة النساء والتوليد والعقم</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              هاتف: 00966599287172
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500">
              جميع الحقوق محفوظة © 2026 فيم صحة
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
