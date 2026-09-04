import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { articles as bundledArticles } from '../data/articles';
import type { ArticleRecord } from '../data/types';
import { useSeo } from '../lib/seo';
import { AiDraft, ManualDraft } from '../lib/article-rules';
import {
  GithubConnection,
  GithubApiError,
  PublishPhase,
  PublishOutcome,
  StoredRequest,
  clearConnection,
  deleteRequestFile,
  fetchLatestArticles,
  listRequests,
  loadConnection,
  publishRequest,
  rerunStoredRequest,
  testConnection,
} from '../lib/github-publish';
import ConnectionPanel from '../components/admin/ConnectionPanel';
import AiPublishForm from '../components/admin/AiPublishForm';
import ManualPublishForm from '../components/admin/ManualPublishForm';
import ArticlesTable from '../components/admin/ArticlesTable';
import PublishStatus from '../components/admin/PublishStatus';
import RequestsPanel from '../components/admin/RequestsPanel';

/**
 * لوحة الإدارة — إنشاء ونشر المقالات مباشرة.
 *
 * القاعدة: إدخال البيانات → توليد المقال (AI) أو كتابته (يدوي) → نشر مباشر.
 * لا يوجد Review ولا Approval ولا Draft workflow — لا توجد أي مرحلة بين
 * إنشاء المقال والنشر.
 *
 * ملاحظة معمارية: الموقع تطبيق ثابت (Static SPA) بلا خادم خلفي، لذا تظل المصادقة
 * هنا حاجزاً تشغيلياً للواجهة فقط (كما هي دون تغيير)، ويتم النشر عبر البنية
 * القائمة نفسها: طلب النشر يُحفظ في المستودع ويُشغَّل سير العمل القائم
 * .github/workflows/auto-publish.yml (workflow_dispatch) فينفذ scripts/generate-article.mjs
 * → scripts/admin-publish.mjs التوليدَ والفحوصات والحفظ في src/data/articles.json
 * + public/sitemap.xml ثم الرفع إلى main — وينشر Vercel الموقع.
 * مفتاح GEMINI_API_KEY يبقى في GitHub Secrets ولا يصل للمتصفح أبداً.
 */
const ADMIN_PASSWORD = 'DrHaitham2026!';

