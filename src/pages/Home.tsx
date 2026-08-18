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
      
      {/* 1. الواجهة الترحيبية الرئيسية */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 text-white p-8 sm:p-14 lg:p-16 shadow-2xl border border-rose-800/40">
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-base sm:text-lg font-bold text-rose-100 border border-white/20">
            <span>✨</span> المنصة الطبية المعتمدة لصحة المرأة والخصوبة
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-normal text-white">
            رعايتك الصحية والسريرية <br className="hidden sm:inline" />
            بأعلى المعايير الطبية المعتمدة
          </h1>
          
          <p className="text-slate-100 text-lg sm:text-xl lg:text-2xl leading-loose font-medium max-w-3xl">
            بإشراف <span className="font-extrabold text-white underline decoration-rose-400 underline-offset-8">د. هيثم الخطيب</span>، اختصاصي جراحة النساء والتوليد وعلاج العقم. نوفر لك أدلة طبية موثوقة، واستشارات سريرية مباشرة لمتابعة الحمل الحرج، الخصوبة، وصحة المرأة.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href="https://wa.me/966599287172"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition flex items-center gap-3 text-base sm:text-xl transform hover:-translate-y-0.5"
            >
              💬 استشارة واتساب سريرية
            </a>
            <Link
              to="/articles"
              className="bg-white hover:bg-slate-100 text-slate-900 font-black px-8 py-4 rounded-2xl shadow-xl transition flex items-center gap-2 text-base sm:text-xl"
            >
              📚 تصفح الأدلة والمقالات
            </Link>
            <a
              href="tel:00966599287172"
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-6 py-4 rounded-2xl border border-white/20 transition text-base sm:text-xl"
            >
              📞 00966599287172
            </a>
          </div>
        </div>
      </section>

      {/* 2. صورة البانر (banner.jpg.png) */}
      <section className="rounded-3xl overflow-hidden shadow-2xl border-2 border-rose-200 bg-white">
        <a
          href="https://wa.me/966599287172"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full group cursor-pointer"
        >
          <img
            src="/banner.jpg.png"
            alt="د. هيثم الخطيب - استشارات طبية متخصصة"
            className="w-full h-auto block rounded-3xl object-cover group-hover:scale-[1.005] transition-transform duration-300"
          />
        </a>
      </section>

      {/* 3. قسم من نحن والتعريف بالطبيب وبطاقة اللوجو (logo.png.png) */}
      <section className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-5 max-w-2xl">
          <div className="inline-block bg-rose-50 text-rose-700 text-sm font-black px-4 py-1.5 rounded-full border border-rose-100">
            👨‍⚕️ المشرف الطبي العام للمنصة
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
            د. هيثم الخطيب
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-rose-600">
            اختصاصي جراحة النساء والتوليد والعقم وتأخر الإنجاب
          </p>
          <p className="text-slate-700 text-lg sm:text-xl leading-loose font-normal">
            خبرة سريرية متقدمة في إدارة حالات الحمل عالي الخطورة، بروتوكولات الحقن المجهري، مناظير البطن والرحم، وعلاج متلازمة تكيس المبايض وفق أحدث المعايير الطبية الدولية المعتمدة في المملكة والخليج.
          </p>
          <div className="flex flex-wrap gap-4 pt-3">
            <Link
              to="/doctor"
              className="bg-rose-50 hover:bg-rose-100 text-rose-800 font-black px-7 py-3.5 rounded-2xl text-base sm:text-lg transition"
            >
              السيرة السريرية والشهادات ←
            </Link>
            <a
              href="https://wa.me/966599287172"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-7 py-3.5 rounded-2xl text-base sm:text-lg transition shadow-sm"
            >
              حجز موعد واتساب (00966599287172)
            </a>
          </div>
        </div>

        {/* بطاقة العيادة مع اللوجو المرفوع */}
        <div className="bg-gradient-to-br from-rose-50 to-slate-100 p-8 sm:p-10 rounded-3xl border border-rose-100 text-center w-full md:w-84 space-y-4 shadow-inner">
          <img
            src="/logo.png.png"
            alt="شعار Femseha"
            className="w-28 h-28 mx-auto object-contain drop-shadow-md"
          />
          <div>
            <div className="font-black text-slate-900 text-xl">العيادة والاستشارات السريرية</div>
            <p className="text-sm text-slate-600 mt-1 font-medium">مواعيد المراجعة والتقارير الطبية</p>
          </div>
          <a
            href="tel:00966599287172"
            className="block w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-base shadow transition"
          >
            📞 00966599287172
          </a>
        </div>
      </section>

      {/* 4. إحصائيات سريعة */}
      <section className="bg-gradient-to-r from-rose-950 to-slate-950 text-white p-8 sm:p-10 rounded-3xl shadow-lg border border-rose-900/50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-white">{s.val}</div>
              <div className="text-sm sm:text-lg text-rose-200 font-bold">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. شبكة الخدمات التخصصية */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <span className="text-sm font-black text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">
            الخدمات والتخصصات السريرية
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900">
            رعاية سريرية شاملة لصحة المرأة في كل مرحلة
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="bg-white p-8 sm:p-9 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-4xl">{srv.icon}</span>
                  <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                    {srv.badge}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{srv.title}</h3>
                <p className="text-slate-600 text-base sm:text-lg leading-loose">{srv.desc}</p>
              </div>
              <a
                href="https://wa.me/966599287172"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-600 text-base font-black hover:underline inline-flex items-center gap-1 pt-3"
              >
                طلب استشارة حول هذه الخدمة ←
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 6. الأدلة والمقالات الطبية */}
      <section className="space-y-8 bg-slate-100/70 -mx-4 sm:-mx-6 lg:-mx-8 p-6 sm:p-12 rounded-3xl">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-sm font-black text-rose-600 bg-rose-100 px-4 py-1.5 rounded-full">
                المكتبة الطبية المعتمدة
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-2">
                أحدث الأدلة والاستشارات الطبية
              </h2>
            </div>
            <Link
              to="/articles"
              className="bg-rose-600 hover:bg-rose-700 text-white text-base font-black px-7 py-3.5 rounded-2xl shadow transition"
            >
              عرض جميع الأدلة الطبية ({articles.length}) ←
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArticles.map((art) => (
              <article
                key={art.id}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm text-slate-400">
                    <span className="font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                      {art.categoryName || 'دليل طبي'}
                    </span>
                    <span>{art.publishDate}</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-xl line-clamp-2 hover:text-rose-600 transition leading-snug">
                    <Link to={`/articles/${art.slug || art.id}`}>{art.title}</Link>
                  </h3>
                  <p className="text-slate-600 text-base line-clamp-3 leading-loose">
                    {art.summary}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
                  <span className="text-base text-slate-600 font-bold">د. هيثم الخطيب</span>
                  <Link
                    to={`/articles/${art.slug || art.id}`}
                    className="text-rose-600 font-black text-base hover:underline"
                  >
                    قراءة الدليل ←
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. الأسئلة الشائعة */}
      <section className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-sm font-black text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">
            إجابات سريرية
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900">
            الأسئلة الطبية الأكثر شيوعاً
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xl font-black text-slate-900 flex items-start gap-3">
                <span className="text-rose-600 font-black text-2xl">؟</span> {faq.q}
              </h3>
              <p className="text-base sm:text-lg text-slate-700 leading-loose pr-7 font-normal">
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
