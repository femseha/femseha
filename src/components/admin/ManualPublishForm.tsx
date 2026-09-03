import React, { useEffect, useMemo, useState } from 'react';
import type { ArticleRecord } from '../../data/types';
import {
  ManualDraft,
  LIMITS,
  countryByCode,
  countWords,
  parseKeywordList,
  slugifyLatin,
  validateManualDraft,
} from '../../lib/article-rules';
import { Field, TextInput, TextArea, CountrySelect, CategorySelect, ImageField, ErrorList } from './fields';

/**
 * إضافة مقال يدوي — نشر مباشر (ويستخدم نفسه لوضع «تعديل» من قائمة المقالات).
 *
 * لا Draft ولا Review ولا Approval: عند الضغط على «نشر المقال» يُحفظ الطلب
 * في المستودع ويشغَّل خط النشر القائم، فتُطبق داخل GitHub Actions نفس فحوصات
 * الجودة والسلامة ومنع تنافس الكلمات الحالية، ثم يُحفظ المقال في
 * src/data/articles.json ويُحدَّث sitemap.xml ويُرفع = نشر فوري.
 *
 * في وضع التعديل: يُحفظ المقال نفسه (نفس الـ slug والروابط القائمة — الـ slug
 * مقفل حمايةً لـ SEO)، ويُسجَّل modifiedDate حقيقي بتاريخ التعديل.
 */
