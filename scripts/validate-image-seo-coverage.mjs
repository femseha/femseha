#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITEMAP = path.join(ROOT, "public", "image-sitemap.xml");

if (!fs.existsSync(SITEMAP)) throw new Error("image-sitemap.xml missing");
const xml = fs.readFileSync(SITEMAP, "utf8");
const mappings = (xml.match(/<image:loc>/g) || []).length;
console.log(`Image SEO staging check OK: ${mappings} approved image mappings currently published.`);
console.log("Synthetic article images are disabled until the approved image set is uploaded.");
