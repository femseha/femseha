#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const IMG_DIR = path.join(ROOT, "public", "images", "seo", "articles");
const SITEMAP = path.join(ROOT, "public", "image-sitemap.xml");
const sources = [
  "articles.json","seo-supporting-articles.json",
  ...Array.from({length:11},(_,i)=>`seo-content-batch-${String(i+1).padStart(2,"0")}.json`)
];
const dedicated = {
  "ijhad-dawai-fi-al-saudia": "/images/seo/medical-abortion-saudi-safety-guide.svg",
  "adwiyat-ijhad-alhaml-fi-al-saudia": "/images/seo/abortion-medicines-saudi-medical-guide.svg",
  "danger-signs-after-medical-abortion-saudi": "/images/seo/danger-signs-medical-abortion-saudi.svg",
  "bleeding-after-medical-abortion-saudi": "/images/seo/bleeding-after-medical-abortion-guide.svg",
  "ectopic-pregnancy-abortion-medicines-saudi": "/images/seo/ectopic-pregnancy-abortion-medicines-guide.svg",
  "pregnancy-danger-signs-emergency": "/images/seo/pregnancy-danger-signs-saudi-guide.svg",
  "home-pregnancy-test-accuracy": "/images/seo/home-pregnancy-test-guide.svg",
  "early-pregnancy-symptoms-guide": "/images/seo/early-pregnancy-symptoms-guide.svg",
  "delayed-period-causes-besides-pregnancy": "/images/seo/delayed-period-causes-guide.svg"
};
const safe = s=>String(s).toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,100);
const articles=[];
for(const f of sources){
 const p=path.join(DATA_DIR,f); if(!fs.existsSync(p)) continue;
 for(const a of JSON.parse(fs.readFileSync(p,"utf8"))){
  if(a?.slug && !articles.some(x=>x.slug===a.slug)) articles.push(a);
 }
}
const missing=[];
for(const a of articles){
 const rel=dedicated[a.slug] || `/images/seo/articles/${safe(a.slug)}.svg`;
 if(!fs.existsSync(path.join(ROOT,"public",rel.replace(/^\//,"")))) missing.push(a.slug);
}
if(missing.length) throw new Error(`Missing SEO images for: ${missing.join(", ")}`);
if(!fs.existsSync(SITEMAP)) throw new Error("image-sitemap.xml missing");
const xml=fs.readFileSync(SITEMAP,"utf8");
const mappings=(xml.match(/<image:loc>/g)||[]).length;
if(mappings < articles.length) throw new Error(`Image sitemap has ${mappings} mappings for ${articles.length} unique articles.`);
console.log(`Image SEO coverage OK: ${articles.length} unique articles, ${mappings} article image mappings.`);
