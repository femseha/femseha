import { lazy, type ComponentType } from "react";

const modules = import.meta.glob("./ConsultationPage.tsx", {
  import: "default",
  eager: import.meta.env.SSR
}) as Record<string, ComponentType>;

const StaticPage = modules["./ConsultationPage.tsx"];
const Page = import.meta.env.SSR ? StaticPage : lazy(() => import("./ConsultationPage.tsx"));

export default Page;
