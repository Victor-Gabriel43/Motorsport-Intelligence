import { LayoutGrid, Rows3, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";
import { Plate } from "@/components/art/Plate";
import { Container, PageHeader } from "@/components/editorial/Editorial";
import { CarCard } from "@/components/garage/Cards";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchField, SelectField } from "@/components/ui/Controls";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { EmptyState } from "@/components/ui/States";
import { powertrainLabels } from "@/data/reference/cars";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useClearQuery, useQueryState } from "@/hooks/useQueryState";
import { catalog } from "@/services/data";
import { normalize } from "@/services/search";
import type { BodyType } from "@/types/models";
import { cx } from "@/lib/format";

const KEYS = ["manufacturer", "championship", "category", "class", "year", "team", "body", "powertrain", "q", "sort"];

const bodyLabels: Record<BodyType, string> = {
  "open-wheel": "Monoposto",
  prototype: "Protótipo",
  gt: "GT",
  rally: "Rally",
  "rally-raid": "Rally-raid",
  stock: "Stock car",
  touring: "Turismo",
  dragster: "Dragster",
  "sprint-car": "Sprint car",
};

const uniq = <T,>(list: T[]) => Array.from(new Set(list));
/** "2023 —" is still active; "2025" raced a single season. */
const lastYear = (label: string) => (/—\s*$/.test(label) ? Infinity : Number(label.trim().slice(-4)));

