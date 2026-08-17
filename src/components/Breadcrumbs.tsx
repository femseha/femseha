import { Link } from "react-router-dom";
import type { Crumb } from "@/data/types";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسار التنقل" className="mb-5">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.href}-${i}`} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="font-semibold text-ink-700">
                  {item.name}
                </span>
              ) : (
                <Link to={item.href} className="hover:text-brand-700">
                  {item.name}
                </Link>
              )}
              {!isLast && <span aria-hidden="true">‹</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
