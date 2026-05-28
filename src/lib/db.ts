import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "./supabase";
import type { Aluno, Registro } from "./mock-data";

// ── Mappers snake_case → camelCase ────────────────────────────────────────────

function mapAluno(row: any): Aluno {
  return {
    id: row.id,
    nome: row.nome,
    numeroGuerra: row.numero_guerra,
    dataNascimento: row.data_nascimento ?? "",
    contato: row.contato ?? "",
    situacao: row.situacao,
  };
}

function mapRegistro(row: any): Registro {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    tipo: row.tipo,
    data: row.data,
    horario: row.horario,
    descricao: row.descricao,
    responsavel: row.responsavel,
  };
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const QK = {
  alunos:            ["alunos"]                              as const,
  aluno:    (id: string)          => ["alunos", id]          as const,
  registros: (tipo?: string)      => ["registros", tipo ?? "all"] as const,
  byAluno:  (id: string)          => ["registros", "aluno", id]   as const,
  ranking:           ["ranking"]                             as const,
  ultimos:  (n: number)           => ["registros", "ultimos", n]  as const,
};

// ── Alunos ────────────────────────────────────────────────────────────────────

export function useAlunos() {
  return useQuery({
    queryKey: QK.alunos,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .order("numero_guerra");
      if (error) throw error;
      return (data ?? []).map(mapAluno);
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

export function useAluno(id: string) {
  return useQuery({
    queryKey: QK.aluno(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return mapAluno(data);
    },
    enabled: !!id,
  });
}

/** Lookup por número de guerra a partir dos dados já carregados no cache. */
export function useAlunoPorNumero(alunos: Aluno[], numero: string): Aluno | undefined {
  return useMemo(() => {
    if (!numero.trim()) return undefined;
    const padded = numero.trim().padStart(3, "0");
    return alunos.find(
      (a) => a.numeroGuerra === padded || a.numeroGuerra === numero.trim()
    );
  }, [alunos, numero]);
}

// ── Registros ─────────────────────────────────────────────────────────────────

export function useRegistros(tipo?: "FO+" | "FO-") {
  return useQuery({
    queryKey: QK.registros(tipo),
    queryFn: async () => {
      let q = supabase
        .from("registros")
        .select("*")
        .order("data", { ascending: false })
        .order("horario", { ascending: false });
      if (tipo) q = q.eq("tipo", tipo);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(mapRegistro);
    },
  });
}

export function useRegistrosByAluno(alunoId: string) {
  return useQuery({
    queryKey: QK.byAluno(alunoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("aluno_id", alunoId)
        .order("data", { ascending: false })
        .order("horario", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRegistro);
    },
    enabled: !!alunoId,
  });
}

export function useUltimosRegistros(n = 6) {
  return useQuery({
    queryKey: QK.ultimos(n),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .order("data", { ascending: false })
        .order("horario", { ascending: false })
        .limit(n);
      if (error) throw error;
      return (data ?? []).map(mapRegistro);
    },
  });
}

export function useRanking() {
  return useQuery({
    queryKey: QK.ranking,
    queryFn: async () => {
      const [{ data: alunosData, error: e1 }, { data: regsData, error: e2 }] =
        await Promise.all([
          supabase.from("alunos").select("*").order("numero_guerra"),
          supabase.from("registros").select("aluno_id, tipo"),
        ]);
      if (e1) throw e1;
      if (e2) throw e2;

      return (alunosData ?? [])
        .map((a: any) => {
          const regs = (regsData ?? []).filter((r: any) => r.aluno_id === a.id);
          const fop = regs.filter((r: any) => r.tipo === "FO+").length;
          const fon = regs.filter((r: any) => r.tipo === "FO-").length;
          return { ...mapAluno(a), fop, fon, pontuacao: fop - fon };
        })
        .sort((a: any, b: any) => b.pontuacao - a.pontuacao);
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export interface NewRegistro {
  aluno_id: string;
  tipo: "FO+" | "FO-";
  data: string;
  horario: string;
  descricao: string;
  responsavel: string;
}

export function useCreateRegistro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewRegistro) => {
      const { data, error } = await supabase
        .from("registros")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return mapRegistro(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registros"] });
      qc.invalidateQueries({ queryKey: QK.ranking });
    },
  });
}

export function useDeleteRegistro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("registros")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registros"] });
      qc.invalidateQueries({ queryKey: QK.ranking });
    },
  });
}
