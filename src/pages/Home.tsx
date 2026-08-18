import React from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';

export default function Home() {
  const featuredArticles = articles.slice(0, 3);

  const services = [
    {
      title: 'علاج العقم وتأخر الإنجاب والحقن المجهري',
      desc: 'بروتوكولات علاجية متطورة لتنشيط التبويض، علاج ضعف مخزون المبيض، وتجهيز حالات الحقن المجهري وترجيع الأجنة بأعلى نسب نجاح.',
      badge: 'خصوبة وإنجاب',
      icon: '🩺'
    },
    {
      title: 'متلازمة تكيس المبايض والاضطرابات الهرمونية',
      desc: 'خطة تشخيصية وسريرية شاملة لتنظيم الدورة الشهرية، ضبط مقاومة الأنسولين، وتحفيز التبويض الطبيعي بطرق حديثة.',
      badge: 'صحة المرأة',
      icon: '🌸'
    },
    {
      title: 'متابعة الحمل الحرج والمخاطر العالية',
      desc: 'رعاية دقيقة لحالات تسمم الحمل، سكري الحمل، المشيمة المتقدمة، ووقاية حالات الإجهاض المتكرر والولادة المبكرة.',
      badge: 'رعاية الحمل',
      icon: '🤰'
    },
    {
      title: 'إرشادات الأدوية والبروتوكولات السريرية',
      desc: 'أدلة طبية موثوقة حول أدوية النساء، بروتوكولات ميزوبروستول (سايتوتك) المعتمدة بالمستشفيات، والتحذيرات السريرية لسلامة الرحم.',
      badge: 'أدلة الأدوية',
      icon: '💊'
    },
    {
      title: 'جراحات ومناظير النساء والتوليد',
      desc: 'علاج بطانة الرحم المهاجرة (الأندومتريوزيس)، إزالة الألياف الرحمية، وفك الالتصاقات الحوضية بتقنيات المنظار الجراحي المتقدم.',
      badge: 'جراحة متقدمة',
      icon: '🔬'
    },
    {
      title: 'استشارات الخصوبة والفحوصات الشاملة',
      desc: 'قراءة دقيقة لتحاليل الهرمونات الشاملة (AMH, FSH, LH, Prolactin) وفحوصات السونار التخصصية للرحم والمبيضين.',
      badge: 'فحوصات وتشخيص',
      icon: '📊'
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
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-900 via-rose-800 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-white/20 text-rose-200">
            <span>✨</span> المنصة الطبية المعتمدة لصحة المرأة والخصوبة
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black leading-tight text-white tracking-tight">
            رعايتك الصحية والسريرية بأعلى المعايير الطبية المعتمدة
          </h1>
          
          <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
            بإشراف <span className="font-bold text-white underline decoration-rose-400">د. هيثم الخطيب</span>، اختصاصي جراحة النساء والتوليد وعلاج العقم. نوفر لك أدلة طبية موثوقة، واستشارات سريرية مباشرة لمتابعة الحمل الحرج، الخصوبة، وصحة المرأة.
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 pt-4">
            <a
              href="https://wa.me/966599287172"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg transition flex items-center gap-2 text-sm sm:text-base"
            >
              💬 استشارة واتساب سريرية
            </a>
            <Link
              to="/articles"
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3.5 rounded-2xl shadow-lg transition flex items-center gap-2 text-sm sm:text-base"
            >
              📚 تصفح الأدلة والمقالات الطبية
            </Link>
            <a
              href="tel:00966599287172"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3.5 rounded-2xl border border-white/20 transition text-sm sm:text-base"
            >
              📞 00966599287172
            </a>
          </div>
        </div>
      </section>

      {/* 2. Doctor Spotlight Banner */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-block bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full">
            المشرف الطبي العام للمنصة
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            د. هيثم الخطيب
          </h2>
          <p className="text-sm font-semibold text-rose-600">
            طبيب اختصاصي جراحة النساء والتوليد والعقم وتأخر الإنجاب
          </p>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            خبرة سريرية واسعة في إدارة حالات الحمل عالي الخطورة، بروتوكولات الحقن المجهري، مناظير البطن والرحم، وعلاج اضطرابات التبويض وفق أحدث الإرشادات الطبية المعتمدة.
          </p>
          <div className="pt-2">
            <Link
              to="/doctor"
              className="text-rose-600 font-bold text-sm hover:underline flex items-center gap-1"
            >
              عرض السيرة السريرية الكاملة ←
            </Link>
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-slate-100 p-6 rounded-2xl border border-rose-100 text-center w-full md:w-80 space-y-3">
          <div className="text-4xl">👨‍⚕️</div>
          <div className="font-bold text-slate-800 text-base">استشارة طبية مباشرة</div>
          <p className="text-xs text-slate-500">حجز المواعيد والاستفسار عن التقارير الطبية</p>
          <a
            href="https://wa.me/966599287172"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
          >
            تواصل عبر الواتساب الآن
          </a>
        </div>
      </section>

      {/* 3. Services Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            المجالات والخدمات التخصصية
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            رعاية سريرية شاملة لصحة المرأة في كل مرحلة
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-3xl">{srv.icon}</span>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
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
                طلب استشارة حول هذه الخدمة ←
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Articles */}
      <section className="space-y-8 bg-slate-100/60 -mx-4 sm:-mx-6 lg:-mx-8 p-6 sm:p-10 rounded-3xl">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
                المكتبة الطبية المعتمدة
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                أحدث الأدلة والاستشارات الطبية
              </h2>
            </div>
            <Link
              to="/articles"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition"
            >
              عرض جميع الأدلة الطبية ({articles.length}) ←
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((art) => (
              <article
                key={art.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {art.categoryName || 'دليل طبي'}
                    </span>
                    <span>{art.publishDate}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-2 hover:text-rose-600 transition">
                    <Link to={`/articles/${art.slug || art.id}`}>{art.title}</Link>
                  </h3>
                  <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">د. هيثم الخطيب</span>
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

      {/* 5. FAQs */}
      <section className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            إجابات سريرية
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            الأسئلة الطبية الأكثر شيوعاً
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
                <span className="text-rose-600 font-black">؟</span> {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pr-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export { Home };
