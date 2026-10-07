import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve('public');
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const sourceFiles = (await walk(ROOT)).filter((file) => EXTENSIONS.has(path.extname(file).toLowerCase()));
let converted = 0;
for (const source of sourceFiles) {
  const ext = path.extname(source);
  const target = source.slice(0, -ext.length) + '.webp';
  if (await fs.stat(target).then(() => true).catch(() => false)) continue;
  await sharp(source).webp({ quality: 82, effort: 4 }).toFile(target);
  converted += 1;
  console.log(`WebP: ${path.relative(process.cwd(), source)} -> ${path.relative(process.cwd(), target)}`);
}
console.log(`WebP conversion complete: ${converted} new files.`);
