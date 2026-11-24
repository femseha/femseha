import assert from "node:assert/strict";
import { injectRouteHead, stripRouteMetadata } from "./prerender-html.mjs";

const template = `<!doctype html><html><head>
<title>Template title</title>
<meta name="description" content="template description">
<meta name="robots" content="index,follow">
<meta property="og:title" content="template OG">
<meta property="og:url" content="https://example.test/">
<meta name="twitter:card" content="summary">
<link rel="canonical" href="https://example.test/">
<script type="application/ld+json">{"@type":"Organization"}</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="/favicon.ico">
</head><body><div id="root"></div></body></html>`;

const cleaned = stripRouteMetadata(template);
assert.doesNotMatch(cleaned, /Template title|template description|template OG|application\/ld\+json|rel="canonical"/i);
assert.match(cleaned, /name="viewport"/);
assert.match(cleaned, /rel="icon"/);

const routeHead = [
  "<title>Route title</title>",
  '<meta name="description" content="Route description">',
  '<meta name="robots" content="index, follow">',
  '<link rel="canonical" href="https://example.test/route">',
  '<meta property="og:title" content="Route title">',
  '<script type="application/ld+json">{"@type":"WebSite"}</script>'
].join("\n");
const output = injectRouteHead(template, routeHead);
assert.equal((output.match(/<title\b/gi) || []).length, 1);
assert.equal((output.match(/name="description"/gi) || []).length, 1);
assert.equal((output.match(/name="robots"/gi) || []).length, 1);
assert.equal((output.match(/rel="canonical"/gi) || []).length, 1);
assert.equal((output.match(/property="og:title"/gi) || []).length, 1);
assert.equal((output.match(/application\/ld\+json/gi) || []).length, 1);
assert.match(output, /Route title/);
console.log("PASS prerender HTML metadata deduplication");
