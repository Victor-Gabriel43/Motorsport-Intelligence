import { FlaskConical } from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Link, Outlet, ScrollRestoration, useNavigation } from "react-router";
import { ApexSymbol, Wordmark } from "@/components/brand/Brand";
import { Container } from "@/components/editorial/Editorial";
import { SearchDialog } from "@/components/search/SearchDialog";
import { LoadingBlock } from "@/components/ui/States";
import { brand } from "@/config/brand";
import { primaryNav } from "@/config/navigation";
import { myApex, useMyApex } from "@/store/myApex";
import { Navbar } from "./Navbar";

function DemoBanner() {
  const demo = useMyApex((s) => s.preferences.demoMode);
  if (!demo) return null;
  return (
    <div className="border-b border-dashed border-signal/30 bg-signal/[0.06]">
      <Container className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-xs text-silver">
        <FlaskConical className="h-3.5 w-3.5 shrink-0 text-signal" aria-hidden="true" />
        <p className="min-w-0 flex-1">
          <strong className="font-semibold text-signal">Modo demonstração.</strong>
          <span className="sm:hidden"> Itens marcados “Demo” são fictícios.</span>
          <span className="hidden sm:inline"> Calendários, resultados, classificações e notícias marcados como “Demonstração” são fictícios e servem apenas para testar o layout.</span>
        </p>
        <button type="button" onClick={() => myApex.setPreference("demoMode", false)} className="link-underline font-mono text-[0.65rem] uppercase tracking-[0.12em] text-paper">
          <span className="sm:hidden">Ocultar</span>
          <span className="hidden sm:inline">Ocultar demonstração</span>
        </button>
      </Container>
    </div>
  );
}

function RouteProgress() {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
      <div className={busy ? "h-full w-1/3 bg-apex" : "h-full w-0"} style={busy ? { animation: "progress 1s ease-in-out infinite" } : undefined} />
      <style>{`@keyframes progress{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="text-3xl text-paper" aria-label={`${brand.name} — página inicial`}>
            <Wordmark withDescriptor />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist">{brand.tagline}</p>
          <p className="mt-6 max-w-sm text-xs leading-relaxed text-mist">
            Projeto pessoal e independente, sem vínculo com campeonatos, equipes ou fabricantes. Nomes e marcas pertencem aos seus detentores.
          </p>
        </div>
        <nav aria-label="Rodapé">
          <p className="kicker mb-4">Seções</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm md:grid-cols-1">
            {primaryNav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="link-underline text-silver hover:text-paper">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="kicker mb-4">Integridade dos dados</p>
          <ul className="space-y-3 text-sm text-silver">
            <li className="flex gap-3"><span className="mt-1.5 h-2 w-2 shrink-0 border border-dashed border-signal" />Demonstração: conteúdo fictício, apenas para layout.</li>
            <li className="flex gap-3"><span className="mt-1.5 h-2 w-2 shrink-0 border border-line-strong" />Verificado: ficha curada e conferida em fontes oficiais, com data.</li>
            <li className="flex gap-3"><span className="mt-1.5 h-2 w-2 shrink-0 bg-go" />Fonte conectada: exibe origem e data de atualização.</li>
          </ul>
        </div>
      </Container>
      <Container className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-mist">
        <span className="flex items-center gap-2">
          <ApexSymbol className="h-3.5 w-3.5 text-silver" /> {brand.name} · {brand.descriptor} · {brand.since}
        </span>
        <span>Sem fontes de dados ao vivo conectadas</span>
      </Container>
    </footer>
  );
}

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const prefs = useMyApex((s) => s.preferences);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.density = prefs.density;
    document.documentElement.dataset.reduceMotion = String(prefs.reduceMotion);
  }, [prefs.density, prefs.reduceMotion]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-50 bg-apex px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Pular para o conteúdo
      </a>
      <RouteProgress />
      <Navbar onSearch={openSearch} />
      <DemoBanner />
      <main id="main" className="flex-1">
        <Suspense
          fallback={
            <Container className="py-20">
              <LoadingBlock rows={6} label="Carregando página" />
            </Container>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ScrollRestoration />
    </div>
  );
}
