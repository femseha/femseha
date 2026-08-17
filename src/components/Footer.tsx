import { Link } from "react-router-dom";
import { DOCTOR, FOOTER_LINKS, NAV, SITE } from "@/data/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-ink-50">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 md:pb-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-600">{SITE.tagline}</p>
            <p className="mt-4 text-xs leading-relaxed text-ink-500">
              محتوى تعليمي فقط. لا نبيع الأدوية ولا نعرض أسعارًا أو طرق شراء أو توصيل، ولا نقدم جرعات أو خططًا علاجية
              فردية.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-ink-900">الاستشارة الطبية</h2>
            <p className="mt-4 text-sm font-bold text-ink-800">{DOCTOR.name}</p>
            <p className="text-sm text-ink-600">{DOCTOR.profession}</p>
            <a
              href={DOCTOR.phoneLink}
              className="mt-3 inline-block arabic-numbers rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
            >
              {DOCTOR.phoneDisplay}
            </a>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-ink-900">روابط الموقع</h2>
            <ul className="mt-4 space-y-2">
              {NAV.slice(1, 9).map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="text-sm text-ink-600 hover:text-brand-700">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-ink-900">معلومات وشفافية</h2>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="text-sm text-ink-600 hover:text-brand-700">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-ink-200 pt-6">
          <p className="text-xs leading-relaxed text-ink-500">
            إخلاء مسؤولية: المعلومات المنشورة في «{SITE.name}» ذات طابع تثقيفي عام ولا تُغني عن استشارة مختص، ولا تُستخدم
            للتشخيص الذاتي أو العلاج. في الحالات الطارئة توجّهي فورًا إلى أقرب قسم طوارئ.
          </p>
          <p className="mt-4 text-center text-xs font-semibold text-ink-500">{SITE.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
