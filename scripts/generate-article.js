const fs = require('fs');
const path = require('path');

const API_KEY = process.env.AI_API_KEY;

// بنك المواضيع الأكثر بحثاً وتريند في صحة المرأة والحمل
const TOPIC_POOL = [
  "علامات الحمل المبكرة جداً قبل موعد الدورة بـ 7 أيام",
  "الفرق بين دم انغراس الحمل ودم الدورة الشهرية باللون والأعراض",
  "أسباب تأخر الدورة الشهرية مع وجود ألم أسفل البطن والظهر",
  "إفرازات الحمل البنية في الشهر الأول: هل تشكل خطراً؟",
  "متى يظهر الحمل في فحص الدم الرقمي Beta-hCG جدول النسب بالأيام",
  "أعراض تكيس المبايض وطرق تنشيط التبويض الطبيعية والطبية",
  "أسباب تأخر الحمل بعد الطفل الأول وطرق التشخيص والعلاج",
  "أعراض الحمل خارج الرحم وعلامات التحذير المبكرة",
  "طرق حساب أيام التبويض بدقة للحمل بدليل طبي",
  "أسباب نزول قطرات دم في منتصف الدورة الشهرية (نزيف الإباضة)"
];

async function generateArticle() {
  const articlesFilePath = path.join(__dirname, '../src/data/articles.ts');
  let currentFileContent = fs.readFileSync(articlesFilePath, 'utf8');

  const chosenTopic = TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];
  console.log(`Generating article for topic: ${chosenTopic}`);

  const prompt = `أنت طبيب استشاري نساء وتوليد وخبير سيو لمنصة "دليل صحة المرأة" (femseha.com).
المشرف الطبي: د. هيثم الخطيب (00966599287172).

اكتب مقالاً طبياً متكاملاً وتفصيلياً (أكثر من 800 كلمة) يراعي معايير E-E-A-T لمحرك بحث Google حول الموضوع التالي: "${chosenTopic}".

يجب أن ترجع الرد بصيغة JSON حصراً بالشكل التالي:
{
  "id": "early-article-${Date.now()}",
  "slug": "article-slug-${Math.floor(Math.random()*1000)}",
  "title": "عنوان المقال الطبي الدقيق والجاذب",
  "category": "womens-health",
  "categoryName": "صحة المرأة والحمل",
  "author": "د. هيثم الخطيب",
  "authorTitle": "طبيب اختصاصي جراحة النساء والتوليد والعقم",
  "publishDate": "${new Date().toISOString().split('T')[0]}",
  "readingTime": 6,
  "seoTitle": "عنوان السيو لجوجل | د. هيثم الخطيب",
  "metaDescription": "الوصف التعريفي يحتوي على الكلمة المفتاحية ورقم 00966599287172",
  "primaryKeyword": "الكلمة المفتاحية الأكثر بحثاً",
  "summary": "ملخص شامل للمقال من 20 إلى 30 كلمة",
  "content": "نص المقال الطبي بالتفصيل مقسم بعناوين H2 و H3 ونقاط طبية وإرشادات سريرية وفقرة استشارة د. هيثم الخطيب وإخلاء مسؤولية طبي."
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

  if (!articleData) {
    const slugId = `guide-${Date.now()}`;
    articleData = {
      id: slugId,
      slug: slugId,
      title: `${chosenTopic}: دليل سريري شامل بإشراف د. هيثم الخطيب`,
      category: "womens-health",
      categoryName: "صحة المرأة والحمل",
      author: "د. هيثم الخطيب",
      authorTitle: "طبيب اختصاصي جراحة النساء والتوليد والعقم",
      publishDate: new Date().toISOString().split('T')[0],
      readingTime: 6,
      seoTitle: `${chosenTopic} | د. هيثم الخطيب`,
      metaDescription: `دليل طبي يوضح ${chosenTopic} وأهم الأسباب والعلامات السريرية مع استشارة د. هيثم الخطيب 00966599287172.`,
      primaryKeyword: chosenTopic,
      summary: `شرح طبي مفصل حول ${chosenTopic}، التغيرات الفسيولوجية المرافقة، ومتى تجب استشارة الطبيب.`,
      content: `تعتبر حالة "${chosenTopic}" من الموضوعات الطبية الهامة في صحة المرأة وجراحة النساء والتوليد.

### أولاً: الأسباب السريرية والفسيولوجية
1. التغيرات الهرمونية الدقيقة في محور المبيض والغدة النخامية.
2. التغيرات المصاحبة لمراحل التبويض وانغراس البويضة.
3. تأثير التوتر والإجهاد البدني على انتظام الدورة.

### ثانياً: خطوات الفحص والتشخيص الموصى بها
- فحص هرمون الحمل الرقمي (Beta-hCG) للتأكد من الحالة بدقة 100%.
- السونار المهبلي والحوضي لتقييم المبيضين والرحم.

### للتواصل والاستشارة الطبية المباشرة:
👨‍⚕️ المشرف الطبي: د. هيثم الخطيب
🩺 اختصاصي جراحة النساء والتوليد والعقم
📱 هاتف العيادة: 00966599287172
🌐 المنصة الرسمية: femseha.com

⚠️ إخلاء مسؤولية طبية: المعلومات الواردة في هذا المقال هي لأغراض التوعية والتثقيف الصحي فقط، ولا تغني عن الاستشارة السريرية المباشرة.`
    };
  }

  const articleString = JSON.stringify(articleData, null, 2);
  const injectionPoint = "export const articles: Article[] = [";
  
  if (currentFileContent.includes(injectionPoint)) {
    const updatedContent = currentFileContent.replace(
      injectionPoint,
      `${injectionPoint}\n  ${articleString},`
    );
    fs.writeFileSync(articlesFilePath, updatedContent, 'utf8');
    console.log("Successfully published new article to articles.ts!");
  } else {
    console.error("Injection point not found in articles.ts");
  }
}

generateArticle();
