import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { Plate } from "@/components/art/Plate";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { circuitTypeLabels } from "@/data/reference/circuits";
import { catalog } from "@/services/data";
import { useMyApex } from "@/store/myApex";
import type { Car, Circuit, Driver, Team } from "@/types/models";
import { cx, formatLength } from "@/lib/format";

function accentFor(car: Car) {
  return catalog.championshipById[car.championshipIds[0] ?? ""]?.accent ?? "var(--color-apex)";
}

export function CarCard({ car, size = "md", className }: { car: Car; size?: "md" | "lg"; className?: string }) {
  return (
    <article className={cx("group relative flex flex-col border border-line bg-carbon transition-colors hover:border-line-strong", className)}>
      <Plate
        body={car.body}
        accent={accentFor(car)}
        media={car.gallery[0]}
        className={cx("transition-[filter] duration-500 group-hover:brightness-125", size === "lg" ? "aspect-[16/9]" : "aspect-[4/3]")}
        composition="center"
        watermark={String(car.firstYear)}
      />
      <div className="absolute right-3 top-3 z-20">
        <FavoriteButton kind="cars" id={car.id} label={car.name} compact />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 border-t border-line p-4">
        <div>
          <p className="kicker">{car.manufacturer}</p>
          <h3 className={cx("wide mt-1 font-bold text-paper", size === "lg" ? "text-2xl" : "text-lg")}>
            <Link to={`/garage/${car.id}`} className="after:absolute after:inset-0 after:z-[1] after:content-['']">{car.name}</Link>
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="outline">{car.techClass}</Badge>
          <Badge>{car.seasonsLabel}</Badge>
        </div>
      </div>
    </article>
  );
}

export function CarRow({ car }: { car: Car }) {
  return (
    <article className="group relative grid grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] border border-line bg-carbon transition-colors hover:border-line-strong">
      <Plate body={car.body} accent={accentFor(car)} media={car.gallery[0]} className="aspect-[16/10] transition-[filter] duration-500 group-hover:brightness-125" />
      <div className="flex flex-col justify-between gap-3 border-l border-line p-4">
        <div>
          <p className="kicker">{car.manufacturer}</p>
          <h3 className="wide mt-1 text-base font-bold leading-tight text-paper">
            <Link to={`/garage/${car.id}`} className="after:absolute after:inset-0 after:z-[1] after:content-['']">{car.name}</Link>
          </h3>
        </div>
        <Badge tone="outline" className="self-start">{car.techClass}</Badge>
      </div>
    </article>
  );
}

export function Monogram({ name, accent, className }: { name: string; accent?: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter((p) => /^[A-ZÀ-Ý]/.test(p))
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div className={cx("grain @container relative flex items-end overflow-hidden bg-graphite", className)}>
      <div className="tech-grid absolute inset-0 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_30%,rgb(255_255_255/0.06),transparent_70%)]" />
      <span className="display relative mb-[0.04em] ml-[0.06em] text-[46cqw] leading-[0.8] text-white/[0.07]">{initials}</span>
      <span className="absolute bottom-0 left-0 h-[3px] w-full" style={{ background: accent ?? "var(--color-gunmetal)" }} />
    </div>
  );
}

export function DriverCard({ driver }: { driver: Driver }) {
  const accent = catalog.teamById[driver.teamHistory[driver.teamHistory.length - 1]?.teamId ?? ""]?.accent;
  return (
    <article className="group relative flex flex-col border border-line bg-carbon transition-colors hover:border-line-strong">
      <Monogram name={driver.name} accent={accent} className="aspect-[5/4]" />
      <div className="absolute right-3 top-3 z-20">
        <FavoriteButton kind="drivers" id={driver.id} label={driver.name} compact />
      </div>
      <div className="p-4">
        <p className="kicker">{driver.nationality} · {driver.countryCode}</p>
        <h3 className="wide mt-1 text-lg font-bold text-paper">
          <Link to={`/drivers-teams/drivers/${driver.id}`} className="after:absolute after:inset-0 after:z-[1] after:content-['']">{driver.name}</Link>
        </h3>
        {driver.honours[0] ? <p className="mt-2 line-clamp-2 text-xs text-silver">{driver.honours[0].label}</p> : null}
      </div>
    </article>
  );
}

export function TeamRow({ team }: { team: Team }) {
  return (
    <div className="density-row group relative grid grid-cols-[3px_minmax(0,1fr)_auto] items-center gap-4 border-b border-line py-4 transition-colors hover:bg-white/[0.025] md:grid-cols-[3px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <span className="h-10 w-[3px]" style={{ background: team.accent }} aria-hidden="true" />
      <div className="min-w-0">
        <Link to={`/drivers-teams/teams/${team.id}`} className="after:absolute after:inset-0 after:z-[1] after:content-[''] wide block truncate font-semibold text-paper">{team.name}</Link>
        <p className="truncate text-xs text-mist md:hidden">{team.country}</p>
      </div>
      <p className="hidden truncate text-sm text-silver md:block">{[team.base, team.country].filter(Boolean).join(" · ")}</p>
      <p className="hidden truncate text-sm text-silver md:block">
        {team.championshipIds.map((id) => catalog.championshipById[id]?.shortName).filter(Boolean).join(", ")}
      </p>
      <span className="relative z-10 flex items-center gap-1">
        <FavoriteButton kind="teams" id={team.id} label={team.name} compact className="bg-transparent" />
        <ArrowUpRight className="h-4 w-4 text-mist group-hover:text-paper" aria-hidden="true" />
      </span>
    </div>
  );
}

export function CircuitCard({ circuit, className }: { circuit: Circuit; className?: string }) {
  const units = useMyApex((s) => s.preferences.units);
  return (
    <article className={cx("group relative flex flex-col justify-between gap-10 overflow-hidden border border-line bg-carbon p-5 transition-colors hover:border-line-strong hover:bg-graphite", className)}>
      <span aria-hidden="true" className="display pointer-events-none absolute -right-2 top-2 text-[5.5rem] text-white/[0.03] transition-colors group-hover:text-white/[0.06]">
        {circuit.countryCode}
      </span>
      <div className="relative z-10 flex items-start justify-between gap-3">
        <Badge tone="outline">{circuitTypeLabels[circuit.type]}</Badge>
        <FavoriteButton kind="circuits" id={circuit.id} label={circuit.name} compact className="-mr-2 -mt-2 bg-transparent" />
      </div>
      <div>
        <p className="kicker">{circuit.country}</p>
        <h3 className="display-condensed mt-2 text-[1.85rem] text-paper">
          <Link to={`/circuits/${circuit.id}`} className="after:absolute after:inset-0 after:z-[1] after:content-['']">{circuit.shortName}</Link>
        </h3>
        <p className="mt-1 truncate text-xs text-mist">{circuit.name}</p>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
          <span className="meta tabular">{circuit.lengthKm ? formatLength(circuit.lengthKm, units) : "Extensão variável"}</span>
          <span className="meta">{circuit.championshipIds.length} camp.</span>
        </div>
      </div>
    </article>
  );
}
