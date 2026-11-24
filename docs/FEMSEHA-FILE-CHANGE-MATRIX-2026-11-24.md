# File Change Matrix — FemSeha Audit
| Area | Files | Required work | Risk |
|---|---|---|---|
| SSR and routing | src/App.tsx, src/entry-server.tsx, src/pages/ClusterPage.tsx, src/pages/NotFoundPage.tsx, src/pages/*Entry*.tsx | Ensure eager SSR route modules, proper 404 behavior, exact route metadata | High |
| Cluster content mapping | src/data/cluster-pages.ts, src/data/gulf-coverage.ts | Explicitly map all live cluster routes; remove implicit Saudi fallback | High |
| Article source of truth | src/data/articles.ts, articles.json, seo-supporting-articles.json, seo-content-batch-01..11.json | Compare duplicate slugs and preserve unique information before resolving duplicates | High |
| Sitemap | scripts/generate-sitemap.mjs, public/sitemap.xml, public/sitemap-index.xml | Reject duplicate slugs; check sitemap/canonical route parity without changing current URLs | High |
| SEO validation | scripts/seo-validate.mjs, scripts/audit-indexing.mjs | Detect raw duplicates, exact route/meta/canonical consistency | Medium |
| SSR validation | scripts/ssr-verify.mjs, scripts/ssr-entry.tsx, scripts/prerender-html.mjs, scripts/prerender.mjs | Assert real H1, title, description, one canonical, one metadata set for every sitemap URL | High |
| HTML template | index.html | Preserve home metadata and valid global verification tags while ensuring other routes have one route-specific head | High |
| Redirects | public/_redirects | Verify existing redirects and slash behavior; keep unchanged until evidence review | High |
| Dependencies | package.json, package-lock.json | Full audit and isolated compatibility work for React Router advisories | High |
| SEO/content quality | src/data/seo-content-overrides.json, src/data/seo-pillar-overrides.json, src/data/seo-legacy-overrides.json, src/data/keyword-map.json, src/data/image-seo-overrides.ts, public/llms.txt | Review titles, descriptions, sources, imagery, intent map, and editorial metadata | High |
| Workflows | .github/workflows/seo-indexing-audit.yml, .github/workflows/seo-ssr-verification.yml | Expand checks; ensure release checks fail on duplicate records and metadata defects | Medium |

No medical/legal article body, canonical, URL, redirect or sitemap membership should be changed without separate review evidence and approval.
