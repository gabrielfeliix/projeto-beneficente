const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1].trim();
    }
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const profiles = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Ana Beatriz',
    email: 'ana@email.com',
    city: 'Natal',
    neighborhood: 'Ponta Negra',
    description: 'Voluntária dedicada a apoiar crianças do RN e projetos de leitura.',
    phone: '(84) 98888-7777',
    profile_type: 'volunteer',
    cpf: '12345678909',
    birth_date: '1990-05-14',
    address: 'Rua das Palmeiras, 250, Ponta Negra',
    profession: 'Pedagoga',
    availability: 'Fins de semana',
    skills: ['Ensino de leitura', 'Mediação'],
    accepted_terms: true
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Instituto Água Viva',
    email: 'aguaviva@email.com',
    city: 'Natal',
    neighborhood: 'Tirol',
    description: 'ONG voltada à preservação ambiental e acesso a recursos básicos.',
    phone: '(84) 99888-1111',
    profile_type: 'institution',
    cnpj: '08323491000102',
    representative_name: 'Julio Silva',
    representative_cpf: '98765432100',
    headquarters_address: 'Av. Hermes da Fonseca, 1200, Tirol',
    mission: 'Garantir água potável e sustentabilidade ao interior do RN.',
    objectives: 'Perfuração de poços artesianos e educação ecológica.',
    service_areas: ['Meio Ambiente', 'Recursos Básicos'],
    accepted_terms: true
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Supermercado Nordestão',
    email: 'nordestao@email.com',
    city: 'Natal',
    neighborhood: 'Lagoa Nova',
    description: 'Empresa parceira com selo ESG ativo focado em alimentação e combate à fome.',
    phone: '(84) 98000-3333',
    profile_type: 'company',
    cnpj: '12345678000109',
    representative_name: 'Geraldo Bezerra',
    representative_cpf: '45678912300',
    headquarters_address: 'Av. Salgado Filho, 1000',
    mission: 'Alimentar o RN gerando impacto local sustentável.',
    accepted_terms: true
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Felipe Albuquerque',
    email: 'felipe@email.com',
    city: 'Natal',
    neighborhood: 'Capim Macio',
    description: 'Apoiador regular de causas sociais em Natal.',
    phone: '(84) 99111-2222',
    profile_type: 'donor',
    cpf: '55566677788',
    birth_date: '1985-09-21',
    address: 'Rua Praia de Genipabu, 45',
    accepted_terms: true
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Juliana Santos',
    email: 'juliana@email.com',
    city: 'Parnamirim',
    neighborhood: 'Nova Parnamirim',
    description: 'Bióloga e protetora voluntária de animais resgatados.',
    phone: '(84) 99444-5555',
    profile_type: 'volunteer',
    cpf: '98765432100',
    birth_date: '1992-12-05',
    address: 'Av. Maria Lacerda, 400',
    profession: 'Bióloga',
    availability: 'Sábados e domingos',
    skills: ['Cuidado animal', 'Logística'],
    accepted_terms: true
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'ONG Mãos que Ajudam',
    email: 'maos@email.com',
    city: 'Caicó',
    neighborhood: 'Centro',
    description: 'Instituição de apoio alimentar e oficinas de panificação comunitária.',
    phone: '(84) 99444-2222',
    profile_type: 'institution',
    cnpj: '85432109000188',
    representative_name: 'Clarice Dantas',
    representative_cpf: '55544433322',
    headquarters_address: 'Rua Pedro Velho, 45, Centro, Caicó',
    mission: 'Alimentação digna e capacitação de famílias no Seridó.',
    objectives: 'Entrega de sopões e oficinas profissionalizantes.',
    service_areas: ['Alimentação', 'Capacitação'],
    accepted_terms: true
  }
];

