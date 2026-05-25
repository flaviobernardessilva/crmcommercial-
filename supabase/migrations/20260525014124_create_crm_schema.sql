/*
  # CRM Comercial - Schema Completo

  ## Descrição
  Schema completo para o CRM Comercial de distribuidores de autopeças.

  ## Tabelas Criadas

  ### 1. vendedores
  - Cadastro dos vendedores com meta mensal
  - Campos: id, nome, email, telefone, meta_mensal, ativo, created_at

  ### 2. clientes
  - Cadastro completo de clientes com todos os dados comerciais
  - Campos: id, nome, cnpj, cidade, estado, segmento, vendedor_id, telefone, whatsapp, email,
    status, ultima_compra, total_compras, ticket_medio, score_risco, notas, created_at, updated_at

  ### 3. pedidos
  - Registro de faturamento/pedidos por cliente
  - Campos: id, cliente_id, vendedor_id, valor, data_pedido, mes, ano, created_at

  ### 4. funil_negociacoes
  - Oportunidades no funil comercial
  - Campos: id, cliente_id, vendedor_id, estagio, valor_estimado, notas, data_contato, proxima_acao, created_at, updated_at

  ### 5. visitas
  - Agenda e registros de visitas
  - Campos: id, cliente_id, vendedor_id, data_visita, hora, status, checkin_at, observacoes, proxima_acao, created_at

  ### 6. metas
  - Metas mensais por vendedor
  - Campos: id, vendedor_id, mes, ano, meta_valor, realizado, created_at

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Acesso público permitido (app sem autenticação por ora, controlado via anon key)
*/

-- Tabela de vendedores
CREATE TABLE IF NOT EXISTS vendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  telefone text,
  meta_mensal numeric DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select vendedores"
  ON vendedores FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert vendedores"
  ON vendedores FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update vendedores"
  ON vendedores FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete vendedores"
  ON vendedores FOR DELETE
  TO anon
  USING (true);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cnpj text DEFAULT '',
  cidade text DEFAULT '',
  estado text DEFAULT '',
  segmento text DEFAULT 'Varejo',
  vendedor_id uuid REFERENCES vendedores(id) ON DELETE SET NULL,
  telefone text DEFAULT '',
  whatsapp text DEFAULT '',
  email text DEFAULT '',
  status text DEFAULT 'Ativo',
  ultima_compra date,
  total_compras numeric DEFAULT 0,
  ticket_medio numeric DEFAULT 0,
  score_risco text DEFAULT 'Verde',
  notas text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select clientes"
  ON clientes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert clientes"
  ON clientes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update clientes"
  ON clientes FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete clientes"
  ON clientes FOR DELETE
  TO anon
  USING (true);

-- Tabela de pedidos/faturamento
CREATE TABLE IF NOT EXISTS pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  vendedor_id uuid REFERENCES vendedores(id) ON DELETE SET NULL,
  valor numeric NOT NULL DEFAULT 0,
  data_pedido date NOT NULL DEFAULT CURRENT_DATE,
  mes integer GENERATED ALWAYS AS (EXTRACT(MONTH FROM data_pedido)::integer) STORED,
  ano integer GENERATED ALWAYS AS (EXTRACT(YEAR FROM data_pedido)::integer) STORED,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select pedidos"
  ON pedidos FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert pedidos"
  ON pedidos FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update pedidos"
  ON pedidos FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete pedidos"
  ON pedidos FOR DELETE
  TO anon
  USING (true);

-- Tabela de funil de negociações
CREATE TABLE IF NOT EXISTS funil_negociacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  vendedor_id uuid REFERENCES vendedores(id) ON DELETE SET NULL,
  estagio text NOT NULL DEFAULT 'Prospecção',
  valor_estimado numeric DEFAULT 0,
  notas text DEFAULT '',
  data_contato date DEFAULT CURRENT_DATE,
  proxima_acao text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE funil_negociacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select funil"
  ON funil_negociacoes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert funil"
  ON funil_negociacoes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update funil"
  ON funil_negociacoes FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete funil"
  ON funil_negociacoes FOR DELETE
  TO anon
  USING (true);

-- Tabela de visitas
CREATE TABLE IF NOT EXISTS visitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  vendedor_id uuid REFERENCES vendedores(id) ON DELETE SET NULL,
  data_visita date NOT NULL,
  hora time DEFAULT '09:00',
  status text DEFAULT 'Agendada',
  checkin_at timestamptz,
  observacoes text DEFAULT '',
  proxima_acao text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select visitas"
  ON visitas FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert visitas"
  ON visitas FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update visitas"
  ON visitas FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete visitas"
  ON visitas FOR DELETE
  TO anon
  USING (true);

-- Tabela de metas
CREATE TABLE IF NOT EXISTS metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid REFERENCES vendedores(id) ON DELETE CASCADE,
  mes integer NOT NULL,
  ano integer NOT NULL,
  meta_valor numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(vendedor_id, mes, ano)
);

ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select metas"
  ON metas FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert metas"
  ON metas FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update metas"
  ON metas FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete metas"
  ON metas FOR DELETE
  TO anon
  USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_vendedor ON clientes(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_score ON clientes(score_risco);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_mes_ano ON pedidos(mes, ano);
CREATE INDEX IF NOT EXISTS idx_funil_estagio ON funil_negociacoes(estagio);
CREATE INDEX IF NOT EXISTS idx_visitas_data ON visitas(data_visita);
CREATE INDEX IF NOT EXISTS idx_visitas_status ON visitas(status);
