import { ArrowLeft, ExternalLink as ExternalIcon } from "lucide-react";
import { Link, useParams } from "react-router";
import { Plate } from "@/components/art/Plate";
import { Container, MetaList, SectionHeader, SourceNote } from "@/components/editorial/Editorial";
import { CarCard, CircuitCard, TeamRow } from "@/components/garage/Cards";
import { EventRow } from "@/components/race/Race";
import { LiveBoundary, StandingsTable } from "@/components/tables/Tables";
import { Badge, ProvenanceBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SelectField, Tabs } from "@/components/ui/Controls";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { EmptyState, LoadingBlock } from "@/components/ui/States";
import { kindLabels } from "@/data/reference/championships";
import { disciplineById, regionLabels } from "@/data/reference/disciplines";
import { useEvents, useNews, useStandings } from "@/hooks/useLive";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQueryState } from "@/hooks/useQueryState";
import { catalog, isUpcoming } from "@/services/data";
import type { Championship } from "@/types/models";
import { formatDate } from "@/lib/format";
import NotFound from "./system/NotFound";

export default function ChampionshipDetail() {
  const { id = "" } = useParams();
  const c = catalog.championshipById[id];
  if (!c) return <NotFound />;
  return <ChampionshipView key={c.id} c={c} />;
}

function ChampionshipView({ c }: { c: Championship }) {
  usePageMeta(c.shortName);
  const [tab, setTab] = useQueryState("tab", "overview");
  const [seasonParam, setSeason] = useQueryState("season", String(c.seasons[0]));
  const season = Number(seasonParam);
  const discipline = disciplineById[c.discipline];
  const events = useEvents();
  const seasonEvents = events.status === "ok" ? events.data.filter((e) => e.championshipId === c.id && e.season === season) : [];
  const circuits = c.circuitIds.map((cid) => catalog.circuitById[cid]!).filter(Boolean);
  const cars = c.carIds.map((cid) => catalog.carById[cid]!).filter(Boolean);
  const teams = catalog.teams.filter((t) => t.championshipIds.includes(c.id));

  return (
    <>
      <header className="relative overflow-hidden border-b border-line">
        <Plate body={discipline.plate} accent={c.accent} media={c.media} composition="bleed-right" watermark={c.shortName.split(" ")[0]} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
        <span className="absolute inset-y-0 left-0 w-1" style={{ background: c.accent }} aria-hidden="true" />
        <Container className="relative pb-12 pt-10 sm:pb-16">
          <Link to="/championships" className="group inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mist hover:text-paper">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Championships
          </Link>
          <div className="mt-14 flex flex-wrap items-center gap-2 sm:mt-20">
            <Badge tone="outline">{discipline.shortName}</Badge>
            <Badge tone="outline">{regionLabels[c.region]}</Badge>
            <Badge>{kindLabels[c.kind]}</Badge>
          </div>
          <h1 className="display mt-5 max-w-[14ch] animate-rise text-[clamp(2.8rem,8vw,7rem)]">{c.shortName}</h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-silver">{c.name}</p>
          <p className="mt-6 max-w-xl text-silver sm:text-lg">{c.summary}</p>
          <div className="mt-8 flex flex-wrap items-end gap-3">
            <FavoriteButton kind="championships" id={c.id} label={c.shortName} />
            {c.officialUrl ? (
              <a href={c.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-line-strong px-4 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-silver transition-colors hover:border-paper/60 hover:text-paper">
                Site oficial <ExternalIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            ) : null}
            <SelectField label="Temporada" value={seasonParam} onChange={setSeason} options={c.seasons.map((s) => ({ value: String(s), label: `Temporada ${s}` }))} className="w-44" />
          </div>
        </Container>
      </header>

      <Container className="mt-6">
        <Tabs
          label="Seções do campeonato"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "overview", label: "Visão geral" },
            { id: "calendar", label: "Calendário", count: seasonEvents.length },
            { id: "results", label: "Resultados" },
            { id: "standings", label: "Classificação" },
            { id: "circuits", label: "Circuitos", count: circuits.length },
            { id: "entries", label: "Participantes e carros", count: cars.length + teams.length },
            { id: "news", label: "Notícias" },
          ]}
        >
          {tab === "overview" && (
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="space-y-6">
                <MetaList
                  items={[
                    { label: "Organização", value: c.organizer ?? "—" },
                    { label: "Primeira temporada", value: c.firstSeason ?? "Não informado" },
                    { label: "Região", value: regionLabels[c.region] },
                    { label: "Tipo", value: kindLabels[c.kind] },
                  ]}
                />
                <div>
                  <p className="kicker mb-3">Formatos e classes</p>
                  <div className="flex flex-wrap gap-2">
                    {c.formats.map((f) => (
                      <Badge key={f} tone="outline">{f}</Badge>
                    ))}
                  </div>
                </div>
                <SourceNote provenance={c.provenance} officialUrl={c.officialUrl} />
              </div>
              <div>
                <SectionHeader title={`Temporada ${season}`} className="!mb-4" />
                {events.status === "loading" ? (
                  <LoadingBlock rows={3} />
                ) : seasonEvents.length ? (
                  <div>
                    {seasonEvents.filter(isUpcoming).slice(0, 3).map((e) => <EventRow key={e.id} event={e} />)}
                    {seasonEvents.filter(isUpcoming).length === 0 ? seasonEvents.slice(-3).map((e) => <EventRow key={e.id} event={e} />) : null}
                  </div>
                ) : (
                  <EmptyState title={`Calendário ${season} indisponível.`} code={String(season)}>
                    Nenhuma fonte de calendário conectada para {c.shortName}. As etapas serão listadas quando houver dados oficiais.
                  </EmptyState>
                )}
              </div>
            </div>
          )}

          {tab === "calendar" && (
            <LiveBoundary state={events} emptyTitle="Calendário indisponível.">
              {() =>
                seasonEvents.length ? (
                  <div className="border-t border-line">{seasonEvents.map((e) => <EventRow key={e.id} event={e} />)}</div>
                ) : (
                  <EmptyState title={`Sem etapas para ${season}.`} code="CAL">
                    Não há dados de calendário de {c.shortName} para esta temporada.
                  </EmptyState>
                )
              }
            </LiveBoundary>
          )}

          {tab === "results" && (
            <LiveBoundary state={events} emptyTitle="Resultados indisponíveis.">
              {() => {
                const done = seasonEvents.filter((e) => !isUpcoming(e));
                return done.length ? (
                  <div className="border-t border-line">{done.reverse().map((e) => <EventRow key={e.id} event={e} />)}</div>
                ) : (
                  <EmptyState title="Nenhum resultado publicado." code="RES">
                    Resultados de {c.shortName} {season} serão exibidos a partir de uma fonte verificada.
                  </EmptyState>
                );
              }}
            </LiveBoundary>
          )}

          {tab === "standings" && <StandingsPanel c={c} season={season} />}

          {tab === "circuits" &&
            (circuits.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{circuits.map((ci) => <CircuitCard key={ci.id} circuit={ci} />)}</div>
            ) : (
              <EmptyState title="Locais de prova não catalogados." code="TRK">Nenhum circuito associado a esta competição no arquivo de referência.</EmptyState>
            ))}

          {tab === "entries" && (
            <div className="space-y-12">
              {cars.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cars.map((car) => <CarCard key={car.id} car={car} />)}</div>
              ) : (
                <EmptyState title="Nenhum carro catalogado ainda." code="CAR">A Garage ainda não tem carros desta competição.</EmptyState>
              )}
              <div>
                <SectionHeader title="Equipes" className="!mb-2" dek="Equipes associadas no arquivo de referência. Inscrições da temporada dependem de fonte oficial." />
                {teams.length ? <div>{teams.map((t) => <TeamRow key={t.id} team={t} />)}</div> : <p className="text-sm text-mist">Nenhuma equipe catalogada.</p>}
              </div>
            </div>
          )}

          {tab === "news" && <ChampionshipNews c={c} />}
        </Tabs>
      </Container>
    </>
  );
}

