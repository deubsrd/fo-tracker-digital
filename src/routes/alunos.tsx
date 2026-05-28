import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { alunos, pontuacaoAluno } from "@/lib/mock-data";

export const Route = createFileRoute("/alunos")({
  head: () => ({ meta: [{ title: "Tropa — CFC 2026" }] }),
  component: () => (
    <RequireAuth>
      <AlunosPage />
    </RequireAuth>
  ),
});

function AlunosPage() {
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => {
    const q = busca.toLowerCase();
    return alunos.filter(
      (a) =>
        a.nome.toLowerCase().includes(q) ||
        a.numeroGuerra.includes(q)
    );
  }, [busca]);

  return (
    <div className="space-y-6">
      <header>
        <div className="font-stencil text-xs uppercase tracking-widest text-gold">
          Efetivo
        </div>
        <h1 className="text-3xl font-stencil font-bold mt-1">Tropa</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {alunos.length} alunos · CFC 2026
        </p>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou número…"
          className="pl-9 h-11"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((a) => {
          const pts = pontuacaoAluno(a.id);
          return (
            <Link key={a.id} to="/perfil/$id" params={{ id: a.id }}>
              <Card className="shadow-command hover:border-gold/60 transition-colors h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded bg-gradient-command border border-border grid place-items-center font-stencil font-bold text-gold text-lg shrink-0">
                      {a.nome.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{a.nome}</div>
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        Nº {a.numeroGuerra}
                      </div>
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        {a.situacao}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      Saldo FO
                    </span>
                    <span className={`font-stencil font-bold text-lg ${pts >= 0 ? "text-success" : "text-destructive"}`}>
                      {pts > 0 ? "+" : ""}{pts}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
