#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "src", "data", "seo-content-batch-05.json");
const articles = JSON.parse(fs.readFileSync(file, "utf8"));
const article = articles.find((item) => item.slug === "gestational-diabetes-guide");
if (!article) throw new Error("مقال سكري الحمل غير موجود");
if (article.primaryKeyword !== "سكري الحمل") throw new Error("الكلمة الأساسية للمقال غير صحيحة");
if (article.slug !== "gestational-diabetes-guide") throw new Error("slug غير صحيح");
if (!article.content.includes("الأسبوع 24 إلى الأسبوع 28")) throw new Error("موعد الفحص غير موثق في المحتوى");
if (!article.content.includes("بعد الولادة")) throw new Error("المتابعة بعد الولادة غير موثقة");
const unsafe = [/اطلب الآن/, /للطلب والشراء/, /متوفر للبيع/, /سعر خاص/, /رابط شراء/, /جرعة\s+\d+/i, /\d+\s*(?:mg|mcg|ملغ|ميكروغرام)/i];
for (const re of unsafe) if (re.test(article.content)) throw new Error(`نمط غير آمن في المقال: ${re}`);
console.log("Gestational diabetes content audit: PASS");
