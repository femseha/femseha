/**
 * عميل النشر المباشر من لوحة الإدارة (/admin) — منصة فصيحة.
 *
 * المعمارية (ثابتة الموقع Static SPA — لا خادم خلفي):
 *   1) لوحة الإدارة تحفظ «طلب نشر» JSON في المستودع عبر GitHub REST API
 *      (المسار admin/requests/<id>.json) باستخدام توكن يدخله المالك نفسه
 *      ويُحفظ في متصفح المالك فقط (localStorage) — لا يُوضع أي سر في الكود.
 *   2) تُشغَّل بعد ذلك سير العمل القائم .github/workflows/auto-publish.yml
 *      عبر workflow_dispatch (كما هو، دون أي تعديل عليه).
 *   3) داخل GitHub Actions ينفذ scripts/generate-article.mjs →
 *      scripts/admin-publish.mjs الطلبات: توليد Gemini (المفتاح GEMINI_API_KEY
 *      يبقى في GitHub Secrets ولا يصل للمتصفح أبداً)، فحوصات الجودة والسلامة
 *      ومنع تنافس الكلمات، ثم الحفظ في src/data/articles.json + sitemap.xml
 *      والرفع إلى main — فينشر Vercel الموقع مباشرة.
 *
 * لا يوجد Review ولا Approval ولا Draft: الطلب يُنفَّذ وينشر آلياً في نفس
 * التشغيل، والنتيجة (نجاح/فشل مع السبب) تُقرأ من المستودع وتُعرض هنا.
 */
import { SITE } from "../data/site";
import type { ArticleRecord } from "../data/types";
import { newRequestId } from "./article-rules";

/* ── إعدادات الاتصال (تُحفظ في متصفح المالك فقط) ───────────────────────── */

const LS_TOKEN = "femseha-admin-github-token";
const LS_OWNER = "femseha-admin-github-owner";
const LS_REPO = "femseha-admin-github-repo";

export interface GithubConnection {
  token: string;
  owner: string;
  repo: string;
}

export const DEFAULT_OWNER = "femseha";
export const DEFAULT_REPO = "femseha";

export const WORKFLOW_FILE = "auto-publish.yml";
export const REQUESTS_DIR = "admin/requests";
export const ARTICLES_FILE = "src/data/articles.json";
export const UPLOADS_DIR = "public/images/uploads";
const MAIN_BRANCH = "main";

export function loadConnection(): GithubConnection | null {
  if (typeof window === "undefined") return null;
  try {
    const token = window.localStorage.getItem(LS_TOKEN);
    if (!token) return null;
    return {
      token,
      owner: window.localStorage.getItem(LS_OWNER) || DEFAULT_OWNER,
      repo: window.localStorage.getItem(LS_REPO) || DEFAULT_REPO,
    };
  } catch {
    return null;
  }
}

export function saveConnection(conn: GithubConnection): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_TOKEN, conn.token);
  window.localStorage.setItem(LS_OWNER, conn.owner);
  window.localStorage.setItem(LS_REPO, conn.repo);
}

export function clearConnection(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LS_TOKEN);
  window.localStorage.removeItem(LS_OWNER);
  window.localStorage.removeItem(LS_REPO);
}

/* ── نداءات GitHub REST ─────────────────────────────────────────────────── */

