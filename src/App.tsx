import { useEffect, useState } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { DOCTOR, WHATSAPP_LINK } from './data/site';
import {
  HeartIcon,
  MenuIcon,
  XIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  PhoneIcon,
  MapPinIcon,
  MessageCircleIcon,
} from './components/Icons';
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

/* ── روابط أقسام التوعية (نقل بصري فقط: لا مسارات جديدة، تُوجَّه لأحدث المقالات المعنية) ── */
const TOPIC_LINKS = [
  { name: 'صحة المرأة', href: '/articles/pcos-symptoms-fertility-treatment' },
  { name: 'الصحة الإنجابية', href: '/articles/healthy-lifestyle-and-balanced-nutrition-guide' },
  { name: 'الحمل والولادة', href: '/articles/subchorionic-hematoma-pregnancy-guide' },
  { name: 'أعراض الحمل', href: '/articles/delayed-period-causes-besides-pregnancy' },
  { name: 'تأخر وانقطاع الدورة', href: '/articles/delayed-period-causes-besides-pregnancy' },
  { name: 'سايتوتك في السعودية', href: '/articles/cytotec-misoprostol-saudi-riyadh-guide' },
  { name: 'ميسوبروستول', href: '/articles/cytotec-gulf-kuwait-bahrain-uae-protocols' },
  { name: 'سلامة الإجهاض الدوائي', href: '/articles/cytotec-misoprostol-saudi-riyadh-guide' },
  { name: 'الحمل خارج الرحم', href: '/articles/subchorionic-hematoma-pregnancy-guide' },
  { name: 'دليل السلامة والطوارئ', href: '/articles/cytotec-misoprostol-saudi-riyadh-guide' },
  { name: 'الأسئلة الشائعة', href: '/articles' },
];

const FOOTER_MAIN_LINKS = [
  { label: 'الرئيسية', href: '/', accent: false },
  { label: 'من نحن', href: '/doctor', accent: false },
  { label: 'عن دكتور هيثم الخطيب', href: '/doctor', accent: false },
  { label: 'الاستشارات الطبية', href: '/consultation', accent: true },
  { label: 'صحة المرأة', href: '/articles/pcos-symptoms-fertility-treatment', accent: false },
  { label: 'الصحة الإنجابية', href: '/articles/healthy-lifestyle-and-balanced-nutrition-guide', accent: false },
  { label: 'الحمل والولادة', href: '/articles/subchorionic-hematoma-pregnancy-guide', accent: false },
  { label: 'أعراض الحمل', href: '/articles/delayed-period-causes-besides-pregnancy', accent: false },
  { label: 'تأخر وانقطاع الدورة', href: '/articles/delayed-period-causes-besides-pregnancy', accent: false },
  { label: 'الموسوعة الطبية', href: '/articles', accent: false },
];

const FOOTER_TOPIC_LINKS = [
  { label: 'سايتوتك في السعودية', href: '/articles/cytotec-misoprostol-saudi-riyadh-guide' },
  { label: 'ميسوبروستول', href: '/articles/cytotec-gulf-kuwait-bahrain-uae-protocols' },
  { label: 'سلامة الإجهاض الدوائي', href: '/articles/cytotec-misoprostol-saudi-riyadh-guide' },
  { label: 'الحمل خارج الرحم', href: '/articles/subchorionic-hematoma-pregnancy-guide' },
  { label: 'دليل السلامة والطوارئ', href: '/articles/cytotec-misoprostol-saudi-riyadh-guide' },
  { label: 'الأسئلة الشائعة', href: '/articles' },
  { label: 'اتصل بنا', href: '/consultation' },
  { label: 'إخلاء المسؤولية الطبية', href: '/medical-disclaimer' },
  { label: 'سياسة الخصوصية', href: '/medical-disclaimer' },
  { label: 'شروط الاستخدام', href: '/medical-disclaimer' },
];

const CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر',
  'القطيف', 'صفوى', 'الأحساء', 'الهفوف', 'القصيم', 'بريدة', 'تبوك', 'أبها', 'جازان',
];

