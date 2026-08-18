import React from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';

export default function Home() {
  const featuredArticles = articles.slice(0, 3);

  const stats = [
    { label: 'استشارة سريرية منجزة', val: '+12,000' },
    { label: 'نسبة نجاح بروتوكولات الخصوبة', val: '94%' },
    { label: 'أدلة وبروتوكولات معتمدة', val: '+450' },
    { label: 'سنوات الخبرة الطبية', val: '+18 عاماً' },
  ];

  const services = [
    {
      title: 'علاج العقم وتأخر الإنجاب والحقن المجهري',
      desc: 'بروتوكولات علاجية متطورة لتنشيط التبويض، علاج ضعف مخزون المبيض، وتجهيز حالات الحقن المجهري وترجيع الأجنة بأعلى نسب نجاح.',
      badge: 'خصوبة وإنجاب',
      icon: '🩺',
      bg: 'from-rose-500/10 to-pink-500/5'
    },
    {
      title: 'متلازمة تكيس المبايض والاضطرابات الهرمونية',
      desc: 'خطة تشخيصية وسريرية شاملة لتنظيم الدورة الشهرية، ضبط مقاومة الأنسولين، وتحفيز التبويض الطبيعي بطرق حديثة.',
      badge: 'صحة المرأة',
      icon: '🌸',
      bg: 'from-purple-500/10 to-indigo-500/5'
    },
    {
      title: 'متابعة الحمل الحرج والمخاطر العالية',
      desc: 'رعاية دقيقة لحالات تسمم الحمل، سكري الحمل، المشيمة المتقدمة، ووقاية حالات الإجهاض المتكرر والولادة المبكرة.',
      badge: 'رعاية الحمل',
      icon: '🤰',
      bg: 'from-amber-500/10 to-orange-500/5'
    },
    {
      title: 'إرشادات الأدوية والبروتوكولات السريرية',
      desc: 'أدلة طبية موثوقة حول أدوية النساء، بروتوكولات ميزوبروستول (سايتوتك) المعتمدة بالمستشفيات، والتحذيرات السريرية لسلامة الرحم.',
      badge: 'أدلة الأدوية',
      icon: '💊',
      bg: 'from-emerald-500/10 to-teal-500/5'
    },
    {
      title: 'جراحات ومناظير النساء والتوليد',
      desc: 'علاج بطانة الرحم المهاجرة (الأندومتريوزيس)، إزالة الألياف الرحمية، وفك الالتصاقات الحوضية بتقنيات المنظار الجراحي المتقدم.',
      badge: 'جراحة متقدمة',
      icon: '🔬',
      bg: 'from-blue-500/10 to-cyan-500/5'
    },
    {
      title: 'استشارات الخصوبة والفحوصات الشاملة',
      desc: 'قراءة دقيقة لتحاليل الهرمونات الشاملة (AMH, FSH, LH, Prolactin) وفحوصات السونار التخصصية للرحم والمبيضين.',
      badge: 'فحوصات وتشخيص',
      icon: '📊',
      bg: 'from-rose-500/10 to-red-500/5'
    }
  ];

  const faqs = [
    {
      q: 'متى يجب استشارة الطبيب عند تأخر الدورة الشهرية؟',
      a: 'إذا تأخرت الدورة أكثر من 7 إلى 10 أيام مع وجود آلام حوضية أو وجود فرصة حمل، يجب عمل فحص الحمل الرقمي ومراجعة الطبيب لعمل فحص السونار ونفي أكياس المبيض أو الحمل المهاجر.'
    },
    {
      q: 'ما هي الخطوة الأولى لتشخيص تكيس المبايض؟',
      a: 'الفحص السريري المباشر بالموجات فوق الصوتية (السونار المهبلي/الحوضي) بالتزامن مع تحاليل الهرمونات في اليوم الثاني أو الثالث من الدورة.'
    },
    {
      q: 'هل يمكن أخذ أدوية لتفريغ الرحم أو تنزيل الحمل دون مراجعة المستشفى؟',
      a: 'تحذير طبي قاطع: يمنع منعاً باتاً استخدام عقاقير مثل ميزوبروستول (سايتوتك) دون إشراف سريري وفحص سونار، لما تسببه من مخاطر النزيف الحاد، تمزق الرحم، أو مضاعفات الحمل خارج الرحم.'
    },
    {
      q: 'كيف يمكنني حجز استشارة مباشرة مع د. هيثم الخطيب؟',
      a: 'يمكنك التواصل الفوري عبر الواتساب أو الهاتف على الرقم المباشر 00966599287172 للحصول على موعد استشارة سريرية ومناقشة تقاريرك الطبية.'
    }
  ];

  return (
    <div className="space-y-16 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      
      {/* 1. Hero Section الفاخر */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-rose-800/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-white/20 text-rose-200 shadow-inner">
            <span className="animate-pulse">🩺</span> المنصة الطبية المعتمدة لصحة المرأة والخصوبة
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
            رعايتك الصحية والسريرية <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-200 to-white">
              بأعلى المعايير الطبية المعتمدة
            </span>
          </h1>
          
          <p className="text-rose-100/90 text-base sm:text-lg leading-relaxed font-normal max-w-2xl">
            بإشراف <span className="font-extrabold text-white underline decoration-rose-400 underline-offset-4">د. هيثم الخطيب</span>، اختصاصي جراحة النساء والتوليد وعلاج العقم. نوفر لك أدلة طبية سريرية، واستشارات مباشرة لمتابعة الحمل الحرج والخصوبة.
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 pt-4">
            <a
              href="https://wa.me/966599287172"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-7 py-4 rounded-2xl shadow-lg hover:shadow-emerald-600/40 transition-all flex items-center gap-2 text-sm sm:text-base transform hover:-translate-y-0.5"
            >
              💬 استشارة واتساب سريرية
            </a>
            <Link
              to="/articles"
              className="bg-white hover:bg-rose-50 text-slate-900 font-bold px-7 py-4 rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm sm:text-base transform hover:-translate-y-0.5"
            >
              📚 تصفح الأدلة والمقالات الطبية
            </Link>
            <a
              href="tel:00966599287172"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-2xl border border-white/20 transition text-sm sm:text-base"
            >
              📞 00966599287172
            </a>
          </div>

          <div className="pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-white">{s.val}</div>
                <div className="text-xs text-rose-200/80 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. بطاقة التعريف بالدكتور */}
      <section className="bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-block bg-rose-50 text-rose-700 text-xs font-black px-3.5 py-1.5 rounded-full border border-rose-100">
            👨‍⚕️ المشرف الطبي العام للمنصة
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            د. هيثم الخطيب
          </h2>
          <p className="text-base font-bold text-rose-600">
            اختصاصي جراحة النساء والتوليد والعقم وأطفال الأنابيب
          </p>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            خبرة سريرية واسعة في علاج حالات تأخر الإنجاب، إدارة الحمل عالي الخطورة، جراحات المناظير المتقدمة، وعلاج متلازمة تكيس المبايض وفق أعلى المعايير الطبية الدولية.
          </p>
          <div className="pt-2">
            <Link
              to="/doctor"
              className="text-rose-600 font-bold text-sm hover:underline inline-flex items-center gap-1.5"
            >
              عرض السيرة السريرية والشهادات الكاملة ←
            </Link>
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-50 via-white to-slate-50 p-6 sm:p-8 rounded-3xl border border-rose-100 text-center w-full md:w-80 shadow-inner space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">
            🩺
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-lg">العيادة والاستشارات</div>
            <p className="text-xs text-slate-500 mt-1">حجز المواعيد والاستفسارات الطبية العاجلة</p>
          </div>
          <a
            href="https://wa.me/966599287172"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 transition"
          >
            تواصل مع العيادة واتساب
          </a>
        </div>
      </section>

      {/* 3. شبكة الخدمات التخصصية */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-100">
            الخدمات والتخصصات السريرية
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            رعاية سريرية شاملة لصحة المرأة في كل مرحلة
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            بروتوكولات تشخيصية وعلاجية مبنية على البراهين الطبية لضمان سلامتك وسلامة جنينك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-b ${srv.bg} bg-white p-7 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-3xl p-2 bg-white rounded-2xl shadow-sm border border-slate-100">{srv.icon}</span>
                  <span className="text-[11px] font-bold text-rose-600 bg-white px-3 py-1 rounded-full border border-rose-100 shadow-sm">
                    {srv.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{srv.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{srv.desc}</p>
              </div>
              <a
                href="https://wa.me/966599287172"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-600 text-xs font-bold hover:underline inline-flex items-center gap-1 pt-2"
              >
                طلب استشارة حول هذا التخصص ←
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 4. الأدلة والمقالات الطبية */}
      <section className="space-y-8 bg-slate-100/70 -mx-4 sm:-mx-6 lg:-mx-8 p-6 sm:p-12 rounded-[2.5rem] border border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-xs font-black text-rose-600 bg-rose-100 px-3.5 py-1.5 rounded-full">
                المكتبة الطبية المعتمدة
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
                أحدث الأدلة والاستشارات الطبية
              </h2>
            </div>
            <Link
              to="/articles"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition"
            >
              عرض جميع الأدلة الطبية ({articles.length}) ←
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((art) => (
              <article
                key={art.id}
                className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:border-rose-200 transition"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                      {art.categoryName || 'دليل طبي'}
                    </span>
                    <span>{art.publishDate}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-2 hover:text-rose-600 transition leading-snug">
                    <Link to={`/articles/${art.slug || art.id}`}>{art.title}</Link>
                  </h3>
                  <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-medium">د. هيثم الخطيب</span>
                  <Link
                    to={`/articles/${art.slug || art.id}`}
                    className="text-rose-600 font-bold text-xs hover:underline"
                  >
                    قراءة الدليل ←
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. الأسئلة الشائعة */}
      <section className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-black text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-100">
            إجابات سريرية
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            الأسئلة الطبية الأكثر شيوعاً
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-slate-900 flex items-start gap-2.5">
                <span className="text-rose-600 font-black text-lg">؟</span> {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pr-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. بانر التواصل الفوري للطوارئ */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white rounded-[2.5rem] p-8 sm:p-14 text-center space-y-6 shadow-2xl border border-slate-800">
        <h2 className="text-2xl sm:text-4xl font-black">
          هل تحتاجين إلى استشارة طبية أو تقييم سريري عاجل؟
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          فريقنا الطبي المباشر بإشراف د. هيثم الخطيب جاهز للرد على استفساراتك ومتابعة حالتك بأعلى درجات الخصوصية والاحترافية.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <a
            href="https://wa.me/966599287172"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all text-sm sm:text-base transform hover:-translate-y-0.5"
          >
            💬 محادثة واتساب مباشرة (00966599287172)
          </a>
          <a
            href="tel:00966599287172"
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all text-sm sm:text-base transform hover:-translate-y-0.5"
          >
            📞 اتصال هاتفي مباشر
          </a>
        </div>
      </section>

    </div>
  );
}

export { Home };