export default function ManualPublishForm({
  articles,
  busy,
  connected,
  editTarget,
  onCancelEdit,
  onSubmit,
}: {
  articles: ArticleRecord[];
  busy: boolean;
  connected: boolean;
  editTarget: ArticleRecord | null;
  onCancelEdit: () => void;
  onSubmit: (draft: ManualDraft, imageFile: File | null) => void;
}) {
  const [title, setTitle] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [extraKeywordsRaw, setExtraKeywordsRaw] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('clinical-guides');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const isEdit = Boolean(editTarget);

  // تحميل بيانات المقال عند الدخول في وضع التعديل / تفريغها عند الإلغاء
  useEffect(() => {
    if (editTarget) {
      setTitle(editTarget.title);
      setPrimaryKeyword(editTarget.primaryKeyword || '');
      setExtraKeywordsRaw((editTarget.secondaryKeywords || []).join('، '));
      setCountry(editTarget.country || '');
      setCategory(editTarget.category);
      setImageUrl(editTarget.image || '');
      setImageFile(null);
      setContent(editTarget.content || '');
      setSummary(editTarget.summary || '');
      setSlug(editTarget.slug);
      setSlugTouched(true);
      setErrors([]);
    } else {
      setTitle('');
      setPrimaryKeyword('');
      setExtraKeywordsRaw('');
      setCountry('');
      setCategory('clinical-guides');
      setImageUrl('');
      setImageFile(null);
      setContent('');
      setSummary('');
      setSlug('');
      setSlugTouched(false);
      setErrors([]);
    }
  }, [editTarget]);

  const words = useMemo(() => countWords(content), [content]);
  const countryInfo = countryByCode(country);

  const suggestSlug = () => {
    const s = slugifyLatin(`${primaryKeyword} ${title}`);
    setSlug(s);
    setSlugTouched(true);
    if (!s) {
      setErrors((prev) => [
        ...prev.filter((e) => !e.startsWith('لا يمكن اقتراح slug')),
        'لا يمكن اقتراح slug من نص عربي بالكامل — اكتبه يدوياً بأحرف لاتينية صغيرة (مثال: cytotec-oman-guide).',
      ]);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const draft: ManualDraft = {
      title: title.trim(),
      primaryKeyword: primaryKeyword.trim(),
      secondaryKeywords: parseKeywordList(extraKeywordsRaw),
      country: country || null,
      category,
      image: imageUrl.trim() || null,
      content,
      summary: summary.trim(),
      slug: slug.trim(),
      editSlug: editTarget ? editTarget.slug : null,
    };
    const found = validateManualDraft(draft, articles);
    setErrors(found);
    if (found.length > 0) return;
    onSubmit(draft, imageFile);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {isEdit ? (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-sky-800 leading-relaxed">
            <span className="font-extrabold">وضع التعديل:</span> «{editTarget?.title}» — يُنشر التعديل
            مباشرة على نفس الرابط <span dir="ltr">/articles/{editTarget?.slug}</span> مع تسجيل تاريخ
            تعديل حقيقي. الـ slug مقفل حفاظاً على الروابط وSEO القائم.
          </div>
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-[11px] font-bold text-sky-800 border border-sky-300 rounded-xl px-3 py-1.5 hover:bg-sky-100"
          >
            إلغاء التعديل (مقال جديد)
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="عنوان المقال"
            required
            hint={`يُعرض كـ H1 واحد في صفحة المقال. بين ${LIMITS.TITLE_MIN} و${LIMITS.TITLE_MAX} حرفاً — الحالي: ${title.trim().length}.`}
          >
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
        </div>

        <Field
          label="الكلمة المفتاحية الرئيسية"
          required
          hint={
            countryInfo
              ? `أمثلة ${countryInfo.name}: «أدوية إجهاض الحمل في ${countryInfo.name}»، «سايتوتك في ${countryInfo.name}».`
              : 'كلمة واحدة لكل مقال — يرفض النظام أي كلمة يتنافس عليها مقال منشور.'
          }
        >
          <TextInput value={primaryKeyword} onChange={(e) => setPrimaryKeyword(e.target.value)} />
        </Field>

        <Field label="كلمات مفتاحية إضافية" hint="افصل بينها بفاصلة — تُحفظ مع المقال لأغراض التحرير.">
          <TextInput
            value={extraKeywordsRaw}
            onChange={(e) => setExtraKeywordsRaw(e.target.value)}
            placeholder="مثال: ميزوبروستول، حبوب الإجهاض"
          />
        </Field>

        <Field label="الدولة" hint="اتركها «عام» للمقالات العامة.">
          <CountrySelect value={country} onChange={setCountry} />
        </Field>

        <Field label="التصنيف">
          <CategorySelect value={category} onChange={setCategory} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="صورة المقال">
            <ImageField
              imageUrl={imageUrl}
              onImageUrlChange={setImageUrl}
              file={imageFile}
              onFileChange={setImageFile}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="محتوى المقال"
            required
            hint={
              <>
                التنسيق المدعوم: <code dir="ltr" className="bg-white border border-slate-200 rounded px-1">### عنوان</code> و
                <code dir="ltr" className="bg-white border border-slate-200 rounded px-1 mx-1">#### عنوان فرعي</code> و
                <code dir="ltr" className="bg-white border border-slate-200 rounded px-1">* عنصر قائمة</code> و
                <code dir="ltr" className="bg-white border border-slate-200 rounded px-1 mx-1">**تأكيد**</code> وروابط داخلية
                <code dir="ltr" className="bg-white border border-slate-200 rounded px-1 mx-1">[النص](/articles/slug)</code>
                لمسارات منشورة فقط. يُضاف قسم الاستشارة الطبية الرسمي تلقائياً عند النشر.
                الحد الأدنى {LIMITS.MIN_WORDS} كلمة — الحالي: <strong>{words}</strong>.
                ممنوع: جرعات رقمية، أسعار، وسائل تواصل، جهات بيع، وعود نتائج.
              </>
            }
          >
            <TextArea
              rows={16}
              dir="rtl"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-mono text-[13px]"
              placeholder={'مقدمة من 2-3 فقرات دون عنوان…\n\n### عنوان القسم الأول\n\nفقرة…\n\n* نقطة\n* نقطة'}
            />
          </Field>
        </div>

        <Field
          label="Meta Description (الوصف التعريفي)"
          required
          hint={`بين ${LIMITS.SUMMARY_MIN} و${LIMITS.SUMMARY_MAX} حرفاً (يُقطف منه ${LIMITS.META_DESC_MAX} حرفاً لوسم الوصف) — الحالي: ${summary.trim().length}. يجب أن يكون فريداً لكل مقال.`}
        >
          <TextArea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </Field>

        <Field
          label="Slug (رابط المقال)"
          required={false}
          hint={
            isEdit
              ? undefined
              : 'أحرف لاتينية صغيرة وأرقام وشرطات فقط، وفريد لكل مقال. الرابط النهائي: /articles/<slug>.'
          }
        >
          {isEdit ? (
            <TextInput value={slug} readOnly dir="ltr" className="bg-slate-100 text-slate-500 cursor-not-allowed" />
          ) : (
            <div className="flex gap-2">
              <TextInput
                value={slug}
                dir="ltr"
                placeholder="cytotec-oman-guide"
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
              />
              {!slugTouched || !slug ? (
                <button
                  type="button"
                  onClick={suggestSlug}
                  className="shrink-0 text-[11px] font-bold px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                >
                  اقتراح
                </button>
              ) : null}
            </div>
          )}
        </Field>
      </div>

      <ErrorList errors={errors} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || !connected}
          className={`${
            busy || !connected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'
          } bg-emerald-600 text-white font-extrabold text-sm px-6 py-3 rounded-xl transition`}
        >
          {busy
            ? 'جارٍ النشر…'
            : isEdit
              ? 'حفظ ونشر التعديلات مباشرة'
              : 'نشر المقال'}
        </button>
        {!connected ? (
          <span className="text-[11px] text-slate-500">اربط اتصال GitHub أعلاه أولاً لتفعيل النشر.</span>
        ) : (
          <span className="text-[11px] text-slate-500">
            يُنشر مباشرة بعد اجتياز الفحوصات الآلية — بدون أي مرحلة مراجعة أو موافقة.
          </span>
        )}
      </div>
    </form>
  );
}
