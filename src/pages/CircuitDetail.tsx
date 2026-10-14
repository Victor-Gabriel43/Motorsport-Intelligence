import { ArrowLeft, MapPinned } from "lucide-react";
import { Link, useParams } from "react-router";
import { ChampionshipRow } from "@/components/championship/ChampionshipCard";
import { Container, MetaList, SectionHeader, SourceNote } from "@/components/editorial/Editorial";
import { EventRow } from "@/components/race/Race";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { EmptyState, LoadingBlock } from "@/components/ui/States";
import { circuitTypeLabels } from "@/data/reference/circuits";
import { regionLabels } from "@/data/reference/disciplines";
import { useEvents } from "@/hooks/useLive";
import { usePageMeta } from "@/hooks/usePageMeta";
import { catalog } from "@/services/data";
import { useMyApex } from "@/store/myApex";
import type { Circuit } from "@/types/models";
import { formatLength } from "@/lib/format";
import NotFound from "./system/NotFound";

export default function CircuitDetail() {
  const { id = "" } = useParams();
  const circuit = catalog.circuitById[id];
  if (!circuit) return <NotFound />;
  return <CircuitView key={circuit.id} circuit={circuit} />;
}

function CircuitView({ circuit: c }: { circuit: Circuit }) {
  usePageMeta(c.shortName);
  const units = useMyApex((s) => s.preferences.units);
  const events = useEvents();
  const here = events.status === "ok" ? events.data.filter((e) => e.circuitId === c.id) : [];
  const championships = c.championshipIds.map((id) => catalog.championshipById[id]!).filter(Boolean);

  return (
    <>
      <header className="relative overflow-hidden border-b border-line">
        <div className="tech-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
        <span aria-hidden="true" className="display pointer-events-none absolute -right-4 bottom-0 select-none text-[clamp(8rem,28vw,24rem)] leading-none text-white/[0.03]">
          {c.countryCode}
        </span>
        <Container className="relative pb-14 pt-8">
          <Link to="/circuits" className="group inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mist hover:text-paper">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Circuits
          </Link>
          <div className="mt-16 flex flex-wrap gap-2">
            <Badge tone="apex">{circuitTypeLabels[c.type]}</Badge>
            <Badge tone="outline">{regionLabels[c.region]}</Badge>
          </div>
          <p className="kicker mt-6">{c.locality} · {c.country}</p>
          <h1 className="display mt-3 max-w-[14ch] animate-rise text-[clamp(2.6rem,7.5vw,6.5rem)]">{c.shortName}</h1>
          <p className="mt-3 text-silver">{c.name}</p>
          <div className="mt-8"><FavoriteButton kind="circuits" id={c.id} label={c.name} /></div>
        </Container>
      </header>

      <Container className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-10">
          <MetaList
            items={[
              { label: "Extensão", value: c.lengthKm ? formatLength(c.lengthKm, units) : "Variável / não aplicável" },
              { label: "Tipo", value: circuitTypeLabels[c.type] },
              { label: "País", value: c.country },
              { label: "Localização", value: c.locality },
            ]}
          />
          {c.layoutNote ? <p className="border-l-2 border-line-strong pl-4 text-sm text-silver">{c.layoutNote}</p> : null}
          <div>
            <p className="kicker mb-3">Características</p>
            <div className="flex flex-wrap gap-2">{c.characteristics.map((ch) => <Badge key={ch} tone="outline">{ch}</Badge>)}</div>
          </div>
          <SourceNote provenance={c.provenance} />
        </div>
        <div className="space-y-14">
          <section aria-labelledby="h-map">
            <SectionHeader title={<span id="h-map">Traçado</span>} className="!mb-5" />
            {c.map ? (
              <figure>
                <img src={c.map.src} alt={c.map.alt} className="w-full" />
                <figcaption className="mt-2 text-xs text-mist">{c.map.credit} · {c.map.license}</figcaption>
              </figure>
            ) : (
              <EmptyState title="Mapa do traçado indisponível." icon={<MapPinned className="h-5 w-5" aria-hidden="true" />} code="MAP">
                O APEX não desenha traçados aproximados. O mapa será exibido quando houver uma fonte com licença adequada.
              </EmptyState>
            )}
          </section>
          <section aria-labelledby="h-champs">
            <SectionHeader title={<span id="h-champs">Campeonatos que usam o local</span>} className="!mb-2" />
            {championships.length ? championships.map((ch) => <ChampionshipRow key={ch.id} championship={ch} />) : <p className="text-sm text-mist">Nenhum campeonato associado no arquivo.</p>}
          </section>
          <section aria-labelledby="h-events">
            <SectionHeader title={<span id="h-events">Histórico de eventos</span>} className="!mb-2" />
            {events.status === "loading" ? (
              <LoadingBlock rows={2} />
            ) : here.length ? (
              here.map((e) => <EventRow key={e.id} event={e} />)
            ) : (
              <EmptyState title="Nenhum evento registrado." code="EVT">O histórico de provas depende de uma fonte de resultados conectada.</EmptyState>
            )}
          </section>
        </div>
      </Container>
    </>
  );
}
