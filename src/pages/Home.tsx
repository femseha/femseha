import { Link } from "react-router-dom";
import { ArticleCard, TopicCard } from "@/components/Content";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { LATEST_ARTICLES } from "@/data/articles";
import { DOCTOR, NO_SALE_NOTICE, SITE } from "@/data/site";
import { doctorJsonLd, organizationJsonLd, useSeo, websiteJsonLd } from "@/lib/seo";
import { S } from "@/data/sources";

const TOPIC_CARDS = [
  {
    label: "صحة المرأة",
    href: "/womens-health",
    icon: "🌿",
    description: "الدورة الشهرية، الهرمونات، الخصوبة، والرعاية الوقائية.",
  },
  {
    label: "الحمل",
    href: "/pregnancy",
    icon: "🤰",
    description: "المتابعة الطبية عبر أثلاث الحمل وعلامات الخطر المبكرة.",
  },
  {
    label: "تأخر الدورة الشهرية",
    href: "/delayed-period",
    icon: "📅",
    description: "الأسباب الشائعة وخطوات التقييم الطبي المنظم.",
  },
  {
    label: "الأدوية",
    href: "/medications",
    icon: "💊",
    description: "معلومات دوائية تعليمية واعتبارات السلامة — دون بيع أو جرعات.",
  },
  {
    label: "سايتوتك",
    href: "/cytotec",
    icon: "📄",
    description: "تعريف الدواء، استخداماته المعترف بها، ومخاطره وتحذيراته.",
  },
  {
    label: "ميزوبروستول",
    href: "/misoprostol",
    icon: "🔬",
    description: "المادة الفعّالة: آلية العمل، الاستخدامات والسلامة.",
  },
  {
    label: "أدوية الإجهاض",
    href: "/abortion-medications",
    icon: "⚕️",
    description: "إطار طبي تعليمي محايد ومخاطر الاستخدام دون إشراف.",
  },
  {
    label: "الحمل خارج الرحم",
    href: "/ectopic-pregnancy",
    icon: "🚨",
    description: "حالة طارئة: علامات الخطر وطرق التشخيص.",
  },
  {
    label: "السونار والحمل",
    href: "/ultrasound",
    icon: "🖥️",
    description: "ماذا يُظهر السونار في كل مرحلة وما حدوده.",
  },
];

