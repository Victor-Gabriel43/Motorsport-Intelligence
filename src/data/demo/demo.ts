/**
 * DEMONSTRATION CONTENT — NOT REAL DATA.
 *
 * Everything in this file is fictional and exists only to exercise layouts
 * (calendars, session lists, result tables, standings, news cards). Names are
 * deliberately generic ("Piloto Demo 07", "Equipe Demo C") so they cannot be
 * mistaken for real people, and every record has provenance.kind === "demo",
 * which the UI renders with a visible "Demonstração" badge.
 *
 * Dates are generated relative to the current day so the demo calendar always
 * has both upcoming and past entries. Disable demo mode in My Apex to hide it.
 */
import type {
  EventFormat,
  NewsArticle,
  Provenance,
  RaceEvent,
  RaceSession,
  ResultRow,
  SessionKind,
  SessionResult,
  StandingRow,
  Standings,
} from "@/types/models";

export const demoProvenance: Provenance = {
  kind: "demo",
  sourceName: "Conteúdo de demonstração",
  note: "Dados fictícios gerados para testar o layout.",
};

const DAY = 86_400_000;

function startOfToday(now = new Date()) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/** Small deterministic PRNG so the demo tables are stable between renders. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

interface EventSeed {
  championshipId: string;
  circuitId: string;
  format: EventFormat;
  /** Offset in days of the main race from today. */
  offset: number;
  round: number;
  raceLength?: string;
  classes?: string[];
}

const seeds: EventSeed[] = [
  { championshipId: "formula-1", circuitId: "interlagos", format: "f1-sprint", offset: 9, round: 21 },
  { championshipId: "formula-1", circuitId: "monza", format: "f1-standard", offset: -19, round: 19 },
  { championshipId: "formula-1", circuitId: "suzuka", format: "f1-standard", offset: -33, round: 18 },
  { championshipId: "formula-1", circuitId: "silverstone", format: "f1-standard", offset: 30, round: 22 },
  { championshipId: "wec", circuitId: "spa", format: "endurance", offset: -26, round: 6, raceLength: "6 h", classes: ["Hypercar", "LMGT3"] },
  { championshipId: "wec", circuitId: "fuji", format: "endurance", offset: 23, round: 7, raceLength: "6 h", classes: ["Hypercar", "LMGT3"] },
  { championshipId: "le-mans-24", circuitId: "le-mans", format: "endurance", offset: 52, round: 1, raceLength: "24 h", classes: ["Hypercar", "LMP2", "LMGT3"] },
  { championshipId: "imsa", circuitId: "road-america", format: "endurance", offset: -12, round: 9, raceLength: "6 h", classes: ["GTP", "GTD Pro", "GTD"] },
  { championshipId: "wrc", circuitId: "rally-finland", format: "rally", offset: -5, round: 10 },
  { championshipId: "wrc", circuitId: "monte-carlo-rally", format: "rally", offset: 40, round: 11 },
  { championshipId: "nascar-cup", circuitId: "bristol", format: "oval", offset: 3, round: 29, raceLength: "500 voltas" },
  { championshipId: "indycar", circuitId: "indianapolis", format: "oval", offset: -8, round: 14, raceLength: "200 voltas" },
  { championshipId: "gt-world-challenge", circuitId: "monza", format: "endurance", offset: 16, round: 5, raceLength: "3 h", classes: ["Pro", "Gold", "Silver", "Bronze"] },
  { championshipId: "dtm", circuitId: "nurburgring", format: "sprint-race", offset: -40, round: 7 },
  { championshipId: "stock-car-pro", circuitId: "interlagos", format: "sprint-race", offset: 26, round: 12 },
  { championshipId: "nhra", circuitId: "lucas-oil-indy", format: "drag", offset: 12, round: 16 },
];

