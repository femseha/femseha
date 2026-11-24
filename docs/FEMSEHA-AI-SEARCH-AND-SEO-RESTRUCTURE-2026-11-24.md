# FemSeha: AI Search Visibility & Safe SEO Restructure
Date: 2026-11-24
Repository: femseha/femseha

## Non-negotiable preservation rules
- Do not merge or deploy this branch as part of the audit.
- Do not delete, rename, redirect, noindex, or remove existing URLs from sitemaps solely as part of this review.
- Do not rewrite currently performing pages until their Search Console clicks, impressions, queries, links, and canonical status have been reviewed.
- Preserve existing medical content pending clinical and jurisdictional review.
- No claims that FemSeha can guarantee inclusion/citation by every AI assistant or search engine.

## Primary objective
Improve the probability that search engines and AI answer systems can discover, understand, verify, and cite FemSeha as a reliable Arabic-language women's-health information source. Build on the existing site and its current organic visibility rather than replacing its structure.

## Search intent architecture
Treat the following as distinct intents, not one blended sales page:

1. Educational / informational:
   - حبوب إجهاض الحمل
   - أدوية إجهاض الحمل
   - سايتوتك / سايتوتيك
   - Misoprostol and relevant generic/brand terminology
   Explain terminology, evidence, medical risks, contraindications, warning signs, and when urgent care is needed. Medical claims require reliable references and qualified clinical review.

2. Availability / pharmacy / purchase-intent queries:
   - سايتوتك للبيع في السعودية
   - أين أجد حبوب إجهاض في الصيدليات
   These queries may be addressed only with neutral, factual information about local laws, prescription and dispensing requirements, risks of unverified sources, and how to contact a licensed healthcare professional or official regulator. Do not claim stock, offer suppliers, facilitate acquisition, or imply legal availability unless verified by an authoritative current source. Do not create doorway pages or false pharmacy listings.

3. Country / jurisdiction intent:
   Saudi Arabia, United Arab Emirates, Kuwait, Bahrain, Oman (with Muscat as a city-level target), and Qatar.
   Each country page must cite current official health/regulatory/legal sources, state its last-reviewed date, distinguish law from clinical guidance, and avoid extrapolating one country's rules to another.

4. City-level intent:
   Riyadh, Jeddah, Makkah, Madinah, Dammam, Khobar, Taif, Tabuk, Abha, Jazan, Buraydah, Al-Ahsa, Khamis Mushait, Qatif, Hail, Najran, Al-Baha, Sakaka, Arar, and Muscat.
   Keep city pages only where they provide genuinely distinct, verified local information. Avoid thin city-name substitutions, fabricated clinics/pharmacies, and unsupported claims about availability or delivery.

## Keyword mapping principles
- Map سايتوتك and سايتوتيك as spelling variants to the same relevant topic where search intent is identical; do not create near-duplicate pages just to target spelling variants.
- Map حبوب إجهاض الحمل and أدوية إجهاض الحمل to appropriate educational/regulatory pages according to intent.
- Keep commercial-sounding queries in a separate neutral access-and-regulation intent group; never turn them into transaction or supplier pages.
- Use Search Console query/page data to choose the canonical target page for each intent. Avoid cannibalization between country pages, city pages, articles, and the homepage.

## AI answer engine readiness
Prioritize durable source quality over AI-specific tricks:
- Clear author, medical reviewer, credentials, and editorial responsibility; never invent a clinician or credentials.
- Visible publication and last-medically-reviewed dates, plus a correction/contact process.
- Cite primary sources: national health ministries, medicines regulators, official legislation, WHO, and peer-reviewed clinical guidance as appropriate.
- Add concise direct answers near the top, followed by context, limitations, and source links.
- Use descriptive H1/H2 structure, explicit definitions, comparison tables only where clinically appropriate, and clear FAQ answers that match the page's actual content.
- Maintain consistent entity naming for FemSeha, active ingredients, medicines, conditions, countries, and regulators.
- Use valid structured data only when the visible page supports it (for example Organization, WebSite, Article, BreadcrumbList, and eligible author/reviewer properties). Do not add fabricated ratings, medical claims, or unsupported FAQ markup.
- Ensure important content is present in server-rendered HTML, crawlable internal links, canonical URLs, and XML sitemaps.
- Provide accessible HTML, descriptive image alt text, and fast mobile rendering.
- Track citations/mentions in AI answer products as a separate KPI from Google rankings; no schema or file can force an AI system to cite the site.

