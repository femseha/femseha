import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { SITE, DOCTOR } from './data/site';
import { getArticleBySlug } from './data/articles';
import { articleJsonLd, breadcrumbJsonLd, doctorJsonLd, organizationJsonLd, websiteJsonLd } from './lib/seo';

export type RenderResult = {
  html: string;
  title: string;
  description: string;
  canonical: string;
  type: string;
  jsonLd: object[];
};

const cleanBrand = (value: string) =>
  value
    .replace(/منصة\s+فصيحة\s+الطبية/g, 'FemSeha | فيم صحة')
    .replace(/فصيحة الطبية/g, 'FemSeha الطبية')
    .replace(/منصة فصيحة/g, 'منصة FemSeha');

export function render(url: string): RenderResult {
  const articleMatch = url.match(/^\/articles\/([^/]+)\/?$/);
  const article = articleMatch ? getArticleBySlug(articleMatch[1]) : undefined;

  let title = SITE.title;
  let description = SITE.description;
  let canonical = url === '/' ? SITE.url : `${SITE.url}${url.replace(/\/$/, '')}`;
  let type = 'website';
  let jsonLd: object[] = [websiteJsonLd()];

  if (article) {
    title = `${article.title} | منصة فصيحة الطبية`;
    description = article.summary.slice(0, 160);
    type = 'article';
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
  } else if (url === '/articles') {
    title = 'الأدلة الطبية وصحة المرأة | FemSeha';
    description = 'مكتبة FemSeha للأدلة التثقيفية في صحة المرأة والحمل والخصوبة والدورة والصحة الإنجابية.';
  } else if (url === '/doctor') {
    title = `عن الطبيب | ${DOCTOR.name} | منصة فصيحة الطبية`;
    description = `${DOCTOR.name} — ${DOCTOR.title}. ${DOCTOR.experience}. استشارات طبية تخصصية في صحة المرأة والتوليد والعقم.`;
    jsonLd = [websiteJsonLd(), organizationJsonLd(), doctorJsonLd(), breadcrumbJsonLd([
      { name: 'الرئيسية', href: '/' },
      { name: 'عن الطبيب', href: '/doctor' }
    ])];
  } else if (url === '/consultation') {
    title = `الاستشارة الطبية | ${DOCTOR.name} | منصة فصيحة الطبية`;
    description = `احجزي استشارتك الطبية مع ${DOCTOR.name} في صحة المرأة والتوليد والعقم.`;
    jsonLd = [websiteJsonLd(), doctorJsonLd(), breadcrumbJsonLd([
      { name: 'الرئيسية', href: '/' },
      { name: 'الاستشارة الطبية', href: '/consultation' }
    ])];
  } else if (url === '/medical-disclaimer') {
    title = 'إخلاء المسؤولية الطبية | منصة فصيحة الطبية';
    description = 'إخلاء المسؤولية الطبية لمنصة فصيحة: المحتوى تثقيفي عام بإشراف طبي ولا يغني عن التقييم الطبي المباشر.';
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

  return { html, title: cleanBrand(title), description: cleanBrand(description), canonical, type, jsonLd };
}
