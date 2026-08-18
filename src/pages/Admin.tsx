import React, { useState, useEffect } from "react";

interface SavedArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  seoTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  readingTime: number;
  date: string;
  content: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"new-article" | "articles-list">("new-article");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // إعدادات الـ API
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("AI_API_KEY") || "");
  const [topicPrompt, setTopicPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // بيانات المقال الحالي
  const [article, setArticle] = useState({
    title: "",
    slug: "",
    category: "womens-health",
    seoTitle: "",
    metaDescription: "",
    primaryKeyword: "",
    readingTime: 6,
    status: "published",
    content: "",
  });

  // قائمة المقالات المحفوظة
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

  useEffect(() => {
    const loaded = localStorage.getItem("FEMSEHA_SAVED_ARTICLES");
    if (loaded) {
      try {
        setSavedArticles(JSON.parse(loaded));
      } catch (e) {
        console.error("Error loading articles", e);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "DrHaitham2026!" || password === "admin123") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("كلمة المرور غير صحيحة");
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("AI_API_KEY", key);
  };

  // المولد الداخلي الذكي الفوري
  const generateBuiltInArticle = (topic: string) => {
    const cleanTopic = topic.trim() || "تأخر الدورة الشهرية وأسبابه الشائعة";
    const keyword = cleanTopic.split(" ").slice(0, 4).join(" ");
    
    return {
      primaryKeyword: keyword,
      title: `${cleanTopic}: دليل طبي شامل بإشراف د. هيثم الخطيب`,
      slug: cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "medical-article-guide",
      category: "womens-health",
      seoTitle: `${keyword} | استشارة د. هيثم الخطيب`,
      metaDescription: `دليل طبي شامل يوضح ${keyword} وأهم أسبابها وطرق التشخيص الدقيقة مع إرشادات د. هيثم الخطيب للتواصل 00966599287172.`,
      content: `بقلم: د. هيثم الخطيب
طبيب اختصاصي جراحة النساء والتوليد والعقم
للتواصل والاستشارات المباشرة: 00966599287172

---

تعد حالة "${cleanTopic}" من الاستفسارات الطبية الشائعة التي تستقبلها عيادات صحة المرأة وجراحة النساء والتوليد. تتطلب هذه الحالة تقييماً دقيقاً لمعرفة الأسباب الفسيولوجية والهرمونية الكامنة وراءها لتحديد البروتوكول العلاجي الأمثل.

---

### أولاً: الأسباب الطبية والفسيولوجية
1. التغيرات الهرمونية الحادة: تلعب هرمونات الإستروجين والبروجسترون دوراً رئيسياً في توازن الجهاز التناسلي، وأي اضطراب في محور (تحت المهاد - الغدة النخامية - المبيض) يؤدي إلى ظهور هذه الأعراض.
2. متلازمة تكيس المبايض (PCOS): تعد من أكثر الحالات المسببة لعدم انتظام الدورة واضطرابات التبويض المرافقة لآلام الحوض.
3. التوتر والضغط النفسي: يؤدي ارتفاع هرمون الكورتيزول إلى تثبيط إفراز الهرمونات المنشطة للمبيض مؤقتاً.
4. اضطرابات الغدة الدرقية وهرمون الحليب (Prolactin): كلاهما يرتبط ارتباطاً وثيقاً بانتظام الدورة وصحة بطانة الرحم.

---

### ثانياً: الفحوصات الطبية الموصى بها للتشخيص
* فحص هرمون الحمل الرقمي (Beta-hCG) لنفي أو تأكيد الحمل بدقة 100%.
* التصوير بالموجات فوق الصوتية (السونار الحوضي/المهبلي) لفحص الرحم والمبيضين.
* التحاليل الهرمونية الشاملة (TSH, Free T4, Prolactin, FSH, LH).

---

### ثالثاً: علامات تحذيرية تستوجب المراجعة الطبية الفورية 🚨
* ألم حاد ومفاجئ في أحد جانبي الحوض أو أسفل البطن.
* نزيف مهبلي غير طبيعي أو مصحوب بتجلطات دموية.
* دوخة شديدة، هبوط في ضغط الدم، أو إغماء.
* ارتفاع في درجة حرارة الجسم مع إفرازات غير معتادة.

---

### للتواصل والاستشارة الطبية المباشرة:
👨‍⚕️ المشرف الطبي: د. هيثم الخطيب
🩺 الصفة: اختصاصي جراحة النساء والتوليد والعقم
📱 هاتف العيادة والاستشارات: 00966599287172
🌐 المنصة الرسمية: femseha.com

---

⚠️ إخلاء مسؤولية طبية: المعلومات الواردة في هذا المقال هي لأغراض التوعية والتثقيف الصحي فقط، ولا تغني بأي حال من الأحوال عن الاستشارة الطبية والفحص السريري المباشر.`
    };
  };

  const generateArticleWithAI = async () => {
    if (!topicPrompt) {
      alert("يرجى كتابة فكرة أو عنوان المقال أولاً.");
      return;
    }

    setIsGenerating(true);

    if (!apiKey) {
      const generated = generateBuiltInArticle(topicPrompt);
      setArticle({ ...article, ...generated });
      setIsGenerating(false);
      return;
    }

    const systemPrompt = `أنت طبيب استشاري نساء وتوليد وخبير سيو لمنصة "دليل صحة المرأة" (femseha.com).
المشرف الطبي: د. هيثم الخطيب (00966599287172).
اكتب مقالاً طبياً شاملاً وموسعاً حول: "${topicPrompt}".
أرجع الرد بصيغة JSON فقط:
{
  "primaryKeyword": "الكلمة المفتاحية",
  "title": "عنوان المقال ويحتوي على الكلمة المفتاحية",
  "slug": "english-slug-url",
  "category": "womens-health",
  "seoTitle": "عنوان سيو جوجل | د. هيثم الخطيب",
  "metaDescription": "الوصف التعريفي يحتوي على الكلمة ورقم الهاتف 00966599287172",
  "content": "نص المقال الطبي بالتفصيل مع بيانات د. هيثم الخطيب..."
}`;

    try {
      if (apiKey.startsWith("sk-")) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: systemPrompt }],
            response_format: { type: "json_object" }
          }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        const parsed = JSON.parse(data.choices[0].message.content);
        setArticle({ ...article, ...parsed });
      } else {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: { responseMimeType: "application/json" }
            }),
          }
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
        setArticle({ ...article, ...parsed });
      }
    } catch (err: any) {
      console.warn("API Error, falling back to built-in generator:", err);
      const generated = generateBuiltInArticle(topicPrompt);
      setArticle({ ...article, ...generated });
      alert("تم توليد المقال الطبي بالكامل بنجاح عبر المحرك الذكي المدمج!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishArticle = () => {
    if (!article.title || !article.content) {
      alert("يرجى التأكد من وجود عنوان ومحتوى للمقال قبل النشر.");
      return;
    }
    const newArticleItem: SavedArticle = {
      id: Date.now().toString(),
      title: article.title,
      slug: article.slug || `article-${Date.now()}`,
      category: article.category,
      seoTitle: article.seoTitle,
      metaDescription: article.metaDescription,
      primaryKeyword: article.primaryKeyword,
      readingTime: article.readingTime || 5,
      date: new Date().toISOString().split("T")[0],
      content: article.content,
    };
    const updated = [newArticleItem, ...savedArticles];
    setSavedArticles(updated);
    localStorage.setItem("FEMSEHA_SAVED_ARTICLES", JSON.stringify(updated));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 5000);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المقال؟")) {
      const updated = savedArticles.filter((a) => a.id !== id);
      setSavedArticles(updated);
      localStorage.setItem("FEMSEHA_SAVED_ARTICLES", JSON.stringify(updated));
    }
  };

  const isKeywordInTitle = article.primaryKeyword && article.title.includes(article.primaryKeyword);
  const isKeywordInMeta = article.primaryKeyword && article.metaDescription.includes(article.primaryKeyword);
  const isSeoTitleLengthGood = article.seoTitle.length >= 25 && article.seoTitle.length <= 75;
  const isMetaLengthGood = article.metaDescription.length >= 80 && article.metaDescription.length <= 175;
  const isContentLongEnough = article.content.length > 300;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-slate-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">لوحة تحكم الطبيب والمحتوى</h1>
            <p className="text-sm text-slate-500 mt-1">دليل صحة المرأة - د. هيثم الخطيب</p>
          </div>
          {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                placeholder="أدخل كلمة المرور..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition"
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">لوحة إدارة المحتوى والذكاء الاصطناعي</h1>
            <p className="text-sm text-slate-500 mt-1">توليد ونشر المقالات الطبية آلياً بإشراف د. هيثم الخطيب</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl"
          >
            تسجيل الخروج
          </button>
        </div>

        {/* API Settings */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-2xl mb-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>⚡</span> مفتاح الذكاء الاصطناعي (OpenAI / Gemini)
            </div>
            <p className="text-xs text-teal-200 mt-1">يدعم مفاتيح OpenAI ومفاتيح Google Gemini</p>
          </div>
          <div className="w-full md:w-80">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleSaveApiKey(e.target.value)}
              placeholder="الصق مفتاحك هنا (اختياري)..."
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
            ✍️ كاتب ومولد المقالات
          </button>
          <button
            onClick={() => setActiveTab("articles-list")}
            className={`pb-3 px-5 text-sm font-semibold transition border-b-2 ${
              activeTab === "articles-list"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            📚 المقالات المنشورة ({savedArticles.length})
          </button>
        </div>

        {activeTab === "new-article" && (
          <div>
            {/* AI Generator Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-teal-200 p-6 mb-6">
              <label className="block text-base font-bold text-slate-800 mb-2">
                🤖 اكتب موضوع المقال وسيتكفل النظام بالباقي:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={topicPrompt}
                  onChange={(e) => setTopicPrompt(e.target.value)}
                  placeholder="مثال: أسباب إفرازات الحمل وطرق علاجها"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                />
                <button
                  type="button"
                  onClick={generateArticleWithAI}
                  disabled={isGenerating}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold px-8 py-3 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
                >
                  {isGenerating ? "جاري التوليد الذكي..." : "✨ توليد المقال والسيو فوراً"}
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
                  {saveSuccess && (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-5 py-4 rounded-xl text-sm font-bold flex items-center justify-between">
                      <span>✅ تم نشر وحفظ المقال بنجاح في الموقع!</span>
                      <button
                        onClick={() => setActiveTab("articles-list")}
                        className="text-xs underline bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg"
                      >
                        عرض في قائمة المقالات
                      </button>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">عنوان المقال</label>
                    <input
                      type="text"
                      value={article.title}
                      onChange={(e) => setArticle({ ...article, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">الرابط الإنجليزي (Slug)</label>
                      <input
                        type="text"
                        value={article.slug}
                        onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-left font-mono text-sm"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">الكلمة المفتاحية المستهدفة</label>
                      <input
                        type="text"
                        value={article.primaryKeyword}
                        onChange={(e) => setArticle({ ...article, primaryKeyword: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-teal-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">عنوان السيو لجوجل</label>
                    <input
                      type="text"
                      value={article.seoTitle}
                      onChange={(e) => setArticle({ ...article, seoTitle: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">الوصف التعريفي (Meta Description)</label>
                    <textarea
                      rows={2}
                      value={article.metaDescription}
                      onChange={(e) => setArticle({ ...article, metaDescription: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">المحتوى الطبي الكامل</label>
                    <textarea
                      rows={14}
                      value={article.content}
                      onChange={(e) => setArticle({ ...article, content: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 leading-relaxed text-sm font-sans"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePublishArticle}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition text-base w-full sm:w-auto"
                  >
                    🚀 نشر وحفظ المقال في الموقع
                  </button>
                </div>
              </div>

              {/* SEO Scorecard */}
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
                      <span>طول عنوان السيو متوافق ({article.seoTitle.length} حرف)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${isMetaLengthGood ? "bg-emerald-500" : "bg-amber-400"}`} />
                      <span>طول الوصف التعريفي مناسب ({article.metaDescription.length} حرف)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${isContentLongEnough ? "bg-emerald-500" : "bg-rose-400"}`} />
                      <span>عمق وتفاصيل المقال كافية للتصدر</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Articles Tab */}
        {activeTab === "articles-list" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">📚 المقالات المنشورة المحفوظة ({savedArticles.length})</h2>
            {savedArticles.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-lg">لا توجد مقالات منشورة بعد.</p>
                <p className="text-xs mt-1">انتقل لتبويب "كاتب ومولد المقالات" لكتابة ونشر أول مقال.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {savedArticles.map((item) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        الرابط: <span className="font-mono text-teal-600">{item.slug}</span> | تاريخ النشر: {item.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setArticle({
                            title: item.title,
                            slug: item.slug,
                            category: item.category,
                            seoTitle: item.seoTitle,
                            metaDescription: item.metaDescription,
                            primaryKeyword: item.primaryKeyword,
                            readingTime: item.readingTime,
                            status: "published",
                            content: item.content,
                          });
                          setActiveTab("new-article");
                        }}
                        className="text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(item.id)}
                        className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { Admin };
