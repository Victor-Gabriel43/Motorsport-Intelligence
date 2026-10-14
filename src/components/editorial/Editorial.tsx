import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { ProvenanceBadge } from "@/components/ui/Badge";
import type { Provenance } from "@/types/models";
import { cx } from "@/lib/format";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10", className)}>{children}</div>;
}

/** Large editorial page opening used by every top-level section. */
export function PageHeader({
  code,
  kicker,
  title,
  dek,
  aside,
  children,
}: {
  code: string;
  kicker: string;
  title: ReactNode;
  dek?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="tech-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Container className="relative pb-10 pt-14 sm:pb-14 sm:pt-20">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.68rem] text-apex-ink">{code}</span>
          <span className="h-px w-8 bg-line-strong" />
          <span className="kicker">{kicker}</span>
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end">
          <div className="animate-rise">
            <h1 className="display text-[clamp(2.6rem,7.5vw,6.5rem)] text-paper">{title}</h1>
            {dek ? <p className="mt-6 max-w-2xl text-base leading-relaxed text-silver sm:text-lg">{dek}</p> : null}
          </div>
          {aside ? <div className="animate-fade lg:pb-2">{aside}</div> : null}
        </div>
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </header>
  );
}

export function SectionHeader({ code, title, to, linkLabel = "Ver tudo", dek, className }: { code?: string; title: ReactNode; to?: string; linkLabel?: string; dek?: ReactNode; className?: string }) {
  return (
    <div className={cx("mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-t border-line pt-5", className)}>
      <div>
        {code ? <span className="kicker mb-3 block">{code}</span> : null}
        <h2 className="display-condensed text-[clamp(1.9rem,4vw,3.2rem)] text-paper">{title}</h2>
        {dek ? <p className="mt-3 max-w-xl text-sm leading-relaxed text-silver">{dek}</p> : null}
      </div>
      {to ? (
        <Link to={to} className="group inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-silver transition-colors hover:text-paper">
          {linkLabel}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export function MetaList({ items, className, columns = 2 }: { items: { label: string; value: ReactNode }[]; className?: string; columns?: 2 | 3 | 4 }) {
  return (
    <dl
      className={cx(
        "grid gap-px overflow-hidden border border-line bg-line",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-2 sm:grid-cols-3",
        columns === 4 && "grid-cols-2 md:grid-cols-4",
        className,
      )}
    >
      {items.map((i) => (
        <div key={i.label} className="bg-ink px-4 py-3.5">
          <dt className="kicker">{i.label}</dt>
          <dd className="mt-1.5 text-sm font-medium text-paper">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Footnote showing the provenance of the data on a page. */
export function SourceNote({ provenance, officialUrl, className }: { provenance: Provenance; officialUrl?: string; className?: string }) {
  return (
    <aside className={cx("flex flex-col gap-3 border-l-2 border-line-strong py-1 pl-4 text-xs leading-relaxed text-mist sm:flex-row sm:items-center sm:gap-4", className)}>
      <ProvenanceBadge provenance={provenance} />
      <span>
        {provenance.note}
        {officialUrl ? (
          <>
            {" "}
            Fonte oficial:{" "}
            <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="link-underline text-silver">
              {officialUrl.replace(/^https?:\/\/(www\.)?/, "")}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </>
        ) : null}
      </span>
    </aside>
  );
}

/** Thin coloured rule identifying a championship's sub-identity. */
export function AccentRule({ color, className }: { color: string; className?: string }) {
  return <span aria-hidden="true" className={cx("block h-[3px] w-10", className)} style={{ background: color }} />;
}
