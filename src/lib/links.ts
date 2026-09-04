/**
 * تحليل روابط المحتوى (Markdown) بشكل آمن — منصة فصيحة.
 *
 * قاعدة واحدة لكل مسارات العرض والفحص:
 *   - الروابط الداخلية (تبدأ بـ / أو تشير لنطاق الموقع نفسه) → تنقّل داخلي (react-router).
 *   - الروابط الخارجية الآمنة (http/https/mailto/tel) → وسم <a> مع target/rel.
 *   - أي مخطط خطر (javascript:/data:/vbscript:/file: …) → غير مسموح إطلاقاً.
 *
 * لا تحذف هذه الوحدة أي رابط صحيح: الروابط الصالحة تبقى كما هي، والخطرة فقط
 * تُرفض (وتُرفض عند النشر أيضاً في article-rules.ts + scripts/admin-publish.mjs).
 */
import { SITE } from "../data/site";

export type LinkKind = "internal" | "external" | "hash" | "unsafe";

export interface ResolvedLink {
  kind: LinkKind;
  /** الرابط النهائي الجاهز للاستخدام (فارغ عند unsafe) */
  href: string;
}

/** المخططات المسموح بها فقط — ما عداها يُرفض */
export const SAFE_SCHEMES = ["http:", "https:", "mailto:", "tel:"] as const;

const SITE_ORIGIN = (() => {
  try {
    return new URL(SITE.url).origin;
  } catch {
    return "https://femseha.com";
  }
})();

/** أصول الموقع نفسه (تُعامل روابطها كروابط داخلية للحفاظ على التنقّل والـrouting) */
function isSameSiteOrigin(origin: string): boolean {
  return origin === SITE_ORIGIN;
}

/**
 * تحليل href من ماركداون إلى نوعه ورابطه النهائي.
 * لا يرمي استثناءً أبداً — الروابط غير الصالحة تُصنّف unsafe.
 */
export function resolveLink(raw: string): ResolvedLink {
  const value = String(raw || "")
    .trim()
    .replace(/^<|>$/g, "")
    .trim();
  if (!value) return { kind: "unsafe", href: "" };

  // مرساة داخل نفس الصفحة
  if (value.startsWith("#")) return { kind: "hash", href: value };

  // مسار داخلي نسبي (وليس //host الذي يعني بروتوكولاً ضمنياً)
  if (value.startsWith("/") && !value.startsWith("//")) {
    return { kind: "internal", href: value };
  }

  let url: URL;
  try {
    url = new URL(value, SITE_ORIGIN);
  } catch {
    return { kind: "unsafe", href: "" };
  }

  if (!(SAFE_SCHEMES as readonly string[]).includes(url.protocol)) {
    return { kind: "unsafe", href: "" };
  }

  if ((url.protocol === "http:" || url.protocol === "https:") && isSameSiteOrigin(url.origin)) {
    return { kind: "internal", href: `${url.pathname}${url.search}${url.hash}` };
  }

  return { kind: "external", href: url.href };
}

/** هل هذا الرابط خطر (يجب رفضه عند النشر)؟ */
export function isUnsafeLink(raw: string): boolean {
  return resolveLink(raw).kind === "unsafe";
}

/**
 * المسار الداخلي لرابط (نسبي أو مطلق على نطاق الموقع) — أو null إن لم يكن داخلياً.
 * يُستخدم في فحص «الروابط الداخلية المكسورة» قبل النشر.
 */
export function internalPath(raw: string): string | null {
  const r = resolveLink(raw);
  if (r.kind !== "internal") return null;
  return r.href.split("#")[0].split("?")[0] || "/";
}

/** كل روابط الماركداون في نص — [نص](رابط) مع دعم العنوان الاختياري */
export const MARKDOWN_LINK_RE = /\[([^\]]+)\]\(\s*<?([^\s)>]+)>?(?:\s+"([^"]*)")?\s*\)/g;

export interface MarkdownLink {
  label: string;
  href: string;
  index: number;
  raw: string;
}

export function extractMarkdownLinks(text: string): MarkdownLink[] {
  const out: MarkdownLink[] = [];
  for (const m of String(text || "").matchAll(MARKDOWN_LINK_RE)) {
    out.push({ label: m[1], href: m[2], index: m.index ?? 0, raw: m[0] });
  }
  return out;
}
