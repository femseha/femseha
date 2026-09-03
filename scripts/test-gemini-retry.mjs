#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * اختباراتRetry Gemini API + JSON Parsing
 * ─────────────────────────────────────────────────────────────────────────────
 * يغطي:
 *   1. 503 retry ثم نجاح → نص واحد يُرجع
 *   2. 429 retry ثم نجاح
 *   3. 502 retry ثم نجاح
 *   4. 504 retry ثم نجاح
 *   5. 400 → لا retry → فشل فوري
 *   6. 401 → لا retry → فشل فوري
 *   7. 403 → لا retry → فشل فوري
 *   8. 404 → لا retry → فشل فوري
 *   9. UNAVAILABLE → retry
 *  10. RESOURCE_EXHAUSTED → retry
 *  11. 503 متكرر حتى استنفاد المحاولات → لا commit لمقال ناقص
 *  12. JSON parsing — control characters يُعالج بنجاح
 *  13. JSON parsing — نص غير صالح → fail بأمان بدون publish
 *  14. computeBackoffMs returns increasing values
 *  15. isTransientError classification
 *
 * لا يستدعي Gemini API فعلياً — يستخدم fetch mock عبر globalThis.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import assert from "node:assert/strict";
import {
  generateWithGemini,
  parseGeneratedArticle,
  sanitizeJsonControlChars,
  isTransientError,
  computeBackoffMs,
  GEMINI_RETRY_MAX_ATTEMPTS,
} from "./generate-article.mjs";

let passed = 0;
let failed = 0;
const failures = [];

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  PASS  ✔ ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, error: err.message });
    console.log(`  FAIL  ✖ ${name}`);
    console.log(`        ${err.message.slice(0, 200)}`);
  }
}

/* ── مساعد: محاكاة fetch mock ───────────────────────────────────────── */

function mockFetch(responses) {
  let callIndex = 0;
  return async (_url, _opts) => {
    const r = responses[callIndex] || responses[responses.length - 1];
    callIndex++;
    // تأخير صغير لتجنب race conditions في الـ logs
    return {
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      text: async () => r.body || "",
      json: async () => {
        if (r.json) return r.json;
        try { return JSON.parse(r.body); } catch { return {}; }
      },
    };
  };
}

/** استجابة Gemini ناجحة نموذجية */
function successGeminiJson(textOverride) {
  const text = textOverride || JSON.stringify({
    title: "مقال تجريبي",
    summary: "ملخص تجريبي لأغراض الاختبار يشرح الموضوع بالتفصيل المطلوب".padEnd(100, " "),
    content: "### مقدمة\n\n" + Array.from({ length: 30 }, (_, i) => `فقرة تجريبية ${i + 1} تشرح الموضوع بلغة طبية مسؤولة`).join("\n\n"),
    faq: [{ q: "سؤال؟", a: "إجابة." }],
  });
  return {
    status: 200,
    json: {
      candidates: [{
        content: { parts: [{ text }] },
        finishReason: "STOP",
      }],
    },
  };
}

/* ── تهيئة: استبدال fetch العالمي قبل كل اختبار ──────────────────────── */

const originalFetch = globalThis.fetch;

