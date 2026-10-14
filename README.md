# APEX — Motorsport Intelligence

Plataforma pessoal de automobilismo: campeonatos, Race Center, Garage, pilotos e
equipes, circuitos, Newsroom e área pessoal (My Apex). Primeira etapa focada em
identidade visual, navegação e arquitetura preparada para dados reais.

Stack: **React 19 + TypeScript estrito + Tailwind CSS 4 + React Router 8 + Vite**,
ícones `lucide-react`, fontes Archivo (eixo de largura variável) e JetBrains Mono
servidas localmente. Sem backend.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de produção em dist/
npm test           # Vitest: integridade do catálogo, camada de dados, busca
```

O nome do projeto fica em `src/config/brand.ts` — trocar ali atualiza wordmark,
títulos e rodapé.

## Rotas

| Rota | Página |
| --- | --- |
| `/` | Grid (home) |
| `/championships`, `/championships/:id` | Central de campeonatos e página de cada competição (abas: visão geral, calendário, resultados, classificação, circuitos, participantes, notícias; `?season=` e `?tab=`) |
| `/race-center`, `/race-center/:eventId` | Calendário com filtros e detalhe do evento adaptado ao formato (F1 padrão/sprint, endurance multiclasse, rally, oval, arrancada) |
| `/garage`, `/garage/:id` | Biblioteca de carros (filtros por fabricante, campeonato, categoria, classe, ano, equipe, carroceria, motorização) |
| `/drivers-teams`, `/drivers-teams/drivers/:id`, `/drivers-teams/teams/:id` | Pilotos e equipes |
| `/circuits`, `/circuits/:id` | Circuitos, ovais, especiais de rally |
| `/newsroom` | Notícias (filtros, pesquisa, `?article=`) |
| `/my-apex` | Favoritos, lista para assistir, eventos acompanhados, histórico, preferências |

Filtros vivem na URL (links compartilháveis). Busca global: `⌘K`/`Ctrl+K` ou `/`.

## Integridade dos dados

Todo registro tem `provenance` e a interface mostra o selo correspondente:

- **Verificado** (`src/data/reference/`) — fichas curadas com fatos estáveis
  (nomes, organizadores, classes, locais da temporada 2026, extensão de traçados,
  títulos históricos), conferidas em 14/10/2026 em fontes oficiais e imprensa
  especializada — lista em [`SOURCES.md`](./SOURCES.md). Equipes atuais, temporada
  corrente, potência/peso e mapas de traçado **não** são preenchidos.
- **Demonstração** (`src/data/demo/demo.ts`) — calendário, resultados,
  classificações e notícias fictícios ("Piloto Demo 07", "Equipe Demo C"), apenas
  para testar layouts. Sempre rotulados; desligáveis em My Apex → Preferências.
  Com a demonstração desligada, as páginas mostram estados vazios honestos.
- **Fonte conectada** — reservado para integrações futuras; exibe fonte e data de
  atualização.

Não há indicador "ao vivo", cronômetro, notícia ou resultado inventado.

## Arquitetura

```
src/
  config/        brand.ts (nome), navigation.ts
  types/         models.ts — modelos tipados (Championship, RaceEvent, Car, Driver…)
  data/          reference/ (catálogo) · demo/ (conteúdo fictício isolado)
  services/      data.ts (catálogo + camada "live" baseada em provider) · search.ts
  store/         myApex.ts — localStorage versionado (favoritos, listas, preferências)
  hooks/         useLive (estados loading/unavailable/error), useQueryState, usePageMeta
  components/
    brand/       wordmark e símbolo
    layout/      AppShell, Navbar (menu móvel), rodapé, banner de demonstração
    search/      SearchDialog
    editorial/   PageHeader, SectionHeader, MetaList, SourceNote
    championship/ race/ garage/ tables/ ui/ art/
  pages/         uma página por rota (code-split)
```

### Conectando dados reais

Implemente a interface `LiveProvider` em `src/services/data.ts` (eventos,
resultados por sessão, classificações, notícias) e registre-a em `liveProvider`.
A UI já trata `ok` / `unavailable` / `error`. Chaves de API devem ficar em um
backend ou proxy — nunca no frontend. Antes de prometer cobertura, verifique
licença e disponibilidade de cada fonte; não use scraping não autorizado.

### Fotografias

Sem imagens licenciadas, carros e campeonatos usam **ilustrações técnicas genéricas
da categoria** (`components/art/`), identificadas como ilustração. Para usar fotos,
preencha `media`/`gallery` com `{ src, alt, credit, license, sourceUrl }` — o
crédito é exibido automaticamente.

## Deploy

`vercel.json` configura Vite com fallback de SPA. Na Vercel, importe este
repositório como um novo projeto — o framework, o build e o diretório de saída
são lidos automaticamente.
