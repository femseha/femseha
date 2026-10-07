import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const variants = [
  { source: 'public/images/dr-haitham-hero.webp', widths: [768, 1200, 1408], quality: 76 },
  { source: 'public/saudi-cytotec-logo.webp', widths: [96], quality: 70 },
];

for (const { source, widths, quality } of variants) {
  for (const width of widths) {
    const ext = path.extname(source);
    const base = source.slice(0, -ext.length);
    const target = `${base}-${width}w.webp`;
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality, effort: 6 }).toFile(target);
    console.log(`Responsive WebP: ${source} -> ${target}`);
  }
}
