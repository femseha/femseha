#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "public", "image-sitemap.xml");

const SITE = "https://femseha.com";

const imageMappings = [
  {
    slug: "cytotec-misoprostol-saudi-riyadh-guide",
    image: "saudi-cytotec-medical-guide.webp",
    title: "دليل طبي حول سايتوتك وميزوبروستول في السعودية",
    caption: "معلومات طبية وتوعوية حول سايتوتك وميزوبروستول في السعودية.",
  },
  {
    slug: "ijhad-dawai-fi-al-saudia",
    image: "saudi-cytotec-doctor-consultation.webp",
    title: "استشارة طبية حول الإجهاض الدوائي في السعودية",
    caption: "معلومات توعوية عن التقييم الطبي والإجهاض الدوائي.",
  },
  {
    slug: "adwiyat-ijhad-alhaml-fi-al-saudia",
    image: "cytotec-misoprostol-saudi-guide.webp",
    title: "معلومات طبية عن أدوية الإجهاض وميزوبروستول في السعودية",
    caption: "دليل طبي يشرح أهمية التقييم المتخصص ومخاطر الاستخدام الذاتي.",
  },
  {
    slug: "danger-signs-after-medical-abortion-saudi",
    image: "cytotec-medical-safety-warning-saudi.webp",
    title: "علامات الخطر والتحذيرات الطبية بعد الإجهاض الدوائي",
    caption: "علامات تستدعي الانتباه والتقييم الطبي العاجل عند الحاجة.",
  },
  {
    slug: "bleeding-after-medical-abortion-saudi",
    image: "saudi-cytotec-safety-guide.webp",
    title: "إرشادات السلامة الطبية حول النزيف بعد الإجهاض الدوائي",
    caption: "معلومات توعوية حول النزيف ومتى يلزم طلب الرعاية الطبية.",
  },
  {
    slug: "ectopic-pregnancy-abortion-medicines-saudi",
    image: "cytotec-misoprostol-medical-information.webp",
    title: "معلومات طبية عن الحمل خارج الرحم ومخاطر أدوية الإجهاض",
    caption: "أهمية استبعاد الحمل خارج الرحم قبل أي قرار علاجي.",
  },
  {
    slug: "pregnancy-danger-signs-emergency",
    image: "cytotec-medical-consultation-saudi.webp",
    title: "استشارة طبية حول علامات الخطر أثناء الحمل",
    caption: "دليل توعوي لعلامات الخطر التي قد تستدعي رعاية طبية عاجلة.",
  },
  {
    slug: "home-pregnancy-test-accuracy",
    image: "saudi-medical-cytotec-consultation.webp",
    title: "استشارة طبية حول اختبار الحمل وتفسير النتائج",
    caption: "معلومات طبية حول توقيت اختبار الحمل وتفسير النتائج.",
  },
  {
    slug: "early-pregnancy-symptoms-guide",
    image: "saudi-womens-health-medical-consultation.webp",
    title: "استشارة طبية حول أعراض الحمل المبكرة وصحة المرأة",
    caption: "دليل توعوي حول أعراض الحمل المبكرة والتمييز بينها وبين أعراض الدورة.",
  },
];

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const urls = imageMappings
  .filter(({ image }) => fs.existsSync(path.join(ROOT, "public", "images", "seo", image)))
  .map(({ slug, image, title, caption }) => `  <url>
    <loc>${SITE}/articles/${slug}</loc>
    <image:image>
      <image:loc>${SITE}/images/seo/${image}</image:loc>
      <image:title>${escapeXml(title)}</image:title>
      <image:caption>${escapeXml(caption)}</image:caption>
    </image:image>
  </url>`)
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;

fs.writeFileSync(OUTPUT, xml, "utf8");
console.log(`Image sitemap generated: ${urls ? imageMappings.length : 0} approved article-image mappings.`);
