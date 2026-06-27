export type Category = 
  | 'Alimentação' 
  | 'Saúde' 
  | 'Educação' 
  | 'Animais' 
  | 'Desastres' 
  | 'Moradia' 
  | 'Esporte' 
  | 'Cultura' 
  | 'Meio Ambiente' 
  | 'Outro';

export type HelpType = 
  | 'Dinheiro' 
  | 'Alimentos' 
  | 'Roupas' 
  | 'Medicamentos' 
  | 'Serviços' 
  | 'Voluntários' 
  | 'Materiais' 
  | 'Equipamentos';

export type CampaignStatus = 'active' | 'completed' | 'paused';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  city: string;
  neighborhood: string;
  description?: string;
  phone?: string;
  instagram?: string;
  profileType?: string;
}

export type ProfileType = 'donor' | 'volunteer' | 'institution' | 'fiscal' | 'admin' | 'company';
export type InstitutionStatus = 'pending_approval' | 'approved' | 'rejected';

export interface Donor extends User {
  profileType: 'donor';
  cpf: string;
  birthDate: string;
  address: string;
  phone: string;
  acceptedTerms: boolean;
}

export interface Company extends User {
  profileType: 'company';
  cnpj: string;
  representativeName: string;
  address: string;
  phone: string;
  subscriptionPlan: 'none' | 'mensal_prata' | 'mensal_ouro' | 'mensal_platina';
  subscriptionStatus: 'active' | 'inactive';
  acceptedTerms: boolean;
}

export interface Volunteer extends User {
  profileType: 'volunteer';
  cpf: string;
  birthDate: string;
  address: string;
  profession?: string;
  availability?: string;
  interests?: string[];
  skills?: string[];
  emergencyContact?: string;
  acceptedTerms: boolean;
}

export interface Institution extends User {
  profileType: 'institution';
  cnpj: string;
  legalRepresentative: {
    name: string;
    cpf: string;
    rg: string;
    phone: string;
  };
  headquartersAddress: string;
  mission: string;
  objectives: string;
  serviceAreas: string[];
  publicServed: string;
  bankDetails: string;
  registeredDocuments: {
    socialStatute?: string;
    directorElectionAct?: string;
    cnpjCard?: string;
  };
  approvalStatus?: InstitutionStatus;
  approvalNotes?: string;
}

export interface JobPosting {
  id: string;
  institutionId: string;
  title: string;
  description: string;
  category: Category;
  city: string;
  neighborhood: string;
  modality: string;
  causes: string;
  postedAt: string;
  startDate: string;
  endDate: string;
  requirementsEssential: string[];
  requirementsOptional: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'open' | 'closed';
}

export interface Application {
  id: string;
  jobId: string;
  volunteerId: string;
  institutionId: string;
  jobTitle: string;
  institutionName: string;
  volunteerName: string;
  message: string;
  status: 'pending' | 'selected' | 'rejected';
  submittedAt: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorType: ProfileType;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  city?: string;
  badge?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  channel: 'app' | 'email' | 'whatsapp';
  createdAt: string;
  read: boolean;
}

export interface Campaign {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  category: Category;
  city: string;
  neighborhood: string;
  address?: string;
  helpTypes: HelpType[];
  mainNeed: string;
  financialGoal?: number;
  financialRaised?: number;
  endDate?: string;
  coverImage: string;
  gallery: string[];
  pixKey?: string;
  contact: string;
  tags: string[];
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRecord {
  id: string;
  campaignId: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  likes: number;
  shares: number;
}

export interface Review {
  id: string;
  campaignId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  donorId?: string;
  donorName: string;
  amount: number;
  paymentMethod: 'pix' | 'card';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Expense {
  id: string;
  campaignId: string;
  amount: number;
  category: 'Alimentação' | 'Combustível' | 'Infraestrutura' | 'Logística' | 'Serviços' | 'Outros';
  description: string;
  receiptUrl?: string;
  createdAt: string;
}

