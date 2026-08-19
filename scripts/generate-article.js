import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateSingleArticle(index) {
  console.log(`جاري توليد المقال رقم ${index + 1} من 5...`);

  const topics = [
    "دليل استخدام سايتوتك في السعودية: البروتوكولات الصحية المعتمدة في الرياض وجدة",
    "طرق الاستخدام الآمن لعقار ميزوبروستول والتحذيرات الطبية في الإمارات ودبي",
    "أدوية إجهاض الحمل الدوائي: الفروقات والاحتياطات الطبية في صيدليات الكويت والبحرين",
    "مخاطر الإجهاض الدوائي بدون إشراف طبي: دليل توعوي شامل لسلامة المرأة في الخليج",
    "إرشادات السلامة الطبية بعد استخدام أدوية الحمل في السعودية والإمارات"
  ];

  const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

  const prompt = `
    أنت طبيب استشاري خبير، اكتب مقالاً طبياً عميقاً (+1500 كلمة) عن: "${selectedTopic}".
    التركيز الجغرافي: السعودية، الإمارات، الكويت، البحرين.
    الكلمات المفتاحية الأساسية: (سايتوتك، سايتوتك في السعودية، أدوية إجهاض الحمل).
    الشروط:
    1. مقال طبي احترافي، شامل، ومفصل.
    2. استخدم وسوم HTML (h1, h2, h3, p, ul).
    3. ممنوع نهائياً ذكر أرقام هواتف أو واتساب داخل المقال.
    4. التركيز على الجانب الطبي والتحذيرات السريرية.
    أخرج النتيجة بصيغة JSON فقط: 
    {"title":"...","slug":"...","categoryName":"صحة المرأة والخصوبة","publishDate":"${new Date().toISOString().split('T')[0]}","summary":"...","content":"..."}`;

  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  let textResponse = response.text.replace(/```json|```/g, "").trim();
  return JSON.parse(textResponse);
}

async function runBatch() {
  const articlesFilePath = path.join(process.cwd(), 'src', 'data', 'articles.ts');
  let fileContent = fs.readFileSync(articlesFilePath, 'utf8');
  const match = fileContent.match(/export const articles\s*:\s*Article\[\]\s*=\s*(\[[^]*\]);/);
  
  if (!match) { console.error("لم يتم العثور على هيكل المقالات!"); return; }

  let articlesArray = JSON.parse(match[1]);

  for (let i = 0; i < 5; i++) {
    try {
      const newArticle = await generateSingleArticle(i);
      newArticle.id = Date.now() + i;
      articlesArray.unshift(newArticle);
      console.log(`تم توليد المقال ${i + 1} بنجاح.`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // انتظار 5 ثواني بين كل مقال
    } catch (e) { console.error(`خطأ في المقال ${i + 1}:`, e); }
  }

  const updatedFileContent = `import { Article } from '../types';\n\nexport const articles: Article[] = ${JSON.stringify(articlesArray, null, 2)};\n`;
  fs.writeFileSync(articlesFilePath, updatedFileContent, 'utf8');
  console.log("تم تحديث ملف المقالات بـ 5 مقالات جديدة!");
}

runBatch();
