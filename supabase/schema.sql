-- SCHEMA DE BANCO DE DADOS PARA PLATAFORMA MUTIRÃO (SUPABASE)
-- Execute este script no SQL Editor do seu projeto Supabase para criar as tabelas necessárias.

-- 1. Tabela de Perfis de Usuários (Estende auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
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
    
    -- Campos específicos de Voluntários
    cpf TEXT,
    birth_date DATE,
    address TEXT,
    profession TEXT,
    availability TEXT,
    interests TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    emergency_contact TEXT,
    
    -- Campos específicos de ONGs / Instituições
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
    
    -- Arquivos de documentação da ONG (URLs ou nomes)
    social_statute TEXT,
    director_election_act TEXT,
    cnpj_card TEXT,
    
    accepted_terms BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security) na tabela profiles (DESABILITADO PARA SEED/UPLOAD)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se já existirem
DROP POLICY IF EXISTS "Qualquer um pode ler perfis" ON public.profiles;
DROP POLICY IF EXISTS "Qualquer um pode atualizar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Qualquer um pode criar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios perfis" ON public.profiles;

-- Criar novas políticas flexíveis
CREATE POLICY "Qualquer um pode ler perfis" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Qualquer um pode atualizar perfis" ON public.profiles
    FOR UPDATE USING (true);

CREATE POLICY "Qualquer um pode criar perfis" ON public.profiles
    FOR INSERT WITH CHECK (true);


-- 2. Tabela de Campanhas Beneficentes
CREATE TABLE IF NOT EXISTS public.campaigns (
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

-- ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se já existirem
DROP POLICY IF EXISTS "Qualquer um pode ler campanhas" ON public.campaigns;
DROP POLICY IF EXISTS "ONGs autenticadas podem criar campanhas" ON public.campaigns;
DROP POLICY IF EXISTS "Organizadores podem atualizar suas campanhas" ON public.campaigns;
DROP POLICY IF EXISTS "Organizadores podem deletar suas campanhas" ON public.campaigns;

-- Criar novas políticas
CREATE POLICY "Qualquer um pode ler campanhas" ON public.campaigns
    FOR SELECT USING (true);

CREATE POLICY "ONGs autenticadas podem criar campanhas" ON public.campaigns
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizadores podem atualizar suas campanhas" ON public.campaigns
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Organizadores podem deletar suas campanhas" ON public.campaigns
    FOR DELETE USING (auth.uid() = organizer_id);


-- 3. Tabela de Atualizações de Campanhas (Updates)
CREATE TABLE IF NOT EXISTS public.updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0
);

-- ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se já existirem
DROP POLICY IF EXISTS "Qualquer um pode ler atualizações" ON public.updates;
DROP POLICY IF EXISTS "Organizadores podem criar atualizações" ON public.updates;

-- Criar novas políticas
CREATE POLICY "Qualquer um pode ler atualizações" ON public.updates
    FOR SELECT USING (true);

CREATE POLICY "Organizadores podem criar atualizações" ON public.updates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND organizer_id = auth.uid()
        )
    );


