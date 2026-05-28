import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Lock, User } from "lucide-react";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acesso — CFC 2026" },
      { name: "description", content: "Autenticação no sistema FO+ / FO- do Curso de Formação de Cabos 2026." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [patente, setPatente] = useState<Patente>("Instrutor");

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !senha) return;
    login(usuario, senha, patente);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 bg-gradient-command border-r border-border overflow-hidden">
        <div className="absolute inset-0 pattern-camo opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/80" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="size-14 rounded bg-gradient-gold grid place-items-center text-gold-foreground font-stencil font-bold shadow-gold">
            EB
          </div>
          <div>
            <div className="font-stencil text-gold tracking-widest">EXÉRCITO BRASILEIRO</div>
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
            Plataforma de registro e acompanhamento de Fatos Observados — positivos e negativos —
            do Curso de Formação de Cabos.
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

      {/* Login form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
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
            <h2 className="text-3xl font-stencil font-bold">Identifique-se, militar</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Informe suas credenciais para acessar o sistema FO+ / FO-.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="usuario" className="font-stencil text-xs">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Nome de guerra"
                  className="pl-9 h-11"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="font-stencil text-xs">Senha</Label>
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
              <Select value={patente} onValueChange={(v) => setPatente(v as Patente)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Administrador</SelectItem>
                  <SelectItem value="Instrutor">Instrutor</SelectItem>
                  <SelectItem value="Monitor">Monitor</SelectItem>
                  <SelectItem value="Aluno">Aluno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-gold text-gold-foreground font-stencil tracking-widest hover:opacity-90 shadow-gold"
            >
              Entrar no Comando
            </Button>

            <p className="text-[11px] text-center text-muted-foreground uppercase tracking-widest">
              Demonstração — qualquer credencial é aceita
            </p>
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
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
