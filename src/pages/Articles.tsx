import { useMemo, useState } from "react";
import { ArticleCard, PageHero } from "@/components/Content";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { ARTICLES, LATEST_ARTICLES } from "@/data/articles";
import { breadcrumbJsonLd, canonicalFor, useSeo } from "@/lib/seo";

const CRUMBS = [
  { name: "الرئيسية", href: "/" },
  { name: "المقالات الطبية", href: "/articles" },
];

export default function Articles() {
  const [category, setCategory] = useState<string>("الكل");

  const categories = useMemo(() => ["الكل", ...Array.from(new Set(ARTICLES.map((a) => a.category)))], []);
  const list = useMemo(
    () => (category === "الكل" ? LATEST_ARTICLES : LATEST_ARTICLES.filter((a) => a.category === category)),
    [category],
  );

  useSeo({
    title: "المقالات الطبية | دليل صحة المرأة",
    description:
      "مقالات طبية تعليمية عن صحة المرأة والحمل والأدوية: سايتوتك، ميزوبروستول، تأخر الدورة، اختبار الحمل، الحمل خارج الرحم والسونار، مع ذكر المصادر وتاريخ التحديث.",
    path: "/articles",
    jsonLd: [
      breadcrumbJsonLd(CRUMBS),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "المقالات الطبية",
        url: canonicalFor("/articles"),
        inLanguage: "ar",
        hasPart: LATEST_ARTICLES.map((a) => ({
          "@type": "Article",
          headline: a.title,
          url: canonicalFor(`/articles/${a.slug}`),
          datePublished: a.datePublished,
          dateModified: a.dateModified,
        })),
      },
    ],
  });

  return (
    <>
      <PageHero
        kicker="المكتبة الطبية"
        h1="المقالات الطبية"
        intro="مجموعة مقالات تأسيسية مكتوبة بلغة عربية واضحة ومستندة إلى مصادر طبية معتمدة، مع توضيح كاتب المقال وحالة المراجعة الطبية وتاريخ آخر تحديث."
        crumbs={CRUMBS}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-wrap gap-2" role="group" aria-label="تصفية حسب القسم">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                category === c ? "bg-brand-700 text-white" : "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>

      <ConsultationCTA />
    </>
  );
  {
    id: "early-pregnancy-signs-before-period",
    slug: "early-pregnancy-signs-before-period",
    title: "علامات الحمل المبكرة جداً قبل موعد الدورة بـ 7 أيام: 5 أعراض مؤكدة لا تخطئ",
    category: "womens-health",
    categoryName: "صحة المرأة والحمل",
    author: "د. هيثم الخطيب",
    authorTitle: "طبيب اختصاصي جراحة النساء والتوليد والعقم",
    publishDate: "2026-08-18",
    readingTime: 6,
    seoTitle: "علامات الحمل المبكرة قبل موعد الدورة | د. هيثم الخطيب",
    metaDescription: "تعرفي على أبرز علامات الحمل المبكرة قبل موعد الدورة بـ 7 أيام والفرق بينها وبين الدورة الشهرية مع استشارة د. هيثم الخطيب 00966599287172.",
    primaryKeyword: "علامات الحمل المبكرة قبل موعد الدورة",
    summary: "دليل سريري شامل يوضح أهم 5 علامات لانغراس البويضة وحدوث الحمل قبل موعد الدورة بأسبوع، والفرق الدقيق بين دم التعشيش ودم الطمث.",
    content: `تعد الفترة التي تسبق موعد الدورة الشهرية بأسبوع من أكثر الفترات التي تترقب فيها المرأة أي تغير جسدي قد يشير إلى حدوث الحمل. علمياً وسريرياً، تتزامن هذه الفترة مع مرحلة "انغراس البويضة الملقحة" (Implantation) في بطانة الرحم، وهي اللحظة الفعلية التي يبدأ فيها الجسم بإفراز هرمون الحمل (hCG) والبروجسترون بمستويات مرتفعة.

### أولاً: ماذا يحدث فسيولوجياً قبل موعد الدورة بـ 7 أيام؟
بعد إخصاب البويضة في قناة فالوب، تستغرق الرحلة نحو 6 إلى 9 أيام للوصول إلى تجويف الرحم. عند انغراس الكيسة الأريمية في جدار الرحم المغذي، تبدأ المشيمة الأولية بإفراز هرمون الحمل، مما يؤدي إلى الحفاظ على بطانة الرحم ومنع نزول الدورة، ومضاعفة تدفق الدم لمنطقة الحوض والثديين.

### ثانياً: 5 علامات مبكرة جداً تؤكد احتمالية الحمل
1. **دم الانغراس أو التعشيش (Implantation Bleeding):** قطرات خفيفة جداً ذات لون وردي فاتح أو بني، تستمر لساعات قليلة أو يوم واحد فقط بدون كتل أو تجلطات.
2. **وخز وتقلصات أسفل البطن:** نبضات متقطعة على شكل نكزات أو شد خفيف في جانب واحد من الحوض وليست تشنجات طمث مستمرة.
3. **ثقل وتغير حساسية الثديين:** نتيجة الارتفاع السريع لهرموني الإستروجين والبروجسترون مع اغمقاق طفيف في لون الهالة المحيطة بالحلمة.
4. **الخمول والرغبة المفاجئة في النوم:** نتيجة التأثير المهدئ لهرمون البروجسترون على الجهاز العصبي وانخفاض ضغط الدم الخفيف.
5. **النفور من الروائح وتغير حاسة التذوق:** حساسية استثنائية تجاه روائح القهوة أو العطور وظهور طعم معدني خفيف في الفم.

### ثالثاً: متى تجرين فحص الحمل لضمان دقة النتيجة؟
- **فحص الدم الرقمي (Beta-hCG):** هو الفحص الأدق مخبرياً ويمكن إجراؤه قبل موعد الدورة بـ 3 إلى 4 أيام.
- **اختبار البول المنزلي:** يُفضل إجراؤه في يوم موعد الدورة المتوقع أو بعد تأخرها بيوم، باستخدام عينة البول الصباحية الأولى.

---

### للتواصل والاستشارة الطبية المباشرة:
👨‍⚕️ **المشرف الطبي:** د. هيثم الخطيب  
🩺 **الصفة:** طبيب اختصاصي جراحة النساء والتوليد والعقم  
📱 **هاتف العيادة والاستشارات المباشرة:** 00966599287172  
🌐 **المنصة الرسمية:** femseha.com

⚠️ *إخلاء مسؤولية طبية: المعلومات الواردة في هذا المقال هي لأغراض التوعية والتثقيف الصحي فقط، ولا تغني عن الاستشارة السريرية المباشرة والفحص لدى الطبيب المختص.*`
  }
}
