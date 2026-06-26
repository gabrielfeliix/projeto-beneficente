import { Application, Campaign, FeedPost, Institution, JobPosting, Notification, Volunteer, User, UpdateRecord, Review } from '@/domain/entities';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Instituto Neo-Sertão',
    email: 'contato@neosertao.org',
    city: 'Natal',
    neighborhood: 'Filipe Camarão',
    description: 'Apoiamos a comunidade através de educação e cultura.',
    avatarUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dc8a?auto=format&fit=crop&q=80&w=200&h=200',
  },
  {
    id: 'user-2',
    name: 'Maria Silva',
    email: 'maria@email.com',
    city: 'Parnamirim',
    neighborhood: 'Nova Parnamirim',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
  }
];

export const mockVolunteers: Volunteer[] = [
  {
    id: 'vol-1',
    profileType: 'volunteer',
    name: 'Ana Beatriz',
    email: 'ana.beatriz@email.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    city: 'Natal',
    neighborhood: 'Ponta Negra',
    description: 'Voluntária com experiência em educação infantil e projetos sociais.',
    phone: '(84) 98888-7777',
    cpf: '123.456.789-00',
    birthDate: '1990-05-14',
    address: 'Rua das Palmeiras, 250',
    profession: 'Pedagoga',
    availability: 'Fins de semana e manhãs',
    interests: ['Educação', 'Meio Ambiente', 'Cultura'],
    skills: ['Mediação de conflitos', 'Organização de eventos', 'Ensino de leitura'],
    emergencyContact: 'João Beatriz - (84) 99999-0000',
    acceptedTerms: true,
  }
];

export const mockInstitutions: Institution[] = [
  {
    id: 'inst-1',
    profileType: 'institution',
    name: 'Instituto Água Viva',
    email: 'contato@aguaviva.org',
    city: 'Natal',
    neighborhood: 'Lagoa Nova',
    description: 'Apoiar educação, saúde e inclusão social por meio de ações comunitárias.',
    phone: '(84) 99999-1111',
    avatarUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=200&h=200',
    cnpj: '12.345.678/0001-90',
    legalRepresentative: {
      name: 'Carlos Pereira',
      cpf: '111.222.333-44',
      rg: '1234567-8',
      phone: '(84) 98877-6666',
    },
    headquartersAddress: 'Av. Coronel Estevam, 123',
    mission: 'Promover qualidade de vida e desenvolvimento social para famílias em situação de vulnerabilidade.',
    objectives: 'Fortalecer projetos de capacitação, saúde preventiva e cultura comunitária.',
    serviceAreas: ['Educação', 'Saúde', 'Ação social'],
    publicServed: 'Crianças, jovens e famílias em situação de vulnerabilidade.',
    bankDetails: 'Banco do Brasil | Agência 1234 | Conta 56789-0',
    registeredDocuments: {
      socialStatute: 'statute.pdf',
      directorElectionAct: 'election-act.pdf',
      cnpjCard: 'cnpj-card.pdf',
    },
  }
];

export const mockJobPostings: JobPosting[] = [
  {
    id: 'job-1',
    institutionId: 'inst-1',
    title: 'Facilitador de Oficinas de Leitura',
    description: 'Procura-se voluntário para conduzir oficinas de leitura semanais para crianças de 7 a 12 anos.',
    category: 'Educação',
    city: 'Natal',
    neighborhood: 'Lagoa Nova',
    modality: 'Presencial',
    causes: 'Educação infantil, desenvolvimento do hábito de leitura, inclusão social.',
    postedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 40 * 86400000).toISOString(),
    requirementsEssential: ['Disponibilidade aos sábados', 'Experiência com crianças', 'Boa comunicação'],
    requirementsOptional: ['Formação em pedagogia', 'Experiência em projetos sociais'],
    contactName: 'Mariana Silva',
    contactEmail: 'mariana@aguaviva.org',
    contactPhone: '(84) 98888-1111',
    status: 'open',
  },
  {
    id: 'job-2',
    institutionId: 'inst-1',
    title: 'Voluntário para Plantio e Limpeza',
    description: 'Apoie ações de limpeza e plantio em áreas verdes comunitárias.',
    category: 'Meio Ambiente',
    city: 'Natal',
    neighborhood: 'Redinha',
    modality: 'Presencial',
    causes: 'Recuperação ambiental, educação ambiental e mobilização comunitária.',
    postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 21 * 86400000).toISOString(),
    requirementsEssential: ['Disposição para trabalho físico', 'Responsabilidade', 'Compromisso com o grupo'],
    requirementsOptional: ['Experiência em campanhas ambientais'],
    contactName: 'Mariana Silva',
    contactEmail: 'mariana@aguaviva.org',
    contactPhone: '(84) 98888-1111',
    status: 'open',
  }
];

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    volunteerId: 'vol-1',
    institutionId: 'inst-1',
    jobTitle: 'Facilitador de Oficinas de Leitura',
    institutionName: 'Instituto Água Viva',
    volunteerName: 'Ana Beatriz',
    message: 'Tenho experiência com crianças e adoro projetos de leitura comunitária. Estou disponível aos sábados.',
    status: 'pending',
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

