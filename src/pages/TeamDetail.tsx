import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";
import { ChampionshipRow } from "@/components/championship/ChampionshipCard";
import { Container, MetaList, SectionHeader, SourceNote } from "@/components/editorial/Editorial";
import { CarCard, DriverCard } from "@/components/garage/Cards";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { EmptyState } from "@/components/ui/States";
import { disciplineById } from "@/data/reference/disciplines";
import { usePageMeta } from "@/hooks/usePageMeta";
import { catalog } from "@/services/data";
import type { Team } from "@/types/models";
import NotFound from "./system/NotFound";

export default function TeamDetail() {
  const { id = "" } = useParams();
  const team = catalog.teamById[id];
  if (!team) return <NotFound />;
  return <TeamView key={team.id} team={team} />;
}

function TeamView({ team }: { team: Team }) {
  usePageMeta(team.name);
  const cars = team.carIds.map((c) => catalog.carById[c]!).filter(Boolean);
  const alumni = catalog.drivers.filter((d) => d.teamHistory.some((t) => t.teamId === team.id));
  return (
    <>
      <header className="relative overflow-hidden border-b border-line">
        <span className="absolute inset-x-0 top-0 h-1" style={{ background: team.accent }} aria-hidden="true" />
        <div className="tech-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <Container className="relative pb-12 pt-8">
          <Link to="/drivers-teams?tab=teams" className="group inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mist hover:text-paper">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Equipes
          </Link>
          <div className="mt-16 flex flex-wrap gap-2">
            {team.disciplines.map((d) => <Badge key={d} tone="outline">{disciplineById[d].shortName}</Badge>)}
          </div>
          <h1 className="display mt-5 max-w-[16ch] animate-rise text-[clamp(2.6rem,7vw,6rem)]">{team.name}</h1>
          <div className="mt-8"><FavoriteButton kind="teams" id={team.id} label={team.name} /></div>
        </Container>
      </header>
      <Container className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-8">
          <MetaList
            items={[
              { label: "País", value: team.country },
              { label: "Base", value: team.base ?? "Não informado" },
              { label: "Pilotos atuais", value: "Sem fonte conectada" },
              { label: "Temporada atual", value: "Sem fonte conectada" },
            ]}
          />
          <SourceNote provenance={team.provenance} />
        </div>
        <div className="space-y-14">
          <section aria-labelledby="h-champs">
            <SectionHeader title={<span id="h-champs">Campeonatos</span>} className="!mb-2" />
            {team.championshipIds.map((c) => catalog.championshipById[c]).filter(Boolean).map((c) => <ChampionshipRow key={c!.id} championship={c!} />)}
          </section>
          <section aria-labelledby="h-cars">
            <SectionHeader title={<span id="h-cars">Carros associados</span>} className="!mb-5" />
            {cars.length ? <div className="grid gap-4 sm:grid-cols-2">{cars.map((c) => <CarCard key={c.id} car={c} />)}</div> : <EmptyState title="Nenhum carro associado no arquivo." code="CAR" />}
          </section>
          {alumni.length ? (
            <section aria-labelledby="h-alumni">
              <SectionHeader title={<span id="h-alumni">Pilotos no histórico</span>} className="!mb-5" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{alumni.map((d) => <DriverCard key={d.id} driver={d} />)}</div>
            </section>
          ) : null}
        </div>
      </Container>
    </>
  );
}
