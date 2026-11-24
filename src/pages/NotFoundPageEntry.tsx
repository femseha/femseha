import { lazy, type ComponentType } from "react";

const modules = import.meta.glob("./NotFoundPage.tsx", {
  import: "default",
  eager: import.meta.env.SSR
}) as Record<string, ComponentType>;

const StaticPage = modules["./NotFoundPage.tsx"];
const Page = import.meta.env.SSR ? StaticPage : lazy(() => import("./NotFoundPage.tsx"));

export default Page;