export default function Garage() {
  usePageMeta("Garage");
  const [manufacturer, setManufacturer] = useQueryState("manufacturer");
  const [championship, setChampionship] = useQueryState("championship");
  const [category, setCategory] = useQueryState("category");
  const [techClass, setTechClass] = useQueryState("class");
  const [year, setYear] = useQueryState("year");
  const [team, setTeam] = useQueryState("team");
  const [body, setBody] = useQueryState("body");
  const [powertrain, setPowertrain] = useQueryState("powertrain");
  const [q, setQ] = useQueryState("q", "");
  const [sort, setSort] = useQueryState("sort", "recent");
  const [view, setView] = useQueryState("view", "grid");
  const clear = useClearQuery(KEYS);

  const cars = catalog.cars;
  const filtered = useMemo(() => {
    const list = cars.filter(
      (c) =>
        (manufacturer === "all" || c.manufacturer === manufacturer) &&
        (championship === "all" || c.championshipIds.includes(championship)) &&
        (category === "all" || c.category === category) &&
        (techClass === "all" || c.techClass === techClass) &&
        (year === "all" || (c.firstYear <= Number(year) && lastYear(c.seasonsLabel) >= Number(year))) &&
        (team === "all" || c.teamIds.includes(team)) &&
        (body === "all" || c.body === body) &&
        (powertrain === "all" || c.powertrain === powertrain) &&
        (!q || normalize(`${c.name} ${c.manufacturer} ${c.techClass}`).includes(normalize(q))),
    );
    return [...list].sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : sort === "manufacturer" ? a.manufacturer.localeCompare(b.manufacturer) : b.firstYear - a.firstYear));
  }, [cars, manufacturer, championship, category, techClass, year, team, body, powertrain, q, sort]);

  const opt = (values: string[], all: string, label: (v: string) => string = (v) => v) => [{ value: "all", label: all }, ...values.map((v) => ({ value: v, label: label(v) }))];
  const champIds = uniq(cars.flatMap((c) => c.championshipIds));
  const teamIds = uniq(cars.flatMap((c) => c.teamIds));
  const featured = catalog.carById["porsche-963"]!;

  return (
    <>
      <PageHeader
        code="03"
        kicker="Garage"
        title={
          <>
            O arquivo
            <br />
            de competição
          </>
        }
        dek="Protótipos, monopostos, GT3, carros de rally e stock cars. Cada ficha reúne classe técnica, campeonatos, equipes e especificações — com a fonte de cada informação."
        aside={
          <p className="border-l-2 border-line-strong pl-4 text-xs leading-relaxed text-mist">
            Sem fotografias licenciadas conectadas, os carros são apresentados por ilustrações técnicas genéricas da categoria — não representam o desenho exato de cada modelo.
          </p>
        }
      />

      <Container className="mt-10">
        <Link to={`/garage/${featured.id}`} className="group relative grid overflow-hidden border border-line md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Plate body={featured.body} accent="#D5001C" composition="low" watermark="963" caption="Ilustração técnica · LMDh" className="aspect-[16/9] md:aspect-auto md:min-h-[26rem]" />
          <div className="flex flex-col justify-between gap-8 border-t border-line bg-carbon p-6 md:border-l md:border-t-0 sm:p-8">
            <div>
              <p className="kicker text-apex-ink">Em destaque no arquivo</p>
              <p className="display mt-4 text-[clamp(2.2rem,4vw,3.4rem)]">{featured.name}</p>
              <p className="mt-3 text-sm text-silver">{featured.category} · {featured.techClass}</p>
            </div>
            <dl className="divide-y divide-line border-y border-line">
              {featured.specs.map((s) => (
                <div key={s.label} className="flex justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-mist">{s.label}</dt>
                  <dd className="text-right text-paper">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Link>
      </Container>

      <Container className="mt-14">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          <SearchField label="Buscar no arquivo" value={q} onChange={setQ} placeholder="Modelo, fabricante, classe" />
          <SelectField label="Fabricante" value={manufacturer} onChange={setManufacturer} options={opt(uniq(cars.map((c) => c.manufacturer)).sort(), "Todos")} />
          <SelectField label="Campeonato" value={championship} onChange={setChampionship} options={opt(champIds, "Todos", (v) => catalog.championshipById[v]?.shortName ?? v)} />
          <SelectField label="Categoria" value={category} onChange={setCategory} options={opt(uniq(cars.map((c) => c.category)), "Todas")} />
          <SelectField label="Classe técnica" value={techClass} onChange={setTechClass} options={opt(uniq(cars.map((c) => c.techClass)), "Todas")} />
          <SelectField label="Em atividade em" value={year} onChange={setYear} options={opt(["2026", "2025", "2024", "2023", "2022"], "Qualquer ano")} />
          <SelectField label="Equipe" value={team} onChange={setTeam} options={opt(teamIds, "Todas", (v) => catalog.teamById[v]?.name ?? v)} />
          <SelectField label="Carroceria" value={body} onChange={setBody} options={opt(uniq(cars.map((c) => c.body)), "Todas", (v) => bodyLabels[v as BodyType])} />
          <SelectField label="Motorização" value={powertrain} onChange={setPowertrain} options={opt(uniq(cars.map((c) => c.powertrain)), "Todas", (v) => powertrainLabels[v as keyof typeof powertrainLabels])} />
          <SelectField
            label="Ordenar"
            value={sort}
            onChange={setSort}
            options={[
              { value: "recent", label: "Mais recentes" },
              { value: "name", label: "Nome" },
              { value: "manufacturer", label: "Fabricante" },
            ]}
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <p className="meta" aria-live="polite">
            {filtered.length} de {cars.length} carros
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={clear}>Limpar filtros</Button>
            <div role="group" aria-label="Modo de exibição" className="flex border border-line">
              <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")} className={cx("p-2.5", view === "grid" ? "bg-white/10 text-paper" : "text-mist hover:text-paper")} aria-label="Grade">
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} className={cx("p-2.5", view === "list" ? "bg-white/10 text-paper" : "text-mist hover:text-paper")} aria-label="Lista">
                <Rows3 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {filtered.length === 0 ? (
            <EmptyState title="Nenhum carro corresponde aos filtros." icon={<SlidersHorizontal className="h-5 w-5" aria-hidden="true" />} action={<Button onClick={clear}>Limpar filtros</Button>} code="CAR">
              Tente remover um filtro ou buscar por outro fabricante.
            </EmptyState>
          ) : view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem] border-collapse">
                <thead>
                  <tr className="border-b border-line text-left">
                    {["Carro", "Fabricante", "Classe", "Motorização", "Temporadas", ""].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] text-mist">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((car) => (
                    <tr key={car.id} className="border-b border-line hover:bg-white/[0.025]">
                      <td className="density-row px-3 py-3">
                        <Link to={`/garage/${car.id}`} className="wide font-semibold text-paper hover:text-apex-ink">{car.name}</Link>
                      </td>
                      <td className="px-3 py-3 text-sm text-silver">{car.manufacturer}</td>
                      <td className="px-3 py-3"><Badge tone="outline">{car.techClass}</Badge></td>
                      <td className="px-3 py-3 text-sm text-silver">{powertrainLabels[car.powertrain]}</td>
                      <td className="px-3 py-3 font-mono text-xs text-silver">{car.seasonsLabel}</td>
                      <td className="px-3 py-3 text-right"><FavoriteButton kind="cars" id={car.id} label={car.name} compact className="bg-transparent" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
