import React, { useState, useEffect } from "react";
import { useSeo } from "@/lib/seo";

const ADMIN_PIN = "DrHaitham2026!";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [article, setArticle] = useState({
    title: "", slug: "", category: "womens-health", seoTitle: "",
    metaDescription: "", primaryKeyword: "", content: "",
  });

  const isKeywordInTitle = article.primaryKeyword && article.title.includes(article.primaryKeyword);
  const isKeywordInMeta = article.primaryKeyword && article.metaDescription.includes(article.primaryKeyword);
  const isSeoTitleLengthGood = article.seoTitle.length >= 25 && article.seoTitle.length <= 75;
  const isMetaLengthGood = article.metaDescription.length >= 80 && article.metaDescription.length <= 175;
  const isContentLongEnough = article.content.length > 500;

  const handlePublishArticle = () => {
    if (!article.title || !article.content) { alert("أكمل البيانات أولاً"); return; }
    const newArticleItem = { ...article, date: new Date().toISOString().split("T")[0] };
    const articleCode = JSON.stringify(newArticleItem, null, 2);
    navigator.clipboard.writeText(articleCode);
    alert("تم نسخ كود المقال! الصقه في articles.ts");
  };

  if (!isAuthenticated) {
    return (
      <div className="p-10 text-center" dir="rtl">
        <input type="password" placeholder="كلمة المرور" onChange={(e) => setPassword(e.target.value)} className="p-3 border rounded-xl" />
        <button onClick={() => password === ADMIN_PIN ? setIsAuthenticated(true) : alert("خطأ")} className="bg-teal-600 text-white p-3 rounded-xl mr-2">دخول</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8" dir="rtl">
      <div className="lg:col-span-2 space-y-4">
        <input placeholder="عنوان المقال" value={article.title} onChange={(e) => setArticle({...article, title: e.target.value})} className="w-full p-3 border rounded-xl" />
        <input placeholder="الكلمة المفتاحية" value={article.primaryKeyword} onChange={(e) => setArticle({...article, primaryKeyword: e.target.value})} className="w-full p-3 border rounded-xl" />
        <input placeholder="عنوان السيو" value={article.seoTitle} onChange={(e) => setArticle({...article, seoTitle: e.target.value})} className="w-full p-3 border rounded-xl" />
        <textarea placeholder="الوصف التعريفي" value={article.metaDescription} onChange={(e) => setArticle({...article, metaDescription: e.target.value})} className="w-full p-3 border rounded-xl" />
        <textarea placeholder="المحتوى الطبي" value={article.content} onChange={(e) => setArticle({...article, content: e.target.value})} className="w-full p-6 border rounded-xl h-96" />
        <button onClick={handlePublishArticle} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold">🚀 نشر وحفظ المقال</button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-teal-200 h-fit sticky top-6">
        <h3 className="font-bold mb-4">📊 فاحص السيو المباشر</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isKeywordInTitle ? "bg-emerald-500" : "bg-rose-400"}`} /> الكلمة في العنوان
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isKeywordInMeta ? "bg-emerald-500" : "bg-rose-400"}`} /> الكلمة في الوصف
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isSeoTitleLengthGood ? "bg-emerald-500" : "bg-amber-400"}`} /> طول عنوان السيو
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isMetaLengthGood ? "bg-emerald-500" : "bg-amber-400"}`} /> طول الوصف التعريفي
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isContentLongEnough ? "bg-emerald-500" : "bg-rose-400"}`} /> عمق المحتوى
          </div>
        </div>
      </div>
    </div>
  );
}
