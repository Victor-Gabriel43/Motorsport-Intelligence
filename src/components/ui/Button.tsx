import { Link, type LinkProps } from "react-router";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/format";

type Variant = "primary" | "ghost" | "outline" | "quiet";

const base =
  "group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-[background-color,color,border-color,transform] duration-200 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-apex px-5 py-3 text-white hover:bg-[#c41a23]",
  outline: "border border-line-strong px-5 py-3 text-paper hover:border-paper/60 hover:bg-white/[0.04]",
  ghost: "px-3 py-2 text-silver hover:bg-white/[0.06] hover:text-paper",
  quiet: "px-0 py-1 text-silver hover:text-paper",
};

export function Button({ variant = "outline", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={cx(base, variants[variant], className)} {...props} />;
}

export function ButtonLink({ variant = "outline", className, children, ...props }: LinkProps & { variant?: Variant; children: ReactNode }) {
  return (
    <Link className={cx(base, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}

export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cx("link-underline text-paper", className)}>
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}
