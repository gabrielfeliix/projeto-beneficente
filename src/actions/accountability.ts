/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Donation, Expense } from '@/domain/entities';

// Offline/Demo Mock Data
const mockDonations: Donation[] = [
  {
    id: 'don-mock-1',
    campaignId: 'camp-1',
    donorName: 'João da Silva',
    amount: 150.00,
    paymentMethod: 'pix',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'don-mock-2',
    campaignId: 'camp-1',
    donorName: 'Maria Rezende',
    amount: 50.00,
    paymentMethod: 'card',
    status: 'completed',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'don-mock-3',
    campaignId: 'camp-2',
    donorName: 'Pedro Santos',
    amount: 300.00,
    paymentMethod: 'pix',
    status: 'completed',
    createdAt: new Date().toISOString(),
  }
];

const mockExpenses: Expense[] = [
  {
    id: 'exp-mock-1',
    campaignId: 'camp-1',
    amount: 250.00,
    category: 'Alimentação',
    description: 'Compra de 25 cestas básicas de emergência no Supermercado Nordestão',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300&h=200',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'exp-mock-2',
    campaignId: 'camp-1',
    amount: 80.00,
    category: 'Logística',
    description: 'Frete do transporte de suprimentos de Natal para Filipe Camarão',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

// Helper to map database model
function mapDBDonation(db: any): Donation {
  return {
    id: db.id,
    campaignId: db.campaign_id,
    donorId: db.donor_id || undefined,
    donorName: db.donor_name,
    amount: Number(db.amount),
    paymentMethod: db.payment_method,
    status: db.status,
    createdAt: db.created_at,
  };
}

function mapDBExpense(db: any): Expense {
  return {
    id: db.id,
    campaignId: db.campaign_id,
    amount: Number(db.amount),
    category: db.category,
    description: db.description,
    receiptUrl: db.receipt_url || undefined,
    createdAt: db.created_at,
  };
}

/* ─────────────────── API & SERVER ACTIONS ─────────────────── */

/**
 * Cria e registra uma nova doação para a campanha.
 * Atualiza o progresso financeiro da campanha e envia alertas de transparência.
 */
export async function createDonation(
  campaignId: string,
  donorName: string,
  amount: number,
  paymentMethod: 'pix' | 'card',
  donorId?: string
): Promise<Donation | null> {
  // Validações
  if (!campaignId) throw new Error("A campanha associada é obrigatória.");
  if (!donorName.trim()) throw new Error("O nome do doador é obrigatório.");
  if (amount <= 0) throw new Error("O valor da doação deve ser maior que zero.");

  if (isSupabaseConfigured && supabase) {
    // 1. Insere a doação
    const { data: donData, error: donError } = await supabase
      .from('donations')
      .insert({
        campaign_id: campaignId,
        donor_id: donorId || null,
        donor_name: donorName,
        amount,
        payment_method: paymentMethod,
        status: 'completed',
      })
      .select()
      .single();

    if (donError) {
      console.error('Error inserting donation:', donError.message);
      return null;
    }

    // 2. Busca a campanha correspondente para ler dados atuais
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .select('financial_goal, financial_raised, title')
      .eq('id', campaignId)
      .single();

    if (!campError && campaign) {
      const newRaised = Number(campaign.financial_raised || 0) + amount;
      const isGoalReached = campaign.financial_goal && newRaised >= Number(campaign.financial_goal);

      // 3. Atualiza valor arrecadado e encerra se a meta for batida
      await supabase
        .from('campaigns')
        .update({
          financial_raised: newRaised,
          status: isGoalReached ? 'completed' : 'active'
        })
        .eq('id', campaignId);

      // 4. Se a meta foi batida, cria notificação em lote para todos os doadores da campanha
      if (isGoalReached) {
        // Busca doadores únicos
        const { data: uniqueDonors } = await supabase
          .from('donations')
          .select('donor_id')
          .eq('campaign_id', campaignId)
          .not('donor_id', 'is', null);

        if (uniqueDonors) {
          const donorIds = Array.from(new Set(uniqueDonors.map(d => d.donor_id)));
          const notifications = donorIds.map(dId => ({
            user_id: dId,
            title: "🎉 Meta Alcançada!",
            message: `A campanha "${campaign.title}" bateu 100% da meta! Acompanhe a prestação de contas no painel.`,
            channel: 'app',
          }));

          if (notifications.length > 0) {
            await supabase.from('notifications').insert(notifications);
          }
        }
      }
    }

    return mapDBDonation(donData);
  }

  // Fallback offline / demo mode
  const newDon: Donation = {
    id: `don-local-${Date.now()}`,
    campaignId,
    donorId,
    donorName,
    amount,
    paymentMethod,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
  mockDonations.push(newDon);
  return newDon;
}

/**
 * Cria uma nova despesa vinculada a uma campanha.
 */
export async function createExpense(
  campaignId: string,
  amount: number,
  category: 'Alimentação' | 'Combustível' | 'Infraestrutura' | 'Logística' | 'Serviços' | 'Outros',
  description: string,
  receiptUrl?: string
): Promise<Expense | null> {
  // Validações
  if (!campaignId) throw new Error("A campanha é obrigatória.");
  if (amount <= 0) throw new Error("O valor da despesa deve ser maior que zero.");
  if (!description.trim()) throw new Error("A descrição da despesa é obrigatória.");

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        campaign_id: campaignId,
        amount,
        category,
        description,
        receipt_url: receiptUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting expense:', error.message);
      return null;
    }
    return mapDBExpense(data);
  }

  // Fallback offline
  const newExp: Expense = {
    id: `exp-local-${Date.now()}`,
    campaignId,
    amount,
    category,
    description,
    receiptUrl,
    createdAt: new Date().toISOString(),
  };
  mockExpenses.push(newExp);
  return newExp;
}

/**
 * Obtém todas as doações de uma campanha.
 */
export async function getCampaignDonations(campaignId: string): Promise<Donation[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting campaign donations:', error.message);
      return [];
    }
    return (data || []).map(mapDBDonation);
  }

  // Fallback offline
  return mockDonations.filter(d => d.campaignId === campaignId);
}

/**
 * Obtém todas as despesas de uma campanha.
 */
export async function getCampaignExpenses(campaignId: string): Promise<Expense[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting campaign expenses:', error.message);
      return [];
    }
    return (data || []).map(mapDBExpense);
  }

  // Fallback offline
  return mockExpenses.filter(e => e.campaignId === campaignId);
}

/**
 * Agrupa as despesas por categoria para preencher gráficos de transparência.
 */
export async function getCampaignAccountability(campaignId: string): Promise<Record<string, number>> {
  const expenses = await getCampaignExpenses(campaignId);
  const totals: Record<string, number> = {};

  expenses.forEach(exp => {
    totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
  });

  return totals;
}
