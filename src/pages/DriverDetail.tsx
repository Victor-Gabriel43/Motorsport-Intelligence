import { ArrowLeft, Medal } from "lucide-react";
import { Link, useParams } from "react-router";
import { ChampionshipRow } from "@/components/championship/ChampionshipCard";
import { Container, MetaList, SectionHeader, SourceNote } from "@/components/editorial/Editorial";
import { CarCard, Monogram } from "@/components/garage/Cards";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { EmptyState } from "@/components/ui/States";
import { disciplineById } from "@/data/reference/disciplines";
import { usePageMeta } from "@/hooks/usePageMeta";
import { catalog } from "@/services/data";
import type { Driver } from "@/types/models";
import NotFound from "./system/NotFound";

export default function DriverDetail() {
  const { id = "" } = useParams();
  const driver = catalog.driverById[id];
  if (!driver) return <NotFound />;
  return <DriverView key={driver.id} driver={driver} />;
}

function DriverView({ driver }: { driver: Driver }) {
  usePageMeta(driver.name);
  const lastTeam = catalog.teamById[driver.teamHistory[driver.teamHistory.length - 1]?.teamId ?? ""];
  const current = driver.currentTeamId ? catalog.teamById[driver.currentTeamId] : undefined;
  const cars = driver.carIds.map((c) => catalog.carById[c]!).filter(Boolean);
  const [first, ...rest] = driver.name.split(" ");

  return (
    <>
      <header className="border-b border-line">
        <Container className="pt-8">
          <Link to="/drivers-teams" className="group inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mist hover:text-paper">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Drivers & Teams
          </Link>
        </Container>
        <Container className="grid gap-10 pb-12 pt-10 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:items-end">
          {driver.photo ? (
            <figure>
              <img src={driver.photo.src} alt={driver.photo.alt} className="aspect-[4/5] w-full object-cover" />
              <figcaption className="mt-2 text-xs text-mist">{driver.photo.credit} · {driver.photo.license}</figcaption>
            </figure>
          ) : (
            <div>
              <Monogram name={driver.name} accent={lastTeam?.accent} className="aspect-[4/5]" />
              <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-mist">Sem fotografia licenciada</p>
            </div>
          )}
          <div>
            <div className="flex flex-wrap gap-2">
              {driver.disciplines.map((d) => (
                <Badge key={d} tone="outline">{disciplineById[d].shortName}</Badge>
              ))}
            </div>
            <h1 className="display mt-6 animate-rise text-[clamp(2.8rem,8vw,7rem)]">
              <span className="block text-silver">{first}</span>
              {rest.join(" ")}
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <FavoriteButton kind="drivers" id={driver.id} label={driver.name} />
            </div>
          </div>
        </Container>
      </header>

      <Container className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-10">
          <MetaList
            items={[
              { label: "Nacionalidade", value: driver.nationality },
              { label: "País", value: driver.countryCode },
              { label: "Equipe atual", value: current ? current.name : "Sem fonte conectada" },
              { label: "Temporada atual", value: "Sem fonte conectada" },
            ]}
          />
          <section aria-labelledby="h-teams">
            <SectionHeader title={<span id="h-teams">Histórico de equipes</span>} className="!mb-3" />
            {driver.teamHistory.length ? (
              <ol className="border-t border-line">
                {driver.teamHistory.map((t) => (
                  <li key={t.label} className="border-b border-line py-3 text-sm">
                    {t.teamId && catalog.teamById[t.teamId] ? (
                      <Link to={`/drivers-teams/teams/${t.teamId}`} className="link-underline text-paper">{t.label}</Link>
                    ) : (
                      <span className="text-silver">{t.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-mist">Histórico de equipes ainda não catalogado.</p>
            )}
          </section>
          <SourceNote provenance={driver.provenance} />
        </div>
        <div className="space-y-14">
          <section aria-labelledby="h-honours">
            <SectionHeader title={<span id="h-honours">Conquistas e recordes</span>} className="!mb-5" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {driver.honours.map((h) => (
                <li key={h.label} className="border border-line bg-carbon p-5">
                  <Medal className="h-5 w-5 text-apex-ink" aria-hidden="true" />
                  <p className="wide mt-4 font-semibold text-paper">{h.label}</p>
                  {h.detail ? <p className="meta mt-2">{h.detail}</p> : null}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="h-champs">
            <SectionHeader title={<span id="h-champs">Campeonatos disputados</span>} className="!mb-2" />
            {driver.championshipIds.map((c) => catalog.championshipById[c]).filter(Boolean).map((c) => <ChampionshipRow key={c!.id} championship={c!} />)}
          </section>
          <section aria-labelledby="h-cars">
            <SectionHeader title={<span id="h-cars">Carros associados</span>} className="!mb-5" />
            {cars.length ? (
              <div className="grid gap-4 sm:grid-cols-2">{cars.map((c) => <CarCard key={c.id} car={c} />)}</div>
            ) : (
              <EmptyState title="Nenhum carro associado no arquivo." code="CAR">Os carros pilotados serão vinculados conforme a Garage cresce.</EmptyState>
            )}
          </section>
        </div>
      </Container>
    </>
  );
}
