import { Link } from "react-router-dom";
import { useSeo } from "@/lib/seo";

export default function NotFound() {
  useSeo({
    title: "الصفحة غير موجودة | دليل صحة المرأة",
    description: "الصفحة المطلوبة غير موجودة. يمكنك العودة إلى الصفحة الرئيسية أو تصفح المقالات الطبية.",
    path: "/404",
    noindex: true,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-5xl font-extrabold text-brand-700">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-ink-900">الصفحة غير موجودة</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-600">
        قد يكون الرابط غير صحيح أو تم تغييره. يمكنك العودة إلى الصفحة الرئيسية أو تصفّح المقالات الطبية.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/" className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white hover:bg-brand-800">
          الصفحة الرئيسية
        </Link>
        <Link
          to="/articles"
          className="rounded-xl border border-ink-200 px-5 py-3 text-sm font-bold text-ink-800 hover:bg-ink-50"
        >
          المقالات الطبية
        </Link>
      </div>
    </div>
  );
}
