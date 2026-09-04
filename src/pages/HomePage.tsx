import { Link } from 'react-router-dom';
import { articles } from '../data/articles';
import { WHATSAPP_LINK } from '../data/site';
import { useSeo, websiteJsonLd, organizationJsonLd, doctorJsonLd } from '../lib/seo';
import {
  ShieldCheckIcon,
  ShieldAlertIcon,
  MessageCircleIcon,
  BookOpenIcon,
  CircleCheckIcon,
  HeartIcon,
  TriangleAlertIcon,
  CircleQuestionMarkIcon,
  ChevronLeftIcon,
  ClockIcon,
  UserIcon,
  ExternalLinkIcon,
  MapPinIcon,
  StethoscopeIcon,
} from '../components/Icons';

const CATEGORY_LINKS = {
  'سايتوتك في السعودية': '/articles/cytotec-misoprostol-saudi-riyadh-guide',
  'دليل السلامة والطوارئ': '/articles/nuchal-cord-pregnancy-safety-guide',
  'صحة المرأة': '/articles/pcos-symptoms-fertility-treatment',
};

const CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر',
  'القطيف', 'صفوى', 'الأحساء', 'الهفوف', 'القصيم', 'بريدة', 'تبوك', 'أبها', 'جازان',
];

const FAQS = [
  {
    q: 'ما هي الخدمات التي تقدمها منصة FemSeha؟',
    a: 'FemSeha هي منصة طبية متخصصة في التثقيف الصحي والاستشارات الطبية المتعلقة بصحة المرأة والصحة الإنجابية، تحت إشراف دكتور هيثم الخطيب.',
  },
  {
    q: 'كيف تضمنون سرية الاستشارة الطبية؟',
    a: 'تُعامل جميع الاستشارات بخصوصية وسرية تامة بين المريضة والطبيب. يمكنك التواصل عبر صفحة الاستشارات.',
  },
  {
    q: 'ما هي الحالات التي تستدعي الرعاية الطبية العاجلة؟',
    a: 'في حالات النزيف الرحمي الشديد، الألم الحاد بأسفل البطن أو أحد الجانبين، أو ارتفاع الحرارة الشديد، يجب التوجه فوراً لأقرب قسم طوارئ بالمستشفى أو الاتصال بطوارئ وزارة الصحة (937).',
  },
  {
    q: 'كيف أستعد للاستشارة الطبية حول أعراض الحمل أو الدورة؟',
    a: 'يُفضل تدوين تاريخ آخر دورة شهرية، والأعراض التي تشعرين بها، ونتائج أي فحوصات منزلية أو مخبرية سابقة لمشاركتها مع الدكتور أثناء الاستشارة.',
  },
];

