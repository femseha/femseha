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
