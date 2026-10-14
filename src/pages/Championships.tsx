import { SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { ChampionshipFeature, ChampionshipRow } from "@/components/championship/ChampionshipCard";
import { Container, PageHeader } from "@/components/editorial/Editorial";
import { Button } from "@/components/ui/Button";
import { ChipGroup, SearchField, SelectField } from "@/components/ui/Controls";
import { EmptyState } from "@/components/ui/States";
import { kindLabels } from "@/data/reference/championships";
import { disciplines, regionLabels } from "@/data/reference/disciplines";
import { useClearQuery, useQueryState } from "@/hooks/useQueryState";
import { usePageMeta } from "@/hooks/usePageMeta";
import { catalog } from "@/services/data";
import { normalize } from "@/services/search";
import type { Region } from "@/types/models";

const FILTER_KEYS = ["discipline", "region", "kind", "q", "season"];

export default function Championships() {
  usePageMeta("Championships");
  const [discipline, setDiscipline] = useQueryState("discipline");
  const [region, setRegion] = useQueryState("region");
  const [kind, setKind] = useQueryState("kind");
  const [season, setSeason] = useQueryState("season", "2026");
  const [q, setQ] = useQueryState("q", "");
  const clear = useClearQuery(FILTER_KEYS);

  const all = catalog.championships;
  const filtered = useMemo(
    () =>
      all.filter(
        (c) =>
          (discipline === "all" || c.discipline === discipline) &&
          (region === "all" || c.region === region) &&
          (kind === "all" || c.kind === kind) &&
          c.seasons.includes(Number(season)) &&
          (!q || normalize(`${c.name} ${c.shortName} ${c.organizer ?? ""}`).includes(normalize(q))),
      ),
    [all, discipline, region, kind, season, q],
  );
  const isFiltered = region !== "all" || kind !== "all" || q !== "";
  const seasons = Array.from(new Set(all.flatMap((c) => c.seasons))).sort((a, b) => b - a);

  return (
    <>
      <PageHeader
        code="01"
        kicker="Championships"
        title={
          <>
            Central de
            <br />
            campeonatos
          </>
        }
        dek="Monopostos, endurance, GT, rally, stock cars e mais — organizados por modalidade, região e temporada. Cada competição tem sua própria página, com calendário, resultados e participantes."
        aside={
          <dl className="grid grid-cols-3 border-t border-line pt-4">
            <div>
              <dt className="kicker">Competições</dt>
              <dd className="display-condensed mt-1 text-4xl tabular">{all.length}</dd>
            </div>
            <div>
              <dt className="kicker">Modalidades</dt>
              <dd className="display-condensed mt-1 text-4xl tabular">{disciplines.length}</dd>
            </div>
            <div>
              <dt className="kicker">Regiões</dt>
              <dd className="display-condensed mt-1 text-4xl tabular">{new Set(all.map((c) => c.region)).size}</dd>
            </div>
          </dl>
        }
      />

      <div className="sticky top-16 z-20 border-b border-line bg-ink/92 backdrop-blur-md">
        <Container className="py-4">
          <ChipGroup
            label="Modalidade"
            value={discipline}
            onChange={setDiscipline}
            options={[
              { value: "all", label: "Todas", count: all.length },
              ...disciplines.map((d) => ({ value: d.id, label: d.shortName, count: all.filter((c) => c.discipline === d.id).length })),
            ]}
          />
        </Container>
      </div>

      <Container className="mt-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end">
          <SearchField label="Buscar campeonato" value={q} onChange={setQ} placeholder="Nome, sigla ou organizador" />
          <SelectField
            label="Região"
            value={region}
            onChange={setRegion}
            options={[{ value: "all", label: "Todas as regiões" }, ...(Object.keys(regionLabels) as Region[]).map((r) => ({ value: r, label: regionLabels[r] }))]}
          />
          <SelectField
            label="Tipo"
            value={kind}
            onChange={setKind}
            options={[{ value: "all", label: "Todos os tipos" }, ...Object.entries(kindLabels).map(([value, label]) => ({ value, label }))]}
          />
          <SelectField label="Temporada" value={season} onChange={setSeason} options={seasons.map((s) => ({ value: String(s), label: String(s) }))} />
          <Button variant="ghost" onClick={clear} disabled={!isFiltered && discipline === "all" && season === "2026"} className="h-[42px]">
            Limpar
          </Button>
        </div>
        <p className="meta mt-6" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "competição" : "competições"}
        </p>
      </Container>

      <Container className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhum campeonato com esses filtros."
            icon={<SlidersHorizontal className="h-5 w-5" aria-hidden="true" />}
            action={<Button onClick={clear}>Limpar filtros</Button>}
          >
            Ajuste a modalidade, a região ou o termo de busca.
          </EmptyState>
        ) : isFiltered ? (
          <div className="border-t border-line">
            {filtered.map((c) => (
              <ChampionshipRow key={c.id} championship={c} />
            ))}
          </div>
        ) : (
          disciplines
            .filter((d) => discipline === "all" || d.id === discipline)
            .map((d, i) => {
              const group = filtered.filter((c) => c.discipline === d.id);
              if (!group.length) return null;
              const [first, second, ...rest] = group;
              return (
                <section key={d.id} aria-labelledby={`g-${d.id}`} className="mt-16 first:mt-4">
                  <div className="grid gap-4 border-t border-line pt-5 md:grid-cols-[12rem_minmax(0,1fr)]">
                    <span className="font-mono text-[0.68rem] text-apex-ink">0{disciplines.indexOf(d) + 1} / 0{disciplines.length}</span>
                    <div>
                      <h2 id={`g-${d.id}`} className="display-condensed text-[clamp(2rem,4vw,3.2rem)]">{d.name}</h2>
                      <p className="mt-2 max-w-xl text-sm text-silver">{d.description}</p>
                    </div>
                  </div>
                  <div className={i % 2 ? "mt-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]" : "mt-8 grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"}>
                    {first ? <ChampionshipFeature championship={first} /> : null}
                    {second ? <ChampionshipFeature championship={second} className={i % 2 ? "md:order-first" : undefined} /> : null}
                  </div>
                  {rest.length ? (
                    <div className="mt-6 border-t border-line">
                      {rest.map((c) => (
                        <ChampionshipRow key={c.id} championship={c} />
                      ))}
                    </div>
                  ) : null}
                  {d.id === "rally" ? (
                    <p className="mt-4 border-l-2 border-line-strong pl-4 text-xs text-mist">
                      Campeonatos nacionais e regionais de rally serão adicionados à medida que houver informações verificadas.
                    </p>
                  ) : null}
                </section>
              );
            })
        )}
      </Container>
    </>
  );
}
