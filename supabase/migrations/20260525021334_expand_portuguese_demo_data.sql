/*
  # Expand Portuguese Demo Data for AutoCRM

  Adds more vendedores, clientes, pedidos, funil negotiations, and visitas
  to make the CRM dashboard and all screens look rich and populated.

  1. New sellers: adds 2 more (total 6)
  2. New clients: adds 10 more (total 20) 
  3. New pedidos: adds 25+ more across 8 months
  4. New funil_negociacoes: adds 4 more (total 10)
  5. New visitas: adds 6 more (total 12)
  6. New metas: adds for new sellers
*/

-- Add more vendedores
INSERT INTO vendedores (id, nome, email, telefone, meta_mensal, ativo) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Patricia Almeida', 'patricia@autocrm.com', '(62) 99995-5555', 65000, true),
  ('a2000000-0000-0000-0000-000000000002', 'Thiago Ribeiro', 'thiago@autocrm.com', '(31) 99996-6666', 85000, true)
ON CONFLICT DO NOTHING;

-- Add more clientes
INSERT INTO clientes (id, nome, cnpj, cidade, estado, segmento, vendedor_id, telefone, whatsapp, email, ativo) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Peças do Vale Ltda', '34.567.890/0001-01', 'Itumbiara', 'GO', 'Varejo', '8432d232-2380-47f4-a480-05c8d7068512', '(64) 3333-2001', '(64) 99200-0001', 'vale@pecas.com', true),
  ('b2000000-0000-0000-0000-000000000002', 'Auto Center Pirelli', '45.678.901/0001-02', 'Brasilia', 'DF', 'Atacado', '5f1c2a42-d9ca-4aab-9318-a5a67d83787c', '(61) 3333-2002', '(61) 99200-0002', 'pirelli@autocenter.com', true),
  ('b3000000-0000-0000-0000-000000000003', 'Distribuidora Sudeste', '56.789.012/0001-03', 'Belo Horizonte', 'MG', 'Distribuidor', 'a2000000-0000-0000-0000-000000000002', '(31) 3333-2003', '(31) 99200-0003', 'sudeste@dist.com', true),
  ('b4000000-0000-0000-0000-000000000004', 'Mecanica Rápida', '67.890.123/0001-04', 'Goiania', 'GO', 'Mecânica', 'a1000000-0000-0000-0000-000000000001', '(62) 3333-2004', '(62) 99200-0004', 'rapida@mecanica.com', true),
  ('b5000000-0000-0000-0000-000000000005', 'Auto Peças Cerrado', '78.901.234/0001-05', 'Planaltina', 'GO', 'Varejo', '8432d232-2380-47f4-a480-05c8d7068512', '(61) 3333-2005', '(61) 99200-0005', 'cerrado@autopecas.com', true),
  ('b6000000-0000-0000-0000-000000000006', 'Peças & Serviços SP', '89.012.345/0001-06', 'Sao Paulo', 'SP', 'Atacado', 'a2000000-0000-0000-0000-000000000002', '(11) 3333-2006', '(11) 99200-0006', 'servicos@pecassp.com', true),
  ('b7000000-0000-0000-0000-000000000007', 'Loja do Mecânico', '90.123.456/0001-07', 'Uberlandia', 'MG', 'Varejo', '5f1c2a42-d9ca-4aab-9318-a5a67d83787c', '(34) 3333-2007', '(34) 99200-0007', 'lojado@mecanico.com', true),
  ('b8000000-0000-0000-0000-000000000008', 'Casa das Borrachas', '01.234.567/0001-08', 'Campo Grande', 'MS', 'Varejo', 'a1000000-0000-0000-0000-000000000001', '(67) 3333-2008', '(67) 99200-0008', 'borrachas@casa.com', true),
  ('b9000000-0000-0000-0000-000000000009', 'Auto Premium Cuiabá', '12.345.678/0001-09', 'Cuiaba', 'MT', 'Distribuidor', 'a2000000-0000-0000-0000-000000000002', '(65) 3333-2009', '(65) 99200-0009', 'premium@cuiba.com', true),
  ('ba000000-0000-0000-0000-000000000010', 'Peças Top Palmas', '23.456.789/0001-10', 'Palmas', 'TO', 'Varejo', 'a1000000-0000-0000-0000-000000000001', '(63) 3333-2010', '(63) 99200-0010', 'top@palmas.com', true)
ON CONFLICT DO NOTHING;