function setupFetch(responses) {
  globalThis.fetch = mockFetch(responses);
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

/* ── اختبارات isTransientError ───────────────────────────────────────── */

console.log("\n═══ اختبارات تصنيف الأخطاء (isTransientError) ═══\n");

await test("503 = transient", () => {
  assert.equal(isTransientError(503, ""), true);
});

await test("429 = transient", () => {
  assert.equal(isTransientError(429, ""), true);
});

await test("502 = transient", () => {
  assert.equal(isTransientError(502, ""), true);
});

await test("504 = transient", () => {
  assert.equal(isTransientError(504, ""), true);
});

await test("UNAVAILABLE in body = transient", () => {
  assert.equal(isTransientError(200, '{"error":{"status":"UNAVAILABLE"}}'), true);
});

await test("RESOURCE_EXHAUSTED in body = transient", () => {
  assert.equal(isTransientError(200, 'RESOURCE_EXHAUSTED: quota exceeded'), true);
});

await test("400 = NOT transient", () => {
  assert.equal(isTransientError(400, "bad request"), false);
});

await test("401 = NOT transient", () => {
  assert.equal(isTransientError(401, ""), false);
});

await test("403 = NOT transient", () => {
  assert.equal(isTransientError(403, ""), false);
});

await test("404 = NOT transient", () => {
  assert.equal(isTransientError(404, ""), false);
});

await test("500 = NOT transient (غير مصنف)", () => {
  assert.equal(isTransientError(500, ""), false);
});

/* ── اختبارات computeBackoffMs ───────────────────────────────────────── */

console.log("\n═══ اختبارات Backoff ═══\n");

await test("backoff يزيد مع المحاولات", () => {
  const b1 = computeBackoffMs(1);
  const b2 = computeBackoffMs(2);
  const b3 = computeBackoffMs(3);
  // مع jitter قد تتقارب، لكن القاعدة أن b1 < b3
  assert.ok(b1 >= 1000 && b1 <= 1500, `attempt 1: ${b1}ms`);
  assert.ok(b2 >= 2000 && b2 <= 3000, `attempt 2: ${b2}ms`);
  assert.ok(b3 >= 4000 && b3 <= 6000, `attempt 3: ${b3}ms`);
});

await test("backoff لا يتجاوز 15 ثانية", () => {
  const b = computeBackoffMs(10);
  assert.ok(b <= 22500, `attempt 10: ${b}ms (الحد الأقصى 15000 + 50% jitter = 22500)`);
});

await test("GEMINI_RETRY_MAX_ATTEMPTS = 4", () => {
  assert.equal(GEMINI_RETRY_MAX_ATTEMPTS, 4);
});

/* ── اختبارات Retry مع fetch mock ────────────────────────────────────── */

console.log("\n═══ اختبارات Retry (503/429/502/504 → نجاح بعد retry) ═══\n");

await test("503 → retry → نجاح (محاولة 1 تفشل + محاولة 2 تنجح)", async () => {
  setupFetch([
    { status: 503, body: "Service Unavailable" },
    successGeminiJson(),
  ]);
  const result = await generateWithGemini("fake-key", "test prompt");
  assert.ok(result, "يجب أن يُرجع نصاً");
  assert.ok(result.includes("مقال تجريبي"));
  restoreFetch();
});

await test("429 → retry → نجاح", async () => {
  setupFetch([
    { status: 429, body: "Rate limit exceeded" },
    { status: 429, body: "Rate limit exceeded" },
    successGeminiJson(),
  ]);
  const result = await generateWithGemini("fake-key", "test prompt");
  assert.ok(result.includes("مقال تجريبي"));
  restoreFetch();
});

await test("502 → retry → نجاح", async () => {
  setupFetch([
    { status: 502, body: "Bad Gateway" },
    successGeminiJson(),
  ]);
  const result = await generateWithGemini("fake-key", "test prompt");
  assert.ok(result.includes("مقال تجريبي"));
  restoreFetch();
});

await test("504 → retry → نجاح", async () => {
  setupFetch([
    { status: 504, body: "Gateway Timeout" },
    successGeminiJson(),
  ]);
  const result = await generateWithGemini("fake-key", "test prompt");
  assert.ok(result.includes("مقال تجريبي"));
  restoreFetch();
});

await test("UNAVAILABLE في body → retry → نجاح", async () => {
  setupFetch([
    { status: 503, body: '{"error":{"status":"UNAVAILABLE","message":"service down"}}' },
    successGeminiJson(),
  ]);
  const result = await generateWithGemini("fake-key", "test prompt");
  assert.ok(result.includes("مقال تجريبي"));
  restoreFetch();
});

await test("RESOURCE_EXHAUSTED في body → retry → نجاح", async () => {
  setupFetch([
    { status: 429, body: 'RESOURCE_EXHAUSTED: quota exceeded for model' },
    successGeminiJson(),
  ]);
  const result = await generateWithGemini("fake-key", "test prompt");
  assert.ok(result.includes("مقال تجريبي"));
  restoreFetch();
});

await test("نجاح من أول محاولة → لا retry", async () => {
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls++;
    return {
      ok: true,
      status: 200,
      json: async () => successGeminiJson().json,
      text: async () => "",
    };
  };
  const result = await generateWithGemini("fake-key", "test prompt");
  assert.equal(fetchCalls, 1, "يجب أن يُستدعى fetch مرة واحدة فقط");
  assert.ok(result);
  restoreFetch();
});

/* ── اختبارات Non-retryable errors ───────────────────────────────────── */

console.log("\n═══ اختبارات عدم Retry (400/401/403/404) ═══\n");

