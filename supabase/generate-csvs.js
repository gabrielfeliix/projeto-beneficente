const fs = require('fs');
const path = require('path');

const csvDir = path.join(__dirname, 'csv');
if (!fs.existsSync(csvDir)) {
  fs.mkdirSync(csvDir, { recursive: true });
}

function escapeCSV(val) {
  if (val === null || val === undefined) {
    return '';
  }
  let str = String(val);
  // If it has quotes, commas, or newlines, escape it
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
}

function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const YYYY = date.getUTCFullYear();
  const MM = String(date.getUTCMonth() + 1).padStart(2, '0');
  const DD = String(date.getUTCDate()).padStart(2, '0');
  const HH = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
}

function objectsToCSV(data, headers) {
  const headerRow = headers.join(',');
  const rows = data.map(item => {
    return headers.map(header => escapeCSV(item[header])).join(',');
  });
  return [headerRow, ...rows].join('\n');
}

// 1. profiles.csv
const profilesHeaders = [
  'id', 'name', 'email', 'avatar_url', 'city', 'neighborhood', 'description', 'phone', 'instagram', 'profile_type',
  'cpf', 'birth_date', 'address', 'profession', 'availability', 'interests', 'skills', 'emergency_contact',
  'cnpj', 'representative_name', 'representative_cpf', 'representative_rg', 'representative_phone', 'headquarters_address',
  'mission', 'objectives', 'service_areas', 'public_served', 'bank_details', 'social_statute', 'director_election_act',
  'cnpj_card', 'accepted_terms', 'created_at'
];

