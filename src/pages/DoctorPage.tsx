
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
    <div className="bg-slate-950 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <nav aria-label="مسار التنقل" className="text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-sky-400">الرئيسية</Link>
          <span className="mx-2">‹</span>
          <span className="text-slate-300 font-semibold">عن الطبيب</span>
        </nav>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-lg p-8 sm:p-10 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-600 to-slate-800 border-2 border-sky-500 flex items-center justify-center text-white text-3xl font-black">
            د.هـ
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{DOCTOR.name}</h1>
          <p className="text-sky-400 font-bold mb-1">{DOCTOR.title}</p>
          <p className="text-slate-400 text-sm mb-8">{DOCTOR.clinic}</p>

          <div className="grid gap-4 sm:grid-cols-2 text-right mb-8">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-2">الخبرة السريرية</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{DOCTOR.experience}</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-2">نطاق العمل</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                متابعة الحمل، صحة الدورة الشهرية، الخصوبة وتأخر الإنجاب، والاستشارات التوعوية في صحة المرأة
                والصحة الإنجابية.
              </p>
            </div>
          </div>

          <div className="bg-sky-950/50 border border-sky-800/60 rounded-2xl p-5 mb-8 text-right">
            <h2 className="text-sm font-bold text-white mb-2">رسالة المنصة</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{SITE.description}</p>
          </div>

          <div className="bg-amber-950/50 border border-amber-800/60 rounded-2xl p-4 mb-8 text-sm text-amber-300 font-semibold leading-relaxed">
            {NO_SALE_NOTICE}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors shadow"
            >
              💬 تواصل عبر واتساب
            </a>
            <a
              href={DOCTOR.phoneLink}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm transition-colors shadow"
            >
              📞 {DOCTOR.phoneDisplay}
            </a>
            <Link
              to="/consultation"
              className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-100 hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors"
            >
              تفاصيل الاستشارة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