type Tab = 'ai' | 'manual' | 'list';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useSeo({
    title: 'لوحة الإدارة | منصة فصيحة الطبية',
    description: 'لوحة إدارة المحتوى لمنصة فصيحة الطبية.',
    // مسار داخلي غير عام — لا يُفهرس ولا يُحمل بـ canonical يشير لصفحة عامة
    robots: 'noindex, nofollow',
    noCanonical: true
  });

  /* ── اتصال GitHub (توكن المالك — يُحفظ في متصفحه فقط) ── */
  const [conn, setConn] = useState<GithubConnection | null>(null);
  const [connLogin, setConnLogin] = useState<string | null>(null);
  const [connError, setConnError] = useState<string | null>(null);

  /* ── البيانات الحية من المستودع (أحدث من نسخة البناء) ── */
  const [freshArticles, setFreshArticles] = useState<ArticleRecord[] | null>(null);
  const [requests, setRequests] = useState<StoredRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  /* ── حالة النشر المباشر (عملية واحدة في كل مرة) ── */
  const [phase, setPhase] = useState<PublishPhase | null>(null);
  const [outcome, setOutcome] = useState<PublishOutcome | null>(null);
  const busy = Boolean(phase && !outcome);

  /* ── الواجهة ── */
  const [tab, setTab] = useState<Tab>('ai');
  const [editTarget, setEditTarget] = useState<ArticleRecord | null>(null);

  const articles = freshArticles ?? bundledArticles;

  const stats = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const a of articles) byCategory.set(a.categoryName, (byCategory.get(a.categoryName) || 0) + 1);
    const latest = [...articles].sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))[0];
    return { total: articles.length, byCategory: [...byCategory.entries()], latest };
  }, [articles]);

  /* تحميل الاتصال المحفوظ عند الدخول (بعد المصادقة فقط — لا يلمس SSR) */
  useEffect(() => {
    if (!isAuthenticated) return;
    const saved = loadConnection();
    if (saved) setConn(saved);
  }, [isAuthenticated]);

  const refreshAll = useCallback(
    async (c: GithubConnection) => {
      setRefreshing(true);
      try {
        const [fresh, reqs] = await Promise.all([fetchLatestArticles(c), listRequests(c)]);
        setFreshArticles(fresh);
        setRequests(reqs);
        setConnError(null);
      } catch (e) {
        setConnError(e instanceof Error ? e.message : 'تعذر تحديث البيانات من المستودع.');
      } finally {
        setRefreshing(false);
      }
    },
    []
  );

  /* التحقق من صلاحية الاتصال المحفوظ ثم جلب البيانات الحية */
  useEffect(() => {
    if (!isAuthenticated || !conn) return;
    let cancelled = false;
    (async () => {
      try {
        const info = await testConnection(conn);
        if (cancelled) return;
        setConnLogin(info.login);
        await refreshAll(conn);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof GithubApiError && (e.status === 401 || e.status === 403 || e.status === 404)) {
          clearConnection();
          setConn(null);
          setConnLogin(null);
          setConnError(`انتهى اتصال GitHub المحفوظ (${e.message}) — أعد الربط للتوكن.`);
        } else {
          setConnError(e instanceof Error ? e.message : 'تعذر الوصول إلى GitHub الآن.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, conn, refreshAll]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  const finishWith = (result: PublishOutcome) => {
    setOutcome(result);
    if (conn) void refreshAll(conn);
  };

  const doPublishAi = async (draft: AiDraft, slugHint: string | null, imageFile: File | null) => {
    if (!conn || busy) return;
    setOutcome(null);
    setPhase({ step: 'put-request', message: 'جارٍ بدء عملية النشر…' });
    try {
      const result = await publishRequest(
        conn,
        {
          mode: 'ai',
          title: draft.title,
          primaryKeyword: draft.primaryKeyword,
          secondaryKeywords: draft.secondaryKeywords,
          country: draft.country,
          category: draft.category,
          image: draft.image,
          slug: slugHint,
          instructions: draft.instructions,
        },
        imageFile,
        setPhase
      );
      finishWith(result);
    } catch (e) {
      finishWith({
        ok: false,
        message: e instanceof Error ? e.message : 'خطأ غير متوقع أثناء النشر.',
        runUrl: phase?.runUrl,
      });
    }
  };

  const doPublishManual = async (draft: ManualDraft, imageFile: File | null) => {
    if (!conn || busy) return;
    setOutcome(null);
    setPhase({ step: 'put-request', message: 'جارٍ بدء عملية النشر…' });
    try {
      const result = await publishRequest(
        conn,
        {
          mode: 'manual',
          title: draft.title,
          primaryKeyword: draft.primaryKeyword,
          secondaryKeywords: draft.secondaryKeywords,
          country: draft.country,
          category: draft.category,
          image: draft.image,
          slug: draft.editSlug ? null : draft.slug,
          editSlug: draft.editSlug || null,
          summary: draft.summary,
          content: draft.content,
        },
        imageFile,
        setPhase
      );
      finishWith(result);
      if (result.ok) {
        setEditTarget(null);
      }
    } catch (e) {
      finishWith({
        ok: false,
        message: e instanceof Error ? e.message : 'خطأ غير متوقع أثناء النشر.',
        runUrl: phase?.runUrl,
      });
    }
  };

  const doRerunRequest = async (stored: StoredRequest) => {
    if (!conn || busy) return;
    setOutcome(null);
    setPhase({ step: 'dispatch', message: 'جارٍ إعادة تشغيل خط النشر…' });
    try {
      finishWith(await rerunStoredRequest(conn, stored, setPhase));
    } catch (e) {
      finishWith({ ok: false, message: e instanceof Error ? e.message : 'خطأ غير متوقع.' });
    }
  };

  const doDeleteRequest = async (stored: StoredRequest) => {
    if (!conn || busy) return;
    try {
      await deleteRequestFile(conn, stored);
      await refreshAll(conn);
    } catch (e) {
      setConnError(e instanceof Error ? e.message : 'تعذر حذف الطلب.');
    }
  };

  const openEdit = (a: ArticleRecord) => {
    setEditTarget(a);
    setTab('manual');
    setOutcome(null);
    setPhase(null);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'ai', label: 'توليد مقال بالذكاء الاصطناعي' },
    { id: 'manual', label: 'إضافة مقال يدوي' },
    { id: 'list', label: 'قائمة المقالات' },
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
    <main className="max-w-4xl mx-auto px-6 py-16">
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
          <div className="space-y-6">
            {/* إحصائيات سريعة */}
            <section>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-blue-700">{stats.total}</div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">مقال منشور</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-slate-800">{stats.byCategory.length}</div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">تصنيف طبي</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <div className="text-base font-black text-slate-800 mt-1" dir="ltr">
                    {stats.latest?.publishDate || '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">آخر نشر</div>
                </div>
              </div>
            </section>

            {/* ربط النشر عبر GitHub */}
            {connError && !conn ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs font-bold text-rose-700">
                {connError}
              </div>
            ) : null}
            <ConnectionPanel
              connection={conn}
              knownLogin={connLogin}
              onConnected={(c, login) => {
                setConnError(null);
                setConnLogin(login);
                setConn(c);
              }}
              onDisconnected={() => {
                setConn(null);
                setConnLogin(null);
                setFreshArticles(null);
                setRequests([]);
              }}
            />
            {conn && connError ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-800">
                {connError} — تُعرض حالياً بيانات نسخة الموقع المبنية.
              </div>
            ) : null}

            {/* حالة النشر المباشر + الطلبات المحفوظة */}
            <PublishStatus
              phase={phase}
              outcome={outcome}
              onDismiss={() => {
                setPhase(null);
                setOutcome(null);
              }}
            />
            <RequestsPanel
              requests={requests}
              busy={busy}
              onRerun={doRerunRequest}
              onDelete={doDeleteRequest}
              onRefresh={() => conn && void refreshAll(conn)}
            />

            {/* الأقسام الثلاثة: AI | يدوي | القائمة */}
            <section>
              <div className="flex flex-wrap gap-2 mb-5">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition border ${
                      tab === t.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
                {refreshing ? (
                  <span className="self-center text-[11px] text-slate-400">جارٍ التحديث من المستودع…</span>
                ) : null}
              </div>

              {tab === 'ai' ? (
                <AiPublishForm articles={articles} busy={busy} connected={Boolean(conn)} onSubmit={doPublishAi} />
              ) : null}

              {tab === 'manual' ? (
                <ManualPublishForm
                  articles={articles}
                  busy={busy}
                  connected={Boolean(conn)}
                  editTarget={editTarget}
                  onCancelEdit={() => setEditTarget(null)}
                  onSubmit={doPublishManual}
                />
              ) : null}

              {tab === 'list' ? <ArticlesTable articles={articles} onEdit={openEdit} /> : null}
            </section>

            {/* كيف يعمل النشر — مختصر */}
            <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm leading-relaxed text-slate-600">
              <h2 className="text-sm font-extrabold text-slate-900 mb-2">النشر المباشر — كيف يعمل؟</h2>
              <p className="text-xs leading-relaxed">
                زر واحد في القسمين: <strong>AI</strong> (إدخال البيانات → توليد المقال → نشر مباشر) و
                <strong> يدوي</strong> (كتابة المقال → نشر مباشر). يُحفظ المقال بالطريقة الحالية نفسها في{' '}
                <code className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px]" dir="ltr">
                  src/data/articles.json
                </code>{' '}
                مع تحديث <code className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px]" dir="ltr">public/sitemap.xml</code>،
                وتُطبق قواعد SEO الحالية كاملة: slug فريد، canonical ذاتي، عنوان ووصف فريدان، H1 واحد،
                Article Schema، روابط داخلية، ومنع تنافس الكلمات المفتاحية (Cannibalization) — بالإضافة إلى
                فحوصات السلامة الطبية الإلزامية. التوليد يتم داخل GitHub Actions حيث يوجد{' '}
                <code className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px]" dir="ltr">GEMINI_API_KEY</code>{' '}
                في Secrets — ولا يصل أي مفتاح إلى المتصفح. ويستمر خط النشر الآلي المجدول من خطة المحتوى
                (3 مقالات يومياً) بالعمل كما هو دون تغيير.
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
    </div>
  );
}