export function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setTopicsOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between selection:bg-sky-500 selection:text-white"
      dir="rtl"
    >
      <ScrollToTop />

      {/* ── الهيدر الرئيسي (مطابق للإنتاج القديم: أزرق داكن + شريط علوي) ── */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
        <div className="bg-gradient-to-r from-sky-900 via-teal-900 to-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center border-b border-sky-800/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>FemSeha — استشارات وتثقيف صحي بالمملكة العربية السعودية</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sky-200">
              <span className="flex items-center gap-1">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-sky-400" />
                تثقيف واستشارات طبية متخصصة
              </span>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 font-bold hover:underline ltr"
              >
                {DOCTOR.phoneDisplay}
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* الشعار */}
            <Link to="/" className="flex items-center gap-3 group" aria-label="FemSeha — الرئيسية">
              <img
                src="/logo.png"
                alt="FemSeha - FemSeha"
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl shadow-lg group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="block text-2xl font-black tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  FemSeha
                </span>
                <span className="block text-xs text-sky-300 font-semibold tracking-wide">FemSeha</span>
              </div>
            </Link>

            {/* التنقل */}
            <nav className="hidden lg:flex items-center gap-6 font-medium text-sm">
              <NavLink to="/" className="text-slate-200 hover:text-sky-400 transition-colors">
                الرئيسية
              </NavLink>
              <NavLink to="/doctor" className="text-slate-200 hover:text-sky-400 transition-colors">
                عن دكتور هيثم الخطيب
              </NavLink>
              <NavLink to="/consultation" className="text-slate-200 hover:text-sky-400 transition-colors">
                الاستشارات الطبية
              </NavLink>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTopicsOpen((v) => !v)}
                  onMouseEnter={() => setTopicsOpen(true)}
                  className="flex items-center gap-1.5 text-slate-200 hover:text-sky-400 transition-colors py-2"
                >
                  <span>أقسام التوعية</span>
                  <ChevronDownIcon className="w-4 h-4 text-sky-400" />
                </button>
                {topicsOpen && (
                  <div
                    onMouseLeave={() => setTopicsOpen(false)}
                    className="absolute top-full right-0 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-3 px-2 grid grid-cols-1 gap-1 z-50 animate-in fade-in duration-200"
                  >
                    {TOPIC_LINKS.map((item) => (
                      <Link
                        key={item.href + item.name}
                        to={item.href}
                        onClick={closeMenus}
                        className="px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-sky-950 hover:text-sky-300 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>{item.name}</span>
                        <span className="text-slate-600 text-[10px]">←</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <NavLink to="/articles" className="text-slate-200 hover:text-sky-400 transition-colors">
                الموسوعة الطبية
              </NavLink>
              <NavLink to="/doctor" className="text-slate-200 hover:text-sky-400 transition-colors">
                من نحن
              </NavLink>
              <NavLink to="/consultation" className="text-slate-200 hover:text-sky-400 transition-colors">
                اتصل بنا
              </NavLink>
            </nav>

            {/* زر التواصل البرتقالي */}
            <div className="hidden sm:flex items-center gap-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <HeartIcon className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>تواصل مع دكتور هيثم الخطيب</span>
              </a>
            </div>

            {/* زر الجوال */}
            <div className="lg:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="p-2 text-slate-300 hover:text-white focus:outline-none"
                aria-label="القائمة"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* قائمة الجوال */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
            <Link to="/" onClick={closeMenus} className="block py-2 text-slate-200 hover:text-sky-400 font-semibold text-base">
              الرئيسية
            </Link>
            <Link to="/doctor" onClick={closeMenus} className="block py-2 text-slate-200 hover:text-sky-400 font-semibold text-base">
              عن دكتور هيثم الخطيب
            </Link>
            <Link to="/consultation" onClick={closeMenus} className="block py-2 text-amber-400 font-bold text-base">
              الاستشارات الطبية
            </Link>
            <Link to="/articles" onClick={closeMenus} className="block py-2 text-slate-200 hover:text-sky-400 font-semibold text-base">
              الموسوعة الطبية
            </Link>
            <div className="pt-2 pb-1 border-t border-slate-800">
              <p className="text-xs font-bold text-sky-400 mb-2">أقسام التوعية والصحة:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {TOPIC_LINKS.map((item) => (
                  <Link
                    key={item.href + item.name}
                    to={item.href}
                    onClick={closeMenus}
                    className="p-2 bg-slate-900 rounded text-slate-300 hover:text-sky-300"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <Link to="/consultation" onClick={closeMenus} className="block py-2 text-slate-200 hover:text-sky-400 font-semibold text-sm">
                اتصل بنا
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-amber-500 text-slate-950 font-bold py-3 rounded-xl text-center shadow flex items-center justify-center gap-2"
              >
                <PhoneIcon className="w-4 h-4" />
                <span>تواصل عبر واتساب</span>
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

      {/* ── الفوتر (مطابق للنسخة القديمة) ── */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="my-8 p-6 bg-slate-900 text-slate-100 border-r-4 border-sky-500 rounded-xl shadow-md mb-12">
            <div className="flex items-center gap-2 mb-2 text-sky-300 font-bold text-base">
              <ShieldAlertIcon className="w-5 h-5 shrink-0" />
              <h3>إخلاء مسؤولية طبية</h3>
            </div>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              إخلاء مسؤولية: المحتوى المنشور في FemSeha مخصص للتثقيف والتوعية الصحية والاستشارات
              الطبية، ولا يُعد بديلاً عن التشخيص أو التقييم الطبي المباشر. تختلف الحالات الطبية من
              شخص لآخر، ويُنصح بمراجعة الطبيب المختص عند الحاجة. وفي الحالات الطارئة، يجب طلب
              الرعاية الطبية العاجلة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo.png"
                  alt="FemSeha - FemSeha"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg shadow"
                />
                <div>
                  <span className="block text-xl font-bold text-white">FemSeha</span>
                  <span className="block text-xs text-sky-400 font-semibold">FemSeha</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-400 mb-4">
                منصة **FemSeha** برعاية **دكتور هيثم الخطيب** للتوعية والاستشارات الطبية المتعلقة
                بصحة المرأة والصحة الإنجابية في المملكة العربية السعودية.
              </p>
              <div className="space-y-2 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="dir-ltr font-bold text-emerald-400">{DOCTOR.phoneDisplay}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>المملكة العربية السعودية (السوق الأساسي)</span>
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>تثقيف واستشارات طبية متخصصة</span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-4 border-r-2 border-sky-500 pr-2">
                أقسام الموقع الرئيسية
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                {FOOTER_MAIN_LINKS.map((l) => (
                  <li key={l.label + l.href}>
                    <Link
                      to={l.href}
                      className={`hover:text-sky-300 transition-colors ${l.accent ? 'text-amber-400' : ''}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-4 border-r-2 border-amber-500 pr-2">
                مواضيع التوعية والسلامة
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                {FOOTER_TOPIC_LINKS.map((l) => (
                  <li key={l.label + l.href}>
                    <Link to={l.href} className="hover:text-amber-300 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-4 border-r-2 border-emerald-500 pr-2">
                تغطية المملكة العربية السعودية
              </h4>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                تستهدف منصة FemSeha تزويد النساء والمرضى بالاستشارات والمعرفة الصحية التخصصية في
                مختلف مدن ومناطق المملكة:
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {CITIES.map((c) => (
                  <span
                    key={c}
                    className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-900 text-center">
                <Link to="/consultation" className="text-xs text-sky-400 hover:underline font-semibold">
                  صفحة الاستشارات والتواصل
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 منصة فصيحة الطبية | FemSeha (femseha.com) — جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <Link to="/medical-disclaimer" className="hover:underline">إخلاء المسؤولية</Link>
              <span>•</span>
              <Link to="/medical-disclaimer" className="hover:underline">سياسة الخصوصية</Link>
              <span>•</span>
              <Link to="/medical-disclaimer" className="hover:underline">شروط الاستخدام</Link>
              <span>•</span>
              <Link to="/admin" className="hover:underline text-slate-600">لوحة التحكم</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* زر واتساب العائم */}
      <div className="fixed bottom-6 left-6 z-50">
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل عبر واتساب"
          className="group bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 border-2 border-emerald-400/40 animate-pulse hover:animate-none"
        >
          <div className="bg-white/20 p-1.5 rounded-full">
            <MessageCircleIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm hidden sm:inline">واتساب</span>
        </a>
      </div>
    </div>
  );
}

export default App;
