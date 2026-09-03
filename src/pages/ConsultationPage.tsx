
import { Link } from 'react-router-dom';
import { DOCTOR, WHATSAPP_LINK } from '../data/site';
import { useSeo, websiteJsonLd, breadcrumbJsonLd, doctorJsonLd } from '../lib/seo';

export default function ConsultationPage() {
  useSeo({
    title: 'الاستشارة الطبية | د. هيثم الخطيب | منصة فصيحة الطبية',
    description:
      'احجزي استشارتك الطبية مع د. هيثم الخطيب، اختصاصي جراحة النساء والتوليد والعقم، عبر الهاتف أو واتساب بسرية تامة.',
    canonicalPath: '/consultation',
    jsonLd: [
      websiteJsonLd(),
      doctorJsonLd(),
      breadcrumbJsonLd([
        { name: 'الرئيسية', href: '/' },
        { name: 'الاستشارة الطبية', href: '/consultation' }
      ])
    ]
  });

  return (
    <div className="bg-slate-950 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <nav aria-label="مسار التنقل" className="text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-sky-400">الرئيسية</Link>
          <span className="mx-2">‹</span>
          <span className="text-slate-300 font-semibold">الاستشارة الطبية</span>
        </nav>

        <section className="bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950 border border-sky-800/60 text-white rounded-3xl p-8 sm:p-10 text-center shadow-xl mb-8">
          <h1 className="text-3xl font-black mb-3">الاستشارة الطبية مع {DOCTOR.name}</h1>
          <p className="text-slate-300 leading-relaxed max-w-xl mx-auto">
            استشارات طبية تخصصية في صحة المرأة، الحمل، الخصوبة، واضطرابات الدورة الشهرية — بسرية وخصوصية
            تامة.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors shadow"
            >
              💬 استشارة واتساب
            </a>
            <a
              href={DOCTOR.phoneLink}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-sm transition-colors shadow"
            >
              📞 {DOCTOR.phoneDisplay}
            </a>
          </div>
        </section>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-3">ماذا تغطي الاستشارة؟</h2>
            <ul className="list-disc pr-5 space-y-2 text-sm text-slate-300 leading-relaxed">
              <li>متابعة الحمل وعلامات الخطر التي تستدعي تقييماً عاجلاً.</li>
              <li>اضطرابات الدورة الشهرية وتأخرها.</li>
              <li>الخصوبة وتأخر الإنجاب وخيارات التقييم الأولي.</li>
              <li>قراءة النتائج والتحاليل ضمن سياقك الصحي.</li>
              <li>أسئلة عن سلامة الأدوية في الحمل والإرضاع.</li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-3">كيف تستعدين للاستشارة؟</h2>
            <ol className="list-decimal pr-5 space-y-2 text-sm text-slate-300 leading-relaxed">
              <li>جهّزي تاريخك الطبي المختصر والأدوية الحالية.</li>
              <li>أرفقي نتائج الفحوصات أو تقارير السونار إن وُجدت.</li>
              <li>دوّني أسئلتك مسبقاً حتى لا يفوتك شيء أثناء الحوار.</li>
              <li>حدّدي تاريخ أول يوم من آخر دورة شهرية عند الحاجة.</li>
            </ol>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:col-span-2">
            <h2 className="text-base font-bold text-white mb-3">السرية والخصوصية</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              تُعامل جميع التواصلات بسرية تامة. لا نطلب معلومات أكثر مما تحتاجه الحالة، ولا نشارك أي بيانات
              مع أي جهة.
            </p>
          </div>
        </div>

        <div className="mt-6 border border-slate-800 bg-slate-900 rounded-2xl p-4 text-xs leading-relaxed text-slate-300">
          <strong className="text-white">تنبيه مهم:</strong> الاستشارة عن بُعد لا تغني عن الفحص
          السريري المباشر عند الحاجة، ولا تصلح للحالات الطارئة. في الحالات الطارئة (نزيف غزير، ألم شديد،
          إغماء، حمى مرتفعة) توجهي فوراً إلى أقرب قسم طوارئ أو اتصلي بالطوارئ الموحد.
        </div>
      </div>
    </div>
  );
}
