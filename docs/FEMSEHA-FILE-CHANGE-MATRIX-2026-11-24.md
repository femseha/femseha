# File Change Matrix — FemSeha Audit

## Implemented in Draft PR #76

| Area | Files changed | Work completed | Validation / risk |
|---|---|---|---|
| SSR routing | `src/App.tsx`, `src/entry-server.tsx` | Replaced lazy route imports/Suspense with eager route imports; homepage canonical now ends in slash | High; needs fresh SSR/build run |
| Cluster routing | `src/pages/ClusterPage.tsx` | Removed unrelated Saudi-page fallback for unknown routes | High; unknown cluster paths now return Not Found |
| Cluster content | `src/data/cluster-pages.ts` | Added independent informational content for `/misoprostol`, `/products`, `/order`, `/delivery`, and `/pharmacies` | High; clinical/legal review still needed |
| Duplicate source data | `src/data/seo-content-batch-05.json`, `-06.json`, `-07.json`, `docs/duplicate-article-content-archive-2026-11-24.json` | Archived all seven duplicate records and removed only the redundant batch copies; retained original effective article records | High; static source verification shows 52 records / 52 unique slugs |
| Article loading | `src/data/articles.ts` | Fail fast on duplicate slugs rather than silently deduplicating | High; fresh CI pending |
| Sitemap generation | `scripts/generate-sitemap.mjs` | Fail fast on duplicate slugs rather than warning and skipping | High; 89 current sitemap URLs preserved in source |
| SEO validation | `scripts/seo-validate.mjs` | Check raw slugs before effective-article processing | Medium; fresh CI pending |
| SSR validation | `scripts/ssr-verify.mjs` | Added per-route H1/Suspense checks and excluded sitemap-excluded legacy redirect aliases from indexable-page checks | High; fresh CI pending |
| Prerender metadata | `scripts/prerender.mjs` | Strip template route metadata for non-home pages and assert unique tags, canonical, H1, and JSON-LD | High; full build pending |
| Cluster internal linking | `src/data/seo-supporting-articles.json` | Added contextual internal link from ectopic-pregnancy safety article to Saudi pillar | Medium; cluster audit pending |
| Audit records | `docs/FEMSEHA-COMPREHENSIVE-AUDIT-2026-11-24.md`, this matrix | Documented findings, implemented changes, CI status, and remaining work | Low |

## Audited but not modified

| Area | Files | Decision |
|---|---|---|
| Redirect behavior | `public/_redirects` | Preserved unchanged; verify actual redirect/canonical behavior before changing slash policy |
| Sitemap output | `public/sitemap.xml`, `public/sitemap-index.xml` | Existing 89 URL set preserved; no URL rename or mass slash normalization |
| Home HTML template | `index.html` | Existing homepage title, description, canonical, verification tags, OG/Twitter tags, and home schema preserved |
| SEO support data | `src/data/seo-supporting-faq.json`, `seo-cluster-links.json`, `seo-pillar-overrides.json`, `seo-legacy-overrides.json`, `seo-content-overrides.json`, `keyword-map.json` | Needs deeper content, source, and keyword-intent review |
| Images | `src/data/image-seo-overrides.ts`, `public/images/**` | Needs image existence, relevance, dimensions, and alt-text audit |
| Dependencies | `package.json`, `package-lock.json` | Security/compatibility review remains separate; no broad dependency upgrade in this patch |
| Workflows | `.github/workflows/seo-indexing-audit.yml` | Existing workflow was inspected; latest code changes still need fresh CI evidence |

## Guardrails
- Keep PR #76 Draft. Do not merge.
- Do not deploy Production.
- Cloudflare Pages preview auto-deployments are temporarily disabled with owner approval; production branch remains `main`.
- No DNS, SSL, nameserver, or domain changes.
- Preserve current URL and sitemap membership unless a specific URL-level review supports a change.
- Do not rewrite medically sensitive article claims without qualified review.
