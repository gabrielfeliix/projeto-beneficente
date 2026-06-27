'use server';

import { Campaign, UpdateRecord, User } from '@/domain/entities';
import { mockCampaigns, mockUpdates, mockUsers } from '@/data/mock';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Helper de mapeamento de banco snake_case para caminhos CamelCase do Domínio
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDBCampaign(db: any): Campaign {
  return {
    id: db.id,
    organizerId: db.organizer_id,
    title: db.title,
    description: db.description,
    category: db.category,
    city: db.city,
    neighborhood: db.neighborhood,
    address: db.address || undefined,
    helpTypes: db.help_types || [],
    mainNeed: db.main_need,
    financialGoal: db.financial_goal ? Number(db.financial_goal) : undefined,
    financialRaised: db.financial_raised ? Number(db.financial_raised) : undefined,
    endDate: db.end_date || undefined,
    coverImage: db.cover_image,
    gallery: db.gallery || [],
    pixKey: db.pix_key || undefined,
    contact: db.contact,
    tags: db.tags || [],
    status: db.status,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDBUpdate(db: any): UpdateRecord {
  return {
    id: db.id,
    campaignId: db.campaign_id,
    content: db.content,
    imageUrl: db.image_url || undefined,
    videoUrl: db.video_url || undefined,
    createdAt: db.created_at,
    likes: db.likes || 0,
    shares: db.shares || 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDBProfileToUser(db: any): User {
  return {
    id: db.id,
    name: db.name,
    email: db.email,
    avatarUrl: db.avatar_url || undefined,
    city: db.city || 'Não informada',
    neighborhood: db.neighborhood || 'Não informado',
    description: db.description || undefined,
    phone: db.phone || undefined,
    instagram: db.instagram || undefined,
    profileType: db.profile_type || undefined,
  };
}

export async function getCampaigns(): Promise<Campaign[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error in getCampaigns:', error.message);
      return [];
    }
    return (data || []).map(mapDBCampaign);
  }

  // Fallback

  return [...mockCampaigns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error in getCampaignById:', error.message);
      return null;
    }
    return data ? mapDBCampaign(data) : null;
  }

  // Fallback

  const campaign = mockCampaigns.find(c => c.id === id);
  return campaign || null;
}

export async function getCampaignUpdates(campaignId: string): Promise<UpdateRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getCampaignUpdates:', error.message);
      return [];
    }
    return (data || []).map(mapDBUpdate);
  }

  // Fallback

  return mockUpdates
    .filter(u => u.campaignId === campaignId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCampaignOrganizer(organizerId: string): Promise<User | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', organizerId)
      .maybeSingle();

    if (error) {
      console.error('Error in getCampaignOrganizer:', error.message);
      return null;
    }
    return data ? mapDBProfileToUser(data) : null;
  }

  // Fallback

  return mockUsers.find(u => u.id === organizerId) || null;
}

export async function getRecentUpdates(): Promise<(UpdateRecord & { campaign: Campaign })[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('updates')
      .select('*, campaign:campaigns(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getRecentUpdates:', error.message);
      return [];
    }

    return (data || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((update: any) => update.campaign) // Garante que a campanha associada existe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((update: any) => ({
        ...mapDBUpdate(update),
        campaign: mapDBCampaign(update.campaign),
      }));
  }

  // Fallback

  const recent = [...mockUpdates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return recent.map(update => {
    const campaign = mockCampaigns.find(c => c.id === update.campaignId)!;
    return { ...update, campaign };
  });
}
