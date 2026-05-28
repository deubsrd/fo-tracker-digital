import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  User,
  Mail,
  BadgeInfo,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { submitInstructorRequest } from "@/lib/requests.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/solicitar-acesso")({
  head: () => ({ meta: [{ title: "Solicitar Acesso — CFC 2026" }] }),
  component: SolicitarAcessoPage,
});

type State =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; message: string };

function SolicitarAcessoPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ type: "idle" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ type: "loading" });

    try {
      const result = await submitInstructorRequest({
        data: { nome: nome.trim(), usuario: usuario.trim(), email: email.trim() },
      });

      if (result.ok) {
        setState({ type: "success" });
      } else {
        const messages: Record<string, string> = {
          already_pending:
            "Este nome de guerra já possui uma solicitação aguardando análise.",
          already_exists:
            "Este nome de guerra já está cadastrado no sistema. Tente fazer login.",
        };
        setState({
          type: "error",
          message: messages[result.error] ?? "Erro inesperado. Tente novamente.",
        });
      }
    } catch {
      setState({
        type: "error",
        message: "Falha na comunicação com o servidor. Tente novamente.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="size-12 rounded bg-gradient-gold grid place-items-center text-gold-foreground font-stencil font-bold shadow-gold">
            EB
          </div>
          <div>
            <div className="font-stencil text-gold tracking-widest">
              CFC 2026
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              Exército Brasileiro
            </div>
          </div>
        </div>

        {state.type === "success" ? (
          /* ── Success state ── */
          <div className="rounded-lg border border-success/30 bg-success/10 p-8 text-center space-y-4">
            <CheckCircle2 className="size-14 text-success mx-auto" />
            <h2 className="text-2xl font-stencil font-bold">
              Solicitação Enviada!
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sua solicitação foi registrada com sucesso. O administrador
              receberá uma notificação e você será informado por e-mail assim
              que o acesso for analisado.
            </p>
            <Link to="/">
              <Button
                variant="outline"
                className="mt-4 font-stencil tracking-widest"
              >
                Voltar ao Login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div>
              <div className="font-stencil text-xs uppercase tracking-widest text-gold mb-2">
                Acesso Restrito
              </div>
              <h2 className="text-3xl font-stencil font-bold">
                Solicitar Autorização
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Instrutores precisam ser autorizados pelo administrador para
                acessar a plataforma. Preencha os dados abaixo.
              </p>
            </div>

            {state.type === "error" && (
              <div className="rounded border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {state.message}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nome" className="font-stencil text-xs">
                  Nome Completo
                </Label>
                <div className="relative">
                  <BadgeInfo className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Cap. Silva"
                    className="pl-9 h-11"
                    required
                    minLength={2}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usuario" className="font-stencil text-xs">
                  Nome de Guerra (Usuário)
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="SILVA"
                    className="pl-9 h-11"
                    required
                    minLength={2}
                    autoComplete="username"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Este será o seu login na plataforma.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-stencil text-xs">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@eb.mil.br"
                    className="pl-9 h-11"
                    required
                    autoComplete="email"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Você receberá uma notificação quando o acesso for analisado.
                </p>
              </div>

              <Button
                type="submit"
                disabled={state.type === "loading"}
                className="w-full h-11 bg-gradient-gold text-gold-foreground font-stencil tracking-widest hover:opacity-90 shadow-gold disabled:opacity-60"
              >
                {state.type === "loading" ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Enviando solicitação...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4 mr-2" />
                    Solicitar Acesso
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Já tem acesso?{" "}
                <Link
                  to="/"
                  className="text-gold font-semibold underline-offset-2 hover:underline"
                >
                  Fazer login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
