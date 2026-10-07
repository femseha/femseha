import { lazy, type ComponentType } from "react";

const modules = import.meta.glob("./ArticleView.tsx", {
  import: "default",
  eager: import.meta.env.SSR
}) as Record<string, ComponentType>;

const StaticPage = modules["./ArticleView.tsx"];
const ArticleView = import.meta.env.SSR
  ? StaticPage
  : lazy(() => import("./ArticleView.tsx"));

export default ArticleView;
