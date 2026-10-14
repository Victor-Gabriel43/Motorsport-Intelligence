import type { Provenance } from "@/types/models";
import { cx, formatDate } from "@/lib/format";

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "apex" | "demo" | "go" | "outline"; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap px-1.5 py-0.5 font-mono text-[0.62rem] font-medium uppercase leading-none tracking-[0.12em]",
        tone === "neutral" && "bg-white/[0.06] text-silver",
        tone === "apex" && "bg-apex text-white",
        tone === "demo" && "border border-dashed border-signal/60 text-signal",
        tone === "go" && "bg-go/15 text-go",
        tone === "outline" && "border border-line-strong text-silver",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Visible label describing where a piece of data comes from. */
export function ProvenanceBadge({ provenance, className }: { provenance: Provenance; className?: string }) {
  if (provenance.kind === "demo") return <Badge tone="demo" className={className}>Demonstração</Badge>;
  if (provenance.kind === "reference")
    return (
      <Badge tone="outline" className={className}>
        {provenance.updatedAt
          ? `Verificado · ${formatDate(provenance.updatedAt, { day: "2-digit", month: "short", year: "numeric" })}`
          : "Referência editorial"}
      </Badge>
    );
  return (
    <Badge tone="go" className={className}>
      {provenance.sourceName}
      {provenance.updatedAt ? ` · ${formatDate(provenance.updatedAt, { day: "2-digit", month: "short", year: "numeric" })}` : ""}
    </Badge>
  );
}
