import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { PhoneButton } from './ConsultationCTA';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
              <Link to="/" className="hover:text-rose-600 transition-colors">الرئيسية</Link>
              <Link to="/articles" className="hover:text-rose-600 transition-colors">الأدلة الطبية</Link>
              <Link to="/doctor" className="hover:text-rose-600 transition-colors">عن الطبيب</Link>
              <Link to="/contact" className="hover:text-rose-600 transition-colors">تواصل معنا</Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <PhoneButton />
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
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-2 text-slate-700 font-medium hover:text-rose-600">تواصل معنا</Link>
          <div className="pt-2">
            <PhoneButton className="w-full" />
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
