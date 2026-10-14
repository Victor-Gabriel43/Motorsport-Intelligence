import { ChevronDown, X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cx } from "@/lib/format";

export interface Option {
  value: string;
  label: string;
  count?: number;
}

/** Horizontal, keyboard-friendly single-select chip group (radio semantics). */
export function ChipGroup({ label, options, value, onChange, className }: { label: string; options: Option[]; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx("scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cx(
              "inline-flex shrink-0 items-center gap-2 border px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors duration-150",
              active ? "border-paper bg-paper text-ink" : "border-line-strong text-silver hover:border-paper/50 hover:text-paper",
            )}
          >
            {o.label}
            {o.count !== undefined ? <span className={cx("tabular", active ? "text-ink/60" : "text-mist")}>{o.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function SelectField({ label, value, options, onChange, className }: { label: string; value: string; options: Option[]; onChange: (v: string) => void; className?: string }) {
  const id = useId();
  return (
    <div className={cx("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="kicker">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border border-line-strong bg-graphite py-2.5 pl-3 pr-9 text-sm text-paper transition-colors hover:border-paper/40 focus:border-paper/60 focus:outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
              {o.count !== undefined ? ` (${o.count})` : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" aria-hidden="true" />
      </div>
    </div>
  );
}

export function SearchField({ value, onChange, placeholder, label, className }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; className?: string }) {
  const id = useId();
  return (
    <div className={cx("col-span-2 flex min-w-0 flex-col gap-1.5 sm:col-span-1", className)}>
      <label htmlFor={id} className="kicker">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-line-strong bg-graphite py-2.5 pl-3 pr-9 text-sm text-paper placeholder:text-mist transition-colors hover:border-paper/40 focus:border-paper/60 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {value ? (
          <button type="button" onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-mist hover:text-paper" aria-label="Limpar busca">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

/** ARIA tabs with arrow-key navigation. */
export function Tabs({ tabs, value, onChange, label, children }: { tabs: TabItem[]; value: string; onChange: (id: string) => void; label: string; children?: ReactNode }) {
  const base = useId();
  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="scrollbar-none -mx-4 flex gap-6 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0"
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          const i = tabs.findIndex((t) => t.id === value);
          const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length]!;
          onChange(next.id);
          document.getElementById(`${base}-${next.id}`)?.focus();
        }}
      >
        {tabs.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              id={`${base}-${t.id}`}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`${base}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(t.id)}
              className={cx(
                "relative shrink-0 py-3.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors",
                active ? "text-paper" : "text-mist hover:text-silver",
              )}
            >
              {t.label}
              {t.count !== undefined ? <span className="ml-2 text-mist tabular">{t.count}</span> : null}
              <span className={cx("absolute inset-x-0 -bottom-px h-px origin-left bg-apex transition-transform duration-300", active ? "scale-x-100" : "scale-x-0")} />
            </button>
          );
        })}
      </div>
      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-${value}`} className="pt-8">
        {children}
      </div>
    </div>
  );
}
