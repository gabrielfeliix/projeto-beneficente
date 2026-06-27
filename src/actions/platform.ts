'use server';

import {
  Application,
  FeedPost,
  Institution,
  JobPosting,
  Notification,
  Volunteer,
} from '@/domain/entities';
import {
  mockApplications,
  mockFeedPosts,
  mockInstitutions,
  mockJobPostings,
  mockNotifications,
  mockVolunteers,
} from '@/data/mock';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Mapeamentos específicos do banco de dados (snake_case) para as Entidades do Domínio (camelCase)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDBProfile(db: any): Volunteer | Institution | null {
  if (!db) return null;
  
  const baseUser = {
    id: db.id,
    name: db.name,
    email: db.email,
    avatarUrl: db.avatar_url || undefined,
    city: db.city || 'Não informada',
    neighborhood: db.neighborhood || 'Não informado',
    description: db.description || undefined,
    phone: db.phone || undefined,
    instagram: db.instagram || undefined,
  };

  if (db.profile_type === 'volunteer') {
    return {
      ...baseUser,
      profileType: 'volunteer',
      cpf: db.cpf || '',
      birthDate: db.birth_date || '',
      address: db.address || '',
      profession: db.profession || undefined,
      availability: db.availability || undefined,
      interests: db.interests || [],
      skills: db.skills || [],
      emergencyContact: db.emergency_contact || undefined,
      acceptedTerms: db.accepted_terms || false,
    } as Volunteer;
  } else {
    return {
      ...baseUser,
      profileType: 'institution',
      cnpj: db.cnpj || '',
      legalRepresentative: {
        name: db.representative_name || '',
        cpf: db.representative_cpf || '',
        rg: db.representative_rg || '',
        phone: db.representative_phone || '',
      },
      headquartersAddress: db.headquarters_address || '',
      mission: db.mission || '',
      objectives: db.objectives || '',
      serviceAreas: db.service_areas || [],
      publicServed: db.public_served || '',
      bankDetails: db.bank_details || '',
      registeredDocuments: {
        socialStatute: db.social_statute || undefined,
        directorElectionAct: db.director_election_act || undefined,
        cnpjCard: db.cnpj_card || undefined,
      },
    } as Institution;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDBJob(db: any): JobPosting {
  return {
    id: db.id,
    institutionId: db.institution_id,
    title: db.title,
    description: db.description,
    category: db.category,
    city: db.city,
    neighborhood: db.neighborhood,
    modality: db.modality,
    causes: db.causes,
    postedAt: db.posted_at,
    startDate: db.start_date,
    endDate: db.end_date,
    requirementsEssential: db.requirements_essential || [],
    requirementsOptional: db.requirements_optional || [],
    contactName: db.contact_name,
    contactEmail: db.contact_email,
    contactPhone: db.contact_phone,
    status: db.status,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDBApplication(db: any): Application {
  return {
    id: db.id,
    jobId: db.job_id,
    volunteerId: db.volunteer_id,
    institutionId: db.institution_id,
    jobTitle: db.job_title,
    institutionName: db.institution_name,
    volunteerName: db.volunteer_name,
    message: db.message,
    status: db.status,
    submittedAt: db.submitted_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDBFeedPost(db: any): FeedPost {
  return {
    id: db.id,
    authorId: db.author_id,
    authorName: db.author_name,
    authorType: db.author_type,
    content: db.content,
    imageUrl: db.image_url || undefined,
    createdAt: db.created_at,
    likes: db.likes || 0,
    comments: db.comments || 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDBNotification(db: any): Notification {
  return {
    id: db.id,
    userId: db.user_id,
    title: db.title,
    message: db.message,
    channel: db.channel,
    createdAt: db.created_at,
    read: db.read || false,
  };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getVolunteers(): Promise<Volunteer[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('profile_type', 'volunteer');

    if (error) {
      console.error('Error in getVolunteers:', error.message);
      return [];
    }
    return (data || []).map(mapDBProfile).filter((p): p is Volunteer => p?.profileType === 'volunteer');
  }

  // Fallback
  await delay(400);
  return [...mockVolunteers];
}

export async function getInstitutions(): Promise<Institution[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('profile_type', 'institution');

    if (error) {
      console.error('Error in getInstitutions:', error.message);
      return [];
    }
    return (data || []).map(mapDBProfile).filter((p): p is Institution => p?.profileType === 'institution');
  }

  // Fallback
  await delay(400);
  return [...mockInstitutions];
}

export async function getJobs(): Promise<JobPosting[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('posted_at', { ascending: false });

    if (error) {
      console.error('Error in getJobs:', error.message);
      return [];
    }
    return (data || []).map(mapDBJob);
  }

  // Fallback
  await delay(500);
  return [...mockJobPostings].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

export async function getJobById(id: string): Promise<JobPosting | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error in getJobById:', error.message);
      return null;
    }
    return data ? mapDBJob(data) : null;
  }

  // Fallback
  await delay(300);
  return mockJobPostings.find((job) => job.id === id) || null;
}

export async function getApplicationsForVolunteer(volunteerId: string): Promise<Application[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('volunteer_id', volunteerId);

    if (error) {
      console.error('Error in getApplicationsForVolunteer:', error.message);
      return [];
    }
    return (data || []).map(mapDBApplication);
  }

  // Fallback
  await delay(400);
  return mockApplications.filter((application) => application.volunteerId === volunteerId);
}

export async function getApplicationsForInstitution(institutionId: string): Promise<Application[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('institution_id', institutionId);

    if (error) {
      console.error('Error in getApplicationsForInstitution:', error.message);
      return [];
    }
    return (data || []).map(mapDBApplication);
  }

  // Fallback
  await delay(400);
  return mockApplications.filter((application) => application.institutionId === institutionId);
}

export async function getFeedPosts(): Promise<FeedPost[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getFeedPosts:', error.message);
      return [];
    }
    return (data || []).map(mapDBFeedPost);
  }

  // Fallback
  await delay(400);
  return [...mockFeedPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error in getNotifications:', error.message);
      return [];
    }
    return (data || []).map(mapDBNotification);
  }

  // Fallback
  await delay(300);
  return mockNotifications.filter((notification) => notification.userId === userId);
}

export async function getProfile(userId: string): Promise<Volunteer | Institution | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error in getProfile:', error.message);
      return null;
    }
    return data ? mapDBProfile(data) : null;
  }

  // Fallback
  await delay(300);
  const matched =
    mockVolunteers.find((profile) => profile.id === userId) ||
    mockInstitutions.find((profile) => profile.id === userId);
  return matched || null;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "pending" | "selected" | "rejected"
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", applicationId);

    if (error) {
      console.error("Error in updateApplicationStatus:", error.message);
      return false;
    }
    return true;
  }

  await delay(200);
  const found = mockApplications.find((a) => a.id === applicationId);
  if (found) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (found as any).status = status;
    return true;
  }
  return false;
}
