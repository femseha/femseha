import { lazy } from "react";

const modules = import.meta.glob("./ArticleView.tsx", {
  import: "default",
  eager: import.meta.env.SSR
});

const StaticPage = modules["./ArticleView.tsx"] as typeof import("./ArticleView.tsx")["default"];
const ArticleView = import.meta.env.SSR
  ? StaticPage
  : lazy(() => import("./ArticleView.tsx"));

export default ArticleView;
