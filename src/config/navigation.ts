export interface NavItem {
  label: string;
  to: string;
  /** Short code shown in the mobile menu and section kickers. */
  code: string;
  description: string;
}

export const primaryNav: NavItem[] = [
  { label: "Home", to: "/", code: "00", description: "Grid — página inicial" },
  { label: "Championships", to: "/championships", code: "01", description: "Campeonatos por modalidade e região" },
  { label: "Race Center", to: "/race-center", code: "02", description: "Calendário, sessões e resultados" },
  { label: "Garage", to: "/garage", code: "03", description: "Biblioteca de carros de competição" },
  { label: "Drivers & Teams", to: "/drivers-teams", code: "04", description: "Perfis de pilotos e equipes" },
  { label: "Circuits", to: "/circuits", code: "05", description: "Circuitos, ovais e especiais" },
  { label: "Newsroom", to: "/newsroom", code: "06", description: "Notícias e artigos" },
  { label: "My Apex", to: "/my-apex", code: "07", description: "Favoritos e preferências" },
];
