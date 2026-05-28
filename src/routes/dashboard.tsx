import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ShieldAlert, Users, Trophy, Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAlunos, useRanking, useUltimosRegistros, useRegistros } from "@/lib/db";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Comando — CFC 2026" }] }),
  component: () => <RequireAuth><Dashboard /></RequireAuth>,
});

function Dashboard() {
  const { data: alunos = [] }         = useAlunos();
  const { data: ranking = [] }        = useRanking();
  const { data: ultimas = [] }        = useUltimosRegistros(6);
  const { data: todosFop = [] }       = useRegistros("FO+");
  const { data: todosFon = [] }       = useRegistros("FO-");

  const destaque = ranking[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-stencil text-xs uppercase tracking-widest text-gold">Posto de Comando</div>
          <h1 className="text-3xl font-stencil font-bold mt-1">Visão Geral</h1>
          <p className="text-sm text-muted-foreground mt-1">CFC 2026 · {alunos.length} alunos</p>
        </div>
        <Badge variant="outline" className="border-gold text-gold font-stencil">
          {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
        </Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={ShieldCheck} label="FO+ Total"       value={todosFop.length}  tone="success" />
        <KpiCard icon={ShieldAlert} label="FO- Total"       value={todosFon.length}  tone="destructive" />
        <KpiCard icon={Users}       label="Alunos Ativos"   value={alunos.length}    tone="default" />
        <KpiCard icon={Trophy}      label="Líder do Ranking" value={destaque?.nome ?? "—"} tone="gold" small />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-command">
          <CardHeader>
            <CardTitle className="font-stencil tracking-wider flex items-center gap-2">
              <Trophy className="size-4 text-gold" /> Top 5
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ranking.length === 0 ? (
              <div className="flex justify-center py-8"><Loader2 className="size-6 text-gold animate-spin" /></div>
            ) : ranking.slice(0, 5).map((a, i) => (
              <Link key={a.id} to="/perfil/$id" params={{ id: a.id }}
                className="flex items-center gap-3 rounded border border-border bg-accent/30 p-3 hover:bg-accent transition-colors">
                <div className={`size-8 rounded grid place-items-center font-stencil text-xs font-bold ${i === 0 ? "bg-gradient-gold text-gold-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{a.nome}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Nº {a.numeroGuerra}</div>
                </div>
                <div className={`font-stencil text-lg font-bold ${a.pontuacao >= 0 ? "text-gold" : "text-destructive"}`}>
                  {a.pontuacao > 0 ? "+" : ""}{a.pontuacao}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-command lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-stencil tracking-wider">Últimas Ocorrências</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {ultimas.length === 0 ? (
              <div className="flex justify-center py-8"><Loader2 className="size-6 text-gold animate-spin" /></div>
            ) : ultimas.map((r) => {
              const a   = alunos.find((x) => x.id === r.alunoId);
              const pos = r.tipo === "FO+";
              return (
                <div key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`size-8 rounded grid place-items-center shrink-0 mt-0.5 ${pos ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                    {pos ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm">{a?.nome ?? "—"}</span>
                      <Badge variant="outline" className={`text-[10px] ${pos ? "border-success/50 text-success" : "border-destructive/50 text-destructive"}`}>{r.tipo}</Badge>
                      <span className="text-[11px] text-muted-foreground">{r.data} · {r.horario}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.descricao}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone, small }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; tone: "default" | "success" | "destructive" | "gold"; small?: boolean }) {
  const cls = { default: "text-foreground", success: "text-success", destructive: "text-destructive", gold: "text-gold" }[tone];
  const bar = { default: "bg-primary", success: "bg-success", destructive: "bg-destructive", gold: "bg-gradient-gold" }[tone];
  return (
    <Card className="shadow-command relative overflow-hidden">
      <div className={`absolute top-0 left-0 h-full w-1 ${bar}`} />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-stencil">{label}</div>
            <div className={`font-stencil font-bold mt-2 ${small ? "text-lg" : "text-3xl"} ${cls}`}>{value}</div>
          </div>
          <Icon className={`size-5 ${cls}`} />
        </div>
      </CardContent>
    </Card>
  );
}
