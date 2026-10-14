import { Bookmark, BookmarkCheck, Eye, EyeOff, Star } from "lucide-react";
import { myApex, useMyApex, type FavoriteKind } from "@/store/myApex";
import { cx } from "@/lib/format";

export function FavoriteButton({ kind, id, label, compact = false, className }: { kind: FavoriteKind; id: string; label: string; compact?: boolean; className?: string }) {
  const active = useMyApex((s) => s.favorites[kind].includes(id));
  const text = active ? "Nos favoritos" : "Favoritar";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        myApex.toggleFavorite(kind, id);
      }}
      aria-pressed={active}
      aria-label={compact ? `${active ? "Remover" : "Adicionar"} ${label} ${active ? "dos" : "aos"} favoritos` : undefined}
      title={compact ? text : undefined}
      className={cx(
        "inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors",
        compact ? "h-9 w-9 justify-center bg-ink/60 backdrop-blur-sm hover:bg-ink" : "border border-line-strong px-4 py-2.5 hover:border-paper/60",
        active ? "text-apex-ink" : "text-silver hover:text-paper",
        className,
      )}
    >
      <Star className={cx("h-3.5 w-3.5 transition-transform", active && "scale-110 fill-current")} aria-hidden="true" />
      {compact ? null : text}
    </button>
  );
}

export function FollowButton({ eventId, className }: { eventId: string; className?: string }) {
  const active = useMyApex((s) => s.following.includes(eventId));
  const Icon = active ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        myApex.toggleFollow(eventId);
      }}
      aria-pressed={active}
      className={cx(
        "inline-flex items-center gap-2 border px-4 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors",
        active ? "border-apex/60 text-apex-ink" : "border-line-strong text-silver hover:border-paper/60 hover:text-paper",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {active ? "Acompanhando" : "Acompanhar evento"}
    </button>
  );
}

export function WatchButton({ sessionId, sessionName }: { sessionId: string; sessionName: string }) {
  const active = useMyApex((s) => s.watchlist.includes(sessionId));
  const Icon = active ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={() => myApex.toggleWatch(sessionId)}
      aria-pressed={active}
      aria-label={`${active ? "Remover" : "Adicionar"} ${sessionName} ${active ? "da" : "à"} lista para assistir`}
      title={active ? "Remover da lista para assistir" : "Quero assistir"}
      className={cx(
        "inline-flex h-8 items-center gap-1.5 px-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-colors",
        active ? "bg-apex/15 text-apex-ink" : "text-mist hover:bg-white/[0.06] hover:text-paper",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{active ? "Na lista" : "Assistir"}</span>
    </button>
  );
}
