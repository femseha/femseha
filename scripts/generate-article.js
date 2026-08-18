import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.AI_API_KEY;

// بنك الكلمات والمواضيع الأكثر بحثاً وتريند في السعودية ودول الخليج العربي
const TOPIC_POOL = [
  // 1. التوعية الدوائية والبروتوكولات السريرية (سايتوتك وميزوبروستول وتنظيف الرحم)
  "حبوب سايتوتك في السعودية والخليج: المحاذير الطبية والفرق بين الأصلي والتقليد",
  "طريقة استخدام ميزوبروستول 200 الطبية المعتمدة ومخاطر الاستخدام دون إشراف طبي",
  "متى يبدأ مفعول حبوب تنزيل الحمل الميت وعلامات اكتمال تنظيف الرحم؟",
  "أضرار ومضاعفات حبوب تنزيل الحمل بدون متابعة سريرية وفحوصات سونار",
  "أعراض ما بعد حبوب الإجهاض: متى يكون النزيف طبيعياً ومتى يستدعي الطوارئ؟",
  "البروتوكول الطبي المعتمد لعلاج الإجهاض المتروك وتوقف نبض الجنين",

  // 2. علامات وأعراض الحمل المبكرة جداً الأكثر بحثاً
  "علامات الحمل المبكرة جداً قبل موعد الدورة بـ 7 أيام (أعراض حاسمة)",
  "الفرق بين دم انغراس البويضة ودم الدورة الشهرية بالصور واللون والكمية",
  "الفرق بين مغص الحمل ومغص الدورة الشهرية بجدول مقارنة سريري شامل",
  "شكل إفرازات بداية الحمل باللون والخصائص وهل الإفرازات البنية تدل على حمل؟",
  "نغزات أسفل البطن وثقل الثدي قبل الدورة بـ 5 أيام: هل هي علامة حمل مؤكدة؟",
  "أعراض الحمل في الأسبوع الأول للبكر ودليل التأكد السريري",

  // 3. تأخر واضطرابات الدورة الشهرية وتكيس المبايض
  "أسباب تأخر الدورة الشهرية 10 أيام مع تحليل حمل سلبي وألم أسفل الظهر",
  "أعراض تكيس المبايض الشديد وطرق تنشيط التبويض والحمل في الخليج",
  "أسباب احتباس الدورة الشهرية وطرق تحفيز نزولها طبياً بأمان",
  "أسباب نزول قطرات دم في منتصف الشهر (نزيف الإباضة) والفرق بينه وبين الدورة",
  "نزول دم بني بعد انتهاء الدورة بأسبوع: الأسباب والعلاج الطبي",

  // 4. تحاليل وفحوصات الحمل والسونار
  "متى يظهر الحمل في فحص الدم العادي والرقمي Beta-hCG بعد العلاقة بدقة؟",
  "جدول نسب هرمون الحمل الرقمي الطبيعي بالأيام والأسابيع وقراءة النتائج",
  "ظهور خط خفيف جداً في اختبار الحمل المنزلي بعد ساعات: هل هو إيجابي؟",
  "متى يظهر كيس الحمل والنبض بالسونار المهبلي والبطني بالتفصيل؟",
  "أسباب عدم ظهور كيس الحمل في الأسبوع الخامس مع ارتفاع هرمون الحمل",

  // 5. التبويض والخصوبة وتخطيط الحمل
  "طرق حساب أيام التبويض بدقة للحمل بدليل طبي سريري",
  "شكل إفرازات التبويض الممتازة للحمل وعلامات نزول البويضة المؤكدة",
  "أسباب تأخر الحمل بعد الطفل الأول (العقم الثانوي) وطرق تشخيصه وعلاجه",
  "أعراض الحمل خارج الرحم متى تبدأ بالظهور وعلامات الخطر المبكرة"
];

