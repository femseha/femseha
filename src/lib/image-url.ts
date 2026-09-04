/**
 * توحيد روابط صور المقالات — منصة فصيحة.
 *
 * سبب وجود هذه الوحدة (عطل مثبت): كانت لوحة الإدارة تحفظ رابط الصورة المرفوعة
 * بمسار المستودع `public/images/uploads/...` بينما Vite ينشر محتويات مجلد
 * `public/` على جذر الموقع، فالرابط الصحيح هو `/images/uploads/...`.
 * النتيجة كانت صورة مكسورة (404) في الصفحة العامة رغم نجاح الرفع.
 *
 * القواعد:
 *   - `/public/images/...`  → `/images/...` (نفس المعالجة للروابط المطلقة).
 *   - blob:/data:/file:/object URL → مرفوض (لا يُحفظ أبداً في بيانات المقال).
 *   - ما عدا ذلك يُترك كما هو (روابط https خارجية مسموحة).
 *
 * ⚠ نسخة الخادم من نفس المنطق في scripts/admin-publish.mjs (sanitizeImage).
 */

const FORBIDDEN_IMAGE_SCHEMES = /^(blob:|data:|file:|filesystem:|about:)/i;

/** رابط صورة مؤقت لا يصلح للحفظ (blob/object URL أو مسار محلي) */
export function isTemporaryImageUrl(value: string): boolean {
  const s = String(value || "").trim();
  if (!s) return false;
  if (FORBIDDEN_IMAGE_SCHEMES.test(s)) return true;
  // مسار ملف محلي: C:\... أو /home/... (لا يبدأ بـ /images أو / لمسار الموقع)
  if (/^[a-zA-Z]:[\\/]/.test(s)) return true;
  return false;
}

/** إصلاح المسار: إزالة بادئة public/ الخاطئة من مسار الصورة المنشورة */
export function normalizeImageUrl(value?: string | null): string | null {
  const s = String(value || "").trim();
  if (!s) return null;
  if (isTemporaryImageUrl(s)) return null;

  // رابط مطلق: نصحح مساره فقط دون تغيير النطاق
  if (/^https?:\/\//i.test(s)) {
    try {
      const url = new URL(s);
      url.pathname = url.pathname.replace(/^\/public\//, "/");
      return url.href;
    } catch {
      return null;
    }
  }

  // مسار نسبي
  const path = s.startsWith("/") ? s : `/${s}`;
  return path.replace(/^\/public\//, "/");
}

/** هل الرابط صالح للحفظ في بيانات المقال المنشور؟ (بعد التوحيد) */
export function isPublishableImageUrl(value?: string | null): boolean {
  const normalized = normalizeImageUrl(value);
  if (!normalized) return false;
  return /^https?:\/\//i.test(normalized) || normalized.startsWith("/images/");
}
