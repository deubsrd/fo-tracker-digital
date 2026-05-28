// ── Types (mantidos para compatibilidade TypeScript) ──────────────────────────
// Os dados reais agora vêm do Supabase via src/lib/db.ts

export interface Aluno {
  id: string;
  nome: string;
  numeroGuerra: string;
  dataNascimento: string;
  contato: string;
  situacao: "Ativo" | "Afastado" | "Desligado";
  foto?: string;
}

export interface Registro {
  id: string;
  alunoId: string;
  tipo: "FO+" | "FO-";
  data: string;
  horario: string;
  descricao: string;
  responsavel: string;
}