const campaigns = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    organizer_id: '00000000-0000-0000-0000-000000000002',
    title: 'Marmitas Solidárias Filipe Camarão',
    description: 'Campanha mensal para produção e distribuição de 300 refeições para famílias desabrigadas da região oeste de Natal.',
    category: 'Alimentação',
    city: 'Natal',
    neighborhood: 'Filipe Camarão',
    address: 'Rua da Fé, 12',
    help_types: ['Financeiro', 'Alimento'],
    main_need: 'Arroz, feijão e carne para preparo',
    financial_goal: 5000.00,
    financial_raised: 3450.00,
    end_date: '2026-08-30',
    cover_image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
    pix_key: 'doacoes@aguaviva.org',
    contact: '(84) 99888-1111',
    status: 'active'
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    organizer_id: '00000000-0000-0000-0000-000000000006',
    title: 'Refeitório Comunitário e Sopão do Seridó',
    description: 'Manutenção do refeitório social em Caicó, garantindo sopão gratuito aos sábados para 150 idosos e crianças.',
    category: 'Alimentação',
    city: 'Caicó',
    neighborhood: 'Centro',
    address: 'Rua Pedro Velho, 45',
    help_types: ['Financeiro', 'Voluntariado'],
    main_need: 'Ingredientes para sopa e embalagens descartáveis',
    financial_goal: 3000.00,
    financial_raised: 3000.00,
    end_date: '2026-07-15',
    cover_image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    pix_key: 'pix@maosqueajudam.org',
    contact: '(84) 99444-2222',
    status: 'completed'
  }
];

const jobPostings = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    institution_id: '00000000-0000-0000-0000-000000000002',
    title: 'Facilitador de Oficinas de Leitura',
    description: 'Auxiliar crianças na alfabetização básica e leitura de histórias aos sábados pela manhã no centro comunitário.',
    category: 'Educação',
    city: 'Natal',
    neighborhood: 'Tirol',
    modality: 'Presencial',
    causes: 'Educação infantil',
    start_date: '2026-07-01',
    end_date: '2026-12-31',
    requirements_essential: ['Paciência', 'Gostar de crianças'],
    contact_name: 'Julio Silva',
    contact_email: 'aguaviva@email.com',
    contact_phone: '(84) 99888-1111',
    status: 'open',
    duration_type: 'continuous',
    weekly_hours: 4
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    institution_id: '00000000-0000-0000-0000-000000000006',
    title: 'Cozinheiro para Sopão Solidário',
    description: 'Auxiliar no preparo de panelas de sopa e higienização dos insumos na sede da ONG em Caicó.',
    category: 'Alimentação',
    city: 'Caicó',
    neighborhood: 'Centro',
    modality: 'Presencial',
    causes: 'Combate à fome',
    start_date: '2026-07-01',
    end_date: '2026-09-30',
    requirements_essential: ['Noções básicas de cozinha', 'Higiene'],
    contact_name: 'Clarice Dantas',
    contact_email: 'maos@email.com',
    contact_phone: '(84) 99444-2222',
    status: 'open',
    duration_type: 'continuous',
    weekly_hours: 6
  }
];

const feedPosts = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    author_id: '00000000-0000-0000-0000-000000000002',
    author_name: 'Instituto Água Viva',
    author_type: 'institution',
    content: '💧 Mais um poço artesiano instalado com sucesso em uma comunidade rural do Seridó! Com as doações dos nossos parceiros, garantimos água potável para 45 famílias nesta semana. Acesse nosso painel de transparência de despesas e confira os comprovantes lançados em tempo real! #TransparênciaESG #MutirãoRN',
    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    likes: 47,
    comments: 12
  },
  {
    id: '60000000-0000-0000-0000-000000000003',
    author_id: '00000000-0000-0000-0000-000000000001',
    author_name: 'Ana Beatriz',
    author_type: 'volunteer',
    content: 'Hoje participei do projeto de leitura e vi o brilho nos olhos das crianças. Uma delas me perguntou se podia levar o livro para casa. Sem dúvida a melhor parte do meu sábado. Isso é o voluntariado! 💛',
    image_url: null,
    likes: 89,
    comments: 18
  }
];

