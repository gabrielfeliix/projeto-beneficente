-- =====================================================================
-- SCRIPT UNIFICADO: APAGA, RECRIA E POPULA O BANCO DE DADOS (SEM RLS)
-- Cole este script inteiro no SQL Editor do Supabase e clique em "Run".
-- =====================================================================

-- 1. APAGAR TABELAS EXISTENTES EM ORDEM DE RELACIONAMENTO
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.feed_posts CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.job_postings CASCADE;
DROP TABLE IF EXISTS public.updates CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Limpar os usuários seed do auth.users para evitar conflito de triggers
DELETE FROM auth.users WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006'
);

-- 2. CRIAR TABELAS NOVAS
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    city TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    description TEXT,
    phone TEXT,
    instagram TEXT,
    profile_type TEXT NOT NULL CHECK (profile_type IN ('volunteer', 'institution', 'donor', 'company')),
    cpf TEXT,
    birth_date DATE,
    address TEXT,
    profession TEXT,
    availability TEXT,
    interests TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    emergency_contact TEXT,
    cnpj TEXT,
    representative_name TEXT,
    representative_cpf TEXT,
    representative_rg TEXT,
    representative_phone TEXT,
    headquarters_address TEXT,
    mission TEXT,
    objectives TEXT,
    service_areas TEXT[] DEFAULT '{}',
    public_served TEXT,
    bank_details TEXT,
    social_statute TEXT,
    director_election_act TEXT,
    cnpj_card TEXT,
    accepted_terms BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    address TEXT,
    help_types TEXT[] NOT NULL DEFAULT '{}',
    main_need TEXT NOT NULL,
    financial_goal NUMERIC,
    financial_raised NUMERIC DEFAULT 0,
    end_date DATE,
    cover_image TEXT NOT NULL,
    gallery TEXT[] DEFAULT '{}',
    pix_key TEXT,
    contact TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0
);

CREATE TABLE public.job_postings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    modality TEXT NOT NULL,
    causes TEXT NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    requirements_essential TEXT[] DEFAULT '{}',
    requirements_optional TEXT[] DEFAULT '{}',
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
    duration_type TEXT CHECK (duration_type IN ('point', 'continuous')) DEFAULT 'point',
    weekly_hours INTEGER DEFAULT 4,
    causes_tags TEXT[] DEFAULT '{}',
    skills_tags TEXT[] DEFAULT '{}'
);

CREATE TABLE public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE NOT NULL,
    volunteer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    institution_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_title TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    volunteer_name TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'selected', 'rejected')) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    hours_logged INTEGER DEFAULT 0,
    feedback_notes TEXT
);

CREATE TABLE public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    volunteer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    institution_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
    volunteer_name TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    hours_donated INTEGER NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verification_code TEXT UNIQUE NOT NULL
);

CREATE TABLE public.feed_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_type TEXT NOT NULL CHECK (author_type IN ('volunteer', 'institution', 'donor', 'company')),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0
);

CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('app', 'email', 'whatsapp')) DEFAULT 'app',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read BOOLEAN DEFAULT FALSE
);

CREATE TABLE public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    donor_name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'card')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('Alimentação', 'Combustível', 'Infraestrutura', 'Logística', 'Serviços', 'Outros')),
    description TEXT NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS DESABILITADO (Sem as linhas de ALTER TABLE ... ENABLE ROW LEVEL SECURITY)

-- 3. CRIAR E CONFIGURAR O TRIGGER DE NOVOS USUÁRIOS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, city, neighborhood, profile_type, accepted_terms)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'Usuário Novo'),
        new.email,
        'Não informada',
        'Não informado',
        'volunteer',
        true
    ) ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 4. POPULAR OS DADOS DO SEED DIRETAMENTE
-- =====================================================================

