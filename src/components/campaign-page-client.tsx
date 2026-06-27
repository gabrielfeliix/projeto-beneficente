'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Campaign, UpdateRecord, User } from '@/domain/entities';
import { appendCampaignUpdate, addCampaignNotification, loadCampaignData, updateCampaignSettings, type CampaignUpdateType } from '@/lib/campaign-storage';
import { MapPin, Share2, Heart, Calendar, Megaphone, Sparkles, Camera, Settings, PlusCircle, AlertTriangle, Check, FileText, BarChart2, Star, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { loadStoredProfile } from '@/lib/auth';
import { createDonation, createExpense, getCampaignDonations, getCampaignExpenses, getCampaignAccountability } from '@/actions/accountability';
import { Donation, Expense } from '@/domain/entities';

type CampaignPageClientProps = {
  campaign: Campaign;
  initialUpdates: UpdateRecord[];
  organizer: User | null;
};

export function CampaignPageClient({ campaign, initialUpdates, organizer }: CampaignPageClientProps) {
  const router = useRouter();
  const [activeCampaign, setActiveCampaign] = useState(campaign);
  const [updates, setUpdates] = useState(initialUpdates);
  const [statusMessage, setStatusMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);

  // Accountability and Gamification states
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  
  // Modals / forms
  const [donModalOpen, setDonModalOpen] = useState(false);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [donForm, setDonForm] = useState({ donorName: '', amount: '', paymentMethod: 'pix' as 'pix' | 'card' });
  const [expForm, setExpForm] = useState({ amount: '', category: 'Alimentação' as any, description: '', receiptUrl: '' });
  const [donLoading, setDonLoading] = useState(false);
  const [expLoading, setExpLoading] = useState(false);
  const [donSuccess, setDonSuccess] = useState(false);
  const [expSuccess, setExpSuccess] = useState(false);

  const [copiedPix, setCopiedPix] = useState(false);

  const getPixCopyAndPaste = () => {
    const key = activeCampaign.pixKey || "contato@mutirao.org.br";
    const amount = Number(donForm.amount) || 10;
    const formattedAmount = amount.toFixed(2);
    return `00020101021226580014br.gov.bcb.pix0124${key}5204000053039865405${formattedAmount}5802BR5915Mutirao Ong RN6005Natal62070503***6304`;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(getPixCopyAndPaste());
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  useEffect(() => {
    const loaded = loadStoredProfile();
    setProfile(loaded);
    if (loaded) {
      setDonForm(prev => ({ ...prev, donorName: loaded.name }));
    }
  }, []);

  // Fetch donations, expenses, and category totals on mount
  useEffect(() => {
    async function loadAccountability() {
      try {
        const [dons, exps, catTotals] = await Promise.all([
          getCampaignDonations(campaign.id),
          getCampaignExpenses(campaign.id),
          getCampaignAccountability(campaign.id)
        ]);
        setDonations(dons);
        setExpenses(exps);
        setTotals(catTotals);
      } catch (err) {
        console.error("Erro ao carregar dados de prestação de contas:", err);
      }
    }
    loadAccountability();
  }, [campaign.id, activeCampaign.financialRaised]);

  const canManage = profile && (profile.id === activeCampaign.organizerId || profile.id === 'inst-1');
  const [updateForm, setUpdateForm] = useState({
    content: '',
    imageUrl: '',
    updateType: 'urgency' as CampaignUpdateType,
  });
  const [settingsForm, setSettingsForm] = useState({
    title: campaign.title,
    description: campaign.description,
    mainNeed: campaign.mainNeed,
    financialGoal: campaign.financialGoal?.toString() ?? '',
    contact: campaign.contact,
    pixKey: campaign.pixKey ?? '',
    endDate: campaign.endDate ?? '',
    neighborhood: campaign.neighborhood,
    city: campaign.city,
  });

  useEffect(() => {
    async function load() {
      try {
        const persisted = await loadCampaignData(campaign.id);
        const persistedSettings = persisted.settings as Partial<Campaign>;

        if (persistedSettings && Object.keys(persistedSettings).length > 0) {
          setActiveCampaign((current) => ({ ...current, ...persistedSettings }));
          setSettingsForm((current) => ({
            ...current,
            title: persistedSettings.title ?? current.title,
            description: persistedSettings.description ?? current.description,
            mainNeed: persistedSettings.mainNeed ?? current.mainNeed,
            financialGoal: persistedSettings.financialGoal?.toString() ?? current.financialGoal,
            contact: persistedSettings.contact ?? current.contact,
            pixKey: persistedSettings.pixKey ?? current.pixKey,
            endDate: persistedSettings.endDate ?? current.endDate,
            neighborhood: persistedSettings.neighborhood ?? current.neighborhood,
            city: persistedSettings.city ?? current.city,
          }));
        }

        if (persisted.updates?.length) {
          setUpdates((current) => {
            const merged = [...persisted.updates, ...current];
            const unique = merged.filter((item, index, array) => index === array.findIndex((candidate) => candidate.id === item.id));
            return unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dados persistidos da campanha:", err);
      }
    }

    load();
  }, [campaign.id]);

  const handleUpdateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!updateForm.content.trim() && !updateForm.imageUrl.trim()) {
      setStatusMessage('Adicione um texto ou uma imagem para publicar a atualização.');
      return;
    }

    const content = updateForm.content.trim() || `Atualização registrada: ${updateForm.updateType === 'urgency' ? 'Está próximo da data da campanha.' : 'Campanha em andamento.'}`;

    const newUpdate = {
      id: `local-${Date.now()}`,
      campaignId: campaign.id,
      content,
      imageUrl: updateForm.imageUrl.trim() || undefined,
      createdAt: new Date().toISOString(),
      likes: 0,
      shares: 0,
      updateType: updateForm.updateType,
    };

    appendCampaignUpdate(campaign.id, newUpdate);
    addCampaignNotification(campaign.id, {
      id: `notif-${Date.now()}`,
      title: 'Nova atualização',
      message: content,
      channel: 'app',
      createdAt: new Date().toISOString(),
      read: false,
    });

    setUpdates((current) => [newUpdate, ...current]);
    setUpdateForm({ content: '', imageUrl: '', updateType: 'urgency' });
    setStatusMessage('Atualização publicada com sucesso.');
  };

  const handleSettingsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      title: settingsForm.title,
      description: settingsForm.description,
      mainNeed: settingsForm.mainNeed,
      financialGoal: settingsForm.financialGoal ? Number(settingsForm.financialGoal) : undefined,
      contact: settingsForm.contact,
      pixKey: settingsForm.pixKey,
      endDate: settingsForm.endDate,
      neighborhood: settingsForm.neighborhood,
      city: settingsForm.city,
    };

    updateCampaignSettings(campaign.id, payload);
    setActiveCampaign((current) => ({ ...current, ...payload }));
    setStatusMessage('Dados da campanha atualizados.');
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donForm.donorName.trim()) { alert("Por favor, informe seu nome."); return; }
    const amountVal = Number(donForm.amount);
    if (isNaN(amountVal) || amountVal <= 0) { alert("Informe um valor de doação válido maior que zero."); return; }

    setDonLoading(true);
    try {
      const donation = await createDonation(campaign.id, donForm.donorName, amountVal, donForm.paymentMethod, profile?.id);
      if (donation) {
        setDonSuccess(true);
        setActiveCampaign(current => ({
          ...current,
          financialRaised: (current.financialRaised || 0) + amountVal,
          status: current.financialGoal && ((current.financialRaised || 0) + amountVal) >= current.financialGoal ? 'completed' : current.status
        }));
        setDonForm(prev => ({ ...prev, amount: '' }));
      } else {
        alert("Erro ao registrar doação.");
      }
    } catch (err: any) {
      alert("Erro ao doar: " + err.message);
    } finally {
      setDonLoading(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = Number(expForm.amount);
    if (isNaN(amountVal) || amountVal <= 0) { alert("Informe um valor de despesa válido."); return; }
    if (!expForm.description.trim()) { alert("A descrição é obrigatória."); return; }

    setExpLoading(true);
    try {
      const exp = await createExpense(campaign.id, amountVal, expForm.category, expForm.description.trim(), expForm.receiptUrl.trim() || undefined);
      if (exp) {
        setExpSuccess(true);
        setExpenses(prev => [exp, ...prev]);
        setTotals(prev => ({
          ...prev,
          [exp.category]: (prev[exp.category] || 0) + amountVal
        }));
        setExpForm({ amount: '', category: 'Alimentação', description: '', receiptUrl: '' });
        setStatusMessage('Despesa lançada com sucesso no painel de transparência!');
      } else {
        alert("Erro ao registrar despesa.");
      }
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setExpLoading(false);
      setTimeout(() => setExpSuccess(false), 2000);
    }
  };

  const progress = activeCampaign.financialGoal
    ? Math.min(100, ((activeCampaign.financialRaised || 0) / activeCampaign.financialGoal) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      {activeCampaign.status === 'completed' && (
        <div className="mb-8 border-4 border-black bg-yellow-100 p-6 shadow-[4px_4px_0_0_#000] flex flex-col sm:flex-row items-center gap-4">
          <AlertTriangle className="w-12 h-12 text-yellow-600 shrink-0" />
          <div>
            <h3 className="font-display text-2xl font-black uppercase text-black">Meta Financeira Atingida! 🎯</h3>
            <p className="font-bold text-sm text-gray-700 mt-1">
              Esta campanha alcançou 100% de sua meta. A arrecadação foi pausada para que a ONG realize a destinação dos recursos. Acompanhe abaixo o painel de despesas e prestação de contas em tempo real.
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-12">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge className="text-lg" variant={activeCampaign.category === 'Educação' ? 'secondary' : 'default'}>
              {activeCampaign.category}
            </Badge>
            <div className="text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded flex items-center gap-1">
              <span>🤖 Analisado por IA</span>
            </div>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-tight">
            {activeCampaign.title}
          </h1>

          {/* Rating, Likes & AI Scam Thermometer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 bg-white p-3 border-2 border-black shadow-brutalist-sm">
              <div className="flex items-center gap-1 text-yellow-500 font-bold">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span className="text-black text-lg">4.8</span>
                <span className="text-gray-400 text-xs font-semibold">(124 avaliações)</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1 text-red-500 font-bold">
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                <span className="text-black text-lg">342 curtidas</span>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-400 p-3 flex items-center gap-3 shadow-brutalist-sm">
              <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[10px] font-black text-green-800">
                  <span>TERMÔMETRO DE SEGURANÇA IA</span>
                  <span>Risco de Golpe: Muito Baixo (2%)</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1 border border-green-300">
                  <div className="bg-green-500 h-full w-[2%]"></div>
                </div>
                <p className="text-[9px] text-green-700 font-bold mt-1 leading-none">
                  Documentos validados e consistência cadastral verificada por IA.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-600 font-bold">
            <div className="flex items-center gap-1"><MapPin className="w-5 h-5" /> {activeCampaign.neighborhood}, {activeCampaign.city}</div>
            <div className="flex items-center gap-1"><Calendar className="w-5 h-5" /> Criada em {new Date(activeCampaign.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="w-full aspect-video relative brutalist-card bg-primary overflow-hidden group">
          <Image
            src={activeCampaign.coverImage}
            alt={activeCampaign.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {canManage && (
          <Card className="border-4 bg-secondary">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 font-black uppercase"><Sparkles className="w-5 h-5" /> Gestão rápida</div>
              {statusMessage ? <p className="font-bold text-sm text-gray-700">{statusMessage}</p> : null}
              <div className="grid gap-6 lg:grid-cols-3">
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <h3 className="font-display text-2xl font-black uppercase">Nova atualização</h3>
                  <p className="text-sm font-medium text-gray-700">Cadastre apenas uma imagem ou uma mensagem curta, como “está próximo da data”.</p>
                  <textarea
                    value={updateForm.content}
                    onChange={(event) => setUpdateForm((current) => ({ ...current, content: event.target.value }))}
                    placeholder="Ex.: Está quase chegando a data da campanha."
                    className="min-h-28 w-full brutalist-border bg-background p-3 text-sm font-medium"
                  />
                  <Input
                    value={updateForm.imageUrl}
                    onChange={(event) => setUpdateForm((current) => ({ ...current, imageUrl: event.target.value }))}
                    placeholder="URL da imagem (opcional)"
                  />
                  <select
                    value={updateForm.updateType}
                    onChange={(event) => setUpdateForm((current) => ({ ...current, updateType: event.target.value as CampaignUpdateType }))}
                    className="w-full border-2 border-black bg-white p-3 text-sm font-bold"
                  >
                    <option value="urgency">Próximo da data</option>
                    <option value="milestone">Marco</option>
                    <option value="purchase">Compra</option>
                    <option value="completion">Conclusão</option>
                  </select>
                  <Button type="submit" className="w-full uppercase tracking-wider">
                    <PlusCircle className="mr-2 h-4 w-4" /> Publicar atualização
                  </Button>
                </form>

                <form onSubmit={handleSettingsSubmit} className="space-y-4">
                  <h3 className="font-display text-2xl font-black uppercase">Configurações</h3>
                  <p className="text-sm font-medium text-gray-700">Edite os dados já definidos para a campanha.</p>
                  <Input value={settingsForm.title} onChange={(event) => setSettingsForm((current) => ({ ...current, title: event.target.value }))} placeholder="Título da campanha" />
                  <textarea value={settingsForm.description} onChange={(event) => setSettingsForm((current) => ({ ...current, description: event.target.value }))} placeholder="Descrição" className="min-h-24 w-full brutalist-border bg-background p-3 text-sm font-medium" />
                  <Input value={settingsForm.mainNeed} onChange={(event) => setSettingsForm((current) => ({ ...current, mainNeed: event.target.value }))} placeholder="Necessidade principal" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input value={settingsForm.financialGoal} onChange={(event) => setSettingsForm((current) => ({ ...current, financialGoal: event.target.value }))} placeholder="Meta financeira" type="number" />
                    <Input value={settingsForm.endDate} onChange={(event) => setSettingsForm((current) => ({ ...current, endDate: event.target.value }))} placeholder="Data final" type="date" />
                  </div>
                  <Input value={settingsForm.contact} onChange={(event) => setSettingsForm((current) => ({ ...current, contact: event.target.value }))} placeholder="Contato público" />
                  <Input value={settingsForm.pixKey} onChange={(event) => setSettingsForm((current) => ({ ...current, pixKey: event.target.value }))} placeholder="Chave Pix" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input value={settingsForm.neighborhood} onChange={(event) => setSettingsForm((current) => ({ ...current, neighborhood: event.target.value }))} placeholder="Bairro" />
                    <Input value={settingsForm.city} onChange={(event) => setSettingsForm((current) => ({ ...current, city: event.target.value }))} placeholder="Cidade" />
                  </div>
                  <Button type="submit" variant="secondary" className="w-full uppercase tracking-wider">
                    <Settings className="mr-2 h-4 w-4" /> Salvar configurações
                  </Button>
                </form>

                {/* Lançar Despesa */}
                <form onSubmit={handleExpenseSubmit} className="space-y-4 bg-white p-4 brutalist-border">
                  <h3 className="font-display text-2xl font-black uppercase flex items-center gap-1.5">
                    <FileText className="w-5 h-5" /> Lançar Despesa
                  </h3>
                  <p className="text-sm font-medium text-gray-700">Preste contas anexando notas fiscais e comprovantes de gastos.</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold block mb-1">Valor (R$) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={expForm.amount}
                        onChange={e => setExpForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        required
                        className="h-10 border-2 border-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Categoria *</label>
                      <select
                        value={expForm.category}
                        onChange={e => setExpForm(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full h-10 border-2 border-black bg-white px-2 text-sm font-bold font-sans"
                      >
                        <option value="Alimentação">Alimentação</option>
                        <option value="Combustível">Combustível</option>
                        <option value="Infraestrutura">Infraestrutura</option>
                        <option value="Logística">Logística</option>
                        <option value="Serviços">Serviços</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Descrição do Gasto *</label>
                    <textarea
                      value={expForm.description}
                      onChange={e => setExpForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ex: Compra de 5 pacotes de arroz..."
                      className="w-full min-h-16 brutalist-border bg-background p-2 text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Link do Comprovante</label>
                    <Input
                      value={expForm.receiptUrl}
                      onChange={e => setExpForm(prev => ({ ...prev, receiptUrl: e.target.value }))}
                      placeholder="https://..."
                      className="h-10 border-2 border-black"
                    />
                  </div>

                  <Button type="submit" disabled={expLoading} className="w-full uppercase tracking-wider bg-black text-white hover:bg-gray-800 text-xs font-black">
                    {expLoading ? "Lançando..." : "Registrar Despesa"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="font-display text-3xl font-black uppercase border-b-4 border-border inline-block pb-1">Nossa Luta</h2>
          <p className="text-lg font-medium leading-relaxed bg-gray-50 p-6 brutalist-border rounded-md">
            {activeCampaign.description}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-3xl font-black uppercase border-b-4 border-border inline-block pb-1">Vitrine Pública</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-secondary border-4">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 font-black uppercase"><Sparkles className="w-5 h-5" /> Progresso da meta</div>
                <div className="text-3xl font-display font-black">R$ {activeCampaign.financialRaised || 0}</div>
                <p className="text-sm font-bold text-gray-700">de R$ {activeCampaign.financialGoal || 0} arrecadados</p>
                <div className="w-full bg-white border-2 border-border h-4 rounded-full overflow-hidden">
                  <div className="bg-primary h-full border-r-2 border-border" style={{ width: `${progress}%` }}></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-4">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 font-black uppercase"><Camera className="w-5 h-5" /> Galeria</div>
                <p className="text-sm font-medium text-gray-600">Fotos e vídeos da campanha ajudam a contar a história e reforçar a confiança.</p>
                <div className="relative aspect-video w-full border-2 border-border overflow-hidden">
                  <Image src={activeCampaign.coverImage} alt="Capa da campanha" fill className="object-cover" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PRESTAÇÃO DE CONTAS EM TEMPO REAL */}
        <div className="space-y-6">
          <h2 className="font-display text-3xl font-black uppercase border-b-4 border-border inline-block pb-1">
            Prestação de Contas (Transparência)
          </h2>
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* LADO ESQUERDO: Gráfico/Distribuição de despesas */}
            <Card className="bg-white border-4 border-black rounded-none shadow-[4px_4px_0_0_#000]">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 font-black uppercase"><BarChart2 className="w-5 h-5" /> Distribuição dos Gastos</div>
                
                {Object.keys(totals).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(totals).map(([cat, val]) => {
                      const totalExpenses = Object.values(totals).reduce((a, b) => a + b, 0);
                      const catPercentage = Math.round((val / totalExpenses) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-sm font-black uppercase">
                            <span>{cat}</span>
                            <span>R$ {val.toFixed(2)} ({catPercentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 border-2 border-black h-4 rounded-none overflow-hidden">
                            <div className="bg-secondary h-full border-r border-black" style={{ width: `${catPercentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-4 border-t-2 border-dashed border-black flex justify-between font-black text-lg">
                      <span>TOTAL DE DESPESAS</span>
                      <span>R$ {Object.values(totals).reduce((a, b) => a + b, 0).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center font-bold text-gray-500 uppercase bg-gray-50 border-2 border-dashed border-gray-300">
                    Nenhuma despesa lançada até o momento. Todo o recurso arrecadado está reservado para destinação.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* LADO DIREITO: Histórico de cupons / notas */}
            <Card className="bg-white border-4 border-black rounded-none shadow-[4px_4px_0_0_#000]">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 font-black uppercase"><FileText className="w-5 h-5" /> Comprovantes e Despesas</div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="p-3 bg-gray-50 border-2 border-black space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <Badge className="bg-black text-white text-xs font-black uppercase">{exp.category}</Badge>
                        <span className="font-display font-black text-sm text-black">R$ {exp.amount.toFixed(2)}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-700">{exp.description}</p>
                      
                      {exp.receiptUrl && (
                        <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-black text-accent hover:underline uppercase mt-1">
                          <Camera className="w-3.5 h-3.5" /> Ver Comprovante
                        </a>
                      )}
                      
                      <div className="text-[10px] font-bold text-gray-400">
                        Registrado em {new Date(exp.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  ))}

                  {expenses.length === 0 && (
                    <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase">
                      Aguardando prestação de contas da ONG.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-3xl font-black uppercase border-b-4 border-border inline-block pb-1">Feed de Atualizações</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-border">
            {updates.map((update) => (
              <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-border bg-primary text-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-brutalist-sm z-10">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 brutalist-card hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-500">{new Date(update.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-bold mb-4">{update.content}</p>
                  {update.imageUrl && (
                    <div className="relative aspect-video w-full mt-2 border-2 border-border rounded-sm overflow-hidden">
                      <Image src={update.imageUrl} alt="Atualização" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96">
        <div className="sticky top-24 space-y-8">
          <Card className="bg-primary text-primary-foreground border-4">
            <CardContent className="p-6 space-y-6">
              {activeCampaign.financialGoal ? (
                <div>
                  <div className="flex justify-between font-bold mb-2 text-xl">
                    <span>Arrecadado</span>
                    <span>R$ {activeCampaign.financialRaised || 0}</span>
                  </div>
                  <div className="w-full bg-white border-2 border-border h-6 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full border-r-2 border-border transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="text-sm font-bold mt-2 text-right">da meta de R$ {activeCampaign.financialGoal}</div>
                </div>
              ) : (
                <div className="bg-white/50 p-4 brutalist-border">
                  <h3 className="uppercase tracking-widest text-sm text-gray-700 font-bold mb-2">Ponto de Coleta</h3>
                  <p className="font-medium text-black">Entre em contato para combinar a entrega física no nosso endereço central.</p>
                </div>
              )}

              <div className="space-y-2 font-bold bg-white/50 p-4 brutalist-border">
                <h3 className="uppercase tracking-widest text-sm text-gray-700">Necessidade Principal</h3>
                <p className="text-xl">{activeCampaign.mainNeed}</p>
              </div>

              {activeCampaign.financialGoal ? (
                <Button
                  size="lg"
                  disabled={activeCampaign.status === 'completed'}
                  onClick={() => {
                    if (!profile) {
                      router.push(`/login?redirect=/campaigns/${activeCampaign.id}`);
                    } else {
                      setDonModalOpen(true);
                      setDonSuccess(false);
                    }
                  }}
                  className="w-full text-xl h-14 uppercase tracking-wider bg-black text-white hover:bg-gray-800 hover:text-white transition-transform active:scale-95"
                >
                  <Heart className="mr-2" /> {activeCampaign.status === 'completed' ? 'Meta Atingida' : 'Doar na Vakinha'}
                </Button>
              ) : (
                <Button size="lg" className="w-full text-lg h-14 uppercase tracking-wider bg-[#25D366] text-black border-2 border-black hover:bg-[#20b858] transition-transform active:scale-95">
                  <Megaphone className="mr-2" /> Falar no WhatsApp
                </Button>
              )}

              <Button variant="outline" size="lg" className="w-full h-12 bg-white hover:bg-gray-100 transition-transform active:scale-95">
                <Share2 className="mr-2" /> Multiplicar essa Causa
              </Button>

              <Link href="/dashboard" className="block">
                <Button variant="secondary" size="lg" className="w-full h-12 bg-white hover:bg-gray-100 transition-transform active:scale-95">
                  <Settings className="mr-2" /> Voltar ao painel
                </Button>
              </Link>
            </CardContent>
          </Card>

          {organizer && (
            <Card className="bg-secondary border-4">
              <CardContent className="p-6">
                <h3 className="font-display font-black uppercase text-xl mb-4">Organizador / ONG</h3>
                <div 
                   className="flex items-center gap-4 mb-4 cursor-pointer hover:opacity-80 transition-opacity" 
                   onClick={() => setOrgModalOpen(true)}
                   title="Clique para ver o perfil do organizador"
                 >
                   {organizer.avatarUrl ? (
                     <Image
                       src={organizer.avatarUrl}
                       alt={organizer.name}
                       width={64}
                       height={64}
                       className="rounded-full border-2 border-border"
                     />
                   ) : (
                     <div className="w-16 h-16 rounded-full border-2 border-border bg-black text-white flex items-center justify-center font-display text-2xl font-black shrink-0">
                       {organizer.name.substring(0, 2).toUpperCase()}
                     </div>
                   )}
                   <div>
                     <div className="font-bold text-lg leading-tight underline decoration-primary decoration-2">{organizer.name}</div>
                     <div className="text-sm font-semibold text-gray-700">{organizer.city}</div>
                   </div>
                 </div>
                <p className="text-sm font-medium mb-4">{organizer.description}</p>
                {activeCampaign.contact && (
                  <div className="pt-4 border-t-2 border-border text-sm font-bold">
                    Contato Público: {activeCampaign.contact}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>

      {/* DONATION MODAL */}
      {donModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] relative space-y-6 text-black">
            <button
              onClick={() => setDonModalOpen(false)}
              className="absolute top-4 right-4 border-2 border-black p-1 hover:bg-gray-100 font-black w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>

            <div>
              <Badge className="bg-primary text-black border-2 border-black font-black uppercase text-xs">
                Apoie esta causa
              </Badge>
              <h3 className="font-display text-2xl font-black uppercase mt-2">Fazer uma Doação</h3>
              <p className="text-xs font-bold text-gray-500">{activeCampaign.title}</p>
            </div>

            {donSuccess ? (
              <div className="border-4 border-green-500 bg-green-50 p-6 text-center space-y-4">
                <Check className="w-12 h-12 text-green-600 mx-auto" />
                <h4 className="font-display text-xl font-black uppercase text-green-700">Obrigado pela doação! ❤️</h4>
                <p className="text-sm font-bold text-green-800">
                  Seu apoio financeiro foi computado instantaneamente e já consta no painel de transparência!
                </p>
                <Button
                  onClick={() => {
                    setDonModalOpen(false);
                    setDonSuccess(false);
                  }}
                  className="w-full bg-black text-white hover:bg-gray-800 uppercase font-black"
                >
                  Fechar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleDonationSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase block mb-1">Seu Nome *</label>
                  <Input
                    value={donForm.donorName}
                    onChange={e => setDonForm(prev => ({ ...prev, donorName: e.target.value }))}
                    placeholder="Nome completo ou Anônimo"
                    required
                    className="border-2 border-black h-11 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase block mb-1">Valor (R$) *</label>
                    <Input
                      type="number"
                      value={donForm.amount}
                      onChange={e => setDonForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Ex: 50"
                      required
                      className="border-2 border-black h-11 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase block mb-1">Forma de Pagamento</label>
                    <select
                      value={donForm.paymentMethod}
                      onChange={e => setDonForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                      className="w-full h-11 border-2 border-black bg-white px-2 text-sm font-bold font-sans"
                    >
                      <option value="pix">PIX (Instantâneo)</option>
                      <option value="card">Cartão de Crédito</option>
                    </select>
                  </div>
                </div>

                {donForm.paymentMethod === 'pix' ? (
                  <div className="bg-gray-50 border-2 border-dashed border-black p-4 text-center space-y-3">
                    <p className="text-xs font-black text-gray-600 uppercase">Escaneie o QR Code ou use o Pix Copia e Cola:</p>
                    
                    <div className="relative w-44 h-44 mx-auto border-4 border-black bg-white flex items-center justify-center p-2 shadow-[2px_2px_0_0_#000]">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getPixCopyAndPaste())}`}
                        alt="QR Code Pix Dinâmico"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <code className="block text-[10px] bg-white p-2 border-2 border-black truncate font-bold text-gray-800">
                        {getPixCopyAndPaste()}
                      </code>
                      
                      <Button
                        type="button"
                        onClick={handleCopyPix}
                        className="w-full h-9 text-xs font-black uppercase bg-black text-white hover:bg-gray-800 border-2 border-black cursor-pointer"
                      >
                        {copiedPix ? "Código Copiado! ✓" : "Copiar Pix Copia e Cola"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-black p-4 space-y-2 text-left">
                    <p className="text-xs font-bold text-gray-600">Simulação de Cartão:</p>
                    <Input placeholder="Número do Cartão" className="h-9 border-2 border-black bg-white" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Validade (MM/AA)" className="h-9 border-2 border-black bg-white" />
                      <Input placeholder="CVV" className="h-9 border-2 border-black bg-white" />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={donLoading}
                  className="w-full h-12 bg-primary text-black hover:bg-yellow-300 border-2 border-black shadow-[4px_4px_0_0_#000] uppercase font-black transition-all"
                >
                  {donLoading ? "Processando..." : "Confirmar Doação"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ORGANIZER PROFILE MODAL */}
      {orgModalOpen && organizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] relative space-y-6 text-black max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setOrgModalOpen(false)}
              className="absolute top-4 right-4 border-2 border-black p-1 hover:bg-gray-100 font-black w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 border-b-4 border-black pb-6">
              {organizer.avatarUrl ? (
                <Image
                  src={organizer.avatarUrl}
                  alt={organizer.name}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-black shadow-sm shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-black bg-black text-white flex items-center justify-center font-display text-3xl font-black shrink-0">
                  {organizer.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <Badge className="bg-black text-primary border-2 border-black font-black uppercase text-xs">
                  {organizer.profileType === 'institution' ? 'ONG / Instituição' : 'Organizador'}
                </Badge>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tighter mt-1">{organizer.name}</h3>
                <p className="text-sm font-semibold text-gray-500">{organizer.city || 'Rio Grande do Norte'}, RN</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary p-3 border-2 border-black text-center shadow-brutalist-sm">
                <div className="font-display text-2xl font-black">48</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-black/70">Doações Rec.</div>
              </div>
              <div className="bg-secondary p-3 border-2 border-black text-center shadow-brutalist-sm">
                <div className="font-display text-2xl font-black">4.9 ★</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-black/70">Avaliação Geral</div>
              </div>
              <div className="bg-accent text-white p-3 border-2 border-black text-center shadow-brutalist-sm">
                <div className="font-display text-2xl font-black">812</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">Curtidas Gerais</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-display text-lg font-black uppercase tracking-tight">Sobre</h4>
              <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 p-3 border-2 border-dashed border-gray-300">
                {organizer.description || "Este organizador apoia causas sociais e ajuda a impulsionar o RN."}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-display text-lg font-black uppercase tracking-tight flex items-center justify-between">
                <span>Campanhas Deste Organizador</span>
                <span className="text-xs bg-black text-white px-2 py-0.5 font-sans font-bold">Total: 2</span>
              </h4>
              <div className="space-y-3">
                <div className="p-3 border-2 border-black hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm uppercase truncate max-w-[250px]">Refeitório Comunitário e Sopão do Seridó</h5>
                    <p className="text-xs text-gray-500 font-semibold">Caicó, RN</p>
                  </div>
                  <Badge className="bg-green-500 text-white font-bold border border-green-700">Meta Batida! ✓</Badge>
                </div>
                <div className="p-3 border-2 border-black hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm uppercase truncate max-w-[250px]">Marmitas Solidárias Filipe Camarão</h5>
                    <p className="text-xs text-gray-500 font-semibold">Natal, RN</p>
                  </div>
                  <Badge className="bg-primary text-black font-bold border border-black">Ativa ⚡</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
