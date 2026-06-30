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
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    organizer_id: '00000000-0000-0000-0000-000000000006',
    title: 'Natal Sem Fome no Seridó',
    description: 'Campanha de arrecadação especial para montagem e distribuição de cestas básicas completas para 300 famílias em vulnerabilidade alimentar extrema no sertão do Seridó durante as festas de fim de ano.',
    category: 'Alimentação',
    city: 'Caicó',
    neighborhood: 'Paraíba',
    address: 'Rua do Comércio, 120',
    help_types: ['Financeiro', 'Alimento'],
    main_need: 'Cestas básicas alimentares e feijão verde',
    financial_goal: 8000.00,
    financial_raised: 3200.00,
    end_date: '2026-12-25',
    cover_image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
    pix_key: 'natal@maosqueajudam.org',
    contact: '(84) 99444-2222',
    status: 'active'
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    organizer_id: '00000000-0000-0000-0000-000000000001',
    title: 'Reflorestamento das Dunas de Genipabu',
    description: 'Mutirão de conservação e plantio de mudas de espécies nativas nas áreas degradadas das Dunas de Genipabu. Venha fazer a diferença botando a mão na massa ou nos ajudando a obter insumos ecológicos.',
    category: 'Meio Ambiente',
    city: 'Extremoz',
    neighborhood: 'Genipabu',
    address: 'Av. Beira Mar, S/N',
    help_types: ['Voluntariado'],
    main_need: 'Mudas nativas da caatinga/mata atlântica, ferramentas',
    financial_goal: 3000.00,
    financial_raised: 1500.00,
    end_date: '2026-10-15',
    cover_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    pix_key: 'reflorestar@email.com',
    contact: '(84) 99888-7777',
    status: 'active'
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    organizer_id: '00000000-0000-0000-0000-000000000002',
    title: 'Visão Para a Melhor Idade',
    description: 'Ação comunitária para financiar consultas com oftalmologistas e exames visuais gratuitos, além da confecção e entrega de óculos de grau sob medida para idosos carentes do Alecrim.',
    category: 'Saúde',
    city: 'Natal',
    neighborhood: 'Alecrim',
    address: 'Rua São Pedro, 450',
    help_types: ['Financeiro'],
    main_need: 'Financiamento de armações e lentes oftálmicas',
    financial_goal: 10000.00,
    financial_raised: 4500.00,
    end_date: '2026-11-30',
    cover_image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=800',
    pix_key: 'visao@aguaviva.org',
    contact: '(84) 99888-1111',
    status: 'active'
  },
  {
    id: '10000000-0000-0000-0000-000000000009',
    organizer_id: '00000000-0000-0000-0000-000000000002',
    title: 'Inclusão nos Acordes: Música na Escola',
    description: 'Ajude-nos a equipar a primeira sala de música comunitária da Cohabinal com instrumentos novos e semi-novos. A música ensina disciplina, criatividade e acolhimento para jovens da periferia.',
    category: 'Cultura',
    city: 'Parnamirim',
    neighborhood: 'Cohabinal',
    address: 'Rua da Cultura, 89',
    help_types: ['Financeiro', 'Equipamento'],
    main_need: 'Flautas, violões, violinos e baterias eletrônicas',
    financial_goal: 5000.00,
    financial_raised: 4800.00,
    end_date: '2026-09-15',
    cover_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
    pix_key: 'musica@aguaviva.org',
    contact: '(84) 99888-1111',
    status: 'active'
  },
  {
    id: '10000000-0000-0000-0000-000000000010',
    organizer_id: '00000000-0000-0000-0000-000000000005',
    title: 'Agasalhe um Amigo de Quatro Patas',
    description: 'Arrecadação urgente de cobertores velhos, roupinhas e rações especiais de alta proteína para preparar nosso abrigo de animais para as noites frias de inverno na região metropolitana.',
    category: 'Animais',
    city: 'Natal',
    neighborhood: 'Neópolis',
    address: 'Av. Ayrton Senna, 3000',
    help_types: ['Alimento', 'Financeiro'],
    main_need: 'Caminhas, mantas térmicas e ração filhote',
    financial_goal: 2500.00,
    financial_raised: 1200.00,
    end_date: '2026-08-30',
    cover_image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    pix_key: 'petlove@email.com',
    contact: '(84) 99444-5555',
    status: 'active'
  },
  {
    id: '10000000-0000-0000-0000-000000000011',
    organizer_id: '00000000-0000-0000-0000-000000000002',
    title: 'Horta Escolar Sustentável',
    description: 'Construção de uma horta de ervas e hortaliças orgânicas na escola municipal para ensinar sustentabilidade prática às crianças e complementar as merendas com insumos de alta qualidade.',
    category: 'Educação',
    city: 'Natal',
    neighborhood: 'Lagoa Azul',
    address: 'Rua das Flores, 50',
    help_types: ['Voluntariado'],
    main_need: 'Compostagem, sementes de tomate, alface e coentro',
    financial_goal: 1200.00,
    financial_raised: 900.00,
    end_date: '2026-09-30',
    cover_image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    pix_key: 'horta@aguaviva.org',
    contact: '(84) 99888-1111',
    status: 'active'
  },
  {
    id: '10000000-0000-0000-0000-000000000012',
    organizer_id: '00000000-0000-0000-0000-000000000005',
    title: 'Reformando Sorrisos - Apoio a Mães Solo',
    description: 'Campanha de empoderamento e assistência odontológica e psicológica básica para mães solo da periferia de Macaíba, oferecendo oficinas de capacitação de panificação e palestras.',
    category: 'Outro',
    city: 'Macaíba',
    neighborhood: 'Centro',
    address: 'Rua da Cruz, 12',
    help_types: ['Financeiro', 'Voluntariado'],
    main_need: 'Kits de escovação bucal e insumos de costura',
    financial_goal: 3500.00,
    financial_raised: 2800.00,
    end_date: '2026-09-15',
    cover_image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    pix_key: 'maessolo@email.com',
    contact: '(84) 99444-5555',
    status: 'active'
  },
  {
    id: '10000000-0000-0000-0000-000000000013',
    organizer_id: '00000000-0000-0000-0000-000000000002',
    title: 'Inclusão Digital para Idosos',
    description: 'Projeto de inclusão social e segurança digital para a melhor idade. Queremos obter computadores e tablets portáteis para ensinar os vovôs e vovós a usarem os aplicativos do cotidiano com segurança.',
    category: 'Cultura',
    city: 'Natal',
    neighborhood: 'Petrópolis',
    address: 'Av. Prudente de Morais, 1500',
    help_types: ['Equipamento', 'Voluntariado'],
    main_need: 'Tablets de 10 polegadas, carregadores portáteis',
    financial_goal: 4000.00,
    financial_raised: 2100.00,
    end_date: '2026-10-31',
    cover_image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=800',
    pix_key: 'idosotech@aguaviva.org',
    contact: '(84) 99888-1111',
    status: 'active'
  },
  {
    id: '10000000-0000-0000-0000-000000000014',
    organizer_id: '00000000-0000-0000-0000-000000000005',
    title: 'Esporte Comunitário e Cidadania',
    description: 'Revitalização da quadra de esportes comunitária do bairro Planalto com pintura das marcações, novas redes de vôlei e basquete e distribuição de bolas e uniformes para os times infantis da área.',
    category: 'Esporte',
    city: 'Natal',
    neighborhood: 'Planalto',
    address: 'Rua Esportiva, S/N',
    help_types: ['Financeiro', 'Equipamento'],
    main_need: 'Redes de quadra, tintas acrílicas, bolas oficiais',
    financial_goal: 2000.00,
    financial_raised: 1900.00,
    end_date: '2026-08-15',
    cover_image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800',
    pix_key: 'esporteplanalto@email.com',
    contact: '(84) 99444-5555',
    status: 'active'
  },
  {
    id: '10000000-0000-0000-0000-000000000015',
    organizer_id: '00000000-0000-0000-0000-000000000002',
    title: 'Primeiros Passos - Enxoval Solidário',
    description: 'Confecção e entrega de kits de enxoval de maternidade com roupas, banheiras e fraldas descartáveis para gestantes carentes atendidas nas maternidades públicas da Zona Norte de Natal.',
    category: 'Saúde',
    city: 'Natal',
    neighborhood: 'Nossa Senhora da Apresentação',
    address: 'Av. das Fronteiras, 400',
    help_types: ['Alimento', 'Financeiro'],
    main_need: 'Fraldas RN/P, sabonetes neutros, mantas de algodão',
    financial_goal: 6000.00,
    financial_raised: 3100.00,
    end_date: '2026-09-10',
    cover_image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    pix_key: 'enxoval@aguaviva.org',
    contact: '(84) 99888-1111',
    status: 'active'
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
  },
  {
    id: '20000000-0000-0000-0000-000000000011',
    institution_id: '00000000-0000-0000-0000-000000000002',
    title: 'Educador Social de Informática',
    description: 'Ensine conceitos básicos de informática e navegação na internet para crianças e jovens atendidos por nossos projetos sociais.',
    category: 'Educação',
    city: 'Natal',
    neighborhood: 'Tirol',
    modality: 'Presencial',
    causes: 'Inclusão digital, educação de jovens',
    start_date: '2026-07-06',
    end_date: '2026-08-14',
    requirements_essential: ['Domínio básico de computação', 'Boa comunicação', 'Paciência para lecionar'],
    requirements_optional: ['Experiência anterior com ensino', 'Conhecimento em informática para escritório'],
    contact_name: 'Carlos Pereira',
    contact_email: 'carlos@aguaviva.org',
    contact_phone: '(84) 3232-1111',
    status: 'open',
    duration_type: 'continuous',
    weekly_hours: 4
  },
  {
    id: '20000000-0000-0000-0000-000000000012',
    institution_id: '00000000-0000-0000-0000-000000000002',
    title: 'Apoio em Eventos de Adoção de Animais',
    description: 'Buscamos voluntários para apoiar a logística, transporte e divulgação dos cães e gatos em nossas feiras e eventos de adoção aos sábados.',
    category: 'Animais',
    city: 'Parnamirim',
    neighborhood: 'Emaús',
    modality: 'Presencial',
    causes: 'Proteção animal, adoção responsável',
    start_date: '2026-07-05',
    end_date: '2026-07-30',
    requirements_essential: ['Gostar de animais domésticos', 'Boa comunicação para lidar com o público'],
    requirements_optional: ['Experiência prévia em feiras de adoção', 'Habilidades de fotografia básica'],
    contact_name: 'Rodrigo Almeida',
    contact_email: 'rodrigo@resgatevivoong.org',
    contact_phone: '(84) 3444-5555',
    status: 'open',
    duration_type: 'point',
    weekly_hours: 6
  },
  {
    id: '20000000-0000-0000-0000-000000000013',
    institution_id: '00000000-0000-0000-0000-000000000006',
    title: 'Auxiliar de Triagem de Agasalhos',
    description: 'Participe do nosso comitê de triagem para separar, lavar e dobrar cobertores e agasalhos arrecadados na campanha de inverno antes da distribuição.',
    category: 'Outro',
    city: 'Natal',
    neighborhood: 'Alecrim',
    modality: 'Presencial',
    causes: 'Assistência a moradores de rua, ação solidária',
    start_date: '2026-07-02',
    end_date: '2026-07-15',
    requirements_essential: ['Disponibilidade às terças ou quintas à tarde', 'Organização e capricho'],
    requirements_optional: ['Trabalho em equipe no terceiro setor'],
    contact_name: 'Ana Paula Rocha',
    contact_email: 'ana@maosqueajudam.org',
    contact_phone: '(84) 3333-2222',
    status: 'open',
    duration_type: 'point',
    weekly_hours: 3
  },
  {
    id: '20000000-0000-0000-0000-000000000014',
    institution_id: '00000000-0000-0000-0000-000000000006',
    title: 'Criador de Conteúdo para Redes Sociais',
    description: 'Escreva textos curtos, prepare postagens e stories para nossa página social para divulgar as atividades culturais que realizamos com os jovens.',
    category: 'Cultura',
    city: 'Mossoró',
    neighborhood: 'Online',
    modality: 'À Distância',
    causes: 'Arte e cultura, comunicação para impacto',
    start_date: '2026-07-10',
    end_date: '2026-09-28',
    requirements_essential: ['Habilidade em redação digital', 'Familiaridade com Instagram e TikTok'],
    requirements_optional: ['Conhecimento básico em Canva ou Photoshop'],
    contact_name: 'Sandra Reis',
    contact_email: 'sandra@artenaperiferiaong.org',
    contact_phone: '(84) 3555-6666',
    status: 'open',
    duration_type: 'continuous',
    weekly_hours: 5
  },
  {
    id: '20000000-0000-0000-0000-000000000015',
    institution_id: '00000000-0000-0000-0000-000000000002',
    title: 'Voluntário de Recepção no Mutirão de Saúde',
    description: 'Apoie nosso mutirão mensal de saúde preenchendo as fichas dos pacientes e ajudando a orientar as filas e prioridades de atendimento.',
    category: 'Saúde',
    city: 'Natal',
    neighborhood: 'Rocas',
    modality: 'Presencial',
    causes: 'Saúde preventiva, cidadania',
    start_date: '2026-07-08',
    end_date: '2026-07-20',
    requirements_essential: ['Organização e simpatia', 'Disponibilidade aos sábados'],
    requirements_optional: ['Experiência anterior com atendimento ao público'],
    contact_name: 'Dr. Marcos Vieira',
    contact_email: 'marcos@saudeparatodos.org',
    contact_phone: '(84) 3666-7777',
    status: 'open',
    duration_type: 'point',
    weekly_hours: 8
  },
  {
    id: '20000000-0000-0000-0000-000000000016',
    institution_id: '00000000-0000-0000-0000-000000000002',
    title: 'Professor Voluntário de Matemática / Reforço',
    description: 'Ofereça aulas de reforço escolar de matemática básica para alunos do ensino fundamental I em situação de atraso de aprendizado.',
    category: 'Educação',
    city: 'Natal',
    neighborhood: 'Lagoa Nova',
    modality: 'Presencial',
    causes: 'Reforço escolar, incentivo aos estudos',
    start_date: '2026-07-04',
    end_date: '2026-09-02',
    requirements_essential: ['Conhecimento sólido de matemática básica', 'Boa didática infantil'],
    requirements_optional: ['Licenciatura em pedagogia ou matemática em curso'],
    contact_name: 'Carlos Pereira',
    contact_email: 'carlos@aguaviva.org',
    contact_phone: '(84) 3232-1111',
    status: 'open',
    duration_type: 'continuous',
    weekly_hours: 4
  },
  {
    id: '20000000-0000-0000-0000-000000000017',
    institution_id: '00000000-0000-0000-0000-000000000006',
    title: 'Designer Gráfico para Flyers de Eventos',
    description: 'Crie a identidade e materiais de divulgação digitais para nossos próximos bazares solidários e arrecadações de alimentos.',
    category: 'Cultura',
    city: 'Caicó',
    neighborhood: 'Online',
    modality: 'À Distância',
    causes: 'Design para o bem, comunicação visual',
    start_date: '2026-07-03',
    end_date: '2026-08-17',
    requirements_essential: ['Domínio de ferramentas de design', 'Envio de portfólio simples'],
    requirements_optional: ['Experiência de trabalho em ONGs'],
    contact_name: 'Ana Paula Rocha',
    contact_email: 'ana@maosqueajudam.org',
    contact_phone: '(84) 3333-2222',
    status: 'open',
    duration_type: 'continuous',
    weekly_hours: 5
  },
  {
    id: '20000000-0000-0000-0000-000000000018',
    institution_id: '00000000-0000-0000-0000-000000000006',
    title: 'Organizador de Horta Urbana',
    description: 'Apoie o plantio e o cuidado diário de hortas comunitárias urbanas focadas em alimentar famílias vulneráveis no bairro Alecrim.',
    category: 'Meio Ambiente',
    city: 'Natal',
    neighborhood: 'Alecrim',
    modality: 'Presencial',
    causes: 'Sustentabilidade urbana, soberania alimentar',
    start_date: '2026-07-05',
    end_date: '2026-09-03',
    requirements_essential: ['Interesse ou experiência com agricultura urbana ou jardinagem', 'Trabalho ao ar livre'],
    requirements_optional: ['Conhecimento sobre compostagem e rotação de culturas'],
    contact_name: 'Ana Paula Rocha',
    contact_email: 'ana@maosqueajudam.org',
    contact_phone: '(84) 3333-2222',
    status: 'open',
    duration_type: 'continuous',
    weekly_hours: 6
  },
  {
    id: '20000000-0000-0000-0000-000000000019',
    institution_id: '00000000-0000-0000-0000-000000000002',
    title: 'Recreador Infantil de Fim de Semana',
    description: 'Ajude a planejar e aplicar brincadeiras de rua, jogos cooperativos e contação de histórias para crianças aos sábados no Tirol.',
    category: 'Educação',
    city: 'Natal',
    neighborhood: 'Tirol',
    modality: 'Presencial',
    causes: 'Recreação, inclusão social pelo esporte',
    start_date: '2026-07-04',
    end_date: '2026-08-03',
    requirements_essential: ['Grande carisma, facilidade com crianças', 'Disponibilidade aos sábados pela manhã'],
    requirements_optional: ['Experiência como monitor escolar ou recreador infantil'],
    contact_name: 'Julio Silva',
    contact_email: 'aguaviva@email.com',
    contact_phone: '(84) 99888-1111',
    status: 'open',
    duration_type: 'continuous',
    weekly_hours: 4
  },
  {
    id: '20000000-0000-0000-0000-000000000020',
    institution_id: '00000000-0000-0000-0000-000000000002',
    title: 'Dentista Voluntário para Orientação Oral',
    description: 'Procuramos profissionais formados em odontologia ou estudantes do último ano para ministrar palestras e atividades de orientação para escovação e cuidados básicos das Rocas.',
    category: 'Saúde',
    city: 'Natal',
    neighborhood: 'Rocas',
    modality: 'Presencial',
    causes: 'Higiene bucal infantil, promoção da saúde',
    start_date: '2026-07-10',
    end_date: '2026-07-25',
    requirements_essential: ['CRO ativo ou comprovação de último período da faculdade', 'Empatia e didática com crianças'],
    requirements_optional: ['Experiência prévia em eventos de promoção à saúde'],
    contact_name: 'Dr. Marcos Vieira',
    contact_email: 'marcos@saudeparatodos.org',
    contact_phone: '(84) 3666-7777',
    status: 'open',
    duration_type: 'point',
    weekly_hours: 4
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
  },
  {
    id: '60000000-0000-0000-0000-000000000011',
    author_id: '00000000-0000-0000-0000-000000000001',
    author_name: 'Ana Beatriz',
    author_type: 'volunteer',
    content: 'Iniciamos a triagem dos livros que recebemos ontem! Fiquei impressionada com a quantidade e qualidade das doações. A leitura abre novos horizontes e mal posso esperar para colocar estes livros na prateleira da biblioteca reconstruída! Obrigado!',
    image_url: null,
    likes: 35,
    comments: 4
  },
  {
    id: '60000000-0000-0000-0000-000000000012',
    author_id: '00000000-0000-0000-0000-000000000006',
    author_name: 'ONG Mãos que Ajudam',
    author_type: 'institution',
    content: 'Que dia incrível! Concluímos a entrega de 45 kits de enxoval para mães solo na comunidade. Ver a emoção no rosto de cada mãe nos dá a certeza de que estamos no caminho certo. Obrigado aos nossos voluntários costureiros!',
    image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    likes: 112,
    comments: 15
  },
  {
    id: '60000000-0000-0000-0000-000000000013',
    author_id: '00000000-0000-0000-0000-000000000005',
    author_name: 'Juliana Santos',
    author_type: 'volunteer',
    content: 'Acabei de dar o deploy no novo site do Instituto Água Viva! Um trabalho feito com muito carinho de forma 100% voluntária. Espero que a plataforma ajude o instituto a conseguir ainda mais parceiros e transparência em suas doações. 💻✨',
    image_url: null,
    likes: 85,
    comments: 24
  },
  {
    id: '60000000-0000-0000-0000-000000000014',
    author_id: '00000000-0000-0000-0000-000000000003',
    author_name: 'Supermercado Nordestão',
    author_type: 'company',
    content: 'Nosso time participou de uma gincana interna e arrecadou mais de 500kg de alimentos não perecíveis! Hoje fizemos a entrega na sede do Sopão Solidário. O voluntariado corporativo é parte da nossa cultura de ESG no RN! 🍎🤝',
    image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
    likes: 195,
    comments: 31
  },
  {
    id: '60000000-0000-0000-0000-000000000015',
    author_id: '00000000-0000-0000-0000-000000000001',
    author_name: 'Ana Beatriz',
    author_type: 'volunteer',
    content: 'Muito gratificante participar do atendimento de apoio jurídico em Macaíba. Ajudamos a resolver 15 casos de regularização de documentos e registro civil hoje. Justiça social começa com dignidade básica e cidadania!',
    image_url: null,
    likes: 140,
    comments: 12
  },
  {
    id: '60000000-0000-0000-0000-000000000016',
    author_id: '00000000-0000-0000-0000-000000000002',
    author_name: 'Instituto Água Viva',
    author_type: 'institution',
    content: 'Agradecemos de coração a todos os profissionais de saúde que voluntariaram seu tempo no mutirão das Rocas neste sábado. Foram mais de 80 atendimentos pediátricos realizados! Prevenção é vida e amor ao próximo.',
    image_url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=800',
    likes: 220,
    comments: 48
  },
  {
    id: '60000000-0000-0000-0000-000000000017',
    author_id: '00000000-0000-0000-0000-000000000005',
    author_name: 'Juliana Santos',
    author_type: 'volunteer',
    content: 'Tarde fantástica plantando mudas nas Dunas de Genipabu! O ar fresco, o suor na testa e a sensação de estar devolvendo algo para a natureza do nosso maravilhoso RN. Vamos preservar nossas belezas naturais! 🌳🌊',
    image_url: null,
    likes: 95,
    comments: 8
  },
  {
    id: '60000000-0000-0000-0000-000000000018',
    author_id: '00000000-0000-0000-0000-000000000006',
    author_name: 'ONG Mãos que Ajudam',
    author_type: 'institution',
    content: 'Nossa oficina de teatro de sombras foi um sucesso total entre os jovens da periferia de Mossoró! A arte nos ensina a olhar para dentro e criar novas realidades. Agradecemos à professora Sandra pela condução impecável.',
    image_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800',
    likes: 80,
    comments: 11
  },
  {
    id: '60000000-0000-0000-0000-000000000019',
    author_id: '00000000-0000-0000-0000-000000000004',
    author_name: 'Felipe Albuquerque',
    author_type: 'donor',
    content: 'Fiz um PIX para a campanha "A Chuva Levou Nossos Livros". É de partir o coração ver o espaço das crianças destruído, mas sei que a força da nossa comunidade vai reconstruir um lugar ainda mais bonito! Colabore você também!',
    image_url: null,
    likes: 67,
    comments: 14
  },
  {
    id: '60000000-0000-0000-0000-000000000020',
    author_id: '00000000-0000-0000-0000-000000000005',
    author_name: 'Juliana Santos',
    author_type: 'volunteer',
    content: 'Tivemos a visita de dois veterinários parceiros no abrigo hoje. Todos os cachorrinhos e gatinhos passaram por exames preventivos de verminoses e foram vacinados. Eles estão prontos para receber uma família cheia de amor! Adote!',
    image_url: null,
    likes: 180,
    comments: 29
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
