# FemSeha Comprehensive Technical & SEO Audit
Date: 2026-11-24
Repository: femseha/femseha
Base: main
Audit branch: audit/femseha-comprehensive-audit-2026-11-24
Draft PR: #76

## Release constraints and deployment safety
- This is a review-only Draft PR. Do not merge it.
- Do not publish a Production deployment from this work.
- Preserve all current article URLs, redirects, and sitemap membership unless URL-level evidence and explicit approval support a change.
- Do not rewrite medically sensitive clinical/legal claims without qualified review.
- No DNS, SSL, nameserver, or custom-domain settings were changed.
- With the owner's approval, Cloudflare Pages preview deployments were temporarily disabled. Verified settings: `preview_deployment_setting=none`, production branch `main`, and `production_deployments_enabled=true`.
- Cloudflare created metadata records for subsequent branch pushes, but each was marked `is_skipped=true` with `skip_reason=preview_deployments_disabled`; all stages remained idle. These were not built or deployed.

## Confirmed technical findings and work on this branch

1. **SSR lazy loading / Suspense**
   - The application used lazy route imports while the SSR entry used `renderToString`, which does not wait for suspended lazy components.
   - `src/App.tsx` now uses direct route imports and no Suspense wrapper in the SSR route tree.
   - `scripts/ssr-verify.mjs` checks route H1 output and Suspense fallback absence.

2. **Duplicate metadata in prerendered HTML**
   - The prerender script previously retained template metadata while injecting route-specific metadata.
   - `scripts/prerender.mjs` now removes route-owned title, description, robots, keywords, Twitter, Open Graph, canonical, and JSON-LD tags from non-home templates before injecting route metadata.
   - It asserts one title, description, canonical, robots, OG title, and Twitter title, verifies canonical equality, requires one H1, and checks route JSON-LD.
   - The homepage retains its existing page-specific head and structured data.

3. **Canonical and trailing slash policy**
   - The intended policy is now explicit: homepage canonical ends in `/`; non-root canonicals omit the trailing slash, matching the current sitemap output.
   - `src/entry-server.tsx` sets the root canonical to `${SITE.url}/`.
   - `public/_redirects` and existing sitemap URLs were not mass-normalized or rewritten. Actual production HTTP redirect behavior still requires a separate URL-level check.

4. **Cluster fallback and missing page content**
   - `src/pages/ClusterPage.tsx` no longer falls back to the Saudi pillar page for unknown routes; unknown cluster paths render the Not Found page.
   - Independent informational content was added for `/misoprostol`, `/products`, `/order`, `/delivery`, and `/pharmacies`.
   - These pages preserve their existing route names and are informational; they do not provide drug sales, dosing, or self-use instructions.

5. **Duplicate article slugs**
   - Seven duplicate records were found across 13 JSON source files.
   - The complete duplicate records were saved to `docs/duplicate-article-content-archive-2026-11-24.json`.
   - The redundant copies were removed from the batch source files while retaining the first source record previously selected by the runtime loader. No article slug, canonical, or sitemap URL was renamed.
   - `src/data/articles.ts`, `scripts/generate-sitemap.mjs`, and `scripts/seo-validate.mjs` now fail on raw duplicate slugs instead of silently deduplicating or skipping them.

6. **SSR alias test correction**
   - Two legacy pillar aliases are intentionally redirected and excluded from the sitemap. The SSR route test now excludes those aliases from the indexable-page H1 requirement instead of treating the redirect response as a broken content page.
   - The alias URLs and redirect rules remain in place.

7. **Cluster internal linking**
   - The ectopic-pregnancy safety article now links to `/cytotec-saudi-arabia` with contextual medical-information wording.

## Duplicate slug inventory
Seven duplicate slugs were found:
- `rh-factor-anti-d-injection`: articles.json and batch-06
- `post-miscarriage-care-recovery`: articles.json and batch-07
- `miscarriage-types-and-symptoms`: articles.json and batch-06
- `reduced-fetal-movement`: articles.json and batch-06
- `morning-sickness-vs-hyperemesis`: articles.json and batch-06
- `anemia-in-pregnancy-guide`: articles.json and batch-06
- `gestational-diabetes-guide`: articles.json and batch-05

Static source verification after the archive/removal:
- 13 source JSON files
- 52 remaining article records
- 52 unique slugs
- 7 duplicate records retained in the archive
- 89 sitemap URLs and zero duplicate sitemap URLs

## CI evidence and current status
The first PR #76 workflow attempt on the earlier branch head reported:
- Dependency audit: passed
- Typecheck: passed
- SEO validation: passed
- Indexing audit: passed
- SSR verification: failed because a legacy redirect alias produced no H1
- Saudi cluster audit: failed because the ectopic-pregnancy article lacked a link to the Saudi pillar
- Production build: skipped after the SSR failure

Both identified code issues were corrected in later commits. A fresh completed CI result for the latest branch head has not yet been confirmed. Therefore the PR is not merge-ready, and the audit is not complete.

