import { catalog } from "./data";
import { disciplineById } from "@/data/reference/disciplines";
import { circuitTypeLabels } from "@/data/reference/circuits";
import type { RaceEvent } from "@/types/models";

export type SearchGroup = "Campeonatos" | "Eventos" | "Pilotos" | "Equipes" | "Carros" | "Circuitos";

export interface SearchItem {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle: string;
  to: string;
  keywords: string;
  isDemo?: boolean;
}

export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export function buildIndex(events: RaceEvent[] = []): SearchItem[] {
  const items: SearchItem[] = [];
  for (const c of catalog.championships) {
    items.push({
      id: c.id,
      group: "Campeonatos",
      title: c.shortName,
      subtitle: `${c.name} · ${disciplineById[c.discipline].shortName}`,
      to: `/championships/${c.id}`,
      keywords: [c.name, c.shortName, c.organizer, ...c.formats].join(" "),
    });
  }
  for (const e of events) {
    const champ = catalog.championshipById[e.championshipId];
    const circuit = catalog.circuitById[e.circuitId];
    items.push({
      id: e.id,
      group: "Eventos",
      title: `${champ?.shortName ?? ""} · ${circuit?.shortName ?? ""}`,
      subtitle: `${e.name} · ${e.startDate}`,
      to: `/race-center/${e.id}`,
      keywords: [e.name, champ?.name, circuit?.name, circuit?.country].join(" "),
      isDemo: e.provenance.kind === "demo",
    });
  }
  for (const d of catalog.drivers) {
    items.push({ id: d.id, group: "Pilotos", title: d.name, subtitle: d.nationality, to: `/drivers-teams/drivers/${d.id}`, keywords: d.name });
  }
  for (const t of catalog.teams) {
    items.push({ id: t.id, group: "Equipes", title: t.name, subtitle: [t.base, t.country].filter(Boolean).join(" · "), to: `/drivers-teams/teams/${t.id}`, keywords: `${t.name} ${t.country}` });
  }
  for (const car of catalog.cars) {
    items.push({ id: car.id, group: "Carros", title: car.name, subtitle: `${car.techClass} · ${car.seasonsLabel}`, to: `/garage/${car.id}`, keywords: [car.name, car.manufacturer, car.techClass, car.category].join(" ") });
  }
  for (const c of catalog.circuits) {
    items.push({ id: c.id, group: "Circuitos", title: c.name, subtitle: `${c.locality} · ${c.country} · ${circuitTypeLabels[c.type]}`, to: `/circuits/${c.id}`, keywords: [c.name, c.shortName, c.country, c.locality].join(" ") });
  }
  return items.map((i) => ({ ...i, keywords: normalize(`${i.title} ${i.keywords}`) }));
}

export const groupOrder: SearchGroup[] = ["Campeonatos", "Eventos", "Pilotos", "Equipes", "Carros", "Circuitos"];

export function search(index: SearchItem[], query: string, limitPerGroup = 5) {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored = index
    .filter((item) => terms.every((t) => item.keywords.includes(t)))
    .map((item) => {
      const title = normalize(item.title);
      const score = title === q ? 0 : title.startsWith(q) ? 1 : title.includes(q) ? 2 : 3;
      return { item, score };
    })
    .sort((a, b) => a.score - b.score || a.item.title.localeCompare(b.item.title));

  return groupOrder
    .map((group) => ({ group, items: scored.filter((s) => s.item.group === group).slice(0, limitPerGroup).map((s) => s.item) }))
    .filter((g) => g.items.length > 0);
}