const profilesData = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Ana Beatriz',
    email: 'ana@email.com',
    avatar_url: null,
    city: 'Natal',
    neighborhood: 'Ponta Negra',
    description: 'Voluntária dedicada a apoiar crianças do RN e projetos de leitura.',
    phone: '(84) 98888-7777',
    instagram: null,
    profile_type: 'volunteer',
    cpf: '12345678909',
    birth_date: '1990-05-14',
    address: 'Rua das Palmeiras, 250, Ponta Negra',
    profession: 'Pedagoga',
    availability: 'Fins de semana',
    interests: '{}',
    skills: '{"Ensino de leitura","Mediação"}',
    emergency_contact: null,
    cnpj: null,
    representative_name: null,
    representative_cpf: null,
    representative_rg: null,
    representative_phone: null,
    headquarters_address: null,
    mission: null,
    objectives: null,
    service_areas: '{}',
    public_served: null,
    bank_details: null,
    social_statute: null,
    director_election_act: null,
    cnpj_card: null,
    accepted_terms: true,
    created_at: formatDateTime('2026-06-27T14:00:00Z')
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Instituto Água Viva',
    email: 'aguaviva@email.com',
    avatar_url: null,
    city: 'Natal',
    neighborhood: 'Tirol',
    description: 'ONG voltada à preservação ambiental e acesso a recursos básicos.',
    phone: '(84) 99888-1111',
    instagram: null,
    profile_type: 'institution',
    cpf: null,
    birth_date: null,
    address: null,
    profession: null,
    availability: null,
    interests: '{}',
    skills: '{}',
    emergency_contact: null,
    cnpj: '08323491000102',
    representative_name: 'Julio Silva',
    representative_cpf: '98765432100',
    representative_rg: null,
    representative_phone: null,
    headquarters_address: 'Av. Hermes da Fonseca, 1200, Tirol',
    mission: 'Garantir água potável e sustentabilidade ao interior do RN.',
    objectives: 'Perfuração de poços artesianos e educação ecológica.',
    service_areas: '{"Meio Ambiente","Recursos Básicos"}',
    public_served: null,
    bank_details: null,
    social_statute: null,
    director_election_act: null,
    cnpj_card: null,
    accepted_terms: true,
    created_at: formatDateTime('2026-06-27T14:00:00Z')
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Supermercado Nordestão',
    email: 'nordestao@email.com',
    avatar_url: null,
    city: 'Natal',
    neighborhood: 'Lagoa Nova',
    description: 'Empresa parceira com selo ESG ativo focado em alimentação e combate à fome.',
    phone: '(84) 98000-3333',
    instagram: null,
    profile_type: 'company',
    cpf: null,
    birth_date: null,
    address: null,
    profession: null,
    availability: null,
    interests: '{}',
    skills: '{}',
    emergency_contact: null,
    cnpj: '12345678000109',
    representative_name: 'Geraldo Bezerra',
    representative_cpf: '45678912300',
    representative_rg: null,
    representative_phone: null,
    headquarters_address: 'Av. Salgado Filho, 1000',
    mission: 'Alimentar o RN gerando impacto local sustentável.',
    objectives: null,
    service_areas: '{}',
    public_served: null,
    bank_details: null,
    social_statute: null,
    director_election_act: null,
    cnpj_card: null,
    accepted_terms: true,
    created_at: formatDateTime('2026-06-27T14:00:00Z')
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Felipe Albuquerque',
    email: 'felipe@email.com',
    avatar_url: null,
    city: 'Natal',
    neighborhood: 'Capim Macio',
    description: 'Apoiador regular de causas sociais em Natal.',
    phone: '(84) 99111-2222',
    instagram: null,
    profile_type: 'donor',
    cpf: '55566677788',
    birth_date: '1985-09-21',
    address: 'Rua Praia de Genipabu, 45',
    profession: null,
    availability: null,
    interests: '{}',
    skills: '{}',
    emergency_contact: null,
    cnpj: null,
    representative_name: null,
    representative_cpf: null,
    representative_rg: null,
    representative_phone: null,
    headquarters_address: null,
    mission: null,
    objectives: null,
    service_areas: '{}',
    public_served: null,
    bank_details: null,
    social_statute: null,
    director_election_act: null,
    cnpj_card: null,
    accepted_terms: true,
    created_at: formatDateTime('2026-06-27T14:00:00Z')
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Juliana Santos',
    email: 'juliana@email.com',
    avatar_url: null,
    city: 'Parnamirim',
    neighborhood: 'Nova Parnamirim',
    description: 'Bióloga e protetora voluntária de animais resgatados.',
    phone: '(84) 99444-5555',
    instagram: null,
    profile_type: 'volunteer',
    cpf: '98765432100',
    birth_date: '1992-12-05',
    address: 'Av. Maria Lacerda, 400',
    profession: 'Bióloga',
    availability: 'Sábados e domingos',
    interests: '{}',
    skills: '{"Cuidado animal","Logística"}',
    emergency_contact: null,
    cnpj: null,
    representative_name: null,
    representative_cpf: null,
    representative_rg: null,
    representative_phone: null,
    headquarters_address: null,
    mission: null,
    objectives: null,
    service_areas: '{}',
    public_served: null,
    bank_details: null,
    social_statute: null,
    director_election_act: null,
    cnpj_card: null,
    accepted_terms: true,
    created_at: formatDateTime('2026-06-27T14:00:00Z')
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'ONG Mãos que Ajudam',
    email: 'maos@email.com',
    avatar_url: null,
    city: 'Caicó',
    neighborhood: 'Centro',
    description: 'Instituição de apoio alimentar e oficinas de panificação comunitária.',
    phone: '(84) 99444-2222',
    instagram: null,
    profile_type: 'institution',
    cpf: null,
    birth_date: null,
    address: null,
    profession: null,
    availability: null,
    interests: '{}',
    skills: '{}',
    emergency_contact: null,
    cnpj: '85432109000188',
    representative_name: 'Clarice Dantas',
    representative_cpf: '55544433322',
    representative_rg: null,
    representative_phone: null,
    headquarters_address: 'Rua Pedro Velho, 45, Centro, Caicó',
    mission: 'Alimentação digna e capacitação de famílias no Seridó.',
    objectives: 'Entrega de sopões e oficinas profissionalizantes.',
    service_areas: '{"Alimentação","Capacitação"}',
    public_served: null,
    bank_details: null,
    social_statute: null,
    director_election_act: null,
    cnpj_card: null,
    accepted_terms: true,
    created_at: formatDateTime('2026-06-27T14:00:00Z')
  }
];

