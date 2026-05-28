// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Seed data ────────────────────────────────────────────────────────────────

export const alunos: Aluno[] = [
  { id: "1", nome: "Silva, J.P.",     numeroGuerra: "001", dataNascimento: "2002-03-14", contato: "(21) 99999-0001", situacao: "Ativo" },
  { id: "2", nome: "Oliveira, M.A.", numeroGuerra: "002", dataNascimento: "2001-07-22", contato: "(21) 99999-0002", situacao: "Ativo" },
  { id: "3", nome: "Santos, R.L.",   numeroGuerra: "003", dataNascimento: "2003-01-09", contato: "(21) 99999-0003", situacao: "Ativo" },
  { id: "4", nome: "Pereira, C.E.", numeroGuerra: "004", dataNascimento: "2002-11-30", contato: "(21) 99999-0004", situacao: "Ativo" },
  { id: "5", nome: "Almeida, F.G.", numeroGuerra: "005", dataNascimento: "2001-05-18", contato: "(21) 99999-0005", situacao: "Ativo" },
  { id: "6", nome: "Costa, B.H.",   numeroGuerra: "006", dataNascimento: "2002-09-02", contato: "(21) 99999-0006", situacao: "Ativo" },
  { id: "7", nome: "Lima, D.R.",    numeroGuerra: "007", dataNascimento: "2003-02-25", contato: "(21) 99999-0007", situacao: "Ativo" },
  { id: "8", nome: "Souza, V.M.",   numeroGuerra: "008", dataNascimento: "2002-06-11", contato: "(21) 99999-0008", situacao: "Ativo" },
];

export const registros: Registro[] = [
  { id: "r1",  alunoId: "1", tipo: "FO+", data: "2026-05-27", horario: "08:30", descricao: "Conduziu instrução de O&C com excelência.", responsavel: "Cap. Andrade" },
  { id: "r2",  alunoId: "2", tipo: "FO+", data: "2026-05-27", horario: "10:15", descricao: "Primeiro lugar no TAF mensal.", responsavel: "Ten. Ribeiro" },
  { id: "r3",  alunoId: "3", tipo: "FO-", data: "2026-05-26", horario: "07:05", descricao: "Apresentou-se 5 minutos após a formatura.", responsavel: "Sgt. Moura" },
  { id: "r4",  alunoId: "1", tipo: "FO+", data: "2026-05-25", horario: "14:20", descricao: "Auxiliou companheiro durante marcha.", responsavel: "Cap. Andrade" },
  { id: "r5",  alunoId: "4", tipo: "FO-", data: "2026-05-25", horario: "09:00", descricao: "Coturno sem polimento adequado.", responsavel: "Sgt. Moura" },
  { id: "r6",  alunoId: "5", tipo: "FO+", data: "2026-05-24", horario: "16:45", descricao: "Voluntariou-se para serviço extra.", responsavel: "Ten. Ribeiro" },
  { id: "r7",  alunoId: "6", tipo: "FO-", data: "2026-05-24", horario: "11:30", descricao: "Conversa em formatura.", responsavel: "Sgt. Moura" },
  { id: "r8",  alunoId: "7", tipo: "FO+", data: "2026-05-23", horario: "08:00", descricao: "Apresentação impecável durante a semana.", responsavel: "Cap. Andrade" },
  { id: "r9",  alunoId: "8", tipo: "FO-", data: "2026-05-22", horario: "13:10", descricao: "Resultado insuficiente em avaliação teórica.", responsavel: "Ten. Ribeiro" },
  { id: "r10", alunoId: "2", tipo: "FO+", data: "2026-05-22", horario: "10:00", descricao: "Melhor nota em legislação militar.", responsavel: "Cap. Andrade" },
  { id: "r11", alunoId: "3", tipo: "FO+", data: "2026-05-21", horario: "15:30", descricao: "Ajudou na organização do alojamento.", responsavel: "Sgt. Moura" },
  { id: "r12", alunoId: "5", tipo: "FO-", data: "2026-05-20", horario: "07:00", descricao: "Esqueceu caderneta de instrução.", responsavel: "Sgt. Moura" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function alunoPorId(id: string) {
  return alunos.find((a) => a.id === id);
}

export function alunoPorNumero(num: string): Aluno | undefined {
  const padded = num.trim().padStart(3, "0");
  return alunos.find((a) => a.numeroGuerra === padded || a.numeroGuerra === num.trim());
}

export function pontuacaoAluno(alunoId: string) {
  const fop = registros.filter((r) => r.alunoId === alunoId && r.tipo === "FO+").length;
  const fon = registros.filter((r) => r.alunoId === alunoId && r.tipo === "FO-").length;
  return fop - fon;
}

export function rankingAlunos() {
  return [...alunos]
    .map((a) => ({
      ...a,
      fop: registros.filter((r) => r.alunoId === a.id && r.tipo === "FO+").length,
      fon: registros.filter((r) => r.alunoId === a.id && r.tipo === "FO-").length,
      pontuacao: pontuacaoAluno(a.id),
    }))
    .sort((a, b) => b.pontuacao - a.pontuacao);
}

export function registrosDoAluno(alunoId: string) {
  return registros
    .filter((r) => r.alunoId === alunoId)
    .sort((a, b) => (a.data + a.horario < b.data + b.horario ? 1 : -1));
}

export function ultimosRegistros(n = 8) {
  return [...registros]
    .sort((a, b) => (a.data + a.horario < b.data + b.horario ? 1 : -1))
    .slice(0, n);
}

export function deleteRegistro(id: string) {
  const idx = registros.findIndex((r) => r.id === id);
  if (idx !== -1) registros.splice(idx, 1);
}
