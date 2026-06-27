-- SCRIPT PARA CONFIGURAÇÃO DE TIPOS E CARGA DE DADOS (SUPABASE SQL EDITOR)
-- Execute este script no SQL Editor do seu projeto Supabase para habilitar doadores, empresas e carregar dados mockados.

-- ══════════════════════════════════════════════════════════════════════
-- PARTE 1: AJUSTES DE SCHEMA E RESTRIÇÕES (INTERFACE)
-- ══════════════════════════════════════════════════════════════════════

-- 1. Atualiza a restrição de tipo de perfil na tabela profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_profile_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_profile_type_check 
    CHECK (profile_type IN ('volunteer', 'institution', 'donor', 'company'));

-- 2. Adiciona colunas de assinatura B2B na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;

-- 3. Atualiza a restrição de autor no feed_posts e adiciona colunas de geolocalização e badges
ALTER TABLE public.feed_posts DROP CONSTRAINT IF EXISTS feed_posts_author_type_check;
ALTER TABLE public.feed_posts ADD CONSTRAINT feed_posts_author_type_check 
    CHECK (author_type IN ('volunteer', 'institution', 'donor', 'company'));

ALTER TABLE public.feed_posts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.feed_posts ADD COLUMN IF NOT EXISTS badge TEXT;


-- ══════════════════════════════════════════════════════════════════════
-- PARTE 2: INSERÇÃO DE USUÁRIOS FICTÍCIOS NO AUTH.USERS E PROFILES
-- ══════════════════════════════════════════════════════════════════════

-- Função auxiliar para criar usuários de teste no schema auth e perfis correspondentes
CREATE OR REPLACE FUNCTION public.seed_user(
    p_id UUID,
    p_email TEXT,
    p_name TEXT,
    p_profile_type TEXT,
    p_city TEXT,
    p_neighborhood TEXT,
    p_description TEXT,
    p_phone TEXT,
    p_cnpj TEXT DEFAULT NULL,
    p_cpf TEXT DEFAULT NULL,
    p_sub_plan TEXT DEFAULT 'none',
    p_sub_status TEXT DEFAULT 'inactive'
) RETURNS VOID AS $$
BEGIN
    -- 1. Insere em auth.users se não existir
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_id) THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (
            p_id,
            '00000000-0000-0000-0000-000000000000',
            p_email,
            -- Senha criptografada padrão: 'senha123'
            '$2a$10$Tq3bE8Yc4v/jZ/4cEGeRcu12pqr8d6iSPc6dBg.N5znh3yy',
            NOW(),
            'authenticated',
            '{"provider": "email", "providers": ["email"]}',
            jsonb_build_object('name', p_name),
            NOW(),
            NOW()
        );
    END IF;

    -- 2. Atualiza ou insere o perfil correspondente na tabela public.profiles
    INSERT INTO public.profiles (id, name, email, profile_type, city, neighborhood, description, phone, cnpj, cpf, subscription_plan, subscription_status, accepted_terms)
    VALUES (p_id, p_name, p_email, p_profile_type, p_city, p_neighborhood, p_description, p_phone, p_cnpj, p_cpf, p_sub_plan, p_sub_status, true)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        profile_type = EXCLUDED.profile_type,
        city = EXCLUDED.city,
        neighborhood = EXCLUDED.neighborhood,
        description = EXCLUDED.description,
        phone = EXCLUDED.phone,
        cnpj = EXCLUDED.cnpj,
        cpf = EXCLUDED.cpf,
        subscription_plan = EXCLUDED.subscription_plan,
        subscription_status = EXCLUDED.subscription_status;
END;
$$ LANGUAGE plpgsql;

