import React, { useState, useEffect, useMemo } from "react";
import { useSeo } from "@/lib/seo";
import { ARTICLES } from "@/data/articles";

const ADMIN_PIN = "DrHaitham2026!";

export default function Admin() {
  useSeo({
    title: "لوحة الإدارة والتحكم | د. هيثم الخطيب",
    description: "إدارة ونشر المحتوى الطبي",
    path: "/admin",
    robots: "noindex, nofollow",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"new-article" | "articles-list">("new-article");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("AI_API_KEY") || "");
  const [topicPrompt, setTopicPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [article, setArticle] = useState({
    title: "",
    slug: "",
    category: "womens-health",
    seoTitle: "",
    metaDescription: "",
    primaryKeyword: "",
    readingTime: 6,
    content: "",
  });
  const [savedArticles, setSavedArticles] = useState<any[]>([]);

  useEffect(() => {
    const loaded = localStorage.getItem("FEMSEHA_SAVED_ARTICLES");
    if (loaded) setSavedArticles(JSON.parse(loaded));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PIN) {
      setIsAuthenticated(true);
    } else {
      setError("كلمة المرور غير صحيحة");
    }
  };

  const handlePublishArticle = () => {
    if (!article.title || !article.content) {
      alert("يرجى التأكد من وجود عنوان ومحتوى للمقال قبل النشر.");
      return;
    }

    const newArticleItem = {
      slug: article.slug || `art-${Date.now()}`,
      title: article.title,
      excerpt: article.metaDescription,
      category: article.category === "womens-health" ? "صحة المرأة" : "الأدوية",
      categoryHref: `/${article.category}`,
      primaryKeyword: article.primaryKeyword,
      author: "فريق تحرير دليل صحة المرأة",
      medicalReviewer: "د. هيثم الخطيب",
      datePublished: new Date().toISOString().split("T")[0],
      dateModified: new Date().toISOString().split("T")[0],
      readingTime: article.readingTime || 5,
      content: article.content
    };

    const articleCode = JSON.stringify(newArticleItem, null, 2);
    navigator.clipboard.writeText(articleCode);
    
    alert("تم نسخ كود المقال! اذهب الآن لملف 'articles.ts' في جيت هب والصق الكود داخل المصفوفة، ثم احفظ الملف.");

    const updated = [newArticleItem, ...savedArticles];
    setSavedArticles(updated);
    localStorage.setItem("FEMSEHA_SAVED_ARTICLES", JSON.stringify(updated));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 5000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-slate-200">
          <h1 className="text-xl font-bold text-center mb-6">دخول لوحة تحكم د. هيثم الخطيب</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="كلمة المرور" />
            <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold">دخول</button>
          </form>
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold">لوحة الإدارة - د. هيثم الخطيب</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm text-slate-500 underline">خروج</button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <label className="block font-bold">عنوان المقال</label>
          <input type="text" value={article.title} onChange={(e) => setArticle({...article, title: e.target.value})} className="w-full p-3 border rounded-xl" />
          
          <label className="block font-bold">المحتوى</label>
          <textarea rows={10} value={article.content} onChange={(e) => setArticle({...article, content: e.target.value})} className="w-full p-3 border rounded-xl" />

          <button onClick={handlePublishArticle} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg">
            🚀 نشر وحفظ المقال (نسخ الكود تلقائياً)
          </button>
        </div>
      </div>
    </div>
  );
}
