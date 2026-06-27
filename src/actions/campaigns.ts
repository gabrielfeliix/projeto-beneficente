/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { Campaign, UpdateRecord, User } from '@/domain/entities';
import { supabase } from '@/lib/supabase';

export async function getCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  
  return data.map((c: any) => ({
    id: c.id,
    organizerId: c.organizer_id,
    title: c.title,
    description: c.description,
    category: c.category,
    city: c.city,
    neighborhood: c.neighborhood,
    helpTypes: c.help_types,
    mainNeed: c.main_need,
    financialGoal: c.financial_goal,
    financialRaised: c.financial_raised,
    coverImage: c.cover_image,
    gallery: c.gallery,
    contact: c.contact,
    tags: c.tags,
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const { data: c, error } = await supabase.from('campaigns').select('*').eq('id', id).single();
  if (error || !c) return null;

  return {
    id: c.id,
    organizerId: c.organizer_id,
    title: c.title,
    description: c.description,
    category: c.category,
    city: c.city,
    neighborhood: c.neighborhood,
    helpTypes: c.help_types,
    mainNeed: c.main_need,
    financialGoal: c.financial_goal,
    financialRaised: c.financial_raised,
    coverImage: c.cover_image,
    gallery: c.gallery,
    contact: c.contact,
    tags: c.tags,
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

export async function getCampaignUpdates(campaignId: string): Promise<UpdateRecord[]> {
  const { data, error } = await supabase.from('updates').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false });
  if (error || !data) return [];

  return data.map((u: any) => ({
    id: u.id,
    campaignId: u.campaign_id,
    content: u.content,
    imageUrl: u.image_url,
    likes: u.likes,
    shares: u.shares,
    createdAt: u.created_at,
  }));
}

export async function getCampaignOrganizer(organizerId: string): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', organizerId).single();
  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    city: data.city,
    neighborhood: data.neighborhood,
    description: data.description,
    avatarUrl: data.avatar_url,
  };
}

export async function getRecentUpdates(): Promise<(UpdateRecord & { campaign: Campaign })[]> {
  const { data: updatesData, error: updatesError } = await supabase.from('updates').select('*, campaigns(*)').order('created_at', { ascending: false }).limit(10);
  if (updatesError || !updatesData) return [];

  return updatesData.map((u: any) => ({
    id: u.id,
    campaignId: u.campaign_id,
    content: u.content,
    imageUrl: u.image_url,
    likes: u.likes,
    shares: u.shares,
    createdAt: u.created_at,
    campaign: {
      id: u.campaigns.id,
      organizerId: u.campaigns.organizer_id,
      title: u.campaigns.title,
      description: u.campaigns.description,
      category: u.campaigns.category,
      city: u.campaigns.city,
      neighborhood: u.campaigns.neighborhood,
      helpTypes: u.campaigns.help_types,
      mainNeed: u.campaigns.main_need,
      financialGoal: u.campaigns.financial_goal,
      financialRaised: u.campaigns.financial_raised,
      coverImage: u.campaigns.cover_image,
      gallery: u.campaigns.gallery,
      contact: u.campaigns.contact,
      tags: u.campaigns.tags,
      status: u.campaigns.status,
      createdAt: u.campaigns.created_at,
      updatedAt: u.campaigns.updated_at,
    }
  }));
}