export const mockFeedPosts: FeedPost[] = [
  {
    id: 'post-1',
    authorId: 'vol-1',
    authorName: 'Ana Beatriz',
    authorType: 'volunteer',
    content: 'Hoje participei do projeto de leitura e vi o brilho nos olhos das crianças. É gratificante compartilhar esse momento.',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    likes: 32,
    comments: 8,
  },
  {
    id: 'post-2',
    authorId: 'inst-1',
    authorName: 'Instituto Água Viva',
    authorType: 'institution',
    content: 'Nossa equipe está organizando a próxima arrecadação de roupas para famílias em vulnerabilidade. Participe!',
    imageUrl: '/images/campaign_winter.png',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    likes: 56,
    comments: 14,
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'vol-1',
    title: 'Nova vaga publicada',
    message: 'Uma nova oportunidade de voluntariado em Educação foi publicada no seu perfil.',
    channel: 'app',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    userId: 'inst-1',
    title: 'Candidatura recebida',
    message: 'Uma nova candidatura foi enviada para a vaga de Facilitador de Oficinas de Leitura.',
    channel: 'email',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    read: false,
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    organizerId: 'user-1',
    title: 'A Chuva Levou Nossos Livros, Mas Não Nossa Esperança',
    description: 'Em uma única noite, as fortes chuvas destruíram o único espaço de leitura de centenas de crianças da nossa comunidade. Sem a biblioteca, elas perdem seu porto seguro. Precisamos de você para reconstruir esse sonho e devolver a magia da leitura para quem mais precisa.',
    category: 'Educação',
    city: 'Natal',
    neighborhood: 'Filipe Camarão',
    helpTypes: ['Dinheiro', 'Materiais', 'Voluntários'],
    mainNeed: 'Livros infantis e materiais de construção',
    financialGoal: 5000,
    financialRaised: 2350,
    coverImage: '/images/campaign_library.png',
    gallery: [],
    contact: '84999999999',
    tags: ['livros', 'educação', 'reforma'],
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'camp-2',
    organizerId: 'user-2',
    title: 'Aqueça Uma Vida Neste Inverno',
    description: 'O frio severo das ruas não perdoa, e dezenas de famílias no centro da cidade dormem ao relento todas as noites. Um simples cobertor pode ser a diferença entre o sofrimento e uma noite digna. Junte-se a nós para levar calor humano a quem foi esquecido.',
    category: 'Moradia',
    city: 'Natal',
    neighborhood: 'Centro',
    helpTypes: ['Roupas', 'Voluntários'],
    mainNeed: 'Cobertores e agasalhos',
    coverImage: '/images/campaign_winter.png',
    gallery: [],
    contact: '84988888888',
    tags: ['inverno', 'agasalho'],
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'camp-3',
    organizerId: 'user-1',
    title: 'Salve os Focinhos Abandonados de Parnamirim',
    description: 'Dezenas de animais são resgatados das ruas todos os meses, doentes e famintos. Nosso abrigo está lotado e não temos mais ração para a próxima semana. Se eles não tiverem o que comer, não terão chance de sobrevivência.',
    category: 'Animais',
    city: 'Parnamirim',
    neighborhood: 'Passagem de Areia',
    helpTypes: ['Alimentos', 'Medicamentos', 'Dinheiro'],
    mainNeed: 'Ração e Remédios',
    financialGoal: 2000,
    financialRaised: 500,
    coverImage: '/images/campaign_animals.png',
    gallery: [],
    contact: '84977777777',
    tags: ['animais', 'resgate'],
    status: 'active',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'camp-4',
    organizerId: 'user-2',
    title: 'O Esporte Salva Nossas Crianças',
    description: 'Na comunidade, o campinho de terra é o único lugar onde os jovens encontram disciplina e alegria longe dos perigos das ruas. Mas jogamos descalços e com uma bola furada. Você pode transformar o futuro deles doando chuteiras e bolas novas.',
    category: 'Esporte',
    city: 'Mossoró',
    neighborhood: 'Abolição',
    helpTypes: ['Materiais', 'Equipamentos', 'Dinheiro'],
    mainNeed: 'Bolas e Chuteiras',
    financialGoal: 1500,
    financialRaised: 1200,
    coverImage: '/images/campaign_sports.png',
    gallery: [],
    contact: '84966666666',
    tags: ['futebol', 'crianças', 'esporte'],
    status: 'active',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'camp-5',
    organizerId: 'user-1',
    title: 'Remédios que Curam e Trazem Alívio',
    description: 'Nossa unidade comunitária de saúde está sem os curativos e antibióticos básicos para tratar idosos com feridas crônicas. O sofrimento deles é silencioso, mas a nossa ação pode mudar isso hoje mesmo.',
    category: 'Saúde',
    city: 'Natal',
    neighborhood: 'Rocas',
    helpTypes: ['Medicamentos', 'Materiais'],
    mainNeed: 'Curativos e Gaze',
    coverImage: '/images/campaign_health.png',
    gallery: [],
    contact: '84955555555',
    tags: ['idosos', 'saúde'],
    status: 'active',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  }
];

export const mockUpdates: UpdateRecord[] = [
  {
    id: 'upd-1',
    campaignId: 'camp-1',
    content: 'Graças a você, compramos as telhas! Falta pouco para as crianças voltarem a sorrir.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    likes: 24,
    shares: 5,
    imageUrl: '/images/campaign_library.png'
  },
  {
    id: 'upd-2',
    campaignId: 'camp-1',
    content: 'Recebemos uma doação de 50 livros infantis! É emocionante ver a estante ganhando vida novamente.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    likes: 45,
    shares: 12,
  },
  {
    id: 'upd-3',
    campaignId: 'camp-2',
    content: 'Missão cumprida! 30 pessoas dormirão aquecidas esta noite por causa do seu apoio incondicional.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    likes: 12,
    shares: 2,
    imageUrl: '/images/campaign_winter.png'
  }
];

export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    campaignId: 'camp-1',
    userId: 'user-2',
    rating: 5,
    comment: 'Projeto incrível e muito transparente! Entregam muito resultado para a comunidade.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  }
];
