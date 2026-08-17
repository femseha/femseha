type Props = { className?: string; showText?: boolean };

export function Logo({ className = "", showText = true }: Props) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 64 64"
        role="img"
        aria-label="شعار دليل صحة المرأة"
        className="h-11 w-11 shrink-0"
      >
        <rect width="64" height="64" rx="16" className="fill-brand-700" />
        <path
          d="M32 49s-15-9.2-15-20.3A9 9 0 0 1 32 22a9 9 0 0 1 15 6.7C47 39.8 32 49 32 49z"
          fill="#ffffff"
        />
        <path d="M29 27.5h6v4.2h4.2v6H35v4.2h-6v-4.2h-4.2v-6H29z" className="fill-brand-700" />
      </svg>
      {showText && (
        <span className="flex flex-col leading-tight">
          <span className="text-lg font-extrabold text-ink-900">دليل صحة المرأة</span>
          <span className="text-[11px] font-medium text-brand-700">SehaHer · تثقيف طبي</span>
        </span>
      )}
    </span>
  );
}
