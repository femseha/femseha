import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { SITE, DOCTOR } from './data/site';
import { CLUSTER_PAGES } from './data/cluster-pages';
import { getArticleBySlug } from './data/articles';
import { articleJsonLd, articleSeoImage, breadcrumbJsonLd, doctorJsonLd, organizationJsonLd, websiteJsonLd } from './lib/seo';

export type RenderResult = {
  html: string;
  title: string;
  description: string;
  canonical: string;
  type: string;
  image?: string;
  jsonLd: object[];
};

const cleanBrand = (value: string) => value;

export function render(url: string): RenderResult {
  const articleMatch = url.match(/^\/articles\/([^/]+)\/?$/);
  const article = articleMatch ? getArticleBySlug(articleMatch[1]) : undefined;
  const normalizedUrl = url === '/' ? '/' : url.replace(/\/$/, '');
  const clusterPage = CLUSTER_PAGES[normalizedUrl];

  let title = SITE.title;
  let description = SITE.description;
  let canonical = url === '/' ? SITE.url : `${SITE.url}${url.replace(/\/$/, '')}`;
  let type = 'website';
  let image: string | undefined;
  let jsonLd: object[] = [websiteJsonLd()];

  if (article) {
    title = `${article.title} | FemSeha`;
    description = article.summary.slice(0, 160);
    type = 'article';
    image = articleSeoImage(article) || undefined;
    jsonLd = [
      websiteJsonLd(),
      articleJsonLd(article),
      breadcrumbJsonLd([
        { name: 'الرئيسية', href: '/' },
        { name: 'الأدلة الطبية', href: '/articles' },
        { name: article.title, href: `/articles/${article.slug}` }
      ])
    ];
    if (article.faq?.length) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      });
    }
  } else if (clusterPage) {
    title = clusterPage.title;
    description = clusterPage.description;
    image = clusterPage.image ? new URL(clusterPage.image, SITE.url).href : undefined;
    jsonLd = [
      websiteJsonLd(),
      breadcrumbJsonLd([
        { name: 'الرئيسية', href: '/' },
        ...(clusterPage.breadcrumb || []).map((name) => ({ name, href: clusterPage.path }))
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: clusterPage.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      }
    ];
  } else if (url === '/articles') {
    title = 'الأدلة الطبية وصحة المرأة | FemSeha';
    description = 'مكتبة FemSeha للأدلة التثقيفية في صحة المرأة والحمل والخصوبة والدورة والصحة الإنجابية.';
  } else if (url === '/doctor') {
    title = `عن الطبيب | ${DOCTOR.name} | FemSeha`;
    description = `${DOCTOR.name} — ${DOCTOR.title}. ${DOCTOR.experience}. استشارات طبية تخصصية في صحة المرأة والتوليد والعقم.`;
    jsonLd = [websiteJsonLd(), organizationJsonLd(), doctorJsonLd(), breadcrumbJsonLd([
      { name: 'الرئيسية', href: '/' },
      { name: 'عن الطبيب', href: '/doctor' }
    ])];
  } else if (url === '/consultation') {
    title = `الاستشارة الطبية | ${DOCTOR.name} | FemSeha`;
    description = `احجزي استشارتك الطبية مع ${DOCTOR.name} في صحة المرأة والتوليد والعقم.`;
    jsonLd = [websiteJsonLd(), doctorJsonLd(), breadcrumbJsonLd([
      { name: 'الرئيسية', href: '/' },
      { name: 'الاستشارة الطبية', href: '/consultation' }
    ])];
  } else if (url === '/medical-disclaimer') {
    title = 'إخلاء المسؤولية الطبية | FemSeha';
    description = 'إخلاء المسؤولية الطبية لمنصة FemSeha: المحتوى تثقيفي عام بإشراف طبي ولا يغني عن التقييم الطبي المباشر.';
    jsonLd = [websiteJsonLd(), breadcrumbJsonLd([
      { name: 'الرئيسية', href: '/' },
      { name: 'إخلاء المسؤولية الطبية', href: '/medical-disclaimer' }
    ])];
  }

  const html = renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  );

  return { html, title: cleanBrand(title), description: cleanBrand(description), canonical, type, image, jsonLd };
}
