export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "warning"; title: string; items: string[] }
  | { type: "note"; text: string };

export type SourceRef = {
  publisher: string;
  title: string;
  url: string;
};

export type Crumb = { name: string; href: string };

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categoryHref: string;
  primaryKeyword: string;
  author: string;
  medicalReviewer: string | null;
  datePublished: string;
  dateModified: string;
  readingTime: number;
  content: Block[];
  sources: SourceRef[];
  relatedArticles: string[];
};

/**
 * سجل المقال المنشور — الشكل المعتمد في src/data/articles.json
 * وهو المصدر الوحيد لبيانات المقالات على الموقع العام.
 * يحدّثه خط النشر الآلي scripts/generate-article.js بعد اجتياز جميع الفحوصات.
 */
export type ArticleRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  summary: string;
  publishDate: string;
  /** تاريخ آخر تعديل حقيقي للمقال (اختياري). لا يُملأ تلقائياً بتاريخ النشر؛
   *  يُضاف فقط عند إجراء تعديل فعلي على محتوى المقال. */
  modifiedDate?: string;
  readTime: number;
  content: string;
  primaryKeyword?: string;
  /** كلمات مفتاحية مساندة اختيارية أُدخلت من لوحة الإدارة (بيانات فقط — لا تُحقن
   *  في أي وسم meta؛ وسوم المقالات وSEO الخاص بها كما هي دون تغيير). */
  secondaryKeywords?: string[];
  /** رمز الدولة/السوق المستهدف (sa|ae|kw|bh|qa|om) — انظر src/data/countries.json.
   *  اختياري: غيابه = مقال عام غير مرتبط بسوق محدد (كل المقالات الحالية عامة). */
  country?: string;
  image?: string;
  faq?: { q: string; a: string }[];
  sources?: SourceRef[];
  related?: string[];
};

export type TopicPage = {
  slug: string;
  path: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  intro: string;
  breadcrumbs: Crumb[];
  content: Block[];
  quickFacts?: { label: string; value: string }[];
  sources: SourceRef[];
  relatedTopics: { label: string; href: string; description: string }[];
  articleSlugs: string[];
};
