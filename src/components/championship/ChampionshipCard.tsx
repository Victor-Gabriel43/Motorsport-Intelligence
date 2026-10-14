import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { Plate } from "@/components/art/Plate";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { disciplineById, regionLabels } from "@/data/reference/disciplines";
import { kindLabels } from "@/data/reference/championships";
import type { Championship } from "@/types/models";
import { cx } from "@/lib/format";

export function ChampionshipFeature({ championship: c, className, tall = false }: { championship: Championship; className?: string; tall?: boolean }) {
  const discipline = disciplineById[c.discipline];
  return (
    <article className={cx("group relative block overflow-hidden border border-line bg-carbon transition-colors hover:border-line-strong", className)}>
      <Plate
        body={discipline.plate}
        accent={c.accent}
        media={c.media}
        watermark={c.shortName.split(" ")[0]}
        className={cx("transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.02]", tall ? "aspect-[4/5] md:aspect-auto md:h-full md:min-h-[34rem]" : "aspect-[16/10]")}
        composition={tall ? "upper" : "low"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
      <div className="absolute right-3 top-3 z-20">
        <FavoriteButton kind="championships" id={c.id} label={c.shortName} compact />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
        <span className="mb-4 block h-[3px] w-10" style={{ background: c.accent }} />
        <p className="kicker">
          {discipline.shortName} · {regionLabels[c.region]}
        </p>
        <h3 className="display mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)] text-paper">
          <Link to={`/championships/${c.id}`} className="after:absolute after:inset-0 after:z-[1] after:content-['']">{c.shortName}</Link>
        </h3>
        <p className="mt-3 line-clamp-2 max-w-md text-sm text-silver">{c.summary}</p>
      </div>
    </article>
  );
}

export function ChampionshipRow({ championship: c }: { championship: Championship }) {
  return (
    <div
      className="density-row group relative grid grid-cols-[3px_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-line py-4 pr-2 transition-colors hover:bg-white/[0.025] sm:grid-cols-[3px_minmax(0,1.3fr)_minmax(0,1fr)_auto_auto]"
    >
      <span className="h-full min-h-10 w-[3px] self-stretch" style={{ background: c.accent }} aria-hidden="true" />
      <div className="min-w-0">
        <Link to={`/championships/${c.id}`} className="after:absolute after:inset-0 after:z-[1] after:content-[''] wide block truncate text-base font-semibold text-paper">{c.shortName}</Link>
        <p className="truncate text-xs text-mist">{c.name}</p>
      </div>
      <p className="hidden truncate text-sm text-silver sm:block">{c.organizer}</p>
      <div className="hidden items-center gap-2 sm:flex">
        <Badge>{kindLabels[c.kind]}</Badge>
        <Badge tone="outline">{regionLabels[c.region]}</Badge>
      </div>
      <span className="relative z-10 flex items-center gap-1">
        <FavoriteButton kind="championships" id={c.id} label={c.shortName} compact className="bg-transparent" />
        <ArrowUpRight className="h-4 w-4 text-mist transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper" aria-hidden="true" />
      </span>
    </div>
  );
}
