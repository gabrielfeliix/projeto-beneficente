import { Campaign, UpdateRecord } from '@/domain/entities';

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

const STORAGE_KEY = 'mutirao_campaign_data_v1';

function readStore(): Record<string, PersistedCampaignData> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, PersistedCampaignData>) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function loadCampaignData(campaignId: string): PersistedCampaignData {
  const store = readStore();
  return store[campaignId] || { updates: [], settings: {}, notifications: [] };
}

export function saveCampaignData(campaignId: string, data: PersistedCampaignData) {
  const store = readStore();
  store[campaignId] = data;
  writeStore(store);
}

export function appendCampaignUpdate(campaignId: string, update: UpdateRecord & { updateType?: CampaignUpdateType }) {
  const data = loadCampaignData(campaignId);
  const nextUpdates = [update, ...data.updates];
  saveCampaignData(campaignId, { ...data, updates: nextUpdates });
}

export function updateCampaignSettings(campaignId: string, settings: Partial<Campaign>) {
  const data = loadCampaignData(campaignId);
  saveCampaignData(campaignId, { ...data, settings: { ...data.settings, ...settings } });
}

export function addCampaignNotification(campaignId: string, notification: PersistedCampaignData['notifications'][number]) {
  const data = loadCampaignData(campaignId);
  saveCampaignData(campaignId, { ...data, notifications: [notification, ...data.notifications] });
}
