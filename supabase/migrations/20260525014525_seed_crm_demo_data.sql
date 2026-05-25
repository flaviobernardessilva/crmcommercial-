/*
  # Seed Demo Data for Auto Parts CRM

  Inserts realistic demo data for an auto parts distributor CRM:
  - 5 sellers with monthly targets
  - 20 clients with varied statuses and risk scores
  - 35 sales records across 8 months
  - 8 funnel deals at various stages
  - 8 scheduled/completed visits
  - 5 monthly goals
*/

-- Clear existing demo data if any
DELETE FROM visits WHERE created_at < now() + interval '1 day';
DELETE FROM funnel_deals WHERE created_at < now() + interval '1 day';
DELETE FROM sales WHERE created_at < now() + interval '1 day';
DELETE FROM clients WHERE created_at < now() + interval '1 day';
DELETE FROM goals WHERE created_at < now() + interval '1 day';
DELETE FROM sellers WHERE created_at < now() + interval '1 day';

-- Sellers
INSERT INTO sellers (id, name, email, phone, region, active, avatar_initials, monthly_target) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Carlos Mendes', 'carlos@vendafacil.com', '(62) 99999-0001', 'Centro-Oeste', true, 'CM', 180000),
  ('22222222-2222-2222-2222-222222222222', 'Fernanda Lima', 'fernanda@vendafacil.com', '(62) 99999-0002', 'Centro-Oeste', true, 'FL', 150000),
  ('33333333-3333-3333-3333-333333333333', 'Rafael Sousa', 'rafael@vendafacil.com', '(62) 99999-0003', 'Sudeste', true, 'RS', 120000),
  ('44444444-4444-4444-4444-444444444444', 'Amanda Rocha', 'amanda@vendafacil.com', '(62) 99999-0004', 'Norte', true, 'AR', 100000),
  ('55555555-5555-5555-5555-555555555555', 'Diego Martins', 'diego@vendafacil.com', '(62) 99999-0005', 'Sul', true, 'DM', 90000)
ON CONFLICT (id) DO UPDATE SET monthly_target = EXCLUDED.monthly_target;

