-- ============================================================
-- CFC 2026 — Migration inicial
-- Execute no Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Tabelas

CREATE TABLE IF NOT EXISTS alunos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           TEXT NOT NULL,
  numero_guerra  TEXT NOT NULL UNIQUE,
  data_nascimento DATE,
  contato        TEXT,
  situacao       TEXT NOT NULL DEFAULT 'Ativo'
                   CHECK (situacao IN ('Ativo', 'Afastado', 'Desligado')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registros (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id     UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL CHECK (tipo IN ('FO+', 'FO-')),
  data         DATE NOT NULL DEFAULT CURRENT_DATE,
  horario      TEXT NOT NULL,
  descricao    TEXT NOT NULL,
  responsavel  TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS instructor_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT NOT NULL,
  usuario    TEXT NOT NULL UNIQUE,
  email      TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'denied')),
  token      UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Desabilita RLS (sistema fechado com autenticação própria)

ALTER TABLE alunos              DISABLE ROW LEVEL SECURITY;
ALTER TABLE registros           DISABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_requests DISABLE ROW LEVEL SECURITY;

-- 3. Seed: alunos iniciais
-- Substitua pelos dados reais da sua turma.

INSERT INTO alunos (nome, numero_guerra, data_nascimento, contato, situacao) VALUES
  ('Silva, J.P.',    '001', '2002-03-14', '(95) 99001-0001', 'Ativo'),
  ('Oliveira, M.A.', '002', '2001-07-22', '(95) 99001-0002', 'Ativo'),
  ('Santos, R.L.',   '003', '2003-01-09', '(95) 99001-0003', 'Ativo'),
  ('Pereira, C.E.',  '004', '2002-11-30', '(95) 99001-0004', 'Ativo'),
  ('Almeida, F.G.',  '005', '2001-05-18', '(95) 99001-0005', 'Ativo'),
  ('Costa, B.H.',    '006', '2002-09-02', '(95) 99001-0006', 'Ativo'),
  ('Lima, D.R.',     '007', '2003-02-25', '(95) 99001-0007', 'Ativo'),
  ('Souza, V.M.',    '008', '2002-06-11', '(95) 99001-0008', 'Ativo')
ON CONFLICT (numero_guerra) DO NOTHING;
