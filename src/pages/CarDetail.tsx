import { ArrowLeft, ImageOff } from "lucide-react";
import { Link, useParams } from "react-router";
import { Plate } from "@/components/art/Plate";
import { Container, MetaList, SectionHeader, SourceNote } from "@/components/editorial/Editorial";
import { CarCard, TeamRow } from "@/components/garage/Cards";
import { ChampionshipRow } from "@/components/championship/ChampionshipCard";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { EmptyState } from "@/components/ui/States";
import { powertrainLabels } from "@/data/reference/cars";
import { usePageMeta } from "@/hooks/usePageMeta";
import { catalog } from "@/services/data";
import type { Car } from "@/types/models";
import NotFound from "./system/NotFound";

export default function CarDetail() {
  const { id = "" } = useParams();
  const car = catalog.carById[id];
  if (!car) return <NotFound />;
  return <CarView key={car.id} car={car} />;
}

function CarView({ car }: { car: Car }) {
  usePageMeta(car.name);
  const accent = catalog.championshipById[car.championshipIds[0] ?? ""]?.accent ?? "var(--color-apex)";
  const championships = car.championshipIds.map((c) => catalog.championshipById[c]!).filter(Boolean);
  const teams = car.teamIds.map((t) => catalog.teamById[t]!).filter(Boolean);
  const related = catalog.cars.filter((c) => c.id !== car.id && (c.techClass === car.techClass || c.manufacturer === car.manufacturer)).slice(0, 3);
  const drivers = catalog.drivers.filter((d) => d.carIds.includes(car.id));

  return (
    <>
      <section className="relative border-b border-line">
        <Plate body={car.body} accent={accent} media={car.gallery[0]} composition="upper" watermark={car.model.split(" ")[0]} caption={car.gallery[0] ? undefined : `Ilustração técnica · ${car.techClass}`} className="h-[min(78svh,760px)] min-h-[420px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink" />
        <Container className="absolute inset-x-0 top-0 pt-8">
          <Link to="/garage" className="group inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mist hover:text-paper">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Garage
          </Link>
        </Container>
        <Container className="absolute inset-x-0 bottom-0 pb-10">
          <p className="kicker">{car.manufacturer} · {car.category}</p>
          <h1 className="display mt-3 animate-rise text-[clamp(2.6rem,8vw,7.5rem)]">{car.name}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge tone="apex">{car.techClass}</Badge>
            <Badge tone="outline">{powertrainLabels[car.powertrain]}</Badge>
            <Badge>{car.seasonsLabel}</Badge>
            <FavoriteButton kind="cars" id={car.id} label={car.name} className="ml-auto" />
          </div>
        </Container>
      </section>

      <Container className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="space-y-14">
          <section aria-labelledby="h-specs">
            <SectionHeader title={<span id="h-specs">Ficha técnica</span>} className="!mb-5" />
            <MetaList
              columns={2}
              items={[
                { label: "Nome oficial", value: car.name },
                { label: "Fabricante", value: car.manufacturer },
                { label: "Modelo", value: car.model },
                { label: "Classe técnica", value: car.techClass },
                ...car.specs.map((s) => ({ label: s.label, value: s.value })),
              ]}
            />
            <p className="mt-4 text-xs text-mist">Potência, peso e dimensões serão exibidos apenas a partir de documentação oficial do fabricante ou do regulamento.</p>
          </section>

          <section aria-labelledby="h-history">
            <SectionHeader title={<span id="h-history">Histórico esportivo</span>} className="!mb-5" />
            {car.history.length ? (
              <ul className="space-y-3">
                {car.history.map((h) => (
                  <li key={h} className="flex gap-4 border-l-2 border-apex pl-4 text-silver">{h}</li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Histórico ainda não catalogado." code="LOG">Vitórias e resultados deste carro serão adicionados a partir de fontes verificadas.</EmptyState>
            )}
          </section>

          <section aria-labelledby="h-gallery">
            <SectionHeader title={<span id="h-gallery">Galeria</span>} className="!mb-5" />
            {car.gallery.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {car.gallery.map((m) => (
                  <figure key={m.src}>
                    <img src={m.src} alt={m.alt} className="aspect-[3/2] w-full object-cover" loading="lazy" />
                    <figcaption className="mt-2 text-xs text-mist">{m.credit} · {m.license}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <EmptyState title="Sem fotografias licenciadas." icon={<ImageOff className="h-5 w-5" aria-hidden="true" />} code="IMG">
                A galeria aceita imagens com crédito e licença registrados (veja <code className="font-mono text-paper">Media</code> no modelo de dados).
              </EmptyState>
            )}
          </section>
        </div>

        <aside className="space-y-12">
          <section aria-labelledby="h-champs">
            <SectionHeader title={<span id="h-champs">Campeonatos</span>} className="!mb-2" />
            <div>{championships.map((c) => <ChampionshipRow key={c.id} championship={c} />)}</div>
          </section>
          <section aria-labelledby="h-teams">
            <SectionHeader title={<span id="h-teams">Equipes associadas</span>} className="!mb-2" />
            {teams.length ? <div>{teams.map((t) => <TeamRow key={t.id} team={t} />)}</div> : <p className="text-sm text-mist">Nenhuma equipe associada no arquivo de referência.</p>}
          </section>
          {drivers.length ? (
            <section aria-labelledby="h-drivers">
              <SectionHeader title={<span id="h-drivers">Pilotos</span>} className="!mb-2" />
              <ul>{drivers.map((d) => <li key={d.id} className="border-b border-line py-3"><Link to={`/drivers-teams/drivers/${d.id}`} className="font-semibold hover:text-apex-ink">{d.name}</Link></li>)}</ul>
            </section>
          ) : null}
          <section aria-label="Fontes">
            <p className="kicker mb-3">Fontes das informações</p>
            <SourceNote provenance={car.provenance} />
          </section>
        </aside>
      </Container>

      {related.length ? (
        <Container className="mt-24">
          <SectionHeader title="No mesmo arquivo" to="/garage" linkLabel="Garage" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((c) => <CarCard key={c.id} car={c} />)}</div>
        </Container>
      ) : null}
    </>
  );
}
