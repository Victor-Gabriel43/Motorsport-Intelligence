/**
 * Data service — the single entry point the UI uses to read data.
 *
 * Two layers:
 *  - Reference catalogue (championships, circuits, cars, teams, drivers):
 *    static, hand-curated, synchronous.
 *  - Live layer (calendar, results, standings, news): async, provider-based.
 *
 * No live provider is connected yet, so `liveProvider` answers
 * "unavailable". When demo mode is on, `demoProvider` fills the gaps with
 * clearly labelled fictional data. To integrate a real source later,
 * implement `LiveProvider` (server-side or through a proxy that keeps API
 * keys out of the browser) and register it in `liveProvider`.
 */
import { championships, championshipById } from "@/data/reference/championships";
import { circuits, circuitById } from "@/data/reference/circuits";
import { cars, carById } from "@/data/reference/cars";
import { drivers, driverById, teams, teamById } from "@/data/reference/people";
import { getDemoEvents, getDemoNews, getDemoResult, getDemoStandings, demoProvenance } from "@/data/demo/demo";
import type { DataResult, NewsArticle, RaceEvent, SessionResult, Standings } from "@/types/models";

export interface LiveProvider {
  name: string;
  getEvents(): Promise<DataResult<RaceEvent[]>>;
  getSessionResult(eventId: string, sessionId: string): Promise<DataResult<SessionResult>>;
  getStandings(championshipId: string, season: number, kind: "drivers" | "teams"): Promise<DataResult<Standings>>;
  getNews(): Promise<DataResult<NewsArticle[]>>;
}

const NO_SOURCE = "Nenhuma fonte de dados licenciada está conectada para este conteúdo.";

/** Placeholder for the future real integration. */
export const liveProvider: LiveProvider = {
  name: "none",
  getEvents: async () => ({ status: "unavailable", reason: NO_SOURCE }),
  getSessionResult: async () => ({ status: "unavailable", reason: NO_SOURCE }),
  getStandings: async () => ({ status: "unavailable", reason: NO_SOURCE }),
  getNews: async () => ({ status: "unavailable", reason: NO_SOURCE }),
};

const demoProvider: LiveProvider = {
  name: "demo",
  getEvents: async () => ({ status: "ok", data: getDemoEvents(), provenance: demoProvenance }),
  getSessionResult: async (eventId, sessionId) => {
    const event = getDemoEvents().find((e) => e.id === eventId);
    const result = event ? getDemoResult(event, sessionId) : null;
    return result
      ? { status: "ok", data: result, provenance: demoProvenance }
      : { status: "unavailable", reason: "Esta sessão ainda não foi disputada." };
  },
  getStandings: async (championshipId, season, kind) => {
    const standings = getDemoStandings(championshipId, season, kind);
    return standings
      ? { status: "ok", data: standings, provenance: demoProvenance }
      : { status: "unavailable", reason: NO_SOURCE };
  },
  getNews: async () => ({ status: "ok", data: getDemoNews(), provenance: demoProvenance }),
};

/** Real data first; demo only fills what the real provider cannot answer. */
async function withFallback<T>(demo: boolean, real: () => Promise<DataResult<T>>, fallback: () => Promise<DataResult<T>>) {
  const result = await real();
  if (result.status === "ok" || !demo) return result;
  return fallback();
}

export const live = {
  events: (demo: boolean) => withFallback(demo, liveProvider.getEvents, demoProvider.getEvents),
  sessionResult: (demo: boolean, eventId: string, sessionId: string) =>
    withFallback(
      demo,
      () => liveProvider.getSessionResult(eventId, sessionId),
      () => demoProvider.getSessionResult(eventId, sessionId),
    ),
  standings: (demo: boolean, championshipId: string, season: number, kind: "drivers" | "teams") =>
    withFallback(
      demo,
      () => liveProvider.getStandings(championshipId, season, kind),
      () => demoProvider.getStandings(championshipId, season, kind),
    ),
  news: (demo: boolean) => withFallback(demo, liveProvider.getNews, demoProvider.getNews),
};

export const catalog = {
  championships,
  championshipById,
  circuits,
  circuitById,
  cars,
  carById,
  teams,
  teamById,
  drivers,
  driverById,
};

/** Upcoming = has at least one session not completed. */
export function isUpcoming(event: RaceEvent) {
  return event.sessions.some((s) => s.status === "scheduled");
}

export function mainSession(event: RaceEvent) {
  const races = event.sessions.filter((s) => s.kind === "race" || s.kind === "elimination" || s.kind === "power-stage");
  return races[races.length - 1] ?? event.sessions[event.sessions.length - 1]!;
}

export function nextSession(event: RaceEvent) {
  return event.sessions.find((s) => s.status === "scheduled");
}
