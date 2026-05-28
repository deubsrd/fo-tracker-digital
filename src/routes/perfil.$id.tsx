import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ShieldCheck, ShieldAlert, QrCode, Award, Calendar, Phone } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  alunoPorId,
  pontuacaoAluno,
  registrosDoAluno,
} from "@/lib/mock-data";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/perfil/$id")({
  head: () => ({ meta: [{ title: "Perfil — CFC 2026" }] }),
  component: () => (
    <RequireAuth>
      <Perfil />
    </RequireAuth>
  ),
});

function Perfil() {
  const { id } = Route.useParams();
  const aluno = alunoPorId(id);
  if (!aluno) return <Navigate to="/alunos" />;

  const regs = registrosDoAluno(id);
  const pts = pontuacaoAluno(id);
  const fop = regs.filter((r) => r.tipo === "FO+").length;
  const fon = regs.filter((r) => r.tipo === "FO-").length;

  // Evolução acumulada
  let acc = 0;
  const evolucao = [...regs].reverse().map((r) => {
    acc += r.pontuacao;
    return { data: r.data, pontos: acc };
  });

  const medalhas: Array<{ label: string; ativa: boolean }> = [
    { label: "Estreante", ativa: regs.length > 0 },
    { label: "5 FO+", ativa: fop >= 5 },
    { label: "Líder", ativa: pts >= 30 },
    { label: "Disciplina", ativa: fon === 0 && regs.length > 0 },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-command overflow-hidden">
        <div className="h-24 bg-gradient-command pattern-camo" />
        <CardContent className="-mt-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="size-24 rounded bg-gradient-gold border-4 border-background grid place-items-center font-stencil text-3xl font-bold text-gold-foreground shadow-gold">
              {aluno.nome
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="font-stencil text-xs uppercase tracking-widest text-gold">
                Nº {aluno.numeroGuerra} · {aluno.pelotao}
              </div>
              <h1 className="text-3xl font-stencil font-bold mt-1">{aluno.nome}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> {aluno.dataNascimento}</span>
                <span className="inline-flex items-center gap-1"><Phone className="size-3" /> {aluno.contato}</span>
                <Badge variant="outline" className="text-[10px]">{aluno.situacao}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Pontuação</div>
              <div className={`text-4xl font-stencil font-bold ${pts >= 0 ? "text-gold" : "text-destructive"}`}>
                {pts > 0 ? "+" : ""}{pts}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat icon={ShieldCheck} label="FO+" value={fop} tone="success" />
        <Stat icon={ShieldAlert} label="FO-" value={fon} tone="destructive" />
        <Stat icon={Award} label="Medalhas" value={medalhas.filter((m) => m.ativa).length} tone="gold" />
        <Stat icon={QrCode} label="QR Perfil" value="—" tone="default" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-command lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-stencil tracking-wider">Evolução da Pontuação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucao}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="data" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="pontos" stroke="var(--gold)" strokeWidth={2} dot={{ fill: "var(--gold)", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-command">
          <CardHeader>
            <CardTitle className="font-stencil tracking-wider">Medalhas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {medalhas.map((m) => (
              <div
                key={m.label}
                className={`rounded border p-3 text-center ${
                  m.ativa
                    ? "border-gold bg-gold/10 text-gold shadow-gold"
                    : "border-border bg-muted/30 text-muted-foreground opacity-50"
                }`}
              >
                <Award className="size-6 mx-auto" />
                <div className="font-stencil text-xs mt-2 tracking-wider">{m.label}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-command">
        <CardHeader>
          <CardTitle className="font-stencil tracking-wider">Histórico de Ocorrências</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {regs.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">Nenhum registro até o momento.</p>
          )}
          {regs.map((r) => {
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
                    <Badge variant="outline" className="text-[10px]">{r.categoria}</Badge>
                    {r.gravidade && (
                      <Badge variant="outline" className="text-[10px] border-gold text-gold">{r.gravidade}</Badge>
                    )}
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {r.data} · {r.horario} · {r.responsavel}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.descricao}</p>
                </div>
                <div className={`font-stencil text-lg font-bold ${pos ? "text-success" : "text-destructive"}`}>
                  {pos ? "+" : ""}{r.pontuacao}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone: "default" | "success" | "destructive" | "gold";
}) {
  const c = {
    default: "text-foreground",
    success: "text-success",
    destructive: "text-destructive",
    gold: "text-gold",
  }[tone];
  return (
    <Card className="shadow-command">
      <CardContent className="pt-5 flex items-center gap-3">
        <Icon className={`size-5 ${c}`} />
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className={`font-stencil text-2xl font-bold ${c}`}>{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