## Pages for review (preserve first; decide later)
### Geographic set
The existing 23 geographic pages are to be reviewed, not automatically reclassified or removed:
- Countries: Saudi Arabia, UAE, Kuwait, Bahrain.
- Cities: Riyadh, Jeddah, Makkah, Madinah, Dammam, Khobar, Taif, Tabuk, Abha, Jazan, Buraydah, Al-Ahsa, Khamis Mushait, Qatif, Hail, Najran, Al-Baha, Sakaka, Arar.
- Add Oman/Muscat and Qatar coverage only after confirming the current URL inventory and evidence of distinct user need; do not assume an existing route.

### Thirteen high-sensitivity medical/regulatory articles
Require clinical and country-specific legal review before substantive edits:
1. ijhad-dawai-fi-al-saudia
2. adwiyat-ijhad-alhaml-fi-al-saudia
3. cytotec-gulf-kuwait-bahrain-uae-protocols
4. danger-signs-after-medical-abortion-saudi
5. bleeding-after-medical-abortion-saudi
6. ectopic-pregnancy-abortion-medicines-saudi
7. abortion-medicines-uae-medical-guide
8. abortion-medicines-bahrain-medical-guide
9. abortion-medicines-kuwait-medical-guide
10. abortion-regulations-uae-medical-guide
11. abortion-regulations-bahrain-medical-guide
12. abortion-regulations-qatar-medical-guide
13. cytotec-in-oman-medical-guide

## Previously identified technical review items
These are audit findings to validate with tests before code changes:
- SSR route components loaded through React.lazy may not resolve as intended with renderToString; use eager SSR entry wrappers and verify generated HTML contains real page content.
- Prerendering should remove all template-level route-specific title, description, robots, canonical, Open Graph, Twitter, and JSON-LD tags before inserting one route-specific set.
- SSR verification should crawl every sitemap URL and assert a meaningful H1/body, unique canonical, and absence of Suspense/loading fallback.
- Normalize trailing-slash behavior consistently across canonical tags, sitemap URLs, internal links, and redirects, but only after inspecting current redirect rules and indexed URL variants.
- Five routes were previously observed without dedicated CLUSTER_PAGES mappings: /misoprostol, /products, /order, /delivery, /pharmacies. Verify their rendered content, metadata, canonicals, traffic, and backlinks before deciding whether to create dedicated pages or change status. Do not silently serve a Saudi pillar fallback for unrelated routes.

## Measurement plan
Baseline and compare by page, query, country, and device:
- Search Console clicks, impressions, CTR, average position, indexed/canonical state, and query-to-page mapping.
- Bing Webmaster performance and indexing where available.
- AI citation/mention checks across a fixed prompt set and repeated observation dates; record source URL and answer context.
- Referral traffic from AI assistants in analytics where available.
- Technical checks: sitemap coverage, duplicate metadata, SSR content, canonical consistency, structured-data validity, mobile performance, and crawl errors.

## Release gate
No content, URL, indexability, canonical, sitemap, or deployment change should be merged until:
1. Search Console history and backlinks for affected URLs are reviewed.
2. Medical claims have a named, qualified reviewer and authoritative citations.
3. Country-specific regulatory claims have current official sources and review dates.
4. Automated SSR/metadata/canonical tests pass.
5. The user explicitly approves the final Draft PR for merge/deploy separately.