-- Add more pedidos across months
INSERT INTO pedidos (cliente_id, vendedor_id, valor, data_pedido, mes, ano, descricao) VALUES
  -- Current month (5/2026)
  ('b1000000-0000-0000-0000-000000000001', '8432d232-2380-47f4-a480-05c8d7068512', 18500, CURRENT_DATE - 8, 5, 2026, 'Pedido linha de freios'),
  ('b2000000-0000-0000-0000-000000000002', '5f1c2a42-d9ca-4aab-9318-a5a67d83787c', 32000, CURRENT_DATE - 10, 5, 2026, 'Atacado suspensao'),
  ('b4000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 9200, CURRENT_DATE - 3, 5, 2026, 'Reposição filtros'),
  ('b7000000-0000-0000-0000-000000000007', '5f1c2a42-d9ca-4aab-9318-a5a67d83787c', 14500, CURRENT_DATE - 6, 5, 2026, 'Linha eletrica'),
  ('b5000000-0000-0000-0000-000000000005', '8432d232-2380-47f4-a480-05c8d7068512', 8700, CURRENT_DATE - 14, 5, 2026, 'Varejo amortecedor'),
  -- Previous month (4/2026)
  ('b1000000-0000-0000-0000-000000000001', '8432d232-2380-47f4-a480-05c8d7068512', 15200, '2026-04-15', 4, 2026, 'Pedido mensal'),
  ('b3000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', 28000, '2026-04-10', 4, 2026, 'Distribuidor linha completa'),
  ('b6000000-0000-0000-0000-000000000006', 'a2000000-0000-0000-0000-000000000002', 45000, '2026-04-08', 4, 2026, 'Atacado SP'),
  ('b8000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 11000, '2026-04-22', 4, 2026, 'Borrachas e pneus'),
  ('b9000000-0000-0000-0000-000000000009', 'a2000000-0000-0000-0000-000000000002', 22000, '2026-04-18', 4, 2026, 'Cuiaba distribuidor'),
  -- 3 months ago (2/2026)
  ('b2000000-0000-0000-0000-000000000002', '5f1c2a42-d9ca-4aab-9318-a5a67d83787c', 29000, '2026-02-12', 2, 2026, 'Brasilia atacado'),
  ('b4000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 7800, '2026-02-20', 2, 2026, 'Mecanica reposicao'),
  ('b7000000-0000-0000-0000-000000000007', '5f1c2a42-d9ca-4aab-9318-a5a67d83787c', 13200, '2026-02-05', 2, 2026, 'Uberlandia mensal'),
  ('ba000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001', 6500, '2026-02-28', 2, 2026, 'Palmas varejo'),
  -- 4 months ago (1/2026)
  ('b1000000-0000-0000-0000-000000000001', '8432d232-2380-47f4-a480-05c8d7068512', 20000, '2026-01-10', 1, 2026, 'Janeiro reposicao'),
  ('b3000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', 35000, '2026-01-15', 1, 2026, 'BH distribuidor inicio ano'),
  ('b6000000-0000-0000-0000-000000000006', 'a2000000-0000-0000-0000-000000000002', 38000, '2026-01-20', 1, 2026, 'SP atacado inicio ano'),
  -- 6 months ago (11/2025)
  ('b2000000-0000-0000-0000-000000000002', '5f1c2a42-d9ca-4aab-9318-a5a67d83787c', 31000, '2025-11-08', 11, 2025, 'Novembro atacado'),
  ('b5000000-0000-0000-0000-000000000005', '8432d232-2380-47f4-a480-05c8d7068512', 9500, '2025-11-15', 11, 2025, 'Cerrado novembro'),
  -- 8 months ago (9/2025)
  ('b9000000-0000-0000-0000-000000000009', 'a2000000-0000-0000-0000-000000000002', 25000, '2025-09-20', 9, 2025, 'Cuiaba setembro'),
  ('b8000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 12800, '2025-09-12', 9, 2025, 'Campo Grande setembro')
ON CONFLICT DO NOTHING;

-- Add more funil_negociacoes
INSERT INTO funil_negociacoes (cliente_id, vendedor_id, etapa, valor_estimado, observacoes, proxima_acao, data_prevista) VALUES
  ('b2000000-0000-0000-0000-000000000002', '5f1c2a42-d9ca-4aab-9318-a5a67d83787c', 'negociacao', 55000, 'Cliente grande de Brasilia, negociando condicoes especiais', 'Enviar proposta final', CURRENT_DATE + 7),
  ('b6000000-0000-0000-0000-000000000006', 'a2000000-0000-0000-0000-000000000002', 'prospeccao', 30000, 'Novo contato em SP, potencial atacado', 'Agendar primeira reuniao', CURRENT_DATE + 14),
  ('ba000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001', 'primeiro_contato', 12000, 'Palmas mostrou interesse', 'Enviar catalogo por email', CURRENT_DATE + 10),
  ('b9000000-0000-0000-0000-000000000009', 'a2000000-0000-0000-0000-000000000002', 'proposta', 42000, 'Cuiaba quer ampliar mix, proposta enviada', 'Follow-up telefone', CURRENT_DATE + 5)
ON CONFLICT DO NOTHING;

-- Add more visitas
INSERT INTO visitas (cliente_id, vendedor_id, data_visita, hora_visita, checkin_realizado, observacoes, proxima_acao) VALUES
  ('b1000000-0000-0000-0000-000000000001', '8432d232-2380-47f4-a480-05c8d7068512', CURRENT_DATE + 1, '10:00', false, 'Apresentar nova linha de freios ceramicos', 'Fechar pedido se gostar'),
  ('b4000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', CURRENT_DATE + 2, '14:30', false, 'Revisar contrato mensal', 'Atualizar condicoes'),
  ('b2000000-0000-0000-0000-000000000002', '5f1c2a42-d9ca-4aab-9318-a5a67d83787c', CURRENT_DATE + 4, '09:00', false, 'Negociar condicoes especiais atacado', 'Levar proposta impressa'),
  ('b7000000-0000-0000-0000-000000000007', '5f1c2a42-d9ca-4aab-9318-a5a67d83787c', CURRENT_DATE - 2, '11:00', true, 'Visita realizada, cliente satisfeito', 'Enviar tabela atualizada'),
  ('b3000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', CURRENT_DATE + 5, '15:00', false, 'Primeira visita ao distribuidor BH', 'Apresentar portfolio completo'),
  ('ba000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001', CURRENT_DATE + 3, '10:30', false, 'Palmas novo cliente, apresentar empresa', 'Levar amostras e catalogo')
ON CONFLICT DO NOTHING;

-- Add metas for new vendedores
INSERT INTO metas_vendedores (vendedor_id, mes, ano, meta_valor) VALUES
  ('a1000000-0000-0000-0000-000000000001', 5, 2026, 65000),
  ('a2000000-0000-0000-0000-000000000002', 5, 2026, 85000),
  ('a1000000-0000-0000-0000-000000000001', 4, 2026, 60000),
  ('a2000000-0000-0000-0000-000000000002', 4, 2026, 80000)
ON CONFLICT DO NOTHING;
