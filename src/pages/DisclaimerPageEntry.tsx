import { lazy, type ComponentType } from "react";

const modules = import.meta.glob("./DisclaimerPage.tsx", {
  import: "default",
  eager: import.meta.env.SSR
}) as Record<string, ComponentType>;

const StaticPage = modules["./DisclaimerPage.tsx"];
const Page = import.meta.env.SSR ? StaticPage : lazy(() => import("./DisclaimerPage.tsx"));

export default Page;
