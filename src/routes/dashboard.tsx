import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Trophy,
  TrendingUp,
  Award,
} from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  alunoPorId,
  alunos,
  rankingAlunos,
  registros,
  totaisPorPelotao,
  ultimosRegistros,
} from "@/lib/mock-data";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Comando — CFC 2026" }],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

function Dashboard() {
  const totalFop = registros.filter((r) => r.tipo === "FO+").length;
  const totalFon = registros.filter((r) => r.tipo === "FO-").length;
  const ranking = rankingAlunos();
  const destaque = ranking[0];
  const ultimas = ultimosRegistros(5);
  const porPelotao = totaisPorPelotao();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-stencil text-xs uppercase tracking-widest text-gold">
            Posto de Comando
          </div>
          <h1 className="text-3xl font-stencil font-bold mt-1">Visão Geral</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Indicadores consolidados do Curso de Formação de Cabos 2026.
          </p>
        </div>
        <Badge variant="outline" className="border-gold text-gold font-stencil">
          {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
        </Badge>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={ShieldCheck} label="FO+ Total" value={totalFop} tone="success" />
        <KpiCard icon={ShieldAlert} label="FO- Total" value={totalFon} tone="destructive" />
        <KpiCard icon={Users} label="Alunos Ativos" value={alunos.length} tone="default" />
        <KpiCard icon={Trophy} label="Líder do Ranking" value={destaque.nome} tone="gold" small />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2 shadow-command">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-stencil tracking-wider">Desempenho por Pelotão</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">FO+ vs FO- no período</p>
            </div>
            <TrendingUp className="text-gold size-5" />
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porPelotao}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="pelotao" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="fop" name="FO+" fill="var(--success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fon" name="FO-" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top destaques */}
        <Card className="shadow-command">
          <CardHeader>
            <CardTitle className="font-stencil tracking-wider flex items-center gap-2">
              <Award className="size-4 text-gold" /> Destaques da Semana
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ranking.slice(0, 5).map((a, i) => (
              <Link
                key={a.id}
                to="/perfil/$id"
                params={{ id: a.id }}
                className="flex items-center gap-3 rounded border border-border bg-accent/30 p-3 hover:bg-accent transition-colors"
              >
                <div
                  className={`size-8 rounded grid place-items-center font-stencil text-xs font-bold ${
                    i === 0
                      ? "bg-gradient-gold text-gold-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{a.nome}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Nº {a.numeroGuerra} · {a.pelotao}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-stencil text-lg font-bold text-gold">{a.pontuacao}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">pts</div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Últimas ocorrências */}
      <Card className="shadow-command">
        <CardHeader>
          <CardTitle className="font-stencil tracking-wider">Últimas Ocorrências</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {ultimas.map((r) => {
            const a = alunoPorId(r.alunoId);
            const pos = r.tipo === "FO+";
            return (
              <div key={r.id} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
                <div
                  className={`size-10 rounded grid place-items-center shrink-0 ${
                    pos ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {pos ? <ShieldCheck className="size-5" /> : <ShieldAlert className="size-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{a?.nome}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {r.categoria}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {r.data} · {r.horario}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.descricao}</p>
                </div>
                <div
                  className={`font-stencil text-lg font-bold ${
                    pos ? "text-success" : "text-destructive"
                  }`}
                >
                  {pos ? "+" : ""}
                  {r.pontuacao}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
  small,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone: "default" | "success" | "destructive" | "gold";
  small?: boolean;
}) {
  const toneClasses = {
    default: "text-foreground",
    success: "text-success",
    destructive: "text-destructive",
    gold: "text-gold",
  }[tone];
  return (
    <Card className="shadow-command relative overflow-hidden">
      <div
        className={`absolute top-0 left-0 h-full w-1 ${
          tone === "success"
            ? "bg-success"
            : tone === "destructive"
              ? "bg-destructive"
              : tone === "gold"
                ? "bg-gradient-gold"
                : "bg-primary"
        }`}
      />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-stencil">
              {label}
            </div>
            <div className={`font-stencil font-bold mt-2 ${small ? "text-lg" : "text-3xl"} ${toneClasses}`}>
              {value}
            </div>
          </div>
          <Icon className={`size-5 ${toneClasses}`} />
        </div>
      </CardContent>
    </Card>
  );
}
