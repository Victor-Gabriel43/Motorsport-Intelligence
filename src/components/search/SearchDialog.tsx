import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/Badge";
import { useEvents } from "@/hooks/useLive";
import { buildIndex, search } from "@/services/search";
import { cx } from "@/lib/format";

const suggestions = ["Le Mans", "Formula 1", "GT3", "Interlagos", "Rally1", "Senna"];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const events = useEvents();
  const index = useMemo(() => buildIndex(events.status === "ok" ? events.data : []), [events]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();

  const groups = useMemo(() => search(index, query), [index, query]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      go(flat[active].to);
    }
  };

  useEffect(() => {
    document.getElementById(`search-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let cursor = -1;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-label="Busca global"
      className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-paper backdrop:bg-ink/80 backdrop:backdrop-blur-sm sm:mx-auto sm:mt-[10vh] sm:h-auto sm:max-w-2xl"
    >
      <div className="flex h-full flex-col border-line-strong bg-graphite shadow-2xl shadow-black/60 sm:h-auto sm:max-h-[70vh] sm:border">
        <div className="flex items-center gap-3 border-b border-line px-4 sm:px-5">
          <Search className="h-4 w-4 shrink-0 text-mist" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Campeonatos, pilotos, carros, circuitos…"
            aria-label="Buscar no APEX"
            role="combobox"
            aria-expanded={flat.length > 0}
            aria-controls="search-results"
            aria-activedescendant={flat[active] ? `search-opt-${active}` : undefined}
            className="h-16 min-w-0 flex-1 bg-transparent text-lg text-paper placeholder:text-mist focus:outline-none"
          />
          <button type="button" onClick={onClose} className="p-2 text-mist hover:text-paper" aria-label="Fechar busca">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div id="search-results" role="listbox" aria-label="Resultados" className="min-h-0 flex-1 overflow-y-auto">
          {!query ? (
            <div className="p-5">
              <p className="kicker mb-3">Sugestões</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => setQuery(s)} className="border border-line-strong px-3 py-1.5 text-sm text-silver transition-colors hover:border-paper/50 hover:text-paper">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : flat.length === 0 ? (
            <div className="p-8 text-center">
              <p className="wide font-semibold">Nada encontrado para “{query}”.</p>
              <p className="mt-2 text-sm text-mist">Tente o nome de um campeonato, circuito, fabricante ou piloto.</p>
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.group} role="group" aria-label={g.group} className="border-b border-line py-2 last:border-0">
                <p className="kicker px-5 py-2">{g.group}</p>
                {g.items.map((item) => {
                  cursor += 1;
                  const i = cursor;
                  return (
                    <div
                      key={`${item.group}-${item.id}`}
                      id={`search-opt-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(item.to)}
                      className={cx("flex cursor-pointer items-center gap-4 px-5 py-2.5", i === active ? "bg-white/[0.06]" : "")}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-paper">{item.title}</p>
                        <p className="truncate text-xs text-mist">{item.subtitle}</p>
                      </div>
                      {item.isDemo ? <Badge tone="demo">Demo</Badge> : null}
                      {i === active ? <CornerDownLeft className="h-4 w-4 text-mist" aria-hidden="true" /> : <ArrowRight className="h-4 w-4 text-transparent" aria-hidden="true" />}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="hidden items-center gap-5 border-t border-line px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-mist sm:flex">
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc fechar</span>
        </div>
      </div>
    </dialog>
  );
}
