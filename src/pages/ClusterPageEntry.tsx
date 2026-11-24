import { lazy, type ComponentType } from "react";

const modules = import.meta.glob("./ClusterPage.tsx", {
  import: "default",
  eager: import.meta.env.SSR
}) as Record<string, ComponentType>;

const StaticPage = modules["./ClusterPage.tsx"];
const Page = import.meta.env.SSR ? StaticPage : lazy(() => import("./ClusterPage.tsx"));

export default Page;
