/**
 * APEX domain models.
 *
 * Every record carries a `provenance` describing where it came from. The UI
 * reads it to decide which badge to show ("Demonstração", "Referência", or a
 * real source with its update date), so demo or unverified content is never
 * presented as verified fact.
 */

export type ProvenanceKind =
  /** Fictional content used only to exercise the layout. Always labelled. */
  | "demo"
  /** Stable, encyclopaedic reference data curated by hand; pending check against the official source. */
  | "reference"
  /** Data fetched from an external provider, with source and timestamp. */
  | "source";

export interface Provenance {
  kind: ProvenanceKind;
  /** Human-readable source name, e.g. "FIA" (only for kind "source"). */
  sourceName?: string;
  sourceUrl?: string;
  /** ISO date of the last update from the source. */
  updatedAt?: string;
  note?: string;
}

export type DisciplineId =
  | "formula"
  | "endurance"
  | "gt"
  | "rally"
  | "stock-touring"
  | "other";

export interface Discipline {
  id: DisciplineId;
  name: string;
  shortName: string;
  description: string;
  /** Body type used for the illustrated plate when no photo exists. */
  plate: BodyType;
}

export type Region =
  | "global"
  | "europe"
  | "north-america"
  | "south-america"
  | "asia-pacific"
  | "middle-east-africa";

export type BodyType =
  | "open-wheel"
  | "prototype"
  | "gt"
  | "rally"
  | "stock"
  | "touring"
  | "rally-raid"
  | "dragster"
  | "sprint-car";

export interface Media {
  src: string;
  alt: string;
  credit: string;
  license: string;
  sourceUrl?: string;
}

export type ChampionshipKind = "series" | "event" | "class";

export interface Championship {
  id: string;
  name: string;
  shortName: string;
  kind: ChampionshipKind;
  discipline: DisciplineId;
  region: Region;
  /** Governing or organising body, when well established. */
  organizer?: string;
  /** First season/edition, only when it is a stable historical fact. */
  firstSeason?: number;
  summary: string;
  /** Vehicle classes or formats, editorial reference. */
  formats: string[];
  /** Accent used for the championship's sub-identity (stripe, chips). */
  accent: string;
  officialUrl?: string;
  /** Seasons that the UI allows selecting. Data per season comes from the data service. */
  seasons: number[];
  circuitIds: string[];
  carIds: string[];
  media?: Media;
  provenance: Provenance;
}

export type CircuitType = "permanent" | "street" | "oval" | "rally-stage" | "drag-strip" | "dirt-oval" | "desert";

export interface Circuit {
  id: string;
  name: string;
  /** Common/short name. */
  shortName: string;
  country: string;
  countryCode: string;
  locality: string;
  region: Region;
  type: CircuitType;
  /** Length in kilometres, only when it is a well-established figure. */
  lengthKm?: number;
  /** Which layout the length refers to. */
  layoutNote?: string;
  characteristics: string[];
  championshipIds: string[];
  /** Track-map asset; only set when there is a properly licensed source. */
  map?: Media;
  media?: Media;
  provenance: Provenance;
}

export interface CarSpec {
  label: string;
  value: string;
}

export interface Car {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  category: string;
  /** Technical class, e.g. "LMH", "LMDh", "GT3". */
  techClass: string;
  body: BodyType;
  powertrain: "combustion" | "hybrid" | "electric";
  /** Seasons in which the car (or this specification) raced, as a range label. */
  seasonsLabel: string;
  firstYear: number;
  championshipIds: string[];
  teamIds: string[];
  specs: CarSpec[];
  history: string[];
  gallery: Media[];
  provenance: Provenance;
}

export interface Team {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  base?: string;
  disciplines: DisciplineId[];
  championshipIds: string[];
  carIds: string[];
  accent: string;
  provenance: Provenance;
}

export interface Honour {
  label: string;
  detail?: string;
}

export interface Driver {
  id: string;
  name: string;
  nationality: string;
  countryCode: string;
  disciplines: DisciplineId[];
  /** Current team: only filled from a connected source. */
  currentTeamId?: string;
  teamHistory: { teamId?: string; label: string }[];
  championshipIds: string[];
  honours: Honour[];
  carIds: string[];
  photo?: Media;
  provenance: Provenance;
}

/* ───────────────────────────── Race Center ───────────────────────────── */

export type SessionKind =
  | "practice"
  | "qualifying"
  | "sprint-qualifying"
  | "sprint"
  | "hyperpole"
  | "warm-up"
  | "race"
  | "shakedown"
  | "stage"
  | "power-stage"
  | "elimination";

export interface RaceSession {
  id: string;
  kind: SessionKind;
  name: string;
  /** ISO datetime (UTC). */
  start: string;
  /** Duration label for timed races ("6 h", "24 h") or laps ("200 voltas"). */
  durationLabel?: string;
  status: "scheduled" | "completed";
}

export type EventFormat =
  | "f1-standard"
  | "f1-sprint"
  | "endurance"
  | "sprint-race"
  | "rally"
  | "oval"
  | "drag";

export interface RaceEvent {
  id: string;
  championshipId: string;
  season: number;
  round: number;
  name: string;
  circuitId: string;
  format: EventFormat;
  /** ISO date of the first day and of the last day. */
  startDate: string;
  endDate: string;
  sessions: RaceSession[];
  /** Classes competing (endurance / multi-class events). */
  classes?: string[];
  provenance: Provenance;
}

export interface ResultRow {
  position: number;
  /** Car number. */
  number: string;
  drivers: string[];
  team: string;
  carClass?: string;
  laps?: number;
  gap?: string;
  points?: number;
  status?: "finished" | "dnf" | "dsq";
}

export interface SessionResult {
  eventId: string;
  sessionId: string;
  rows: ResultRow[];
  provenance: Provenance;
}

export interface StandingRow {
  position: number;
  name: string;
  team?: string;
  countryCode?: string;
  points: number;
  wins: number;
  podiums?: number;
}

export interface Standings {
  championshipId: string;
  season: number;
  kind: "drivers" | "teams";
  afterRound: number;
  rows: StandingRow[];
  provenance: Provenance;
}

export interface NewsArticle {
  id: string;
  title: string;
  dek: string;
  championshipIds: string[];
  discipline: DisciplineId;
  publishedAt: string;
  sourceName: string;
  /** Link to the original article. Absent for demo items. */
  url?: string;
  featured?: boolean;
  provenance: Provenance;
}

/**
 * Result wrapper returned by the data service. "unavailable" means no data
 * provider is connected for that resource: the UI renders an honest empty
 * state instead of placeholder numbers.
 */
export type DataResult<T> =
  | { status: "ok"; data: T; provenance: Provenance }
  | { status: "unavailable"; reason: string };