const applications = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    job_id: '20000000-0000-0000-0000-000000000001',
    volunteer_id: '00000000-0000-0000-0000-000000000001',
    institution_id: '00000000-0000-0000-0000-000000000002',
    job_title: 'Facilitador de Oficinas de Leitura',
    institution_name: 'Instituto Água Viva',
    volunteer_name: 'Ana Beatriz',
    message: 'Olá! Sou pedagoga e amo trabalhar com literatura infantil. Gostaria muito de apoiar as oficinas de vocês!',
    status: 'selected',
    submitted_at: new Date('2026-06-25T14:00:00Z').toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    job_id: '20000000-0000-0000-0000-000000000002',
    volunteer_id: '00000000-0000-0000-0000-000000000005',
    institution_id: '00000000-0000-0000-0000-000000000006',
    job_title: 'Cozinheiro para Sopão Solidário',
    institution_name: 'ONG Mãos que Ajudam',
    volunteer_name: 'Juliana Santos',
    message: 'Olá! Tenho facilidade com cozinha e gostaria de apoiar no preparo do sopão aos sábados.',
    status: 'pending',
    submitted_at: new Date('2026-06-26T14:00:00Z').toISOString()
  }
];

const donations = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    campaign_id: '10000000-0000-0000-0000-000000000001',
    donor_id: '00000000-0000-0000-0000-000000000004',
    donor_name: 'Felipe Albuquerque',
    amount: 150.00,
    payment_method: 'pix',
    status: 'completed'
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    campaign_id: '10000000-0000-0000-0000-000000000001',
    donor_id: '00000000-0000-0000-0000-000000000003',
    donor_name: 'Supermercado Nordestão (ESG)',
    amount: 500.00,
    payment_method: 'pix',
    status: 'completed'
  }
];

const expenses = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    campaign_id: '10000000-0000-0000-0000-000000000001',
    amount: 450.00,
    category: 'Alimentação',
    description: 'Compra de 100kg de feijão carioca e 50kg de arroz agulha.',
    receipt_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    campaign_id: '10000000-0000-0000-0000-000000000001',
    amount: 180.00,
    category: 'Logística',
    description: 'Pagamento de frete para entrega das cestas e marmitas.',
    receipt_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400'
  }
];

async function seed() {
  console.log('Iniciando inserção via API...');
  
  // 1. Profiles
  for (const item of profiles) {
    const { error } = await supabase.from('profiles').upsert(item);
    if (error) console.error(`Erro no perfil ${item.name}:`, error.message);
    else console.log(`Perfil inserido: ${item.name}`);
  }

  // 2. Campaigns
  for (const item of campaigns) {
    const { error } = await supabase.from('campaigns').upsert(item);
    if (error) console.error(`Erro na campanha ${item.title}:`, error.message);
    else console.log(`Campanha inserida: ${item.title}`);
  }

  // 3. Job Postings
  for (const item of jobPostings) {
    const { error } = await supabase.from('job_postings').upsert(item);
    if (error) console.error(`Erro na vaga ${item.title}:`, error.message);
    else console.log(`Vaga inserida: ${item.title}`);
  }

  // 4. Feed Posts
  for (const item of feedPosts) {
    const { error } = await supabase.from('feed_posts').upsert(item);
    if (error) console.error(`Erro no post do feed ${item.id}:`, error.message);
    else console.log(`Post do feed inserido: ${item.id}`);
  }

  // 5. Applications
  for (const item of applications) {
    const { error } = await supabase.from('applications').upsert(item);
    if (error) console.error(`Erro na candidatura ${item.id}:`, error.message);
    else console.log(`Candidatura inserida: ${item.id}`);
  }

  // 6. Donations
  for (const item of donations) {
    const { error } = await supabase.from('donations').upsert(item);
    if (error) console.error(`Erro na doação ${item.id}:`, error.message);
    else console.log(`Doação inserida: ${item.id}`);
  }

  // 7. Expenses
  for (const item of expenses) {
    const { error } = await supabase.from('expenses').upsert(item);
    if (error) console.error(`Erro na despesa ${item.id}:`, error.message);
    else console.log(`Despesa inserida: ${item.id}`);
  }

  console.log('Processo finalizado.');
}

seed();
