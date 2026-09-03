
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';

export default function NotFoundPage() {
  useSeo({
    title: 'الصفحة غير موجودة | منصة فصيحة الطبية',
    description: 'الصفحة المطلوبة غير متوفرة. يمكنك العودة إلى الرئيسية أو تصفح الأدلة الطبية.',
    // 404 حقيقي: noindex وبلا canonical — حتى لا تُفهرس روابط ميتة ولا تُوجَّه
    // قوة الفهرسة زوراً إلى الرئيسية.
    robots: 'noindex, follow',
    noCanonical: true
  });

  return (
    <div className="min-h-[60vh] bg-slate-950 flex items-center justify-center px-6 py-20" dir="rtl">
      <div className="text-center max-w-md">
        <div className="text-6xl font-black text-sky-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">الصفحة غير موجودة</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          الصفحة التي تبحثين عنها غير متوفرة أو تم نقلها. يمكنك العودة إلى الصفحة الرئيسية أو تصفح
          الأدلة الطبية.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm transition-colors"
          >
            الصفحة الرئيسية
          </Link>
          <Link
            to="/articles"
            className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-100 hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors"
          >
            الأدلة الطبية
          </Link>
        </div>
      </div>
    </div>
  );
}
