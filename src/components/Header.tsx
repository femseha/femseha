import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { NAV, DOCTOR } from "@/data/site";
import { Logo } from "./Logo";
import { PhoneButton } from "./ConsultationCTA";

const PRIMARY = NAV.slice(0, 6);

export function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="hidden bg-ink-900 text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <p>منصة تثقيف طبي — لا نبيع الأدوية ولا نقدم وصفات أو جرعات علاجية</p>
          <a href={DOCTOR.phoneLink} className="font-semibold hover:text-brand-300">
            استشارة طبية: <span className="arabic-numbers">{DOCTOR.phoneDisplay}</span>
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" aria-label="الانتقال إلى الصفحة الرئيسية">
          <Logo />
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 lg:flex">
          {PRIMARY.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "bg-brand-50 text-brand-800" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/articles"
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive ? "bg-brand-50 text-brand-800" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              }`
            }
          >
            المقالات الطبية
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <PhoneButton className="hidden md:inline-flex" label="استشارة" showNumber={false} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="main-menu"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2.5 text-sm font-semibold text-ink-700 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
            القائمة
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="main-menu"
            className="hidden rounded-lg border border-ink-200 px-3 py-2.5 text-sm font-semibold text-ink-700 lg:inline-flex"
          >
            كل الأقسام
          </button>
        </div>
      </div>

      {open && (
        <div id="main-menu" className="border-t border-ink-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <form role="search" onSubmit={submit} className="mb-4 flex gap-2">
              <label htmlFor="header-search" className="sr-only">
                البحث في الموقع
              </label>
              <input
                id="header-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحثي عن موضوع طبي..."
                className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-600"
              />
              <button type="submit" className="rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-bold text-white">
                بحث
              </button>
            </form>
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
              {NAV.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    end={item.href === "/"}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                        isActive ? "bg-brand-50 text-brand-800" : "text-ink-700 hover:bg-ink-50"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
