
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';

export default function NotFoundPage() {
  useSeo({
    title: 'الصفحة غير موجودة | منصة فصيحة الطبية',
    description: 'الصفحة المطلوبة غير متوفرة. يمكنك العودة إلى الرئيسية أو تصفح الأدلة الطبية.'
  });

  return (
    <div className="min-h-[60vh] bg-slate-50 flex items-center justify-center px-6 py-20" dir="rtl">
      <div className="text-center max-w-md">
        <div className="text-6xl font-black text-blue-700 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">الصفحة غير موجودة</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          الصفحة التي تبحثين عنها غير متوفرة أو تم نقلها. يمكنك العودة إلى الصفحة الرئيسية أو تصفح
          الأدلة الطبية.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
          >
            الصفحة الرئيسية
          </Link>
          <Link
            to="/articles"
            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors"
          >
            الأدلة الطبية
          </Link>
        </div>
      </div>
    </div>
  );
}
