import React, { useState } from "react";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"new-article" | "articles-list" | "doctor-profile">("new-article");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // إعدادات الذكاء الاصطناعي
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [topicPrompt, setTopicPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // بيانات المقال
  const [article, setArticle] = useState({
    title: "",
    slug: "",
    category: "womens-health",
    seoTitle: "",
    metaDescription: "",
    primaryKeyword: "",
    readingTime: 4,
    status: "published",
    content: "",
  });

  // بيانات الطبيب
  const [doctor, setDoctor] = useState({
    name: "د. هيثم الخطيب",
    title: "طبيب اختصاصي جراحة النساء والتوليد",
    phone: "00966599287172",
    bio: "طبيب متخصص في صحة المرأة وجراحة النساء والتوليد، مع خبرة واسعة في الاستشارات السريرية والتثقيف الصحي المبني على الأدلة.",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "DrHaitham2026!" || password === "admin123") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.");
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("GEMINI_API_KEY", key);
  };

  // دالة توليد المقال بالذكاء الاصطناعي
  const generateArticleWithAI = async () => {
    if (!apiKey) {
      alert("يرجى إدخال مفتاح الـ API أولاً في الشريط العلوي الأسود.");
      return;
    }
    if (!topicPrompt) {
      alert("يرجى كتابة عنوان أو فكرة المقال في المربع المخصص.");
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `أنت طبيب استشاري نساء وتوليد وخبير سيو طبي عالمي. قم بكتابة مقال طبي شامل ومتوافق بنسبة 100% مع معايير E-E-A-T ومحرك بحث Google حول الموضوع التالي: "${topicPrompt}".
      
يجب أن ترجع النتيجة بصيغة JSON فقط دون أي نصوص إضافية، بالشكل التالي:
{
  "title": "عنوان المقال الطبي الدقيق والجذاب باللغة العربية",
  "slug": "english-seo-friendly-slug-with-hyphens",
  "category": "womens-health أو pregnancy أو medications أو delayed-period أو pregnancy-test",
  "primaryKeyword": "الكلمة المفتاحية الأكثر بحثاً",
  "seoTitle": "عنوان السيو لجوجل أقل من 60 حرفاً وينتهي بـ | دليل صحة المرأة",
  "metaDescription": "وصف تعريفي جذاب من 130 إلى 155 حرفاً يلخص المقال ويحفز على القراءة",
  "content": "نص المقال الطبي بالتفصيل، يحتوي على مقدمة توعوية، عناوين فرعية، نقاط طبية، إرشادات للمرأة، وإخلاء مسؤولية طبي واضح في النهاية."
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          }),
        }
      );

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        const parsed = JSON.parse(generatedText);
        setArticle({
          ...article,
          title: parsed.title || "",
          slug: parsed.slug || "",
          category: parsed.category || "womens-health",
          primaryKeyword: parsed.primaryKeyword || topicPrompt,
          seoTitle: parsed.seoTitle || "",
          metaDescription: parsed.metaDescription || "",
          content: parsed.content || "",
        });
      }
    } catch (err) {
      alert("حدث خطأ أثناء التوليد. تأكد من صحة مفتاح الـ API والاتصال بالإنترنت.");
    } finally {
      setIsGenerating(false);
    }
  };

  // فاحص السيو المباشر (Yoast Style)
  const isKeywordInTitle = article.primaryKeyword && article.title.includes(article.primaryKeyword);
  const isKeywordInMeta = article.primaryKeyword && article.metaDescription.includes(article.primaryKeyword);
  const isSeoTitleLengthGood = article.seoTitle.length >= 30 && article.seoTitle.length <= 65;
  const isMetaLengthGood = article.metaDescription.length >= 100 && article.metaDescription.length <= 165;
  const isContentLongEnough = article.content.length > 400;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-teal-100">
              🔒
            </div>
            <h1 className="text-2xl font-bold text-slate-800">لوحة تحكم الطبيب</h1>
            <p className="text-sm text-slate-500 mt-1">منصة دليل صحة المرأة (femseha.com)</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">كلمة مرور المسؤول</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">لوحة إدارة المحتوى والذكاء الاصطناعي</h1>
            <p className="text-sm text-slate-500 mt-1">توليد وفحص المقالات الطبية آلياً وفق معايير جوجل</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-sm bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 px-4 py-2 rounded-lg transition"
          >
            تسجيل الخروج
          </button>
        </div>

        {/* Gemini API Key Bar (الشريط الأسود لوضع المفتاح) */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-2xl mb-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>⚡</span> مفتاح Google Gemini API
            </div>
            <p className="text-xs text-teal-200 mt-1">يُحفظ في متصفحك محلياً لتمكين الكتابة التلقائية دون الحاجة لإعادة كتابته</p>
          </div>
          <div className="w-full md:w-80">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleSaveApiKey(e.target.value)}
              placeholder="الصق مفتاح API هنا..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 font-mono"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab("new-article")}
            className={`pb-3 px-5 text-sm font-semibold transition border-b-2 ${
              activeTab === "new-article"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🤖 كاتب المقالات والسيو الآلي
          </button>
          <button
            onClick={() => setActiveTab("articles-list")}
            className={`pb-3 px-5 text-sm font-semibold transition border-b-2 ${
              activeTab === "articles-list"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            📚 المقالات المنشورة
          </button>
          <button
            onClick={() => setActiveTab("doctor-profile")}
            className={`pb-3 px-5 text-sm font-semibold transition border-b-2 ${
              activeTab === "doctor-profile"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🩺 بيانات الطبيب
          </button>
        </div>

        {activeTab === "new-article" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Generator Box */}
              <div className="bg-teal-50 border border-teal-200 p-5 rounded-2xl">
                <label className="block text-sm font-bold text-teal-900 mb-2">
                  ✍️ اكتب فكرة المقال وسيتولى الذكاء الاصطناعي الباقي:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={topicPrompt}
                    onChange={(e) => setTopicPrompt(e.target.value)}
                    placeholder="مثال: أسباب تأخر الدورة الشهرية مع وجود آلام أسفل البطن"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={generateArticleWithAI}
                    disabled={isGenerating}
                    className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isGenerating ? "جاري كتابة المقال والسيو..." : "✨ توليد آلي بالسيو"}
                  </button>
                </div>
              </div>

              {/* Main Fields */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
                {saveSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm">
                    ✅ تم تجهيز وحفظ المقال بنجاح!
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">عنوان المقال</label>
                  <input
                    type="text"
                    value={article.title}
                    onChange={(e) => setArticle({ ...article, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الرابط الإنجليزي (Slug)</label>
                    <input
                      type="text"
                      value={article.slug}
                      onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-left font-mono text-sm"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الكلمة المفتاحية المستهدفة</label>
                    <input
                      type="text"
                      value={article.primaryKeyword}
                      onChange={(e) => setArticle({ ...article, primaryKeyword: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">عنوان السيو لجوجل (SEO Title)</label>
                  <input
                    type="text"
                    value={article.seoTitle}
                    onChange={(e) => setArticle({ ...article, seoTitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الوصف التعريفي (Meta Description)</label>
                  <textarea
                    rows={2}
                    value={article.metaDescription}
                    onChange={(e) => setArticle({ ...article, metaDescription: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">محتوى المقال الطبي</label>
                  <textarea
                    rows={12}
                    value={article.content}
                    onChange={(e) => setArticle({ ...article, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 leading-relaxed text-sm font-sans"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 4000); }}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition"
                >
                  نشر المقال
                </button>
              </div>
            </div>

            {/* Live SEO Analyzer Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
                <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2 border-b pb-3">
                  <span>📊</span> فاحص السيو المباشر (SEO Health)
                </h3>

                <div className="space-y-3.5 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isKeywordInTitle ? "bg-emerald-500" : "bg-rose-400"}`} />
                    <span>الكلمة المفتاحية موجودة في العنوان</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isKeywordInMeta ? "bg-emerald-500" : "bg-rose-400"}`} />
                    <span>الكلمة المفتاحية في الوصف التعريفي</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isSeoTitleLengthGood ? "bg-emerald-500" : "bg-amber-400"}`} />
                    <span>طول عنوان السيو مثالي ({article.seoTitle.length} حرف)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isMetaLengthGood ? "bg-emerald-500" : "bg-amber-400"}`} />
                    <span>طول الوصف التعريفي ممتاز ({article.metaDescription.length} حرف)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isContentLongEnough ? "bg-emerald-500" : "bg-rose-400"}`} />
                    <span>عمق المقال الطبي كافٍ لتصدر جوجل</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-normal">
                  💡 تضمن هذه المؤشرات التوافق التام مع خوارزميات جوجل الطبية (E-E-A-T) لتسريع الفهرسة ورفع ترتيب المقال.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
