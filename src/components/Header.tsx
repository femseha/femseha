import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black text-rose-600 tracking-tight">
                فيم<span className="text-slate-800">صحة</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
              <Link to="/" className="hover:text-rose-600 transition-colors">الرئيسية</Link>
              <Link to="/articles" className="hover:text-rose-600 transition-colors">الأدلة الطبية</Link>
              <Link to="/doctor" className="hover:text-rose-600 transition-colors">عن الطبيب</Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
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
            aria-label="القائمة"
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
          <div className="pt-2">
            <a
              href="tel:00966599287172"
              className="block text-center py-2.5 bg-rose-600 text-white rounded-xl font-bold text-sm"
            >
              📞 00966599287172
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
