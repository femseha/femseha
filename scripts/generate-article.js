import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const articlesFilePath = path.join(__dirname, '../src/data/articles.ts');

// بنك الكلمات المفتاحية ومواضيع السيو المستهدفة
const TOPIC_BANK = [
  {
    topic: "سايتوتك في السعودية والرياض: دواعي الاستعمال والمحاذير السريرية",
    cat: "clinical-guides",
    catName: "إرشادات الأدوية والبروتوكولات"
  },
  {
    topic: "أدوية وموانع استخدام ميزوبروستول في الكويت، البحرين، والإمارات",
    cat: "clinical-guides",
    catName: "إرشادات الأدوية والبروتوكولات"
  },
  {
    topic: "حبوب وأدوية إجهاض الحمل: المخاطر السريرية وضرورة الفحص بالسونار",
    cat: "clinical-guides",
    catName: "إرشادات الأدوية والبروتوكولات"
  },
  {
    topic: "البروتوكول الطبي المعتمد لعلاج الإجهاض المنسي بالمستشفيات",
    cat: "clinical-guides",
    catName: "إرشادات الأدوية والبروتوكولات"
  },
  {
    topic: "أعراض متلازمة تكيس المبايض والبروتوكول العلاجي الحديث للحمل",
    cat: "womens-health",
    catName: "صحة المرأة والخصوبة"
  },
  {
    topic: "تحليل مخزون المبيض AMH: قراءة الأرقام ودلالتها للخصوبة",
    cat: "womens-health",
    catName: "صحة المرأة والخصوبة"
  },
  {
    topic: "أعراض ومحاذير الحمل خارج الرحم وطرق التشخيص المبكر بالسونار",
    cat: "pregnancy-care",
    catName: "رعاية ومتابعة الحمل"
  },
  {
    topic: "أسباب النزيف في الثلث الأول من الحمل وطرق التدخل العاجل",
    cat: "pregnancy-care",
    catName: "رعاية ومتابعة الحمل"
  },
  {
    topic: "علاج بطانة الرحم المهاجرة (الأندومتريوزيس) وتأثيرها على الإنجاب",
    cat: "womens-health",
    catName: "صحة المرأة والخصوبة"
  },
  {
    topic: "نصائح سريرية لزيادة فرص نجاح الحقن المجهري وترجيع الأجنة",
    cat: "womens-health",
    catName: "صحة المرأة والخصوبة"
  }
];

async function generateAndPublish() {
  const apiKey = process.env.GEMINI_API_KEY;
  const selected = TOPIC_BANK[Math.floor(Math.random() * TOPIC_BANK.length)];
  const timestamp = Date.now();
  const today = new Date().toISOString().split('T')[0];

  let newArticle = {
    id: `art-${timestamp}`,
    slug: `guide-${timestamp}`,
    title: `${selected.topic} | إشراف د. هيثم الخطيب`,
    category: selected.cat,
    categoryName: selected.catName,
    summary: `دليل طبي سريري موسع يستعرض بالتفصيل ${selected.topic}، مع توضيح المحاذير السريرية وخطوات التشخيص المعتمدة برعاية د. هيثم الخطيب.`,
    publishDate: today,
    readTime: 7,
    content: `بقلم: د. هيثم الخطيب\nطبيب اختصاصي جراحة النساء والتوليد والعقم\nللاستشارات السريرية المباشرة: 00966599287172\n\nتعتبر المسائل المتعلقة بـ "${selected.topic}" من المواضيع الطبية الهامة التي تتطلب تقييماً سريرياً دقيقاً ومتابعة مباشرة من الطبيب المختص.\n\n### أولاً: التقييم السريري والبروتوكول المعتمد\n1. ضرورة إجراء فحص الموجات فوق الصوتية (السونار) لتشخيص الحالة بدقة.\n2. الالتزام التام بعدم تناول أي عقاقير أو أدوية دون إشراف طبي مباشر داخل المنشآت الصحية المعتمدة.\n3. مراقبة مؤشرات النزيف والعلامات الحيوية للحفاظ على صحة وسلامة المرأة.\n\n### ثانياً: متى يجب مراجعة العيادة فوراً؟ 🚨\nعند الشعور بآلام حادة ومفاجئة أسفل البطن أو حدوث نزيف مهبلي غير معتاد.\n\n---\n📞 للتواصل المباشر والاستشارات مع د. هيثم الخطيب:\nهاتف / واتساب: 00966599287172`
  };

  if (apiKey) {
    try {
      const prompt = `أنت طبيب استشاري نساء وتوليد وخبير سيو لمنصة د. هيثم الخطيب (00966599287172). اكتب مقالاً طبياً احترافياً حول: "${selected.topic}". أرجع الرد بصيغة JSON فقط: {"title": "العنوان", "summary": "الملخص", "content": "نص المقال الطبي المنسق مع ذكر رقم د. هيثم الخطيب 00966599287172"}`;

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
    } catch (err) {
      console.log('استخدام القالب السريري المدمج.');
    }
  }

  // قراءة المقالات الحالية بأمان
  let currentArticles = [];
  try {
    const fileText = fs.readFileSync(articlesFilePath, 'utf8');
    const match = fileText.match(/export const articles:\s*Article\[\]\s*=\s*(\[[\s\S]*\]);/);
    if (match) {
      currentArticles = (new Function(`return ${match[1]}`))();
    }
  } catch (e) {
    console.log('تهيئة قائمة المقالات.');
  }

  // إضافة المقال الجديد في أول القائمة
  currentArticles.unshift(newArticle);

  // توليد ملف TypeScript نظيف وخالٍ من الأخطاء
  const outputCode = `export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryName?: string;
  summary: string;
  publishDate: string;
  readTime?: number;
  content: string;
  image?: string;
}

export const articles: Article[] = ${JSON.stringify(currentArticles, null, 2)};
`;

  fs.writeFileSync(articlesFilePath, outputCode, 'utf8');
  console.log(`✅ تم نشر المقال بنجاح وتحديث الموقع: ${newArticle.title}`);
}

generateAndPublish();
