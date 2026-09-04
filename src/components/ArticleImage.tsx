import { useState } from 'react';
import { normalizeImageUrl } from '../lib/image-url';

/**
 * صورة المقال المنشور.
 *
 * قواعد ثابتة:
 *   - تستخدم الرابط النهائي الصحيح بعد توحيده (إصلاح بادئة public/ الخاطئة).
 *   - alt إلزامي: قيمة مخصصة آمنة أو عنوان المقال.
 *   - لا صورة = لا يُعرض شيء (لا صورة افتراضية مضللة).
 *   - فشل تحميل الصورة لا يُخفى: يظهر تنبيه واضح بالرابط الفاشل بدل صورة مكسورة صامتة.
 */
export default function ArticleImage({
  src,
  title,
  alt,
  className,
}: {
  src?: string | null;
  title: string;
  alt?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = normalizeImageUrl(src);

  if (!url) return null;

  if (failed) {
    return (
      <div
        role="alert"
        className="w-full mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-700"
      >
        <strong className="font-extrabold">تعذر تحميل صورة المقال.</strong>{' '}
        الرابط المحفوظ لا يعيد صورة صالحة:{' '}
        <span dir="ltr" className="break-all font-mono">
          {url}
        </span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={(alt || '').trim() || title}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className || 'w-full h-64 sm:h-80 object-cover rounded-2xl mb-8'}
    />
  );
}
