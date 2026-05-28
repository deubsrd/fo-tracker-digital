import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent } from "@/components/ui/card";
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
  CATEGORIAS_NEGATIVAS,
  registros,
} from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/fo-negativo")({
  head: () => ({ meta: [{ title: "FO- — CFC 2026" }] }),
  component: () => (
    <RequireAuth>
      <FoNegativo />
    </RequireAuth>
  ),
});

type Gravidade = "Leve" | "Média" | "Grave";
const PONTOS_GRAVIDADE: Record<Gravidade, number> = { Leve: 2, Média: 5, Grave: 10 };

function FoNegativo() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [_, force] = useState(0);

  const [alunoId, setAlunoId] = useState(alunos[0].id);
  const [categoria, setCategoria] = useState(CATEGORIAS_NEGATIVAS[0]);
  const [descricao, setDescricao] = useState("");
  const [gravidade, setGravidade] = useState<Gravidade>("Leve");

  const lista = registros
    .filter((r) => r.tipo === "FO-")
    .sort((a, b) => (a.data < b.data ? 1 : -1));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    registros.push({
      id: "r" + (registros.length + 1),
      alunoId,
      tipo: "FO-",
      data: now.toISOString().slice(0, 10),
      horario: now.toTimeString().slice(0, 5),
      categoria,
      descricao,
      responsavel: user?.nome ?? "—",
      pontuacao: -PONTOS_GRAVIDADE[gravidade],
      gravidade,
    });
    toast.error("FO- registrado", { description: `${gravidade} · -${PONTOS_GRAVIDADE[gravidade]} pts.` });
    setDescricao("");
    setOpen(false);
    force((x) => x + 1);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-stencil text-xs uppercase tracking-widest text-destructive">
            Fato Observado Negativo
          </div>
          <h1 className="text-3xl font-stencil font-bold mt-1 flex items-center gap-3">
            <ShieldAlert className="size-7 text-destructive" /> FO-
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lista.length} ocorrências disciplinares
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="font-stencil tracking-widest">
              <Plus className="size-4 mr-1" /> Novo FO-
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-stencil tracking-wider">Registrar FO-</DialogTitle>
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
                    {CATEGORIAS_NEGATIVAS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-stencil text-xs">Gravidade</Label>
                <Select value={gravidade} onValueChange={(v) => setGravidade(v as Gravidade)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Leve">Leve (-2)</SelectItem>
                    <SelectItem value="Média">Média (-5)</SelectItem>
                    <SelectItem value="Grave">Grave (-10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-stencil text-xs">Descrição</Label>
                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  required
                  placeholder="Descreva a ocorrência…"
                />
              </div>
              <Button type="submit" variant="destructive" className="w-full font-stencil tracking-widest">
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
            <Card key={r.id} className="shadow-command border-l-4 border-l-destructive">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{a?.nome}</span>
                      <Badge variant="outline" className="text-[10px]">Nº {a?.numeroGuerra}</Badge>
                      <Badge className="text-[10px] bg-destructive/20 text-destructive border-destructive/40">{r.categoria}</Badge>
                      {r.gravidade && (
                        <Badge variant="outline" className="text-[10px] border-gold text-gold">
                          {r.gravidade}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{r.descricao}</p>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-2">
                      {r.data} · {r.horario} · por {r.responsavel}
                    </div>
                  </div>
                  <div className="text-2xl font-stencil font-bold text-destructive">{r.pontuacao}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
