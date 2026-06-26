'use server';

import { Campaign, UpdateRecord, User } from '@/domain/entities';
import { mockCampaigns, mockUpdates, mockUsers } from '@/data/mock';

// In a real app, this would query Supabase/PostgreSQL.
// Here we use our in-memory arrays. Note: server restarts will reset data.

export async function getCampaigns(): Promise<Campaign[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [...mockCampaigns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const campaign = mockCampaigns.find(c => c.id === id);
  return campaign || null;
}

export async function getCampaignUpdates(campaignId: string): Promise<UpdateRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockUpdates
    .filter(u => u.campaignId === campaignId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCampaignOrganizer(organizerId: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockUsers.find(u => u.id === organizerId) || null;
}

export async function getRecentUpdates(): Promise<(UpdateRecord & { campaign: Campaign })[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const recent = [...mockUpdates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return recent.map(update => {
    const campaign = mockCampaigns.find(c => c.id === update.campaignId)!;
    return { ...update, campaign };
  });
}
