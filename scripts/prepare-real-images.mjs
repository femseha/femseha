#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = ROOT;
const TARGET_DIR = path.join(ROOT, "public", "images", "seo");

const files = [
  "saudi-cytotec-medical-guide.webp",
  "saudi-cytotec-doctor-consultation.webp",
  "cytotec-misoprostol-saudi-guide.webp",
  "cytotec-misoprostol-medical-information.webp",
  "cytotec-medical-safety-warning-saudi.webp",
  "saudi-cytotec-safety-guide.webp",
  "cytotec-medical-consultation-saudi.webp",
  "saudi-medical-cytotec-consultation.webp",
  "saudi-womens-health-medical-consultation.webp",
];

fs.mkdirSync(TARGET_DIR, { recursive: true });

for (const file of files) {
  const source = path.join(SOURCE_DIR, file);
  const target = path.join(TARGET_DIR, file);
  if (!fs.existsSync(source)) throw new Error(`Missing approved image: ${file}`);
  fs.copyFileSync(source, target);
}

console.log(`Prepared ${files.length} real medical images in public/images/seo.`);