## Files changed in the branch
- `src/App.tsx`
- `src/entry-server.tsx`
- `src/pages/ClusterPage.tsx`
- `src/data/cluster-pages.ts`
- `src/data/articles.ts`
- `src/data/seo-content-batch-05.json`
- `src/data/seo-content-batch-06.json`
- `src/data/seo-content-batch-07.json`
- `src/data/seo-supporting-articles.json`
- `scripts/generate-sitemap.mjs`
- `scripts/seo-validate.mjs`
- `scripts/ssr-verify.mjs`
- `scripts/prerender.mjs`
- `docs/FEMSEHA-COMPREHENSIVE-AUDIT-2026-11-24.md`
- `docs/FEMSEHA-FILE-CHANGE-MATRIX-2026-11-24.md`
- `docs/duplicate-article-content-archive-2026-11-24.json`

## Remaining audit work
A. Obtain fresh CI evidence for the latest branch head, including typecheck, SEO validation, indexing audit, SSR, sitemap, cluster checks, and production build.
B. Verify rendered HTML for every sitemap route, including unique head tags, one H1, correct canonical, and expected structured data.
C. Verify live HTTP behavior for slash/no-slash variants and compare redirects/canonicals against Search Console URL inspection.
D. Review article-by-article source validity, image existence and alt text, author/reviewer evidence, and medically sensitive claims.
E. Check internal links and outbound source links for 404s, redirects, stale pages, and relevance.
F. Compare route inventory and sitemap membership against production before any approval.


## Fresh Google Search Console evidence (retrieved 2026-11-24)

Property: `sc-domain:femseha.com`. Search Console data is settled through 2026-11-22; the performance comparison below uses 2026-10-25 to 2026-11-21 against 2026-09-27 to 2026-10-24.

| Metric | Current 28 days | Previous 28 days | Change |
|---|---:|---:|---:|
| Clicks | 128 | 55 | +73 |
| Impressions | 3,771 | 887 | +2,884 |
| CTR | 3.39% | 6.20% | -2.81 percentage points |
| Average position | 10.94 | 18.02 | Improved by 7.08 positions |

The site is gaining visibility and clicks, while CTR is falling. Avoid broad title or URL changes; inspect individual query/page pairs before editing pages that already rank.

### Sitemap and URL inspection
- Google Search Console reports `sitemap.xml`: 89 submitted URLs, 0 warnings, 0 errors.
- `image-sitemap.xml`: 9 submitted image mappings, 0 warnings, 0 errors.
- In the 28-day window, 20 of the 89 sitemap URLs received impressions. This is a lower bound on indexed URLs, not Google's total index count.
- The stored latest inspection set contains 90 URLs: 79 PASS and 11 NEUTRAL.
- 84 of 90 inspected URLs have a Google-selected canonical with a trailing slash while the user-declared canonical omits it.
- The five inspected URLs `/misoprostol/`, `/products/`, `/order/`, `/delivery/`, and `/pharmacies/` still show the old Saudi pillar as Google's selected canonical in production inspections. This is consistent with the fallback code on production; the draft branch now gives each route independent content. Re-inspection is required after an approved deployment.

**Canonical decision is intentionally pending:** the draft currently declares a trailing slash only for the homepage and no trailing slash for non-root pages, matching the existing sitemap. The GSC evidence shows a broad mismatch with Google's selected canonical. Changing the canonical policy and sitemap to trailing slashes would change the preferred URL variant across most routes. No such mass change has been made because it requires explicit owner approval and careful redirect planning.

### Page-level opportunities and pages to protect
- `/articles/subchorionic-hematoma-pregnancy-guide/`: 2,287 impressions, 9 clicks, 0.39% CTR, average position 7.46. This is the clearest CTR review candidate; inspect its title, snippet, and query alignment before changing it.
- `/articles/abortion-regulations-bahrain-medical-guide/`: 254 impressions, 22 clicks, 8.66% CTR, average position 7.57. Protect its current content and ranking signals.
- `/cytotec-saudi-arabia/`: 42 impressions, 18 clicks, 42.86% CTR, average position 34.02. Low volume and a high CTR do not justify a broad rewrite.

### Remaining SEO validator warnings
The completed CI run at commit `c6cdb803a425f2523f4085e5cb0c25a02b1d9591` passed TypeScript, SEO validation, indexing audit, SSR verification, production build, and the Saudi cluster audit. SEO validation reported zero errors and 45 warnings:
- 29 articles lacked a structured `sources` array. Some contain inline links; the remaining claims and sources need article-by-article verification.
- 15 URL targets in the keyword map combine distinct `searchIntent` labels. These need manual intent review, not automatic splitting.
- 1 warning was a validator inventory omission for the Arabic pregnancy-age calculator route; that route has now been added to the validator's static route list. A fresh CI run is pending for the latest commit.

The dependency audit still reports 5 total vulnerabilities (1 low, 2 moderate, 2 high); the production-only audit reports 2 moderate React Router advisories. This is not a clean dependency audit. No forced major-version upgrade was made.
