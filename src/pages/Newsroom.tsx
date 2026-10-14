import { ExternalLink as ExternalIcon, Newspaper, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Container, PageHeader } from "@/components/editorial/Editorial";
import { LiveBoundary } from "@/components/tables/Tables";
import { Badge, ProvenanceBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChipGroup, SearchField, SelectField } from "@/components/ui/Controls";
import { EmptyState } from "@/components/ui/States";
import { useNews } from "@/hooks/useLive";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useClearQuery, useQueryState } from "@/hooks/useQueryState";
import { catalog } from "@/services/data";
import { normalize } from "@/services/search";
import type { NewsArticle } from "@/types/models";
import { formatDate } from "@/lib/format";

const categories = [
  { value: "all", label: "Tudo" },
  { value: "formula-1", label: "Fórmula 1" },
  { value: "endurance", label: "Endurance" },
  { value: "gt", label: "GT" },
  { value: "rally", label: "Rally" },
  { value: "indycar", label: "IndyCar" },
  { value: "nascar", label: "NASCAR" },
  { value: "other", label: "Outras" },
];

function inCategory(a: NewsArticle, cat: string) {
  switch (cat) {
    case "all":
      return true;
    case "formula-1":
      return a.championshipIds.includes("formula-1");
    case "indycar":
      return a.championshipIds.includes("indycar");
    case "nascar":
      return a.championshipIds.some((c) => c.startsWith("nascar"));
    case "endurance":
    case "gt":
    case "rally":
      return a.discipline === cat;
    default:
      return !["formula-1", "indycar"].some((c) => a.championshipIds.includes(c)) && !a.championshipIds.some((c) => c.startsWith("nascar")) && !["endurance", "gt", "rally"].includes(a.discipline);
  }
}

export default function Newsroom() {
  usePageMeta("Newsroom");
  const news = useNews();
  const [cat, setCat] = useQueryState("category");
  const [championship, setChampionship] = useQueryState("championship");
  const [q, setQ] = useQueryState("q", "");
  const [articleId, setArticle] = useQueryState("article", "");
  const clear = useClearQuery(["category", "championship", "q"]);

  return (
    <>
      <PageHeader
        code="06"
        kicker="Newsroom"
        title={
          <>
            Notícias de
            <br />
            automobilismo
          </>
        }
        dek="Matérias recentes e artigos em destaque, filtrados por campeonato, com data, fonte de publicação e acesso à matéria original."
        aside={
          <p className="border-l-2 border-line-strong pl-4 text-xs leading-relaxed text-mist">
            Nenhum feed de notícias está conectado. O APEX não escreve nem simula notícias: o conteúdo abaixo, quando visível, é demonstração de layout.
          </p>
        }
      />
      <div className="sticky top-16 z-20 border-b border-line bg-ink/92 backdrop-blur-md">
        <Container className="py-4">
          <ChipGroup label="Categoria" value={cat} onChange={setCat} options={categories} />
        </Container>
      </div>
      <Container className="mt-8">
        <LiveBoundary state={news} emptyTitle="Nenhuma fonte de notícias conectada.">
          {(items) => <NewsList items={items} cat={cat} championship={championship} setChampionship={setChampionship} q={q} setQ={setQ} clear={clear} onOpen={setArticle} />}
        </LiveBoundary>
      </Container>
      {news.status === "ok" ? <ArticleDialog article={news.data.find((a) => a.id === articleId)} onClose={() => setArticle("")} /> : null}
    </>
  );
}

