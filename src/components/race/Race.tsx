import { ArrowUpRight, Clock } from "lucide-react";
import { Link } from "react-router";
import { Badge, ProvenanceBadge } from "@/components/ui/Badge";
import { WatchButton } from "@/components/ui/FavoriteButton";
import { catalog, isUpcoming, mainSession, nextSession } from "@/services/data";
import { useMyApex } from "@/store/myApex";
import type { RaceEvent, RaceSession, SessionKind, EventFormat } from "@/types/models";
import { cx, formatDate, formatDateRange, formatSessionTime, relativeDays, accentText } from "@/lib/format";

export const formatLabels: Record<EventFormat, string> = {
  "f1-standard": "Fim de semana padrão",
  "f1-sprint": "Fim de semana sprint",
  endurance: "Endurance",
  "sprint-race": "Corridas sprint",
  rally: "Rally",
  oval: "Oval",
  drag: "Arrancada",
};

export const sessionKindLabels: Record<SessionKind, string> = {
  practice: "Treino",
  qualifying: "Classificação",
  "sprint-qualifying": "Class. sprint",
  sprint: "Sprint",
  hyperpole: "Hyperpole",
  "warm-up": "Warm-up",
  race: "Corrida",
  shakedown: "Shakedown",
  stage: "Especiais",
  "power-stage": "Power Stage",
  elimination: "Eliminatórias",
};

export function DateBlock({ start, end, className }: { start: string; end: string; className?: string }) {
  return (
    <div className={cx("flex flex-col leading-none", className)}>
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-mist">{formatDate(end, { month: "short" }).replace(".", "")}</span>
      <span className="display-condensed mt-1 text-[1.9rem] tabular text-paper">{formatDateRange(start, end).split(" ")[0]}</span>
    </div>
  );
}

export function EventRow({ event }: { event: RaceEvent }) {
  const champ = catalog.championshipById[event.championshipId];
  const circuit = catalog.circuitById[event.circuitId];
  const upcoming = isUpcoming(event);
  const next = nextSession(event);
  const tz = useMyApex((s) => s.preferences.timeZone);
  return (
    <Link
      to={`/race-center/${event.id}`}
      className="density-row group grid grid-cols-[4.2rem_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-line py-4 transition-colors hover:bg-white/[0.025] md:grid-cols-[5rem_3px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,11rem)_auto]"
    >
      <DateBlock start={event.startDate} end={event.endDate} />
      <span className="hidden h-10 w-[3px] md:block" style={{ background: champ?.accent }} aria-hidden="true" />
      <div className="min-w-0">
        <p className="kicker truncate" style={{ color: accentText(champ?.accent) }}>
          {champ?.shortName} · R{event.round}
        </p>
        <p className="wide mt-1 truncate text-base font-semibold text-paper">{circuit?.shortName}</p>
        <p className="truncate text-xs text-mist md:hidden">{event.name}</p>
      </div>
      <p className="hidden truncate text-sm text-silver md:block">{event.name}</p>
      <div className="hidden text-xs text-silver md:block">
        {upcoming && next ? (
          <>
            <span className="kicker block">Próxima sessão</span>
            <span className="mt-1 block truncate">{next.name} · {formatSessionTime(next.start, tz)}</span>
          </>
        ) : (
          <span className="kicker">Encerrado</span>
        )}
      </div>
      <span className="flex items-center gap-3">
        {event.provenance.kind === "demo" ? <Badge tone="demo" className="hidden sm:inline-flex">Demo</Badge> : null}
        <ArrowUpRight className="h-4 w-4 text-mist transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function EventCard({ event, className }: { event: RaceEvent; className?: string }) {
  const champ = catalog.championshipById[event.championshipId];
  const circuit = catalog.circuitById[event.circuitId];
  const main = mainSession(event);
  return (
    <Link to={`/race-center/${event.id}`} className={cx("group flex flex-col justify-between gap-8 border border-line bg-carbon p-5 transition-colors hover:border-line-strong hover:bg-graphite", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="mb-3 block h-[3px] w-8" style={{ background: champ?.accent }} />
          <p className="kicker">{champ?.shortName} · Etapa {event.round}</p>
        </div>
        <ProvenanceBadge provenance={event.provenance} />
      </div>
      <div>
        <p className="display-condensed text-[2rem] text-paper">{circuit?.shortName}</p>
        <p className="mt-1 text-sm text-mist">{circuit?.country}</p>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs">
          <span className="meta">{formatDateRange(event.startDate, event.endDate)}</span>
          <span className="text-silver">{relativeDays(main.start)}</span>
        </div>
      </div>
    </Link>
  );
}

export function SessionList({ event, selected, onSelect }: { event: RaceEvent; selected?: string; onSelect?: (id: string) => void }) {
  const tz = useMyApex((s) => s.preferences.timeZone);
  return (
    <ol className="border-t border-line">
      {event.sessions.map((s) => (
        <SessionItem key={s.id} session={s} tz={tz} active={s.id === selected} onSelect={onSelect} />
      ))}
    </ol>
  );
}

function SessionItem({ session: s, tz, active, onSelect }: { session: RaceSession; tz: "local" | "utc"; active: boolean; onSelect?: (id: string) => void }) {
  const done = s.status === "completed";
  return (
    <li className={cx("density-row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-line py-3 pl-3 transition-colors sm:grid-cols-[8rem_minmax(0,1fr)_auto_auto]", active && "bg-white/[0.04]")}>
      <span className="kicker hidden sm:block">{sessionKindLabels[s.kind]}</span>
      <div className="min-w-0">
        {onSelect && done ? (
          <button type="button" onClick={() => onSelect(s.id)} aria-pressed={active} className="text-left text-sm font-semibold text-paper hover:text-apex-ink">
            {s.name} <span className="ml-1 font-mono text-[0.62rem] font-normal uppercase tracking-wider text-mist">ver resultado</span>
          </button>
        ) : (
          <p className="text-sm font-semibold text-paper">{s.name}</p>
        )}
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-mist">
          <Clock className="h-3 w-3" aria-hidden="true" /> {formatSessionTime(s.start, tz)}
          {s.durationLabel ? <span>· {s.durationLabel}</span> : null}
        </p>
      </div>
      <span className="hidden sm:block">{done ? <Badge>Encerrada</Badge> : <Badge tone="outline">Agendada</Badge>}</span>
      {done ? <span className="w-8" aria-hidden="true" /> : <WatchButton sessionId={s.id} sessionName={s.name} />}
    </li>
  );
}
