import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Lock, User, Clock, XCircle, AlertCircle } from "lucide-react";
import { useAuth, type Patente } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "Acesso — CFC 2026" },
      {
        name: "description",
        content:
          "Autenticação no sistema FO+ / FO- do Curso de Formação de Cabos 2026.",
      },
    ],
  }),
  component: LoginPage,
}));

type AccessState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "pending" }
  | { type: "denied" }
  | { type: "not_found" };

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [patente, setPatente] = useState<Patente>("Instrutor");
  const [state, setState] = useState<AccessState>({ type: "idle" });

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !senha.trim()) return;
    setState({ type: "loading" });

    const result = await login(usuario.trim(), senha, patente);

    if (result.ok) {
      navigate({ to: "/dashboard" });
    } else {
      setState({ type: result.reason });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Brand panel ── */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 bg-gradient-command border-r border-border overflow-hidden">
        <div className="absolute inset-0 pattern-camo opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/80" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="size-14 rounded bg-gradient-gold grid place-items-center text-gold-foreground font-stencil font-bold shadow-gold">
            EB
          </div>
          <div>
            <div className="font-stencil text-gold tracking-widest">
              EXÉRCITO BRASILEIRO
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              Braço Forte · Mão Amiga
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-stencil text-gold">
            <ShieldCheck className="size-3.5" /> Sistema Restrito
          </div>
          <h1 className="text-5xl font-stencil font-bold leading-tight">
            CFC <span className="text-gold">2026</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Plataforma de registro e acompanhamento de Fatos Observados —
            positivos e negativos — do Curso de Formação de Cabos.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-6 max-w-md">
            <Stat label="FO+ Mês" value="124" />
            <Stat label="FO- Mês" value="38" />
            <Stat label="Alunos" value="248" />
          </div>
        </div>

        <div className="relative z-10 text-xs uppercase tracking-widest text-muted-foreground">
          Acesso autorizado somente a militares cadastrados
        </div>
      </div>

      {/* ── Login form ── */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="size-12 rounded bg-gradient-gold grid place-items-center text-gold-foreground font-stencil font-bold">
              EB
            </div>
            <div>
              <div className="font-stencil text-gold">CFC 2026</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">
                Exército Brasileiro
              </div>
            </div>
          </div>

          <div>
            <div className="font-stencil text-xs uppercase tracking-widest text-gold mb-2">
              Autenticação
            </div>
            <h2 className="text-3xl font-stencil font-bold">
              Identifique-se, militar
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Informe suas credenciais para acessar o sistema FO+ / FO-.
            </p>
          </div>

          {/* Access state feedback */}
          {state.type === "pending" && (
            <div className="flex items-start gap-3 rounded border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm">
              <Clock className="size-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-300 font-stencil tracking-wide">
                  Aguardando aprovação
                </div>
                <div className="text-muted-foreground mt-1">
                  Sua solicitação de acesso está sendo analisada. Você receberá
                  um e-mail quando for autorizado.
                </div>
              </div>
            </div>
          )}
          {state.type === "denied" && (
            <div className="flex items-start gap-3 rounded border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-destructive font-stencil tracking-wide">
                  Acesso negado
                </div>
                <div className="text-muted-foreground mt-1">
                  Sua solicitação foi negada. Entre em contato com o
                  administrador.
                </div>
              </div>
            </div>
          )}
          {state.type === "not_found" && (
            <div className="flex items-start gap-3 rounded border border-border bg-accent/20 p-4 text-sm">
              <AlertCircle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold font-stencil tracking-wide">
                  Usuário não encontrado
                </div>
                <div className="text-muted-foreground mt-1">
                  Este nome de guerra não tem solicitação de acesso.{" "}
                  <Link
                    to="/solicitar-acesso"
                    className="text-gold underline-offset-2 hover:underline"
                  >
                    Solicite seu acesso
                  </Link>
                  .
                </div>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="usuario" className="font-stencil text-xs">
                Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="usuario"
                  value={usuario}
                  onChange={(e) => {
                    setUsuario(e.target.value);
                    setState({ type: "idle" });
                  }}
                  placeholder="Nome de guerra"
                  className="pl-9 h-11"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="font-stencil text-xs">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 h-11"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-stencil text-xs">Nível de Acesso</Label>
              <Select
                value={patente}
                onValueChange={(v) => {
                  setPatente(v as Patente);
                  setState({ type: "idle" });
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Administrador</SelectItem>
                  <SelectItem value="Instrutor">Instrutor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={state.type === "loading"}
              className="w-full h-11 bg-gradient-gold text-gold-foreground font-stencil tracking-widest hover:opacity-90 shadow-gold disabled:opacity-60"
            >
              {state.type === "loading" ? "Verificando..." : "Entrar no Comando"}
            </Button>

            {patente === "Instrutor" && (
              <p className="text-center text-sm text-muted-foreground">
                Primeiro acesso?{" "}
                <Link
                  to="/solicitar-acesso"
                  className="text-gold font-semibold underline-offset-2 hover:underline"
                >
                  Solicitar autorização
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-card/50 p-3">
      <div className="text-2xl font-stencil font-bold text-gold">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
