-- Complexo Safe Works — schema inicial (migração do protótipo em memória)
-- Rodar isso no SQL Editor do Supabase (Project > SQL Editor > New query).
--
-- Convenções:
--   - ids em texto (mesmo formato usado no protótipo: "t-csa", "op-...", etc.)
--     pra não precisar remapear nada que já existe.
--   - Sem RLS (Row Level Security) habilitado: todo o acesso passa pelo
--     service_role key, usado só no servidor (Server Actions/Components),
--     nunca no navegador. Isso é seguro enquanto NENHUMA chamada ao Supabase
--     acontecer em código de cliente ("use client") — só em módulos server-only.
--   - created_at/updated_at em toda tabela para auditoria básica.

create table if not exists teams (
  id text primary key,
  team_code text not null unique,
  password text not null, -- TODO (produção): hash (bcrypt/argon2), nunca texto puro
  team_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists team_profiles (
  team_id text primary key references teams(id) on delete cascade,
  photo text, -- data URI (protótipo) — TODO (produção): trocar por URL de storage real
  founded_date date,
  events_org text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists operators (
  id text primary key,
  team_id text not null references teams(id) on delete cascade,
  photo text,
  name text not null,
  tag text not null,
  start_month text not null default '', -- "AAAA-MM"
  category text not null default '',
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists operators_team_id_idx on operators(team_id);
create index if not exists operators_is_public_idx on operators(is_public);

create table if not exists equipment (
  id text primary key,
  operator_id text not null references operators(id) on delete cascade,
  photo text,
  name text not null,
  brand text not null default '',
  description text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists equipment_operator_id_idx on equipment(operator_id);

create table if not exists matches (
  id text primary key,
  date date not null,
  time text not null, -- "HH:mm"
  title text not null,
  operation_type text not null default '',
  location text not null default '',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists match_confirmations (
  match_id text not null references matches(id) on delete cascade,
  team_id text not null references teams(id) on delete cascade,
  confirmed_at timestamptz not null default now(),
  primary key (match_id, team_id)
);

create table if not exists content_items (
  id text primary key,
  date date not null,
  kind text not null check (kind in ('briefing', 'comunicado')),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists site_images (
  slot_key text primary key,
  photo text not null, -- data URI (protótipo) — TODO (produção): URL de storage real
  updated_at timestamptz not null default now()
);

create table if not exists reactions (
  operator_id text not null references operators(id) on delete cascade,
  kind text not null check (kind in ('like', 'dislike', 'bomb', 'skull')),
  count integer not null default 0,
  primary key (operator_id, kind)
);

create table if not exists comments (
  id text primary key,
  operator_id text not null references operators(id) on delete cascade,
  text text not null,
  author_name text, -- null = anônimo; só preenchido quando é o admin
  created_at timestamptz not null default now()
);
create index if not exists comments_operator_id_idx on comments(operator_id);

-- Seed: as 3 equipes de demonstração que já existiam no protótipo.
-- ON CONFLICT evita erro se você rodar este script mais de uma vez.
insert into teams (id, team_code, password, team_name) values
  ('t-csa', 'CSA', 'CSA2017*', 'Comando Sertão Airsoft'),
  ('t-dec', 'DEC', 'DEC2020*', 'Divisão Especial de Combate'),
  ('t-cans', 'CANS', 'CANS2019', 'Esquadrão Scorpio')
on conflict (id) do nothing;

-- Seed: as operações de exemplo que já existiam na agenda do protótipo.
insert into matches (id, date, time, title, operation_type, location, notes) values
  ('op-2026-09-06', '2026-09-06', '08:00', 'Operação Exemplo', 'CQB — Cerco e resgate', 'Setor 2, Complexo Safe Works', 'Chegada 30min antes para briefing e checagem de equipamento.'),
  ('op-2026-09-20', '2026-09-20', '14:00', 'Operação Exemplo 2', 'Campo aberto — Domínio de bandeira', 'Setor 1 (Trilha Norte), Complexo Safe Works', null),
  ('op-2026-10-04', '2026-10-04', '08:00', 'Operação Exemplo 3', 'Milsim — 6 horas', 'Setores 1, 2 e 3, Complexo Safe Works', 'Evento longo. Levar hidratação extra e réplica secundária, se houver.'),
  ('op-2026-10-18', '2026-10-18', '19:00', 'Operação Exemplo 4', 'Noturno — Infiltração', 'Setor 2, Complexo Safe Works', 'Uso de iluminação tática obrigatório. Regras específicas no briefing.')
on conflict (id) do nothing;

-- Seed: os briefings/comunicados de exemplo do conteúdo exclusivo.
insert into content_items (id, date, kind, title, body) values
  ('briefing-poeira-vermelha', '2026-09-25', 'briefing', 'Briefing — Operação Poeira Vermelha', 'Cenário: disputa por três pontos de controle distribuídos entre os setores 1, 2 e 3. Reabastecimento (BB e água) liberado apenas nos pontos marcados no mapa entregue na chegada. Respawn escalonado a cada 15 minutos nas primeiras duas horas, depois passa a ser por eliminação de setor. Uso de fumaça tática liberado nos pontos de controle. Equipes devem indicar um líder de esquadrão no check-in.'),
  ('comunicado-manutencao-setor-2', '2026-09-12', 'comunicado', 'Manutenção programada no Setor 2', 'O Setor 2 passará por manutenção de trincheiras e reforço de barreiras entre os dias 14 e 18/09. A operação Linha Seca (06/09) não é afetada. Times com treinos particulares agendados para essa janela devem remarcar diretamente com a administração do Complexo.'),
  ('briefing-vento-norte', '2026-09-08', 'briefing', 'Briefing — Operação Vento Norte', 'Formato domínio de bandeira em campo aberto, Trilha Norte. Duas bandeiras a capturar e sustentar por 5 minutos ininterruptos. Vegetação alta em parte do trajeto — recomenda-se réplica com alcance reduzido para os corredores mais fechados. Ponto de encontro às 13:30 para sorteio de lados.'),
  ('comunicado-regras-noturno', '2026-08-30', 'comunicado', 'Atualização das regras para operações noturnas', 'A partir da Operação Noturna Coruja, toda réplica utilizada em eventos noturnos deve portar iluminação tática (lanterna ou trilho com fixação) para identificação de posição pelos organizadores. Réplicas sem iluminação serão remanejadas para função de apoio em base. Dúvidas: falar com a organização antes do briefing.')
on conflict (id) do nothing;