const sessionTemplates: Record<EventFormat, { kind: SessionKind; name: string; day: number; hour: number; duration?: string }[]> = {
  "f1-standard": [
    { kind: "practice", name: "Treino livre 1", day: -2, hour: 11 },
    { kind: "practice", name: "Treino livre 2", day: -2, hour: 15 },
    { kind: "practice", name: "Treino livre 3", day: -1, hour: 11 },
    { kind: "qualifying", name: "Classificação", day: -1, hour: 15 },
    { kind: "race", name: "Grande Prêmio", day: 0, hour: 14 },
  ],
  "f1-sprint": [
    { kind: "practice", name: "Treino livre 1", day: -2, hour: 11 },
    { kind: "sprint-qualifying", name: "Classificação sprint", day: -2, hour: 15 },
    { kind: "sprint", name: "Sprint", day: -1, hour: 11 },
    { kind: "qualifying", name: "Classificação", day: -1, hour: 15 },
    { kind: "race", name: "Grande Prêmio", day: 0, hour: 14 },
  ],
  endurance: [
    { kind: "practice", name: "Treino livre 1", day: -2, hour: 10 },
    { kind: "practice", name: "Treino livre 2", day: -2, hour: 15 },
    { kind: "qualifying", name: "Classificação", day: -1, hour: 12 },
    { kind: "hyperpole", name: "Hyperpole", day: -1, hour: 14 },
    { kind: "warm-up", name: "Warm-up", day: 0, hour: 9 },
    { kind: "race", name: "Corrida", day: 0, hour: 13 },
  ],
  "sprint-race": [
    { kind: "practice", name: "Treino livre", day: -1, hour: 10 },
    { kind: "qualifying", name: "Classificação", day: -1, hour: 14 },
    { kind: "race", name: "Corrida 1", day: -1, hour: 17 },
    { kind: "race", name: "Corrida 2", day: 0, hour: 13 },
  ],
  rally: [
    { kind: "shakedown", name: "Shakedown", day: -3, hour: 9 },
    { kind: "stage", name: "Dia 1 · SS1–SS8", day: -2, hour: 8 },
    { kind: "stage", name: "Dia 2 · SS9–SS16", day: -1, hour: 8 },
    { kind: "stage", name: "Dia 3 · SS17–SS19", day: 0, hour: 8 },
    { kind: "power-stage", name: "Power Stage", day: 0, hour: 13 },
  ],
  oval: [
    { kind: "practice", name: "Treino", day: -1, hour: 14 },
    { kind: "qualifying", name: "Classificação", day: -1, hour: 17 },
    { kind: "race", name: "Corrida", day: 0, hour: 19 },
  ],
  drag: [
    { kind: "qualifying", name: "Classificação · sessões 1 e 2", day: -2, hour: 15 },
    { kind: "qualifying", name: "Classificação · sessões 3 e 4", day: -1, hour: 14 },
    { kind: "elimination", name: "Eliminatórias", day: 0, hour: 11 },
  ],
};

function buildEvent(seed: EventSeed, today: number, now: number): RaceEvent {
  const id = `demo-${seed.championshipId}-r${seed.round}`;
  const raceDay = today + seed.offset * DAY;
  const tpl = sessionTemplates[seed.format];
  const sessions: RaceSession[] = tpl.map((t, i) => {
    const start = raceDay + t.day * DAY + t.hour * 3_600_000;
    return {
      id: `${id}-s${i + 1}`,
      kind: t.kind,
      name: t.name,
      start: new Date(start).toISOString(),
      durationLabel: t.kind === "race" ? seed.raceLength : undefined,
      status: start + 3 * 3_600_000 < now ? "completed" : "scheduled",
    };
  });
  const first = sessions[0]!.start.slice(0, 10);
  const last = sessions[sessions.length - 1]!.start.slice(0, 10);
  return {
    id,
    championshipId: seed.championshipId,
    season: new Date(raceDay).getUTCFullYear(),
    round: seed.round,
    name: `Etapa de demonstração ${seed.round}`,
    circuitId: seed.circuitId,
    format: seed.format,
    startDate: first,
    endDate: last,
    sessions,
    classes: seed.classes,
    provenance: demoProvenance,
  };
}

export function getDemoEvents(now = new Date()): RaceEvent[] {
  const today = startOfToday(now);
  return seeds
    .map((s) => buildEvent(s, today, now.getTime()))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

const demoDriver = (n: number) => `Piloto Demo ${String(n).padStart(2, "0")}`;
const demoTeam = (n: number) => `Equipe Demo ${String.fromCharCode(65 + (n % 12))}`;

function formatGap(seconds: number) {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(3).padStart(6, "0");
    return `+${m}:${s}`;
  }
  return `+${seconds.toFixed(3)}`;
}

const F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

export function getDemoResult(event: RaceEvent, sessionId: string): SessionResult | null {
  const session = event.sessions.find((s) => s.id === sessionId);
  if (!session || session.status !== "completed") return null;
  const rand = rng(hash(sessionId));
  const multiClass = event.classes && event.classes.length > 1;
  const crew = event.format === "endurance" ? 3 : 1;
  const size = event.format === "rally" ? 10 : event.format === "drag" ? 8 : 16;

  const order = Array.from({ length: size }, (_, i) => i + 1).sort(() => rand() - 0.5);
  let gap = 0;
  const rows: ResultRow[] = order.map((carIndex, i) => {
    gap += i === 0 ? 0 : rand() * (event.format === "rally" ? 25 : 6);
    const drivers = Array.from({ length: crew }, (_, k) => demoDriver(carIndex * crew + k));
    const carClass = multiClass ? event.classes![Math.min(Math.floor((i / size) * event.classes!.length), event.classes!.length - 1)] : undefined;
    const isRace = session.kind === "race" || session.kind === "sprint";
    return {
      position: i + 1,
      number: String(carIndex * 3 + (carIndex % 7)),
      drivers,
      team: demoTeam(carIndex),
      carClass,
      gap: i === 0 ? "Líder" : formatGap(gap),
      points: isRace && event.format !== "endurance" ? (F1_POINTS[i] ?? 0) : undefined,
      status: i === size - 1 && rand() > 0.5 ? "dnf" : "finished",
    };
  });
  return { eventId: event.id, sessionId, rows, provenance: demoProvenance };
}

