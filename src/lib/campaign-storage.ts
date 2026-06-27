/* eslint-disable @typescript-eslint/no-explicit-any */
import { Campaign, UpdateRecord } from '@/domain/entities';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

const STORAGE_KEY = 'mutirao_campaign_storage';

function readLocalStorageStore(): Record<string, PersistedCampaignData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalStorageStore(store: Record<string, PersistedCampaignData>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error(err);
  }
}

export async function loadCampaignData(campaignId: string): Promise<PersistedCampaignData> {
  if (isSupabaseConfigured && supabase) {
    try {
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
    } catch (err) {
      console.error("Error querying Supabase in loadCampaignData:", err);
    }
  }

  // Fallback local storage
  const store = readLocalStorageStore();
  return store[campaignId] || { updates: [], settings: {}, notifications: [] };
}

export async function appendCampaignUpdate(campaignId: string, update: UpdateRecord & { updateType?: CampaignUpdateType }) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('updates').insert({
        campaign_id: campaignId,
        content: update.content,
        image_url: update.imageUrl,
        likes: update.likes,
        shares: update.shares,
        created_at: update.createdAt,
      });
      return;
    } catch (err) {
      console.error("Error in appendCampaignUpdate Supabase call:", err);
    }
  }

  // Fallback local storage
  const store = readLocalStorageStore();
  const currentData = store[campaignId] || { updates: [], settings: {}, notifications: [] };
  const nextUpdates = [update, ...currentData.updates];
  store[campaignId] = { ...currentData, updates: nextUpdates };
  writeLocalStorageStore(store);
}

export async function updateCampaignSettings(campaignId: string, settings: Partial<Campaign>) {
  if (isSupabaseConfigured && supabase) {
    try {
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
      return;
    } catch (err) {
      console.error("Error in updateCampaignSettings Supabase call:", err);
    }
  }

  // Fallback local storage
  const store = readLocalStorageStore();
  const currentData = store[campaignId] || { updates: [], settings: {}, notifications: [] };
  store[campaignId] = { ...currentData, settings: { ...currentData.settings, ...settings } };
  writeLocalStorageStore(store);
}

export async function addCampaignNotification(campaignId: string, notification: PersistedCampaignData['notifications'][number]) {
  if (isSupabaseConfigured && supabase) {
    try {
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
      return;
    } catch (err) {
      console.error("Error in addCampaignNotification Supabase call:", err);
    }
  }

  // Fallback local storage
  const store = readLocalStorageStore();
  const currentData = store[campaignId] || { updates: [], settings: {}, notifications: [] };
  const nextNotifs = [notification, ...currentData.notifications];
  store[campaignId] = { ...currentData, notifications: nextNotifs };
  writeLocalStorageStore(store);
}
