import { PageHero } from "@/components/Content";
import { ConsultationCTA, PhoneButton } from "@/components/ConsultationCTA";
import { DOCTOR, SITE } from "@/data/site";
import { breadcrumbJsonLd, organizationJsonLd, useSeo } from "@/lib/seo";

const CRUMBS = [
  { name: "الرئيسية", href: "/" },
  { name: "تواصل معنا", href: "/contact" },
];

export default function Contact() {
  useSeo({
    title: "تواصل معنا | دليل صحة المرأة",
    description:
      "وسائل التواصل مع دليل صحة المرأة والاستشارة الطبية مع د. هيثم الخطيب، طبيب نساء وولادة. التواصل للتقييم والتوجيه الطبي فقط ولا يتعلق ببيع الأدوية.",
    path: "/contact",
    jsonLd: [
      breadcrumbJsonLd(CRUMBS),
      organizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "تواصل معنا",
        url: `${SITE.url}/contact`,
        inLanguage: "ar",
      },
    ],
  });

  return (
    <>
      <PageHero
        kicker="التواصل"
        h1="تواصل معنا"
        intro="يسعدنا استقبال ملاحظاتك على المحتوى الطبي، كما يمكنك التواصل مباشرة للاستشارة الطبية عبر الهاتف."
        crumbs={CRUMBS}
      />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 lg:grid-cols-3">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-7 lg:col-span-2">
          <h2 className="text-xl font-extrabold text-ink-900">تحتاجين إلى استشارة طبية؟</h2>
          <p className="mt-3 text-sm leading-loose text-ink-700">
            تحدثي مع {DOCTOR.name} — {DOCTOR.profession}. الاستشارة مخصصة للأسئلة الطبية والتوجيه نحو التقييم المناسب،
            ولا تتعلق ببيع الأدوية أو الحصول عليها.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <PhoneButton label="اتصلي الآن" showNumber={false} />
            <a href={DOCTOR.phoneLink} className="arabic-numbers text-lg font-extrabold text-brand-800">
              {DOCTOR.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-7">
          <h2 className="text-base font-extrabold text-ink-900">ملاحظات على المحتوى</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            إذا لاحظتِ معلومة تحتاج إلى تصحيح أو تحديث أو مصدرًا أدق، يسعدنا إبلاغنا عبر رقم التواصل نفسه. نراجع
            الملاحظات ونحدّث المحتوى عند الحاجة، ونوثّق تاريخ آخر تحديث في كل مقال.
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-7 lg:col-span-3">
          <h2 className="text-base font-extrabold text-rose-800">الحالات الطارئة</h2>
          <p className="mt-2 text-sm leading-relaxed text-rose-900">
            هذا الموقع لا يقدم خدمات طوارئ. عند حدوث نزف غزير أو ألم بطني شديد أو إغماء أو ألم في الكتف مع اختبار حمل
            إيجابي، توجّهي فورًا إلى أقرب قسم طوارئ أو اتصلي برقم الطوارئ المحلي.
          </p>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-7 lg:col-span-3">
          <h2 className="text-base font-extrabold text-ink-900">ما لا نقدمه</h2>
          <ul className="mt-3 grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
            {[
              "بيع الأدوية أو التوسط في الحصول عليها.",
              "أسعار أو طرق شراء أو توصيل.",
              "جرعات أو بروتوكولات علاجية فردية.",
              "تشخيص عن بُعد دون فحص أو تقييم طبي.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ConsultationCTA />
    </>
  );
}
