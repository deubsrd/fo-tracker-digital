import { createFileRoute } from "@tanstack/react-router";
import { FileDown, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlunos, useRanking, useRegistros } from "@/lib/db";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — CFC 2026" }] }),
  component: () => <RequireAuth><Relatorios /></RequireAuth>,
});

function Relatorios() {
  const exportar = (f: string) => toast.info(`Exportação ${f}`, { description: "Em breve com geração PDF real." });
  const { data: alunos   = [] }         = useAlunos();
  const { data: ranking  = [], isLoading } = useRanking();
  const { data: todosFop = [] }         = useRegistros("FO+");
  const { data: todosFon = [] }         = useRegistros("FO-");

  return (
    <div className="space-y-6">
      <header>
        <div className="font-stencil text-xs uppercase tracking-widest text-gold">Documentação</div>
        <h1 className="text-3xl font-stencil font-bold mt-1">Relatórios</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <RelCard icon={FileText} title="Individual"   desc="Histórico completo de um aluno."   onExport={() => exportar("PDF Individual")} />
        <RelCard icon={FileText} title="Turma"        desc="Consolidado geral — CFC 2026."      onExport={() => exportar("PDF Turma")} />
        <RelCard icon={FileText} title="Disciplinar"  desc="Foco em ocorrências FO-."           onExport={() => exportar("PDF Disciplinar")} />
      </div>

      <Card className="shadow-command">
        <CardHeader><CardTitle className="font-stencil tracking-wider">Resumo da Turma</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Alunos"    value={alunos.length} />
            <Stat label="FO+"       value={todosFop.length} tone="success" />
            <Stat label="FO-"       value={todosFon.length} tone="destructive" />
            <Stat label="Registros" value={todosFop.length + todosFon.length} />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="size-6 text-gold animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="py-2 pr-4">Pos.</th>
                    <th className="py-2 pr-4">Aluno</th>
                    <th className="py-2 pr-4">FO+</th>
                    <th className="py-2 pr-4">FO-</th>
                    <th className="py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((a, i) => (
                    <tr key={a.id} className="border-b border-border/60">
                      <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 pr-4 font-semibold">{a.nome} <span className="text-[11px] text-muted-foreground font-normal">Nº {a.numeroGuerra}</span></td>
                      <td className="py-2 pr-4"><Badge variant="outline" className="border-success/50 text-success">{a.fop}</Badge></td>
                      <td className="py-2 pr-4"><Badge variant="outline" className="border-destructive/50 text-destructive">{a.fon}</Badge></td>
                      <td className="py-2 text-right font-stencil font-bold text-gold">{a.pontuacao > 0 ? "+" : ""}{a.pontuacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={() => exportar("PDF")} className="bg-gradient-gold text-gold-foreground font-stencil tracking-widest hover:opacity-90">
              <FileDown className="size-4 mr-2" /> Exportar PDF
            </Button>
            <Button onClick={() => exportar("Excel")} variant="outline" className="font-stencil tracking-widest">
              <FileSpreadsheet className="size-4 mr-2" /> Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "destructive" }) {
  const c = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded border border-border bg-accent/30 p-4">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-stencil font-bold ${c}`}>{value}</div>
    </div>
  );
}

function RelCard({ icon: Icon, title, desc, onExport }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; onExport: () => void }) {
  return (
    <Card className="shadow-command">
      <CardContent className="pt-6 space-y-3">
        <Icon className="size-6 text-gold" />
        <div className="font-stencil tracking-wider font-semibold">{title}</div>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <Button onClick={onExport} variant="outline" size="sm" className="font-stencil tracking-widest w-full">
          <FileDown className="size-3.5 mr-2" /> Gerar
        </Button>
      </CardContent>
    </Card>
  );
}
