import React, { useState } from "react";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"new-article" | "articles-list" | "doctor-profile">("new-article");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // بيانات المقال الجديد
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
    excerpt: "",
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
    // كلمة المرور الافتراضية
    if (password === "DrHaitham2026!" || password === "admin123") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.");
    }
  };

  const handleArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

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
            <h1 className="text-2xl font-bold text-slate-900">لوحة إدارة المحتوى الطبي والسيو</h1>
            <p className="text-sm text-slate-500 mt-1">تحكم في مقالات المنصة، إعدادات الأرشفة والملف التعريفي</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-sm bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 px-4 py-2 rounded-lg transition"
          >
            تسجيل الخروج
          </button>
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
            ✍️ كتابة مقال جديد
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
            🩺 بيانات الطبيب والتواصل
          </button>
        </div>

        {/* Tab 1: New Article */}
        {activeTab === "new-article" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8">
            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <span>✅</span> تم حفظ وتجهيز المقال بنجاح!
              </div>
            )}

            <form onSubmit={handleArticleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">عنوان المقال الرئيسي</label>
                  <input
                    type="text"
                    value={article.title}
                    onChange={(e) => setArticle({ ...article, title: e.target.value })}
                    placeholder="مثال: أعراض الحمل المبكرة وأهم الفحوصات اللازمة"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الرابط اللطيف (Slug بالإنجليزية)</label>
                  <input
                    type="text"
                    value={article.slug}
                    onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                    placeholder="مثال: early-pregnancy-symptoms"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-left font-mono text-sm"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">القسم الطبي</label>
                  <select
                    value={article.category}
                    onChange={(e) => setArticle({ ...article, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="womens-health">صحة المرأة</option>
                    <option value="pregnancy">الحمل والولادة</option>
                    <option value="medications">الأدوية والتثقيف الدوائي</option>
                    <option value="delayed-period">تأخر الدورة الشهرية</option>
                    <option value="pregnancy-test">اختبارات الحمل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الكلمة المفتاحية الرئيسية (SEO)</label>
                  <input
                    type="text"
                    value={article.primaryKeyword}
                    onChange={(e) => setArticle({ ...article, primaryKeyword: e.target.value })}
                    placeholder="مثال: اعراض الحمل المبكرة"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">حالة النشر</label>
                  <select
                    value={article.status}
                    onChange={(e) => setArticle({ ...article, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="published">منشور فوراً (Published)</option>
                    <option value="draft">مسودة للمراجعة (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>🔍</span> إعدادات محركات البحث و Google (SEO)
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">عنوان الـ SEO في جوجل</label>
                  <input
                    type="text"
                    value={article.seoTitle}
                    onChange={(e) => setArticle({ ...article, seoTitle: e.target.value })}
                    placeholder="عنوان جذاب يظهر في نتائج البحث (أقل من 60 حرف)"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">الوصف التعريفي (Meta Description)</label>
                  <textarea
                    rows={2}
                    value={article.metaDescription}
                    onChange={(e) => setArticle({ ...article, metaDescription: e.target.value })}
                    placeholder="ملخص طبي من 150 حرف يظهر تحت الرابط في محرك البحث لجذب الزوار..."
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">نص المقال الطبي بالكامل</label>
                <textarea
                  rows={10}
                  value={article.content}
                  onChange={(e) => setArticle({ ...article, content: e.target.value })}
                  placeholder="اكتب المحتوى الطبي هنا بالتفصيل، العناوين الفرعية، والملاحظات الطبية التوعوية..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-xl transition duration-200 shadow-md"
              >
                نشر وحفظ المقال
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Articles List */}
        {activeTab === "articles-list" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-sm">
                    <th className="py-3 px-4">عنوان المقال</th>
                    <th className="py-3 px-4">القسم</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                  <tr>
                    <td className="py-4 px-4 font-medium">أعراض الحمل المبكرة وكيفية التعامل معها</td>
                    <td className="py-4 px-4 text-slate-500">الحمل والولادة</td>
                    <td className="py-4 px-4">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">منشور</span>
                    </td>
                    <td className="py-4 px-4 text-center space-x-2 space-x-reverse">
                      <button className="text-teal-600 hover:underline">تعديل</button>
                      <button className="text-rose-600 hover:underline">حذف</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">دليل الفحوصات الدورية لصحة المرأة</td>
                    <td className="py-4 px-4 text-slate-500">صحة المرأة</td>
                    <td className="py-4 px-4">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">منشور</span>
                    </td>
                    <td className="py-4 px-4 text-center space-x-2 space-x-reverse">
                      <button className="text-teal-600 hover:underline">تعديل</button>
                      <button className="text-rose-600 hover:underline">حذف</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Doctor Profile */}
        {activeTab === "doctor-profile" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 max-w-2xl">
            <form onSubmit={(e) => { e.preventDefault(); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 4000); }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">اسم الطبيب</label>
                <input
                  type="text"
                  value={doctor.name}
                  onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">المسمى الوظيفي والدرجة</label>
                <input
                  type="text"
                  value={doctor.title}
                  onChange={(e) => setDoctor({ ...doctor, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف / الواتساب للاستشارات</label>
                <input
                  type="text"
                  value={doctor.phone}
                  onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-left font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">النبذة التعريفية</label>
                <textarea
                  rows={4}
                  value={doctor.bio}
                  onChange={(e) => setDoctor({ ...doctor, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl transition"
              >
                حفظ بيانات الطبيب
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
