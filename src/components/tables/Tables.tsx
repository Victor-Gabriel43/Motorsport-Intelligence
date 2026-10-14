import { Database } from "lucide-react";
import type { ReactNode } from "react";
import { Badge, ProvenanceBadge } from "@/components/ui/Badge";
import { EmptyState, LoadingBlock } from "@/components/ui/States";
import type { AsyncState } from "@/hooks/useLive";
import type { SessionResult, Standings } from "@/types/models";
import { cx } from "@/lib/format";

/** Renders loading / unavailable / error states consistently for any live resource. */
export function LiveBoundary<T>({ state, children, emptyTitle, emptyAction }: { state: AsyncState<T>; children: (data: T) => ReactNode; emptyTitle: string; emptyAction?: ReactNode }) {
  if (state.status === "loading") return <LoadingBlock rows={5} />;
  if (state.status === "error")
    return (
      <EmptyState title="Não foi possível carregar estes dados." code="ERROR">
        {state.error.message}
      </EmptyState>
    );
  if (state.status === "unavailable")
    return (
      <EmptyState title={emptyTitle} icon={<Database className="h-5 w-5" aria-hidden="true" />} action={emptyAction}>
        {state.reason} Nenhum número é exibido até que uma fonte oficial ou licenciada seja integrada.
      </EmptyState>
    );
  return <>{children(state.data)}</>;
}

const th = "px-3 py-2.5 text-left font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] text-mist";
const td = "density-row px-3 py-3 text-sm";

function Position({ n }: { n: number }) {
  return (
    <span className={cx("display-condensed inline-block w-7 text-lg tabular", n === 1 ? "text-apex-ink" : n <= 3 ? "text-paper" : "text-silver")}>
      {n}
    </span>
  );
}

export function StandingsTable({ standings }: { standings: Standings }) {
  const leader = standings.rows[0]?.points ?? 0;
  return (
    <figure>
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="meta">
          {standings.kind === "drivers" ? "Pilotos" : "Equipes"} · após a etapa {standings.afterRound}
        </span>
        <ProvenanceBadge provenance={standings.provenance} />
      </figcaption>
      <div className="overflow-x-auto border-t border-line" tabIndex={0} role="region" aria-label="Tabela com rolagem horizontal">
        <table className="w-full min-w-[34rem] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className={cx(th, "w-14")}>Pos</th>
              <th scope="col" className={th}>{standings.kind === "drivers" ? "Piloto" : "Equipe"}</th>
              {standings.kind === "drivers" ? <th scope="col" className={th}>Equipe</th> : null}
              <th scope="col" className={cx(th, "text-right")}>Vit.</th>
              <th scope="col" className={cx(th, "text-right")}>Pód.</th>
              <th scope="col" className={cx(th, "text-right")}>Pontos</th>
            </tr>
          </thead>
          <tbody>
            {standings.rows.map((r) => (
              <tr key={r.position} className="border-b border-line transition-colors hover:bg-white/[0.025]">
                <td className={td}><Position n={r.position} /></td>
                <td className={cx(td, "font-semibold text-paper")}>{r.name}</td>
                {standings.kind === "drivers" ? <td className={cx(td, "text-silver")}>{r.team}</td> : null}
                <td className={cx(td, "text-right tabular text-silver")}>{r.wins}</td>
                <td className={cx(td, "text-right tabular text-silver")}>{r.podiums ?? "—"}</td>
                <td className={cx(td, "text-right")}>
                  <div className="flex items-center justify-end gap-3">
                    <span className="hidden h-1 w-20 bg-white/[0.06] sm:block">
                      <span className="block h-full bg-paper/70" style={{ width: `${leader ? (r.points / leader) * 100 : 0}%` }} />
                    </span>
                    <span className="w-10 font-mono font-medium tabular text-paper">{r.points}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function ResultsTable({ result, title }: { result: SessionResult; title: string }) {
  const multiDriver = result.rows.some((r) => r.drivers.length > 1);
  const hasClass = result.rows.some((r) => r.carClass);
  const hasPoints = result.rows.some((r) => r.points !== undefined);
  const classes = hasClass ? Array.from(new Set(result.rows.map((r) => r.carClass!))) : [];
  return (
    <figure>
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="meta">{title}</span>
        <ProvenanceBadge provenance={result.provenance} />
      </figcaption>
      <div className="overflow-x-auto border-t border-line" tabIndex={0} role="region" aria-label="Tabela com rolagem horizontal">
        <table className="w-full min-w-[36rem] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className={cx(th, "w-14")}>Pos</th>
              <th scope="col" className={cx(th, "w-14")}>Nº</th>
              <th scope="col" className={th}>{multiDriver ? "Tripulação" : "Piloto"}</th>
              <th scope="col" className={th}>Equipe</th>
              {hasClass ? <th scope="col" className={th}>Classe</th> : null}
              <th scope="col" className={cx(th, "text-right")}>Diferença</th>
              {hasPoints ? <th scope="col" className={cx(th, "text-right")}>Pts</th> : null}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.position} className="border-b border-line transition-colors hover:bg-white/[0.025]">
                <td className={td}><Position n={r.position} /></td>
                <td className={cx(td, "font-mono tabular text-silver")}>{r.number}</td>
                <td className={cx(td, "font-semibold text-paper")}>
                  {multiDriver ? <span className="block text-[0.82rem] font-medium leading-snug">{r.drivers.join(" / ")}</span> : r.drivers[0]}
                </td>
                <td className={cx(td, "text-silver")}>{r.team}</td>
                {hasClass ? (
                  <td className={td}>
                    <Badge tone={classes.indexOf(r.carClass!) === 0 ? "apex" : "neutral"}>{r.carClass}</Badge>
                  </td>
                ) : null}
                <td className={cx(td, "text-right font-mono tabular text-silver")}>{r.status === "dnf" ? "Abandono" : r.gap}</td>
                {hasPoints ? <td className={cx(td, "text-right font-mono tabular text-paper")}>{r.points || "—"}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
