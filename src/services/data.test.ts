import { describe, expect, it } from "vitest";
import { catalog, live } from "./data";
import { buildIndex, search } from "./search";

describe("reference catalogue integrity", () => {
  it("every championship points to existing circuits and cars", () => {
    for (const c of catalog.championships) {
      c.circuitIds.forEach((id) => expect(catalog.circuitById[id], `${c.id} → circuit ${id}`).toBeDefined());
      c.carIds.forEach((id) => expect(catalog.carById[id], `${c.id} → car ${id}`).toBeDefined());
    }
  });
  it("cars, teams and drivers reference existing records", () => {
    for (const car of catalog.cars) {
      car.championshipIds.forEach((id) => expect(catalog.championshipById[id], `${car.id} → ${id}`).toBeDefined());
      car.teamIds.forEach((id) => expect(catalog.teamById[id], `${car.id} → ${id}`).toBeDefined());
    }
    for (const d of catalog.drivers) {
      d.teamHistory.forEach((t) => t.teamId && expect(catalog.teamById[t.teamId], `${d.id} → ${t.teamId}`).toBeDefined());
      d.championshipIds.forEach((id) => expect(catalog.championshipById[id]).toBeDefined());
    }
  });
  it("no reference record is marked as verified source data", () => {
    const all = [...catalog.championships, ...catalog.circuits, ...catalog.cars, ...catalog.teams, ...catalog.drivers];
    all.forEach((r) => expect(r.provenance.kind).toBe("reference"));
  });
});

describe("live layer", () => {
  it("is unavailable without demo mode (no fabricated data)", async () => {
    expect((await live.events(false)).status).toBe("unavailable");
    expect((await live.news(false)).status).toBe("unavailable");
    expect((await live.standings(false, "formula-1", 2026, "drivers")).status).toBe("unavailable");
  });
  it("labels every demo record as demo", async () => {
    const events = await live.events(true);
    expect(events.status).toBe("ok");
    if (events.status === "ok") events.data.forEach((e) => expect(e.provenance.kind).toBe("demo"));
    const news = await live.news(true);
    if (news.status === "ok") news.data.forEach((n) => expect(n.url).toBeUndefined());
  });
});

describe("search", () => {
  const index = buildIndex();
  it("is accent and case insensitive", () => {
    const groups = search(index, "nurburgring");
    expect(groups.flatMap((g) => g.items).some((i) => i.id === "nurburgring")).toBe(true);
  });
  it("groups results by category", () => {
    const groups = search(index, "porsche");
    expect(groups.map((g) => g.group)).toContain("Carros");
    expect(groups.map((g) => g.group)).toContain("Equipes");
  });
  it("returns nothing for an empty query", () => {
    expect(search(index, "  ")).toEqual([]);
  });
});
