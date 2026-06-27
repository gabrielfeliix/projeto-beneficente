-- SCRIPT DE SEEDING — PLATAFORMA PROVE (SQL EDITOR DO SUPABASE)
-- Execute este script no SQL Editor do seu painel Supabase para popular todas as tabelas com dados fictícios realistas.

-- ══════════════════════════════════════════════════════════════
-- 1. POPULAR TABELA DE USUÁRIOS (auth.users e public.profiles)
-- ══════════════════════════════════════════════════════════════

-- Nota: O trigger handle_new_user() criará automaticamente a linha em public.profiles.
-- Depois, nós apenas atualizamos public.profiles com os dados corretos correspondentes.

-- Usuário 1: Voluntária Ana Beatriz
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'ana@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"Ana Beatriz"}', false, 'authenticated')
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET
    name = 'Ana Beatriz',
    city = 'Natal',
    neighborhood = 'Ponta Negra',
    description = 'Voluntária dedicada a apoiar crianças do RN e projetos de leitura.',
    phone = '(84) 98888-7777',
    profile_type = 'volunteer',
    cpf = '12345678909',
    birth_date = '1990-05-14',
    address = 'Rua das Palmeiras, 250, Ponta Negra',
    profession = 'Pedagoga',
    availability = 'Fins de semana',
    skills = ARRAY['Ensino de leitura', 'Mediação'],
    accepted_terms = true
WHERE id = '00000000-0000-0000-0000-000000000001';


-- Usuário 2: ONG Instituto Água Viva
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'aguaviva@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"Instituto Água Viva"}', false, 'authenticated')
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET
    name = 'Instituto Água Viva',
    city = 'Natal',
    neighborhood = 'Tirol',
    description = 'ONG voltada à preservação ambiental e acesso a recursos básicos.',
    phone = '(84) 99888-1111',
    profile_type = 'institution',
    cnpj = '08323491000102',
    representative_name = 'Julio Silva',
    representative_cpf = '98765432100',
    headquarters_address = 'Av. Hermes da Fonseca, 1200, Tirol',
    mission = 'Garantir água potável e sustentabilidade ao interior do RN.',
    objectives = 'Perfuração de poços artesianos e educação ecológica.',
    service_areas = ARRAY['Meio Ambiente', 'Recursos Básicos'],
    accepted_terms = true
WHERE id = '00000000-0000-0000-0000-000000000002';


-- Usuário 3: Empresa Assinante Nordestão (B2B)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'nordestao@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"Supermercado Nordestão"}', false, 'authenticated')
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET
    name = 'Supermercado Nordestão',
    city = 'Natal',
    neighborhood = 'Lagoa Nova',
    description = 'Empresa parceira com selo ESG ativo focado em alimentação e combate à fome.',
    phone = '(84) 98000-3333',
    profile_type = 'company',
    cnpj = '12345678000109',
    representative_name = 'Geraldo Bezerra',
    representative_cpf = '45678912300',
    headquarters_address = 'Av. Salgado Filho, 1000',
    mission = 'Alimentar o RN gerando impacto local sustentável.',
    accepted_terms = true
WHERE id = '00000000-0000-0000-0000-000000000003';


-- Usuário 4: Doador Simplificado Felipe
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'felipe@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"Felipe Albuquerque"}', false, 'authenticated')
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET
    name = 'Felipe Albuquerque',
    city = 'Natal',
    neighborhood = 'Capim Macio',
    description = 'Apoiador regular de causas sociais em Natal.',
    phone = '(84) 99111-2222',
    profile_type = 'donor',
    cpf = '55566677788',
    birth_date = '1985-09-21',
    address = 'Rua Praia de Genipabu, 45',
    accepted_terms = true
WHERE id = '00000000-0000-0000-0000-000000000004';


-- Usuário 5: Voluntária Juliana Santos
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'juliana@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"Juliana Santos"}', false, 'authenticated')
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET
    name = 'Juliana Santos',
    city = 'Parnamirim',
    neighborhood = 'Nova Parnamirim',
    description = 'Bióloga e protetora voluntária de animais resgatados.',
    phone = '(84) 99444-5555',
    profile_type = 'volunteer',
    cpf = '98765432100',
    birth_date = '1992-12-05',
    address = 'Av. Maria Lacerda, 400',
    profession = 'Bióloga',
    availability = 'Sábados e domingos',
    skills = ARRAY['Cuidado animal', 'Logística'],
    accepted_terms = true
WHERE id = '00000000-0000-0000-0000-000000000005';


