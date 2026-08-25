import { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
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

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-3 justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight">منصة فصيحة الطبية</h1>
          <p className="text-xs text-slate-500 mt-0.5">إشراف د. هيثم الخطيب</p>
        </div>
        <nav className="flex flex-wrap gap-2 items-center text-sm font-medium">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-lg transition text-slate-600 hover:text-blue-600 hover:bg-blue-50"
          >
            الرئيسية
          </Link>
          <Link
            to="/articles"
            className="px-3 py-1.5 rounded-lg transition text-slate-600 hover:text-blue-600 hover:bg-blue-50"
          >
            الأدلة الطبية
          </Link>
          <Link
            to="/doctor"
            className="px-3 py-1.5 rounded-lg transition text-slate-600 hover:text-blue-600 hover:bg-blue-50"
          >
            عن الطبيب
          </Link>
          <Link
            to="/consultation"
            className="px-3 py-1.5 rounded-lg transition text-slate-600 hover:text-blue-600 hover:bg-blue-50"
          >
            الاستشارة الطبية
          </Link>
          <Link
            to="/admin"
            className="px-3 py-1.5 rounded-lg transition text-slate-600 hover:text-blue-600 hover:bg-blue-50"
          >
            لوحة الإدارة
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-500">
      <nav className="mb-3 flex flex-wrap justify-center gap-4">
        <Link to="/" className="hover:text-blue-600">الرئيسية</Link>
        <Link to="/articles" className="hover:text-blue-600">الأدلة الطبية</Link>
        <Link to="/doctor" className="hover:text-blue-600">عن الطبيب</Link>
        <Link to="/consultation" className="hover:text-blue-600">الاستشارة الطبية</Link>
        <Link to="/medical-disclaimer" className="hover:text-blue-600">إخلاء المسؤولية الطبية</Link>
      </nav>
      <p>محتوى تعليمي فقط — لا نبيع الأدوية ولا نقدم جرعات أو خططاً علاجية فردية.</p>
      <p className="mt-1">جميع الحقوق محفوظة © 2026 منصة فصيحة الطبية - إشراف د. هيثم الخطيب</p>
    </footer>
  );
}

export function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col" dir="rtl">
      <ScrollToTop />
      <Header />
      <div className="flex-1">
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
      </div>
      <Footer />
    </div>
  );
}

export default App;
