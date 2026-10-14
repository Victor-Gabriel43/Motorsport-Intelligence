import { useEffect, useState } from "react";
import { live } from "@/services/data";
import { useMyApex } from "@/store/myApex";
import type { DataResult, NewsArticle, RaceEvent, SessionResult, Standings } from "@/types/models";

export type AsyncState<T> = { status: "loading" } | { status: "error"; error: Error } | DataResult<T>;

export function useDemoMode() {
  return useMyApex((s) => s.preferences.demoMode);
}

/** Runs an async data request and tracks loading / unavailable / error states. */
export function useAsync<T>(load: () => Promise<DataResult<T>>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    load().then(
      (result) => !cancelled && setState(result),
      (error: unknown) => !cancelled && setState({ status: "error", error: error instanceof Error ? error : new Error(String(error)) }),
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export function useEvents(): AsyncState<RaceEvent[]> {
  const demo = useDemoMode();
  return useAsync(() => live.events(demo), [demo]);
}

export function useSessionResult(eventId: string, sessionId: string | undefined): AsyncState<SessionResult> {
  const demo = useDemoMode();
  return useAsync(
    () => (sessionId ? live.sessionResult(demo, eventId, sessionId) : Promise.resolve({ status: "unavailable", reason: "Selecione uma sessão." } as const)),
    [demo, eventId, sessionId],
  );
}

export function useStandings(championshipId: string, season: number, kind: "drivers" | "teams"): AsyncState<Standings> {
  const demo = useDemoMode();
  return useAsync(() => live.standings(demo, championshipId, season, kind), [demo, championshipId, season, kind]);
}

export function useNews(): AsyncState<NewsArticle[]> {
  const demo = useDemoMode();
  return useAsync(() => live.news(demo), [demo]);
}