fs.writeFileSync(path.join(csvDir, 'profiles.csv'), objectsToCSV(profilesData, profilesHeaders));

// 2. campaigns.csv
const campaignsHeaders = [
  'id', 'organizer_id', 'title', 'description', 'category', 'city', 'neighborhood', 'address', 'help_types',
  'main_need', 'financial_goal', 'financial_raised', 'end_date', 'cover_image', 'gallery', 'pix_key', 'contact',
  'tags', 'status', 'created_at', 'updated_at'
];

const campaignsData = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    organizer_id: '00000000-0000-0000-0000-000000000002',
    title: 'Marmitas Solidárias Filipe Camarão',
    description: 'Campanha mensal para produção e distribuição de 300 refeições para famílias desabrigadas da região oeste de Natal.',
    category: 'Alimentação',
    city: 'Natal',
    neighborhood: 'Filipe Camarão',
    address: 'Rua da Fé, 12',
    help_types: '{"Financeiro","Alimento"}',
    main_need: 'Arroz, feijão e carne para preparo',
    financial_goal: 5000.00,
    financial_raised: 3450.00,
    end_date: '2026-08-30',
    cover_image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
    gallery: '{}',
    pix_key: 'doacoes@aguaviva.org',
    contact: '(84) 99888-1111',
    tags: '{}',
    status: 'active',
    created_at: formatDateTime('2026-06-27T14:00:00Z'),
    updated_at: formatDateTime('2026-06-27T14:00:00Z')
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
    help_types: '{"Financeiro","Voluntariado"}',
    main_need: 'Ingredientes para sopa e embalagens descartáveis',
    financial_goal: 3000.00,
    financial_raised: 3000.00,
    end_date: '2026-07-15',
    cover_image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    gallery: '{}',
    pix_key: 'pix@maosqueajudam.org',
    contact: '(84) 99444-2222',
    tags: '{}',
    status: 'completed',
    created_at: formatDateTime('2026-06-27T14:00:00Z'),
    updated_at: formatDateTime('2026-06-27T14:00:00Z')
  }
];

fs.writeFileSync(path.join(csvDir, 'campaigns.csv'), objectsToCSV(campaignsData, campaignsHeaders));

// 3. job_postings.csv
const jobPostingsHeaders = [
  'id', 'institution_id', 'title', 'description', 'category', 'city', 'neighborhood', 'modality', 'causes',
  'posted_at', 'start_date', 'end_date', 'requirements_essential', 'requirements_optional', 'contact_name',
  'contact_email', 'contact_phone', 'status', 'duration_type', 'weekly_hours', 'causes_tags', 'skills_tags'
];

const jobPostingsData = [
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
    posted_at: formatDateTime('2026-06-27T14:00:00Z'),
    start_date: '2026-07-01',
    end_date: '2026-12-31',
    requirements_essential: '{"Paciência","Gostar de crianças"}',
    requirements_optional: '{}',
    contact_name: 'Julio Silva',
    contact_email: 'aguaviva@email.com',
    contact_phone: '(84) 99888-1111',
    status: 'open',
    duration_type: 'continuous',
    weekly_hours: 4,
    causes_tags: '{}',
    skills_tags: '{}'
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
    posted_at: formatDateTime('2026-06-27T14:00:00Z'),
    start_date: '2026-07-01',
    end_date: '2026-09-30',
    requirements_essential: '{"Noções básicas de cozinha","Higiene"}',
    requirements_optional: '{}',
    contact_name: 'Clarice Dantas',
    contact_email: 'maos@email.com',
    contact_phone: '(84) 99444-2222',
    status: 'open',
    duration_type: 'continuous',
    weekly_hours: 6,
    causes_tags: '{}',
    skills_tags: '{}'
  }
];

