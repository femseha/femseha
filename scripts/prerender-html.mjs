const ROUTE_META_NAME = /^(description|robots|twitter:[^\s]+)$/i;
const ROUTE_META_PROPERTY = /^og:/i;

export function stripRouteMetadata(html) {
  return String(html)
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<link\b(?=[^>]*\brel=["\x27]canonical["\x27])[^>]*>/gi, "")
    .replace(/<meta\b[^>]*>/gi, (tag) => {
      const name = tag.match(/\bname=["\x27]([^"\x27]+)["\x27]/i)?.[1];
      const property = tag.match(/\bproperty=["\x27]([^"\x27]+)["\x27]/i)?.[1];
      return (name && ROUTE_META_NAME.test(name)) || (property && ROUTE_META_PROPERTY.test(property)) ? "" : tag;
    })
    .replace(/<script\b(?=[^>]*\btype=["\x27]application\/ld\+json["\x27])[^>]*>[\s\S]*?<\/script>/gi, "");
}

export function injectRouteHead(html, head) {
  const cleaned = stripRouteMetadata(html);
  if (!/<\/head>/i.test(cleaned)) throw new Error("HTML template is missing </head>");
  return cleaned.replace(/<\/head>/i, `${head}\n</head>`);
}
