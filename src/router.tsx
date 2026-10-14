import { createBrowserRouter, type RouteObject } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { RouteError } from "@/pages/system/RouteError";

/** Each page is code-split; the shell shows a progress bar while a page chunk loads. */
const page = (load: () => Promise<{ default: React.ComponentType }>): Pick<RouteObject, "lazy"> => ({
  lazy: async () => ({ Component: (await load()).default }),
});

export const routes: RouteObject[] = [
  {
    path: "/",
    Component: AppShell,
    ErrorBoundary: RouteError,
    HydrateFallback: () => null,
    children: [
      {
        ErrorBoundary: RouteError,
        children: [
          { index: true, ...page(() => import("@/pages/Home")) },
          { path: "championships", ...page(() => import("@/pages/Championships")) },
          { path: "championships/:id", ...page(() => import("@/pages/ChampionshipDetail")) },
          { path: "race-center", ...page(() => import("@/pages/RaceCenter")) },
          { path: "race-center/:eventId", ...page(() => import("@/pages/EventDetail")) },
          { path: "garage", ...page(() => import("@/pages/Garage")) },
          { path: "garage/:id", ...page(() => import("@/pages/CarDetail")) },
          { path: "drivers-teams", ...page(() => import("@/pages/DriversTeams")) },
          { path: "drivers-teams/drivers/:id", ...page(() => import("@/pages/DriverDetail")) },
          { path: "drivers-teams/teams/:id", ...page(() => import("@/pages/TeamDetail")) },
          { path: "circuits", ...page(() => import("@/pages/Circuits")) },
          { path: "circuits/:id", ...page(() => import("@/pages/CircuitDetail")) },
          { path: "newsroom", ...page(() => import("@/pages/Newsroom")) },
          { path: "my-apex", ...page(() => import("@/pages/MyApex")) },
          { path: "*", ...page(() => import("@/pages/system/NotFound")) },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
