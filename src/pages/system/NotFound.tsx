import { ArrowRight } from "lucide-react";
import { ApexSymbol } from "@/components/brand/Brand";
import { Container } from "@/components/editorial/Editorial";
import { ButtonLink } from "@/components/ui/Button";
import { primaryNav } from "@/config/navigation";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function NotFound() {
  usePageMeta("Página não encontrada", { record: false });
  return (
    <Container className="grid min-h-[70vh] items-center gap-12 py-20 lg:grid-cols-2">
      <div>
        <ApexSymbol className="h-10 w-10 text-paper" />
        <p className="kicker mt-8 text-apex-ink">404 · Fora do traçado</p>
        <h1 className="display mt-4 text-[clamp(2.6rem,7vw,5.5rem)]">Saída de pista.</h1>
        <p className="mt-5 max-w-md text-silver">Esta página não existe ou mudou de endereço. Use a busca (tecla “/”) ou escolha uma seção.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink to="/" variant="primary">Voltar ao Grid</ButtonLink>
        </div>
      </div>
      <nav aria-label="Seções" className="border-t border-line">
        {primaryNav.map((n) => (
          <ButtonLink key={n.to} to={n.to} variant="quiet" className="flex w-full justify-between border-b border-line !py-4">
            <span>
              <span className="mr-4 text-apex-ink">{n.code}</span>
              {n.label}
            </span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </ButtonLink>
        ))}
      </nav>
    </Container>
  );
}
