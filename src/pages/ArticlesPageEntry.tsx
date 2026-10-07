import { lazy, type ComponentType } from "react";

const modules = import.meta.glob("./ArticlesPage.tsx", {
  import: "default",
  eager: import.meta.env.SSR
}) as Record<string, ComponentType>;

const StaticPage = modules["./ArticlesPage.tsx"];
const ArticlesPage = import.meta.env.SSR
  ? StaticPage
  : lazy(() => import("./ArticlesPage.tsx"));

export default ArticlesPage;
