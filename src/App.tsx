import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Doctor from './pages/Doctor';

export function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans" dir="rtl">
      {/* القائمة العلوية Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-black text-rose-600 tracking-tight">
                فيم<span className="text-slate-800">صحة</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
                <Link to="/" className="hover:text-rose-600 transition-colors">الرئيسية</Link>
                <Link to="/articles" className="hover:text-rose-600 transition-colors">الأدلة الطبية</Link>
                <Link to="/doctor" className="hover:text-rose-600 transition-colors">عن الطبيب</Link>
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://wa.me/966599287172"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                <span>💬</span>
                <span>استشارة واتساب</span>
              </a>
              <a
                href="tel:00966599287172"
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                <span>📞</span>
                <span>00966599287172</span>
              </a>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xl font-bold"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-rose-600">الرئيسية</Link>
            <Link to="/articles" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-rose-600">الأدلة الطبية</Link>
            <Link to="/doctor" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-rose-600">عن الطبيب</Link>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://wa.me/966599287172"
                className="block text-center py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm"
              >
                💬 استشارة واتساب
              </a>
              <a
                href="tel:00966599287172"
                className="block text-center py-2.5 bg-rose-600 text-white rounded-xl font-bold text-sm"
              >
                📞 اتصال: 00966599287172
              </a>
            </div>
          </div>
        )}
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* الفوتر Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-2xl font-black text-rose-500 tracking-tight block mb-4">
              فيم<span className="text-white">صحة</span>
            </span>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              دليل طبي سريري موثوق لصحة المرأة، متابعة الحمل، وفحوصات الهرمونات بإشراف د. هيثم الخطيب.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm">روابط الموقع</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">الرئيسية</Link></li>
              <li><Link to="/articles" className="hover:text-white transition-colors">الأدلة والمقالات الطبية</Link></li>
              <li><Link to="/doctor" className="hover:text-white transition-colors">عن الطبيب المشرف</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm">إشراف وتواصل سريري</h4>
            <p className="text-xs text-rose-400 font-semibold mb-2">د. هيثم الخطيب - اختصاصي جراحة النساء والتوليد والعقم</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              تنبيه طبي: الموقع مخصص للتوعية والاستشارات الطبية فقط، ولا نقوم ببيع أو تداول أي منتجات دوائية.
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
