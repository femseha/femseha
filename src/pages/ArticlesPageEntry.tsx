import { lazy } from "react";
import StaticArticlesPage from "./ArticlesPage";

const ArticlesPage = import.meta.env.SSR ? StaticArticlesPage : lazy(() => import("./ArticlesPage"));
export default ArticlesPage;
