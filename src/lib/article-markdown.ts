export type SafeArticleHref =
  | { kind: 'internal'; href: string }
  | { kind: 'external'; href: string };

export type InlineMarkdownToken =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'link'; label: string; href: string; safeHref: SafeArticleHref | null };

const CONTROL_OR_SPACE_RE = /[\u0000-\u0020\u007f]/;
const INLINE_TOKEN_RE = /(\*\*([^*\n]+)\*\*)|(\[([^\]\n]+)\]\(([^)\s]+)\))/g;

/**
 * الروابط المسموحة داخل محتوى المقال:
 * - داخلي: مسار يبدأ بشرطة مائلة واحدة ويُمرر إلى React Router.
 * - خارجي: HTTP/HTTPS فقط (ويُعرض في تبويب جديد داخل ArticleView).
 * أي scheme آخر، أو protocol-relative URL، أو backslash، مرفوض.
 */
export function classifyArticleHref(value: string): SafeArticleHref | null {
  const href = String(value || '').trim();
  if (!href || href !== value || CONTROL_OR_SPACE_RE.test(href) || href.includes('\\')) return null;

  if (href.startsWith('/') && !href.startsWith('//')) {
    try {
      const base = new URL('https://femseha.invalid');
      const parsed = new URL(href, base);
      if (parsed.origin !== base.origin) return null;
      return { kind: 'internal', href: `${parsed.pathname}${parsed.search}${parsed.hash}` };
    } catch {
      return null;
    }
  }

  try {
    const parsed = new URL(href);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (parsed.username || parsed.password) return null;
    return { kind: 'external', href: parsed.href };
  } catch {
    return null;
  }
}

/** محلل inline محدود وآمن يحافظ على النص الحالي ويدعم bold وروابط Markdown. */
export function tokenizeInlineMarkdown(text: string): InlineMarkdownToken[] {
  const tokens: InlineMarkdownToken[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(INLINE_TOKEN_RE.source, INLINE_TOKEN_RE.flags);

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) tokens.push({ type: 'text', value: text.slice(last, match.index) });
    if (match[1]) {
      tokens.push({ type: 'strong', value: match[2] });
    } else {
      const label = match[4];
      const href = match[5];
      tokens.push({ type: 'link', label, href, safeHref: classifyArticleHref(href) });
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) tokens.push({ type: 'text', value: text.slice(last) });
  return tokens;
}

export interface MarkdownLink {
  label: string;
  href: string;
  safeHref: SafeArticleHref | null;
}

export function extractMarkdownLinks(content: string): MarkdownLink[] {
  const links: MarkdownLink[] = [];
  for (const line of String(content || '').split('\n')) {
    for (const token of tokenizeInlineMarkdown(line)) {
      if (token.type === 'link') links.push(token);
    }
  }
  return links;
}

export function unsafeMarkdownLinks(content: string): string[] {
  return [...new Set(extractMarkdownLinks(content).filter((link) => !link.safeHref).map((link) => link.href))];
}

/** يعيد pathname فقط كي لا تجعل query/hash رابطاً داخلياً منشوراً يبدو مكسوراً. */
export function internalMarkdownPaths(content: string): string[] {
  const paths = extractMarkdownLinks(content)
    .filter(
      (link): link is MarkdownLink & { safeHref: Extract<SafeArticleHref, { kind: 'internal' }> } =>
        link.safeHref?.kind === 'internal'
    )
    .map((link) => new URL(link.safeHref.href, 'https://femseha.invalid').pathname);
  return [...new Set(paths)];
}
