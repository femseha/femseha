import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// تهيئة Gemini API باستخدام المفتاح السري من البيئة
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateArticle() {
  try {
    console.log("جاري توليد مقال طبي قوي ومحسن لمحركات البحث (SEO) للخليج...");

    // مواضيع قوية مستهدفة للبحث في الخليج (السعودية، الإمارات، الكويت، البحرين)
    const topics = [
      "ضوابط استخدام عقار سايتوتك (ميزوبروستول) في السعودية والرياض: الاستخدامات السريرية والمحاذير القانونية والطبية",
      "أبرز محاذير ومخاطر استخدام حبوب إجهاض الحمل بدون إشراف طبي في الإمارات ودبي",
      "أسباب تأخر الدورة الشهرية وعلاقتها باضطرابات الهرمونات وتكيس المبايض في الكويت",
      "البروتوكول الطبي الآمن لعلاج الإجهاض المنسي وغير المكتمل في المستشفيات المعتمدة بالبحرين",
      "كيفية قراءة تحليل الحمل الرقمي وفحوصات السونار المبكرة بدقة عالية",
      "مخاطر الحمل خارج الرحم: العلامات التحذيرية ومتى يجب التدخل الجراحي الفوري"
    ];

    // اختيار موضوع عشوائي أو تتابعي
    const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `
    أنت طبيب استشاري خبير في جراحة النساء والتوليد وعلاج العقم، ومختص في تحسين محركات البحث (SEO Medical Copywriter).
    مطلوب منك كتابة مقال طبي احترافي، شامل، ومفصل للغاية باللغة العربية الفصحى.

    عنوان المقال المستهدف: "${selectedTopic}"

    شروط صارمة جداً لضمان تصدر محركات البحث (SEO) واكتساح نتائج البحث في الخليج (السعودية، الإمارات، الكويت، البحرين):
    1. **الحجم العميق:** يجب ألا تقل المقالة عن 1000 كلمة، وستكون غنية بالمعلومات الطبية الدقيقة، التحذيرات، والخطوات التوجيهية.
    2. **الكلمات المفتاحية المستهدفة:** دمج كلمات بحثية عالية الأداء مثل: (سايتوتك في السعودية، ميزوبروستول الرياض، حبوب إجهاض الحمل، أسعار واستخدامات سايتوتك، استشارات نسائية في دبي والكويت، إرشادات الرحم الآمنة) بشكل طبيعي وغير مزعج.
    3. **الهيكلة البرمجية (HTML Tags):** 
       - استخدم وسوم HTML الحقيقية للعناوين الفرعية (مثل <h1> للعنوان الرئيسي، <h2> للعناوين الرئيسية الفرعية، و <h3> للنقاط الداخلية).
       - قسّم المقال إلى فقرات واضحة مع استخدام القوائم النقطية لتسهيل القراءة.
    4. **الجانب الأخلاقي والطبي:** التركيز بشدة على خطورة استخدام الأدوية بدون إشراف طبي، وتوضيح المخاطر مثل النزيف الحاد وتمزق الرحم، مع التأكيد على ضرورة مراجعة طبيب مختص.
    5. **منع التكرار الإعلاني:** ممنوع نهائياً ذكر رقم الواتساب أو الهاتف داخل فقرات المقال نهائياً.
    6. **صيغة الخروج:** أخرج النتيجة بصيغة كود JSON صحيح فقط يحتوي على الحقول التالية:
       {
         "title": "عنوان المقال",
         "slug": "url-slug-in-english",
         "categoryName": "صحة المرأة والخصوبة",
         "publishDate": "${new Date().toISOString().split('T')[0]}",
         "summary": "ملخص قصير وجذاب للمقال لا يتجاوز سطرين للاستعراض",
         "content": "النص الكامل للمقال مصاغاً بوسوم HTML (<h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>) وبدون أي كتل كود خارجية إضافية."
       }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let textResponse = response.text.trim();
    
    // تنظيف الـ JSON إذا كان محاطاً بعلامات Markdown
    if (textResponse.startsWith("```json")) {
      textResponse = textResponse.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (textResponse.startsWith("```")) {
      textResponse = textResponse.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const newArticle = JSON.parse(textResponse);

    // مسار ملف المقالات في المشروع
    const articlesFilePath = path.join(process.cwd(), 'src', 'data', 'articles.ts');
    
    if (fs.existsSync(articlesFilePath)) {
      let fileContent = fs.readFileSync(articlesFilePath, 'utf8');
      
      // استخراج مصفوفة المقالات الحالية وإضافة المقال الجديد في بدايتها
      const match = fileContent.match(/export const articles\s*:\s*Article\[\]\s*=\s*(\[[^]*\]);/);
      
      if (match) {
        let articlesArray = eval(match[1]);
        // توليد ID فريد
        newArticle.id = articlesArray.length > 0 ? Math.max(...articlesArray.map(a => a.id)) + 1 : 1;
        
        articlesArray.unshift(newArticle); // إضافة المقال الجديد في المقدمة

        // إعادة بناء ملف الـ TypeScript
        const updatedFileContent = `import { Article } from '../types';\n\nexport const articles: Article[] = ${JSON.stringify(articlesArray, null, 2)};\n`;
        
        fs.writeFileSync(articlesFilePath, updatedFileContent, 'utf8');
        console.log("تمت إضافة المقال الجديد بنجاح إلى ملف articles.ts مع سيو قوي جداً!");
      } else {
        console.error("لم يتم العثور على هيكل مصفوفة articles في الملف.");
      }
    } else {
      console.error("ملف articles.ts غير موجود.");
    }

  } else {
    console.error("لم يتم العثور على ملف articles.ts");
  }

  } catch (error) {
    console.error("حدث خطأ أثناء توليد المقال:", error);
    process.exit(1);
  }
}

generateArticle();
