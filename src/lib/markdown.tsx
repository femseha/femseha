import React from 'react';
import { Link } from 'react-router-dom';
import { resolveLink } from './links';

/**
 * عرض محتوى المقال (نص منسّق بسيط) كعناصر React آمنة — منصة فصيحة.
 *
 * مستخرج من src/pages/ArticleView.tsx كوحدة مستقلة قابلة للاختبار، بنفس
 * التنسيقات المدعومة سابقاً (عناوين، قوائم، فاصل، **تأكيد**) مع إصلاح الروابط:
 *
 *   - [نص](/articles/slug)            → تنقّل داخلي (react-router) دون كسر الـrouting.
 *   - [نص](https://femseha.com/x)     → يُعامل كرابط داخلي (نفس نطاق الموقع).
 *   - [نص](https://www.moh.gov.sa/)   → رابط خارجي + target="_blank" rel="noopener noreferrer".
 *   - [نص](url "عنوان")               → مدعوم (كان العنوان يُدرج داخل href فيكسر الرابط).
 *   - رابط مكتوب صريحاً في النص       → يصبح قابلاً للنقر (كان يبقى نصاً عادياً).
 *   - javascript:/data: وأي مخطط خطر  → لا يُعرض كرابط أبداً (يبقى نصاً فقط).
 */

const LINK_CLASS = 'text-blue-700 font-semibold underline underline-offset-2 hover:text-blue-900';

/** ماركداون: [نص](رابط "عنوان اختياري") | **تأكيد** | رابط صريح داخل النص */
const INLINE_RE =
  /(\*\*[^*]+\*\*)|(\[[^\]]+\]\(\s*<?[^\s)>]+>?(?:\s+"[^"]*")?\s*\))|((?:https?:\/\/|mailto:)[^\s<>"'()[\]]+)/g;

const MARKDOWN_LINK_ONE = /^\[([^\]]+)\]\(\s*<?([^\s)>]+)>?(?:\s+"([^"]*)")?\s*\)$/;

/** حذف علامات ترقيم لاصقة بنهاية رابط مكتوب صريحاً داخل جملة */
function trimTrailingPunctuation(url: string): { href: string; trailing: string } {
  const m = /[.,;:!؟،؛)]+$/.exec(url);
  if (!m) return { href: url, trailing: '' };
  return { href: url.slice(0, m.index), trailing: m[0] };
}

function LinkNode({
  href,
  children,
  keyName,
}: {
  href: string;
  children: React.ReactNode;
  keyName: string;
}) {
  const resolved = resolveLink(href);

  if (resolved.kind === 'unsafe') {
    // رابط خطر: يُعرض نصه فقط — لا يتحول أبداً إلى href قابل للنقر.
    return <span key={keyName}>{children}</span>;
  }

  if (resolved.kind === 'internal') {
    return (
      <Link key={keyName} to={resolved.href} className={LINK_CLASS}>
        {children}
      </Link>
    );
  }

  if (resolved.kind === 'hash') {
    return (
      <a key={keyName} href={resolved.href} className={LINK_CLASS}>
        {children}
      </a>
    );
  }

  return (
    <a
      key={keyName}
      href={resolved.href}
      target="_blank"
      rel="noopener noreferrer"
      className={LINK_CLASS}
    >
      {children}
    </a>
  );
}

/** عرض النص الآمن: يدعم **الخط العريض** والروابط (داخلية وخارجية) */
export function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = new RegExp(INLINE_RE.source, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];

    if (tok.startsWith('**')) {
      parts.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-bold text-slate-900">
          {tok.slice(2, -2)}
        </strong>
      );
    } else if (tok.startsWith('[')) {
      const mm = MARKDOWN_LINK_ONE.exec(tok);
      if (mm) {
        const [, label, href] = mm;
        parts.push(
          <LinkNode key={`${keyPrefix}-l${i}`} keyName={`${keyPrefix}-l${i}`} href={href}>
            {label}
          </LinkNode>
        );
      } else {
        parts.push(tok);
      }
    } else {
      // رابط مكتوب صريحاً داخل النص
      const { href, trailing } = trimTrailingPunctuation(tok);
      parts.push(
        <LinkNode key={`${keyPrefix}-u${i}`} keyName={`${keyPrefix}-u${i}`} href={href}>
          {href}
        </LinkNode>
      );
      if (trailing) parts.push(trailing);
    }

    last = m.index + tok.length;
    i += 1;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** محول محتوى المقال (نص منسّق بسيط) إلى عناصر React آمنة — سمة فاتحة */
export function ContentBlocks({ content }: { content: string }) {
  const lines = String(content || '').split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = (idx: number) => {
    if (listItems.length === 0) return;
    const items = listItems.map((t, j) => (
      <li key={`li-${idx}-${j}`} className="text-slate-700 leading-loose">
        {renderInline(t, `li-${idx}-${j}`)}
      </li>
    ));
    if (listType === 'ol') {
      blocks.push(
        <ol key={`ol-${idx}`} className="list-decimal pr-6 space-y-2 mb-4">
          {items}
        </ol>
      );
    } else {
      blocks.push(
        <ul key={`ul-${idx}`} className="list-disc pr-6 space-y-2 mb-4">
          {items}
        </ul>
      );
    }
    listItems = [];
    listType = null;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) {
      flushList(idx);
      return;
    }
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line)) {
      flushList(idx);
      blocks.push(<hr key={`hr-${idx}`} className="my-6 border-slate-200" />);
      return;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^#{1,3}\s+(.*)$/))) {
      flushList(idx);
      blocks.push(
        <h2 key={`h-${idx}`} className="text-xl font-bold text-slate-900 mt-8 mb-3 leading-snug">
          {renderInline(m[1], `h-${idx}`)}
        </h2>
      );
      return;
    }
    if ((m = line.match(/^#{4,6}\s+(.*)$/))) {
      flushList(idx);
      blocks.push(
        <h3 key={`h3-${idx}`} className="text-lg font-bold text-slate-800 mt-6 mb-2 leading-snug">
          {renderInline(m[1], `h3-${idx}`)}
        </h3>
      );
      return;
    }
    if ((m = line.match(/^[*•]\s+(.*)$/))) {
      if (listType !== 'ul') {
        flushList(idx);
        listType = 'ul';
      }
      listItems.push(m[1]);
      return;
    }
    if ((m = line.match(/^\d+[.)]\s+(.*)$/))) {
      if (listType !== 'ol') {
        flushList(idx);
        listType = 'ol';
      }
      listItems.push(m[1]);
      return;
    }
    flushList(idx);
    blocks.push(
      <p key={`p-${idx}`} className="text-slate-700 text-base leading-loose mb-4">
        {renderInline(line, `p-${idx}`)}
      </p>
    );
  });
  flushList(lines.length);
  return <>{blocks}</>;
}

export default ContentBlocks;
