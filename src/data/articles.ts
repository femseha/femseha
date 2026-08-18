import articlesData from './articles.json';

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryName?: string;
  summary: string;
  publishDate: string;
  readTime?: number;
  content: string;
  image?: string;
}

export const articles: Article[] = articlesData as Article[];
