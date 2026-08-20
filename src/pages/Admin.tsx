import React, { useState, useEffect } from 'react';

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [title, setTitle] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('womens-health');
  const [geoKeywords, setGeoKeywords] = useState('');
  const [length, setLength] = useState('1500');
  const [tone, setTone] = useState('professional');
  const [includeEmergencyBox, setIncludeEmergencyBox] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminLoggedIn');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // يمكنك تعديل كلمة المرور الافتتاحية هنا أو جعلها مرتبطة بمتغير البيئة
    if (passwordInput === 'admin123' || passwordInput === 'Femseha2026!') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      setIsAuthenticated(true);
    } else {
      alert('كلمة المرور غير صحيحة.');
    }
  };

  const GITHUB_TOKEN = (import.meta as any).env?.VITE_GITHUB_TOKEN || '';
  const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  const REPO_OWNER = 'femseha';
  const REPO_NAME = 'femseha';

  const handlePublishDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !keyword) {
      alert('الرجاء إدخال عنوان المقال والكلمة المفتاحية الرئيسية على الأقل.');
      return;
    }

    if (!GITHUB_TOKEN) {
      alert('الرجاء ضبط مفتاح GitHub Token في متغيرات البيئة بـ Vercel.');
      return;
    }

    setIsPublishing(true);
    setStatusMessage('جاري توليد المقال الطبي العميق عبر محرك Gemini الذكي...');

    try {
      const prompt = `أنت استشاري طبي وطبيب نساء وتوليد خبير. اكتب مقالاً طبياً مهنياً وموسعاً باللغة العربية الفصحى بعنوان "${title}".
الكلمة المفتاحية المستهدفة: "${keyword}".
القسم الطبي: ${category}.
المدن المستهدفة وكلمات السيو الفرعية: ${geoKeywords || 'الرياض، جدة، الدمام'}.
طول المقال المستهدف: أكثر من ${length} كلمة.
يجب أن يكون المقال مقسماً إلى فقرات واضحة مع عناوين رئيسية (h2) وفرعية، ويحتوي على إرشادات طبية دقيقة ومحذرة.
أضف في النهاية إخلاء مسؤولية طبية.
قم بإرجاع النتيجة حصرياً على شكل كود JSON صالح (بدون أي شيفرات ماركداون إضافية أو نص خارج الـ JSON) يحتوي على الحقائق التالية:
{
  "excerpt": "ملخص قصير وجذاب للمقال",
  "paragraphs": [
    "فقرة نصية أولى...",
    "فقرة نصية ثانية..."
  ]
};`;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      let aiGeneratedParagraphs = [
        `يُعد موضوع (${title}) من المواضيع الحساسة والحرجة التي تتطلب استشارة طبية دقيقة وفحصاً سريرياً مباشراً في المنشآت الصحية المعتمدة.`,
        `تم إعداد هذا المقال لتسليط الضوء على الإرشادات الطبية والاشتراطات النظامية المتعلقة بـ (${keyword}) مع مراعاة المعايير المهنية.`
      ];
      let aiExcerpt = `دليل طبي شامل حول ${title} والإرشادات الطبية المعتمدة.`;

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        try {
          const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJsonStr);
          if (parsed.paragraphs) aiGeneratedParagraphs = parsed.paragraphs;
          if (parsed.excerpt) aiExcerpt = parsed.excerpt;
        } catch (parseErr) {
          if (rawText.length > 50) {
            aiGeneratedParagraphs = rawText.split('\n\n').filter(Boolean);
          }
        }
      }

      const slug = title.toLowerCase().replace(/[^a-z0-9u0600-u06ff]+/g, '-').replace(/^-+|-+$/g, '');
      const currentDate = new Date().toISOString().split('T')[0];

      const contentBlocks = aiGeneratedParagraphs.map((pText, idx) => {
        if (idx === 1) {
          return { type: 'h2', text: 'الإرشادات السريرية والتحذيرات الطبية' };
        }
        return { type: 'p', text: pText };
      });

      if (includeEmergencyBox) {
        contentBlocks.push({
          type: 'note',
          text: 'تنبيه طارئ: في حال ظهور أي أعراض حادة أو مضاعفات غير متوقعة، يجب التوجه فوراً لأقرب مستشفى أو مركز طوارئ طبي.'
        });
      }

      const newArticleObject = {
        slug: slug || `article-${Date.now()}`,
        title,
        excerpt: aiExcerpt,
        category: category === 'medications' ? 'الأدوية' : category === 'pregnancy' ? 'الحمل والأجنة' : 'صحة المرأة',
        categoryHref: `/${category}`,
        primaryKeyword: keyword,
        author: 'فريق تحرير دليل صحة المرأة',
        medicalReviewer: 'د. هيثم الخطيب',
        datePublished: currentDate,
        dateModified: currentDate,
        readingTime: parseInt(length) > 1500 ? 7 : 5,
        content: contentBlocks,
        sources: ['https://femseha.com/'],
        relatedArticles: ['misoprostol-uses-safety']
      };

      setStatusMessage('جاري جلب الملفات الحالية من مستودع GitHub...');
      const filePath = 'src/data/generated-articles.ts';
      
      const getFileRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      });

      let fileSha = '';
      let existingArticles = [];

      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        fileSha = fileData.sha;
        const decodedContent = decodeURIComponent(escape(atob(fileData.content)));
        const match = decodedContent.match(/export const GENERATED_ARTICLES: Article\[\] = (\[[\s\S]*\]);/);
        if (match && match[1]) {
          try {
            existingArticles = eval(match[1]);
          } catch (err) {
            existingArticles = [];
          }
        }
      }

      const updatedArticlesList = [newArticleObject, ...existingArticles];

      const newFileContent = `import type { Article } from "./types";

export const GENERATED_ARTICLES: Article[] = ${JSON.stringify(updatedArticlesList, null, 2)};
`;

      setStatusMessage('جاري رفع المقال ونشره مباشرة على GitHub...');

      const updateRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Auto: Publish AI article "${title}" [skip ci]`,
          content: btoa(unescape(encodeURIComponent(newFileContent))),
          sha: fileSha || undefined
        }),
      });

      if (updateRes.ok) {
        setStatusMessage('تم توليد المقال بالذكاء الاصطناعي ونشره بنجاح تام على الموقع!');
        setTitle('');
        setKeyword('');
        setGeoKeywords('');
      } else {
        const errData = await updateRes.json();
        throw new Error(errData.message || 'فشل الاتصال بـ GitHub API');
      }

    } catch (err: any) {
      alert('حدث خطأ أثناء التوليد أو النشر: ' + err.message);
      setStatusMessage('');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">تسجيل دخول لوحة التحكم</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition-all"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مركز النشر والتحكم الطبي المطور</h1>
            <p className="text-sm text-gray-500 mt-1">الربط الآمن: Gemini AI + GitHub API</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <span>تسجيل الخروج</span>
            <span>🚪</span>
          </button>
        </div>

        <form onSubmit={handlePublishDirectly} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان المقال أو الموضوع الطبي الرئيسي *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الإرشادات الطبية لتأخر الدورة الشهرية"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الكلمة المفتاحية الرئيسية *</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="مثال: تأخر الدورة الشهرية"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">القسم الطبي</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="womens-health">صحة المرأة والخصوبة</option>
              <option value="medications">الأدوية (سايتوتك وميزوبروستول)</option>
              <option value="pregnancy">الحمل والأجنة والسونار</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الكلمات الفرعية والمدن المستهدفة</label>
            <textarea
              value={geoKeywords}
              onChange={(e) => setGeoKeywords(e.target.value)}
              placeholder="الرياض، جدة، الدمام..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {statusMessage && (
            <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm font-medium">
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isPublishing}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <span>🚀</span>
            <span>{isPublishing ? 'جاري التوليد والنشر...' : 'توليد المقال بالذكاء الاصطناعي ونشره فوراً'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Admin;
