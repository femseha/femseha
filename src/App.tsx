import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import TopicPageView from "@/pages/TopicPage";
import Articles from "@/pages/Articles";
import ArticleDetail from "@/pages/ArticleDetail";
import Doctor from "@/pages/Doctor";
import Contact from "@/pages/Contact";
import Search from "@/pages/Search";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import { About, MedicalDisclaimer, MedicalReview, Privacy, Sources } from "@/pages/Static";

const TOPIC_ROUTES = [
  "womens-health",
  "pregnancy",
  "medications",
  "cytotec",
  "misoprostol",
  "abortion-medications",
  "delayed-period",
  "pregnancy-test",
  "ectopic-pregnancy",
  "ultrasound",
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* مسار لوحة التحكم */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<Admin />} />

        {/* باقي مسارات الموقع */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {TOPIC_ROUTES.map((slug) => (
            <Route key={slug} path={`/${slug}`} element={<TopicPageView slug={slug} />} />
          ))}
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/medical-review" element={<MedicalReview />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/medical-disclaimer" element={<MedicalDisclaimer />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/search" element={<Search />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
