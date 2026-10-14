import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export function EmptyState({
  title,
  children,
  action,
  icon,
  className,
  code = "NO DATA",
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  code?: string;
}) {
  return (
    <div className={cx("relative overflow-hidden border border-dashed border-line-strong px-6 py-10 sm:px-10", className)}>
      <span aria-hidden="true" data-code={code} className="display pointer-events-none absolute -right-2 -top-3 select-none text-[4.5rem] text-white/[0.025] before:content-[attr(data-code)] sm:text-[7rem]" />
      <div className="relative max-w-lg">
        {icon ? <div className="mb-4 text-mist">{icon}</div> : null}
        <p className="wide text-lg font-semibold text-paper">{title}</p>
        {children ? <div className="mt-2 text-sm leading-relaxed text-silver">{children}</div> : null}
        {action ? <div className="mt-6 flex flex-wrap gap-3">{action}</div> : null}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} aria-hidden="true" />;
}

export function LoadingBlock({ rows = 4, label = "Carregando" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-2">
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
