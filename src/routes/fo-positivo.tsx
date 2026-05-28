import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  alunoPorId,
  alunos,
  CATEGORIAS_POSITIVAS,
  registros,
} from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/fo-positivo")({
  head: () => ({ meta: [{ title: "FO+ — CFC 2026" }] }),
  component: () => (
    <RequireAuth>
      <FoPositivo />
    </RequireAuth>
  ),
});

function FoPositivo() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const [alunoId, setAlunoId] = useState(alunos[0].id);
  const [categoria, setCategoria] = useState(CATEGORIAS_POSITIVAS[0]);
  const [descricao, setDescricao] = useState("");
  const [pontos, setPontos] = useState(5);

  const lista = registros
    .filter((r) => r.tipo === "FO+")
    .sort((a, b) => (a.data < b.data ? 1 : -1));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    registros.push({
      id: "r" + (registros.length + 1),
      alunoId,
      tipo: "FO+",
      data: now.toISOString().slice(0, 10),
      horario: now.toTimeString().slice(0, 5),
      categoria,
      descricao,
      responsavel: user?.nome ?? "—",
      pontuacao: pontos,
    });
    toast.success("FO+ registrado", { description: `+${pontos} pts atribuídos.` });
    setDescricao("");
    setOpen(false);
    forceUpdate((x) => x + 1);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-stencil text-xs uppercase tracking-widest text-success">
            Fato Observado Positivo
          </div>
          <h1 className="text-3xl font-stencil font-bold mt-1 flex items-center gap-3">
            <ShieldCheck className="size-7 text-success" /> FO+
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lista.length} registros — reconhecimentos meritórios
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold text-gold-foreground font-stencil tracking-widest shadow-gold hover:opacity-90">
              <Plus className="size-4 mr-1" /> Novo FO+
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-stencil tracking-wider">Registrar FO+</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-stencil text-xs">Aluno</Label>
                <Select value={alunoId} onValueChange={setAlunoId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {alunos.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        Nº {a.numeroGuerra} — {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-stencil text-xs">Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_POSITIVAS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-stencil text-xs">Pontuação</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={pontos}
                  onChange={(e) => setPontos(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-stencil text-xs">Descrição</Label>
                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  required
                  placeholder="Descreva o fato observado…"
                />
              </div>
              <Button type="submit" className="w-full bg-success text-success-foreground hover:opacity-90 font-stencil tracking-widest">
                Registrar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-3">
        {lista.map((r) => {
          const a = alunoPorId(r.alunoId);
          return (
            <Card key={r.id} className="shadow-command border-l-4 border-l-success">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{a?.nome}</span>
                      <Badge variant="outline" className="text-[10px]">Nº {a?.numeroGuerra}</Badge>
                      <Badge className="text-[10px] bg-success/20 text-success border-success/40">{r.categoria}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{r.descricao}</p>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-2">
                      {r.data} · {r.horario} · por {r.responsavel}
                    </div>
                  </div>
                  <div className="text-2xl font-stencil font-bold text-success">+{r.pontuacao}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
