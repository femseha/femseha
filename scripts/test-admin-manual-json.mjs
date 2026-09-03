#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * اختبارات Manual Publish JSON round-trip + corrupted request handling
 * ─────────────────────────────────────────────────────────────────────────────
 * يغطي:
 *   A) stringify → base64 → parse ينجح مع محتوى عربي طويل
 *   B) الحقول النصية تبقى مطابقة حرفياً بعد parse
 *   C) لا bad control character داخل قيم JSON النصية
 *   D) لا Expected ',' or '}' بعد round-trip الصحيح
 *   E) الملف التالف يفشل بأمان مع اسم الملف وسبب الخطأ
 *   F) لا duplicate publish عند إعادة تشغيل المعالجة
 *
 * لا يلمس الملفات الحقيقية — يعمل داخل .self-test/manual-json فقط.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { ROOT, ARTICLES_PATH } from "./generate-article.mjs";
import { processRequests, readPendingRequests } from "./admin-publish.mjs";

let passed = 0;
let failed = 0;
const failures = [];

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  PASS  ✔ ${name}`);
  } catch (error) {
    failed += 1;
    failures.push({ name, error: error instanceof Error ? error.message : String(error) });
    console.log(`  FAIL  ✖ ${name}`);
    console.log(`        ${(error instanceof Error ? error.message : String(error)).slice(0, 220)}`);
  }
}

function utf8ToBase64(text) {
  return Buffer.from(text, "utf8").toString("base64");
}

function base64ToUtf8(text) {
  return Buffer.from(text, "base64").toString("utf8");
}

function assertStringFieldsMatch(original, candidate, fieldPath = "request") {
  if (typeof original === "string") {
    assert.equal(candidate, original, `تغيّر النص في ${fieldPath}`);
    return;
  }
  if (Array.isArray(original)) {
    assert.ok(Array.isArray(candidate), `البنية في ${fieldPath} ليست array`);
    assert.equal(candidate.length, original.length, `عدد عناصر ${fieldPath} تغيّر`);
    original.forEach((item, index) => assertStringFieldsMatch(item, candidate[index], `${fieldPath}[${index}]`));
    return;
  }
  if (original && typeof original === "object") {
    assert.ok(candidate && typeof candidate === "object" && !Array.isArray(candidate), `البنية في ${fieldPath} ليست object`);
    const keys = Object.keys(original);
    assert.deepEqual(Object.keys(candidate).sort(), keys.sort(), `مفاتيح ${fieldPath} تغيّرت`);
    for (const key of keys) {
      assertStringFieldsMatch(original[key], candidate[key], `${fieldPath}.${key}`);
    }
  }
}

function findUnescapedControlCharInStrings(jsonText) {
  let inString = false;
  let escaped = false;
  for (let i = 0; i < jsonText.length; i += 1) {
    const ch = jsonText[i];
    const code = jsonText.charCodeAt(i);
    if (!inString) {
      if (ch === '"') inString = true;
      continue;
    }
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = false;
      continue;
    }
    if (code <= 0x1f) {
      return { index: i, code, char: ch };
    }
  }
  return null;
}

function buildLongArabicContent(existingSlug) {
  const intro = [
    'هذه مقدمة عربية طويلة ومتعمدة لاختبار النشر اليدوي مع Markdown والأسطر الجديدة والروابط، وفيها اقتباس عربي «مهم» واقتباس إنجليزي "important" دون أي بناء يدوي لـ JSON.',
    `نضيف أيضاً رابطاً داخلياً صالحاً [للمراجعة الطبية](/articles/${existingSlug}) مع أقواس (توضيحية) ومربعات [معلومة] ووسم #توعية #صحة_المرأة داخل النص نفسه.`,
    'كما نؤكد أن النص تثقيفي فقط، وأن التقييم الطبي المباشر هو المرجع الصحيح عند وجود أعراض مقلقة أو تغيرات تحتاج فحصاً سريرياً.'
  ].join("\n\n");

  const sections = Array.from({ length: 52 }, (_, index) => {
    const n = index + 1;
    return [
      `### قسم تفصيلي ${n}`,
      `في هذا القسم نشرح بلغة واضحة كيف تُقرأ المعلومات الطبية بعناية، وكيف يمكن فهم السياق دون تهويل أو تبسيط مُخل. نستخدم عبارة مثل "ملاحظة تنظيمية" و«ملاحظة عربية» داخل السطر نفسه مع روابط وأقواس (توضيح ${n}) وعلامات [تنبيه] ووسم #تثقيف_${n}.`,
      `النص هنا طويل عمداً، ويحتوي على أسطر متعددة تحفظ التباعد كما كتبتها المحررة، بما في ذلك سطر جديد داخل الفقرة نفسها عند الحاجة.\nهذا السطر التالي جزء من الفقرة ذاتها لاختبار حفظ الأسطر الجديدة حرفياً بعد stringify ثم UTF-8 ثم base64 ثم decode ثم parse.`,
      `كما نضيف قائمة قصيرة:\n* نقطة أولى تشرح الفكرة العامة دون أرقام جرعات\n* نقطة ثانية تؤكد غياب الأسعار والبيع وروابط الشراء\n* نقطة ثالثة تشير إلى ضرورة الرجوع للطبيب عند وجود علامات خطر أو أسئلة فردية`,
      `وأخيراً نضيف فقرة تحتوي على رابطٍ آخر صالح: [مكتبة المقالات](/articles) مع نص عربي طويل، وذكر لعبارة Markdown مثل **تأكيد مهم** و#### عنوان فرعي ${n} داخل السياق العام.`
    ].join("\n\n");
  }).join("\n\n");

  return `${intro}\n\n${sections}`;
}

