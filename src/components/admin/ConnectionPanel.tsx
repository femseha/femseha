import React, { useState } from 'react';
import {
  GithubConnection,
  GithubApiError,
  testConnection,
  saveConnection,
  clearConnection,
  DEFAULT_OWNER,
  DEFAULT_REPO,
} from '../../lib/github-publish';
import { Field, TextInput } from './fields';

/**
 * ربط النشر — لوحة الإدارة.
 *
 * الموقع ثابت (بلا خادم خلفي)، لذا يتم النشر المباشر عبر مستودع GitHub نفسه:
 * المالك يدخل توكن الوصول الشخصي مرة واحدة ويُحفظ في متصفح المالك فقط
 * (localStorage). التوكن لا يُوضع في أي ملف كود ولا يصل لأي جهة غير
 * api.github.com. مفتاح Gemini (GEMINI_API_KEY) لا يمر بالمتصفح إطلاقاً —
 * التوليد يتم داخل GitHub Secrets/Actions كما في خط النشر الآلي الحالي.
 */
export default function ConnectionPanel({
  connection,
  knownLogin,
  onConnected,
  onDisconnected,
}: {
  connection: GithubConnection | null;
  /** اسم الحساب المحقق مسبقاً (عند تحميل اتصال محفوظ) */
  knownLogin?: string | null;
  onConnected: (conn: GithubConnection, login: string) => void;
  onDisconnected: () => void;
}) {
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState(DEFAULT_OWNER);
  const [repo, setRepo] = useState(DEFAULT_REPO);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [login, setLogin] = useState<string | null>(null);

  const connect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const conn: GithubConnection = { token: token.trim(), owner: owner.trim(), repo: repo.trim() };
    if (!conn.token) {
      setError('أدخل توكن الوصول الشخصي (PAT).');
      return;
    }
    setBusy(true);
    try {
      const info = await testConnection(conn);
      saveConnection(conn);
      setLogin(info.login);
      onConnected(conn, info.login);
    } catch (err) {
      setError(err instanceof GithubApiError ? err.message : 'تعذر الاتصال — تحقق من الشبكة والتوكن.');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = () => {
    clearConnection();
    setToken('');
    setLogin(null);
    setError(null);
    onDisconnected();
  };

  if (connection) {
    return (
      <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-emerald-800 leading-relaxed">
          <span className="font-extrabold">✔ متصل بـ GitHub للنشر المباشر</span>
          <span className="text-emerald-700">
            {' '}— {login || knownLogin ? `الحساب: ${login || knownLogin} — ` : ''}
            <span dir="ltr">{connection.owner}/{connection.repo}</span>
            {' '}— التوكن محفوظ في هذا المتصفح فقط.
          </span>
        </div>
        <button
          type="button"
          onClick={disconnect}
          className="text-[11px] font-bold text-emerald-800 border border-emerald-300 rounded-xl px-3 py-1.5 hover:bg-emerald-100"
        >
          قطع الاتصال وحذف التوكن
        </button>
      </section>
    );
  }

  return (
    <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <h2 className="text-sm font-extrabold text-slate-900 mb-1">ربط النشر المباشر (مرة واحدة)</h2>
      <p className="text-[12px] text-slate-600 leading-relaxed mb-4">
        النشر يتم عبر مستودع GitHub وخط النشر الآلي القائم (GitHub Actions) — بنفس طريقة الحفظ
        الحالية في <code dir="ltr" className="bg-white border border-slate-200 rounded px-1 text-[11px]">src/data/articles.json</code>.
        يلزم توكن وصول شخصي (PAT — classic) بصلاحية <code dir="ltr" className="bg-white border border-slate-200 rounded px-1 text-[11px]">repo</code> كاملة،
        ويُحفظ في متصفحك أنت فقط (localStorage) ولا يُرسل إلا إلى <span dir="ltr">api.github.com</span>.
        <strong> مفتاح الذكاء الاصطناعي GEMINI_API_KEY لا يدخل المتصفح أبداً</strong> — التوليد يحدث داخل
        GitHub Actions حيث يوجد السر.
      </p>
      <form onSubmit={connect} className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] items-end">
        <Field label="توكن GitHub الشخصي" required>
          <TextInput
            type="password"
            dir="ltr"
            placeholder="ghp_..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
          />
        </Field>
        <Field label="المالك">
          <TextInput dir="ltr" value={owner} onChange={(e) => setOwner(e.target.value)} className="w-28 text-left" />
        </Field>
        <Field label="المستودع">
          <TextInput dir="ltr" value={repo} onChange={(e) => setRepo(e.target.value)} className="w-28 text-left" />
        </Field>
        <button
          type="submit"
          disabled={busy}
          className={`${busy ? 'opacity-60 cursor-wait' : 'hover:bg-blue-700'} bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition h-[42px]`}
        >
          {busy ? 'جارٍ الاختبار…' : 'ربط واختبار الاتصال'}
        </button>
      </form>
      {error ? (
        <div className="mt-3 text-[12px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
          {error}
        </div>
      ) : null}
      {!error ? (
        <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
          بدون ربط يمكنك تصفح قائمة المقالات المجمّعة مع الإصدار الحالي فقط؛ أزرار النشر تُفعّل بعد الربط.
        </p>
      ) : null}
    </section>
  );
}

