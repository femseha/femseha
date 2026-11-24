import { lazy, type ComponentType } from "react";

const modules = import.meta.glob("./DoctorPage.tsx", {
  import: "default",
  eager: import.meta.env.SSR
}) as Record<string, ComponentType>;

const StaticPage = modules["./DoctorPage.tsx"];
const Page = import.meta.env.SSR ? StaticPage : lazy(() => import("./DoctorPage.tsx"));

export default Page;
