import type { PublishPhase } from '../../lib/github-publish';

/**
 * حالة عملية النشر المباشر الجارية/المنتهية.
 * النجاح يعرض رابط المقال المنشور. لا تظهر هنا أي حالة «مراجعة» أو
 * «بانتظار موافقة» — إما جارٍ التنفيذ الآلي أو منشور أو مرفوض بالفحوصات.
 */
export default function PublishStatus({
  phase,
  outcome,
  onDismiss,
}: {
  phase: PublishPhase | null;
  outcome: { ok: boolean; message: string; articleUrl?: string; runUrl?: string } | null;
  onDismiss: () => void;
}) {
  if (!phase && !outcome) return null;

  const done = Boolean(outcome);
  const failed = done && !outcome?.ok;
  const running = !done;

  const shell = failed
    ? 'bg-rose-50 border-rose-200'
    : done
      ? 'bg-emerald-50 border-emerald-200'
      : 'bg-sky-50 border-sky-200';

  return (
    <section className={`${shell} border rounded-2xl p-5`} role="status" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm leading-relaxed">
          {running ? (
            <>
              <span className="font-extrabold text-sky-800 flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-sky-600 border-t-transparent animate-spin" />
                {phase?.message}
              </span>
              <span className="block text-[11px] text-sky-700 mt-2 leading-relaxed">
                التوليد والفحص والحفظ تتم داخل GitHub Actions (مفتاح الذكاء الاصطناعي لا يغادر
                Secrets). تستغرق العملية عادة 2–5 دقائق.
                {phase?.elapsedSec ? ` الوقت المنقضي: ${phase.elapsedSec} ثانية.` : ''}
              </span>
            </>
          ) : failed ? (
            <>
              <span className="font-extrabold text-rose-800">فشل النشر ✖ — لم يُنشر أي مقال</span>
              <span className="block text-[12px] text-rose-700 mt-1.5 whitespace-pre-wrap">{outcome?.message}</span>
            </>
          ) : (
            <>
              <span className="font-extrabold text-emerald-800">تم النشر مباشرة ✔</span>
              <span className="block text-[12px] text-emerald-700 mt-1.5">{outcome?.message}</span>
            </>
          )}

          {outcome?.articleUrl ? (
            <a
              href={outcome.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl px-4 py-2.5"
              dir="ltr"
            >
              {outcome.articleUrl} ↗
            </a>
          ) : null}

          {outcome?.runUrl || phase?.runUrl ? (
            <a
              href={outcome?.runUrl || phase?.runUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
            >
              سجل التشغيل في GitHub Actions ↗
            </a>
          ) : null}
        </div>

        {done ? (
          <button
            type="button"
            onClick={onDismiss}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 shrink-0"
          >
            إغلاق
          </button>
        ) : null}
      </div>
    </section>
  );
}