-- Clients
INSERT INTO clients (id, name, company, cnpj, city, state, segment, seller_id, phone, whatsapp, email, status, last_purchase_date, total_purchases, risk_score, ticket_medio, potential_recovery, notes) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'João Silva', 'Auto Peças Central Ltda', '12.345.678/0001-01', 'Goiânia', 'GO', 'Atacado', '11111111-1111-1111-1111-111111111111', '(62) 3333-0001', '(62) 99111-0001', 'central@autopecas.com', 'Ativo', CURRENT_DATE - 5, 480000, 'Verde', 8500, 0, 'Cliente premium, compra toda semana'),
  ('c2000000-0000-0000-0000-000000000002', 'Maria Fernandes', 'Distribuidora Goiana de Peças', '12.345.678/0001-02', 'Anápolis', 'GO', 'Distribuidor', '11111111-1111-1111-1111-111111111111', '(62) 3333-0002', '(62) 99111-0002', 'goiana@pecas.com', 'Ativo', CURRENT_DATE - 12, 320000, 'Verde', 6200, 0, 'Aumentou pedido em março'),
  ('c3000000-0000-0000-0000-000000000003', 'Pedro Alves', 'Mega Peças Brasília', '12.345.678/0001-03', 'Brasília', 'DF', 'Varejo', '22222222-2222-2222-2222-222222222222', '(61) 3333-0003', '(61) 99222-0003', 'mega@pecas.com', 'Ativo', CURRENT_DATE - 8, 290000, 'Verde', 5400, 0, 'Focado em linha de suspensão'),
  ('c4000000-0000-0000-0000-000000000004', 'Ana Costa', 'Auto Shop Palmas', '12.345.678/0001-04', 'Palmas', 'TO', 'Varejo', '22222222-2222-2222-2222-222222222222', '(63) 3333-0004', '(63) 99333-0004', 'autoshop@palmas.com', 'Em Risco', CURRENT_DATE - 35, 180000, 'Amarelo', 4200, 25000, 'Sem compra há 35 dias, acionar urgente'),
  ('c5000000-0000-0000-0000-000000000005', 'Lucas Oliveira', 'Peças & Cia Cuiabá', '12.345.678/0001-05', 'Cuiabá', 'MT', 'Distribuidor', '33333333-3333-3333-3333-333333333333', '(65) 3333-0005', '(65) 99444-0005', 'pecasecia@cuiaba.com', 'Em Risco', CURRENT_DATE - 62, 250000, 'Vermelho', 7100, 45000, 'Reclamou de preço, visita urgente'),
  ('c6000000-0000-0000-0000-000000000006', 'Carla Santos', 'Top Auto Mineiros', '12.345.678/0001-06', 'Mineiros', 'GO', 'Varejo', '33333333-3333-3333-3333-333333333333', '(64) 3333-0006', '(64) 99555-0006', 'topauto@mineiros.com', 'Em Risco', CURRENT_DATE - 78, 95000, 'Vermelho', 3800, 18000, 'Provável migração para concorrente'),
  ('c7000000-0000-0000-0000-000000000007', 'Marcos Lima', 'Autopeças Rio Verde', '12.345.678/0001-07', 'Rio Verde', 'GO', 'Varejo', '44444444-4444-4444-4444-444444444444', '(64) 3333-0007', '(64) 99666-0007', 'rioverde@autopecas.com', 'Ativo', CURRENT_DATE - 18, 140000, 'Amarelo', 4900, 12000, 'Cresceu 15% em 2025'),
  ('c8000000-0000-0000-0000-000000000008', 'Patricia Gomes', 'Distribuidora Campo Grande', '12.345.678/0001-08', 'Campo Grande', 'MS', 'Distribuidor', '44444444-4444-4444-4444-444444444444', '(67) 3333-0008', '(67) 99777-0008', 'cg@distribuidora.com', 'Inativo', CURRENT_DATE - 95, 210000, 'Vermelho', 8200, 60000, 'Inativo há 3 meses, alto potencial'),
  ('c9000000-0000-0000-0000-000000000009', 'Roberto Nunes', 'Moto Peças Uberlândia', '12.345.678/0001-09', 'Uberlândia', 'MG', 'Varejo', '55555555-5555-5555-5555-555555555555', '(34) 3333-0009', '(34) 99888-0009', 'moto@uberlandia.com', 'Ativo', CURRENT_DATE - 3, 78000, 'Verde', 2900, 0, 'Comprador fiel de linha moto'),
  ('c0000000-0000-0000-0000-000000000010', 'Juliana Ferreira', 'Mega Distribuidora Caldas', '12.345.678/0001-10', 'Caldas Novas', 'GO', 'Atacado', '55555555-5555-5555-5555-555555555555', '(64) 3333-0010', '(64) 99999-0010', 'mega@caldas.com', 'Inativo', CURRENT_DATE - 130, 430000, 'Vermelho', 9800, 90000, 'Era o maior cliente, parou de comprar'),
  ('ca000000-0000-0000-0000-000000000011', 'Fábio Barbosa', 'AutoCar Itumbiara', '12.345.678/0001-11', 'Itumbiara', 'GO', 'Varejo', '11111111-1111-1111-1111-111111111111', '(64) 3333-0011', '(64) 99111-0011', 'autocar@itumbiara.com', 'Ativo', CURRENT_DATE - 7, 62000, 'Verde', 3100, 0, 'Novo cliente, muito potencial'),
  ('cb000000-0000-0000-0000-000000000012', 'Simone Reis', 'Peças Fácil Jataí', '12.345.678/0001-12', 'Jataí', 'GO', 'Varejo', '22222222-2222-2222-2222-222222222222', '(64) 3333-0012', '(64) 99222-0012', 'pecas@jatai.com', 'Em Risco', CURRENT_DATE - 45, 88000, 'Amarelo', 3600, 15000, 'Reduziu pedidos pela metade'),
  ('cc000000-0000-0000-0000-000000000013', 'André Campos', 'Sul Peças Uberaba', '12.345.678/0001-13', 'Uberaba', 'MG', 'Distribuidor', '33333333-3333-3333-3333-333333333333', '(34) 3333-0013', '(34) 99333-0013', 'sul@pecas.com', 'Ativo', CURRENT_DATE - 22, 195000, 'Verde', 6700, 0, 'Potencial de crescimento alto'),
  ('cd000000-0000-0000-0000-000000000014', 'Tatiana Cruz', 'Norte Autopeças Belém', '12.345.678/0001-14', 'Belém', 'PA', 'Varejo', '44444444-4444-4444-4444-444444444444', '(91) 3333-0014', '(91) 99444-0014', 'norte@belem.com', 'Inativo', CURRENT_DATE - 110, 165000, 'Vermelho', 5500, 35000, 'Mudou gestor de compras'),
  ('ce000000-0000-0000-0000-000000000015', 'Renato Dias', 'Auto Elétrica Goiânia', '12.345.678/0001-15', 'Goiânia', 'GO', 'Varejo', '55555555-5555-5555-5555-555555555555', '(62) 3333-0015', '(62) 99555-0015', 'eletrica@goiania.com', 'Ativo', CURRENT_DATE - 14, 112000, 'Amarelo', 4400, 8000, 'Focado em linha elétrica'),
  ('cf000000-0000-0000-0000-000000000016', 'Vanessa Prado', 'Peças Premium Ribeirão', '12.345.678/0001-16', 'Ribeirão Preto', 'SP', 'Atacado', '11111111-1111-1111-1111-111111111111', '(16) 3333-0016', '(16) 99666-0016', 'premium@ribeirao.com', 'Ativo', CURRENT_DATE - 2, 380000, 'Verde', 11200, 0, 'Maior ticket médio da carteira'),
  ('d0000000-0000-0000-0000-000000000017', 'Gustavo Melo', 'Casa das Peças Formosa', '12.345.678/0001-17', 'Formosa', 'GO', 'Varejo', '22222222-2222-2222-2222-222222222222', '(61) 3333-0017', '(61) 99777-0017', 'casa@formosa.com', 'Em Risco', CURRENT_DATE - 55, 74000, 'Vermelho', 2800, 12000, 'Reclamou de prazo de entrega'),
  ('d1000000-0000-0000-0000-000000000018', 'Beatriz Moura', 'Auto Parts Catalão', '12.345.678/0001-18', 'Catalão', 'GO', 'Varejo', '33333333-3333-3333-3333-333333333333', '(64) 3333-0018', '(64) 99888-0018', 'autoparts@catalao.com', 'Ativo', CURRENT_DATE - 9, 91000, 'Verde', 3700, 0, 'Cliente pontual e organizado'),
  ('d2000000-0000-0000-0000-000000000019', 'Thiago Vieira', 'Peças & Motor Luziânia', '12.345.678/0001-19', 'Luziânia', 'GO', 'Varejo', '44444444-4444-4444-4444-444444444444', '(61) 3333-0019', '(61) 99999-0019', 'motor@luziania.com', 'Ativo', CURRENT_DATE - 27, 58000, 'Amarelo', 2400, 5000, 'Crescendo mas compras irregulares'),
  ('d3000000-0000-0000-0000-000000000020', 'Elaine Souza', 'Distribuidora Triângulo', '12.345.678/0001-20', 'Patos de Minas', 'MG', 'Distribuidor', '55555555-5555-5555-5555-555555555555', '(34) 3333-0020', '(34) 99000-0020', 'triangulo@dist.com', 'Ativo', CURRENT_DATE - 16, 275000, 'Verde', 8900, 0, 'Cresceu 28% no último trimestre')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, company = EXCLUDED.company, status = EXCLUDED.status,
  risk_score = EXCLUDED.risk_score, ticket_medio = EXCLUDED.ticket_medio,
  potential_recovery = EXCLUDED.potential_recovery;