fs.writeFileSync(path.join(csvDir, 'job_postings.csv'), objectsToCSV(jobPostingsData, jobPostingsHeaders));

// 4. applications.csv
const applicationsHeaders = [
  'id', 'job_id', 'volunteer_id', 'institution_id', 'job_title', 'institution_name', 'volunteer_name',
  'message', 'status', 'submitted_at', 'hours_logged', 'feedback_notes'
];

const applicationsData = [
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
    submitted_at: formatDateTime('2026-06-25T14:00:00Z'),
    hours_logged: 0,
    feedback_notes: null
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
    submitted_at: formatDateTime('2026-06-26T14:00:00Z'),
    hours_logged: 0,
    feedback_notes: null
  }
];

fs.writeFileSync(path.join(csvDir, 'applications.csv'), objectsToCSV(applicationsData, applicationsHeaders));

// 5. donations.csv
const donationsHeaders = [
  'id', 'campaign_id', 'donor_id', 'donor_name', 'amount', 'payment_method', 'status', 'created_at'
];

const donationsData = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    campaign_id: '10000000-0000-0000-0000-000000000001',
    donor_id: '00000000-0000-0000-0000-000000000004',
    donor_name: 'Felipe Albuquerque',
    amount: 150.00,
    payment_method: 'pix',
    status: 'completed',
    created_at: formatDateTime('2026-06-27T14:00:00Z')
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    campaign_id: '10000000-0000-0000-0000-000000000001',
    donor_id: '00000000-0000-0000-0000-000000000003',
    donor_name: 'Supermercado Nordestão (ESG)',
    amount: 500.00,
    payment_method: 'pix',
    status: 'completed',
    created_at: formatDateTime('2026-06-27T14:00:00Z')
  }
];

fs.writeFileSync(path.join(csvDir, 'donations.csv'), objectsToCSV(donationsData, donationsHeaders));

// 6. expenses.csv
const expensesHeaders = [
  'id', 'campaign_id', 'amount', 'category', 'description', 'receipt_url', 'created_at'
];

const expensesData = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    campaign_id: '10000000-0000-0000-0000-000000000001',
    amount: 450.00,
    category: 'Alimentação',
    description: 'Compra de 100kg de feijão carioca e 50kg de arroz agulha.',
    receipt_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=400',
    created_at: formatDateTime('2026-06-27T14:00:00Z')
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    campaign_id: '10000000-0000-0000-0000-000000000001',
    amount: 180.00,
    category: 'Logística',
    description: 'Pagamento de frete para entrega das cestas e marmitas.',
    receipt_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400',
    created_at: formatDateTime('2026-06-27T14:00:00Z')
  }
];

fs.writeFileSync(path.join(csvDir, 'expenses.csv'), objectsToCSV(expensesData, expensesHeaders));

// 7. feed_posts.csv
const feedPostsHeaders = [
  'id', 'author_id', 'author_name', 'author_type', 'content', 'image_url', 'created_at', 'likes', 'comments'
];

const feedPostsData = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    author_id: '00000000-0000-0000-0000-000000000002',
    author_name: 'Instituto Água Viva',
    author_type: 'institution',
    content: '💧 Mais um poço artesiano instalado com sucesso em uma comunidade rural do Seridó! Com as doações dos nossos parceiros, garantimos água potável para 45 famílias nesta semana. Acesse nosso painel de transparência de despesas e confira os comprovantes lançados em tempo real! #TransparênciaESG #MutirãoRN',
    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    created_at: formatDateTime('2026-06-27T14:00:00Z'),
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
    created_at: formatDateTime('2026-06-27T14:00:00Z'),
    likes: 89,
    comments: 18
  }
];

fs.writeFileSync(path.join(csvDir, 'feed_posts.csv'), objectsToCSV(feedPostsData, feedPostsHeaders));

console.log('Todos os arquivos CSV foram gerados com sucesso na pasta supabase/csv!');
