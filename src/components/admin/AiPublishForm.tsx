import React, { useMemo, useState } from 'react';
import type { ArticleRecord } from '../../data/types';
import {
  AiDraft,
  countryByCode,
  parseKeywordList,
  slugifyLatin,
  validateAiDraft,
} from '../../lib/article-rules';
import { Field, TextInput, TextArea, CountrySelect, CategorySelect, ImageField, ErrorList } from './fields';

/**
 * توليد مقال بالذكاء الاصطناعي — نشر مباشر.
 *
 * عند الضغط على «توليد ونشر المقال»:
 *   1. فحص فوري في المتصفح (منع تنافس الكلمات المفتاحية + الحقول).
 *   2. حفظ طلب النشر في المستودع وتشغيل خط النشر الآلي القائم (GitHub Actions).
 *   3. داخل Actions: توليد Gemini (بالمفتاح الموجود في Secrets فقط) → قواعد SEO
 *      الحالية → فحص Cannibalization → إنشاء slug → فحوصات الجودة والسلامة →
 *      الحفظ في articles.json + sitemap.xml → رفع = نشر مباشر.
 *   4. يظهر رابط المقال المنشور هنا.
 *
 * لا Review ولا Approval ولا Draft — لا توجد أي مرحلة بين التوليد والنشر.
 */
export default function AiPublishForm({
  articles,
  busy,
  connected,
  onSubmit,
}: {
  articles: ArticleRecord[];
  busy: boolean;
  connected: boolean;
  onSubmit: (draft: AiDraft, slugHint: string | null, imageFile: File | null) => void;
}) {
  const [title, setTitle] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [extraKeywordsRaw, setExtraKeywordsRaw] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('clinical-guides');
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const countryInfo = countryByCode(country);

  const secondaryKeywords = useMemo(() => parseKeywordList(extraKeywordsRaw), [extraKeywordsRaw]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const draft: AiDraft = {
      title: title.trim(),
      primaryKeyword: primaryKeyword.trim(),
      secondaryKeywords,
      country: country || null,
      category,
      instructions: instructions.trim(),
      image: imageUrl.trim() || null,
    };
    const found = validateAiDraft(draft, articles);
    setErrors(found);
    if (found.length > 0) return;
    // slug المقترح إن وُجد (من أحرف لاتينية في العنوان/الكلمة) — وإلا ينشئه خط النشر
    const slugHint = slugifyLatin(`${primaryKeyword} ${title}`) || null;
    onSubmit(draft, slugHint, imageFile);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="عنوان المقال" required>
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ميزوبروستول في الإمارات: الضوابط الطبية والمخاطر وعلامات الخطر"
            />
          </Field>
        </div>

        <Field
          label="الكلمة المفتاحية الرئيسية"
          required
          hint={
            countryInfo
              ? `أمثلة استهداف ${countryInfo.name}: «أدوية إجهاض الحمل في ${countryInfo.name}»، «سايتوتك في ${countryInfo.name}»، «ميزوبروستول في ${countryInfo.name}» — محتوى تثقيفي آمن فقط.`
              : 'أمثلة: «سايتوتك في السعودية»، «أدوية إجهاض الحمل في الكويت»، «Cytotec in Kuwait» — يمنع النظام تلقائياً أي تنافس مع كلمة مقال منشور.'
          }
        >
          <TextInput
            value={primaryKeyword}
            onChange={(e) => setPrimaryKeyword(e.target.value)}
            placeholder="مثال: ميزوبروستول في الإمارات"
          />
        </Field>

        <Field label="كلمات مفتاحية إضافية" hint="افصل بينها بفاصلة — تستخدم في التوليد فقط (لا تحقن في وسوم Meta).">
          <TextInput
            value={extraKeywordsRaw}
            onChange={(e) => setExtraKeywordsRaw(e.target.value)}
            placeholder="مثال: حبوب الإجهاض في الإمارات، Cytotec in UAE"
          />
        </Field>

        <Field label="الدولة / السوق" hint="اتركها «عام» للمقالات غير المرتبطة بسوق محدد.">
          <CountrySelect value={country} onChange={setCountry} />
        </Field>

        <Field label="التصنيف">
          <CategorySelect value={category} onChange={setCategory} />
        </Field>

        <div className="sm:col-span-2">
          <Field
            label="تعليمات المقال"
            hint="تعليمات تحريرية إضافية للنموذج (الزاوية، محاور تريد تغطيتها…). تُرفض أي تعليمات تخالف قواعد السلامة الطبية."
          >
            <TextArea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="مثال: ركزي على ضوابط الصرف في هذا السوق، وعلامات الخطر التي تستوجب الطوارئ، دون أي معلومات شراء أو جرعات."
            />
          </Field>
        </div>

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
      </div>

      <ErrorList errors={errors} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || !connected}
          className={`${
            busy || !connected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          } bg-blue-600 text-white font-extrabold text-sm px-6 py-3 rounded-xl transition`}
        >
          {busy ? 'جارٍ التوليد والنشر…' : 'توليد ونشر المقال'}
        </button>
        {!connected ? (
          <span className="text-[11px] text-slate-500">اربط اتصال GitHub أعلاه أولاً لتفعيل النشر.</span>
        ) : (
          <span className="text-[11px] text-slate-500 leading-relaxed">
            زر واحد فقط: توليد → فحص → نشر مباشر، ثم يظهر رابط المقال. الـ slug ينشأ تلقائياً (فريد ومطابق لقواعد SEO الحالية).
          </span>
        )}
      </div>
    </form>
  );
}
