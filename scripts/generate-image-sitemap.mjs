#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "public", "image-sitemap.xml");
const SITE = "https://femseha.com";

const imageMappings = [
  ["/cytotec-saudi-arabia","saudi-cytotec-medical-guide.webp","دليل طبي حول سايتوتك وميزوبروستول في السعودية","معلومات طبية وتوعوية حول سايتوتك وميزوبروستول في السعودية."],
  ["/articles/ijhad-dawai-fi-al-saudia","saudi-cytotec-doctor-consultation.webp","استشارة طبية حول الإجهاض الدوائي في السعودية","معلومات توعوية عن التقييم الطبي والإجهاض الدوائي."],
  ["/articles/adwiyat-ijhad-alhaml-fi-al-saudia","cytotec-misoprostol-saudi-guide.webp","معلومات طبية عن أدوية الإجهاض وميزوبروستول في السعودية","دليل طبي يشرح أهمية التقييم المتخصص ومخاطر الاستخدام الذاتي."],
  ["/articles/danger-signs-after-medical-abortion-saudi","cytotec-medical-safety-warning-saudi.webp","علامات الخطر والتحذيرات الطبية بعد الإجهاض الدوائي","علامات تستدعي الانتباه والتقييم الطبي العاجل عند الحاجة."],
  ["/articles/bleeding-after-medical-abortion-saudi","saudi-cytotec-safety-guide.webp","إرشادات السلامة الطبية حول النزيف بعد الإجهاض الدوائي","معلومات توعوية حول النزيف ومتى يلزم طلب الرعاية الطبية."],
  ["/articles/ectopic-pregnancy-abortion-medicines-saudi","cytotec-misoprostol-medical-information.webp","معلومات طبية عن الحمل خارج الرحم ومخاطر أدوية الإجهاض","أهمية استبعاد الحمل خارج الرحم قبل أي قرار علاجي."],
  ["/articles/pregnancy-danger-signs-emergency","cytotec-medical-consultation-saudi.webp","استشارة طبية حول علامات الخطر أثناء الحمل","دليل توعوي لعلامات الخطر التي قد تستدعي رعاية طبية عاجلة."],
  ["/articles/home-pregnancy-test-accuracy","saudi-medical-cytotec-consultation.webp","استشارة طبية حول اختبار الحمل وتفسير النتائج","معلومات طبية حول توقيت اختبار الحمل وتفسير النتائج."],
  ["/articles/early-pregnancy-symptoms-guide","saudi-womens-health-medical-consultation.webp","استشارة طبية حول أعراض الحمل المبكرة وصحة المرأة","دليل توعوي حول أعراض الحمل المبكرة والتمييز بينها وبين أعراض الدورة."],
];

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&apos;");

const entries = imageMappings
  .filter(([, image]) => fs.existsSync(path.join(ROOT, "public", "images", "seo", image)))
  .map(([pagePath, image, title, caption]) => `  <url>
    <loc>${SITE}${pagePath}</loc>
    <image:image>
      <image:loc>${SITE}/images/seo/${image}</image:loc>
      <image:title>${escapeXml(title)}</image:title>
      <image:caption>${escapeXml(caption)}</image:caption>
    </image:image>
  </url>`)
  .join("\n");

fs.writeFileSync(OUTPUT, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>
`, "utf8");

console.log(`Image sitemap generated: ${entries ? imageMappings.filter(([, image]) => fs.existsSync(path.join(ROOT, "public", "images", "seo", image))).length : 0} approved article-image mappings.`);
