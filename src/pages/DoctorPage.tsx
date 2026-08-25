
import { Link } from 'react-router-dom';
import { DOCTOR, SITE, WHATSAPP_LINK, NO_SALE_NOTICE } from '../data/site';
import { useSeo, doctorJsonLd, websiteJsonLd, breadcrumbJsonLd } from '../lib/seo';

export default function DoctorPage() {
  useSeo({
    title: `عن الطبيب | ${DOCTOR.name} | منصة فصيحة الطبية`,
    description: `${DOCTOR.name} — ${DOCTOR.title}. ${DOCTOR.experience}. استشارات طبية تخصصية في صحة المرأة والتوليد والعقم.`,
    canonicalPath: '/doctor',
    jsonLd: [
      websiteJsonLd(),
      doctorJsonLd(),
      breadcrumbJsonLd([
        { name: 'الرئيسية', href: '/' },
        { name: 'عن الطبيب', href: '/doctor' }
      ])
    ]
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <nav aria-label="مسار التنقل" className="text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-blue-600">الرئيسية</Link>
          <span className="mx-2">‹</span>
          <span className="text-slate-600 font-semibold">عن الطبيب</span>
        </nav>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black">
            د.هـ
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">{DOCTOR.name}</h1>
          <p className="text-blue-700 font-bold mb-1">{DOCTOR.title}</p>
          <p className="text-slate-500 text-sm mb-8">{DOCTOR.clinic}</p>

          <div className="grid gap-4 sm:grid-cols-2 text-right mb-8">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-2">الخبرة السريرية</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{DOCTOR.experience}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-2">نطاق العمل</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                متابعة الحمل، صحة الدورة الشهرية، الخصوبة وتأخر الإنجاب، والاستشارات التوعوية في صحة المرأة
                والصحة الإنجابية.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 text-right">
            <h2 className="text-sm font-bold text-slate-900 mb-2">رسالة المنصة</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{SITE.description}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-sm text-amber-800 font-semibold leading-relaxed">
            {NO_SALE_NOTICE}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              💬 تواصل عبر واتساب
            </a>
            <a
              href={DOCTOR.phoneLink}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              📞 {DOCTOR.phoneDisplay}
            </a>
            <Link
              to="/consultation"
              className="px-6 py-3 bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-sm transition-colors"
            >
              تفاصيل الاستشارة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
