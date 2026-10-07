import { lazy } from "react";
import StaticArticleView from "./ArticleView";

const ArticleView = import.meta.env.SSR ? StaticArticleView : lazy(() => import("./ArticleView"));
export default ArticleView;
