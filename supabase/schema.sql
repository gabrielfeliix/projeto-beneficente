-- Tabelas Supabase para o Projeto

-- Tabela Profiles: vinculada à tabela nativa auth.users do Supabase
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('volunteer', 'institution')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  city TEXT,
  neighborhood TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  help_types TEXT[] NOT NULL,
  main_need TEXT NOT NULL,
  financial_goal NUMERIC,
  financial_raised NUMERIC DEFAULT 0,
  cover_image TEXT,
  gallery TEXT[] DEFAULT '{}',
  contact TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Updates
CREATE TABLE updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('app', 'email', 'whatsapp')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas Campaigns
CREATE POLICY "Campaigns are viewable by everyone" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Users can insert their own campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = organizer_id);

-- Políticas Updates
CREATE POLICY "Updates are viewable by everyone" ON updates FOR SELECT USING (true);
CREATE POLICY "Campaign owners can insert updates" ON updates FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaigns WHERE id = updates.campaign_id AND organizer_id = auth.uid()
  )
);

-- Políticas Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
