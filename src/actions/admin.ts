/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Mock list of pending institutions for offline/demo mode
const mockPendingInstitutions: any[] = [
  {
    id: 'inst-pending-1',
    profile_type: 'institution',
    name: 'Instituto Recicla Vida',
    email: 'reciclavida@gmail.com',
    city: 'Natal',
    neighborhood: 'Pontes',
    phone: '(84) 98888-2222',
    cnpj: '55.666.777/0001-88',
    representative_name: 'Marcos Rezende',
    representative_cpf: '444.555.666-22',
    headquarters_address: 'Rua das Flores, 12, Lagoa Nova, Natal - RN',
    mission: 'Promover reciclagem sustentável e capacitação de jovens carentes.',
    approval_status: 'pending_approval',
  },
  {
    id: 'inst-pending-2',
    profile_type: 'institution',
    name: 'Associação Asas da Esperança',
    email: 'asas.esperanca@ong.org',
    city: 'Parnamirim',
    neighborhood: 'Centro',
    phone: '(84) 99111-3333',
    cnpj: '99.888.777/0001-66',
    representative_name: 'Luciana Silva',
    representative_cpf: '888.777.666-55',
    headquarters_address: 'Av. Brigadeiro Everaldo, 100, Parnamirim - RN',
    mission: 'Apoio pedagógico e alimentar para crianças carentes.',
    approval_status: 'pending_approval',
  }
];

export async function getPendingInstitutions(): Promise<any[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('profile_type', 'institution')
      .eq('approval_status', 'pending_approval');

    if (error) {
      console.error('Error fetching pending institutions:', error.message);
      return [];
    }
    return data || [];
  }

  // Fallback offline
  return mockPendingInstitutions.filter(inst => inst.approval_status === 'pending_approval');
}

export async function getAllProfilesAdmin(): Promise<any[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching profiles:', error.message);
      return [];
    }
    return data || [];
  }

  // Fallback offline
  return [
    { id: 'vol-1', name: 'Ana Beatriz', email: 'ana.beatriz@email.com', profile_type: 'volunteer' },
    { id: 'vol-2', name: 'Lucas Mendes', email: 'lucas.mendes@email.com', profile_type: 'volunteer' },
    { id: 'inst-1', name: 'Instituto Água Viva', email: 'contato@aguaviva.org', profile_type: 'institution', approval_status: 'approved' },
    ...mockPendingInstitutions,
  ];
}

export async function updateInstitutionApproval(
  id: string,
  status: 'approved' | 'rejected',
  notes: string = ''
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('profiles')
      .update({
        approval_status: status,
        approval_notes: notes
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating approval status:', error.message);
      return false;
    }
    return true;
  }

  // Fallback offline
  const found = mockPendingInstitutions.find(inst => inst.id === id);
  if (found) {
    found.approval_status = status;
    found.approval_notes = notes;
    return true;
  }
  return false;
}

export async function promoteUserToRole(
  userId: string,
  newRole: 'donor' | 'volunteer' | 'institution' | 'fiscal' | 'admin'
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('profiles')
      .update({
        profile_type: newRole
      })
      .eq('id', userId);

    if (error) {
      console.error('Error promoting user:', error.message);
      return false;
    }
    return true;
  }

  // Fallback offline
  return true;
}
