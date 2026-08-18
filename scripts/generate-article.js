import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOPICS = [
  "أسباب تأخر الحمل بعد الإنجاب الأول (العقم الثانوي)",
  "أعراض متلازمة تكيس المبايض والبروتوكول العلاجي الحديث",
  "علامات انغراس البويضة والفرق بينها وبين دم الدورة",
  "تحليل مخزون المبيض AMH: متى تحتاجينه وكيف تقرئين نتائجه",
  "بطانة الرحم المهاجرة: الأعراض وطرق العلاج والتدخل الجراحي",
  "أسباب الإفرازات البنية أثناء الحمل المبكر ودلالاتها",
  "تسمم الحمل وارتفاع ضغط الدم: سبل الوقاية والولادة الآمنة",
  "نصائح سريرية لزيادة فرص نجاح الحقن المجهري وترجيع الأجنة",
  "اضطرابات هرمون الحليب (البرولاكتين) وتأثيرها على الخصوبة",
  "آلام الحوض المزمنة عند النساء: الأسباب والتشخيص بالمنظار"
];

async function generateArticle() {
  const apiKey = process.env.GEMINI_API_KEY;
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const timestamp = Date.now();
  const slug = `guide-${timestamp}`;
  const today = new Date().toISOString().split('T')[0];

  let articleData = {
    id: `art-${timestamp}`,
    slug: slug,
    title: `${topic} | استشارة د. هيثم الخطيب`,
    category: "womens-health",
    categoryName: "صحة المرأة والحمل",
    summary: `دليل طبي سريري شامل يستعرض ${topic}، أهم أسبابه، وطرق التشخيص والعلاج المعتمدة بإشراف د. هيثم الخطيب.`,
    publishDate: today,
    readTime: 6,
    content: `بقلم: د. هيثم الخطيب\nطبيب اختصاصي جراحة النساء والتوليد والعقم\nللاستشارات المباشرة: 00966599287172\n\nتعتبر حالة "${topic}" من الاستشارات السريرية الهامة التي تتطلب تقييماً دقيقاً للوصول إلى التشخيص السليم.\n\n### أولاً: الأسباب والعوامل الطبية\n1. الاضطرابات الهرمونية وتأثيرها على وظائف المبيض وبطانة الرحم.\n2. العوامل الفسيولوجية المرافقة لمراحل الحمل والخصوبة.\n3. أسباب موضعية تحتاج إلى فحص بالموجات فوق الصوتية (السونار).\n\n### ثانياً: الفحوصات الطبية الموصى بها\n- فحص السونار الحوضي الدقيق.\n- الفحوصات المخبرية الهرمونية الشاملة.\n\n📞 للتواصل المباشر وحجز المواعيد: 00966599287172`
  };

  if (apiKey) {
    try {
      const prompt = `أنت طبيب استشاري نساء وتوليد للمنصة الطبية "فيم صحة" بإشراف د. هيثم الخطيب (00966599287172). اكتب مقالاً طبياً حول: "${topic}". أرجع الرد بتنسيق JSON فقط: {"title": "عنوان المقال الطبي", "summary": "ملخص في سطرين", "content": "نص المقال الطبي الكامل بأسلوب سريري مع ذكر رقم التواصل 00966599287172"}`;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        articleData.title = parsed.title || articleData.title;
        articleData.summary = parsed.summary || articleData.summary;
        articleData.content = parsed.content || articleData.content;
      }
    } catch (e) {
      console.log("استخدام القالب التلقائي الاحتياطي.");
    }
  }

  const articlesFilePath = path.join(__dirname, '../src/data/articles.ts');
  let currentFileContent = fs.readFileSync(articlesFilePath, 'utf8');

  const arrayMatch = currentFileContent.match(/export const articles:\s*Article\[\]\s*=\s*(\[[\s\S]*\]);/);
  if (arrayMatch) {
    const newArticleString = JSON.stringify(articleData, null, 2);
    const updatedArrayContent = `export const articles: Article[] = [\n  ${newArticleString},\n` + arrayMatch[1].slice(1);
    const newFullFile = currentFileContent.replace(/export const articles:\s*Article\[\]\s*=[\s\S]*;/, updatedArrayContent + ';');
    fs.writeFileSync(articlesFilePath, newFullFile, 'utf8');
    console.log(`✅ تم نشر المقال بنجاح: ${articleData.title}`);
  }
}

generateArticle();
