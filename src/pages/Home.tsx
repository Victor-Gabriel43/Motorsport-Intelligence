import { ArrowRight, ArrowUpRight, CalendarDays, Flag, Trophy, Warehouse } from "lucide-react";
import { Link } from "react-router";
import { Plate } from "@/components/art/Plate";
import { ChampionshipFeature, ChampionshipRow } from "@/components/championship/ChampionshipCard";
import { Container, SectionHeader } from "@/components/editorial/Editorial";
import { CarRow, DriverCard, TeamRow } from "@/components/garage/Cards";
import { EventCard, EventRow, formatLabels } from "@/components/race/Race";
import { Badge, ProvenanceBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, LoadingBlock, Skeleton } from "@/components/ui/States";
import { brand } from "@/config/brand";
import { disciplines } from "@/data/reference/disciplines";
import { useEvents, useNews, useSessionResult } from "@/hooks/useLive";
import { usePageMeta } from "@/hooks/usePageMeta";
import { catalog, isUpcoming, mainSession } from "@/services/data";
import { useMyApex } from "@/store/myApex";
import type { RaceEvent } from "@/types/models";
import { formatDate, formatDateRange, formatSessionTime, relativeDays, accentText } from "@/lib/format";

export default function Home() {
  usePageMeta();
  const events = useEvents();
  const list = events.status === "ok" ? events.data : [];
  const upcoming = list.filter(isUpcoming);
  const past = list.filter((e) => !isUpcoming(e)).reverse();

  return (
    <>
      <Hero next={upcoming[0]} loading={events.status === "loading"} />
      <Shortcuts />

      <Container className="mt-24 grid gap-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
        <section aria-labelledby="h-upcoming">
          <SectionHeader code="02 · Race Center" title={<span id="h-upcoming">Próximos eventos</span>} to="/race-center" linkLabel="Calendário completo" />
          {events.status === "loading" ? (
            <LoadingBlock rows={5} />
          ) : upcoming.length ? (
            <div>
              {upcoming.slice(0, 6).map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState title="Calendário ainda não conectado." code="CAL">
              Os próximos eventos aparecerão aqui quando uma fonte oficial de calendário for integrada.
            </EmptyState>
          )}
        </section>
        <section aria-labelledby="h-results">
          <SectionHeader code="Resultados" title={<span id="h-results">Últimos resultados</span>} to="/race-center?status=finished" linkLabel="Todos" />
          {events.status === "loading" ? (
            <Skeleton className="h-96" />
          ) : past[0] ? (
            <div className="space-y-4">
              <LatestResult event={past[0]} />
              {past.slice(1, 3).map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState title="Sem resultados para exibir." code="RES">
              Resultados só são publicados a partir de uma fonte verificada.
            </EmptyState>
          )}
        </section>
      </Container>

      <FeaturedChampionships />
      <Disciplines />
      <GarageTeaser />
      <NewsBlock />
      <PeopleBlock />
    </>
  );
}

/* ─────────────────────────────── Hero ─────────────────────────────── */

function Hero({ next, loading }: { next?: RaceEvent; loading: boolean }) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-line">
      <div className="tech-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_60%_70%,black,transparent_75%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_62%_78%,rgb(232_32_42/0.12),transparent_70%)]" />

      <Container className="relative pt-14 sm:pt-20">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 bg-apex" />
          <span className="kicker text-silver">{brand.descriptor}</span>
        </div>
        <h1 id="hero-title" className="display mt-8 max-w-[11ch] animate-rise text-[clamp(3.2rem,9vw,8.6rem)] text-paper">
          Toda curva tem um <span className="text-apex-ink">ápice.</span>
        </h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-end">
          <div>
            <p className="max-w-md animate-rise text-base leading-relaxed text-silver [animation-delay:120ms] sm:text-lg">
              Campeonatos, carros, circuitos e pilotos do automobilismo mundial — organizados como um arquivo técnico, lidos como uma revista.
            </p>
            <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:200ms]">
              <ButtonLink to="/championships" variant="primary">
                Explorar a competição <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink to="/race-center">Race Center</ButtonLink>
            </div>
          </div>
          <NextRacePanel next={next} loading={loading} />
        </div>
      </Container>

      <div className="relative mt-4">
        <Plate
          body="prototype"
          composition="center"
          watermark="APEX"
          caption="Ilustração técnica · protótipo de endurance"
          className="aspect-[16/9] bg-transparent [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] sm:aspect-[21/7]"
        />
      </div>

      <Container className="relative border-t border-line py-5">
        <ul className="scrollbar-none -mx-4 flex gap-x-7 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Modalidades">
          {disciplines.map((d, i) => (
            <li key={d.id} className="shrink-0">
              <Link to={`/championships?discipline=${d.id}`} className="group flex items-baseline gap-2 py-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mist transition-colors hover:text-paper">
                <span className="text-apex-ink/70 group-hover:text-apex-ink">{String(i + 1).padStart(2, "0")}</span>
                {d.shortName}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function NextRacePanel({ next, loading }: { next?: RaceEvent; loading: boolean }) {
  const tz = useMyApex((s) => s.preferences.timeZone);
  if (loading) return <Skeleton className="h-44 w-full" />;
  if (!next)
    return (
      <div className="border border-line-strong bg-ink/70 p-5 backdrop-blur-md">
        <p className="kicker">Próxima corrida</p>
        <p className="mt-3 text-sm text-silver">Nenhuma fonte de calendário conectada. A próxima etapa será destacada aqui quando houver dados reais.</p>
      </div>
    );
  const champ = catalog.championshipById[next.championshipId]!;
  const circuit = catalog.circuitById[next.circuitId]!;
  const main = mainSession(next);
  return (
    <Link to={`/race-center/${next.id}`} className="group block border border-line-strong bg-ink/75 backdrop-blur-md transition-colors hover:border-paper/40">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <span className="kicker text-paper">Próxima corrida</span>
        <ProvenanceBadge provenance={next.provenance} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-5 py-5">
        <div className="min-w-0">
          <p className="kicker" style={{ color: accentText(champ.accent) }}>
            {champ.shortName} · Etapa {next.round}
          </p>
          <p className="display-condensed mt-2 truncate text-[2.2rem] text-paper">{circuit.shortName}</p>
          <p className="mt-1 truncate text-xs text-mist">
            {circuit.locality} · {circuit.country}
          </p>
        </div>
        <div className="text-right">
          <p className="display-condensed text-[2.2rem] tabular text-paper">{relativeDays(main.start).replace("Em ", "")}</p>
          <p className="meta mt-1">{formatDateRange(next.startDate, next.endDate)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-silver">
        <span className="truncate">
          {main.name} · {formatSessionTime(main.start, tz)}
        </span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-mist transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper" aria-hidden="true" />
      </div>
    </Link>
  );
}

/* ───────────────────────────── Shortcuts ───────────────────────────── */

const shortcuts = [
  { to: "/race-center", label: "Calendário", hint: "Etapas e sessões", Icon: CalendarDays },
  { to: "/race-center?status=finished", label: "Resultados", hint: "Sessões encerradas", Icon: Flag },
  { to: "/championships", label: "Campeonatos", hint: `${catalog.championships.length} competições`, Icon: Trophy },
  { to: "/garage", label: "Garage", hint: `${catalog.cars.length} carros no arquivo`, Icon: Warehouse },
];

function Shortcuts() {
  return (
    <Container className="mt-10">
      <nav aria-label="Atalhos" className="grid grid-cols-2 border border-line md:grid-cols-4">
        {shortcuts.map(({ to, label, hint, Icon }, i) => (
          <Link
            key={to}
            to={to}
            className="group relative flex flex-col gap-8 border-line p-5 transition-colors hover:bg-white/[0.03] sm:p-6 [&:not(:last-child)]:border-r max-md:[&:nth-child(2)]:border-r-0 max-md:[&:nth-child(-n+2)]:border-b"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.65rem] text-mist">0{i + 1}</span>
              <Icon className="h-4 w-4 text-mist transition-colors group-hover:text-apex-ink" aria-hidden="true" />
            </div>
            <div>
              <p className="display-condensed text-[1.6rem] text-paper sm:text-[2rem]">{label}</p>
              <p className="mt-1 text-xs text-mist">{hint}</p>
            </div>
            <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-apex transition-transform duration-500 group-hover:scale-x-100" />
          </Link>
        ))}
      </nav>
    </Container>
  );
}

/* ─────────────────────────── Latest result ─────────────────────────── */

function LatestResult({ event }: { event: RaceEvent }) {
  const main = mainSession(event);
  const result = useSessionResult(event.id, main.id);
  const champ = catalog.championshipById[event.championshipId]!;
  const circuit = catalog.circuitById[event.circuitId]!;
  return (
    <article className="border border-line bg-carbon">
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <span className="mb-3 block h-[3px] w-8" style={{ background: champ.accent }} />
          <p className="kicker">{champ.shortName} · {formatLabels[event.format]}</p>
          <h3 className="display-condensed mt-2 text-[2.1rem] text-paper">{circuit.shortName}</h3>
          <p className="meta mt-1">{formatDate(main.start, { day: "2-digit", month: "long" })} · {main.name}</p>
        </div>
        <ProvenanceBadge provenance={event.provenance} />
      </div>
      {result.status === "ok" ? (
        <ol className="border-t border-line">
          {result.data.rows.slice(0, 3).map((r) => (
            <li key={r.position} className="density-row grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line px-5 py-3 last:border-0">
              <span className={r.position === 1 ? "display-condensed text-2xl text-apex-ink" : "display-condensed text-2xl text-silver"}>{r.position}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-paper">{r.drivers.join(" / ")}</span>
                <span className="block truncate text-xs text-mist">{r.team}{r.carClass ? ` · ${r.carClass}` : ""}</span>
              </span>
              <span className="font-mono text-xs tabular text-silver">{r.gap}</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="border-t border-line p-5">
          <Skeleton className="h-28" />
        </div>
      )}
      <Link to={`/race-center/${event.id}`} className="group flex items-center justify-between border-t border-line px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-silver hover:text-paper">
        Classificação completa
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </article>
  );
}

/* ─────────────────────── Featured championships ─────────────────────── */

function FeaturedChampionships() {
  const featured = ["wec", "formula-1", "wrc"].map((id) => catalog.championshipById[id]!);
  const more = ["imsa", "indycar", "nascar-cup", "gt-world-challenge", "stock-car-pro"].map((id) => catalog.championshipById[id]!);
  return (
    <Container className="mt-28">
      <SectionHeader code="01 · Championships" title="Campeonatos em destaque" to="/championships" linkLabel="Todos os campeonatos" />
      <div className="grid gap-4 md:grid-cols-2">
        <ChampionshipFeature championship={featured[0]!} tall className="md:row-span-2" />
        <ChampionshipFeature championship={featured[1]!} />
        <ChampionshipFeature championship={featured[2]!} />
      </div>
      <div className="mt-8 border-t border-line">
        {more.map((c) => (
          <ChampionshipRow key={c.id} championship={c} />
        ))}
      </div>
    </Container>
  );
}

/* ───────────────────────────── Disciplines ───────────────────────────── */

function Disciplines() {
  return (
    <section className="mt-28 border-y border-line bg-carbon py-20" aria-labelledby="h-disc">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <p className="kicker">Descobrir</p>
            <h2 id="h-disc" className="display mt-4 text-[clamp(2.4rem,5vw,4.2rem)]">Seis formas de correr.</h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-silver">
              Do monoposto ao deserto. Cada modalidade tem seu ritmo, seus formatos de prova e sua própria leitura técnica.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {disciplines.map((d, i) => {
              const count = catalog.championships.filter((c) => c.discipline === d.id).length;
              return (
                <li key={d.id} className="bg-carbon">
                  <Link to={`/championships?discipline=${d.id}`} className="group block h-full">
                    <Plate body={d.plate} composition="center" className="aspect-[16/9] transition-[filter] duration-500 group-hover:brightness-125" />
                    <div className="p-5">
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-[0.65rem] text-apex-ink">0{i + 1}</span>
                        <span className="meta">{count} competições</span>
                      </div>
                      <p className="display-condensed mt-3 text-[1.7rem] text-paper">{d.shortName}</p>
                      <p className="mt-2 text-xs leading-relaxed text-mist">{d.description}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/* ──────────────────────────── Garage teaser ──────────────────────────── */

function GarageTeaser() {
  const hero = catalog.carById["ferrari-499p"]!;
  const others = ["porsche-911-gt3-r-992", "toyota-gr-yaris-rally1", "nascar-next-gen"].map((id) => catalog.carById[id]!);
  return (
    <Container className="mt-28">
      <SectionHeader code="03 · Garage" title="Do arquivo técnico" to="/garage" linkLabel="Abrir a Garage" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Link to={`/garage/${hero.id}`} className="group relative block overflow-hidden border border-line">
          <Plate body={hero.body} composition="upper" accent="#e8202a" watermark="499P" caption="Ilustração técnica · categoria LMH" className="aspect-[16/10] transition-[filter] duration-500 group-hover:brightness-125 lg:aspect-auto lg:h-full lg:min-h-[28rem]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 grid gap-4 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <p className="kicker">{hero.manufacturer} · {hero.techClass}</p>
              <p className="display mt-2 text-[clamp(2rem,4.5vw,3.6rem)]">{hero.name}</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-right">
              {hero.specs.slice(1, 3).map((s) => (
                <div key={s.label}>
                  <dt className="kicker">{s.label}</dt>
                  <dd className="mt-1 text-silver">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Link>
        <div className="grid gap-4">
          {others.map((car) => (
            <CarRow key={car.id} car={car} />
          ))}
        </div>
      </div>
    </Container>
  );
}

/* ──────────────────────────────── News ──────────────────────────────── */

function NewsBlock() {
  const news = useNews();
  return (
    <Container className="mt-28">
      <SectionHeader code="06 · Newsroom" title="Notícias e acontecimentos" to="/newsroom" linkLabel="Newsroom" />
      {news.status === "loading" ? (
        <LoadingBlock rows={3} />
      ) : news.status === "ok" && news.data.length ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {(() => {
            const [lead, ...rest] = news.data;
            return (
              <>
                <Link to={`/newsroom?article=${lead!.id}`} className="group block border-l-2 border-apex pl-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <ProvenanceBadge provenance={lead!.provenance} />
                    <span className="meta">{formatDate(lead!.publishedAt, { day: "2-digit", month: "long" })}</span>
                  </div>
                  <h3 className="wide mt-5 text-[clamp(1.6rem,3vw,2.5rem)] font-bold leading-[1.08] tracking-tight text-paper group-hover:text-silver">{lead!.title}</h3>
                  <p className="mt-4 max-w-xl text-silver">{lead!.dek}</p>
                  <p className="meta mt-6">{lead!.sourceName}</p>
                </Link>
                <ul className="border-t border-line">
                  {rest.slice(0, 4).map((a) => (
                    <li key={a.id} className="border-b border-line">
                      <Link to={`/newsroom?article=${a.id}`} className="group grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-4">
                        <span>
                          <span className="kicker">{catalog.championshipById[a.championshipIds[0]!]?.shortName} · {formatDate(a.publishedAt)}</span>
                          <span className="mt-1.5 block font-semibold leading-snug text-paper group-hover:text-silver">{a.title}</span>
                        </span>
                        <Badge tone="demo" className="self-start">Demo</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            );
          })()}
        </div>
      ) : (
        <EmptyState title="Nenhuma fonte de notícias conectada." code="NEWS">
          O Newsroom exibirá matérias com data, fonte e link para o original quando houver feeds licenciados.
        </EmptyState>
      )}
    </Container>
  );
}

/* ─────────────────────────── Drivers & teams ─────────────────────────── */

function PeopleBlock() {
  const people = ["ayrton-senna", "tom-kristensen", "sebastien-loeb", "jimmie-johnson"].map((id) => catalog.driverById[id]!);
  const teams = ["scuderia-ferrari", "porsche-penske", "toyota-gazoo-racing", "hendrick"].map((id) => catalog.teamById[id]!);
  return (
    <Container className="mt-28">
      <SectionHeader code="04 · Drivers & Teams" title="Recordes que definem eras" to="/drivers-teams" linkLabel="Pilotos e equipes" dek="Perfis com conquistas históricas consolidadas. Equipes atuais e temporada corrente aparecem quando houver fonte conectada." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {people.map((d) => (
          <DriverCard key={d.id} driver={d} />
        ))}
      </div>
      <div className="mt-10 border-t border-line">
        {teams.map((t) => (
          <TeamRow key={t.id} team={t} />
        ))}
      </div>
    </Container>
  );
}