export function getDemoStandings(championshipId: string, season: number, kind: "drivers" | "teams"): Standings | null {
  const events = getDemoEvents().filter((e) => e.championshipId === championshipId);
  if (events.length === 0) return null;
  const rand = rng(hash(`${championshipId}-${season}-${kind}`));
  const size = kind === "drivers" ? 12 : 8;
  let points = Math.round(180 + rand() * 120);
  const roster = Array.from({ length: 40 }, (_, i) => i + 1).sort(() => rand() - 0.5);
  const rows: StandingRow[] = Array.from({ length: size }, (_, i) => {
    if (i > 0) points = Math.max(0, points - Math.round(4 + rand() * 26));
    const n = roster[i]!;
    return {
      position: i + 1,
      name: kind === "drivers" ? demoDriver(n) : demoTeam(i),
      team: kind === "drivers" ? demoTeam(n) : undefined,
      points,
      wins: Math.max(0, Math.round((size - i) / 3 - rand())),
      podiums: Math.max(0, Math.round((size - i) / 1.6 - rand() * 2)),
    };
  });
  const afterRound = Math.max(...events.map((e) => e.round)) - 1;
  return { championshipId, season, kind, afterRound, rows, provenance: demoProvenance };
}

export function getDemoNews(now = new Date()): NewsArticle[] {
  const today = startOfToday(now);
  const items: Omit<NewsArticle, "publishedAt" | "provenance" | "sourceName">[] = [
    {
      id: "demo-news-1",
      title: "Exemplo de manchete: como a janela de pit define um stint de endurance",
      dek: "Texto de demonstração para o layout de artigo em destaque. Nenhum fato aqui é real.",
      championshipIds: ["wec"],
      discipline: "endurance",
      featured: true,
    },
    {
      id: "demo-news-2",
      title: "Exemplo de análise: leitura de dados de telemetria em uma volta de classificação",
      dek: "Conteúdo fictício para testar a hierarquia tipográfica do Newsroom.",
      championshipIds: ["formula-1"],
      discipline: "formula",
    },
    {
      id: "demo-news-3",
      title: "Exemplo de reportagem: o que muda entre especiais de terra e asfalto",
      dek: "Card de demonstração com resumo curto e metadados de fonte.",
      championshipIds: ["wrc"],
      discipline: "rally",
    },
    {
      id: "demo-news-4",
      title: "Exemplo de coluna: balanço de performance em grids de GT3",
      dek: "Texto ilustrativo — não representa nenhuma decisão real de BoP.",
      championshipIds: ["gt-world-challenge", "gt3"],
      discipline: "gt",
    },
    {
      id: "demo-news-5",
      title: "Exemplo de nota: estratégia de combustível em ovais curtos",
      dek: "Conteúdo de demonstração para a listagem de notícias.",
      championshipIds: ["nascar-cup"],
      discipline: "stock-touring",
    },
    {
      id: "demo-news-6",
      title: "Exemplo de entrevista: rotina de preparação para as 500 milhas",
      dek: "Entrevista fictícia usada apenas como espaço reservado.",
      championshipIds: ["indycar"],
      discipline: "formula",
    },
    {
      id: "demo-news-7",
      title: "Exemplo de guia: como ler uma tabela de resultados multiclasse",
      dek: "Guia de demonstração para o layout de artigo explicativo.",
      championshipIds: ["imsa", "wec"],
      discipline: "endurance",
    },
    {
      id: "demo-news-8",
      title: "Exemplo de manchete: temporada nacional de turismo chega à reta final",
      dek: "Conteúdo de demonstração sem relação com resultados reais.",
      championshipIds: ["stock-car-pro"],
      discipline: "stock-touring",
    },
  ];
  return items.map((item, i) => ({
    ...item,
    publishedAt: new Date(today - i * DAY * 1.5 - 7 * 3_600_000).toISOString(),
    sourceName: "APEX · demonstração",
    provenance: demoProvenance,
  }));
}