-- Executa o seeding para as 15 contas fictícias
SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000001',
    'nordestao@email.com',
    'Supermercado Nordestão',
    'company',
    'Natal',
    'Lagoa Nova',
    'Supermercados Nordestão - Gerando impacto social e apoiando o desenvolvimento do RN. Plano ESG Ouro Ativo.',
    '(84) 98888-1111',
    '08323491000102',
    NULL,
    'mensal_ouro',
    'active'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000002',
    'marina@email.com',
    'Marina Vasconcelos',
    'volunteer',
    'Natal',
    'Ponta Negra',
    'Artista plástica e arte-educadora. Acredito que a arte transforma vidas e cura corações. 🎨✨',
    '(84) 98888-2222',
    NULL,
    '12345678909',
    'none',
    'inactive'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000003',
    'felipe@email.com',
    'Felipe Albuquerque',
    'donor',
    'Natal',
    'Petrópolis',
    'Doando tempo e recursos no RN. Ativista social em Natal, focado em combate à fome e desigualdade.',
    '(84) 98888-3333',
    NULL,
    '98765432100',
    'none',
    'inactive'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000004',
    'aguaviva@email.com',
    'Instituto Água Viva RN',
    'institution',
    'Natal',
    'Tirol',
    'ONG dedicada ao acesso à água e saneamento em comunidades do sertão do RN. 🏛️💧',
    '(84) 98888-4444',
    '12456789000199',
    NULL,
    'none',
    'inactive'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000005',
    'pedro@email.com',
    'Pedro Lima',
    'volunteer',
    'Parnamirim',
    'Nova Parnamirim',
    'Apenas um cidadão querendo ajudar quando sobra um tempinho nos fins de semana.',
    '(84) 98888-5555',
    NULL,
    '45678912304',
    'none',
    'inactive'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000006',
    'hotelmiramar@email.com',
    'Hotel Miramar Ponta Negra',
    'company',
    'Natal',
    'Ponta Negra',
    'Acolhimento e responsabilidade socioambiental. Apoiando abrigos do RN com nosso selo ESG Prata.',
    '(84) 98888-6666',
    '12456789000109',
    NULL,
    'mensal_prata',
    'active'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000007',
    'thiago@email.com',
    'Thiago Martins',
    'volunteer',
    'Natal',
    'Alecrim',
    'Fotógrafo profissional. Contando histórias reais de impacto social através de lentes.',
    '(84) 98888-7777',
    NULL,
    '78912345608',
    'none',
    'inactive'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000008',
    'camila@email.com',
    'Camila Nogueira',
    'volunteer',
    'Natal',
    'Areia Preta',
    'Bióloga. Atuando em mutirões de plantio urbano e limpeza de praias no RN. 🌳🌊',
    '(84) 98888-8888',
    NULL,
    '32165498701',
    'none',
    'inactive'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000009',
    'caofeliz@email.com',
    'Abrigo Cão Feliz Natal',
    'institution',
    'Natal',
    'Neópolis',
    'Resgatamos e reabilitamos animais em situação de rua em Natal e região metropolitana. 🐾❤️',
    '(84) 98888-9999',
    '32145678000199',
    NULL,
    'none',
    'inactive'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000010',
    'claramedeiros@email.com',
    'Clara Medeiros',
    'donor',
    'Parnamirim',
    'Cohabinal',
    'Mãe, servidora pública. Apoiadora de causas voltadas à educação infantil.',
    '(84) 98888-0000',
    NULL,
    '65432198709',
    'none',
    'inactive'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000011',
    'rncabos@email.com',
    'RN Cabos e Telecom',
    'company',
    'Natal',
    'Lagoa Nova',
    'Conectando o RN. Parceiro digital do terceiro setor. Assinante ESG Platina.',
    '(84) 99999-1111',
    '98765432000109',
    NULL,
    'mensal_platina',
    'active'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000012',
    'duda@email.com',
    'Maria Eduarda Dias',
    'volunteer',
    'Mossoró',
    'Centro',
    'Professora de música. Acreditando no poder do ritmo para incluir e integrar jovens. 🎵🎸',
    '(84) 99999-2222',
    NULL,
    '98732165402',
    'none',
    'inactive'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000013',
    'marcos@email.com',
    'Marcos Silveira',
    'volunteer',
    'Caicó',
    'Paraíba',
    'Agrônomo voluntário em hortas comunitárias e agricultura familiar sustentável no RN.',
    '(84) 99999-3333',
    NULL,
    '15975345602',
    'none',
    'inactive'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000014',
    'maosqueajudam@email.com',
    'ONG Mãos que Ajudam Seridó',
    'institution',
    'Caicó',
    'Centro',
    'Apoio a famílias sertanejas com cestas básicas, oficinas produtivas e reforço escolar. 🤝',
    '(84) 99999-4444',
    '98745612000188',
    NULL,
    'none',
    'inactive'
);

SELECT public.seed_user(
    '00000000-0000-0000-0000-000000000015',
    'lucaspinheiro@email.com',
    'Lucas Pinheiro',
    'donor',
    'Natal',
    'Candelária',
    'Estudante da UFRN, doador pontual de roupas e organizador de trocas sustentáveis.',
    '(84) 99999-5555',
    NULL,
    '85296374102',
    'none',
    'inactive'
);

-- Limpa a função temporária
DROP FUNCTION public.seed_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);


-- ══════════════════════════════════════════════════════════════════════
-- PARTE 3: CARGA DOS POSTS FICTÍCIOS NO FEED
-- ══════════════════════════════════════════════════════════════════════

