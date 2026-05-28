import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { processRequest } from "@/lib/requests.server";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

// Search params
type AutorizarSearch = {
  token?: string;
  acao?: string;
};

export const Route = createFileRoute("/autorizar")({
  validateSearch: (search): AutorizarSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
    acao: typeof search.acao === "string" ? search.acao : undefined,
  }),
  head: () => ({ meta: [{ title: "Autorizar Acesso — CFC 2026" }] }),
  component: AutorizarPage,
});

type State =
  | { type: "loading" }
  | { type: "success"; nome: string; acao: "aprovar" | "negar" }
  | { type: "already_processed"; nome: string; current: string }
  | { type: "error"; message: string };

function AutorizarPage() {
  const { token, acao } = Route.useSearch();
  const [state, setState] = useState<State>({ type: "loading" });

  useEffect(() => {
    if (!token || (acao !== "aprovar" && acao !== "negar")) {
      setState({ type: "error", message: "Link inválido ou incompleto." });
      return;
    }

    processRequest({ data: { token, acao } })
      .then((result) => {
        if (result.ok) {
          setState({ type: "success", nome: result.nome, acao: result.acao });
        } else if (result.error === "already_processed") {
          setState({
            type: "already_processed",
            nome: result.nome ?? "—",
            current: result.current ?? "—",
          });
        } else {
          setState({
            type: "error",
            message:
              result.error === "not_found"
                ? "Solicitação não encontrada. O link pode ser inválido ou já ter expirado."
                : "Erro ao processar a solicitação.",
          });
        }
      })
      .catch(() => {
        setState({
          type: "error",
          message: "Falha na comunicação com o servidor.",
        });
      });
  }, [token, acao]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded bg-gradient-gold grid place-items-center text-gold-foreground font-stencil font-bold shadow-gold text-xs">
            EB
          </div>
          <div>
            <div className="font-stencil text-gold tracking-widest text-sm">
              CFC 2026
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Exército Brasileiro
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 text-center space-y-5 shadow-command">
          {state.type === "loading" && (
            <>
              <Loader2 className="size-14 text-gold mx-auto animate-spin" />
              <h2 className="text-xl font-stencil font-bold">Processando...</h2>
              <p className="text-muted-foreground text-sm">
                Aguarde enquanto a solicitação é processada.
              </p>
            </>
          )}

          {state.type === "success" && state.acao === "aprovar" && (
            <>
              <CheckCircle2 className="size-14 text-success mx-auto" />
              <h2 className="text-2xl font-stencil font-bold">
                Acesso Autorizado!
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                O instrutor <strong>{state.nome}</strong> agora tem acesso à
                plataforma. Um e-mail de confirmação foi enviado.
              </p>
            </>
          )}

          {state.type === "success" && state.acao === "negar" && (
            <>
              <XCircle className="size-14 text-destructive mx-auto" />
              <h2 className="text-2xl font-stencil font-bold">
                Acesso Negado
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                O acesso de <strong>{state.nome}</strong> foi negado. O
                instrutor foi notificado por e-mail.
              </p>
            </>
          )}

          {state.type === "already_processed" && (
            <>
              <AlertTriangle className="size-14 text-yellow-400 mx-auto" />
              <h2 className="text-2xl font-stencil font-bold">
                Já Processado
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A solicitação de <strong>{state.nome}</strong> já foi{" "}
                {state.current === "approved" ? "aprovada" : "negada"}{" "}
                anteriormente.
              </p>
            </>
          )}

          {state.type === "error" && (
            <>
              <AlertTriangle className="size-14 text-destructive mx-auto" />
              <h2 className="text-2xl font-stencil font-bold">Erro</h2>
              <p className="text-muted-foreground text-sm">{state.message}</p>
            </>
          )}

          {state.type !== "loading" && (
            <Link to="/">
              <Button
                variant="outline"
                className="mt-2 font-stencil tracking-widest"
              >
                Ir para o Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