export class GithubApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function gh<T = unknown>(conn: GithubConnection, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${conn.token}`,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { message?: string };
      detail = body?.message || "";
    } catch {
      /* استجابة غير JSON */
    }
    const hint =
      res.status === 401
        ? "التوكن غير صالح أو منتهي الصلاحية."
        : res.status === 403
          ? "التوكن يفتقر للصلاحية المطلوبة (يلزم توكن شخصي classic بصلاحية repo كاملة)."
          : res.status === 404
            ? "المستودع أو المسار غير موجود — تأكد من اسم المالك والمستودع ومن صلاحية التوكن."
            : detail;
    throw new GithubApiError(res.status, hint || `GitHub API HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function b64ToUtf8(b64: string): string {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function utf8ToB64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function describeError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return String(error || "سبب غير معروف");
}

function assertTextualFieldsMatch(original: unknown, candidate: unknown, fieldPath = "request"): void {
  if (typeof original === "string") {
    if (candidate !== original) {
      throw new Error(`تغيّر النص في ${fieldPath} بعد تحويل JSON حرفياً.`);
    }
    return;
  }

  if (Array.isArray(original)) {
    if (!Array.isArray(candidate)) {
      throw new Error(`البنية في ${fieldPath} تغيّرت بعد تحويل JSON.`);
    }
    if (candidate.length !== original.length) {
      throw new Error(`عدد العناصر في ${fieldPath} تغيّر بعد تحويل JSON.`);
    }
    original.forEach((item, index) => assertTextualFieldsMatch(item, candidate[index], `${fieldPath}[${index}]`));
    return;
  }

  if (original && typeof original === "object") {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new Error(`البنية في ${fieldPath} تغيّرت بعد تحويل JSON.`);
    }
    const originalEntries = Object.entries(original as Record<string, unknown>);
    const candidateRecord = candidate as Record<string, unknown>;
    if (Object.keys(candidateRecord).length !== originalEntries.length) {
      throw new Error(`عدد الحقول في ${fieldPath} تغيّر بعد تحويل JSON.`);
    }
    for (const [key, value] of originalEntries) {
      assertTextualFieldsMatch(value, candidateRecord[key], `${fieldPath}.${key}`);
    }
  }
}

function parseRequestJsonText(text: string, label: string): PublishRequest {
  try {
    return JSON.parse(text) as PublishRequest;
  } catch (error) {
    throw new Error(`تعذر قراءة ${label}: ${describeError(error)}`);
  }
}

function encodeRequestContent(req: PublishRequest): string {
  const jsonText = JSON.stringify(req, null, 2);
  const directParsed = parseRequestJsonText(jsonText, `JSON الطلب ${req.id} بعد JSON.stringify`);
  assertTextualFieldsMatch(req, directParsed, `request(${req.id})`);

  const base64 = utf8ToB64(jsonText);
  const decodedText = b64ToUtf8(base64);
  if (decodedText !== jsonText) {
    throw new Error(`تغيّر نص JSON للطلب ${req.id} بعد UTF-8/base64.`);
  }

  const decodedParsed = parseRequestJsonText(decodedText, `JSON الطلب ${req.id} بعد فك base64`);
  assertTextualFieldsMatch(req, decodedParsed, `request(${req.id})`);
  return base64;
}

function corruptedStoredRequest(pathName: string, fileName: string, sha: string, reason: string): StoredRequest {
  return {
    path: pathName,
    fileName,
    sha,
    data: {
      id: `corrupt-${fileName.replace(/[^a-z0-9.-]+/gi, "-")}`,
      mode: "manual",
      createdAt: "",
      title: `ملف طلب تالف: ${fileName}`,
      primaryKeyword: "",
      secondaryKeywords: [],
      country: null,
      category: "",
      image: null,
      status: "failed",
      error: `تعذر قراءة ${fileName}: ${reason}`,
    },
  };
}

/* ── اختبار الاتصال ─────────────────────────────────────────────────────── */

export async function testConnection(conn: GithubConnection): Promise<{ login: string; defaultBranch: string }> {
  const user = await gh<{ login: string }>(conn, "/user");
  const repo = await gh<{ default_branch: string; permissions?: { push?: boolean } }>(
    conn,
    `/repos/${conn.owner}/${conn.repo}`
  );
  if (repo.permissions && repo.permissions.push === false) {
    throw new GithubApiError(403, "التوكن لا يملك صلاحية كتابة على هذا المستودع (push).");
  }
  return { login: user.login, defaultBranch: repo.default_branch };
}

