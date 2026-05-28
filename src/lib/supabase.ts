import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.warn(
    "⚠️  Supabase não configurado.\n" +
    "Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente."
  );
}

export const supabase = createClient(url ?? "", key ?? "");

// ── Row types (snake_case, espelhando o banco) ────────────────────────────────

export interface AlunoRow {
  id: string;
  nome: string;
  numero_guerra: string;
  data_nascimento: string | null;
  contato: string | null;
  situacao: "Ativo" | "Afastado" | "Desligado";
  created_at: string;
}

export interface RegistroRow {
  id: string;
  aluno_id: string;
  tipo: "FO+" | "FO-";
  data: string;
  horario: string;
  descricao: string;
  responsavel: string;
  created_at: string;
}

export interface InstructorRequestRow {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  status: "pending" | "approved" | "denied";
  token: string;
  created_at: string;
}
