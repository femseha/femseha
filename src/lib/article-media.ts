import { SITE } from '../data/site';

/**
 * مسار التخزين داخل المستودع يختلف عمداً عن مسار الويب:
 * كل ما تحت public/ يُخدَّم من جذر الموقع في Vite/Vercel.
 */
export const ARTICLE_UPLOAD_REPO_DIR = 'public/images/uploads';
export const ARTICLE_UPLOAD_PUBLIC_DIR = '/images/uploads';

const SAFE_IMAGE_EXT_RE = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const UNSAFE_PATH_RE = /(^|[\\/])\.{1,2}(?=[\\/?#]|$)|%(?:2e|2f|5c)/i;
const CONTROL_CHAR_RE = /[\u0000-\u001f\u007f]/;

function imageUrlError(message: string): Error {
  return new Error(`رابط صورة المقال غير صالح: ${message}`);
}

/**
 * يحول رابط الصورة إلى URL نهائي قابل للوصول من production.
 * لا يقبل blob/data/file أو مسارات الجهاز، ويصحح روابط /public/ القديمة فقط.
 */
export function normalizeArticleImageUrl(value?: string | null): string | null {
  if (value == null) return null;
  const raw = value.trim();
  if (!raw) return null;

  if (CONTROL_CHAR_RE.test(raw)) throw imageUrlError('يحتوي محارف تحكم غير مسموحة.');
  if (raw.includes('\\') || UNSAFE_PATH_RE.test(raw)) {
    throw imageUrlError('المسار غير آمن أو يحتوي محاولة انتقال بين المجلدات.');
  }

  const siteUrl = new URL(SITE.url);
  const isRootRelative = raw.startsWith('/') && !raw.startsWith('//');
  let parsed: URL;
  try {
    parsed = isRootRelative ? new URL(raw, siteUrl) : new URL(raw);
  } catch {
    throw imageUrlError('استخدم رابط HTTPS أو مسار صورة يبدأ بـ /images/.');
  }

  if (parsed.protocol !== 'https:') {
    throw imageUrlError(`البروتوكول ${parsed.protocol || '(غير معروف)'} غير مسموح؛ المطلوب HTTPS.`);
  }
  if (parsed.username || parsed.password) {
    throw imageUrlError('بيانات الدخول داخل الرابط غير مسموحة.');
  }

  if (parsed.origin === siteUrl.origin) {
    // إصلاح دفاعي للروابط التي حُفظت سابقاً بمسار المستودع بدلاً من مسار الويب.
    if (parsed.pathname.startsWith('/public/')) {
      parsed.pathname = parsed.pathname.slice('/public'.length);
    }
    if (!parsed.pathname.startsWith('/') || !SAFE_IMAGE_EXT_RE.test(parsed.pathname)) {
      throw imageUrlError('صورة الموقع يجب أن تشير إلى ملف صورة منشور.');
    }
  }

  parsed.hash = '';
  return parsed.href;
}

/** رسالة تحقق مناسبة لنموذج الإدارة، أو null عند صلاحية الرابط. */
export function validateArticleImageUrl(value?: string | null): string | null {
  try {
    normalizeArticleImageUrl(value);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'رابط صورة المقال غير صالح.';
  }
}

/** ALT اختياري؛ عند غيابه تستخدم صفحة المقال عنوان المقال نفسه. */
export function normalizeArticleImageAlt(value?: string | null): string | null {
  if (value == null) return null;
  const normalized = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return null;
  if (normalized.length > 180) {
    throw new Error(`النص البديل للصورة أطول من 180 حرفاً (الحالي: ${normalized.length}).`);
  }
  return normalized;
}

/** جزء آمن فقط من slug؛ لا يُستخدم اسم الملف الأصلي إطلاقاً. */
export function safeArticleImageStem(slugHint: string): string {
  const safe = String(slugHint || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
  return safe || 'article-image';
}

function randomUploadId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  // توافق دفاعي مع متصفحات قديمة؛ الوقت يبقى جزءاً منفصلاً من الاسم أيضاً.
  return Math.random().toString(36).slice(2, 12).padEnd(10, '0');
}

/** اسم JPEG آمن وفريد، مستقل تماماً عن اسم الملف المحلي. */
export function createArticleImageFileName(
  slugHint: string,
  now = Date.now(),
  uniqueId = randomUploadId()
): string {
  const stem = safeArticleImageStem(slugHint);
  const entropy = String(uniqueId).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || randomUploadId();
  return `${stem}-${now.toString(36)}-${entropy}.jpg`;
}

export function articleImagePublicUrl(fileName: string): string {
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.jpg$/.test(fileName) || fileName.includes('..')) {
    throw new Error('تعذر إنشاء اسم آمن لصورة المقال.');
  }
  return new URL(`${ARTICLE_UPLOAD_PUBLIC_DIR}/${fileName}`, `${SITE.url}/`).href;
}
