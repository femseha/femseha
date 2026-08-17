import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DOCTOR } from "@/data/site";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function MobileConsultBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 p-3 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] backdrop-blur md:hidden">
      <a
        href={DOCTOR.phoneLink}
        className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 py-3 text-sm font-extrabold text-white"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293a.75.75 0 0 1-.921.266 12.05 12.05 0 0 1-5.58-5.58.75.75 0 0 1 .266-.92l1.293-.97c.362-.272.527-.734.417-1.174L8.7 4.852A1.125 1.125 0 0 0 7.61 4H6.24A2.25 2.25 0 0 0 4 6.25v.5Z"
          />
        </svg>
        استشارة طبية مع {DOCTOR.name}
      </a>
    </div>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white"
      >
        تخطي إلى المحتوى
      </a>
      <Header />
      <main id="main" className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileConsultBar />
    </div>
  );
}
