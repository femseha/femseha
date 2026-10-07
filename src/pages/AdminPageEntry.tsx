import { lazy, type ComponentType } from "react";

const modules = import.meta.glob("./AdminPage.tsx", {
  import: "default",
  eager: import.meta.env.SSR
}) as Record<string, ComponentType>;

const StaticPage = modules["./AdminPage.tsx"];
const AdminPage = import.meta.env.SSR
  ? StaticPage
  : lazy(() => import("./AdminPage.tsx"));

export default AdminPage;
