import { Link } from "react-router-dom";
import { PageHero } from "@/components/Content";
import { ConsultationCTA, PhoneButton } from "@/components/ConsultationCTA";
import { DOCTOR } from "@/data/site";
import { breadcrumbJsonLd, doctorJsonLd, useSeo } from "@/lib/seo";

const CRUMBS = [
  { name: "الرئيسية", href: "/" },
  { name: "عن د. هيثم", href: "/doctor" },
];

export default function Doctor() {
  useSeo({
    title: "د. هيثم الخطيب — طبيب نساء وولادة | دليل صحة المرأة",
    description:
      "صفحة التعريف بـ د. هيثم الخطيب، طبيب نساء وولادة، والتواصل معه للاستشارة الطبية عبر الهاتف. الاستشارة للتقييم والتوجيه الطبي فقط ولا تتعلق ببيع الأدوية.",
    path: "/doctor",
    jsonLd: [breadcrumbJsonLd(CRUMBS), doctorJsonLd],
  });

  return (
    <>
      <PageHero
        kicker="الاستشارة الطبية"
        h1="د. هيثم الخطيب — طبيب نساء وولادة"
        intro="التواصل المباشر لطرح الأسئلة الطبية المتعلقة بصحة المرأة والحمل. التواصل مخصص للتقييم والتوجيه الطبي فقط."
        crumbs={CRUMBS}
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-brand-200 bg-gradient-to-b from-brand-50 to-white p-8 text-center">
          <div
            role="img"
            aria-label="صورة رمزية محايدة تمثل د. هيثم الخطيب، لم تُزوَّد صورة شخصية"
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-brand-700 text-4xl font-extrabold text-white"
          >
            هـ
          </div>
          <h2 className="mt-5 text-lg font-extrabold text-ink-900">{DOCTOR.name}</h2>
          <p className="text-sm text-ink-600">{DOCTOR.profession}</p>
          <PhoneButton className="mt-5 w-full" label="اتصال" showNumber={false} />
          <p className="mt-3 arabic-numbers text-sm font-bold text-brand-800">{DOCTOR.phoneDisplay}</p>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-500">
            لم تُنشر صورة شخصية لعدم توفر صورة معتمدة من الطبيب.
          </p>
        </div>

        <div className="prose-ar">
          <h2 className="mb-3 text-xl font-extrabold text-ink-900">معلومات موثّقة فقط</h2>
          <p>
            نلتزم في «دليل صحة المرأة» بعرض المعلومات الموثقة فقط. المعلومات المتاحة والمعتمدة لدينا عن الطبيب هي:
          </p>
          <ul className="my-4 space-y-2">
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              <span>
                <strong>الاسم:</strong> {DOCTOR.name}
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              <span>
                <strong>التخصص:</strong> {DOCTOR.profession}
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              <span>
                <strong>رقم التواصل:</strong> <span className="arabic-numbers">{DOCTOR.phoneDisplay}</span>
              </span>
            </li>
          </ul>
          <div className="my-6 rounded-xl border-r-4 border-brand-600 bg-brand-50 p-4 text-sm text-ink-700">
            لا ننشر أي بيانات غير موثقة مثل سنوات الخبرة أو الشهادات أو الجهات التي عمل بها الطبيب أو أي جوائز أو
            تقييمات. ستُضاف أي معلومة إضافية فقط عند اعتمادها رسميًا.
          </div>

          <h2 className="mb-3 mt-8 text-xl font-extrabold text-ink-900">نطاق الاستشارة</h2>
          <p>
            الاستشارة الهاتفية مخصصة للأسئلة الطبية المتعلقة بصحة المرأة والحمل والتوجيه نحو التقييم المناسب. لا تشمل
            الاستشارة بيع الأدوية أو المساعدة في الحصول عليها أو تقديم أسعار أو طرق شراء أو توصيل.
          </p>

          <h2 className="mb-3 mt-8 text-xl font-extrabold text-ink-900">قبل الاتصال</h2>
          <ol className="my-4 space-y-2">
            {[
              "جهّزي تاريخ آخر دورة شهرية.",
              "دوّني الأعراض ووقت بدايتها وتطورها.",
              "أحضري قائمة بالأدوية والمكملات التي تستخدمينها.",
              "احتفظي بنتائج التحاليل أو تقارير السونار إن وُجدت.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ol>

          <div className="my-6 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
            <strong className="block text-rose-800">في الحالات الطارئة</strong>
            النزف الغزير، الألم البطني الشديد، الإغماء أو ألم الكتف مع اختبار حمل إيجابي تستدعي التوجه فورًا إلى أقرب
            قسم طوارئ دون انتظار.
          </div>

          <p className="text-sm">
            للمزيد عن سياسة المحتوى راجعي{" "}
            <Link to="/medical-review" className="font-bold text-brand-700 underline underline-offset-4">
              المراجعة الطبية
            </Link>{" "}
            و
            <Link to="/medical-disclaimer" className="font-bold text-brand-700 underline underline-offset-4">
              إخلاء المسؤولية الطبية
            </Link>
            .
          </p>
        </div>
      </div>

      <ConsultationCTA />
    </>
  );
}
