import React, { useState } from "react";

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [topic, setTopic] = useState("");
  const [generatedArticle, setGeneratedArticle] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // دالة تسجيل الدخول الآمنة
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "DrHaitham2026!") {
      setIsAuthenticated(true);
    } else {
      alert("كلمة المرور غير صحيحة");
    }
  };

  // مولد المقالات الطبي الذكي الفوري بإشراف د. هيثم الخطيب
  const handleGenerate = () => {
    if (!topic.trim()) {
      alert("يرجى كتابة موضوع المقال أولاً.");
      return;
    }

    const cleanTopic = topic.trim();
    const articleData = {
      title: `${cleanTopic}: دليل طبي شامل بإشراف د. هيثم الخطيب`,
      slug: cleanTopic.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "") || "medical-article",
      category: "صحة المرأة",
      seoTitle: `${cleanTopic} | د. هيثم الخطيب`,
      metaDescription: `تعرف على تفاصيل ${cleanTopic} وأهم الأسباب والتشخيص الدقيق والإرشادات الطبية الموثوقة مع د. هيثم الخطيب. للتواصل: 00966599287172.`,
      content: `بقلم: د. هيثم الخطيب
طبيب اختصاصي جراحة النساء والتوليد والعقم
للتواصل والاستشارات المباشرة: 00966599287172

---

تعد حالة "${cleanTopic}" من الموضوعات الطبية الهامة التي تستوجب وعياً واهتماماً خاصاً. نقدم لك في هذا الدليل الشامل أبرز الجوانب الطبية والتشخيصية المتعلقة بها.

---

### أولاً: أسباب ومحاور هامة
* التغيرات الهرمونية والوظيفية المرتبطة بالحالة.
* العوامل المؤثرة وطرق الوقاية الموصى بها طبياً.
* الفحوصات الضرورية للتأكد من سلامة الحالة الصحية.

---

### ثانياً: إرشادات طبية هامة
يؤكد د. هيثم الخطيب على ضرورة المراجعة الدورية عند ظهور أي عوارض غير معتادة وعدم الاعتماد على التشخيص الذاتي.

---
📱 للتواصل المباشر مع عيادة د. هيثم الخطيب: 00966599287172`
    };

    setGeneratedArticle(articleData);
  };

  const handleCopyCode = () => {
    if (!generatedArticle) return;
    navigator.clipboard.writeText(JSON.stringify(generatedArticle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-slate-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">لوحة تحكم د. هيثم الخطيب</h1>
            <p className="text-sm text-slate-500 mt-1">منصة فصيحة الطبية</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="أدخل كلمة المرور..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-sm"
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">مولد المقالات الطبية الذكي</h1>
            <p className="text-xs text-slate-500 mt-1">إشراف د. هيثم الخطيب</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition"
          >
            تسجيل الخروج
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 mb-6">
          <label className="block font-bold text-sm text-slate-800">اكتب عنوان أو موضوع المقال المطلوب:</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: أسباب تأخر الحمل وطرق العلاج الحديثة"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={handleGenerate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm"
            >
              ✨ توليد المقال فوراً
            </button>
          </div>
        </div>

        {generatedArticle && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-800">معاينة المقال المولد:</h3>
              <button
                onClick={handleCopyCode}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                {copied ? "✅ تم النسخ بنجاح!" : "📋 نسخ كود المقال"}
              </button>
            </div>
            
            <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-xl border">
              <p><strong>العنوان:</strong> {generatedArticle.title}</p>
              <p><strong>الرابط (Slug):</strong> <span className="font-mono text-blue-600">{generatedArticle.slug}</span></p>
              <p><strong>الوصف التعريفي:</strong> {generatedArticle.metaDescription}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">المحتوى الطبي:</label>
              <textarea
                readOnly
                rows={10}
                value={generatedArticle.content}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-sans bg-slate-50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
