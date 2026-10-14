import { SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { Container, PageHeader } from "@/components/editorial/Editorial";
import { CircuitCard } from "@/components/garage/Cards";
import { Button } from "@/components/ui/Button";
import { ChipGroup, SearchField, SelectField } from "@/components/ui/Controls";
import { EmptyState } from "@/components/ui/States";
import { circuitTypeLabels } from "@/data/reference/circuits";
import { regionLabels } from "@/data/reference/disciplines";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useClearQuery, useQueryState } from "@/hooks/useQueryState";
import { catalog } from "@/services/data";
import { normalize } from "@/services/search";
import { useMyApex } from "@/store/myApex";
import type { CircuitType, Region } from "@/types/models";
import { formatLength } from "@/lib/format";

const KEYS = ["type", "region", "championship", "q", "sort"];

export default function Circuits() {
  usePageMeta("Circuits");
  const [type, setType] = useQueryState("type");
  const [region, setRegion] = useQueryState("region");
  const [championship, setChampionship] = useQueryState("championship");
  const [sort, setSort] = useQueryState("sort", "name");
  const [q, setQ] = useQueryState("q", "");
  const clear = useClearQuery(KEYS);
  const units = useMyApex((s) => s.preferences.units);

  const all = catalog.circuits;
  const filtered = useMemo(() => {
    const list = all.filter(
      (c) =>
        (type === "all" || c.type === type) &&
        (region === "all" || c.region === region) &&
        (championship === "all" || c.championshipIds.includes(championship)) &&
        (!q || normalize(`${c.name} ${c.shortName} ${c.country} ${c.locality}`).includes(normalize(q))),
    );
    return [...list].sort((a, b) => (sort === "length" ? (b.lengthKm ?? 0) - (a.lengthKm ?? 0) : sort === "country" ? a.country.localeCompare(b.country) : a.shortName.localeCompare(b.shortName)));
  }, [all, type, region, championship, q, sort]);

  const types = Object.keys(circuitTypeLabels) as CircuitType[];
  const longest = [...all].filter((c) => c.lengthKm).sort((a, b) => b.lengthKm! - a.lengthKm!)[0]!;

  return (
    <>
      <PageHeader
        code="05"
        kicker="Circuits"
        title={
          <>
            Circuitos,
            <br />
            ovais e especiais
          </>
        }
        dek="Autódromos permanentes, circuitos de rua, ovais, pistas de arrancada, especiais de rally e percursos no deserto — com tipo, extensão do traçado e campeonatos que usam cada local."
        aside={
          <div className="border-t border-line pt-4">
            <p className="kicker">Mais longo do arquivo</p>
            <p className="display-condensed mt-2 text-4xl tabular">{formatLength(longest.lengthKm!, units)}</p>
            <p className="mt-1 text-sm text-silver">{longest.name}</p>
          </div>
        }
      />
      <div className="sticky top-16 z-20 border-b border-line bg-ink/92 backdrop-blur-md">
        <Container className="py-4">
          <ChipGroup
            label="Tipo de circuito"
            value={type}
            onChange={setType}
            options={[{ value: "all", label: "Todos", count: all.length }, ...types.map((t) => ({ value: t, label: circuitTypeLabels[t], count: all.filter((c) => c.type === t).length })).filter((o) => o.count)]}
          />
        </Container>
      </div>
      <Container className="mt-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end">
          <SearchField label="Buscar circuito" value={q} onChange={setQ} placeholder="Nome, cidade ou país" />
          <SelectField label="Região" value={region} onChange={setRegion} options={[{ value: "all", label: "Todas" }, ...(Object.keys(regionLabels) as Region[]).map((r) => ({ value: r, label: regionLabels[r] }))]} />
          <SelectField
            label="Campeonato"
            value={championship}
            onChange={setChampionship}
            options={[{ value: "all", label: "Todos" }, ...catalog.championships.filter((c) => c.circuitIds.length).map((c) => ({ value: c.id, label: c.shortName }))]}
          />
          <SelectField
            label="Ordenar"
            value={sort}
            onChange={setSort}
            options={[
              { value: "name", label: "Nome" },
              { value: "length", label: "Extensão" },
              { value: "country", label: "País" },
            ]}
          />
          <Button variant="ghost" onClick={clear} className="h-[42px]">Limpar</Button>
        </div>
        <p className="meta mt-6" aria-live="polite">{filtered.length} locais</p>
        <div className="mt-6">
          {filtered.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((c) => <CircuitCard key={c.id} circuit={c} />)}
            </div>
          ) : (
            <EmptyState title="Nenhum local com esses filtros." icon={<SlidersHorizontal className="h-5 w-5" aria-hidden="true" />} action={<Button onClick={clear}>Limpar filtros</Button>} code="TRK">
              Experimente outro tipo de circuito ou região.
            </EmptyState>
          )}
        </div>
      </Container>
    </>
  );
}
