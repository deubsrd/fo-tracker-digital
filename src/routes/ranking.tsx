import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Medal, Award } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PELOTOES, rankingAlunos } from "@/lib/mock-data";

export const Route = createFileRoute("/ranking")({
  head: () => ({ meta: [{ title: "Ranking — CFC 2026" }] }),
  component: () => (
    <RequireAuth>
      <RankingPage />
    </RequireAuth>
  ),
});

function RankingPage() {
  const geral = rankingAlunos();

  return (
    <div className="space-y-6">
      <header>
        <div className="font-stencil text-xs uppercase tracking-widest text-gold">
          Mérito & Disciplina
        </div>
        <h1 className="text-3xl font-stencil font-bold mt-1 flex items-center gap-3">
          <Trophy className="size-7 text-gold" /> Ranking
        </h1>
      </header>

      {/* Pódio */}
      <div className="grid gap-4 sm:grid-cols-3">
        {geral.slice(0, 3).map((a, i) => (
          <Card
            key={a.id}
            className={`shadow-command relative overflow-hidden ${
              i === 0 ? "sm:order-2 sm:-translate-y-2 border-gold" : i === 1 ? "sm:order-1" : "sm:order-3"
            }`}
          >
            {i === 0 && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-gold" />
            )}
            <CardContent className="pt-6 text-center">
              <div
                className={`mx-auto size-16 rounded grid place-items-center font-stencil text-2xl font-bold ${
                  i === 0
                    ? "bg-gradient-gold text-gold-foreground shadow-gold"
                    : i === 1
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-accent text-accent-foreground"
                }`}
              >
                {i === 0 ? <Trophy className="size-8" /> : i === 1 ? <Medal className="size-8" /> : <Award className="size-8" />}
              </div>
              <div className="mt-4 font-semibold">{a.nome}</div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Nº {a.numeroGuerra} · {a.pelotao}
              </div>
              <div className="mt-3 text-3xl font-stencil font-bold text-gold">{a.pontuacao}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">pontos</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral" className="font-stencil">Geral</TabsTrigger>
          {PELOTOES.map((p) => (
            <TabsTrigger key={p} value={p} className="font-stencil">{p}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="geral">
          <RankList lista={geral} />
        </TabsContent>
        {PELOTOES.map((p) => (
          <TabsContent key={p} value={p}>
            <RankList lista={geral.filter((a) => a.pelotao === p)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function RankList({ lista }: { lista: ReturnType<typeof rankingAlunos> }) {
  return (
    <Card className="shadow-command">
      <CardHeader>
        <CardTitle className="font-stencil tracking-wider">Classificação</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {lista.map((a, i) => (
          <Link
            key={a.id}
            to="/perfil/$id"
            params={{ id: a.id }}
            className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
          >
            <div
              className={`size-9 rounded grid place-items-center font-stencil text-sm font-bold ${
                i === 0
                  ? "bg-gradient-gold text-gold-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{a.nome}</div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Nº {a.numeroGuerra} · {a.pelotao}
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <Badge variant="outline" className="text-[10px] border-success/50 text-success">
                {a.fop} FO+
              </Badge>
              <Badge variant="outline" className="text-[10px] border-destructive/50 text-destructive">
                {a.fon} FO-
              </Badge>
            </div>
            <div className={`font-stencil text-xl font-bold ${a.pontuacao >= 0 ? "text-gold" : "text-destructive"}`}>
              {a.pontuacao > 0 ? "+" : ""}{a.pontuacao}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