await test("400 → فشل فوري بدون retry", async () => {
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls++;
    return {
      ok: false,
      status: 400,
      body: "Bad Request: invalid prompt",
      text: async () => "Bad Request: invalid prompt",
      json: async () => ({}),
    };
  };
  await assert.rejects(
    () => generateWithGemini("fake-key", "test prompt"),
    /400|غير قابل للاستعادة/
  );
  assert.equal(fetchCalls, 1, "400 يجب ألا يُعيد المحاولة");
  restoreFetch();
});

await test("401 → فشل فوري بدون retry", async () => {
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls++;
    return {
      ok: false,
      status: 401,
      text: async () => "API key invalid",
      json: async () => ({}),
    };
  };
  await assert.rejects(
    () => generateWithGemini("fake-key", "test prompt"),
    /401|غير قابل للاستعادة/
  );
  assert.equal(fetchCalls, 1);
  restoreFetch();
});

await test("403 → فشل فوري بدون retry", async () => {
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls++;
    return {
      ok: false,
      status: 403,
      text: async () => "Forbidden",
      json: async () => ({}),
    };
  };
  await assert.rejects(
    () => generateWithGemini("fake-key", "test prompt"),
    /403|غير قابل للاستعادة/
  );
  assert.equal(fetchCalls, 1);
  restoreFetch();
});

await test("404 → فشل فوري بدون retry", async () => {
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls++;
    return {
      ok: false,
      status: 404,
      text: async () => "Model not found",
      json: async () => ({}),
    };
  };
  await assert.rejects(
    () => generateWithGemini("fake-key", "test prompt"),
    /404|غير قابل للاستعادة/
  );
  assert.equal(fetchCalls, 1);
  restoreFetch();
});

/* ── اختبار استنفاد المحاولات → فشل آمن ─────────────────────────────── */

console.log("\n═══ اختبار استنفاد المحاولات (لا نشر ناقص) ═══\n");

await test("503 متكرر 4 مرات → استنفاد → خطأ يُمنع النشر", async () => {
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls++;
    return {
      ok: false,
      status: 503,
      text: async () => "Service Unavailable",
      json: async () => ({}),
    };
  };
  await assert.rejects(
    () => generateWithGemini("fake-key", "test prompt"),
    /503/
  );
  assert.equal(fetchCalls, GEMINI_RETRY_MAX_ATTEMPTS, `يجب ${GEMINI_RETRY_MAX_ATTEMPTS} محاولات بالضبط`);
  restoreFetch();
});

await test("استنفاد المحاولات → parseGeneratedArticle لا تُستدعى → لا publish", async () => {
  // إثبات أن المسار الكامل يرمي خطأ قبل الوصول للـ parse
  let parseCalled = false;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls++;
    return {
      ok: false,
      status: 503,
      text: async () => "Service Unavailable",
      json: async () => ({}),
    };
  };

  // محاكاة مسار التوليد الكامل كما في generate-article.mjs
  let gen = null;
  try {
    const raw = await generateWithGemini("fake-key", "test prompt");
    gen = parseGeneratedArticle(raw);
    parseCalled = true;
  } catch {
    // المتوقع: رمي خطأ → gen يبقى null
  }

  assert.equal(fetchCalls, GEMINI_RETRY_MAX_ATTEMPTS);
  assert.equal(parseCalled, false, "parseGeneratedArticle يجب ألا تُستدعى عند فشل التوليد");
  assert.equal(gen, null, "gen يجب أن يبقى null → لا نشر لمقال ناقص");
  restoreFetch();
});

/* ── اختبارات JSON Parsing ───────────────────────────────────────────── */

console.log("\n═══ اختبارات JSON Parsing ═══\n");

await test("JSON عادي → parse ناجح", () => {
  const raw = JSON.stringify({
    title: "مقال",
    summary: "ملخص تجريبي طويل بما يكفي ليصلح meta description ويغطي الحد الأدنى المطلوب وهو مائة وثلاثون حرفاً على الأقل",
    content: "محتوى المقال " + "كلمة ".repeat(1500),
    faq: [{ q: "سؤال؟", a: "جواب." }],
  });
  const parsed = parseGeneratedArticle(raw);
  assert.equal(parsed.title, "مقال");
  assert.ok(parsed.content.length > 0);
});

