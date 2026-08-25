import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';
import { useSeo } from '../lib/seo';

/**
 * لوحة الإدارة — واجهة عرض وإدارة المقالات.
 * ملاحظة معمارية: الموقع تطبيق ثابت (Static SPA) بلا خادم خلفي، لذا تظل المصادقة
 * هنا حاجزاً تشغيلياً للواجهة فقط. توليد المقالات يتم عبر خط النشر الآلي
 * (.github/workflows/auto-publish.yml + scripts/generate-article.mjs).
 */
const ADMIN_PASSWORD = 'DrHaitham2026!';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useSeo({
    title: 'لوحة الإدارة | منصة فصيحة الطبية',
    description: 'لوحة إدارة المحتوى لمنصة فصيحة الطبية.'
  });

  const stats = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const a of articles) byCategory.set(a.categoryName, (byCategory.get(a.categoryName) || 0) + 1);
    const latest = [...articles].sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))[0];
    return { total: articles.length, byCategory: [...byCategory.entries()], latest };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-16" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 mb-2 text-center">لوحة الإدارة والتحكم</h1>
        <p className="text-sm text-slate-500 mb-6 text-center">إشراف د. هيثم الخطيب</p>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto">
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-sm"
            >
              تسجيل الدخول
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            {/* إحصائيات المحتوى */}
            <section>
              <h2 className="text-sm font-extrabold text-slate-900 mb-4">إحصائيات المحتوى</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                  <div className="text-3xl font-black text-blue-700">{stats.total}</div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">مقال منشور</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                  <div className="text-3xl font-black text-slate-800">{stats.byCategory.length}</div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">تصنيف طبي</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                  <div className="text-lg font-black text-slate-800 mt-1.5" dir="ltr">
                    {stats.latest?.publishDate || '—'}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">آخر نشر</div>
                </div>
              </div>
            </section>

            {/* إدارة المقالات */}
            <section>
              <h2 className="text-sm font-extrabold text-slate-900 mb-4">إدارة المقالات</h2>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="text-right px-4 py-3 font-bold">العنوان</th>
                      <th className="text-right px-4 py-3 font-bold hidden sm:table-cell">التصنيف</th>
                      <th className="text-right px-4 py-3 font-bold">التاريخ</th>
                      <th className="text-right px-4 py-3 font-bold hidden sm:table-cell">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...articles]
                      .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))
                      .map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <Link
                              to={`/articles/${a.slug}`}
                              className="font-semibold text-slate-800 hover:text-blue-700"
                            >
                              {a.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{a.categoryName}</td>
                          <td className="px-4 py-3 text-slate-500" dir="ltr">{a.publishDate}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                              منشور
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* حالة خط النشر الآلي */}
            <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm leading-relaxed text-slate-600">
              <h2 className="text-sm font-extrabold text-slate-900 mb-2">التوليد الذكي والنشر الآلي</h2>
              <p>
                يتم توليد المقالات الجديدة عبر خط النشر الآلي (GitHub Actions) من خطة المحتوى المعتمدة في{' '}
                <code className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs" dir="ltr">
                  src/data/content-map.json
                </code>
                ، ولا يُنشر أي مقال إلا بعد اجتياز فحوصات عدد الكلمات وتفرّد الموضوع والكلمة المفتاحية
                وقواعد السلامة الطبية. يعمل الخط بمعدل ثلاث مقالات يومياً.
              </p>
            </section>

            <div className="text-center">
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setPassword('');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
