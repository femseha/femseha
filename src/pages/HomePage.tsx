
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';
import { useSeo, websiteJsonLd, organizationJsonLd, doctorJsonLd } from '../lib/seo';

export default function HomePage() {
  useSeo({
    title: 'فيم صحة | منصة د. هيثم الخطيب لصحة المرأة',
    description:
      'منصة فصيحة الطبية: أدلة ومقالات طبية موثوقة في صحة المرأة، الحمل، الدورة الشهرية والخصوبة، بإشراف د. هيثم الخطيب اختصاصي جراحة النساء والتوليد والعقم.',
    canonicalPath: '/',
    jsonLd: [websiteJsonLd(), organizationJsonLd(), doctorJsonLd()]
  });

  // السلوك الأصلي للتصميم القديم: أول 3 مقالات من المخزون (يضمن ظهور دليل سايتوتك كأول بطاقة)
  const featuredArticles = articles.slice(0, 3);

  const stats = [
    { label: 'لكل استفسار طبي عبر واتساب', val: 'استجابة سريعة' },
    { label: 'متابعة سريرية بإشراف طبي مختص', val: 'متابعة دقيقة' },
    { label: 'حفظ كامل لسرية المعلومات', val: 'خصوصية تامة' },
    { label: 'دعم نفسي وإرشاد طبي موثوق', val: 'إرشاد طبي' },
  ];

  const services = [
    { title: 'علاج العقم وتأخر الإنجاب والحقن المجهري', desc: 'بروتوكولات علاجية متطورة لتنشيط التبويض، علاج ضعف مخزون المبيض.', badge: 'خصوبة وإنجاب', icon: '🩺' },
    { title: 'متلازمة تكيس المبايض والاضطرابات الهرمونية', desc: 'خطة تشخيصية وسريرية شاملة لتنظيم الدورة الشهرية.', badge: 'صحة المرأة', icon: '🌸' },
    { title: 'متابعة الحمل الحرج والمخاطر العالية', desc: 'رعاية دقيقة لحالات تسمم الحمل، سكري الحمل، والمشيمة المتقدمة.', badge: 'رعاية الحمل', icon: '🤰' }
  ];

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">

      {/* 1. اللوجو والبانر */}
      <section className="flex flex-col items-center gap-6">
        <img src="/logo.png.png" alt="Logo" className="w-24 h-24 object-contain" />
        <div className="w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
          <img src="/banner.jpg.png" alt="بانر د. هيثم" className="w-full h-auto block" />
        </div>
      </section>

      {/* 2. مزايا الخدمة (بدون أرقام أو ادعاءات غير موثقة) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="text-3xl font-black text-rose-900">{s.val}</div>
            <div className="text-sm text-slate-500 font-bold">{s.label}</div>
          </div>
        ))}
      </section>

      {/* 3. الخدمات التخصصية */}
      <section>
        <h2 className="text-3xl font-black mb-8 text-center">الخدمات التخصصية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((srv, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-4xl mb-4">{srv.icon}</div>
              <h3 className="font-bold text-lg mb-2">{srv.title}</h3>
              <p className="text-slate-600 text-sm">{srv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. المكتبة الطبية */}
      <section className="bg-slate-100 p-8 rounded-3xl">
        <h2 className="text-3xl font-black mb-2 text-center">المكتبة الطبية</h2>
        <p className="text-center text-slate-500 font-bold mb-8">أحدث المقالات الطبية والأدلة السريرية</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredArticles.map((art) => (
            <div key={art.id} className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold mb-2">{art.title}</h3>
              <Link to={`/articles/${art.slug}`} className="text-rose-700 font-bold hover:underline">قراءة المزيد ←</Link>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/articles" className="bg-white border-2 border-rose-900 text-rose-900 px-8 py-3 rounded-full font-bold hover:bg-rose-900 hover:text-white transition">
            عرض جميع المقالات
          </Link>
        </div>
      </section>

      {/* 5. زر التواصل */}
      <div className="text-center">
        <a href="https://wa.me/966599287172" className="bg-emerald-600 text-white px-10 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-emerald-700 transition">
          💬 تواصل عبر واتساب
        </a>
      </div>
    </div>
  );
}