function StandingsPanel({ c, season }: { c: Championship; season: number }) {
  const drivers = useStandings(c.id, season, "drivers");
  const teams = useStandings(c.id, season, "teams");
  const unavailable = <ButtonLink to="/my-apex#preferences" variant="ghost">Preferências de dados</ButtonLink>;
  return (
    <div className="grid gap-12 xl:grid-cols-2">
      <section aria-label="Classificação de pilotos">
        <h2 className="display-condensed mb-5 text-3xl">Pilotos</h2>
        <LiveBoundary state={drivers} emptyTitle="Classificação de pilotos indisponível." emptyAction={unavailable}>
          {(s) => <StandingsTable standings={s} />}
        </LiveBoundary>
      </section>
      <section aria-label="Classificação de equipes">
        <h2 className="display-condensed mb-5 text-3xl">Equipes</h2>
        <LiveBoundary state={teams} emptyTitle="Classificação de equipes indisponível." emptyAction={unavailable}>
          {(s) => <StandingsTable standings={s} />}
        </LiveBoundary>
      </section>
    </div>
  );
}

function ChampionshipNews({ c }: { c: Championship }) {
  const news = useNews();
  return (
    <LiveBoundary state={news} emptyTitle="Nenhuma fonte de notícias conectada.">
      {(items) => {
        const related = items.filter((a) => a.championshipIds.includes(c.id));
        return related.length ? (
          <ul className="border-t border-line">
            {related.map((a) => (
              <li key={a.id} className="border-b border-line">
                <Link to={`/newsroom?article=${a.id}`} className="group flex flex-wrap items-center justify-between gap-4 py-5">
                  <span>
                    <span className="meta">{formatDate(a.publishedAt, { day: "2-digit", month: "long" })} · {a.sourceName}</span>
                    <span className="wide mt-2 block text-lg font-semibold text-paper group-hover:text-silver">{a.title}</span>
                  </span>
                  <ProvenanceBadge provenance={a.provenance} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={`Sem notícias relacionadas a ${c.shortName}.`} code="NEWS">
            Notícias aparecerão aqui quando houver fontes conectadas.
          </EmptyState>
        );
      }}
    </LiveBoundary>
  );
}
