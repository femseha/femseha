import { useEffect, useState } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleView from './pages/ArticleView';
import DoctorPage from './pages/DoctorPage';
import ConsultationPage from './pages/ConsultationPage';
import DisclaimerPage from './pages/DisclaimerPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

/** إعادة التمرير لأعلى عند تغيير المسار */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'الأدلة والمقالات الطبية', path: '/articles' },
    { name: 'من نحن (د. هيثم الخطيب)', path: '/doctor' },
    { name: 'الاستشارة الطبية', path: '/consultation' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans" dir="rtl">
      <ScrollToTop />

      {/* الشريط الإعلاني العلوي */}
      <div className="bg-rose-800 text-white text-sm py-2.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-bold flex items-center gap-2">
            <span className="bg-rose-700 px-2 py-0.5 rounded text-xs">بإشراف طبي</span>
            منصة Femseha | إشراف د. هيثم الخطيب - اختصاصي جراحة النساء والتوليد والعقم
          </span>
          <div className="hidden sm:flex items-center gap-6 font-bold">
            <a href="tel:00966599287172" className="hover:text-rose-200">📞 00966599287172</a>
            <span>|</span>
            <a href="https://wa.me/966599287172" target="_blank" rel="noopener noreferrer" className="hover:text-rose-200">💬 واتساب مباشر</a>
          </div>
        </div>
      </div>

      {/* الهيدر مع اللوجو */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">

            {/* اللوجو الرسمي بالصورة */}
            <Link to="/" className="flex items-center gap-3 group">
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png.png"
                  alt="شعار FemSeha | فيم صحة"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                  className="w-14 h-14 object-contain group-hover:scale-105 transition-transform"
                />
              </picture>
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                  <span className="text-rose-600">Fem</span><span className="text-slate-900">seha</span>
                </span>
                <span className="text-[11px] text-slate-400 font-bold tracking-wider uppercase mt-1">Medical Hub</span>
              </div>
            </Link>

            {/* روابط التنقل */}
            <nav className="hidden md:flex items-center gap-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2.5 rounded-xl text-base font-bold transition-all ${
                      isActive
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'text-slate-700 hover:text-rose-600 hover:bg-slate-100'
                    }`}
                  >
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>

            {/* أزرار الاتصال */}
            <div className="hidden sm:flex items-center gap-3">
              <a
                href="https://wa.me/966599287172"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition"
              >
                💬 استشارة واتساب
              </a>
              <a
                href="tel:00966599287172"
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-sm transition"
              >
                📞 حجز موعد
              </a>
            </div>

            {/* زر الجوال */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* قائمة الجوال */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 pt-3 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-bold text-slate-800 hover:bg-rose-50 hover:text-rose-600 border border-slate-100"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 flex gap-2">
              <a
                href="https://wa.me/966599287172"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm"
              >
                واتساب
              </a>
              <a
                href="tel:00966599287172"
                className="flex-1 text-center py-3 bg-rose-600 text-white rounded-xl font-bold text-sm"
              >
                اتصال
              </a>
            </div>
          </div>
        )}
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticleView />} />
          <Route path="/doctor" element={<DoctorPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/medical-disclaimer" element={<DisclaimerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* الفوتر */}
      <footer className="bg-slate-900 text-slate-300 py-14 px-4 sm:px-6 lg:px-8 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png.png"
                  alt="شعار FemSeha | فيم صحة"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                  className="w-12 h-12 object-contain"
                />
              </picture>
              <span className="text-3xl font-black text-rose-500 tracking-tight">
                Fem<span className="text-white">seha</span>
              </span>
            </div>
            <p className="text-base text-slate-400 leading-loose max-w-md">
              مرجع طبي تثقيفي لصحة المرأة، متابعة الحمل الحرج، وعلاج العقم وتأخر الإنجاب وفق البروتوكولات الطبية الدولية.
            </p>
            <p className="text-sm text-rose-300 font-bold">
              👨‍⚕️ الإشراف الطبي العام: د. هيثم الخطيب (00966599287172)
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-base">أقسام المنصة</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/" className="hover:text-rose-400 transition">الصفحة الرئيسية</Link></li>
              <li><Link to="/articles" className="hover:text-rose-400 transition">الأدلة والمقالات الطبية</Link></li>
              <li><Link to="/doctor" className="hover:text-rose-400 transition">من نحن (د. هيثم الخطيب)</Link></li>
              <li><Link to="/consultation" className="hover:text-rose-400 transition">الاستشارة الطبية</Link></li>
              <li><Link to="/medical-disclaimer" className="hover:text-rose-400 transition">إخلاء المسؤولية الطبية</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-base">التواصل السريري</h4>
            <p className="text-sm text-slate-400 mb-2">هاتف العيادة: 00966599287172</p>
            <a
              href="https://wa.me/966599287172"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition"
            >
              استشارة واتساب فورية
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          <p className="mb-1">محتوى تعليمي فقط — لا نبيع الأدوية ولا نقدم جرعات أو خططاً علاجية فردية.</p>
          جميع الحقوق محفوظة © 2026 Femseha | منصة فصيحة الطبية - إشراف د. هيثم الخطيب.
        </div>
      </footer>
    </div>
  );
}

export default App;
