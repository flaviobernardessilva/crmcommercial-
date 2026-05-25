/*
  # CRM Comercial - Schema Completo para Distribuidores de Autopeças

  ## Tabelas Criadas

  ### 1. `vendedores`
  - Cadastro de vendedores com metas e informações de contato
  - Campos: id, nome, email, telefone, meta_mensal, ativo, created_at

  ### 2. `clientes`
  - Cadastro completo de clientes com segmento, localização e contato
  - Campos: id, nome, cnpj, cidade, estado, segmento, vendedor_id, telefone, whatsapp, email, ativo, created_at, updated_at

  ### 3. `pedidos`
  - Registro de pedidos/faturamento por cliente e vendedor
  - Campos: id, cliente_id, vendedor_id, valor, data_pedido, mes, ano, created_at

  ### 4. `funil_negociacoes`
  - Funil comercial com etapas de negociação
  - Campos: id, cliente_id, vendedor_id, etapa, valor_estimado, observacoes, proxima_acao, data_prevista, created_at, updated_at

  ### 5. `visitas`
  - Agenda e registro de visitas com check-in
  - Campos: id, cliente_id, vendedor_id, data_visita, hora_visita, checkin_realizado, checkin_lat, checkin_lng, observacoes, proxima_acao, created_at

  ### 6. `metas_vendedores`
  - Metas mensais por vendedor
  - Campos: id, vendedor_id, mes, ano, meta_valor, created_at

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Políticas permissivas para anon (demo público sem autenticação)
  - Índices otimizados para consultas frequentes
*/

-- =============================================
-- TABELA: vendedores
-- =============================================
CREATE TABLE IF NOT EXISTS vendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  telefone text,
  meta_mensal numeric(12,2) DEFAULT 0,
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

-- =============================================
-- TABELA: clientes
-- =============================================
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
  ativo boolean DEFAULT true,
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

CREATE INDEX IF NOT EXISTS idx_clientes_vendedor ON clientes(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);

-- =============================================
-- TABELA: pedidos
-- =============================================
CREATE TABLE IF NOT EXISTS pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  vendedor_id uuid REFERENCES vendedores(id) ON DELETE SET NULL,
  valor numeric(12,2) NOT NULL DEFAULT 0,
  data_pedido date NOT NULL DEFAULT CURRENT_DATE,
  mes integer NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
  ano integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  descricao text DEFAULT '',
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

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_vendedor ON pedidos(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_mes_ano ON pedidos(mes, ano);

-- =============================================
-- TABELA: funil_negociacoes
-- =============================================
CREATE TABLE IF NOT EXISTS funil_negociacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  vendedor_id uuid REFERENCES vendedores(id) ON DELETE SET NULL,
  etapa text NOT NULL DEFAULT 'prospeccao' CHECK (etapa IN ('prospeccao','primeiro_contato','negociacao','proposta','fechamento')),
  valor_estimado numeric(12,2) DEFAULT 0,
  observacoes text DEFAULT '',
  proxima_acao text DEFAULT '',
  data_prevista date,
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

CREATE INDEX IF NOT EXISTS idx_funil_cliente ON funil_negociacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_funil_vendedor ON funil_negociacoes(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_funil_etapa ON funil_negociacoes(etapa);

-- =============================================
-- TABELA: visitas
-- =============================================
CREATE TABLE IF NOT EXISTS visitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  vendedor_id uuid REFERENCES vendedores(id) ON DELETE SET NULL,
  data_visita date NOT NULL DEFAULT CURRENT_DATE,
  hora_visita time DEFAULT '09:00',
  checkin_realizado boolean DEFAULT false,
  checkin_lat numeric(10,6),
  checkin_lng numeric(10,6),
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

CREATE INDEX IF NOT EXISTS idx_visitas_cliente ON visitas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_visitas_vendedor ON visitas(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_visitas_data ON visitas(data_visita);

-- =============================================
-- TABELA: metas_vendedores
-- =============================================
CREATE TABLE IF NOT EXISTS metas_vendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid REFERENCES vendedores(id) ON DELETE CASCADE,
  mes integer NOT NULL,
  ano integer NOT NULL,
  meta_valor numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(vendedor_id, mes, ano)
);

ALTER TABLE metas_vendedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select metas"
  ON metas_vendedores FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert metas"
  ON metas_vendedores FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update metas"
  ON metas_vendedores FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete metas"
  ON metas_vendedores FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_metas_vendedor_mes ON metas_vendedores(vendedor_id, mes, ano);