export default function HomePage() {
  useSeo({
    title: 'فيم صحة | منصة د. هيثم الخطيب لصحة المرأة',
    description:
      'منصة فصيحة الطبية: أدلة ومقالات طبية موثوقة في صحة المرأة، الحمل، الدورة الشهرية والخصوبة، بإشراف د. هيثم الخطيب اختصاصي جراحة النساء والتوليد والعقم.',
    canonicalPath: '/',
    jsonLd: [websiteJsonLd(), organizationJsonLd(), doctorJsonLd()]
  });

  // التصميم القديم: شبكة 6 بطاقات مقالات من المخزون الحالي
  const featuredArticles = articles.slice(0, 6);

  return (
    <div className="space-y-16 pb-16">
      {/* البانر الأساسي: صورة د. هيثم الخطيب كاملة العرض (بدون قص أو تمدد) */}
      <section className="relative w-full bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="استشارة طبية نسائية متخصصة - FemSeha"
          >
            <img
              src="/images/dr-haitham-hero.jpg"
              alt="دكتور هيثم الخطيب - استشارات طبية نسائية متخصصة - FemSeha"
              width={1408}
              height={768}
              className="w-full h-auto object-cover"
            />
          </a>
        </div>
      </section>

      {/* الهيرو: العنوان والبطاقة التعريفية */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-sky-50 to-slate-50 pt-12 pb-20 border-b border-sky-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-right">
              <div className="inline-flex items-center gap-2 bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-inner">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                <span>FemSeha — منصة التثقيف والاستشارات الطبية</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                صحة المرأة والصحة الإنجابية في السعودية
              </h1>
              <p className="text-lg sm:text-xl text-slate-700 font-normal leading-relaxed">
                معلومات طبية موثوقة واستشارات متخصصة حول صحة المرأة والصحة الإنجابية.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                منصة طبية متخصصة في التثقيف الصحي والاستشارات الطبية المتعلقة بصحة المرأة والصحة
                الإنجابية مع دكتور هيثم الخطيب.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <MessageCircleIcon className="w-5 h-5 fill-slate-950" />
                  <span>تواصل مع دكتور هيثم الخطيب</span>
                </a>
                <Link
                  to="/articles"
                  className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-base px-6 py-4 rounded-xl border border-slate-300 transition-all text-center flex items-center justify-center gap-2"
                >
                  <BookOpenIcon className="w-5 h-5 text-sky-400" />
                  <span>اقرأ المعلومات الطبية</span>
                </Link>
              </div>
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-lg border border-slate-200">
                  <CircleCheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>خصوصية وسرية تامة</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-lg border border-slate-200">
                  <CircleCheckIcon className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>إشراف دكتور هيثم الخطيب</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                  <CircleCheckIcon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>تغطية بالمملكة العربية السعودية</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-gradient-to-b from-white to-slate-50 p-6 sm:p-8 rounded-2xl border border-sky-200 shadow-2xl space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
                  <img
                    src="/logo.png"
                    alt="FemSeha Logo"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-2xl shadow-lg shrink-0"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">دكتور هيثم الخطيب</h2>
                    <p className="text-xs text-sky-700 font-semibold mt-1">Dr. Haitham Al-Khatib</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">استشارات التثقيف والصحة الإنجابية</p>
                  </div>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    تهدف منصة **FemSeha** إلى توفير الاستشارات التوعوية الموثوقة لكل من يبحث عن
                    الإجابات الطبية الدقيقة في مجالات الحمل، اضطرابات الدورة، وسلامة استخدام
                    العلاجات.
                  </p>
                </div>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow transition-colors text-sm"
                >
                  تواصل عبر واتساب
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* عن FemSeha ودكتور هيثم الخطيب */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-block text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                عن FemSeha ودكتور هيثم الخطيب
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                رؤيتنا ورسالتنا في التوعية الصحية والاستشارات الطبية
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                منصة **FemSeha** بإشراف **دكتور هيثم الخطيب** هي منصة طبية متخصصة في التثقيف الصحي
                والاستشارات الطبية المتعلقة بصحة المرأة والصحة الإنجابية بالمملكة العربية السعودية
                والخليج العربي.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-sky-700 mb-1">السرية التامة</h3>
                  <p className="text-slate-500">نلتزم بأعلى معايير الخصوصية في كافة التواصلات والاستشارات.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-sky-700 mb-1">المعرفة الموثوقة</h3>
                  <p className="text-slate-500">محتوى طبي مبني على المعايير العلمية والإرشادات الطبية المعتمدة.</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-center">
              <Link
                to="/doctor"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3.5 rounded-xl shadow transition-colors text-sm"
              >
                <span>تعرف أكثر على دكتور هيثم الخطيب</span>
                <ChevronLeftIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* المحاور التوعوية والاستشارية الرئيسية */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            المحاور التوعوية والاستشارية الرئيسية
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            تغطي FemSeha أهم الجوانب الصحية والإنجابية التي تهم المرأة مع توفير إرشادات طبية دقيقة مع
            دكتور هيثم الخطيب.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md hover:border-sky-600 transition-colors space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-400">
                <TriangleAlertIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">سلامة الأدوية وميسوبروستول</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                معلومات طبية حاسمة وتوعية حقيقية بمخاطر استخدام أدوية سايتوتك وميسوبروستول دون متابعة
                طبية تخصصية بالمنشآت المعتمدة.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-200">
                <li>• سايتوتك في السعودية والاستخدامات والمخاطر</li>
                <li>• حقائق مادة الميسوبروستول والأعراض الجانبية</li>
                <li>• مخاطر الاستخدام غير المباشر دون تقييم طبي</li>
              </ul>
            </div>
            <Link
              to={CATEGORY_LINKS['سايتوتك في السعودية']}
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 text-xs font-bold pt-4"
            >
              <span>اقرأ المزيد حول الأمان الدوائي</span>
              <ChevronLeftIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md hover:border-sky-600 transition-colors space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-400">
                <HeartIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">الحمل والإجهاض والطوارئ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                دليل شامل لأعراض الحمل المبكر، مؤشرات الإجهاض التلقائي، النزيف في الحمل، وكيفية
                التصرف السريع عند الحالات الطارئة.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-200">
                <li>• أعراض ومخاطر الحمل خارج الرحم</li>
                <li>• متى يكون النزيف أثناء الحمل طارئاً؟</li>
                <li>• العناية والتعافي بعد الإجهاض وتأثير عامل RH</li>
              </ul>
            </div>
            <Link
              to={CATEGORY_LINKS['دليل السلامة والطوارئ']}
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 text-xs font-bold pt-4"
            >
              <span>استكشف دليل السلامة والطوارئ</span>
              <ChevronLeftIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md hover:border-sky-600 transition-colors space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-400">
                <StethoscopeIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">صحة المرأة وأعراض الحمل</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                معرفة صحية واسعة حول علامات الحمل المبكرة جداً، أسباب تأخر وانقطاع الدورة الشهرية
                غير الحمل، وتكيس المبايض.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-200">
                <li>• أعراض الحمل الأولى قبل وبعد الدورة</li>
                <li>• أسباب تأخر الدورة الشهرية الهرمونية والنفسية</li>
                <li>• حساب أيام التبويض ونافذة الإخصاب</li>
              </ul>
            </div>
            <Link
              to={CATEGORY_LINKS['صحة المرأة']}
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 text-xs font-bold pt-4"
            >
              <span>تصفح قسم صحة المرأة</span>
              <ChevronLeftIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* أحدث المقالات والمعلومات الطبية */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              أحدث المقالات والمعلومات الطبية
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              أحدث المقالات الطبية: مقالات توعوية شاملة وموثوقة بقلم دكتور هيثم الخطيب
            </p>
          </div>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-300 text-sky-700 font-bold px-4 py-2 rounded-lg text-xs transition-colors"
          >
            <span>جميع المقالات الـ {articles.length}</span>
            <ChevronLeftIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white border border-slate-200 hover:border-sky-600 rounded-xl p-6 flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-md font-semibold">
                    {article.categoryName}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3 text-slate-500" />
                    {article.readTime} دقيقة
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
                  <Link to={`/articles/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{article.summary}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                  <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                  دكتور هيثم الخطيب
                </span>
                <Link
                  to={`/articles/${article.slug}`}
                  className="text-blue-700 group-hover:text-blue-800 font-bold flex items-center gap-1 text-xs"
                >
                  <span>اقرأ المقال</span>
                  <ChevronLeftIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* مراجع وروابط خارجية توعوية موثوقة */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="my-8 p-5 bg-sky-50/40 border border-sky-200 rounded-xl text-xs text-sky-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-sky-700 font-bold text-sm">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
            <span>مراجع وروابط خارجية توعوية موثوقة</span>
          </div>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2">
              <ExternalLinkIcon className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <a
                  href="https://taxiporteu.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-700 hover:underline flex items-center gap-1 text-xs"
                >
                  وزارة الصحة بالمملكة العربية السعودية - المنصات التوعوية الرسمية
                </a>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                  رابط توعوي رسمي للخدمات الصحية والخدمات الطبية الطارئة بالمملكة
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLinkIcon className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <a
                  href="https://sehaher.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-700 hover:underline flex items-center gap-1 text-xs"
                >
                  الهيئة العامة للغذاء والدواء - الدليل الموحد لسلامة الدواء
                </a>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                  مرجع رسمي للتحقق من سلامة العلاجات والتحذيرات الدوائية المعتمدة
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLinkIcon className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <a
                  href="https://femseha.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-700 hover:underline flex items-center gap-1 text-xs"
                >
                  منظمة الصحة العالمية - الصحة الإنجابية وصحة المرأة
                </a>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                  الإرشادات الدولية المعتمدة في معايير السلامة والتوعية الصحية للنساء
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* خدمة توعوية واستشارية مخصصة للنساء في جميع مدن المملكة */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white via-sky-50 to-white border border-sky-200 rounded-2xl p-8 shadow-xl">
          <div className="max-w-3xl space-y-4 text-right">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
              <MapPinIcon className="w-4 h-4" />
              <span>المملكة العربية السعودية — السوق الأساسي</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              خدمة توعوية واستشارية مخصصة للنساء في جميع مدن المملكة
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              نصل بتوعيتنا واستشاراتنا الطبية السرية لكل سيدة في كافة المناطق والمدن السعودية مع دكتور
              هيثم الخطيب.
            </p>
            <div className="flex flex-wrap gap-2 pt-2 text-xs font-semibold text-slate-700">
              {CITIES.map((c) => (
                <span
                  key={c}
                  className="bg-white/90 border border-slate-300/80 px-3 py-1.5 rounded-lg text-sky-700"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* الأسئلة الشائعة والإجابات الطبية */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <CircleQuestionMarkIcon className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-slate-900">الأسئلة الشائعة والإجابات الطبية</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map((f, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
              <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
                <span className="text-amber-400 shrink-0 font-extrabold">س:</span>
                <span>{f.q}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pr-5">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* هل لديك استفسار صحي؟ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">هل لديك استفسار صحي؟</h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-xl mx-auto">
            يمكنك التواصل مع دكتور هيثم الخطيب للحصول على توجيه واستشارة طبية متخصصة حول صحة المرأة
            والصحة الإنجابية.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              <MessageCircleIcon className="w-4 h-4" />
              <span>تواصل عبر واتساب</span>
            </a>
            <Link
              to="/consultation"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-800 font-bold px-6 py-3 rounded-xl border border-slate-300 text-sm transition-colors"
            >
              صفحة الاستشارات
            </Link>
          </div>
        </div>
      </section>

      {/* إخلاء مسؤولية طبية */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="my-8 p-6 bg-white text-slate-800 border-r-4 border-sky-500 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-2 text-sky-700 font-bold text-base">
            <ShieldAlertIcon className="w-5 h-5 shrink-0" />
            <h3>إخلاء مسؤولية طبية</h3>
          </div>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
            إخلاء مسؤولية: المحتوى المنشور في FemSeha مخصص للتثقيف والتوعية الصحية والاستشارات الطبية،
            ولا يُعد بديلاً عن التشخيص أو التقييم الطبي المباشر. تختلف الحالات الطبية من شخص لآخر،
            ويُنصح بمراجعة الطبيب المختص عند الحاجة. وفي الحالات الطارئة، يجب طلب الرعاية الطبية
            العاجلة.
          </p>
        </div>
      </section>
    </div>
  );
}
