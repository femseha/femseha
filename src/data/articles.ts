import type { Article } from "./types";
import { GENERATED_ARTICLES } from "./generated-articles";

// تصدير المقالات بالشكلين لضمان توافق جميع الصفحات (Home و Articles وغيرها) دون أي أخطاء بناء
export const articles: Article[] = GENERATED_ARTICLES;
export const ARTICLES: Article[] = GENERATED_ARTICLES;
export { GENERATED_ARTICLES };