async function generateArticle() {
  const articlesFilePath = path.join(__dirname, '../src/data/articles.ts');
  let currentFileContent = fs.readFileSync(articlesFilePath, 'utf8');

  // اختيار موضوع من بنك الكلمات المستهدفة
  const chosenTopic = TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];
  console.log(`Generating targeted Gulf article for: ${chosenTopic}`);

  const prompt = `أنت طبيب استشاري نساء وتوليد وخبير سيو لمنصة "دليل صحة المرأة" (femseha.com).
المشرف الطبي: د. هيثم الخطيب (00966599287172).

اكتب مقالاً طبياً متكاملاً وتفصيلياً (أكثر من 850 كلمة) يراعي معايير E-E-A-T لمحرك بحث Google وموجهاً للسيدات في (السعودية، الإمارات، الكويت، البحرين، قطر، عُمان) حول الموضوع التالي: "${chosenTopic}".

شروط المقال للتصدر في Google:
1. أول فقرة: إجابة مباشرة ودقيقة على السؤال في 45 كلمة لتحقيق النتيجة صفر (Featured Snippet).
2. استخدام عناوين H2 و H3 واضحة ومقنعة.
3. جدول مقارنة سريري منظم.
4. قسم أسئلة شائعة (FAQ) مع إجاباتها المختصرة في نهاية المقال.
5. تضمين بيانات التواصل مع المشرف الطبي د. هيثم الخطيب (00966599287172) وإخلاء مسؤولية طبي صارم.

يجب أن ترجع الرد بصيغة JSON حصراً بالشكل التالي:
{
  "id": "article-${Date.now()}",
  "slug": "guide-${Math.floor(Math.random()*100000)}",
  "title": "عنوان المقال الطبي الجاذب للباحثين في السعودية والخليج",
  "category": "womens-health",
  "categoryName": "صحة المرأة والحمل",
  "author": "د. هيثم الخطيب",
  "authorTitle": "طبيب اختصاصي جراحة النساء والتوليد والعقم",
  "publishDate": "${new Date().toISOString().split('T')[0]}",
  "readingTime": 6,
  "seoTitle": "عنوان السيو لمحرك بحث جوجل | د. هيثم الخطيب",
  "metaDescription": "الوصف التعريفي يحتوي على الكلمة المفتاحية المستهدفة ورقم الاستشارة 00966599287172",
  "primaryKeyword": "${chosenTopic}",
  "summary": "إجابة مباشرة وملخص شامل للمقال من 25 إلى 35 كلمة لتصدر النتيجة صفر",
  "content": "نص المقال الطبي بالتفصيل بصيغة Markdown مع عناوين H2 و H3 وجداول ونقاط وفقرة استشارة الطبيب وإخلاء المسؤولية."
}`;

  let articleData;

  try {
    if (API_KEY && API_KEY.startsWith("sk-")) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });
      const json = await res.json();
      articleData = JSON.parse(json.choices[0].message.content);
    } else if (API_KEY) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const json = await res.json();
      articleData = JSON.parse(json.candidates[0].content.parts[0].text);
    }
  } catch (err) {
    console.error("AI Generation failed:", err);
  }

  // في حال تعذر الاتصال بالـ API يتم نشر مقال سريري فوري عالي الجودة
  if (!articleData) {
    const slugId = `guide-${Date.now()}`;
    articleData = {
      id: slugId,
      slug: slugId,
      title: `${chosenTopic}: دليل سريري شامل للمرأة في السعودية والخليج`,
      category: "womens-health",
      categoryName: "صحة المرأة والحمل",
      author: "د. هيثم الخطيب",
      authorTitle: "طبيب اختصاصي جراحة النساء والتوليد والعقم",
      publishDate: new Date().toISOString().split('T')[0],
      readingTime: 6,
      seoTitle: `${chosenTopic} | د. هيثم الخطيب`,
      metaDescription: `دليل طبي سريري موجه للسيدات في السعودية والخليج يوضح ${chosenTopic} مع استشارة د. هيثم الخطيب 00966599287172.`,
      primaryKeyword: chosenTopic,
      summary: `دليل طبي شامل يوضح ${chosenTopic}، الفروقات السريرية الدقيقة، والمحاذير الطبية الهامة مع إمكانية الاستشارة المباشرة.`,
      content: `تعتبر التساؤلات حول "${chosenTopic}" من أكثر الاستفسارات الطبية الشائعة لدى السيدات في المملكة العربية السعودية ودول الخليج العربي (الكويت، الإمارات، البحرين، قطر، عُمان).

### أولاً: التقييم الطبي والفسيولوجي
1. التغيرات الهرمونية ومستويات هرمون البروجستيرون والإستروجين.
2. بروتوكولات الفحص السريري المعتمدة لاستبعاد أي مخاطر صحية.
3. أهمية إجراء السونار المهبلي وفحوصات الدم المخبرية قبل اتخاذ أي إجراء علاجي.

### ثانياً: إرشادات وتحذيرات سريرية هامة
- يُحظر استخدام أي مركبات دوائية أو علاجات هرمونية دون إشراف طبي مباشر وفحص تلفزيوني دقيق لتجنب النزيف الحاد أو المضاعفات الخطيرة.
- في حال الاشتباه بوجود إجهاض متروك أو نزيف غير منتظم، يجب مراجعة الطبيب فوراً لتقييم الحالة.

### للتواصل والاستشارة الطبية المباشرة:
👨‍⚕️ المشرف الطبي: د. هيثم الخطيب
🩺 اختصاصي جراحة النساء والتوليد والعقم
📱 هاتف العيادة: 00966599287172
🌐 المنصة الرسمية: femseha.com

⚠️ إخلاء مسؤولية طبية: المحتوى الطبي المنشور على منصة femseha.com هو لأغراض التوعية والتثقيف الصحي فقط، ولا يغني بأي حال عن الاستشارة السريرية المباشرة مع الطبيب المختص.`
    };
  }

  // إضافة المقال الجديد في رأس المصفوفة
  const articleString = JSON.stringify(articleData, null, 2);
  const injectionPoint = "export const articles: Article[] = [";
  
  if (currentFileContent.includes(injectionPoint)) {
    const updatedContent = currentFileContent.replace(
      injectionPoint,
      `${injectionPoint}\n  ${articleString},`
    );
    fs.writeFileSync(articlesFilePath, updatedContent, 'utf8');
    console.log("Successfully published new Gulf-targeted article!");
  } else {
    console.error("Injection point not found in articles.ts");
  }
}

generateArticle();
