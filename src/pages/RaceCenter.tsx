import { Radio, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Container, PageHeader, SectionHeader } from "@/components/editorial/Editorial";
import { EventRow } from "@/components/race/Race";
import { LiveBoundary, StandingsTable } from "@/components/tables/Tables";
import { Button } from "@/components/ui/Button";
import { ChipGroup, SelectField } from "@/components/ui/Controls";
import { EmptyState } from "@/components/ui/States";
import { disciplines } from "@/data/reference/disciplines";
import { useEvents, useStandings } from "@/hooks/useLive";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useClearQuery, useQueryState } from "@/hooks/useQueryState";
import { catalog, isUpcoming } from "@/services/data";
import { useMyApex } from "@/store/myApex";
import type { RaceEvent } from "@/types/models";
import { formatDate } from "@/lib/format";

const KEYS = ["status", "discipline", "championship", "season", "month"];

export default function RaceCenter() {
  usePageMeta("Race Center");
  const events = useEvents();
  const [status, setStatus] = useQueryState("status", "upcoming");
  const [discipline, setDiscipline] = useQueryState("discipline");
  const [championship, setChampionship] = useQueryState("championship");
  const [season, setSeason] = useQueryState("season");
  const [month, setMonth] = useQueryState("month");
  const clear = useClearQuery(KEYS);
  const following = useMyApex((s) => s.following);

  const all = events.status === "ok" ? events.data : [];
  const filtered = useMemo(() => {
    const list = all.filter((e) => {
      const champ = catalog.championshipById[e.championshipId];
      return (
        (status === "all" || (status === "upcoming" ? isUpcoming(e) : status === "finished" ? !isUpcoming(e) : following.includes(e.id))) &&
        (discipline === "all" || champ?.discipline === discipline) &&
        (championship === "all" || e.championshipId === championship) &&
        (season === "all" || String(e.season) === season) &&
        (month === "all" || e.startDate.slice(0, 7) === month)
      );
    });
    return status === "finished" ? list.reverse() : list;
  }, [all, status, discipline, championship, season, month, following]);

  const byMonth = useMemo(() => {
    const groups = new Map<string, RaceEvent[]>();
    filtered.forEach((e) => {
      const key = e.startDate.slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), e]);
    });
    return Array.from(groups.entries());
  }, [filtered]);

  const months = Array.from(new Set(all.map((e) => e.startDate.slice(0, 7)))).sort();
  const seasons = Array.from(new Set(all.map((e) => e.season))).sort((a, b) => b - a);
  const champsWithEvents = catalog.championships.filter((c) => all.some((e) => e.championshipId === c.id));

  return (
    <>
      <PageHeader
        code="02"
        kicker="Race Center"
        title={
          <>
            Calendário,
            <br />
            sessões e resultados
          </>
        }
        dek="Cada etapa com o formato da sua competição: treinos, classificação, sprint e corrida na Fórmula 1; classes, duração e tripulações no endurance; especiais no rally."
        aside={
          <div className="border border-line bg-carbon p-5">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-mist" aria-hidden="true" />
              <p className="kicker">Ao vivo</p>
            </div>
            <p className="mt-3 text-sm text-silver">
              Nenhuma fonte de cronometragem ao vivo está conectada. O APEX não exibe sessões “ao vivo” nem cronômetros sem dados reais.
            </p>
          </div>
        }
      />

      <div className="sticky top-16 z-20 border-b border-line bg-ink/92 backdrop-blur-md">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
          <ChipGroup
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "upcoming", label: "Próximos" },
              { value: "finished", label: "Encerrados" },
              { value: "following", label: "Acompanhando", count: following.length },
              { value: "all", label: "Todos" },
            ]}
          />
        </Container>
      </div>

      <Container className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
        <SelectField label="Modalidade" value={discipline} onChange={setDiscipline} options={[{ value: "all", label: "Todas" }, ...disciplines.map((d) => ({ value: d.id, label: d.shortName }))]} />
        <SelectField
          label="Campeonato"
          value={championship}
          onChange={setChampionship}
          options={[{ value: "all", label: "Todos" }, ...champsWithEvents.map((c) => ({ value: c.id, label: c.shortName }))]}
        />
        <SelectField label="Temporada" value={season} onChange={setSeason} options={[{ value: "all", label: "Todas" }, ...seasons.map((s) => ({ value: String(s), label: String(s) }))]} />
        <SelectField
          label="Mês"
          value={month}
          onChange={setMonth}
          options={[{ value: "all", label: "Todos" }, ...months.map((m) => ({ value: m, label: formatDate(`${m}-15`, { month: "long", year: "numeric" }) }))]}
        />
        <Button variant="ghost" onClick={clear} className="h-[42px]">Limpar</Button>
      </Container>

      <Container className="mt-10 grid gap-16 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-label="Eventos" className="min-w-0">
          <LiveBoundary state={events} emptyTitle="Calendário indisponível.">
            {() =>
              byMonth.length === 0 ? (
                <EmptyState
                  title={status === "following" ? "Você ainda não acompanha nenhum evento." : "Nenhum evento com esses filtros."}
                  icon={<SlidersHorizontal className="h-5 w-5" aria-hidden="true" />}
                  action={<Button onClick={clear}>Limpar filtros</Button>}
                >
                  {status === "following" ? "Abra um evento e use “Acompanhar evento” para montar sua lista." : "Ajuste o status, a modalidade ou o período."}
                </EmptyState>
              ) : (
                byMonth.map(([m, list]) => (
                  <div key={m} className="mb-12">
                    <div className="mb-2 flex items-baseline justify-between border-b border-line-strong pb-3">
                      <h2 className="display-condensed text-[2rem] capitalize">{formatDate(`${m}-15`, { month: "long" })}</h2>
                      <span className="meta">{m.slice(0, 4)} · {list.length} {list.length === 1 ? "evento" : "eventos"}</span>
                    </div>
                    {list.map((e) => <EventRow key={e.id} event={e} />)}
                  </div>
                ))
              )
            }
          </LiveBoundary>
        </section>
        <StandingsSnapshot options={champsWithEvents.map((c) => c.id)} />
      </Container>
    </>
  );
}

function StandingsSnapshot({ options }: { options: string[] }) {
  const [selected, setSelected] = useState(options[0] ?? "formula-1");
  const id = options.includes(selected) ? selected : (options[0] ?? "formula-1");
  const standings = useStandings(id, new Date().getFullYear(), "drivers");
  return (
    <aside aria-label="Classificação" className="min-w-0 xl:sticky xl:top-40 xl:self-start">
      <SectionHeader title="Classificação" className="!mb-5" />
      <SelectField
        label="Campeonato"
        value={id}
        onChange={setSelected}
        options={(options.length ? options : ["formula-1"]).map((o) => ({ value: o, label: catalog.championshipById[o]?.shortName ?? o }))}
        className="mb-6"
      />
      <LiveBoundary state={standings} emptyTitle="Classificação indisponível.">
        {(s) => <StandingsTable standings={{ ...s, rows: s.rows.slice(0, 8) }} />}
      </LiveBoundary>
    </aside>
  );
}