-- Limpa postagens de seed anteriores se já existirem
DELETE FROM public.feed_posts WHERE author_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000015'
);

INSERT INTO public.feed_posts (id, author_id, author_name, author_type, content, image_url, city, badge, likes, comments, created_at)
VALUES 
(
    '00000000-0000-0000-0000-100000000001',
    '00000000-0000-0000-0000-000000000004',
    'Instituto Água Viva RN',
    'institution',
    '💧 Mais um poço artesiano instalado com sucesso em uma comunidade rural do Seridó! Com as doações dos nossos parceiros B2B, garantimos água potável para 45 famílias nesta semana. Acesse nosso painel de transparência de despesas e confira os comprovantes e notas de gastos lançados em tempo real! #TransparênciaESG #MutirãoRN',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    'Natal',
    NULL,
    154,
    2,
    NOW() - INTERVAL '20 minutes'
),
(
    '00000000-0000-0000-0000-100000000002',
    '00000000-0000-0000-0000-000000000001',
    'Supermercado Nordestão',
    'company',
    '🏪 Parceria de impacto! Anunciamos hoje a renovação da nossa assinatura ESG Ouro no Mutirão RN. Com isso, apoiamos recorrentemente 5 ONGs e garantimos 400 refeições por mês no Sopão Solidário. O selo ESG já está ativo em nosso perfil e nos canais digitais. Faça como o Nordestão e apoie causas locais!',
    NULL,
    'Natal',
    'Empresa Ouro ESG 🏆',
    98,
    1,
    NOW() - INTERVAL '1 hour'
),
(
    '00000000-0000-0000-0000-100000000003',
    '00000000-0000-0000-0000-000000000002',
    'Marina Vasconcelos',
    'volunteer',
    '🎨 Registros da oficina de pintura e colagem com as crianças do abrigo. Ver cada sorriso expressando sua criatividade na tela me dá forças de continuar. O voluntariado não é sobre doar o que sobra, mas sobre doar amor e atenção! #Voluntariado #ArteEducação',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    'Natal',
    'Mentor da Comunidade',
    210,
    1,
    NOW() - INTERVAL '3 hours'
),
(
    '00000000-0000-0000-0000-100000000004',
    '00000000-0000-0000-0000-000000000009',
    'Abrigo Cão Feliz Natal',
    'institution',
    '🐶 Hoje o dia foi de mutirão de vacinação e carinho nos nossos resgatados. Tivemos a visita de 12 voluntários que ajudaram a higienizar o espaço e passear com os cães. Agradecimento especial ao Hotel Miramar pela doação de ração e medicamentos. #ProteçãoAnimal #NatalRN',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    'Natal',
    NULL,
    340,
    1,
    NOW() - INTERVAL '5 hours'
),
(
    '00000000-0000-0000-0000-100000000005',
    '00000000-0000-0000-0000-000000000003',
    'Felipe Albuquerque',
    'donor',
    '🍲 Utilizei o fluxo de Apoio Expresso no meu painel e destinei R$ 150 para o fundo geral do Mutirão! Muito prático doar diretamente por lá e ver o andamento transparente de todas as contas do estado. Convido todos a doarem R$ 10 ou R$ 20. Juntos fazemos a diferença!',
    NULL,
    'Natal',
    'Doador Solidário ❤️',
    75,
    0,
    NOW() - INTERVAL '8 hours'
),
(
    '00000000-0000-0000-0000-100000000006',
    '00000000-0000-0000-0000-000000000013',
    'Marcos Silveira',
    'volunteer',
    '🌱 Nossa horta comunitária na Zona Norte de Natal está a todo vapor! Hoje colhemos 50kg de hortaliças sem agrotóxicos que alimentarão famílias cadastradas na associação. Obrigado aos voluntários pelo trabalho árduo na terra! #HortaComunitária #Sustentabilidade',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
    'Caicó',
    NULL,
    185,
    1,
    NOW() - INTERVAL '1 day'
),
(
    '00000000-0000-0000-0000-100000000007',
    '00000000-0000-0000-0000-000000000011',
    'RN Cabos e Telecom',
    'company',
    '💻 Conectividade de impacto! Finalizamos hoje a instalação de internet de fibra óptica de alta velocidade e doação de 5 computadores recondicionados no centro comunitário de apoio escolar. A inclusão digital abre portas para o mercado corporativo!',
    NULL,
    'Natal',
    'Empresa Ouro ESG 🏆',
    125,
    1,
    NOW() - INTERVAL '1 day'
);
