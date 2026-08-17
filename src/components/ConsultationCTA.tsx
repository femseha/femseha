import { DOCTOR } from "@/data/site";

const PhoneIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293a.75.75 0 0 1-.921.266 12.05 12.05 0 0 1-5.58-5.58.75.75 0 0 1 .266-.92l1.293-.97c.362-.272.527-.734.417-1.174L8.7 4.852A1.125 1.125 0 0 0 7.61 4H6.24A2.25 2.25 0 0 0 4 6.25v.5Z"
    />
  </svg>
);

export function PhoneButton({
  className = "",
  label = "اتصلي الآن",
  showNumber = true,
}: {
  className?: string;
  label?: string;
  showNumber?: boolean;
}) {
  return (
    <a
      href={DOCTOR.phoneLink}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-800 ${className}`}
    >
      <PhoneIcon />
      <span>{label}</span>
      {showNumber && <span className="arabic-numbers text-xs font-semibold opacity-90">{DOCTOR.phoneDisplay}</span>}
    </a>
  );
}

type Variant = "full" | "compact";

export function ConsultationCTA({ variant = "full" }: { variant?: Variant }) {
  if (variant === "compact") {
    return (
      <aside className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
        <h2 className="text-lg font-extrabold text-ink-900">تحتاجين إلى استشارة طبية؟</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          تحدثي مع {DOCTOR.name} — {DOCTOR.profession}. الاستشارة للتقييم الطبي والتوجيه فقط، ولا تتعلق ببيع الأدوية أو
          الحصول عليها.
        </p>
        <PhoneButton className="mt-4 w-full" />
        <p className="mt-3 text-center arabic-numbers text-sm font-bold text-brand-800">{DOCTOR.phoneDisplay}</p>
      </aside>
    );
  }

  return (
    <section aria-labelledby="consultation-heading" className="bg-brand-800 py-14 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className="text-sm font-semibold text-brand-200">استشارة طبية</p>
        <h2 id="consultation-heading" className="mt-2 text-2xl font-extrabold sm:text-3xl">
          تحتاجين إلى استشارة طبية؟
        </h2>
        <p className="mt-3 text-base text-brand-100">
          تحدثي مع {DOCTOR.name} — {DOCTOR.profession}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={DOCTOR.phoneLink}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-extrabold text-brand-800 transition-colors hover:bg-brand-50"
          >
            <PhoneIcon />
            <span className="arabic-numbers">{DOCTOR.phoneDisplay}</span>
          </a>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-xs leading-relaxed text-brand-200">
          هذه الاستشارة للتقييم الطبي والتوجيه التثقيفي. لا يبيع الموقع الأدوية ولا يساعد في الحصول عليها، وفي الحالات
          الطارئة يجب التوجه مباشرة إلى أقرب قسم طوارئ.
        </p>
      </div>
    </section>
  );
}
