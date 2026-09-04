/**
 * أدوات روابط الصور — مصدر واحد لقواعد مسارات الصور على الموقع العام.
 *
 * ⚠ خطأ سابق كان يكسر صور المقالات بعد النشر:
 *   الملف يُرفع إلى المستودع في المسار `public/images/uploads/<name>`
 *   لكن Vercel/Vite يخدمان مجلد `public/` من جذر الموقع (أي `/images/uploads/<name>`)،
 *   فالرابط الذي كان يُحفظ `https://femseha.com/public/images/uploads/...` يعطي 404
 *   في الصفحة العامة (مع أن المعاينة داخل الإدارة تعمل لأنها object URL محلي).
 *
 * هذه الوحدة:
 *   1) تبني رابط الصورة العام الصحيح من مسار التخزين.
 *   2) تُصلح أي رابط قديم مكسور `/public/images/...` (دفاع في العمق).
 *   3) ترفض الروابط المؤقتة/الخطيرة (blob:، data:، مسارات نظام ملفات…).
 *
 * لا تعتمد على أي API خاص بالمتصفح أو Node — تعمل في المكانين.
 */
import { SITE } from "../data/site";

/** مسار تخزين الصور المرفوعة داخل المستودع (يحتوي بادئة public/ كما يراها git) */
export const UPLOADS_REPO_DIR = "public/images/uploads";
/** مسار الصور المرفوعة كما تُخدَم على الموقع العام (بلا بادئة public/) */
export const UPLOADS_PUBLIC_DIR = "/images/uploads";

/** الرابط العام النهائي لصورة مرفوعة اسم ملفها فقط (مثلاً image-abc123.jpg) */
export function uploadedImagePublicUrl(fileName: string): string {
  const safe = String(fileName || "")
    .split("/")
    .pop()!
    .replace(/[^a-z0-9._-]/gi, "");
  return `${SITE.url}${UPLOADS_PUBLIC_DIR}/${safe}`;
}

/**
 * تطبيع رابط صورة إلى شكل قابل للاستخدام في الصفحة العامة:
 *   - يزيل بادئة `/public/` الخاطئة من روابط قديمة (إصلاح 404 الصور المنشورة).
 *   - يمرّر الروابط المطلقة https/https السليمة.
 *   - يمرّر المسارات النسبية التي تبدأ بـ /images/.
 *   - يعيد null لأي رابط غير صالح للنشر (blob:/data:/file:/مسار محلي…).
 */
export function normalizePublicImageUrl(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  let s = value.trim();
  if (!s) return null;

  // ممنوع منعاً باتاً: روابط مؤقتة للمتصفح أو مسارات نظام ملفات — لا تُنشر أبداً.
  if (/^(blob|data|file|javascript):/i.test(s)) return null;

  // إصلاح الرابط القديم المكسور: …/public/images/… ← …/images/…
  s = s.replace(/^(https?:\/\/[^/]+)?\/public\/images\//i, "$1/images/");

  // مسار نسبي صالح على الموقع
  if (s.startsWith("/images/")) return s;
  // رابط مطلق سليم
  if (/^https?:\/\//i.test(s)) return s;

  return null;
}
