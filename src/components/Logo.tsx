import React from 'react';
import { Link } from 'react-router-dom';

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <span className="text-2xl font-black text-rose-600 tracking-tight">
        فيم<span className="text-slate-800">صحة</span>
      </span>
    </Link>
  );
}

export default Logo;
