import type { ReactNode } from "react";
import { CarProfile } from "./CarProfile";
import type { BodyType, Media } from "@/types/models";
import { cx } from "@/lib/format";

interface PlateProps {
  /** Licensed photograph. When absent, an illustrated technical plate is drawn. */
  media?: Media;
  body?: BodyType;
  accent?: string;
  /** Small caption over the plate ("Ilustração técnica · LMH"). */
  caption?: string;
  className?: string;
  /** Layout of the drawing inside the plate. */
  composition?: "center" | "bleed-right" | "low" | "upper";
  children?: ReactNode;
  /** Large faint numeral / code for editorial texture. */
  watermark?: string;
}

/**
 * Photographic slot of the design system. Shows the photo with its credit
 * when there is one; otherwise a cinematic illustrated plate (spotlight,
 * technical grid, generic category profile) that is labelled as illustration.
 */
export function Plate({
  media,
  body = "prototype",
  accent = "var(--color-apex)",
  caption,
  className,
  composition = "center",
  children,
  watermark,
}: PlateProps) {
  return (
    <div className={cx("grain @container isolate overflow-hidden bg-carbon", !/\b(absolute|fixed)\b/.test(className ?? "") && "relative", className)}>
      {media ? (
        <figure className="absolute inset-0">
          <img src={media.src} alt={media.alt} className="h-full w-full object-cover" loading="lazy" />
          <figcaption className="absolute bottom-2 right-3 z-10 font-mono text-[0.6rem] uppercase tracking-wider text-paper/60">
            {media.credit} · {media.license}
          </figcaption>
        </figure>
      ) : (
        <>
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: `radial-gradient(70% 60% at ${composition === "bleed-right" ? "72%" : "50%"} 62%, rgb(255 255 255 / 0.07), transparent 70%), radial-gradient(40% 30% at ${composition === "bleed-right" ? "78%" : "55%"} 88%, color-mix(in oklab, ${accent} 22%, transparent), transparent 70%), linear-gradient(180deg, #0c0d0f 0%, #121417 58%, #08090a 100%)`,
            }}
          />
          <div className="tech-grid absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" />
          {watermark ? (
            <span
              aria-hidden="true"
              className="display pointer-events-none absolute -bottom-[0.1em] -left-[0.04em] -z-10 select-none whitespace-nowrap text-[26cqw] text-white/[0.03]"
            >
              {watermark}
            </span>
          ) : null}
          <div
            className={cx(
              "absolute",
              composition === "center" && "inset-x-[6%] bottom-[10%] top-[18%] flex items-end",
              composition === "bleed-right" && "-right-[6%] bottom-[8%] top-[22%] w-[92%] flex items-end md:w-[70%]",
              composition === "low" && "inset-x-[4%] bottom-[2%] h-[62%] flex items-end",
              composition === "upper" && "inset-x-[8%] bottom-[34%] top-[8%] flex items-end",
            )}
          >
            <CarProfile body={body} accent={accent} className="h-auto max-h-full w-full" />
          </div>
          {caption ? (
            <span className="absolute right-3 top-3 z-10 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-paper/45">
              {caption}
            </span>
          ) : null}
        </>
      )}
      {children}
    </div>
  );
}