## Work completed in this Draft PR on 2026-11-24
- Added SSR-aware entry wrappers for DoctorPage, ConsultationPage, DisclaimerPage, NotFoundPage, ClusterPage, and PregnancyCalculatorPage; App now imports route entry modules rather than wrapping these routes directly in React.lazy. Existing ArticlesPage, ArticleView, and AdminPage aliases remain intact.
- Added a reusable prerender HTML metadata cleanup helper. It removes template-level title, description, robots, canonical, Open Graph, Twitter, and JSON-LD metadata before route-specific metadata is injected.
- Added a Node regression test for duplicate prerender metadata and included it in the test and release verification scripts.
- Strengthened the SSR route verifier to flag unresolved Suspense fallback text and missing H1 headings on public routes.
- Updated public/llms.txt with source discovery guidance, core page links, Gulf/city coverage links, and explicit cautions against inferring pharmacy stock or legal availability from a city page.

## Cloudflare protection review and action
- Zone plan observed: Free Website.
- Existing custom WAF rule remains active to block sensitive-file and common CMS exploit probes.
- Browser Integrity Check (browser_check) is enabled; zone security level is medium; minimum TLS is 1.2; HTTPS redirect is enabled.
- Added a custom Managed Challenge rule in the existing custom firewall ruleset:
  - Ref: challenge_empty_user_agent
  - Expression: (http.user_agent eq "" and not cf.client.bot)
  - Action: Managed Challenge
  - Intent: challenge requests with an empty User-Agent while exempting verified bots.
- This does not block VPN users as a category. VPN/proxy use alone is not reliable evidence of fraud, and blanket VPN blocking can exclude genuine readers and legitimate crawlers.
- The older zone rate-limits endpoint returned HTTP 410 (deprecated), and the current zone had no http_ratelimit entrypoint ruleset when queried. Do not claim a rate-limit policy is active. Check current Free-plan dashboard availability before creating a rate rule.
- Bot Fight Mode was previously reported as enabled in the earlier review, but the current zone-settings API does not expose a readable bot_fight_mode setting. Verify its toggle in Cloudflare Dashboard > Security > Settings > Bot traffic before relying on it.
- Review Security Events after the challenge rule has accumulated traffic. If legitimate monitoring or readers are challenged, adjust the rule rather than adding broad country or VPN blocks.

## Validation status
- GitHub file writes succeeded on this branch.
- Automated tests/build/typecheck have not yet been run in a repository runtime. Do not mark this PR as passing until CI or a local release verification confirms it.
- No content page, URL, canonical, robots policy, sitemap membership, or production deployment was changed in this work.

## Content-source and intent audit from CI
- The successful SEO validator run reported 29 articles without structured medical-source references. Added source arrays for those 29 articles in the SEO content override layer without rewriting their body text. The next CI run must confirm the warnings were removed and the URLs remain valid.
- The same validator reported repeated keyword-map target warnings. These are not automatically errors: several pages legitimately cover spelling variants and close synonyms. However, the current map mixes informational, local, and commercial intents on some URLs.
- High-priority example: /products, /order, /delivery, and /pharmacies appear in the keyword map as sales/order/delivery/pharmacy intent routes, while the earlier route audit found these paths lack dedicated cluster-page mappings and may fall back to the Saudi pillar. Do not delete, redirect, noindex, or remove them from the sitemap yet. First inspect their GSC history and backlinks, then decide whether to consolidate these intents into a dedicated neutral regulatory/medicine-access page.
- The prior validator also flagged one sitemap URL not represented in the article source list: /طريقة-حساب-عمر-الحمل. Check whether it is an intended static route or a stale sitemap entry before changing the sitemap.
- Adding source references is not equivalent to clinical review. A qualified reviewer must verify that every cited source supports the actual visible claims, and country-specific legal claims must be checked against current official law.

## AI citation quality next steps
- Keep one canonical target per genuine search intent; allow spelling variants such as سايتوتك/سايتوتيك to resolve to the same page when intent is identical.
- Separate purchase/availability queries from transactional supply. Answer them with verified legal/dispensing information and official regulator links, never unsupported stock or delivery claims.
- After review, create Qatar, Oman, and Muscat pages only if they contain distinct local information, official sources, and a qualified review date. They are not published or added to the sitemap in this PR.
