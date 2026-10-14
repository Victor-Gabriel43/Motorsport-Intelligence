import { SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { Container, PageHeader } from "@/components/editorial/Editorial";
import { DriverCard, TeamRow } from "@/components/garage/Cards";
import { Button } from "@/components/ui/Button";
import { SearchField, SelectField, Tabs } from "@/components/ui/Controls";
import { EmptyState } from "@/components/ui/States";
import { disciplines } from "@/data/reference/disciplines";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useClearQuery, useQueryState } from "@/hooks/useQueryState";
import { catalog } from "@/services/data";
import { normalize } from "@/services/search";

const KEYS = ["q", "discipline", "country", "championship"];

export default function DriversTeams() {
  usePageMeta("Drivers & Teams");
  const [tab, setTab] = useQueryState("tab", "drivers");
  const [q, setQ] = useQueryState("q", "");
  const [discipline, setDiscipline] = useQueryState("discipline");
  const [country, setCountry] = useQueryState("country");
  const [championship, setChampionship] = useQueryState("championship");
  const clear = useClearQuery(KEYS);

  const drivers = useMemo(
    () =>
      catalog.drivers.filter(
        (d) =>
          (!q || normalize(d.name).includes(normalize(q))) &&
          (discipline === "all" || d.disciplines.includes(discipline as never)) &&
          (country === "all" || d.countryCode === country) &&
          (championship === "all" || d.championshipIds.includes(championship)),
      ),
    [q, discipline, country, championship],
  );
  const teams = useMemo(
    () =>
      catalog.teams.filter(
        (t) =>
          (!q || normalize(t.name).includes(normalize(q))) &&
          (discipline === "all" || t.disciplines.includes(discipline as never)) &&
          (country === "all" || t.countryCode === country) &&
          (championship === "all" || t.championshipIds.includes(championship)),
      ),
    [q, discipline, country, championship],
  );

  const source = tab === "drivers" ? catalog.drivers : catalog.teams;
  const countries = Array.from(new Map(source.map((x) => [x.countryCode, "nationality" in x ? x.nationality : x.country])).entries()).sort((a, b) => a[1].localeCompare(b[1]));
  const champIds = Array.from(new Set(source.flatMap((x) => x.championshipIds)));

  const empty = (
    <EmptyState title="Ninguém corresponde aos filtros." icon={<SlidersHorizontal className="h-5 w-5" aria-hidden="true" />} action={<Button onClick={clear}>Limpar filtros</Button>} code="NONE">
      Ajuste a busca, a modalidade ou o país.
    </EmptyState>
  );

  return (
    <>
      <PageHeader
        code="04"
        kicker="Drivers & Teams"
        title={
          <>
            Pilotos
            <br />e equipes
          </>
        }
        dek="Perfis com nacionalidade, histórico de equipes, campeonatos e conquistas consolidadas. Nada de biografias, números ou equipes atuais inventados: a temporada corrente depende de fonte conectada."
      />
      <Container className="mt-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end">
          <SearchField label="Buscar" value={q} onChange={setQ} placeholder={tab === "drivers" ? "Nome do piloto" : "Nome da equipe"} />
          <SelectField label="Modalidade" value={discipline} onChange={setDiscipline} options={[{ value: "all", label: "Todas" }, ...disciplines.map((d) => ({ value: d.id, label: d.shortName }))]} />
          <SelectField label={tab === "drivers" ? "Nacionalidade" : "País"} value={country} onChange={setCountry} options={[{ value: "all", label: "Todos" }, ...countries.map(([code, label]) => ({ value: code, label }))]} />
          <SelectField label="Campeonato" value={championship} onChange={setChampionship} options={[{ value: "all", label: "Todos" }, ...champIds.map((id) => ({ value: id, label: catalog.championshipById[id]?.shortName ?? id }))]} />
          <Button variant="ghost" onClick={clear} className="h-[42px]">Limpar</Button>
        </div>
      </Container>
      <Container className="mt-8">
        <Tabs
          label="Pilotos ou equipes"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "drivers", label: "Pilotos", count: drivers.length },
            { id: "teams", label: "Equipes", count: teams.length },
          ]}
        >
          {tab === "drivers" ? (
            drivers.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{drivers.map((d) => <DriverCard key={d.id} driver={d} />)}</div>
            ) : (
              empty
            )
          ) : teams.length ? (
            <div className="border-t border-line">{teams.map((t) => <TeamRow key={t.id} team={t} />)}</div>
          ) : (
            empty
          )}
        </Tabs>
      </Container>
    </>
  );
}
