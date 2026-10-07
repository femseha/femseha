import { lazy } from "react";

const modules = import.meta.glob("./AdminPage.tsx", {
  import: "default",
  eager: import.meta.env.SSR
});

const StaticPage = modules["./AdminPage.tsx"] as typeof import("./AdminPage.tsx")["default"];
const AdminPage = import.meta.env.SSR
  ? StaticPage
  : lazy(() => import("./AdminPage.tsx"));

export default AdminPage;
