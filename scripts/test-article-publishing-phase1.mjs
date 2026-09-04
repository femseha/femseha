#!/usr/bin/env node
/** Regression coverage for Phase 1: images, short-content publishing, links and light theme. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import {
  ARTICLES_PATH,
  ROOT,
  countArabicWords,
  hasSubstantiveContent,
  runQualityChecks,
  writePublicationFiles,
} from './generate-article.mjs';
import {
  normalizeAndVerifyArticleImage,
  processRequests,
} from './admin-publish.mjs';

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
    const message = error instanceof Error ? error.stack || error.message : String(error);
    failures.push({ name, message });
    console.log(`  FAIL  ✖ ${name}`);
    console.log(`        ${message.split('\n')[0].slice(0, 260)}`);
  }
}

const shortContent = [
  'هذه مقدمة تحريرية قصيرة لكنها مكتملة، تشرح للقارئة أن المعلومات الصحية العامة تحتاج إلى فهم السياق ومراجعة المختص عند وجود أعراض مقلقة.',
  'توضح الفقرة الثانية خطوات قراءة المعلومات بعناية، وتحافظ على لغة مسؤولة بلا تشخيص ذاتي، مع رابط عربي إلى [وزارة الصحة](https://www.moh.gov.sa/) ورابط [المكتبة الطبية](/articles).',
  '### خلاصة عملية',
  'المعلومة الموثوقة تساعد على طرح أسئلة أفضل، بينما يبقى التقييم الطبي المباشر هو المرجع المناسب للحالة الفردية.'
].join('\n\n');
const longContent = Array.from({ length: 180 }, () => shortContent).join('\n\n');
const validTitle = 'دليل تثقيفي مختصر لفهم المعلومات الصحية الموثوقة بأمان';
const validSummary =
  'دليل تثقيفي مختصر يوضح كيفية قراءة المعلومات الصحية الموثوقة، والتمييز بين التوعية العامة والتقييم الطبي الفردي، ومتى تلزم مراجعة المختص.';

assert.ok(validTitle.length >= 20 && validTitle.length <= 75);
assert.ok(validSummary.length >= 100 && validSummary.length <= 170);
assert.ok(countArabicWords(shortContent) < 1400);
assert.ok(countArabicWords(longContent) >= 1400);

console.log('\n═══ اختبارات إصلاح نشر المقالات — Phase 1 ═══\n');

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const rules = await vite.ssrLoadModule('/src/lib/article-rules.ts');
  const media = await vite.ssrLoadModule('/src/lib/article-media.ts');
  const markdown = await vite.ssrLoadModule('/src/lib/article-markdown.ts');
  const articleView = await vite.ssrLoadModule('/src/pages/ArticleView.tsx');
  const githubPublish = await vite.ssrLoadModule('/src/lib/github-publish.ts');
  const { renderRoute } = await vite.ssrLoadModule('/scripts/ssr-entry.tsx');

  const draft = (content) => ({
    title: validTitle,
    primaryKeyword: 'اختبار تقني مستقل للمحتوى الصحي المختصر',
    secondaryKeywords: [],
    country: null,
    category: 'general-health',
    image: null,
    imageAlt: null,
    content,
    summary: validSummary,
    slug: 'phase-one-short-article-regression',
    editSlug: null,
  });

  await test('مقال صالح أقل من 1400 كلمة يمر في المتصفح والخادم', () => {
    assert.equal(hasSubstantiveContent(shortContent), true);
    assert.deepEqual(rules.validateManualDraft(draft(shortContent), []), []);
    const quality = runQualityChecks(
      { title: validTitle, summary: validSummary, content: shortContent },
      { slug: draft(shortContent).slug },
      []
    );
    assert.deepEqual(quality.errors, []);
  });

  await test('مقال 1400+ كلمة يظل قابلاً للنشر دون اعتبار العدد معياراً', () => {
    assert.ok(countArabicWords(longContent) >= 1400);
    assert.deepEqual(rules.validateManualDraft(draft(longContent), []), []);
    assert.deepEqual(
      runQualityChecks(
        { title: validTitle, summary: validSummary, content: longContent },
        { slug: draft(longContent).slug },
        []
      ).errors,
      []
    );
  });

  await test('المحتوى الفارغ وشبه الفارغ مرفوضان بلا حد كلمات SEO', () => {
    for (const content of ['', 'نص قصير سيضاف لاحقاً.']) {
      assert.equal(hasSubstantiveContent(content), false);
      assert.ok(rules.validateManualDraft(draft(content), []).some((error) => /فارغ|شكلي/.test(error)));
      assert.ok(
        runQualityChecks(
          { title: validTitle, summary: validSummary, content },
          { slug: draft(content).slug },
          []
        ).errors.some((error) => /فارغ|شكلي/.test(error))
      );
    }
  });

  await test('الروابط العربية والداخلية والخارجية والمتعددة تبقى clickable بخصائص الأمان', () => {
    const linkContent =
      'راجعي [وزارة الصحة](https://www.moh.gov.sa/) ثم [المكتبة الطبية](/articles) و[صفحة الطبيب](/doctor).';
    const html = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/articles/test'] },
        React.createElement(articleView.ContentBlocks, { content: linkContent })
      )
    );
    assert.match(
      html,
      /<a href="https:\/\/www\.moh\.gov\.sa\/" target="_blank" rel="noopener noreferrer"[^>]*>وزارة الصحة<\/a>/
    );
    assert.match(html, /<a[^>]*href="\/articles"[^>]*>المكتبة الطبية<\/a>/);
    assert.match(html, /<a[^>]*href="\/doctor"[^>]*>صفحة الطبيب<\/a>/);
    assert.equal(markdown.extractMarkdownLinks(linkContent).length, 3);
  });

  await test('javascript/data/file وprotocol-relative تُرفض ولا تصبح روابط قابلة للنقر', () => {
    const dangerous = [
      'javascript:alert(1)',
      'data:text/html,unsafe',
      'file:///tmp/local.jpg',
      '//evil.example/path',
    ];
    for (const href of dangerous) assert.equal(markdown.classifyArticleHref(href), null);

    const content = 'لا تفتحي [هذا الرابط](javascript:alert(1)).';
    const html = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/'] },
        React.createElement(articleView.ContentBlocks, { content })
      )
    );
    assert.ok(html.includes('هذا الرابط'));
    assert.ok(!html.includes('href="javascript:'));
    assert.ok(rules.validateManualDraft(draft(`${shortContent}\n\n${content}`), []).some((error) => /غير آمنة/.test(error)));
    assert.ok(
      runQualityChecks(
        { title: validTitle, summary: validSummary, content: `${shortContent}\n\n${content}` },
        { slug: draft(shortContent).slug },
        []
      ).errors.some((error) => /غير آمن/.test(error))
    );
  });

  await test('اسم الصورة آمن وفريد ولا يعتمد على اسم الملف المحلي أو path traversal', () => {
    const first = media.createArticleImageFileName('../../patient صورة.png', 1_725_000_000_000, 'abc-123');
    const second = media.createArticleImageFileName('../../patient صورة.png', 1_725_000_000_000, 'def-456');
    assert.match(first, /^[a-z0-9][a-z0-9-]*\.jpg$/);
    assert.notEqual(first, second);
    assert.ok(!first.includes('..') && !first.includes('/') && !first.includes('صورة'));
  });

  await test('رابط /public القديم يُصحح وblob/local/path traversal لا يُحفظ', () => {
    const expected = 'https://femseha.com/images/uploads/example.jpg';
    assert.equal(media.normalizeArticleImageUrl('/public/images/uploads/example.jpg'), expected);
    assert.equal(media.normalizeArticleImageUrl(expected), expected);
    for (const value of [
      'blob:https://femseha.com/uuid',
      'file:///home/user/image.jpg',
      'C:\\Users\\owner\\image.jpg',
      '/images/uploads/../../secret.jpg',
      '/images/uploads/%2e%2e/secret.jpg',
    ]) {
      assert.throws(() => media.normalizeArticleImageUrl(value));
    }
  });

  await test('رفع ملف الجهاز يحفظه في GitHub ثم يعيد URL production بلا /public', async () => {
    const originalFetch = globalThis.fetch;
    const originalCreateImageBitmap = globalThis.createImageBitmap;
    const originalDocument = globalThis.document;
    const calls = [];
    const jpegBytes = new Uint8Array([255, 216, 255, 224, 0, 16, 74, 70]);
    let uploadedPath = '';
    try {
      globalThis.createImageBitmap = async () => ({ width: 320, height: 200, close() {} });
      globalThis.document = {
        createElement: () => ({
          width: 0,
          height: 0,
          getContext: () => ({ drawImage() {} }),
          toBlob: (resolve) => resolve(new Blob([jpegBytes], { type: 'image/jpeg' })),
        }),
      };
      globalThis.fetch = async (url, init = {}) => {
        const requestUrl = String(url);
        calls.push({ url: requestUrl, method: init.method || 'GET' });
        if (init.method === 'PUT') {
          uploadedPath = decodeURIComponent(new URL(requestUrl).pathname.split('/contents/')[1]);
          return new Response(JSON.stringify({ content: { sha: 'image-sha', path: uploadedPath } }), {
            status: 201,
            headers: { 'content-type': 'application/json' },
          });
        }
        return new Response(
          JSON.stringify({ sha: 'image-sha', path: uploadedPath, size: jpegBytes.byteLength }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      };

      const url = await githubPublish.uploadArticleImage(
        { token: 'test', owner: 'femseha', repo: 'femseha' },
        { name: '../../private-name.png', type: 'image/png', size: 100 },
        '../../safe-slug'
      );
      assert.match(url, /^https:\/\/femseha\.com\/images\/uploads\/[a-z0-9-]+\.jpg$/);
      assert.ok(!url.includes('/public/') && !url.includes('private-name'));
      assert.match(uploadedPath, /^public\/images\/uploads\/[a-z0-9-]+\.jpg$/);
      assert.equal(calls.filter((call) => call.method === 'PUT').length, 1);
      assert.equal(calls.filter((call) => call.method === 'GET').length, 1);
    } finally {
      globalThis.fetch = originalFetch;
      globalThis.createImageBitmap = originalCreateImageBitmap;
      globalThis.document = originalDocument;
    }
  });

  await test('فشل رفع الصورة يوقف publishRequest قبل حفظ الطلب أو تشغيل workflow ويُظهر السبب', async () => {
    const originalFetch = globalThis.fetch;
    const originalCreateImageBitmap = globalThis.createImageBitmap;
    const originalDocument = globalThis.document;
    const calls = [];
    try {
      globalThis.createImageBitmap = async () => ({ width: 100, height: 100, close() {} });
      globalThis.document = {
        createElement: () => ({
          width: 0,
          height: 0,
          getContext: () => ({ drawImage() {} }),
          toBlob: (resolve) => resolve(new Blob(['jpeg'], { type: 'image/jpeg' })),
        }),
      };
      globalThis.fetch = async (url, init = {}) => {
        calls.push({ url: String(url), method: init.method || 'GET' });
        return new Response(JSON.stringify({ message: 'storage failure' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        });
      };
      await assert.rejects(
        githubPublish.publishRequest(
          { token: 'test', owner: 'femseha', repo: 'femseha' },
          {
            mode: 'manual',
            title: validTitle,
            primaryKeyword: 'اختبار توقف رفع الصورة',
            secondaryKeywords: [],
            country: null,
            category: 'general-health',
            image: null,
            imageAlt: 'وصف صورة الاختبار',
            slug: 'upload-failure-stops-publish',
            summary: validSummary,
            content: shortContent,
          },
          { name: 'local.png', type: 'image/png', size: 100 },
          () => {}
        ),
        /storage failure/
      );
      assert.equal(calls.length, 1);
      assert.ok(!calls.some((call) => call.url.includes('/admin/requests/') || call.url.includes('/dispatches')));
    } finally {
      globalThis.fetch = originalFetch;
      globalThis.createImageBitmap = originalCreateImageBitmap;
      globalThis.document = originalDocument;
    }
  });

  await test('فشل حفظ طلب المقال بعد رفع الصورة يوقف التشغيل ولا يظهر نجاحاً زائفاً', async () => {
    const originalFetch = globalThis.fetch;
    const originalCreateImageBitmap = globalThis.createImageBitmap;
    const originalDocument = globalThis.document;
    const calls = [];
    const jpegBytes = new TextEncoder().encode('jpeg');
    let uploadedPath = '';
    try {
      globalThis.createImageBitmap = async () => ({ width: 100, height: 100, close() {} });
      globalThis.document = {
        createElement: () => ({
          width: 0,
          height: 0,
          getContext: () => ({ drawImage() {} }),
          toBlob: (resolve) => resolve(new Blob([jpegBytes], { type: 'image/jpeg' })),
        }),
      };
      globalThis.fetch = async (url, init = {}) => {
        const requestUrl = String(url);
        const method = init.method || 'GET';
        calls.push({ url: requestUrl, method });
        if (method === 'PUT' && requestUrl.includes('/contents/public/images/uploads/')) {
          uploadedPath = decodeURIComponent(new URL(requestUrl).pathname.split('/contents/')[1]);
          return new Response(JSON.stringify({ content: { sha: 'saved-image-sha', path: uploadedPath } }), {
            status: 201,
            headers: { 'content-type': 'application/json' },
          });
        }
        if (method === 'GET' && requestUrl.includes('/contents/public/images/uploads/')) {
          return new Response(
            JSON.stringify({ sha: 'saved-image-sha', path: uploadedPath, size: jpegBytes.byteLength }),
            { status: 200, headers: { 'content-type': 'application/json' } }
          );
        }
        if (method === 'PUT' && requestUrl.includes('/contents/admin/requests/')) {
          return new Response(JSON.stringify({ message: 'request save failure' }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
          });
        }
        throw new Error(`نداء غير متوقع بعد فشل الحفظ: ${method} ${requestUrl}`);
      };

      await assert.rejects(
        githubPublish.publishRequest(
          { token: 'test', owner: 'femseha', repo: 'femseha' },
          {
            mode: 'manual',
            title: validTitle,
            primaryKeyword: 'اختبار توقف حفظ طلب المقال',
            secondaryKeywords: [],
            country: null,
            category: 'general-health',
            image: null,
            imageAlt: 'وصف صورة الاختبار',
            slug: 'request-save-failure-stops-publish',
            summary: validSummary,
            content: shortContent,
          },
          { name: 'local.png', type: 'image/png', size: 100 },
          () => {}
        ),
        /request save failure/
      );
      assert.ok(calls.some((call) => call.url.includes('/contents/admin/requests/')));
      assert.ok(!calls.some((call) => call.url.includes('/dispatches')));
    } finally {
      globalThis.fetch = originalFetch;
      globalThis.createImageBitmap = originalCreateImageBitmap;
      globalThis.document = originalDocument;
    }
  });

  await test('فشل كتابة ملفات النشر لا يترك articles.json جزئياً', () => {
    const tmpDir = path.join(ROOT, '.self-test', 'phase1-atomic-save');
    const articlesPath = path.join(tmpDir, 'articles.json');
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(articlesPath, '[{"slug":"before"}]\n', 'utf8');
    const before = fs.readFileSync(articlesPath, 'utf8');
    assert.throws(() =>
      writePublicationFiles(
        [{ slug: 'after', publishDate: '2026-09-04' }],
        articlesPath,
        path.join(tmpDir, 'missing-directory', 'sitemap.xml')
      )
    );
    assert.equal(fs.readFileSync(articlesPath, 'utf8'), before);
  });

  await test('الحفظ الفعلي يبقي الصورة وALT والروابط بعد إعادة فتح articles.json', async () => {
    const tmpDir = path.join(ROOT, '.self-test', 'phase1-pipeline');
    const requestsDir = path.join(tmpDir, 'requests');
    const articlesPath = path.join(tmpDir, 'articles.json');
    const sitemapPath = path.join(tmpDir, 'sitemap.xml');
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(requestsDir, { recursive: true });
    fs.copyFileSync(ARTICLES_PATH, articlesPath);
    fs.writeFileSync(sitemapPath, '', 'utf8');

    const image = 'https://femseha.com/images/uploads/adwiyat-ijhad-alhaml-fi-al-saudia-mtmicr83.jpg';
    assert.equal(normalizeAndVerifyArticleImage(image), image);
    assert.throws(() => normalizeAndVerifyArticleImage('https://femseha.com/images/uploads/not-found.jpg'), /غير موجود/);

    const baseRequest = {
      mode: 'manual',
      createdAt: '2026-09-04T12:00:00.000Z',
      title: validTitle,
      primaryKeyword: 'اختبار المرحلة الأولى لحفظ الروابط والصور',
      secondaryKeywords: [],
      country: null,
      category: 'general-health',
      image,
      imageAlt: 'قارئة تطالع معلومات صحية موثوقة',
      slug: 'phase-one-persisted-image-links',
      summary: validSummary,
      content: shortContent,
    };
    fs.writeFileSync(
      path.join(requestsDir, 'req-phase1-valid.json'),
      JSON.stringify({ ...baseRequest, id: 'req-phase1-valid' }, null, 2),
      'utf8'
    );
    fs.writeFileSync(
      path.join(requestsDir, 'req-phase1-empty.json'),
      JSON.stringify(
        {
          ...baseRequest,
          id: 'req-phase1-empty',
          slug: 'phase-one-empty-rejected',
          title: 'اختبار تقني مستقل لرفض المقال الفارغ قبل النشر المباشر',
          primaryKeyword: 'اختبار رفض المقال الفارغ في المرحلة الأولى',
          summary:
            'اختبار تقني مستقل يؤكد أن المقال الفارغ أو الشكلي يظل مرفوضاً قبل الحفظ والنشر، مع إظهار سبب واضح للمحررة وعدم إنشاء نجاح زائف في لوحة الإدارة.',
          image: null,
          imageAlt: null,
          content: 'سيضاف المحتوى لاحقاً.',
        },
        null,
        2
      ),
      'utf8'
    );

    const result = await processRequests({ requestsDir, articlesPath, sitemapPath, selfTest: true });
    assert.deepEqual(result, { processed: 2, published: 1, failed: 1 });
    const reopened = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    const article = reopened.find((item) => item.slug === baseRequest.slug);
    assert.ok(article);
    assert.equal(article.image, image);
    assert.equal(article.imageAlt, baseRequest.imageAlt);
    assert.ok(article.content.includes('[وزارة الصحة](https://www.moh.gov.sa/)'));
    assert.ok(article.content.includes('[المكتبة الطبية](/articles)'));
    assert.ok(countArabicWords(article.content) < 1400);
    assert.equal(reopened.some((item) => item.slug === 'phase-one-empty-rejected'), false);
    const failedRequest = JSON.parse(fs.readFileSync(path.join(requestsDir, 'req-phase1-empty.json'), 'utf8'));
    assert.equal(failedRequest.status, 'failed');
    assert.match(failedRequest.error, /فارغ|شكلي/);
  });

  await test('Homepage وArticleView وAdmin تستخدم أسطح Light Theme مع responsive layout', () => {
    const home = renderRoute('/');
    const article = renderRoute('/articles/adwiyat-ijhad-alhaml-fi-al-saudia');
    const admin = renderRoute('/admin');
    assert.ok(home.includes('from-white') && home.includes('bg-white border border-slate-200'));
    assert.ok(home.includes('sm:') && home.includes('lg:'));
    assert.ok(article.includes('bg-slate-50 py-12') && article.includes('bg-white rounded-3xl'));
    assert.ok(article.includes('text-slate-900') && article.includes('border-slate-200'));
    assert.ok(
      article.includes(
        'src="https://femseha.com/images/uploads/adwiyat-ijhad-alhaml-fi-al-saudia-mtmicr83.jpg"'
      )
    );
    const publishedImage = fs.readFileSync(
      path.join(ROOT, 'public/images/uploads/adwiyat-ijhad-alhaml-fi-al-saudia-mtmicr83.jpg')
    );
    assert.ok(publishedImage.length > 0);
    assert.deepEqual([...publishedImage.subarray(0, 2)], [0xff, 0xd8]);
    assert.ok(article.includes('alt="أدوية إجهاض الحمل في السعودية: المعلومات الطبية والضوابط والتحذيرات"'));
    assert.ok(admin.includes('bg-white') && admin.includes('text-slate-900'));
    const css = fs.readFileSync(path.join(ROOT, 'src/index.css'), 'utf8');
    assert.match(css, /color-scheme:\s*light/);
    assert.match(css, /background-color:\s*var\(--color-slate-50\)/);
    assert.match(css, /color:\s*var\(--color-slate-900\)/);
  });
} finally {
  await vite.close();
}

console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  نتيجة اختبارات Phase 1: PASS=${passed} | FAIL=${failed} | Total=${passed + failed}`);
if (failures.length) {
  console.log('\n  الاختبارات الفاشلة:');
  for (const item of failures) console.log(`    ✖ ${item.name}: ${item.message.split('\n')[0]}`);
}
console.log('══════════════════════════════════════════════════════════════\n');
process.exit(failed > 0 ? 1 : 0);
