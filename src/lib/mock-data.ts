export type Patente = "Admin" | "Instrutor" | "Monitor" | "Aluno";

export interface Aluno {
  id: string;
  nome: string;
  numeroGuerra: string;
  pelotao: string;
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
  categoria: string;
  descricao: string;
  responsavel: string;
  pontuacao: number;
  gravidade?: "Leve" | "Média" | "Grave";
}

export const CATEGORIAS_POSITIVAS = [
  "Liderança",
  "Disciplina",
  "Camaradagem",
  "Destaque físico",
  "Destaque intelectual",
  "Espírito militar",
];

export const CATEGORIAS_NEGATIVAS = [
  "Atraso",
  "Falta disciplinar",
  "Uniforme incorreto",
  "Baixo rendimento",
  "Falta de material",
  "Desrespeito",
];

export const PELOTOES = ["1º Pelotão", "2º Pelotão", "3º Pelotão", "4º Pelotão"];

export const alunos: Aluno[] = [
  { id: "1", nome: "Silva, J.P.", numeroGuerra: "001", pelotao: "1º Pelotão", dataNascimento: "2002-03-14", contato: "(21) 99999-0001", situacao: "Ativo" },
  { id: "2", nome: "Oliveira, M.A.", numeroGuerra: "002", pelotao: "1º Pelotão", dataNascimento: "2001-07-22", contato: "(21) 99999-0002", situacao: "Ativo" },
  { id: "3", nome: "Santos, R.L.", numeroGuerra: "003", pelotao: "2º Pelotão", dataNascimento: "2003-01-09", contato: "(21) 99999-0003", situacao: "Ativo" },
  { id: "4", nome: "Pereira, C.E.", numeroGuerra: "004", pelotao: "2º Pelotão", dataNascimento: "2002-11-30", contato: "(21) 99999-0004", situacao: "Ativo" },
  { id: "5", nome: "Almeida, F.G.", numeroGuerra: "005", pelotao: "3º Pelotão", dataNascimento: "2001-05-18", contato: "(21) 99999-0005", situacao: "Ativo" },
  { id: "6", nome: "Costa, B.H.", numeroGuerra: "006", pelotao: "3º Pelotão", dataNascimento: "2002-09-02", contato: "(21) 99999-0006", situacao: "Ativo" },
  { id: "7", nome: "Lima, D.R.", numeroGuerra: "007", pelotao: "4º Pelotão", dataNascimento: "2003-02-25", contato: "(21) 99999-0007", situacao: "Ativo" },
  { id: "8", nome: "Souza, V.M.", numeroGuerra: "008", pelotao: "4º Pelotão", dataNascimento: "2002-06-11", contato: "(21) 99999-0008", situacao: "Ativo" },
];

export const registros: Registro[] = [
  { id: "r1", alunoId: "1", tipo: "FO+", data: "2026-05-27", horario: "08:30", categoria: "Liderança", descricao: "Conduziu pelotão em instrução de O&C com excelência.", responsavel: "Cap. Andrade", pontuacao: 10 },
  { id: "r2", alunoId: "2", tipo: "FO+", data: "2026-05-27", horario: "10:15", categoria: "Destaque físico", descricao: "Primeiro lugar no TAF mensal.", responsavel: "Ten. Ribeiro", pontuacao: 8 },
  { id: "r3", alunoId: "3", tipo: "FO-", data: "2026-05-26", horario: "07:05", categoria: "Atraso", descricao: "Apresentou-se 5 minutos após a formatura.", responsavel: "Sgt. Moura", pontuacao: -3, gravidade: "Leve" },
  { id: "r4", alunoId: "1", tipo: "FO+", data: "2026-05-25", horario: "14:20", categoria: "Camaradagem", descricao: "Auxiliou companheiro durante marcha.", responsavel: "Cap. Andrade", pontuacao: 6 },
  { id: "r5", alunoId: "4", tipo: "FO-", data: "2026-05-25", horario: "09:00", categoria: "Uniforme incorreto", descricao: "Coturno sem polimento adequado.", responsavel: "Sgt. Moura", pontuacao: -2, gravidade: "Leve" },
  { id: "r6", alunoId: "5", tipo: "FO+", data: "2026-05-24", horario: "16:45", categoria: "Espírito militar", descricao: "Voluntariou-se para serviço extra.", responsavel: "Ten. Ribeiro", pontuacao: 7 },
  { id: "r7", alunoId: "6", tipo: "FO-", data: "2026-05-24", horario: "11:30", categoria: "Falta disciplinar", descricao: "Conversa em formatura.", responsavel: "Sgt. Moura", pontuacao: -5, gravidade: "Média" },
  { id: "r8", alunoId: "7", tipo: "FO+", data: "2026-05-23", horario: "08:00", categoria: "Disciplina", descricao: "Apresentação impecável durante a semana.", responsavel: "Cap. Andrade", pontuacao: 5 },
  { id: "r9", alunoId: "8", tipo: "FO-", data: "2026-05-22", horario: "13:10", categoria: "Baixo rendimento", descricao: "Resultado insuficiente em avaliação teórica.", responsavel: "Ten. Ribeiro", pontuacao: -4, gravidade: "Média" },
  { id: "r10", alunoId: "2", tipo: "FO+", data: "2026-05-22", horario: "10:00", categoria: "Destaque intelectual", descricao: "Melhor nota em legislação militar.", responsavel: "Cap. Andrade", pontuacao: 9 },
  { id: "r11", alunoId: "3", tipo: "FO+", data: "2026-05-21", horario: "15:30", categoria: "Camaradagem", descricao: "Ajudou na organização do alojamento.", responsavel: "Sgt. Moura", pontuacao: 4 },
  { id: "r12", alunoId: "5", tipo: "FO-", data: "2026-05-20", horario: "07:00", categoria: "Falta de material", descricao: "Esqueceu caderneta de instrução.", responsavel: "Sgt. Moura", pontuacao: -2, gravidade: "Leve" },
];

export function pontuacaoAluno(alunoId: string) {
  return registros
    .filter((r) => r.alunoId === alunoId)
    .reduce((acc, r) => acc + r.pontuacao, 0);
}

export function rankingAlunos() {
  return [...alunos]
    .map((a) => ({
      ...a,
      pontuacao: pontuacaoAluno(a.id),
      fop: registros.filter((r) => r.alunoId === a.id && r.tipo === "FO+").length,
      fon: registros.filter((r) => r.alunoId === a.id && r.tipo === "FO-").length,
    }))
    .sort((a, b) => b.pontuacao - a.pontuacao);
}

export function registrosDoAluno(alunoId: string) {
  return registros
    .filter((r) => r.alunoId === alunoId)
    .sort((a, b) => (a.data < b.data ? 1 : -1));
}

export function ultimosRegistros(n = 6) {
  return [...registros]
    .sort((a, b) => (a.data + a.horario < b.data + b.horario ? 1 : -1))
    .slice(0, n);
}

export function alunoPorId(id: string) {
  return alunos.find((a) => a.id === id);
}

export function totaisPorPelotao() {
  return PELOTOES.map((p) => {
    const ids = alunos.filter((a) => a.pelotao === p).map((a) => a.id);
    const fop = registros.filter((r) => ids.includes(r.alunoId) && r.tipo === "FO+").length;
    const fon = registros.filter((r) => ids.includes(r.alunoId) && r.tipo === "FO-").length;
    return { pelotao: p, fop, fon };
  });
}
