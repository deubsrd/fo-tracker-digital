import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Plus, Trash2, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAlunos, useAlunoPorNumero, useRegistros, useCreateRegistro, useDeleteRegistro } from "@/lib/db";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/fo-positivo")({
  head: () => ({ meta: [{ title: "FO+ — CFC 2026" }] }),
  component: () => <RequireAuth><FoPositivo /></RequireAuth>,
});

function FoPositivo() {
  const { user } = useAuth();
  const { data: alunos = [] } = useAlunos();
  const { data: lista = [], isLoading } = useRegistros("FO+");
  const createRegistro = useCreateRegistro();
  const deleteRegistro = useDeleteRegistro();

  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [numero, setNumero] = useState("");
  const [descricao, setDescricao] = useState("");

  const alunoSelecionado = useAlunoPorNumero(alunos, numero);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoSelecionado || !descricao.trim()) return;
    const now = new Date();
    createRegistro.mutate(
      { aluno_id: alunoSelecionado.id, tipo: "FO+", data: now.toISOString().slice(0, 10), horario: now.toTimeString().slice(0, 5), descricao: descricao.trim(), responsavel: user?.nome ?? "—" },
      {
        onSuccess: () => { toast.success(`FO+ registrado para ${alunoSelecionado.nome}`); setNumero(""); setDescricao(""); setOpen(false); },
        onError: () => toast.error("Erro ao registrar FO+"),
      }
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-stencil text-xs uppercase tracking-widest text-success">Fato Observado Positivo</div>
          <h1 className="text-3xl font-stencil font-bold mt-1 flex items-center gap-3">
            <ShieldCheck className="size-7 text-success" /> FO+
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{lista.length} registros positivos</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold text-gold-foreground font-stencil tracking-widest shadow-gold hover:opacity-90">
              <Plus className="size-4 mr-1" /> Registrar FO+
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-stencil tracking-wider">Novo FO+</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label className="font-stencil text-xs">Número de Guerra</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="001" className="pl-9 pr-9 h-11" maxLength={6} required />
                  {numero.trim() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {alunoSelecionado ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />}
                    </div>
                  )}
                </div>
                {alunoSelecionado ? (
                  <p className="text-xs text-success font-semibold">{alunoSelecionado.nome}</p>
                ) : numero.trim() ? (
                  <p className="text-xs text-destructive">Número não encontrado</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label className="font-stencil text-xs">Motivo</Label>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} required placeholder="Descreva o fato observado…" />
              </div>
              <Button type="submit" disabled={!alunoSelecionado || createRegistro.isPending} className="w-full bg-success text-success-foreground hover:opacity-90 font-stencil tracking-widest disabled:opacity-40">
                {createRegistro.isPending ? <><Loader2 className="size-4 mr-2 animate-spin" /> Registrando…</> : "Lançar FO+"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-8 text-gold animate-spin" /></div>
      ) : lista.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">Nenhum FO+ registrado ainda.</div>
      ) : (
        <div className="grid gap-3">
          {lista.map((r) => {
            const a = alunos.find((x) => x.id === r.alunoId);
            return (
              <Card key={r.id} className="shadow-command border-l-4 border-l-success">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <ShieldCheck className="size-4 text-success shrink-0" />
                        <span className="font-semibold">{a?.nome ?? "—"}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Nº {a?.numeroGuerra}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.descricao}</p>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-2">{r.data} · {r.horario} · por {r.responsavel}</div>
                    </div>
                    <button onClick={() => setDeletingId(r.id)} className="shrink-0 p-2 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors" aria-label="Excluir">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-stencil">Excluir FO+?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deletingId) deleteRegistro.mutate(deletingId, { onSuccess: () => { setDeletingId(null); toast.success("Registro removido"); } }); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
