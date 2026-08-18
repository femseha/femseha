import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOPICS = [
  {
    topic: "بروتوكول التعامل مع الإجهاض المنذر والنزيف في الثلث الأول من الحمل",
    cat: "clinical-guides",
    catName: "إرشادات الأدوية والبروتوكولات"
  },
  {
    topic: "أدوية تنشيط التبويض والحقن المجهري: متى وكيف تستخدم بأمان؟",
    cat: "womens-health",
    catName: "صحة المرأة والخصوبة"
  },
  {
    topic: "أعراض ومحاذير الحمل خارج الرحم وطرق التشخيص المبكر بالسونار",
    cat: "pregnancy-care",
    catName: "رعاية ومتابعة الحمل"
  },
  {
    topic: "علاج بطانة الرحم المهاجرة (الأندومتريوزيس) وتأثيرها على الإنجاب",
    cat: "womens-health",
    catName: "صحة المرأة والخصوبة"
  },
  {
    topic: "الفحوصات الهرمونية الشاملة قبل بدء بروتوكول علاج العقم وتأخر الحمل",
    cat: "womens-health",
    catName: "صحة المرأة والخصوبة"
  },
  {
    topic: "علامات الولادة المبكرة وكيفية إيقاف الطلق المبكر سريرياً",
    cat: "pregnancy-care",
    catName: "رعاية ومتابعة الحمل"
  }
];

async function generateArticle() {
  const apiKey = process.env.GEMINI_API_KEY;
  const selected = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const timestamp = Date.now();
  const today = new Date().toISOString().split('T')[0];

  let newArticle = {
    id: `art-${timestamp}`,
    slug: `guide-${timestamp}`,
    title: `${selected.topic} | د. هيثم الخطيب`,
    category: selected.cat,
    categoryName: selected.catName,
    summary: `دليل طبي سريري يستعرض بالتفصيل ${selected.topic}، مع إرشادات الفحص والتشخيص بإشراف د. هيثم الخطيب.`,
    publishDate: today,
    readTime: 6,
    content: `بقلم: د. هيثم الخطيب\nطبيب اختصاصي جراحة النساء والتوليد والعقم\nللاستشارات السريرية المباشرة: 00966599287172\n\nيعد موضوع "${selected.topic}" من المسائل الطبية الدقيقة التي تتطلب تقييماً سريرياً شاملاً.\n\n### أولاً: التقييم السريري والأسباب\n- دراسة التاريخ المرضي وإجراء الفحص السريري المباشر.\n- إجراء فحوصات الموجات فوق الصوتية والتحاليل المخبرية المعتمدة.\n\n### ثانياً: التوصيات الطبية والمتابعة\nيجب الامتناع عن أخذ أي أدوية دون إشراف طبي مباشر لتجنب المضاعفات الصحية.\n\n📞 للتواصل مع د. هيثم الخطيب: 00966599287172`
  };

  if (apiKey) {
    try {
      const prompt = `أنت طبيب استشاري نساء وتوليد للمنصة الطبية "فيم صحة" بإشراف د. هيثم الخطيب (00966599287172). اكتب مقالاً طبياً دقيقاً حول: "${selected.topic}". أرجع الرد بصيغة JSON فقط: {"title": "عنوان المقال", "summary": "ملخص سريري مركز", "content": "نص المقال الطبي الكامل بأسلوب سريري مع ذكر رقم التواصل 00966599287172"}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        newArticle.title = parsed.title || newArticle.title;
        newArticle.summary = parsed.summary || newArticle.summary;
        newArticle.content = parsed.content || newArticle.content;
      }
    } catch (e) {
      console.log('استخدام القالب التلقائي البديل.');
    }
  }

  const filePath = path.join(__dirname, '../src/data/articles.ts');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // استبدال مصفوفة المقالات بدقة
  const match = fileContent.match(/export const articles:\s*Article\[\]\s*=\s*\[([\s\S]*?)\];/);
  if (match) {
    const newEntry = `  ${JSON.stringify(newArticle, null, 2)},\n`;
    const newArticlesArray = `export const articles: Article[] = [\n${newEntry}${match[1].trim()}\n];`;
    const updatedFile = fileContent.replace(/export const articles:\s*Article\[\]\s*=\s*\[[\s\S]*?\];/, newArticlesArray);
    fs.writeFileSync(filePath, updatedFile, 'utf8');
    console.log(`✅ تم نشر المقال بنجاح: ${newArticle.title}`);
  }
}

generateArticle();
