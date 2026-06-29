/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import {
  Application,
  FeedPost,
  Institution,
  JobPosting,
  Notification,
  Volunteer,
  Company,
} from '@/domain/entities';
import {
  mockApplications,
  mockFeedPosts,
  mockInstitutions,
  mockJobPostings,
  mockNotifications,
  mockVolunteers,
} from '@/data/mock';
import { supabase, isSupabaseConfigured, isUUID } from '@/lib/supabase';

// Mapeamentos específicos do banco de dados (snake_case) para as Entidades do Domínio (camelCase)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDBProfile(db: any): Volunteer | Institution | Company | null {
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
  } else if (db.profile_type === 'donor') {
    return {
      ...baseUser,
      profileType: 'donor',
      cpf: db.cpf || '',
      birthDate: db.birth_date || '',
      address: db.address || '',
      phone: db.phone || '',
      acceptedTerms: db.accepted_terms || false,
    } as any;
  } else if (db.profile_type === 'company') {
    return {
      ...baseUser,
      profileType: 'company',
      cnpj: db.cnpj || '',
      representativeName: db.representative_name || '',
      address: db.address || '',
      phone: db.phone || '',
      subscriptionPlan: db.subscription_plan || 'none',
      subscriptionStatus: db.subscription_status || 'inactive',
      acceptedTerms: db.accepted_terms || false,
    } as Company;
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
      approvalStatus: db.approval_status || 'approved',
      approvalNotes: db.approval_notes || undefined,
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
    city: db.city || undefined,
    badge: db.badge || undefined,
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

// Atrasos removidos para melhorar a responsividade (ação instantânea)
const delay = (ms: number) => Promise.resolve();

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
  if (isSupabaseConfigured && supabase && isUUID(id)) {
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
  if (isSupabaseConfigured && supabase && isUUID(volunteerId)) {
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
  if (isSupabaseConfigured && supabase && isUUID(institutionId)) {
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
  if (isSupabaseConfigured && supabase && isUUID(userId)) {
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

export async function getProfile(userId: string): Promise<Volunteer | Institution | Company | null> {
  if (isSupabaseConfigured && supabase && isUUID(userId)) {
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
  if (isSupabaseConfigured && supabase && isUUID(applicationId)) {
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

export async function updateProfile(
  userId: string,
  profileData: {
    name: string;
    phone: string;
    city: string;
    neighborhood: string;
    description?: string;
    mission?: string;
  }
): Promise<boolean> {
  if (isSupabaseConfigured && supabase && isUUID(userId)) {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profileData.name,
        phone: profileData.phone,
        city: profileData.city,
        neighborhood: profileData.neighborhood,
        description: profileData.description,
        mission: profileData.mission,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error in updateProfile:', error.message);
      return false;
    }
    return true;
  }

  // Fallback offline simulation
  await delay(200);
  const volIndex = mockVolunteers.findIndex(v => v.id === userId);
  if (volIndex !== -1) {
    mockVolunteers[volIndex] = {
      ...mockVolunteers[volIndex],
      name: profileData.name,
      phone: profileData.phone,
      city: profileData.city,
      neighborhood: profileData.neighborhood,
      description: profileData.description,
    };
    return true;
  }

  const instIndex = mockInstitutions.findIndex(i => i.id === userId);
  if (instIndex !== -1) {
    mockInstitutions[instIndex] = {
      ...mockInstitutions[instIndex],
      name: profileData.name,
      phone: profileData.phone,
      city: profileData.city,
      neighborhood: profileData.neighborhood,
      mission: profileData.mission || '',
    };
    return true;
  }

  return false;
}

export async function submitApplication(applicationData: {
  jobId: string;
  volunteerId: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    if (!isUUID(applicationData.jobId) || !isUUID(applicationData.volunteerId)) {
      return { success: false, error: 'ID da vaga ou voluntário inválido.' };
    }

    try {
      const { data: job, error: jobErr } = await supabase
        .from('job_postings')
        .select('institution_id, title')
        .eq('id', applicationData.jobId)
        .single();

      if (jobErr || !job) {
        return { success: false, error: 'Vaga não encontrada.' };
      }

      const { data: inst, error: instErr } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', job.institution_id)
        .single();

      if (instErr || !inst) {
        return { success: false, error: 'Instituição responsável não encontrada.' };
      }

      const { data: vol, error: volErr } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', applicationData.volunteerId)
        .single();

      if (volErr || !vol) {
        return { success: false, error: 'Perfil do voluntário não encontrado.' };
      }

      const { error: appErr } = await supabase
        .from('applications')
        .insert({
          job_id: applicationData.jobId,
          volunteer_id: applicationData.volunteerId,
          institution_id: job.institution_id,
          job_title: job.title,
          institution_name: inst.name,
          volunteer_name: vol.name,
          message: applicationData.message || 'Tenho interesse em contribuir com esta vaga.',
          status: 'pending',
        });

      if (appErr) {
        if (appErr.code === '23505') {
          return { success: false, error: 'Você já enviou uma candidatura para esta vaga.' };
        }
        return { success: false, error: appErr.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Exception in submitApplication:', err);
      return { success: false, error: err.message || 'Erro inesperado ao processar candidatura.' };
    }
  }

  // Fallback offline simulation
  await delay(300);
  const matchedJob = mockJobPostings.find(j => j.id === applicationData.jobId);
  const matchedVol = mockVolunteers.find(v => v.id === applicationData.volunteerId);
  if (!matchedJob || !matchedVol) {
    return { success: false, error: 'Vaga ou voluntário não encontrado no modo de demonstração.' };
  }

  const alreadyApplied = mockApplications.some(
    app => app.jobId === applicationData.jobId && app.volunteerId === applicationData.volunteerId
  );
  if (alreadyApplied) {
    return { success: false, error: 'Você já enviou uma candidatura para esta vaga.' };
  }

  const newApp: Application = {
    id: `app-mock-${Date.now()}`,
    jobId: applicationData.jobId,
    volunteerId: applicationData.volunteerId,
    institutionId: matchedJob.institutionId,
    jobTitle: matchedJob.title,
    institutionName: mockInstitutions.find(i => i.id === matchedJob.institutionId)?.name || 'Instituição Fallback',
    volunteerName: matchedVol.name,
    message: applicationData.message || 'Tenho interesse em contribuir com esta vaga.',
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };

  mockApplications.push(newApp);
  return { success: true };
}

export async function checkUniqueField(
  field: 'cpf' | 'cnpj' | 'email',
  value: string
): Promise<{ exists: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const cleanValue = value.replace(/\D/g, '').trim();
    const queryValue = field === 'email' ? value.trim().toLowerCase() : cleanValue;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq(field, queryValue)
        .maybeSingle();

      if (error) {
        console.error(`Error checking unique field ${field}:`, error.message);
        return { exists: false, error: error.message };
      }

      return { exists: !!data };
    } catch (err: any) {
      return { exists: false, error: err.message };
    }
  }
  return { exists: false };
}

export async function createJob(jobData: {
  title: string;
  description: string;
  category: any;
  city: string;
  neighborhood: string;
  modality: string;
  causes: string;
  startDate: string;
  endDate: string;
  requirementsEssential: string[];
  requirementsOptional: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const id = 'job-' + Date.now();
  
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('job_postings')
      .insert({
        title: jobData.title,
        description: jobData.description,
        category: jobData.category,
        city: jobData.city,
        neighborhood: jobData.neighborhood,
        modality: jobData.modality,
        causes: jobData.causes,
        start_date: jobData.startDate,
        end_date: jobData.endDate,
        requirements_essential: jobData.requirementsEssential,
        requirements_optional: jobData.requirementsOptional,
        contact_name: jobData.contactName,
        contact_email: jobData.contactEmail,
        contact_phone: jobData.contactPhone,
        status: 'open',
      })
      .select()
      .single();
      
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
  
  return { success: true, data: { id, ...jobData } };
}