-- 4. Tabela de Vagas de Voluntariado (Job Postings)
CREATE TABLE IF NOT EXISTS public.job_postings (
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

-- ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se já existirem
DROP POLICY IF EXISTS "Qualquer um pode ler vagas" ON public.job_postings;
DROP POLICY IF EXISTS "ONGs podem criar vagas" ON public.job_postings;
DROP POLICY IF EXISTS "ONGs podem editar suas vagas" ON public.job_postings;

-- Criar novas políticas
CREATE POLICY "Qualquer um pode ler vagas" ON public.job_postings
    FOR SELECT USING (true);

CREATE POLICY "ONGs podem criar vagas" ON public.job_postings
    FOR INSERT WITH CHECK (auth.uid() = institution_id);

CREATE POLICY "ONGs podem editar suas vagas" ON public.job_postings
    FOR UPDATE USING (auth.uid() = institution_id);


-- 5. Tabela de Candidaturas a Vagas (Applications)
CREATE TABLE IF NOT EXISTS public.applications (
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

-- ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se já existirem
DROP POLICY IF EXISTS "Voluntários podem ver suas candidaturas" ON public.applications;
DROP POLICY IF EXISTS "ONGs podem ver candidaturas recebidas" ON public.applications;
DROP POLICY IF EXISTS "Voluntários podem se candidatar" ON public.applications;
DROP POLICY IF EXISTS "ONGs podem atualizar status da candidatura" ON public.applications;

-- Criar novas políticas
CREATE POLICY "Voluntários podem ver suas candidaturas" ON public.applications
    FOR SELECT USING (auth.uid() = volunteer_id);

CREATE POLICY "ONGs podem ver candidaturas recebidas" ON public.applications
    FOR SELECT USING (auth.uid() = institution_id);

CREATE POLICY "Voluntários podem se candidatar" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = volunteer_id);

CREATE POLICY "ONGs podem atualizar status da candidatura" ON public.applications
    FOR UPDATE USING (auth.uid() = institution_id);


-- 5.5. Tabela de Certificados Emitidos
CREATE TABLE IF NOT EXISTS public.certificates (
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

-- ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se já existirem
DROP POLICY IF EXISTS "Qualquer um pode ler certificados" ON public.certificates;
DROP POLICY IF EXISTS "Voluntários leem seus próprios certificados" ON public.certificates;
DROP POLICY IF EXISTS "ONGs emitem certificados" ON public.certificates;

-- Criar novas políticas
CREATE POLICY "Qualquer um pode ler certificados" ON public.certificates
    FOR SELECT USING (true);

CREATE POLICY "Voluntários leem seus próprios certificados" ON public.certificates
    FOR SELECT USING (auth.uid() = volunteer_id);

CREATE POLICY "ONGs emitem certificados" ON public.certificates
    FOR INSERT WITH CHECK (true);


-- 6. Tabela de Postagens no Feed
CREATE TABLE IF NOT EXISTS public.feed_posts (
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

-- ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se já existirem
DROP POLICY IF EXISTS "Qualquer um pode ler o feed" ON public.feed_posts;
DROP POLICY IF EXISTS "Usuários autenticados podem postar no feed" ON public.feed_posts;

-- Criar novas políticas
CREATE POLICY "Qualquer um pode ler o feed" ON public.feed_posts
    FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem postar no feed" ON public.feed_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);


-- 7. Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('app', 'email', 'whatsapp')) DEFAULT 'app',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read BOOLEAN DEFAULT FALSE
);

-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se já existirem
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem atualizar leitura de suas notificações" ON public.notifications;

-- Criar novas políticas
CREATE POLICY "Usuários podem ver suas próprias notificações" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar leitura de suas notificações" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);


-- 8. Trigger automático para criar Perfil quando um novo usuário se cadastrar via Google ou E-mail
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
        'volunteer', -- Default type
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger executando após a inserção em auth.users
-- Dropa se já existir para evitar conflitos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 9. Tabela de Doações
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    donor_name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'card')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode ver doações completadas" ON public.donations;
DROP POLICY IF EXISTS "Doadores podem ver suas próprias doações" ON public.donations;
DROP POLICY IF EXISTS "Qualquer um pode doar" ON public.donations;

CREATE POLICY "Qualquer um pode ver doações completadas" ON public.donations
    FOR SELECT USING (true);

CREATE POLICY "Doadores podem ver suas próprias doações" ON public.donations
    FOR SELECT USING (auth.uid() = donor_id);

CREATE POLICY "Qualquer um pode doar" ON public.donations
    FOR INSERT WITH CHECK (true);

-- 10. Tabela de Despesas da ONG (Prestação de Contas)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('Alimentação', 'Combustível', 'Infraestrutura', 'Logística', 'Serviços', 'Outros')),
    description TEXT NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode ver despesas" ON public.expenses;
DROP POLICY IF EXISTS "Organizadores podem adicionar despesas" ON public.expenses;

CREATE POLICY "Qualquer um pode ver despesas" ON public.expenses
    FOR SELECT USING (true);

CREATE POLICY "Organizadores podem adicionar despesas" ON public.expenses
    FOR INSERT WITH CHECK (true);