/* ── بيانات المستودع الحية ──────────────────────────────────────────────── */

interface ContentResponse {
  content?: string;
  encoding?: string;
  sha: string;
  name?: string;
  path?: string;
  type?: string;
}

/** أحدث نسخة من articles.json من المستودع (أدق من نسخة البناء المجمّدة) */
export async function fetchLatestArticles(conn: GithubConnection): Promise<ArticleRecord[]> {
  const res = await gh<ContentResponse>(conn, `/repos/${conn.owner}/${conn.repo}/contents/${ARTICLES_FILE}?ref=${MAIN_BRANCH}`);
  if (!res.content) throw new GithubApiError(500, "استجابة غير متوقعة عند قراءة articles.json");
  return JSON.parse(b64ToUtf8(res.content)) as ArticleRecord[];
}

/* ── طلبات النشر (admin/requests) ───────────────────────────────────────── */

export interface PublishRequest {
  id: string;
  mode: "ai" | "manual";
  createdAt: string;
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  country: string | null;
  category: string;
  image: string | null;
  /** AI: slug اختياري (يُنشأ تلقائياً عند غيابه) | Manual: إلزامي للمقال الجديد */
  slug?: string | null;
  /** وضع التعديل: slug المقال القائم (manual فقط) */
  editSlug?: string | null;
  /** تعليمات إضافية للتوليد (AI فقط) */
  instructions?: string;
  /** manual فقط */
  summary?: string;
  content?: string;
  /** يضيفها خط النشر عند الفشل — لا يلمسها المتصفح إلا للقراءة */
  status?: "failed";
  error?: string;
  failedAt?: string;
}

export interface StoredRequest {
  path: string;
  fileName: string;
  sha: string;
  data: PublishRequest;
}

export async function listRequests(conn: GithubConnection): Promise<StoredRequest[]> {
  let entries: ContentResponse[] = [];
  try {
    entries = await gh<ContentResponse[]>(
      conn,
      `/repos/${conn.owner}/${conn.repo}/contents/${REQUESTS_DIR}?ref=${MAIN_BRANCH}`
    );
  } catch (e) {
    if (e instanceof GithubApiError && e.status === 404) return [];
    throw e;
  }
  const out: StoredRequest[] = [];
  for (const entry of entries.filter((f) => f.type === "file" && (f.name || "").endsWith(".json"))) {
    const pathName = entry.path || `${REQUESTS_DIR}/${entry.name || "unknown.json"}`;
    const fileName = entry.name || pathName.split("/").pop() || "unknown.json";
    let full: ContentResponse;
    try {
      full = await gh<ContentResponse>(
        conn,
        `/repos/${conn.owner}/${conn.repo}/contents/${pathName}?ref=${MAIN_BRANCH}`
      );
    } catch (error) {
      if (error instanceof GithubApiError && (error.status === 401 || error.status === 403)) throw error;
      out.push(corruptedStoredRequest(pathName, fileName, entry.sha, describeError(error)));
      continue;
    }
    if (!full.content) {
      out.push(corruptedStoredRequest(pathName, fileName, full.sha || entry.sha, "محتوى الملف فارغ أو غير متاح من GitHub API."));
      continue;
    }
    try {
      out.push({
        path: pathName,
        fileName,
        sha: full.sha,
        data: parseRequestJsonText(b64ToUtf8(full.content), fileName),
      });
    } catch (error) {
      out.push(corruptedStoredRequest(pathName, fileName, full.sha, describeError(error)));
    }
  }
  return out.sort((a, b) => a.fileName.localeCompare(b.fileName));
}

export async function putRequestFile(conn: GithubConnection, req: PublishRequest): Promise<void> {
  await gh(conn, `/repos/${conn.owner}/${conn.repo}/contents/${REQUESTS_DIR}/${req.id}.json`, {
    method: "PUT",
    body: JSON.stringify({
      message: `chore(admin): طلب نشر مباشر ${req.mode === "ai" ? "بالذكاء الاصطناعي" : "يدوي"} — ${req.title.slice(0, 60)}`,
      content: encodeRequestContent(req),
      branch: MAIN_BRANCH,
    }),
  });
}