export default function Home() {
  useSeo({
    title: "دليل صحة المرأة | معلومات طبية موثوقة عن الحمل والأدوية",
    description:
      "منصة تثقيف طبي عربية لصحة المرأة والحمل والأدوية: سايتوتك، ميزوبروستول، تأخر الدورة، الحمل خارج الرحم والسونار. محتوى تعليمي مستند إلى مصادر طبية معتمدة. لا نبيع الأدوية.",
    path: "/",
    jsonLd: [websiteJsonLd, organizationJsonLd, doctorJsonLd],
  });

  return (
    <>
      {/* HERO */}
      <section className="border-b border-ink-200 bg-gradient-to-l from-brand-50 via-white to-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-bold text-brand-700">
              منصة تثقيف طبي عربية
            </p>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl lg:text-[2.75rem]">
              دليل صحة المرأة: معلومات طبية موثوقة عن الحمل والأدوية وصحة المرأة
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-loose text-ink-600 sm:text-lg">
              محتوى تعليمي مكتوب بلغة عربية واضحة ومستند إلى مصادر طبية معتمدة مثل منظمة الصحة العالمية وإدارة الغذاء
              والدواء والكليات المتخصصة في طب النساء والولادة، مع تركيز على السلامة وعلامات الخطر ومتى يصبح التقييم
              الطبي ضروريًا.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/articles"
                className="rounded-xl bg-ink-900 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-ink-800"
              >
                تصفحي المقالات الطبية
              </Link>
              <a
                href={DOCTOR.phoneLink}
                className="rounded-xl border border-brand-300 bg-white px-6 py-3.5 text-sm font-extrabold text-brand-800 hover:bg-brand-50"
              >
                استشارة طبية: <span className="arabic-numbers">{DOCTOR.phoneDisplay}</span>
              </a>
            </div>
            <p className="mt-6 max-w-2xl rounded-xl border-r-4 border-brand-600 bg-brand-50 p-4 text-sm leading-relaxed text-ink-700">
              {NO_SALE_NOTICE}
            </p>
          </div>

          <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-sm">
            <img
              src="/og-image.jpg"
              alt="رسم توضيحي طبي مبسط بألوان هادئة يرمز إلى المحتوى التثقيفي الطبي في موقع دليل صحة المرأة"
              width={1200}
              height={630}
              loading="lazy"
              className="mb-5 aspect-[1200/630] w-full rounded-2xl border border-ink-100 object-cover"
            />
            <h2 className="text-lg font-extrabold text-ink-900">مبادئ المحتوى لدينا</h2>
            <ul className="mt-4 space-y-4 text-sm text-ink-600">
              {[
                ["مصادر معتمدة", "كل موضوع مرتبط بمراجع طبية يمكن الرجوع إليها ومراجعتها."],
                ["شفافية كاملة", "نوضح كاتب المقال وحالة المراجعة الطبية وتاريخ آخر تحديث."],
                ["سلامة أولًا", "نركز على علامات الخطر ومتى تكون الحالة طارئة."],
                ["بلا ترويج دوائي", "لا أسعار ولا بيع ولا طرق شراء ولا جرعات فردية."],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-3">
                  <span aria-hidden="true" className="mt-1 text-brand-600">
                    ✓
                  </span>
                  <span>
                    <span className="block font-bold text-ink-900">{title}</span>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl bg-ink-50 p-4">
              <p className="text-xs font-bold text-ink-500">الاستشارة الطبية</p>
              <p className="mt-1 text-sm font-extrabold text-ink-900">{DOCTOR.name}</p>
              <p className="text-sm text-ink-600">{DOCTOR.profession}</p>
              <a
                href={DOCTOR.phoneLink}
                className="mt-3 block arabic-numbers rounded-lg bg-brand-700 py-2.5 text-center text-sm font-bold text-white hover:bg-brand-800"
              >
                {DOCTOR.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TOPICS */}
      <section aria-labelledby="topics-heading" className="mx-auto max-w-7xl px-4 py-14">
        <h2 id="topics-heading" className="text-2xl font-extrabold text-ink-900">
          الأقسام والمواضيع الطبية
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">
          مواضيع مترابطة تغطي صحة المرأة والحمل والأدوية، مع روابط داخلية تساعدك على الانتقال من السؤال إلى المعلومة
          الصحيحة.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOPIC_CARDS.map((t) => (
            <TopicCard key={t.href} {...t} />
          ))}
        </div>
      </section>

      {/* LATEST ARTICLES */}
      <section aria-labelledby="latest-heading" className="border-y border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="latest-heading" className="text-2xl font-extrabold text-ink-900">
                أحدث المقالات
              </h2>
              <p className="mt-2 text-sm text-ink-600">مقالات تأسيسية مكتوبة بعناية ومراجعة للمصادر.</p>
            </div>
            <Link to="/articles" className="text-sm font-bold text-brand-700 hover:text-brand-800">
              كل المقالات ←
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LATEST_ARTICLES.slice(0, 6).map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>
      </section>

      {/* MEDICAL REVIEW + SOURCES */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-ink-200 bg-white p-7">
            <h2 className="text-xl font-extrabold text-ink-900">المراجعة الطبية</h2>
            <p className="mt-3 text-sm leading-loose text-ink-600">
              نلتزم بالشفافية: يُعرض في كل مقال اسم كاتب المحتوى وحالة المراجعة الطبية بوضوح. لا ندّعي مراجعة طبية لم
              تحدث فعلًا، وعند اعتماد مراجعة طبية موثقة لأي مقال يظهر ذلك صراحة في صفحة المقال.
            </p>
            <Link to="/medical-review" className="mt-5 inline-block text-sm font-bold text-brand-700 hover:text-brand-800">
              اطّلعي على سياسة المراجعة الطبية ←
            </Link>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-white p-7">
            <h2 className="text-xl font-extrabold text-ink-900">المصادر الطبية</h2>
            <p className="mt-3 text-sm leading-loose text-ink-600">
              نعتمد على جهات مثل منظمة الصحة العالمية (WHO)، وإدارة الغذاء والدواء الأمريكية (FDA)، والهيئة العامة للغذاء
              والدواء (SFDA)، وACOG وRCOG وNHS، إضافة إلى المراجع الدوائية المعتمدة.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-ink-600">
              {[S.whoAbortionCare, S.fdaCytotecLabel, S.sfda, S.acogEctopic, S.nhsEctopic].map((s) => (
                <li key={s.url} className="rounded-lg bg-ink-50 px-3 py-1.5">
                  {s.publisher}
                </li>
              ))}
            </ul>
            <Link to="/sources" className="mt-5 inline-block text-sm font-bold text-brand-700 hover:text-brand-800">
              قائمة المصادر الكاملة ←
            </Link>
          </div>
        </div>
      </section>

      {/* DOCTOR */}
      <section aria-labelledby="doctor-heading" className="border-y border-ink-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 lg:grid-cols-[0.4fr_0.6fr]">
          <div className="rounded-3xl border border-brand-200 bg-gradient-to-b from-brand-50 to-white p-8 text-center">
            <div
              aria-hidden="true"
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-700 text-3xl font-extrabold text-white"
            >
              هـ
            </div>
            <p className="mt-4 text-lg font-extrabold text-ink-900">{DOCTOR.name}</p>
            <p className="text-sm text-ink-600">{DOCTOR.profession}</p>
            <a
              href={DOCTOR.phoneLink}
              className="mt-4 block arabic-numbers rounded-lg bg-brand-700 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
            >
              {DOCTOR.phoneDisplay}
            </a>
          </div>
          <div>
            <h2 id="doctor-heading" className="text-2xl font-extrabold text-ink-900">
              التواصل مع د. هيثم
            </h2>
            <p className="mt-4 text-base leading-loose text-ink-600">
              يتيح الموقع التواصل المباشر مع {DOCTOR.name}، {DOCTOR.profession}، لطرح الأسئلة الطبية المتعلقة بصحة المرأة
              والحمل. التواصل مخصص للتقييم والتوجيه الطبي فقط، ولا يتعلق ببيع الأدوية أو الحصول عليها.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/doctor"
                className="rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-bold text-ink-800 hover:bg-ink-50"
              >
                صفحة الطبيب
              </Link>
              <Link
                to="/contact"
                className="rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-bold text-ink-800 hover:bg-ink-50"
              >
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ConsultationCTA />

      <section className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h2 className="text-xl font-extrabold text-ink-900">عن {SITE.name}</h2>
        <p className="mt-3 text-sm leading-loose text-ink-600">
          {SITE.description} تعرّفي أكثر على{" "}
          <Link to="/about" className="font-bold text-brand-700 underline underline-offset-4">
            رسالة الموقع
          </Link>{" "}
          و
          <Link to="/medical-disclaimer" className="font-bold text-brand-700 underline underline-offset-4">
            إخلاء المسؤولية الطبية
          </Link>
          .
        </p>
      </section>
    </>
  );
}