function NewsList({
  items,
  cat,
  championship,
  setChampionship,
  q,
  setQ,
  clear,
  onOpen,
}: {
  items: NewsArticle[];
  cat: string;
  championship: string;
  setChampionship: (v: string) => void;
  q: string;
  setQ: (v: string) => void;
  clear: () => void;
  onOpen: (id: string) => void;
}) {
  const filtered = useMemo(
    () =>
      items.filter(
        (a) => inCategory(a, cat) && (championship === "all" || a.championshipIds.includes(championship)) && (!q || normalize(`${a.title} ${a.dek}`).includes(normalize(q))),
      ),
    [items, cat, championship, q],
  );
  const champIds = Array.from(new Set(items.flatMap((a) => a.championshipIds)));
  const featured = filtered.find((a) => a.featured) ?? filtered[0];
  const rest = filtered.filter((a) => a !== featured);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] sm:items-end sm:gap-4">
        <SearchField label="Pesquisar" value={q} onChange={setQ} placeholder="Título ou resumo" />
        <SelectField label="Campeonato" value={championship} onChange={setChampionship} options={[{ value: "all", label: "Todos" }, ...champIds.map((id) => ({ value: id, label: catalog.championshipById[id]?.shortName ?? id }))]} />
        <Button variant="ghost" onClick={clear} className="h-[42px]">Limpar</Button>
      </div>
      {!featured ? (
        <EmptyState className="mt-10" title="Nenhuma matéria encontrada." icon={<Newspaper className="h-5 w-5" aria-hidden="true" />} action={<Button onClick={clear}>Limpar filtros</Button>} code="NEWS">
          Ajuste a categoria, o campeonato ou a pesquisa.
        </EmptyState>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <button type="button" onClick={() => onOpen(featured.id)} className="group text-left">
            <div className="grain relative aspect-[16/9] overflow-hidden border border-line bg-carbon">
              <div className="tech-grid absolute inset-0 opacity-60" />
              <span className="display absolute bottom-4 left-5 text-[5rem] text-white/[0.05] sm:text-[8rem]">
                {catalog.championshipById[featured.championshipIds[0]!]?.shortName}
              </span>
              <span className="absolute left-5 top-5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-mist">Sem imagem · demonstração</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge tone="apex">Destaque</Badge>
              <ProvenanceBadge provenance={featured.provenance} />
            </div>
            <h2 className="wide mt-4 text-[clamp(1.7rem,3.2vw,2.7rem)] font-bold leading-[1.06] tracking-tight group-hover:text-silver">{featured.title}</h2>
            <p className="mt-4 max-w-2xl text-silver">{featured.dek}</p>
            <p className="meta mt-5">{formatDate(featured.publishedAt, { day: "2-digit", month: "long", year: "numeric" })} · {featured.sourceName}</p>
          </button>
          <ul className="border-t border-line">
            {rest.map((a) => (
              <li key={a.id} className="border-b border-line">
                <button type="button" onClick={() => onOpen(a.id)} className="group grid w-full grid-cols-[minmax(0,1fr)_auto] gap-4 py-5 text-left">
                  <span>
                    <span className="kicker">
                      {a.championshipIds.map((c) => catalog.championshipById[c]?.shortName).join(" · ")} · {formatDate(a.publishedAt)}
                    </span>
                    <span className="mt-2 block font-semibold leading-snug text-paper group-hover:text-silver">{a.title}</span>
                    <span className="meta mt-2 block">{a.sourceName}</span>
                  </span>
                  <ProvenanceBadge provenance={a.provenance} className="self-start" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function ArticleDialog({ article, onClose }: { article?: NewsArticle; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (article && !d.open) d.showModal();
    if (!article && d.open) d.close();
  }, [article]);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-label={article?.title ?? "Matéria"} className="m-auto w-[min(42rem,calc(100%-2rem))] border border-line-strong bg-graphite p-0 text-paper backdrop:bg-ink/80 backdrop:backdrop-blur-sm">
      {article ? (
        <article className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <ProvenanceBadge provenance={article.provenance} />
            <button type="button" onClick={onClose} className="-m-2 p-2 text-mist hover:text-paper" aria-label="Fechar">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <h2 className="wide mt-5 text-2xl font-bold leading-tight sm:text-3xl">{article.title}</h2>
          <p className="meta mt-4">{formatDate(article.publishedAt, { day: "2-digit", month: "long", year: "numeric" })} · {article.sourceName}</p>
          <p className="mt-6 text-silver">{article.dek}</p>
          <div className="mt-8 border-t border-line pt-5">
            {article.url ? (
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-apex px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-white">
                Ler matéria original <ExternalIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <p className="text-sm text-mist">Este é um item de demonstração e não possui matéria original. Com uma fonte conectada, aqui ficará o link para o texto completo no site do veículo.</p>
            )}
          </div>
        </article>
      ) : null}
    </dialog>
  );
}