-- Sales records - spread across 8 months
INSERT INTO sales (client_id, seller_id, amount, sale_date, year, month, description) VALUES
  -- Current month
  ('c1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 42000, CURRENT_DATE - 5, EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, 'Pedido suspensão e freios'),
  ('c2000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 28000, CURRENT_DATE - 12, EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, 'Reposição mensal'),
  ('c3000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 31000, CURRENT_DATE - 8, EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, 'Linha de motor'),
  ('c9000000-0000-0000-0000-000000000009', '55555555-5555-5555-5555-555555555555', 9500, CURRENT_DATE - 3, EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, 'Peças moto'),
  ('cf000000-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 55000, CURRENT_DATE - 2, EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, 'Pedido grande premium'),
  ('ca000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 15000, CURRENT_DATE - 7, EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, 'Primeiro grande pedido'),
  ('d1000000-0000-0000-0000-000000000018', '33333333-3333-3333-3333-333333333333', 12500, CURRENT_DATE - 9, EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, 'Reposição elétrica'),
  ('d3000000-0000-0000-0000-000000000020', '55555555-5555-5555-5555-555555555555', 38000, CURRENT_DATE - 16, EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, 'Pedido mensal'),
  -- Last month
  ('c1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 38500, CURRENT_DATE - 35, EXTRACT(YEAR FROM (CURRENT_DATE - interval '1 month'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '1 month'))::int, 'Pedido regular'),
  ('c2000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 24000, CURRENT_DATE - 38, EXTRACT(YEAR FROM (CURRENT_DATE - interval '1 month'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '1 month'))::int, 'Reposição'),
  ('c3000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 27500, CURRENT_DATE - 40, EXTRACT(YEAR FROM (CURRENT_DATE - interval '1 month'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '1 month'))::int, 'Suspensão'),
  ('c4000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 18000, CURRENT_DATE - 35, EXTRACT(YEAR FROM (CURRENT_DATE - interval '1 month'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '1 month'))::int, 'Último pedido'),
  ('c7000000-0000-0000-0000-000000000007', '44444444-4444-4444-4444-444444444444', 14200, CURRENT_DATE - 42, EXTRACT(YEAR FROM (CURRENT_DATE - interval '1 month'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '1 month'))::int, 'Freios'),
  ('cc000000-0000-0000-0000-000000000013', '33333333-3333-3333-3333-333333333333', 22000, CURRENT_DATE - 36, EXTRACT(YEAR FROM (CURRENT_DATE - interval '1 month'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '1 month'))::int, 'Linha completa'),
  ('cf000000-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 51000, CURRENT_DATE - 32, EXTRACT(YEAR FROM (CURRENT_DATE - interval '1 month'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '1 month'))::int, 'Pedido grande'),
  -- 2 months ago
  ('c1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 41000, CURRENT_DATE - 68, EXTRACT(YEAR FROM (CURRENT_DATE - interval '2 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '2 months'))::int, 'Pedido mensal'),
  ('c5000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 29000, CURRENT_DATE - 62, EXTRACT(YEAR FROM (CURRENT_DATE - interval '2 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '2 months'))::int, 'Último pedido'),
  ('cf000000-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 48000, CURRENT_DATE - 65, EXTRACT(YEAR FROM (CURRENT_DATE - interval '2 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '2 months'))::int, 'Premium'),
  ('d3000000-0000-0000-0000-000000000020', '55555555-5555-5555-5555-555555555555', 32000, CURRENT_DATE - 70, EXTRACT(YEAR FROM (CURRENT_DATE - interval '2 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '2 months'))::int, 'Mensal'),
  ('cc000000-0000-0000-0000-000000000013', '33333333-3333-3333-3333-333333333333', 19000, CURRENT_DATE - 75, EXTRACT(YEAR FROM (CURRENT_DATE - interval '2 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '2 months'))::int, 'Reposição'),
  -- 3 months ago
  ('c2000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 31000, CURRENT_DATE - 95, EXTRACT(YEAR FROM (CURRENT_DATE - interval '3 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '3 months'))::int, 'Pedido'),
  ('c6000000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 9800, CURRENT_DATE - 78, EXTRACT(YEAR FROM (CURRENT_DATE - interval '3 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '3 months'))::int, 'Último pedido'),
  ('c8000000-0000-0000-0000-000000000008', '44444444-4444-4444-4444-444444444444', 21000, CURRENT_DATE - 95, EXTRACT(YEAR FROM (CURRENT_DATE - interval '3 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '3 months'))::int, 'Último pedido'),
  ('d3000000-0000-0000-0000-000000000020', '55555555-5555-5555-5555-555555555555', 28500, CURRENT_DATE - 100, EXTRACT(YEAR FROM (CURRENT_DATE - interval '3 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '3 months'))::int, 'Mensal'),
  ('cf000000-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 46000, CURRENT_DATE - 92, EXTRACT(YEAR FROM (CURRENT_DATE - interval '3 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '3 months'))::int, 'Grande pedido'),
  -- 4 months ago
  ('c0000000-0000-0000-0000-000000000010', '55555555-5555-5555-5555-555555555555', 41000, CURRENT_DATE - 130, EXTRACT(YEAR FROM (CURRENT_DATE - interval '4 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '4 months'))::int, 'Penúltimo pedido'),
  ('c1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 44000, CURRENT_DATE - 125, EXTRACT(YEAR FROM (CURRENT_DATE - interval '4 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '4 months'))::int, 'Pedido mensal'),
  ('cf000000-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 52000, CURRENT_DATE - 130, EXTRACT(YEAR FROM (CURRENT_DATE - interval '4 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '4 months'))::int, 'Premium mensal'),
  ('cc000000-0000-0000-0000-000000000013', '33333333-3333-3333-3333-333333333333', 24000, CURRENT_DATE - 120, EXTRACT(YEAR FROM (CURRENT_DATE - interval '4 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '4 months'))::int, 'Mensal'),
  -- 5 months ago
  ('c1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 39000, CURRENT_DATE - 155, EXTRACT(YEAR FROM (CURRENT_DATE - interval '5 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '5 months'))::int, 'Pedido mensal'),
  ('c2000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 26000, CURRENT_DATE - 158, EXTRACT(YEAR FROM (CURRENT_DATE - interval '5 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '5 months'))::int, 'Mensal'),
  ('cf000000-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 49000, CURRENT_DATE - 160, EXTRACT(YEAR FROM (CURRENT_DATE - interval '5 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '5 months'))::int, 'Premium'),
  ('d3000000-0000-0000-0000-000000000020', '55555555-5555-5555-5555-555555555555', 27000, CURRENT_DATE - 165, EXTRACT(YEAR FROM (CURRENT_DATE - interval '5 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '5 months'))::int, 'Mensal'),
  -- 6 months ago
  ('c0000000-0000-0000-0000-000000000010', '55555555-5555-5555-5555-555555555555', 38000, CURRENT_DATE - 195, EXTRACT(YEAR FROM (CURRENT_DATE - interval '6 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '6 months'))::int, 'Penúltimo grande'),
  ('c1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 43000, CURRENT_DATE - 190, EXTRACT(YEAR FROM (CURRENT_DATE - interval '6 months'))::int, EXTRACT(MONTH FROM (CURRENT_DATE - interval '6 months'))::int, 'Pedido mensal')
ON CONFLICT DO NOTHING;

-- Funnel deals
INSERT INTO funnel_deals (client_id, seller_id, title, stage, value, probability, expected_close_date, notes) VALUES
  ('c4000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Reativação Auto Shop Palmas', 'Primeiro Contato', 25000, 30, CURRENT_DATE + 15, 'Cliente em risco, proposta de reativação enviada por WhatsApp'),
  ('c5000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'Recuperação Peças & Cia', 'Negociação', 45000, 60, CURRENT_DATE + 10, 'Reclamou de preço, preparando contra-proposta com condição especial'),
  ('c6000000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 'Proposta Top Auto Mineiros', 'Proposta', 18000, 75, CURRENT_DATE + 5, 'Proposta enviada, aguardando aprovação do sócio'),
  ('c8000000-0000-0000-0000-000000000008', '44444444-4444-4444-4444-444444444444', 'Reativação Distribuidora CG', 'Prospecção', 60000, 20, CURRENT_DATE + 30, 'Inativo há 3 meses, condição especial aprovada pela gestão'),
  ('c0000000-0000-0000-0000-000000000010', '55555555-5555-5555-5555-555555555555', 'Mega Caldas - Recuperação Urgente', 'Negociação', 90000, 50, CURRENT_DATE + 20, 'Era maior cliente. Visita presencial com gerente agendada'),
  ('cb000000-0000-0000-0000-000000000012', '22222222-2222-2222-2222-222222222222', 'Reativação Peças Fácil Jataí', 'Primeiro Contato', 15000, 40, CURRENT_DATE + 12, 'Reduziu pedidos, verificar motivo real'),
  ('cd000000-0000-0000-0000-000000000014', '44444444-4444-4444-4444-444444444444', 'Norte Autopeças - Novo Gestor', 'Prospecção', 35000, 25, CURRENT_DATE + 25, 'Novo gestor de compras, reapresentar empresa e linha completa'),
  ('d3000000-0000-0000-0000-000000000020', '55555555-5555-5555-5555-555555555555', 'Ampliação Triângulo', 'Fechamento', 55000, 90, CURRENT_DATE + 3, 'Crescendo 28%, proposta de ampliação de mix aprovada verbalmente')
ON CONFLICT DO NOTHING;

-- Visits
INSERT INTO visits (client_id, seller_id, visit_date, visit_time, status, observations, next_action, next_action_date) VALUES
  ('c1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', CURRENT_DATE + 2, '10:00', 'Agendada', 'Apresentar nova linha de freios premium', 'Fechar pedido de suspensão completo', CURRENT_DATE + 7),
  ('c5000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', CURRENT_DATE + 1, '14:00', 'Agendada', 'Negociar reativação com condição diferenciada', 'Proposta com desconto progressivo por volume', CURRENT_DATE + 5),
  ('c0000000-0000-0000-0000-000000000010', '55555555-5555-5555-5555-555555555555', CURRENT_DATE + 3, '09:00', 'Agendada', 'Visita de recuperação com gerente comercial', 'Levar catálogo 2026 e tabela especial', CURRENT_DATE + 10),
  ('cf000000-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', CURRENT_DATE - 2, '15:00', 'Realizada', 'Fechou pedido de R$ 55.000 para entrega em 3 dias', 'Próxima visita em 15 dias para apresentar novidades', CURRENT_DATE + 13),
  ('c3000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - 1, '11:00', 'Realizada', 'Cliente demonstrou interesse na linha de motor completo', 'Enviar tabela de preços atualizada por email', CURRENT_DATE + 2),
  ('c8000000-0000-0000-0000-000000000008', '44444444-4444-4444-4444-444444444444', CURRENT_DATE + 5, '10:30', 'Agendada', 'Reativar cliente inativo com condição especial', 'Condição aprovada pelo gerente: 5% desconto + prazo 45 dias', CURRENT_DATE + 12),
  ('cc000000-0000-0000-0000-000000000013', '33333333-3333-3333-3333-333333333333', CURRENT_DATE + 4, '16:00', 'Agendada', 'Revisão de carteira e apresentação de novos produtos', 'Ampliar mix de freios e suspensão', CURRENT_DATE + 18),
  ('d3000000-0000-0000-0000-000000000020', '55555555-5555-5555-5555-555555555555', CURRENT_DATE - 3, '09:30', 'Realizada', 'Cliente muito satisfeito, crescimento de 28% confirmado', 'Ampliar mix de produtos, sugerir linha elétrica', CURRENT_DATE + 5)
ON CONFLICT DO NOTHING;

-- Goals current month
INSERT INTO goals (seller_id, year, month, target_amount, target_new_clients, target_recovered_clients)
SELECT
  id,
  EXTRACT(YEAR FROM CURRENT_DATE)::int,
  EXTRACT(MONTH FROM CURRENT_DATE)::int,
  monthly_target,
  2,
  3
FROM sellers
ON CONFLICT DO NOTHING;
