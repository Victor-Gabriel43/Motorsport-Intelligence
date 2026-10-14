import { ArrowLeft, Timer, Users } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { Plate } from "@/components/art/Plate";
import { Container, MetaList, SectionHeader, SourceNote } from "@/components/editorial/Editorial";
import { CircuitCard } from "@/components/garage/Cards";
import { formatLabels, SessionList } from "@/components/race/Race";
import { LiveBoundary, ResultsTable } from "@/components/tables/Tables";
import { Badge, ProvenanceBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { FollowButton } from "@/components/ui/FavoriteButton";
import { EmptyState, LoadingBlock } from "@/components/ui/States";
import { disciplineById } from "@/data/reference/disciplines";
import { useEvents, useSessionResult } from "@/hooks/useLive";
import { usePageMeta } from "@/hooks/usePageMeta";
import { catalog, isUpcoming, mainSession } from "@/services/data";
import { useMyApex } from "@/store/myApex";
import type { RaceEvent } from "@/types/models";
import { formatDateRange, relativeDays, accentText } from "@/lib/format";

export default function EventDetail() {
  const { eventId = "" } = useParams();
  const events = useEvents();
  if (events.status === "loading")
    return (
      <Container className="py-20">
        <LoadingBlock rows={6} label="Carregando evento" />
      </Container>
    );
  const event = events.status === "ok" ? events.data.find((e) => e.id === eventId) : undefined;
  if (!event)
    return (
      <Container className="py-20">
        <EmptyState
          title="Evento indisponível."
          code="EVT"
          action={
            <>
              <ButtonLink to="/race-center" variant="primary">Race Center</ButtonLink>
              <ButtonLink to="/my-apex#preferences">Preferências de dados</ButtonLink>
            </>
          }
        >
          Este evento não existe ou pertence ao conteúdo de demonstração, que está desativado.
        </EmptyState>
      </Container>
    );
  return <EventView key={event.id} event={event} />;
}

function EventView({ event }: { event: RaceEvent }) {
  const champ = catalog.championshipById[event.championshipId]!;
  const circuit = catalog.circuitById[event.circuitId]!;
  usePageMeta(`${champ.shortName} · ${circuit.shortName}`);
  const main = mainSession(event);
  const completed = event.sessions.filter((s) => s.status === "completed");
  const [selected, setSelected] = useState<string | undefined>(completed.length ? (main.status === "completed" ? main.id : completed[completed.length - 1]!.id) : undefined);
  const result = useSessionResult(event.id, selected);
  const selectedSession = event.sessions.find((s) => s.id === selected);
  const upcoming = isUpcoming(event);
  const isEndurance = event.format === "endurance";
  const tz = useMyApex((s) => s.preferences.timeZone);

  return (
    <>
      <header className="relative overflow-hidden border-b border-line">
        <Plate body={disciplineById[champ.discipline].plate} accent={champ.accent} composition="bleed-right" watermark={`R${event.round}`} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <Container className="relative pb-12 pt-10">
          <Link to="/race-center" className="group inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mist hover:text-paper">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Race Center
          </Link>
          <div className="mt-14 flex flex-wrap items-center gap-2">
            <ProvenanceBadge provenance={event.provenance} />
            <Badge tone="outline">{formatLabels[event.format]}</Badge>
            <Badge>{upcoming ? relativeDays(main.start) : "Encerrado"}</Badge>
          </div>
          <p className="kicker mt-6" style={{ color: accentText(champ.accent) }}>
            <Link to={`/championships/${champ.id}`} className="link-underline">{champ.shortName}</Link> · Temporada {event.season} · Etapa {event.round}
          </p>
          <h1 className="display mt-3 animate-rise text-[clamp(2.6rem,7.5vw,6.5rem)]">{circuit.shortName}</h1>
          <p className="mt-3 text-silver">
            {event.name} · {circuit.locality}, {circuit.country}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <FollowButton eventId={event.id} />
            <ButtonLink to={`/circuits/${circuit.id}`} variant="ghost">Sobre o circuito</ButtonLink>
          </div>
        </Container>
      </header>

      <Container className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div className="space-y-10">
          <MetaList
            items={[
              { label: "Datas", value: formatDateRange(event.startDate, event.endDate) },
              { label: "Formato", value: formatLabels[event.format] },
              { label: isEndurance ? "Duração" : "Prova principal", value: main.durationLabel ?? main.name },
              { label: "Sessões", value: event.sessions.length },
            ]}
          />
          {event.classes?.length ? (
            <div>
              <p className="kicker mb-3 flex items-center gap-2"><Users className="h-3.5 w-3.5" aria-hidden="true" /> Classes em disputa</p>
              <div className="flex flex-wrap gap-2">
                {event.classes.map((cl, i) => (
                  <Badge key={cl} tone={i === 0 ? "apex" : "outline"}>{cl}</Badge>
                ))}
              </div>
              {isEndurance ? <p className="mt-3 text-xs text-mist">Corrida multiclasse: cada carro é dividido por uma tripulação de pilotos, com classificação geral e por classe.</p> : null}
            </div>
          ) : null}
          <section aria-labelledby="h-sessions">
            <h2 id="h-sessions" className="display-condensed mb-4 flex items-center gap-3 text-3xl">
              <Timer className="h-5 w-5 text-mist" aria-hidden="true" /> Programação
            </h2>
            <SessionList event={event} selected={selected} onSelect={setSelected} />
            <p className="mt-3 text-xs text-mist">
              Horários {tz === "utc" ? "em UTC" : "no fuso deste dispositivo"} (altere em <Link to="/my-apex#preferences" className="link-underline text-silver">My Apex</Link>). Use “Assistir” para salvar sessões na sua lista.
            </p>
          </section>
          <CircuitCard circuit={circuit} />
        </div>

        <section aria-labelledby="h-result">
          <SectionHeader title={<span id="h-result">Resultado</span>} className="!mb-5" />
          {completed.length === 0 ? (
            <EmptyState title="Nenhuma sessão disputada ainda." code="SOON">
              Os resultados aparecerão aqui depois de cada sessão, a partir da fonte de dados.
            </EmptyState>
          ) : (
            <>
              <div className="scrollbar-none -mx-4 mb-6 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Sessões encerradas">
                {completed.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={s.id === selected}
                    onClick={() => setSelected(s.id)}
                    className={
                      s.id === selected
                        ? "shrink-0 border border-paper bg-paper px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink"
                        : "shrink-0 border border-line-strong px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-silver hover:text-paper"
                    }
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <LiveBoundary state={result} emptyTitle="Resultado indisponível.">
                {(r) => <ResultsTable result={r} title={`${selectedSession?.name ?? ""} · ${circuit.shortName}`} />}
              </LiveBoundary>
            </>
          )}
          <SourceNote provenance={event.provenance} className="mt-8" />
        </section>
      </Container>
    </>
  );
}
