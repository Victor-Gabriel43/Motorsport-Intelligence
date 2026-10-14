import { brand } from "@/config/brand";
import { cx } from "@/lib/format";

/**
 * APEX symbol — a hairpin chevron with a red point marking the inside apex
 * of the corner, the point a racing line clips.
 */
export function ApexSymbol({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path d="M2 29 13.2 3h5.6L30 29h-5.4L16 9.2 7.4 29Z" fill="currentColor" />
      <path d="M16 15.5 19.2 23h-6.4Z" fill="var(--color-apex)" />
    </svg>
  );
}

export function Wordmark({ className, withDescriptor = false }: { className?: string; withDescriptor?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <ApexSymbol className="h-[1.15em] w-[1.15em] shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="display text-[1.05em] tracking-[-0.02em]">{brand.name}</span>
        {withDescriptor ? (
          <span className="mt-1 font-mono text-[0.42em] uppercase tracking-[0.28em] text-mist">{brand.descriptor}</span>
        ) : null}
      </span>
    </span>
  );
}