-- Inserir usuários no auth.users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'ana@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"Ana Beatriz"}', false, 'authenticated'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'aguaviva@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"Instituto Água Viva"}', false, 'authenticated'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'nordestao@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"Supermercado Nordestão"}', false, 'authenticated'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'felipe@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"Felipe Albuquerque"}', false, 'authenticated'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'juliana@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"Juliana Santos"}', false, 'authenticated'),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'maos@email.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), '{"provider":"email","providers":["email"]}', '{"name":"ONG Mãos que Ajudam"}', false, 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Inserir / atualizar perfis
INSERT INTO public.profiles (id, name, email, city, neighborhood, description, phone, profile_type, cpf, birth_date, address, profession, availability, skills, accepted_terms)
VALUES
('00000000-0000-0000-0000-000000000001', 'Ana Beatriz', 'ana@email.com', 'Natal', 'Ponta Negra', 'Voluntária dedicada a apoiar crianças do RN e projetos de leitura.', '(84) 98888-7777', 'volunteer', '12345678909', '1990-05-14', 'Rua das Palmeiras, 250, Ponta Negra', 'Pedagoga', 'Fins de semana', ARRAY['Ensino de leitura', 'Mediação'], true),
('00000000-0000-0000-0000-000000000004', 'Felipe Albuquerque', 'felipe@email.com', 'Natal', 'Capim Macio', 'Apoiador regular de causas sociais em Natal.', '(84) 99111-2222', 'donor', '55566677788', '1985-09-21', 'Rua Praia de Genipabu, 45', NULL, NULL, '{}', true),
('00000000-0000-0000-0000-000000000005', 'Juliana Santos', 'juliana@email.com', 'Parnamirim', 'Nova Parnamirim', 'Bióloga e protetora voluntária de animais resgatados.', '(84) 99444-5555', 'volunteer', '98765432100', '1992-12-05', 'Av. Maria Lacerda, 400', 'Bióloga', 'Sábados e domingos', ARRAY['Cuidado animal', 'Logística'], true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, email = EXCLUDED.email, city = EXCLUDED.city, neighborhood = EXCLUDED.neighborhood,
    description = EXCLUDED.description, phone = EXCLUDED.phone, profile_type = EXCLUDED.profile_type,
    cpf = EXCLUDED.cpf, birth_date = EXCLUDED.birth_date, address = EXCLUDED.address,
    profession = EXCLUDED.profession, availability = EXCLUDED.availability, skills = EXCLUDED.skills,
    accepted_terms = EXCLUDED.accepted_terms;

INSERT INTO public.profiles (id, name, email, city, neighborhood, description, phone, profile_type, cnpj, representative_name, representative_cpf, headquarters_address, mission, objectives, service_areas, accepted_terms)
VALUES
('00000000-0000-0000-0000-000000000002', 'Instituto Água Viva', 'aguaviva@email.com', 'Natal', 'Tirol', 'ONG voltada à preservação ambiental e acesso a recursos básicos.', '(84) 99888-1111', 'institution', '08323491000102', 'Julio Silva', '98765432100', 'Av. Hermes da Fonseca, 1200, Tirol', 'Garantir água potável e sustentabilidade ao interior do RN.', 'Perfuração de poços artesianos e educação ecológica.', ARRAY['Meio Ambiente', 'Recursos Básicos'], true),
('00000000-0000-0000-0000-000000000006', 'ONG Mãos que Ajudam', 'maos@email.com', 'Caicó', 'Centro', 'Instituição de apoio alimentar e oficinas de panificação comunitária.', '(84) 99444-2222', 'institution', '85432109000188', 'Clarice Dantas', '55544433322', 'Rua Pedro Velho, 45, Centro, Caicó', 'Alimentação digna e capacitação de famílias no Seridó.', 'Entrega de sopões e oficinas profissionalizantes.', ARRAY['Alimentação', 'Capacitação'], true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, email = EXCLUDED.email, city = EXCLUDED.city, neighborhood = EXCLUDED.neighborhood,
    description = EXCLUDED.description, phone = EXCLUDED.phone, profile_type = EXCLUDED.profile_type,
    cnpj = EXCLUDED.cnpj, representative_name = EXCLUDED.representative_name, representative_cpf = EXCLUDED.representative_cpf,
    headquarters_address = EXCLUDED.headquarters_address, mission = EXCLUDED.mission, objectives = EXCLUDED.objectives,
    service_areas = EXCLUDED.service_areas, accepted_terms = EXCLUDED.accepted_terms;

INSERT INTO public.profiles (id, name, email, city, neighborhood, description, phone, profile_type, cnpj, representative_name, representative_cpf, headquarters_address, mission, accepted_terms)
VALUES
('00000000-0000-0000-0000-000000000003', 'Supermercado Nordestão', 'nordestao@email.com', 'Natal', 'Lagoa Nova', 'Empresa parceira com selo ESG ativo focado em alimentação e combate à fome.', '(84) 98000-3333', 'company', '12345678000109', 'Geraldo Bezerra', '45678912300', 'Av. Salgado Filho, 1000', 'Alimentar o RN gerando impacto local sustentável.', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, email = EXCLUDED.email, city = EXCLUDED.city, neighborhood = EXCLUDED.neighborhood,
    description = EXCLUDED.description, phone = EXCLUDED.phone, profile_type = EXCLUDED.profile_type,
    cnpj = EXCLUDED.cnpj, representative_name = EXCLUDED.representative_name, representative_cpf = EXCLUDED.representative_cpf,
    headquarters_address = EXCLUDED.headquarters_address, mission = EXCLUDED.mission, accepted_terms = EXCLUDED.accepted_terms;

-- Inserir Campanhas
INSERT INTO public.campaigns (id, organizer_id, title, description, category, city, neighborhood, address, help_types, main_need, financial_goal, financial_raised, end_date, cover_image, pix_key, contact, status)
VALUES 
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
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
    '00000000-0000-0000-0000-000000000006',
    'Refeitório Comunitário e Sopão do Seridó',
    'Manutenção do refeitório social em Caicó, garantindo sopão gratuito aos sábados para 150 idosos e crianças.',
    'Alimentação',
    'Caicó',
    'Centro',
    'Rua Pedro Velho, 45',
    ARRAY['Financeiro', 'Voluntariado'],
    'Ingredientes para sopa e embalagens descartáveis',
    3000.00,
    3000.00,
    '2026-07-15',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    'pix@maosqueajudam.org',
    '(84) 99444-2222',
    'completed'
)
ON CONFLICT (id) DO NOTHING;

-- Inserir Vagas de Voluntariado
INSERT INTO public.job_postings (id, institution_id, title, description, category, city, neighborhood, modality, causes, start_date, end_date, requirements_essential, contact_name, contact_email, contact_phone, status, duration_type, weekly_hours)
VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
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
    '00000000-0000-0000-0000-000000000006',
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

-- Inserir Candidaturas
INSERT INTO public.applications (id, job_id, volunteer_id, institution_id, job_title, institution_name, volunteer_name, message, status, submitted_at)
VALUES
(
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Facilitador de Oficinas de Leitura',
    'Instituto Água Viva',
    'Ana Beatriz',
    'Olá! Sou pedagoga e amo trabalhar com literatura infantil. Gostaria muito de apoiar as oficinas de vocês!',
    'selected',
    now() - interval '2 days'
),
(
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006',
    'Cozinheiro para Sopão Solidário',
    'ONG Mãos que Ajudam',
    'Juliana Santos',
    'Olá! Tenho facilidade com cozinha e gostaria de apoiar no preparo do sopão aos sábados.',
    'pending',
    now() - interval '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- Inserir Doações
INSERT INTO public.donations (id, campaign_id, donor_id, donor_name, amount, payment_method, status)
VALUES
(
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    'Felipe Albuquerque',
    150.00,
    'pix',
    'completed'
),
(
    '40000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'Supermercado Nordestão (ESG)',
    500.00,
    'pix',
    'completed'
)
ON CONFLICT (id) DO NOTHING;

-- Inserir Despesas
INSERT INTO public.expenses (id, campaign_id, amount, category, description, receipt_url)
VALUES
(
    '50000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    450.00,
    'Alimentação',
    'Compra de 100kg de feijão carioca e 50kg de arroz agulha.',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=400'
),
(
    '50000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    180.00,
    'Logística',
    'Pagamento de frete para entrega das cestas e marmitas.',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400'
)
ON CONFLICT (id) DO NOTHING;

-- Inserir Posts do Feed
INSERT INTO public.feed_posts (id, author_id, author_name, author_type, content, image_url, likes, comments)
VALUES
(
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Instituto Água Viva',
    'institution',
    '💧 Mais um poço artesiano instalado com sucesso em uma comunidade rural do Seridó! Com as doações dos nossos parceiros, garantimos água potável para 45 famílias nesta semana. Acesse nosso painel de transparência de despesas e confira os comprovantes lançados em tempo real! #TransparênciaESG #MutirãoRN',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    47,
    12
),
(
    '60000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Ana Beatriz',
    'volunteer',
    'Hoje participei do projeto de leitura e vi o brilho nos olhos das crianças. Uma delas me perguntou se podia levar o livro para casa. Sem dúvida a melhor parte do meu sábado. Isso é o voluntariado! 💛',
    NULL,
    89,
    18
)
ON CONFLICT (id) DO NOTHING;
