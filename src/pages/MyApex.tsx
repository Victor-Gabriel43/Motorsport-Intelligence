import { Download, HardDrive, LockKeyhole, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { ChampionshipRow } from "@/components/championship/ChampionshipCard";
import { Container, PageHeader, SectionHeader } from "@/components/editorial/Editorial";
import { CarCard, CircuitCard, DriverCard, TeamRow } from "@/components/garage/Cards";
import { EventRow, sessionKindLabels } from "@/components/race/Race";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Controls";
import { WatchButton } from "@/components/ui/FavoriteButton";
import { EmptyState, LoadingBlock } from "@/components/ui/States";
import { useEvents } from "@/hooks/useLive";
import { usePageMeta } from "@/hooks/usePageMeta";
import { catalog } from "@/services/data";
import { myApex, useMyApex, type FavoriteKind, type Preferences } from "@/store/myApex";
import { cx, formatDate, formatSessionTime, accentText } from "@/lib/format";

const favoriteTabs: { id: FavoriteKind; label: string; browse: string }[] = [
  { id: "championships", label: "Campeonatos", browse: "/championships" },
  { id: "drivers", label: "Pilotos", browse: "/drivers-teams" },
  { id: "teams", label: "Equipes", browse: "/drivers-teams?tab=teams" },
  { id: "cars", label: "Carros", browse: "/garage" },
  { id: "circuits", label: "Circuitos", browse: "/circuits" },
];

export default function MyApex() {
  usePageMeta("My Apex");
  const state = useMyApex((s) => s);
  const { hash } = useLocation();
  const [favTab, setFavTab] = useState<FavoriteKind>("championships");

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  const totalFavorites = Object.values(state.favorites).reduce((n, l) => n + l.length, 0);

  return (
    <>
      <PageHeader
        code="07"
        kicker="My Apex"
        title={
          <>
            Seu paddock
            <br />
            pessoal
          </>
        }
        dek="Favoritos, corridas para assistir, eventos acompanhados, histórico e preferências de visualização."
        aside={
          <div className="space-y-4">
            <div className="flex gap-3 border border-line bg-carbon p-4">
              <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-silver">
                <strong className="text-paper">Salvo somente neste navegador.</strong> Ainda não há conta nem backend: os dados não são sincronizados entre dispositivos e somem se o armazenamento do navegador for limpo.
              </p>
            </div>
            <div className="flex gap-3 border border-dashed border-line-strong p-4">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-mist" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-mist">Autenticação planejada para uma etapa futura. A estrutura do armazenamento já é versionada para migrar para uma conta.</p>
            </div>
          </div>
        }
      >
        <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
          {[
            ["Favoritos", totalFavorites],
            ["Para assistir", state.watchlist.length],
            ["Acompanhando", state.following.length],
            ["Histórico", state.history.length],
          ].map(([label, n]) => (
            <div key={label} className="bg-ink px-4 py-4">
              <dt className="kicker">{label}</dt>
              <dd className="display-condensed mt-1 text-4xl tabular">{n}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <Container className="mt-16 space-y-24">
        <section id="favorites" aria-labelledby="h-fav" className="scroll-mt-24">
          <SectionHeader code="Favoritos" title={<span id="h-fav">Favoritos</span>} />
          <Tabs label="Tipos de favoritos" value={favTab} onChange={(id) => setFavTab(id as FavoriteKind)} tabs={favoriteTabs.map((t) => ({ id: t.id, label: t.label, count: state.favorites[t.id].length }))}>
            <FavoritesPanel kind={favTab} ids={state.favorites[favTab]} browse={favoriteTabs.find((t) => t.id === favTab)!.browse} />
          </Tabs>
        </section>

        <div className="grid gap-16 lg:grid-cols-2">
          <section id="watchlist" aria-labelledby="h-watch" className="scroll-mt-24">
            <SectionHeader code="Lista" title={<span id="h-watch">Corridas para assistir</span>} />
            <Watchlist ids={state.watchlist} />
          </section>
          <section id="following" aria-labelledby="h-follow" className="scroll-mt-24">
            <SectionHeader code="Eventos" title={<span id="h-follow">Eventos acompanhados</span>} />
            <Following ids={state.following} />
          </section>
        </div>

        <section id="history" aria-labelledby="h-hist" className="scroll-mt-24">
          <SectionHeader code="Histórico" title={<span id="h-hist">Páginas visitadas</span>} />
          {state.history.length ? (
            <>
              <ol className="grid gap-x-8 border-t border-line md:grid-cols-2">
                {state.history.slice(0, 16).map((h) => (
                  <li key={h.path} className="border-b border-line">
                    <Link to={h.path} className="group flex items-baseline justify-between gap-4 py-3">
                      <span className="truncate text-sm text-paper group-hover:text-apex-ink">{h.title}</span>
                      <span className="meta shrink-0">{formatDate(h.at, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              <Button variant="ghost" className="mt-4" onClick={() => myApex.clearHistory()}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Limpar histórico
              </Button>
            </>
          ) : (
            <EmptyState title={state.preferences.recordHistory ? "Nenhuma página visitada ainda." : "Registro de histórico desativado."} code="LOG">
              {state.preferences.recordHistory ? "As páginas que você abrir aparecerão aqui." : "Ative o registro nas preferências abaixo."}
            </EmptyState>
          )}
        </section>

        <section id="preferences" aria-labelledby="h-prefs" className="scroll-mt-24">
          <SectionHeader code="Preferências" title={<span id="h-prefs">Preferências de visualização</span>} />
          <Preferences prefs={state.preferences} />
        </section>

        <section aria-labelledby="h-data">
          <SectionHeader code="Dados" title={<span id="h-data">Seus dados locais</span>} />
          <DataControls />
        </section>
      </Container>
    </>
  );
}

function FavoritesPanel({ kind, ids, browse }: { kind: FavoriteKind; ids: string[]; browse: string }) {
  if (!ids.length)
    return (
      <EmptyState title="Nada salvo aqui ainda." code="FAV" action={<ButtonLink to={browse}>Explorar</ButtonLink>}>
        Use a estrela nos cards e páginas para adicionar favoritos.
      </EmptyState>
    );
  if (kind === "championships") return <div className="border-t border-line">{ids.map((id) => catalog.championshipById[id]).filter(Boolean).map((c) => <ChampionshipRow key={c!.id} championship={c!} />)}</div>;
  if (kind === "teams") return <div className="border-t border-line">{ids.map((id) => catalog.teamById[id]).filter(Boolean).map((t) => <TeamRow key={t!.id} team={t!} />)}</div>;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {kind === "drivers" && ids.map((id) => catalog.driverById[id]).filter(Boolean).map((d) => <DriverCard key={d!.id} driver={d!} />)}
      {kind === "cars" && ids.map((id) => catalog.carById[id]).filter(Boolean).map((c) => <CarCard key={c!.id} car={c!} />)}
      {kind === "circuits" && ids.map((id) => catalog.circuitById[id]).filter(Boolean).map((c) => <CircuitCard key={c!.id} circuit={c!} />)}
    </div>
  );
}

function Watchlist({ ids }: { ids: string[] }) {
  const events = useEvents();
  const tz = useMyApex((s) => s.preferences.timeZone);
  if (!ids.length)
    return (
      <EmptyState title="Sua lista está vazia." code="WATCH" action={<ButtonLink to="/race-center">Race Center</ButtonLink>}>
        Em cada evento, use “Assistir” nas sessões agendadas.
      </EmptyState>
    );
  if (events.status === "loading") return <LoadingBlock rows={3} />;
  const all = events.status === "ok" ? events.data : [];
  const entries = ids.map((sid) => {
    const event = all.find((e) => e.sessions.some((s) => s.id === sid));
    return { sid, event, session: event?.sessions.find((s) => s.id === sid) };
  });
  return (
    <ul className="border-t border-line">
      {entries.map(({ sid, event, session }) =>
        event && session ? (
          <li key={sid} className="density-row flex items-center gap-4 border-b border-line py-3">
            <Link to={`/race-center/${event.id}`} className="group min-w-0 flex-1">
              <span className="kicker block" style={{ color: accentText(catalog.championshipById[event.championshipId]?.accent) }}>
                {catalog.championshipById[event.championshipId]?.shortName} · {sessionKindLabels[session.kind]}
              </span>
              <span className="mt-1 block truncate text-sm font-semibold group-hover:text-apex-ink">
                {catalog.circuitById[event.circuitId]?.shortName} — {session.name}
              </span>
              <span className="block text-xs text-mist">{formatSessionTime(session.start, tz)}</span>
            </Link>
            {event.provenance.kind === "demo" ? <Badge tone="demo">Demo</Badge> : null}
            <WatchButton sessionId={sid} sessionName={session.name} />
          </li>
        ) : (
          <li key={sid} className="flex items-center justify-between gap-4 border-b border-line py-3 text-sm text-mist">
            Sessão indisponível (fonte desconectada ou demonstração desativada).
            <Button variant="ghost" onClick={() => myApex.toggleWatch(sid)}>Remover</Button>
          </li>
        ),
      )}
    </ul>
  );
}

function Following({ ids }: { ids: string[] }) {
  const events = useEvents();
  if (!ids.length)
    return (
      <EmptyState title="Nenhum evento acompanhado." code="EVT" action={<ButtonLink to="/race-center">Ver calendário</ButtonLink>}>
        Abra um evento e escolha “Acompanhar evento”.
      </EmptyState>
    );
  if (events.status === "loading") return <LoadingBlock rows={3} />;
  const all = events.status === "ok" ? events.data : [];
  return (
    <div className="border-t border-line">
      {ids.map((id) => {
        const e = all.find((ev) => ev.id === id);
        return e ? (
          <EventRow key={id} event={e} />
        ) : (
          <div key={id} className="flex items-center justify-between gap-4 border-b border-line py-3 text-sm text-mist">
            Evento indisponível.
            <Button variant="ghost" onClick={() => myApex.toggleFollow(id)}>Remover</Button>
          </div>
        );
      })}
    </div>
  );
}

function PrefRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="grid gap-4 border-b border-line py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div>
        <p className="font-semibold text-paper">{title}</p>
        <p className="mt-1 max-w-xl text-sm text-mist">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx("relative h-7 w-12 shrink-0 border transition-colors", checked ? "border-apex bg-apex/20" : "border-line-strong bg-graphite")}
    >
      <span className={cx("absolute top-1 h-[18px] w-[18px] transition-[left,background-color] duration-200", checked ? "left-[24px] bg-apex" : "left-1 bg-mist")} />
    </button>
  );
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex border border-line-strong">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx("px-3.5 py-2 font-mono text-[0.66rem] uppercase tracking-[0.12em] transition-colors", o.value === value ? "bg-paper text-ink" : "text-silver hover:text-paper")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Preferences({ prefs }: { prefs: Preferences }) {
  const set = myApex.setPreference;
  return (
    <div className="border-t border-line">
      <PrefRow title="Conteúdo de demonstração" description="Preenche calendário, resultados, classificações e notícias com dados fictícios, sempre marcados como “Demonstração”. Desative para ver apenas o que vem de fontes reais.">
        <Toggle checked={prefs.demoMode} onChange={(v) => set("demoMode", v)} label="Conteúdo de demonstração" />
      </PrefRow>
      <PrefRow title="Unidades" description="Extensão dos circuitos em quilômetros ou milhas.">
        <Segmented label="Unidades" value={prefs.units} onChange={(v) => set("units", v)} options={[{ value: "metric", label: "km" }, { value: "imperial", label: "mi" }]} />
      </PrefRow>
      <PrefRow title="Fuso horário das sessões" description="Exibir horários no fuso deste dispositivo ou em UTC.">
        <Segmented label="Fuso horário" value={prefs.timeZone} onChange={(v) => set("timeZone", v)} options={[{ value: "local", label: "Local" }, { value: "utc", label: "UTC" }]} />
      </PrefRow>
      <PrefRow title="Densidade das listas" description="Linhas mais compactas em calendários, tabelas e listas.">
        <Segmented label="Densidade" value={prefs.density} onChange={(v) => set("density", v)} options={[{ value: "comfortable", label: "Confortável" }, { value: "compact", label: "Compacta" }]} />
      </PrefRow>
      <PrefRow title="Reduzir movimento" description="Desativa animações e transições (o APEX também respeita a configuração do sistema).">
        <Toggle checked={prefs.reduceMotion} onChange={(v) => set("reduceMotion", v)} label="Reduzir movimento" />
      </PrefRow>
      <PrefRow title="Registrar histórico" description="Guarda as últimas páginas visitadas neste navegador.">
        <Toggle checked={prefs.recordHistory} onChange={(v) => set("recordHistory", v)} label="Registrar histórico" />
      </PrefRow>
    </div>
  );
}

function DataControls() {
  const [confirming, setConfirming] = useState(false);
  const download = () => {
    const blob = new Blob([myApex.exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-apex.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={download}>
        <Download className="h-3.5 w-3.5" aria-hidden="true" /> Exportar JSON
      </Button>
      {confirming ? (
        <span className="flex flex-wrap items-center gap-3 border border-apex/40 px-3 py-1.5" role="alert">
          <span className="text-sm text-silver">Apagar favoritos, listas, histórico e preferências?</span>
          <Button
            variant="primary"
            className="!py-2"
            onClick={() => {
              myApex.reset();
              setConfirming(false);
            }}
          >
            Apagar tudo
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(false)}>Cancelar</Button>
        </span>
      ) : (
        <Button variant="ghost" onClick={() => setConfirming(true)}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Redefinir My Apex
        </Button>
      )}
    </div>
  );
}