export async function deleteRequestFile(conn: GithubConnection, stored: StoredRequest): Promise<void> {
  await gh(conn, `/repos/${conn.owner}/${conn.repo}/contents/${stored.path}`, {
    method: "DELETE",
    body: JSON.stringify({
      message: `chore(admin): حذف طلب النشر ${stored.fileName}`,
      sha: stored.sha,
      branch: MAIN_BRANCH,
    }),
  });
}

/* ── تشغيل سير العمل القائم (workflow_dispatch) ─────────────────────────── */

export async function dispatchAutoPublish(conn: GithubConnection): Promise<void> {
  await gh(
    conn,
    `/repos/${conn.owner}/${conn.repo}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
    { method: "POST", body: JSON.stringify({ ref: MAIN_BRANCH }) }
  );
}

interface WorkflowRun {
  id: number;
  status: string;
  conclusion: string | null;
  created_at: string;
  event: string;
  html_url: string;
  run_number: number;
}

export function actionsUrl(conn: GithubConnection): string {
  return `https://github.com/${conn.owner}/${conn.repo}/actions/workflows/${WORKFLOW_FILE}`;
}

async function waitForRun(
  conn: GithubConnection,
  sinceIso: string,
  onTick: (info: { elapsedSec: number; runUrl?: string; status?: string }) => void,
  timeoutMs = 15 * 60 * 1000,
  intervalMs = 8000
): Promise<WorkflowRun | null> {
  const started = Date.now();
  const sinceMs = new Date(sinceIso).getTime() - 60_000;
  for (;;) {
    const res = await gh<{ workflow_runs: WorkflowRun[] }>(
      conn,
      `/repos/${conn.owner}/${conn.repo}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=10`
    );
    const run =
      res.workflow_runs.find(
        (r) => r.event === "workflow_dispatch" && new Date(r.created_at).getTime() >= sinceMs
      ) || null;
    const elapsedSec = Math.round((Date.now() - started) / 1000);
    onTick({ elapsedSec, runUrl: run?.html_url, status: run?.status });
    if (run && run.status === "completed") return run;
    if (Date.now() - started > timeoutMs) return run; // قد يعود بتشغيل غير مكتمل عند انتهاء المهلة
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/* ── رفع صورة المقال (اختياري) ──────────────────────────────────────────── */

const MAX_UPLOAD_BYTES = 950_000; // حد GitHub Contents API (1MB) مع هامش أمان

/**
 * اسم ملف آمن وفريد للرفع: لا يعتمد على اسم الملف الأصلي وحده.
 * يزيل المسافات والأحرف الخاصة ومنعات المسارات (path traversal) ويحصر الاسم في
 * [a-z0-9-] مع لاحقة زمنية + عشوائية تضمن التفرد.
 */
export function safeUploadName(hint: string, ext = "jpg"): string {
  const base = String(hint || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  const safeBase = base.length >= 3 ? base : "image";
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const safeExt = String(ext || "jpg").replace(/[^a-z0-9]/g, "") || "jpg";
  return `${safeBase}-${stamp}${rand}.${safeExt}`;
}

/** المسار العام للصور المرفوعة على الموقع (public/ تُخدم من جذر النطاق) */
export const PUBLIC_UPLOADS_BASE = UPLOADS_DIR.replace(/^public\//, "");

/**
 * الرابط النهائي الفعلي لصورة مرفوعة — يُحفظ في بيانات المقال.
 * ⚠ سابقًا كان يُبنى بـ /public/ داخل المسار فكان يعطي 404 في الإنتاج.
 */
export function uploadedImageUrl(name: string): string {
  const safeName = String(name || "").split("/").pop() || "";
  if (!safeName) throw new Error("اسم ملف الصورة غير صالح.");
  return `${SITE.url}/${PUBLIC_UPLOADS_BASE}/${safeName}`;
}

/** ضغط الصورة في المتصفح إلى JPEG بعرض أقصى 1600px وأقل من ~950KB */
async function compressImage(file: File): Promise<{ blob: Blob; ext: "jpg" }> {
  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1, 1600 / Math.max(1, bitmap.width));
  let quality = 0.82;
  let lastBlob: Blob | null = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("تعذر معالجة الصورة في هذا المتصفح — استخدم رابط صورة جاهز.");
    ctx.drawImage(bitmap, 0, 0, w, h);
    lastBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (lastBlob && lastBlob.size <= MAX_UPLOAD_BYTES) return { blob: lastBlob, ext: "jpg" };
    if (quality > 0.55) quality -= 0.12;
    else scale *= 0.78;
  }
  throw new Error(
    `تعذر ضغط الصورة إلى أقل من ~1 ميغابايت (النتيجة ${(lastBlob?.size || 0) / 1024 / 1024} ميغابايت) — استخدم صورة أصغر أو رابط صورة خارجي.`
  );
}

interface UploadContentsResponse {
  content?: { path?: string; sha?: string };
  commit?: { sha?: string };
}

/**
 * التحقق الفعلي بعد الرفع: الملف موجود على main عبر Contents API، ثم فحص
 * إمكانية الوصول العام (HTTP 200 عبر raw.githubusercontent.com).
 * أي فشل يرمي خطأً بالسبب الحقيقي → تُوقف عملية النشر بالكامل (لا نجاح زائف).
 */
async function verifyUploadedPublicUrl(conn: GithubConnection, name: string): Promise<void> {
  const repoPath = `${UPLOADS_DIR}/${name}`;
  const stored = await gh<UploadContentsResponse>(
    conn,
    `/repos/${conn.owner}/${conn.repo}/contents/${repoPath}?ref=${MAIN_BRANCH}`
  );
  if (!stored?.content?.sha) {
    throw new Error(`تحقق ما بعد الرفع فشل: الملف ${repoPath} غير موجود على فرع ${MAIN_BRANCH}.`);
  }
  const rawUrl = `https://raw.githubusercontent.com/${conn.owner}/${conn.repo}/${MAIN_BRANCH}/${repoPath}`;
  let headRes: Response;
  try {
    headRes = await fetch(rawUrl, { method: "HEAD" });
  } catch (e) {
    throw new Error(`تحقق ما بعد الرفع فشل: تعذر الوصول إلى ${rawUrl} — ${describeError(e)}`);
  }
  if (!headRes.ok) {
    throw new Error(
      `تحقق ما بعد الرفع فشل: الرابط العام للصورة أعاد HTTP ${headRes.status} بدلاً من 200 (${rawUrl}).`
    );
  }
  const type = headRes.headers.get("content-type") || "";
  if (type && !/^image\//i.test(type)) {
    throw new Error(`تحقق ما بعد الرفع فشل: الرابط العام لا يعيد صورة (content-type: ${type}).`);
  }
}

/** رفع صورة إلى public/images/uploads/ وإرجاع رابطها العام النهائي (بلا /public/) */
export async function uploadArticleImage(conn: GithubConnection, file: File, slugHint: string): Promise<string> {
  const { blob } = await compressImage(file);
  const name = safeUploadName(slugHint);
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (const b of buffer) binary += String.fromCharCode(b);
  const putRes = await gh<UploadContentsResponse>(
    conn,
    `/repos/${conn.owner}/${conn.repo}/contents/${UPLOADS_DIR}/${name}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: `chore(admin): رفع صورة مقال ${name}`,
        content: btoa(binary),
        branch: MAIN_BRANCH,
      }),
    }
  );
  if (!putRes?.commit?.sha) {
    throw new Error(`فشل رفع الصورة: GitHub لم يؤكد commit الرفع للملف ${UPLOADS_DIR}/${name}.`);
  }
  // persistence حرفيًا: نتحقق أن الملف محفوظ فعلًا وأن رابطه العام reachable قبل متابعة النشر.
  await verifyUploadedPublicUrl(conn, name);
  return uploadedImageUrl(name);
}

/* ── تنسيق النشر المباشر (طلب → تشغيل → نتيجة) ─────────────────────────── */

export type PublishStep =
  | "compress-image"
  | "upload-image"
  | "put-request"
  | "dispatch"
  | "running"
  | "success"
  | "failed";

export interface PublishPhase {
  step: PublishStep;
  message: string;
  runUrl?: string;
  articleUrl?: string;
  elapsedSec?: number;
}

export interface PublishOutcome {
  ok: boolean;
  message: string;
  articleUrl?: string;
  runUrl?: string;
}

const STEP_MESSAGES: Record<PublishStep, string> = {
  "compress-image": "جارٍ ضغط الصورة…",
  "upload-image": "جارٍ رفع صورة المقال إلى المستودع…",
  "put-request": "جارٍ حفظ طلب النشر في المستودع…",
  dispatch: "جارٍ تشغيل خط النشر (GitHub Actions)…",
  running: "جارٍ التوليد والفحص والنشر المباشر داخل GitHub Actions…",
  success: "تم النشر مباشرة ✔",
  failed: "فشل النشر ✖",
};

/** رابط المقال المنشور على الموقع */
export function articleUrl(slug: string): string {
  return `${SITE.url}/articles/${slug}`;
}

/** البحث عن المقال المنشور بعد نجاح التشغيل (يُستخدم عندما يولّد الخادم الـ slug
 *  أو يوحّده بإضافة لاحقة عند التعارض — الكلمة المفتاحية فريدة بين المقالات
 *  بحكم فحص منع التنافس، فمطابقتها مع تاريخ اليوم كافية وآمنة). */
async function findPublishedSlug(
  conn: GithubConnection,
  req: PublishRequest
): Promise<string | null> {
  try {
    const fresh = await fetchLatestArticles(conn);
    const todayUtc = new Date().toISOString().split("T")[0];
    const isToday = (a: ArticleRecord) => a.publishDate === todayUtc || a.modifiedDate === todayUtc;
    const match =
      fresh.find((a) => a.primaryKeyword === req.primaryKeyword && isToday(a) && req.slug && a.slug === req.slug) ||
      fresh.find((a) => a.primaryKeyword === req.primaryKeyword && isToday(a));
    return match?.slug || null;
  } catch {
    return null;
  }
}

/**
 * النشر المباشر الكامل لطلب واحد:
 * صورة (اختياري) → حفظ الطلب → تشغيل السير → انتظار النتيجة → رابط المقال.
 * لا يمر المقال بأي مرحلة مراجعة أو موافقة — يُنشر فور اجتياز فحوصات الخط.
 */
export async function publishRequest(
  conn: GithubConnection,
  draft: Omit<PublishRequest, "id" | "createdAt">,
  imageFile: File | null,
  onPhase: (phase: PublishPhase) => void
): Promise<PublishOutcome> {
  const emit = (step: PublishStep, extra?: Partial<PublishPhase>) =>
    onPhase({ step, message: STEP_MESSAGES[step], ...extra });

  const req: PublishRequest = {
    ...draft,
    id: newRequestId(),
    createdAt: new Date().toISOString(),
  } as PublishRequest;

  const sinceIso = new Date().toISOString();

  if (imageFile) {
    emit("compress-image");
    emit("upload-image");
    req.image = await uploadArticleImage(conn, imageFile, req.slug || "");
  }

  emit("put-request");
  await putRequestFile(conn, req);

  emit("dispatch");
  await dispatchAutoPublish(conn);

  emit("running");
  const run = await waitForRun(conn, sinceIso, (info) =>
    emit("running", { elapsedSec: info.elapsedSec, runUrl: info.runUrl })
  );

  const runUrl = run?.html_url || actionsUrl(conn);

  if (!run) {
    return {
      ok: false,
      runUrl,
      message:
        "انتهت مهلة انتظار التشغيل. الطلب محفوظ في المستودع وسيُنفَّذ وينشر تلقائياً في أقرب تشغيل لخط النشر.",
    };
  }

  // النتيجة الحاسمة تُقرأ من ملف الطلب نفسه: حُذف = نُشر | معلَّم failed = فشل بسبب موثق
  let stored: StoredRequest | null = null;
  try {
    const all = await listRequests(conn);
    stored = all.find((r) => r.data.id === req.id) || null;
  } catch {
    stored = null;
  }

  if (!stored) {
    const slug = req.slug || (await findPublishedSlug(conn, req));
    if (slug) {
      return {
        ok: true,
        runUrl,
        articleUrl: articleUrl(slug),
        message:
          req.mode === "ai"
            ? "تم توليد المقال ونشره مباشرة ✔ سيظهر الرابط على الموقع فور اكتمال بناء Vercel (دقائق)."
            : "تم نشر المقال مباشرة ✔ سيظهر الرابط على الموقع فور اكتمال بناء Vercel (دقائق).",
      };
    }
    return {
      ok: true,
      runUrl,
      message:
        "اكتمل النشر بنجاح (حُذف الطلب من الطابور) لكن تعذر تحديد الـ slug النهائي — راجع قائمة المقالات بعد تحديثها.",
    };
  }

  if (stored.data.status === "failed") {
    return {
      ok: false,
      runUrl,
      message: `رفض خط النشر المقال (لم يُنشر): ${stored.data.error || "سبب غير معروف"}`,
    };
  }

  if (run.conclusion !== "success") {
    return {
      ok: false,
      runUrl,
      message:
        "فشل تشغيل خط النشر نفسه (قبل معالجة الطلب) — الطلب ما زال محفوظاً وسيُعاد تنفيذه تلقائياً في التشغيل التالي. راجع سجل التشغيل.",
    };
  }

  return {
    ok: false,
    runUrl,
    message: "اكتمل التشغيل لكن الطلب لم يُعالَج — راجع سجل التشغيل في GitHub Actions.",
  };
}

/** إعادة تشغيل خط النشر لطلب محفوظ سابقاً (معلّق أو فشل تشغيله) */
export async function rerunStoredRequest(
  conn: GithubConnection,
  stored: StoredRequest,
  onPhase: (phase: PublishPhase) => void
): Promise<PublishOutcome> {
  const emit = (step: PublishStep, extra?: Partial<PublishPhase>) =>
    onPhase({ step, message: STEP_MESSAGES[step], ...extra });
  const sinceIso = new Date().toISOString();
  emit("dispatch");
  await dispatchAutoPublish(conn);
  emit("running");
  const run = await waitForRun(conn, sinceIso, (info) =>
    emit("running", { elapsedSec: info.elapsedSec, runUrl: info.runUrl })
  );
  const runUrl = run?.html_url || actionsUrl(conn);
  const fresh = await listRequests(conn);
  const still = fresh.find((r) => r.data.id === stored.data.id) || null;
  if (!still) {
    const slug = stored.data.slug || (await findPublishedSlug(conn, stored.data));
    return {
      ok: true,
      runUrl,
      articleUrl: slug ? articleUrl(slug) : undefined,
      message: "تم تنفيذ الطلب ونشر المقال مباشرة ✔",
    };
  }
  if (still.data.status === "failed") {
    return { ok: false, runUrl, message: `رفض خط النشر المقال: ${still.data.error || "سبب غير معروف"}` };
  }
  return { ok: false, runUrl, message: "لم يُعالَج الطلب في هذا التشغيل — راجع سجل التشغيل." };
}
