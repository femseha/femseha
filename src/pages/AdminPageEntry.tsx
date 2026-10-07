import { lazy } from "react";
import StaticAdminPage from "./AdminPage";

const AdminPage = import.meta.env.SSR ? StaticAdminPage : lazy(() => import("./AdminPage"));
export default AdminPage;
