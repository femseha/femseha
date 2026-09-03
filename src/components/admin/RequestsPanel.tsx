import type { StoredRequest } from '../../lib/github-publish';
import { countryLabel } from '../../lib/article-rules';

/**
 * طلبات النشر المحفوظة في المستودع (admin/requests) — عرض الحالة فقط.
 *
 * الطلب «المعلق» = أُرسل وسيُنفَّذ وينشر آلياً في تشغيل خط النشر (لا يحتاج أي
 * موافقة). الطلب «الفاشل» = رفضته الفحوصات الآلية مع السبب؛ يمكن حذفه وإعادة
 * الإرسال بقيم مصححة. لا يوجد هنا أي مفهوم مراجعة أو مسودة.
 */
export default function RequestsPanel({
  requests,
  busy,
  onRerun,
  onDelete,
  onRefresh,
}: {
  requests: StoredRequest[];
  busy: boolean;
  onRerun: (req: StoredRequest) => void;
  onDelete: (req: StoredRequest) => void;
  onRefresh: () => void;
}) {
  if (requests.length === 0) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-extrabold text-slate-900">طلبات النشر في المستودع</h2>
        <button
          type="button"
          onClick={onRefresh}
          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1"
        >
          تحديث
        </button>
      </div>
      <div className="space-y-3">
        {requests.map((r) => {
          const failed = r.data.status === 'failed';
          return (
            <div
              key={r.data.id}
              className={`border rounded-xl p-3.5 text-xs leading-relaxed ${
                failed ? 'border-rose-200 bg-rose-50' : 'border-sky-200 bg-sky-50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className={`font-extrabold ${failed ? 'text-rose-800' : 'text-sky-800'}`}>
                    {failed ? 'مرفوض بالفحوصات الآلية' : 'مُرسل — سيُنشر تلقائياً'}
                  </span>
                  <span className="text-slate-600">
                    {' '}— {r.data.mode === 'ai' ? 'توليد بالذكاء الاصطناعي' : 'مقال يدوي'}
                    {r.data.editSlug ? ` (تعديل /articles/${r.data.editSlug})` : ''} — «{r.data.title}»
                    {' '}— الكلمة: {r.data.primaryKeyword || '—'} — الدولة: {countryLabel(r.data.country)}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0" dir="ltr">
                  {failed ? null : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onRerun(r)}
                      className="text-[11px] font-bold text-sky-800 border border-sky-300 rounded-lg px-2.5 py-1 hover:bg-sky-100 disabled:opacity-50"
                    >
                      إعادة التشغيل الآن
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onDelete(r)}
                    className="text-[11px] font-bold text-rose-700 border border-rose-300 rounded-lg px-2.5 py-1 hover:bg-rose-100 disabled:opacity-50"
                  >
                    حذف الطلب
                  </button>
                </div>
              </div>
              {failed && r.data.error ? (
                <div className="mt-2 text-rose-700 whitespace-pre-wrap">السبب: {r.data.error}</div>
              ) : null}
              <div className="mt-1 text-[10px] text-slate-400" dir="ltr">{r.data.id}</div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
        الطلب المحذوف بعد الفشل لا يُلغي أي منشور (لم يُنشر شيء). الطلب المعلق يُنفَّذ في أول تشغيل
        لخط النشر (يدوي الآن أو مجدول) وينشر مباشرة عند اجتياز الفحوصات.
      </p>
    </section>
  );
}
