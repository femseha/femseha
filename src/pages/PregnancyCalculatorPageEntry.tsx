import { lazy, type ComponentType } from "react";

const modules = import.meta.glob("./PregnancyCalculatorPage.tsx", {
  import: "default",
  eager: import.meta.env.SSR
}) as Record<string, ComponentType>;

const StaticPage = modules["./PregnancyCalculatorPage.tsx"];
const Page = import.meta.env.SSR ? StaticPage : lazy(() => import("./PregnancyCalculatorPage.tsx"));

export default Page;
