/* eslint-disable @typescript-eslint/no-explicit-any */
import { Campaign, UpdateRecord } from '@/domain/entities';
import { supabase } from '@/lib/supabase';

export type CampaignUpdateType = 'purchase' | 'milestone' | 'urgency' | 'completion';

export interface PersistedCampaignData {
  updates: Array<UpdateRecord & { updateType?: CampaignUpdateType }>;
  settings: Partial<Campaign>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    channel: 'app' | 'email' | 'whatsapp';
    createdAt: string;
    read: boolean;
  }>;
}

export async function loadCampaignData(campaignId: string): Promise<PersistedCampaignData> {
  const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();
  const { data: updates } = await supabase.from('updates').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false });

  return {
    settings: campaign ? {
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      city: campaign.city,
      neighborhood: campaign.neighborhood,
      helpTypes: campaign.help_types,
      mainNeed: campaign.main_need,
      financialGoal: campaign.financial_goal,
      financialRaised: campaign.financial_raised,
      coverImage: campaign.cover_image,
      gallery: campaign.gallery,
      contact: campaign.contact,
      tags: campaign.tags,
      status: campaign.status,
    } : {},
    updates: updates ? updates.map((u: any) => ({
      id: u.id,
      campaignId: u.campaign_id,
      content: u.content,
      imageUrl: u.image_url,
      likes: u.likes,
      shares: u.shares,
      createdAt: u.created_at,
    })) : [],
    notifications: [],
  };
}

export async function appendCampaignUpdate(campaignId: string, update: UpdateRecord & { updateType?: CampaignUpdateType }) {
  await supabase.from('updates').insert({
    campaign_id: campaignId,
    content: update.content,
    image_url: update.imageUrl,
    likes: update.likes,
    shares: update.shares,
    created_at: update.createdAt,
  });
}

export async function updateCampaignSettings(campaignId: string, settings: Partial<Campaign>) {
  const payload: any = {};
  if (settings.title) payload.title = settings.title;
  if (settings.description) payload.description = settings.description;
  if (settings.mainNeed) payload.main_need = settings.mainNeed;
  if (settings.financialGoal) payload.financial_goal = settings.financialGoal;
  if (settings.contact) payload.contact = settings.contact;
  if (settings.neighborhood) payload.neighborhood = settings.neighborhood;
  if (settings.city) payload.city = settings.city;
  payload.updated_at = new Date().toISOString();

  await supabase.from('campaigns').update(payload).eq('id', campaignId);
}

export async function addCampaignNotification(campaignId: string, notification: PersistedCampaignData['notifications'][number]) {
  // Simplificado para o escopo atual, inserindo para o dono da campanha
  const { data: campaign } = await supabase.from('campaigns').select('organizer_id').eq('id', campaignId).single();
  if (campaign) {
    await supabase.from('notifications').insert({
      user_id: campaign.organizer_id,
      title: notification.title,
      message: notification.message,
      channel: notification.channel,
      read: notification.read,
      created_at: notification.createdAt,
    });
  }
}
