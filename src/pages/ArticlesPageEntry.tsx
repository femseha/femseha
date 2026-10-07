import { lazy } from "react";

const modules = import.meta.glob("./ArticlesPage.tsx", {
  import: "default",
  eager: import.meta.env.SSR
});

const StaticPage = modules["./ArticlesPage.tsx"] as typeof import("./ArticlesPage.tsx")["default"];
const ArticlesPage = import.meta.env.SSR
  ? StaticPage
  : lazy(() => import("./ArticlesPage.tsx"));

export default ArticlesPage;
