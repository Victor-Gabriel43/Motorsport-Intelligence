import { isRouteErrorResponse, useRouteError } from "react-router";
import { ApexSymbol } from "@/components/brand/Brand";
import { Container } from "@/components/editorial/Editorial";
import { Button, ButtonLink } from "@/components/ui/Button";

export function RouteError() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const message = isRouteErrorResponse(error) ? `${error.status} · ${error.statusText}` : error instanceof Error ? error.message : "Erro desconhecido";
  return (
    <Container className="flex min-h-[70vh] flex-col justify-center py-20">
      <ApexSymbol className="h-10 w-10 text-paper" />
      <p className="kicker mt-8 text-apex-ink">{is404 ? "Fora do traçado" : "Bandeira vermelha"}</p>
      <h1 className="display mt-4 text-[clamp(2.6rem,7vw,5.5rem)]">{is404 ? "Página não encontrada" : "Algo saiu da pista."}</h1>
      <p className="mt-5 max-w-xl text-silver">
        {is404 ? "O endereço não corresponde a nenhuma página do APEX." : "Esta página encontrou um erro inesperado. Tente novamente ou volte ao início."}
      </p>
      <p className="mt-3 font-mono text-xs text-mist">{message}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink to="/" variant="primary">Voltar ao Grid</ButtonLink>
        <Button onClick={() => window.location.reload()}>Recarregar</Button>
      </div>
    </Container>
  );
}
