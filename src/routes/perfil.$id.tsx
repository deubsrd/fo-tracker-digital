import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ShieldCheck, ShieldAlert, Award, Calendar, Phone, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAluno, useRegistrosByAluno, useDeleteRegistro } from "@/lib/db";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/perfil/$id")({
  head: () => ({ meta: [{ title: "Perfil — CFC 2026" }] }),
  component: () => <RequireAuth><Perfil /></RequireAuth>,
});

function Perfil() {
  const { id } = Route.useParams();
  const { data: aluno, isLoading: loadingAluno } = useAluno(id);
  const { data: regs = [], isLoading: loadingRegs } = useRegistrosByAluno(id);
  const deleteRegistro = useDeleteRegistro();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (loadingAluno) return <div className="flex justify-center py-24"><Loader2 className="size-8 text-gold animate-spin" /></div>;
  if (!aluno) return <Navigate to="/alunos" />;

  const fop = regs.filter((r) => r.tipo === "FO+").length;
  const fon = regs.filter((r) => r.tipo === "FO-").length;
  const pts = fop - fon;

  let acc = 0;
  const evolucao = [...regs].reverse().map((r) => {
    acc += r.tipo === "FO+" ? 1 : -1;
    return { data: r.data, saldo: acc };
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-command overflow-hidden">
        <div className="h-20 bg-gradient-command pattern-camo" />
        <CardContent className="-mt-10 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="size-20 rounded bg-gradient-gold border-4 border-background grid place-items-center font-stencil text-2xl font-bold text-gold-foreground shadow-gold">
              {aluno.nome.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="font-stencil text-xs uppercase tracking-widest text-gold">Nº {aluno.numeroGuerra}</div>
              <h1 className="text-3xl font-stencil font-bold mt-1">{aluno.nome}</h1>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {aluno.dataNascimento && <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{aluno.dataNascimento}</span>}
                {aluno.contato && <span className="inline-flex items-center gap-1"><Phone className="size-3" />{aluno.contato}</span>}
                <Badge variant="outline" className="text-[10px]">{aluno.situacao}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Saldo</div>
              <div className={`text-4xl font-stencil font-bold ${pts >= 0 ? "text-gold" : "text-destructive"}`}>
                {pts > 0 ? "+" : ""}{pts}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={ShieldCheck} label="FO+"       value={fop}         tone="success" />
        <StatCard icon={ShieldAlert} label="FO-"       value={fon}         tone="destructive" />
        <StatCard icon={Award}       label="Registros" value={regs.length} tone="gold" />
      </div>

      {evolucao.length > 1 && (
        <Card className="shadow-command">
          <CardHeader><CardTitle className="font-stencil tracking-wider">Evolução do Saldo</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucao}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="data" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
                  <Line type="monotone" dataKey="saldo" stroke="var(--gold)" strokeWidth={2} dot={{ fill: "var(--gold)", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-command">
        <CardHeader><CardTitle className="font-stencil tracking-wider">Histórico</CardTitle></CardHeader>
        <CardContent className="divide-y divide-border">
          {loadingRegs ? (
            <div className="flex justify-center py-8"><Loader2 className="size-6 text-gold animate-spin" /></div>
          ) : regs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nenhum registro ainda.</p>
          ) : regs.map((r) => {
            const pos = r.tipo === "FO+";
            return (
              <div key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className={`size-8 rounded grid place-items-center shrink-0 mt-0.5 ${pos ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                  {pos ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${pos ? "border-success/50 text-success" : "border-destructive/50 text-destructive"}`}>{r.tipo}</Badge>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{r.data} · {r.horario} · {r.responsavel}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.descricao}</p>
                </div>
                <button onClick={() => setDeletingId(r.id)} className="shrink-0 p-1.5 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-stencil">Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deletingId) deleteRegistro.mutate(deletingId, { onSuccess: () => { setDeletingId(null); toast.success("Removido"); } }); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tone: "success" | "destructive" | "gold" }) {
  const c = { success: "text-success", destructive: "text-destructive", gold: "text-gold" }[tone];
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
