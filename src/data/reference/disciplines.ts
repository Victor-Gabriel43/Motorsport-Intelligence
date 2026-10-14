import type { Discipline, DisciplineId, Region } from "@/types/models";

export const disciplines: Discipline[] = [
  {
    id: "formula",
    name: "Fórmula e monopostos",
    shortName: "Fórmula",
    description: "Carros de cockpit aberto e rodas descobertas, do topo da pirâmide às categorias de acesso.",
    plate: "open-wheel",
  },
  {
    id: "endurance",
    name: "Endurance",
    shortName: "Endurance",
    description: "Corridas de longa duração, multiclasse, com trocas de pilotos e estratégia de stint.",
    plate: "prototype",
  },
  {
    id: "gt",
    name: "GT e carros esportivos",
    shortName: "GT",
    description: "Carros derivados de modelos de rua, equalizados por balanço de performance.",
    plate: "gt",
  },
  {
    id: "rally",
    name: "Rally e rally-raid",
    shortName: "Rally",
    description: "Especiais cronometradas em terra, asfalto, neve e deserto.",
    plate: "rally",
  },
  {
    id: "stock-touring",
    name: "Stock cars e turismo",
    shortName: "Stock & Turismo",
    description: "Ovais, mistos e circuitos de rua com grids cheios e contato próximo.",
    plate: "stock",
  },
  {
    id: "other",
    name: "Outras modalidades",
    shortName: "Outras",
    description: "Arrancada, sprint cars em terra e campeonatos nacionais de turismo.",
    plate: "dragster",
  },
];

export const disciplineById = Object.fromEntries(disciplines.map((d) => [d.id, d])) as Record<
  DisciplineId,
  Discipline
>;

export const regionLabels: Record<Region, string> = {
  global: "Mundial",
  europe: "Europa",
  "north-america": "América do Norte",
  "south-america": "América do Sul",
  "asia-pacific": "Ásia-Pacífico",
  "middle-east-africa": "Oriente Médio e África",
};
