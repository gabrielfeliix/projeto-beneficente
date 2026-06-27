'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Campaign, UpdateRecord, User } from '@/domain/entities';
import { appendCampaignUpdate, addCampaignNotification, loadCampaignData, updateCampaignSettings, type CampaignUpdateType } from '@/lib/campaign-storage';
import { MapPin, Share2, Heart, Calendar, Megaphone, Sparkles, Camera, Settings, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { loadStoredProfile } from '@/lib/auth';

type CampaignPageClientProps = {
  campaign: Campaign;
  initialUpdates: UpdateRecord[];
  organizer: User | null;
};

export function CampaignPageClient({ campaign, initialUpdates, organizer }: CampaignPageClientProps) {
  const [activeCampaign, setActiveCampaign] = useState(campaign);
  const [updates, setUpdates] = useState(initialUpdates);
  const [statusMessage, setStatusMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setProfile(loadStoredProfile());
  }, []);

  const canManage = profile && profile.profileType === 'institution' && (profile.id === activeCampaign.organizerId || profile.id === 'inst-1');
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

  const progress = activeCampaign.financialGoal
    ? Math.min(100, ((activeCampaign.financialRaised || 0) / activeCampaign.financialGoal) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-12">
        <div className="space-y-6">
          <Badge className="text-lg" variant={activeCampaign.category === 'Educação' ? 'secondary' : 'default'}>
            {activeCampaign.category}
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-tight">
            {activeCampaign.title}
          </h1>
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
              <div className="grid gap-6 lg:grid-cols-2">
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
                <Button size="lg" className="w-full text-xl h-14 uppercase tracking-wider bg-black text-white hover:bg-gray-800 hover:text-white transition-transform active:scale-95">
                  <Heart className="mr-2" /> Doar na Vakinha
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
                <div className="flex items-center gap-4 mb-4">
                  {organizer.avatarUrl && (
                    <Image
                      src={organizer.avatarUrl}
                      alt={organizer.name}
                      width={64}
                      height={64}
                      className="rounded-full border-2 border-border"
                    />
                  )}
                  <div>
                    <div className="font-bold text-lg leading-tight">{organizer.name}</div>
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
  );
}
