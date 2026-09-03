import { useMemo, useState } from 'react';
import type { ArticleRecord } from '../../data/types';
import { SITE } from '../../data/site';
import { countryLabel } from '../../lib/article-rules';

/**
 * قائمة المقالات — بسيطة حسب المطلوب:
 * العنوان | الكلمة المفتاحية | الدولة | التاريخ | تعديل | فتح المقال
 * مع بحث نصي بسيط (عنوان/كلمة/slug/دولة).
 */
export default function ArticlesTable({
  articles,
  onEdit,
}: {
  articles: ArticleRecord[];
  onEdit: (article: ArticleRecord) => void;
}) {
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...articles]
      .sort((a, b) => ((a.modifiedDate || a.publishDate) < (b.modifiedDate || b.publishDate) ? 1 : -1))
      .filter((a) => {
        if (!q) return true;
        return (
          a.title.toLowerCase().includes(q) ||
          (a.primaryKeyword || '').toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          countryLabel(a.country).toLowerCase().includes(q)
        );
      });
  }, [articles, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بسيط: عنوان، كلمة مفتاحية، دولة أو slug…"
          className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <span className="text-xs font-bold text-slate-500">
          {rows.length} من {articles.length} مقالاً
        </span>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-right px-4 py-3 font-bold">عنوان المقال</th>
              <th className="text-right px-4 py-3 font-bold">الكلمة المفتاحية</th>
              <th className="text-right px-4 py-3 font-bold">الدولة</th>
              <th className="text-right px-4 py-3 font-bold">التاريخ</th>
              <th className="text-right px-4 py-3 font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((a) => (
              <tr key={a.slug} className="hover:bg-slate-50 align-top">
                <td className="px-4 py-3 max-w-[280px]">
                  <div className="font-semibold text-slate-800 leading-snug">{a.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5" dir="ltr">/articles/{a.slug}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{a.primaryKeyword || '—'}</td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">{countryLabel(a.country)}</td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap" dir="ltr">
                  {a.publishDate}
                  {a.modifiedDate ? (
                    <span className="block text-[10px] text-sky-600 font-bold" dir="rtl">
                      حُدِّث {a.modifiedDate}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(a)}
                      className="text-[11px] font-bold text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1.5 hover:bg-slate-100"
                    >
                      تعديل
                    </button>
                    <a
                      href={`${SITE.url}/articles/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-700 border border-blue-200 rounded-lg px-2.5 py-1.5 hover:bg-blue-50"
                    >
                      فتح المقال
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400 bg-white">
                  لا توجد مقالات مطابقة للبحث.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        «فتح المقال» يفتح الرابط المنشور على الموقع. المقالات العامة (بلا دولة) تظهر تحت «عام».
      </p>
    </div>
  );
}