await test("JSON مع control characters داخل strings → يُعالج بنجاح", () => {
  // JSON يحتوي على أسطر جديدة فعلية داخل القيم النصية (bad control characters)
  const raw = '{"title":"مقال","summary":"ملخص تجريبي طويل بما يكفي ليصلح meta description ويغطي الحد الأدنى المطلوب وهو مائة وثلاثون حرفاً على الأقل","content":"فقرة أولى\nفقرة ثانية\tبعد tab\rبعد CR","faq":[{"q":"سؤال؟","a":"إجابة\nعلى سطرين"}]}';
  const parsed = parseGeneratedArticle(raw);
  assert.equal(parsed.title, "مقال");
  assert.ok(parsed.content.includes("فقرة أولى"));
  assert.ok(parsed.faq.length >= 1);
});

await test("JSON مع ```json``` wrapper → يُعالج بنجاح", () => {
  const inner = JSON.stringify({
    title: "مقال",
    summary: "ملخص تجريبي طويل بما يكفي ليصلح meta description ويغطي الحد الأدنى المطلوب وهو مائة وثلاثون حرفاً على الأقل",
    content: "محتوى " + "كلمة ".repeat(1500),
    faq: [],
  });
  const raw = "```json\n" + inner + "\n```";
  const parsed = parseGeneratedArticle(raw);
  assert.equal(parsed.title, "مقال");
});

await test("JSON غير صالح → fail بأمان مع رسالة واضحة", () => {
  const raw = "هذا ليس JSON على الإطلاق {{{";
  assert.throws(
    () => parseGeneratedArticle(raw),
    /JSON غير صالح/
  );
});

await test("JSON ناقص الحقول → fail بأمان (لا نشر ناقص)", () => {
  const raw = JSON.stringify({ title: "عنوان فقط بدون content" });
  assert.throws(
    () => parseGeneratedArticle(raw),
    /الحقول الأساسية ناقصة|لن يُنشر مقال ناقص/
  );
});

await test("sanitizeJsonControlChars: newline داخل string → \\n", () => {
  const input = '{"key":"value\nwith newline"}';
  const cleaned = sanitizeJsonControlChars(input);
  const parsed = JSON.parse(cleaned);
  assert.equal(parsed.key, "value\nwith newline");
});

await test("sanitizeJsonControlChars: tab داخل string → \\t", () => {
  const input = '{"key":"value\twith tab"}';
  const cleaned = sanitizeJsonControlChars(input);
  const parsed = JSON.parse(cleaned);
  assert.equal(parsed.key, "value\twith tab");
});

await test("sanitizeJsonControlChars: نص خارج strings لا يتأثر", () => {
  const input = '{"a":1,"b":"hello"}';
  const cleaned = sanitizeJsonControlChars(input);
  assert.equal(cleaned, input);
});

/* ── اختبار نجاح Retry يؤدي لنص واحد فقط (لا duplicate) ─────────────── */

console.log("\n═══ اختبار عدم التكرار (single publish) ═══\n");

await test("Retry ناجح → نص واحد يُرجع (لا duplicate publish)", async () => {
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls++;
    if (fetchCalls <= 2) {
      return {
        ok: false,
        status: 503,
        text: async () => "Service Unavailable",
        json: async () => ({}),
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => successGeminiJson().json,
      text: async () => "",
    };
  };
  const result = await generateWithGemini("fake-key", "test prompt");
  assert.equal(fetchCalls, 3, "3 محاولات: 2 فاشلة + 1 ناجحة");
  // النص يُرجع مرة واحدة فقط
  assert.ok(result);
  assert.equal(typeof result, "string");
  // لا يوجد duplicate في المحتوى
  const count = (result.match(/مقال تجريبي/g) || []).length;
  assert.equal(count, 1, "النص يظهر مرة واحدة فقط");
  restoreFetch();
});

/* ── النتيجة النهائية ────────────────────────────────────────────────── */

restoreFetch();

console.log(`\n══════════════════════════════════════════════════════════════`);
console.log(`  نتيجة الاختبارات: PASS=${passed} | FAIL=${failed} | Total=${passed + failed}`);
if (failed > 0) {
  console.log(`\n  الاختبارات الفاشلة:`);
  for (const f of failures) {
    console.log(`    ✖ ${f.name}: ${f.error.slice(0, 120)}`);
  }
}
console.log(`══════════════════════════════════════════════════════════════\n`);

process.exit(failed > 0 ? 1 : 0);
