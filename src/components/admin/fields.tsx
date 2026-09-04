import React, { useEffect, useRef, useState } from 'react';
import { COUNTRIES, CATEGORIES } from '../../lib/article-rules';

/**
 * عناصر حقول مشتركة للوحة الإدارة (/admin) — تصميم بسيط ومتسق.
 * تستخدم حصراً داخل صفحات الإدارة (noindex) ولا تمس الموقع العام.
 */

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-slate-700 mb-1.5">
        {label}
        {required ? <span className="text-rose-600"> *</span> : (
          <span className="text-slate-400 font-semibold"> — اختياري</span>
        )}
      </span>
      {children}
      {hint ? <span className="block text-[11px] text-slate-400 mt-1 leading-relaxed">{hint}</span> : null}
    </label>
  );
}

export const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className || ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} leading-relaxed ${props.className || ''}`} />;
}

/** منتقي الدولة/السوق — الدول الست + خيار «عام» (قيمة فارغة) */
export function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} appearance-none cursor-pointer`}
    >
      <option value="">عام (بدون دولة محددة)</option>
      {COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.flag} {c.name}
        </option>
      ))}
    </select>
  );
}

/** منتقي التصنيف الطبي (مطابق لتصنيفات content-map.json) */
export function CategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} appearance-none cursor-pointer`}
    >
      {CATEGORIES.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

/**
 * حقل صورة المقال: رابط جاهز أو رفع ملف من الجهاز (يُضغط ويرفع للمستودع
 * عند النشر). معاينة محلية فقط قبل النشر — لا يرفع شيء تلقائياً.
 */
export function ImageField({
  imageUrl,
  onImageUrlChange,
  imageAlt,
  onImageAltChange,
  file,
  onFileChange,
}: {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  imageAlt: string;
  onImageAltChange: (alt: string) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const pickFile = (f: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
    onFileChange(f);
    if (f) onImageUrlChange('');
  };

  const previewSrc = preview || (imageUrl && !file ? imageUrl : null);

  return (
    <div className="space-y-2">
      <input
        type="url"
        dir="ltr"
        placeholder="https://example.com/image.jpg — أو ارفع ملفاً بالأسفل"
        value={imageUrl}
        onChange={(e) => {
          onImageUrlChange(e.target.value);
          if (e.target.value && file) pickFile(null);
        }}
        className={`${inputCls} text-left`}
      />
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] || null)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
        >
          رفع صورة من الجهاز
        </button>
        {file ? (
          <>
            <span className="text-[11px] text-slate-500 truncate max-w-[180px]">{file.name}</span>
            <button
              type="button"
              onClick={() => {
                pickFile(null);
                if (fileRef.current) fileRef.current.value = '';
              }}
              className="text-[11px] font-bold text-rose-600 hover:underline"
            >
              إزالة
            </button>
          </>
        ) : null}
      </div>
      {previewSrc ? (
        <img
          src={previewSrc}
          alt={imageAlt.trim() || "معاينة صورة المقال"}
          className="w-full max-h-40 object-cover rounded-xl border border-slate-200"
        />
      ) : null}
      <label className="block">
        <span className="block text-[11px] font-semibold text-slate-600 mb-1">
          النص البديل للصورة (ALT) — اختياري، ويُستخدم عنوان المقال تلقائياً عند تركه فارغاً
        </span>
        <input
          type="text"
          value={imageAlt}
          maxLength={180}
          onChange={(event) => onImageAltChange(event.target.value)}
          className={inputCls}
          placeholder="وصف موجز ودقيق للصورة"
        />
      </label>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        الصورة اختيارية. تُضغط تلقائياً (JPEG أعرض حد 1600px) وترفع إلى المستودع عند النشر.
        ملاحظة: بانر الرئيسية العام لا يُعرض كصورة مقال في صفحة المقال.
      </p>
    </div>
  );
}

/** قائمة أخطاء الفحص الفوري */
export function ErrorList({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
      <div className="text-xs font-extrabold text-rose-700 mb-2">
        لم يجتز المقال الفحوصات — لن يُرسل للنشر:
      </div>
      <ul className="space-y-1.5 text-[12px] text-rose-700 leading-relaxed list-disc pr-4">
        {errors.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
