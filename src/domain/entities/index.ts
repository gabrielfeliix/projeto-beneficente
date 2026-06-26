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
