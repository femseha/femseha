import React, { useState } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Doctor from './pages/Doctor';
import Admin from './pages/Admin';

export function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'الأدلة والمقالات الطبية', path: '/articles' },
    { name: 'عن د. هيثم الخطيب', path: '/doctor' },
    { name: 'لوحة التحكم', path: '/admin' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans antialiased" dir="rtl">
      {/* شريط الإعلان والتواصل العلوي */}
      <div className="bg-rose-700 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>🩺 منصة فيم صحة | بإشراف د. هيثم الخطيب - اختصاصي جراحة النساء والتوليد والعقم</span>
          <div className="hidden sm:flex items-center gap-4">
            <a href="tel:00966599287172" className="hover:underline font-bold">📞 00966599287172</a>
            <span>|</span>
            <a href="https://wa.me/966599287172" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold">💬 واتساب مباشر</a>
          </div>
        </div>
      </div>

      {/* الهيدر والقائمة الرئيسية */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* الشعار */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                فيم<span className="text-slate-800">صحة</span>
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full mr-1 hidden sm:inline-block">
                دليل معتمد
              </span>
            </Link>

            {/* روابط التنقل على الشاشات الكبيرة */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>

            {/* أزرار الاتصال السريع */}
            <div className="hidden sm:flex items-center gap-3">
              <a
                href="https://wa.me/966599287172"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
              >
                💬 استشارة واتساب
              </a>
              <a
                href="tel:00966599287172"
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
              >
                📞 حجز موعد
              </a>
            </div>

            {/* زر القائمة للشاشات الصغيرة */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="القائمة"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* القائمة المنسدلة للجوال */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 flex gap-2">
              <a
                href="https://wa.me/966599287172"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs"
              >
                واتساب
              </a>
              <a
                href="tel:00966599287172"
                className="flex-1 text-center py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs"
              >
                اتصال
              </a>
            </div>
          </div>
        )}
      </header>

      {/* مسارات الصفحات */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* الفوتر الاحترافي */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 mt-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <span className="text-2xl font-black text-rose-500 tracking-tight block mb-3">
              فيم<span className="text-white">صحة</span>
            </span>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md mb-4">
              المرجع الطبي المعتمد لصحة المرأة، متابعة الحمل الحرج، وعلاج العقم وتأخر الإنجاب بأحدث البروتوكولات السريرية المعتمدة.
            </p>
            <p className="text-xs text-rose-400 font-bold">
              👨‍⚕️ الإشراف الطبي العام: د. هيثم الخطيب
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm">أقسام المنصة</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition">الصفحة الرئيسية</Link></li>
              <li><Link to="/articles" className="hover:text-white transition">الأدلة والمقالات الطبية</Link></li>
              <li><Link to="/doctor" className="hover:text-white transition">السيرة السريرية للطبيب</Link></li>
              <li><Link to="/admin" className="hover:text-white transition">لوحة تحكم إدارة المحتوى</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm">التواصل والاستشارات</h4>
            <p className="text-xs text-slate-400 mb-2">هاتف العيادة: 00966599287172</p>
            <p className="text-xs text-slate-400 mb-4">المملكة العربية السعودية</p>
            <a
              href="https://wa.me/966599287172"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
            >
              استشارة واتساب فورية
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          جميع الحقوق محفوظة © 2026 فيم صحة (femseha.com) - إشراف د. هيثم الخطيب.
        </div>
      </footer>
    </div>
  );
}

export default App;