-- Usuário 6: ONG Mãos que Ajudam Seridó
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'maos@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"ONG Mãos que Ajudam"}', false, 'authenticated')
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET
    name = 'ONG Mãos que Ajudam',
    city = 'Caicó',
    neighborhood = 'Centro',
    description = 'Instituição de apoio alimentar e oficinas de panificação comunitária.',
    phone = '(84) 99444-2222',
    profile_type = 'institution',
    cnpj = '85432109000188',
    representative_name = 'Clarice Dantas',
    representative_cpf = '55544433322',
    headquarters_address = 'Rua Pedro Velho, 45, Centro, Caicó',
    mission = 'Alimentação digna e capacitação de famílias no Seridó.',
    objectives = 'Entrega de sopões e oficinas profissionalizantes.',
    service_areas = ARRAY['Alimentação', 'Capacitação'],
    accepted_terms = true
WHERE id = '00000000-0000-0000-0000-000000000006';


-- ══════════════════════════════════════════════════════════════
-- 2. POPULAR TABELA DE CAMPANHAS BENEFICENTES (campaigns)
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.campaigns (id, organizer_id, title, description, category, city, neighborhood, address, help_types, main_need, financial_goal, financial_raised, end_date, cover_image, pix_key, contact, status)
VALUES 
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002', -- Instituto Água Viva
    'Marmitas Solidárias Filipe Camarão',
    'Campanha mensal para produção e distribuição de 300 refeições para famílias desabrigadas da região oeste de Natal.',
    'Alimentação',
    'Natal',
    'Filipe Camarão',
    'Rua da Fé, 12',
    ARRAY['Financeiro', 'Alimento'],
    'Arroz, feijão e carne para preparo',
    5000.00,
    3450.00,
    '2026-08-30',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
    'doacoes@aguaviva.org',
    '(84) 99888-1111',
    'active'
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000006', -- ONG Mãos que Ajudam
    'Refeitório Comunitário e Sopão do Seridó',
    'Manutenção do refeitório social em Caicó, garantindo sopão gratuito aos sábados para 150 idosos e crianças.',
    'Alimentação',
    'Caicó',
    'Centro',
    'Rua Pedro Velho, 45',
    ARRAY['Financeiro', 'Voluntariado'],
    'Ingredientes para sopa e embalagens descartáveis',
    3000.00,
    3000.00, -- Meta financeira batida!
    '2026-07-15',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    'pix@maosqueajudam.org',
    '(84) 99444-2222',
    'completed' -- Status concluído (meta 100%)
)
ON CONFLICT (id) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- 3. POPULAR TABELA DE VAGAS DE VOLUNTARIADO (job_postings)
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.job_postings (id, institution_id, title, description, category, city, neighborhood, modality, causes, start_date, end_date, requirements_essential, contact_name, contact_email, contact_phone, status, duration_type, weekly_hours)
VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002', -- Instituto Água Viva
    'Facilitador de Oficinas de Leitura',
    'Auxiliar crianças na alfabetização básica e leitura de histórias aos sábados pela manhã no centro comunitário.',
    'Educação',
    'Natal',
    'Tirol',
    'Presencial',
    'Educação infantil',
    '2026-07-01',
    '2026-12-31',
    ARRAY['Paciência', 'Gostar de crianças'],
    'Julio Silva',
    'aguaviva@email.com',
    '(84) 99888-1111',
    'open',
    'continuous',
    4
),
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000006', -- ONG Mãos que Ajudam
    'Cozinheiro para Sopão Solidário',
    'Auxiliar no preparo de panelas de sopa e higienização dos insumos na sede da ONG em Caicó.',
    'Alimentação',
    'Caicó',
    'Centro',
    'Presencial',
    'Combate à fome',
    '2026-07-01',
    '2026-09-30',
    ARRAY['Noções básicas de cozinha', 'Higiene'],
    'Clarice Dantas',
    'maos@email.com',
    '(84) 99444-2222',
    'open',
    'continuous',
    6
)
ON CONFLICT (id) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- 4. POPULAR TABELA DE CANDIDATURAS (applications)
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.applications (id, job_id, volunteer_id, institution_id, job_title, institution_name, volunteer_name, message, status, submitted_at)
VALUES
(
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001', -- Facilitador de Leitura
    '00000000-0000-0000-0000-000000000001', -- Ana Beatriz
    '00000000-0000-0000-0000-000000000002', -- Instituto Água Viva
    'Facilitador de Oficinas de Leitura',
    'Instituto Água Viva',
    'Ana Beatriz',
    'Olá! Sou pedagoga e amo trabalhar com literatura infantil. Gostaria muito de apoiar as oficinas de vocês!',
    'selected', -- Aprovada
    now() - interval '2 days'
),
(
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002', -- Cozinheiro Sopão
    '00000000-0000-0000-0000-000000000005', -- Juliana Santos
    '00000000-0000-0000-0000-000000000006', -- ONG Mãos que Ajudam
    'Cozinheiro para Sopão Solidário',
    'ONG Mãos que Ajudam',
    'Juliana Santos',
    'Olá! Tenho facilidade com cozinha e gostaria de apoiar no preparo do sopão aos sábados.',
    'pending', -- Pendente de análise
    now() - interval '1 day'
)
ON CONFLICT (id) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- 5. POPULAR TABELA DE DOAÇÕES (donations)
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.donations (id, campaign_id, donor_id, donor_name, amount, payment_method, status)
VALUES
(
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001', -- Marmitas Solidárias
    '00000000-0000-0000-0000-000000000004', -- Doador Felipe
    'Felipe Albuquerque',
    150.00,
    'pix',
    'completed'
),
(
    '40000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001', -- Marmitas Solidárias
    '00000000-0000-0000-0000-000000000003', -- Empresa Nordestão
    'Supermercado Nordestão (ESG)',
    500.00,
    'pix',
    'completed'
)
ON CONFLICT (id) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- 6. POPULAR TABELA DE DESPESAS (expenses - Prestação de Contas)
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.expenses (id, campaign_id, amount, category, description, receipt_url)
VALUES
(
    '50000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001', -- Marmitas Solidárias
    450.00,
    'Alimentação',
    'Compra de 100kg de feijão carioca e 50kg de arroz agulha.',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=400'
),
(
    '50000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001', -- Marmitas Solidárias
    180.00,
    'Logística',
    'Pagamento de frete para entrega das cestas e marmitas.',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400'
)
ON CONFLICT (id) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- 7. POPULAR TABELA DO FEED DE HISTÓRIAS (feed_posts)
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.feed_posts (id, author_id, author_name, author_type, content, image_url, likes, comments)
VALUES
(
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002', -- Instituto Água Viva
    'Instituto Água Viva',
    'institution',
    '💧 Mais um poço artesiano instalado com sucesso em uma comunidade rural do Seridó! Com as doações dos nossos parceiros, garantimos água potável para 45 famílias nesta semana. Acesse nosso painel de transparência de despesas e confira os comprovantes lançados em tempo real! #TransparênciaESG #PROVERN',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    47,
    12
),
(
    '60000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001', -- Ana Beatriz
    'Ana Beatriz',
    'volunteer',
    'Hoje participei do projeto de leitura e vi o brilho nos olhos das crianças. Uma delas me perguntou se podia levar o livro para casa. Sem dúvida a melhor parte do meu sábado. Isso é o voluntariado! 💛',
    NULL,
    89,
    18
)
ON CONFLICT (id) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- 8. POPULAR TABELA DE ATUALIZAÇÕES DE CAMPANHA (updates)
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.updates (id, campaign_id, content, image_url, likes, shares, created_at)
VALUES
(
    '70000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002', -- Refeitório Comunitário e Sopão do Seridó
    '🍲 Preparativos a todo vapor para o sopão deste sábado! Graças ao apoio de vocês, compramos todos os legumes e ingredientes fresquinhos no mercado local. Nossa cozinha comunitária em Caicó já está pronta para receber os voluntários.',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800',
    24,
    5,
    now() - interval '5 days'
),
(
    '70000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002', -- Refeitório Comunitário e Sopão do Seridó
    '❤️ Meta de arrecadação financeira atingida em 100%! Estamos imensamente gratos a cada doador que tornou isso possível. Com esse valor de R$ 3.000,00 garantiremos a manutenção do refeitório social e o sopão dos idosos e crianças por mais 3 meses. Em breve postaremos a prestação de contas detalhada aqui no painel. Obrigado, Seridó! 🙏',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
    48,
    12,
    now() - interval '2 days'
),
(
    '70000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002', -- Refeitório Comunitário e Sopão do Seridó
    '🎉 Conclusão e Prestação de Contas! O sopão deste sábado foi um sucesso absoluto. Servimos mais de 160 refeições nutritivas. Já lançamos todas as notas fiscais e comprovantes de compras no painel de transparência de despesas da campanha. Venha conferir! Obrigado a todos os voluntários que doaram seu tempo e carinho.',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    67,
    20,
    now() - interval '2 hours'
),
(
    '70000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001', -- Marmitas Solidárias Filipe Camarão
    '🥦 Compra de insumos realizada! Feijão, arroz e legumes comprados e prontos para o preparo das marmitas que serão distribuídas na comunidade. Acompanhe a aba de despesas para ver as notas fiscais anexadas!',
    'https://images.unsplash.com/photo-1593113598332-cd288d6494332?auto=format&fit=crop&q=80&w=800',
    15,
    2,
    now() - interval '3 days'
)
ON CONFLICT (id) DO NOTHING;