function buildManualRequest(existingSlug) {
  return {
    id: "req-manual-json-long-ar",
    mode: "manual",
    createdAt: "2026-09-04T12:00:00.000Z",
    title: "دليل عربي طويل لاختبار سلامة JSON في النشر اليدوي المباشر",
    primaryKeyword: "سلامة JSON في النشر اليدوي المباشر",
    secondaryKeywords: [
      "اختبار المحتوى العربي الطويل",
      "Markdown والأسطر الجديدة",
      "الاقتباسات العربية والإنجليزية"
    ],
    country: "ae",
    category: "general-health",
    image: null,
    slug: "manual-json-roundtrip-arabic-long-test",
    summary: "اختبار فعلي يثبت أن طلب النشر اليدوي العربي الطويل يُحفظ عبر JSON وUTF-8 وbase64 دون فساد، مع بقاء Markdown والأسطر الجديدة والروابط والاقتباسات مطابقة حرفياً.",
    content: buildLongArabicContent(existingSlug)
  };
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

console.log("\n═══ اختبارات Manual Publish JSON ═══\n");

const realArticles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8"));
const existingSlug = realArticles[0]?.slug;
if (!existingSlug) {
  throw new Error("تعذر تحديد slug منشور لاستخدامه في الروابط الداخلية داخل الاختبار.");
}

await test("A/B/C/D — stringify → UTF-8/base64 → decode → parse ينجح والنصوص تبقى حرفية", () => {
  const req = buildManualRequest(existingSlug);
  const jsonText = JSON.stringify(req, null, 2);

  const directParsed = JSON.parse(jsonText);
  assertStringFieldsMatch(req, directParsed);

  const controlChar = findUnescapedControlCharInStrings(jsonText);
  assert.equal(controlChar, null, controlChar ? `وُجد bad control character عند index=${controlChar.index}` : "");

  const base64 = utf8ToBase64(jsonText);
  const decodedText = base64ToUtf8(base64);
  assert.equal(decodedText, jsonText, "تغيّر النص بعد UTF-8/base64 round-trip");

  let decodedParsed;
  assert.doesNotThrow(() => {
    decodedParsed = JSON.parse(decodedText);
  }, /Bad control character|Expected ',' or '}'/);
  assertStringFieldsMatch(req, decodedParsed);
  assert.equal(decodedParsed.content, req.content, "المحتوى العربي الطويل لم يبقَ مطابقاً حرفياً");
  assert.ok(decodedParsed.content.includes('«مهم»'));
  assert.ok(decodedParsed.content.includes('"important"'));
  assert.ok(decodedParsed.content.includes('#توعية'));
  assert.ok(decodedParsed.content.includes('[للمراجعة الطبية]'));
});

await test("E/F — الملف التالف يفشل بأمان، والطلب الصحيح لا يُنشر مرتين", async () => {
  const tmpDir = path.join(ROOT, ".self-test", "manual-json");
  const requestsDir = path.join(tmpDir, "requests");
  const articlesPath = path.join(tmpDir, "articles.json");
  const sitemapPath = path.join(tmpDir, "sitemap.xml");
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(requestsDir, { recursive: true });
  fs.copyFileSync(ARTICLES_PATH, articlesPath);
  fs.writeFileSync(sitemapPath, "", "utf8");

  const validRequest = buildManualRequest(existingSlug);
  validRequest.id = "req-manual-json-valid";
  validRequest.slug = "manual-json-no-duplicate-publish-test";
  validRequest.primaryKeyword = "اختبار منع تكرار النشر بعد صلاحية JSON";
  validRequest.summary = "طلب يدوي طويل صالح يثبت سلامة حفظ المحتوى العربي وMarkdown والاقتباسات والأسطر الجديدة، وأن إعادة المعالجة لا تنشر المقال مرتين عند وجود ملف تالف آخر في الطابور.";

  writeJson(path.join(requestsDir, "req-manual-json-valid.json"), validRequest);
  fs.writeFileSync(
    path.join(requestsDir, "req-manual-json-corrupted.json"),
    '{"id":"req-manual-json-corrupted","mode":"manual","title":"ملف تالف","content":"سطر أول\nسطر ثانٍ غير مغلق"',
    "utf8"
  );

  const pendingBefore = readPendingRequests(requestsDir);
  const corruptedBefore = pendingBefore.find((entry) => entry.name === "req-manual-json-corrupted.json");
  assert.ok(corruptedBefore && corruptedBefore.error, "يجب رصد الملف التالف بدل إسقاطه بصمت");
  assert.match(corruptedBefore.error, /req-manual-json-corrupted\.json/);
  assert.match(corruptedBefore.error, /Bad control character|Unterminated string|Unexpected end of JSON input|Expected ',' or '}'/);

  const beforeArticles = JSON.parse(fs.readFileSync(articlesPath, "utf8"));
  const firstRun = await processRequests({ requestsDir, articlesPath, sitemapPath, selfTest: true });
  assert.deepEqual(firstRun, { processed: 2, published: 1, failed: 1 });

  const afterFirstRun = JSON.parse(fs.readFileSync(articlesPath, "utf8"));
  const publishedMatches = afterFirstRun.filter((article) => article.slug === validRequest.slug);
  assert.equal(publishedMatches.length, 1, "يجب نشر الطلب الصحيح مرة واحدة فقط");
  assert.equal(afterFirstRun.length, beforeArticles.length + 1, "يجب إضافة مقال واحد فقط");
  assert.equal(fs.existsSync(path.join(requestsDir, "req-manual-json-valid.json")), false, "الطلب الصحيح يجب أن يُحذف بعد النشر");
  assert.equal(fs.existsSync(path.join(requestsDir, "req-manual-json-corrupted.json")), true, "الملف التالف يجب أن يبقى للمراجعة الآمنة");

  const secondRun = await processRequests({ requestsDir, articlesPath, sitemapPath, selfTest: true });
  assert.deepEqual(secondRun, { processed: 1, published: 0, failed: 1 });

  const afterSecondRun = JSON.parse(fs.readFileSync(articlesPath, "utf8"));
  assert.equal(afterSecondRun.length, afterFirstRun.length, "إعادة التشغيل يجب ألا تضيف مقالاً جديداً");
  assert.equal(afterSecondRun.filter((article) => article.slug === validRequest.slug).length, 1, "لا duplicate publish عند إعادة التشغيل");
});

console.log(`\n══════════════════════════════════════════════════════════════`);
console.log(`  نتيجة الاختبارات: PASS=${passed} | FAIL=${failed} | Total=${passed + failed}`);
if (failed > 0) {
  console.log("\n  الاختبارات الفاشلة:");
  for (const item of failures) {
    console.log(`    ✖ ${item.name}: ${item.error.slice(0, 140)}`);
  }
}
console.log(`══════════════════════════════════════════════════════════════\n`);

process.exit(failed > 0 ? 1 : 0);
