import { createFileRoute } from "@tanstack/react-router";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { alunos, registros, totaisPorPelotao } from "@/lib/mock-data";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — CFC 2026" }] }),
  component: () => (
    <RequireAuth>
      <Relatorios />
    </RequireAuth>
  ),
});

function Relatorios() {
  const exportar = (formato: string) =>
    toast.info(`Exportação ${formato}`, {
      description: "Será habilitada com o Lovable Cloud e geração no servidor.",
    });

  const fop = registros.filter((r) => r.tipo === "FO+").length;
  const fon = registros.filter((r) => r.tipo === "FO-").length;
  const porPel = totaisPorPelotao();

  return (
    <div className="space-y-6">
      <header>
        <div className="font-stencil text-xs uppercase tracking-widest text-gold">
          Documentação
        </div>
        <h1 className="text-3xl font-stencil font-bold mt-1">Relatórios</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RelCard
          icon={FileText}
          title="Relatório Individual"
          desc="Histórico completo de FO+/FO- de um aluno."
          onExport={() => exportar("PDF Individual")}
        />
        <RelCard
          icon={FileText}
          title="Relatório da Turma"
          desc="Consolidado por pelotão com gráficos."
          onExport={() => exportar("PDF Turma")}
        />
        <RelCard
          icon={FileText}
          title="Relatório Disciplinar"
          desc="Foco em ocorrências FO- e gravidades."
          onExport={() => exportar("PDF Disciplinar")}
        />
      </div>

      <Card className="shadow-command">
        <CardHeader>
          <CardTitle className="font-stencil tracking-wider">Resumo Geral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Alunos" value={alunos.length} />
            <Stat label="FO+" value={fop} tone="success" />
            <Stat label="FO-" value={fon} tone="destructive" />
            <Stat label="Registros" value={registros.length} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                  <th className="py-2">Pelotão</th>
                  <th className="py-2">FO+</th>
                  <th className="py-2">FO-</th>
                  <th className="py-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {porPel.map((p) => (
                  <tr key={p.pelotao} className="border-b border-border/60">
                    <td className="py-3 font-semibold">{p.pelotao}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="border-success/50 text-success">{p.fop}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className="border-destructive/50 text-destructive">{p.fon}</Badge>
                    </td>
                    <td className="py-3 text-right font-stencil font-bold text-gold">
                      {p.fop - p.fon > 0 ? "+" : ""}
                      {p.fop - p.fon}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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

function Stat({
  label,
  value,
  tone,
}: { label: string; value: number; tone?: "success" | "destructive" }) {
  const c =
    tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded border border-border bg-accent/30 p-4">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-stencil font-bold ${c}`}>{value}</div>
    </div>
  );
}

function RelCard({
  icon: Icon,
  title,
  desc,
  onExport,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  onExport: () => void;
}) {
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
