'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Check, Loader2, Save, X, Bookmark, Clock, Award, ShieldCheck, Heart, User, Building2 } from 'lucide-react';
import { loadStoredProfile, saveStoredProfile } from '@/lib/auth';
import { getProfile, updateProfile } from '@/actions/platform';
import { getVolunteerCertificates } from '@/actions/certificates';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function ProfileClient() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Editable fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [description, setDescription] = useState('');

  // Custom States
  const [certificatesList, setCertificatesList] = useState<any[]>([]);
  const [showAddCert, setShowAddCert] = useState(false);
  const [certOrg, setCertOrg] = useState('');
  const [certTitle, setCertTitle] = useState('');
  const [certHours, setCertHours] = useState('4');
  const [certDate, setCertDate] = useState('');
  
  const [donationsList, setDonationsList] = useState<any[]>([]);
  const [actionsCount, setActionsCount] = useState(5);
  const [causesList, setCausesList] = useState<string[]>(["Alimentação", "Saúde", "Educação"]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (targetId) {
          setIsReadOnly(true);
          const fullProfile = await getProfile(targetId);
          if (fullProfile) {
            setProfile(fullProfile);
            setName(fullProfile.name || '');
            setPhone(fullProfile.phone || '');
            setCity(fullProfile.city || '');
            setNeighborhood(fullProfile.neighborhood || '');
            setDescription(fullProfile.description || (fullProfile as any).mission || '');
          } else {
            setProfile(null);
          }
        } else {
          setIsReadOnly(false);
          const stored = loadStoredProfile();
          if (!stored) {
            setProfile(null);
            setLoading(false);
            return;
          }
          const fullProfile = await getProfile(stored.id);
          if (fullProfile) {
            setProfile(fullProfile);
            setName(fullProfile.name || '');
            setPhone(fullProfile.phone || '');
            setCity(fullProfile.city || '');
            setNeighborhood(fullProfile.neighborhood || '');
            setDescription(fullProfile.description || (fullProfile as any).mission || '');
          } else {
            setProfile(stored);
            setName(stored.name || '');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [targetId]);

  useEffect(() => {
    if (profile) {
      if (profile.profileType === 'volunteer') {
        getVolunteerCertificates(profile.id).then(list => {
          if (list.length === 0) {
            setCertificatesList([
              { id: "cert-mock-1", volunteerName: profile.name, institutionName: "Associação Água Viva", jobTitle: "Apoio Logístico", hoursDonated: 8, issuedAt: new Date(Date.now() - 15 * 86400000).toISOString(), verificationCode: "LUM-DEMO123" }
            ]);
          } else {
            setCertificatesList(list);
          }
        });
      } else if (profile.profileType === 'donor') {
        setDonationsList([
          { id: "don-1", campaignTitle: "Ajuda para o Sopão Solidário", amount: 150, date: new Date(Date.now() - 3 * 86400000).toLocaleDateString() },
          { id: "don-2", campaignTitle: "Marmitas Solidárias Filipe Camarão", amount: 50, date: new Date(Date.now() - 12 * 86400000).toLocaleDateString() },
        ]);
      } else if (profile.profileType === 'institution') {
        setActionsCount(8);
        setCausesList(["Educação", "Alimentação", "Inclusão Digital"]);
      }
    }
  }, [profile]);

  const handleAddCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCert = {
      id: "cert-manual-" + Date.now(),
      volunteerName: name,
      institutionName: certOrg,
      jobTitle: certTitle,
      hoursDonated: Number(certHours),
      issuedAt: new Date(certDate).toISOString() || new Date().toISOString(),
      verificationCode: "LUM-MANUAL" + Math.random().toString(36).substring(2, 7).toUpperCase()
    };
    setCertificatesList(prev => [newCert, ...prev]);
    setCertOrg('');
    setCertTitle('');
    setCertHours('4');
    setCertDate('');
    setShowAddCert(false);
    alert("Certificado manual adicionado com sucesso!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSuccessMsg('');

    try {
      const isVolunteer = profile.profileType === 'volunteer';
      const isDonor = profile.profileType === 'donor';

      // 1. Update DB via Server Action
      const success = await updateProfile(profile.id, {
        name,
        phone,
        city,
        neighborhood,
        description: (isVolunteer || isDonor) ? description : undefined,
        mission: (!isVolunteer && !isDonor) ? description : undefined,
      });

      if (!success) {
        throw new Error('Não foi possível salvar os dados no banco de dados.');
      }

      // 2. Update local cookie
      const updatedCookie = {
        ...profile,
        name,
        phone,
        city,
        neighborhood,
        description,
      };
      saveStoredProfile(updatedCookie);

      // 3. Update local state
      setProfile(updatedCookie);
      setIsEditing(false);
      setSuccessMsg('Perfil atualizado com sucesso! ✓');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('Erro ao salvar alterações: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center font-display text-2xl font-black uppercase text-black">
        Carregando Perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center font-bold text-gray-600">
        Nenhum perfil logado encontrado. Por favor, faça login.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 lg:grid-cols-[1fr_360px] text-black">
      <section>
        <Badge className="mb-4 bg-accent text-white border-2 border-black">Meu Perfil</Badge>
        
        {successMsg && (
          <div className="bg-green-50 border-4 border-green-500 p-4 font-bold text-green-700 mb-6 uppercase text-sm">
            {successMsg}
          </div>
        )}

        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0_0_#000]">
          {!isEditing ? (
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">{profile.name}</h1>
                <p className="text-gray-600 font-bold text-base leading-relaxed bg-gray-50 p-4 border-2 border-dashed border-gray-200">
                  {description || 'Sem descrição ou missão definida ainda.'}
                </p>
              </div>
              {!isReadOnly && (
                <Button
                  onClick={() => setIsEditing(true)}
                  size="lg"
                  className="uppercase tracking-wider font-black border-2 border-black bg-primary text-black hover:bg-black hover:text-white shrink-0 shadow-[3px_3px_0_0_#000]"
                >
                  <Pencil className="mr-2 w-4 h-4" /> Editar Perfil
                </Button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="font-display text-2xl font-black uppercase border-b-2 border-black pb-2">Editar Minhas Informações</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-black uppercase block mb-1">Nome Completo / Razão Social</label>
                  <Input value={name} onChange={e => setName(e.target.value)} required className="border-2 border-black font-bold h-11" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase block mb-1">Telefone / WhatsApp</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} required className="border-2 border-black font-bold h-11" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-black uppercase block mb-1">Cidade</label>
                  <Input value={city} onChange={e => setCity(e.target.value)} required className="border-2 border-black font-bold h-11" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase block mb-1">Bairro</label>
                  <Input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} required className="border-2 border-black font-bold h-11" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase block mb-1">Bio / Missão</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full border-2 border-black p-3 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t-2 border-dashed border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="font-black uppercase text-xs border-2 border-black"
                >
                  <X className="w-4 h-4 mr-1.5" /> Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saveLoading}
                  className="font-black uppercase text-xs bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[3px_3px_0_0_#000]"
                >
                  {saveLoading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000]">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-black uppercase mb-4">Dados de Registro</h2>
                <div className="space-y-3 text-sm font-bold text-gray-700">
                  <div><strong>E-mail:</strong> {profile.email || 'Privado'}</div>
                  <div><strong>Cidade / Estado:</strong> {profile.city || 'Não configurada'} - RN</div>
                  <div><strong>Bairro:</strong> {profile.neighborhood || 'Não informado'}</div>
                  {profile.phone && <div><strong>Contato:</strong> {profile.phone}</div>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000]">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-black uppercase mb-4">Tipo de Conta</h2>
                <div className="space-y-3 text-sm font-bold text-gray-700">
                  <div>
                    <strong>Categoria:</strong>{' '}
                    <Badge className="bg-primary text-black border border-black uppercase font-black text-xs">
                      {profile.profileType === 'volunteer' ? 'Voluntário' :
                       profile.profileType === 'company' ? 'Empresa Assinante' :
                       profile.profileType === 'donor' ? 'Doador' :
                       'Instituição / ONG'}
                    </Badge>
                  </div>
                  <div><strong>Status na Plataforma:</strong> Ativo ✓</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* VOLUNTEER SECTION: CERTIFICADOS */}
          {profile.profileType === 'volunteer' && (
            <Card className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000] mt-6 bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
                  <h2 className="font-display text-2xl font-black uppercase flex items-center gap-2">
                    <Award className="w-6 h-6 text-yellow-500" /> Certificados de Impacto
                  </h2>
                  {!isReadOnly && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0_0_#000]" 
                      onClick={() => setShowAddCert(!showAddCert)}
                    >
                      {showAddCert ? "Fechar" : "Adicionar Manual"}
                    </Button>
                  )}
                </div>

                {showAddCert && (
                  <form onSubmit={handleAddCertSubmit} className="bg-yellow-50 p-5 border-4 border-black space-y-4 shadow-[4px_4px_0_0_#000]">
                    <h3 className="font-display text-lg font-black uppercase">Registrar Trabalho Voluntário</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black uppercase block mb-1">Instituição / ONG</label>
                        <Input required value={certOrg} onChange={e => setCertOrg(e.target.value)} placeholder="Ex: Lar do Idoso" className="h-10 border-2 border-black bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase block mb-1">Atividade / Função</label>
                        <Input required value={certTitle} onChange={e => setCertTitle(e.target.value)} placeholder="Ex: Cozinheiro Solidário" className="h-10 border-2 border-black bg-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black uppercase block mb-1">Horas Prestadas</label>
                        <Input required type="number" min={1} value={certHours} onChange={e => setCertHours(e.target.value)} className="h-10 border-2 border-black bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase block mb-1">Data da Atividade</label>
                        <Input required type="date" value={certDate} onChange={e => setCertDate(e.target.value)} className="h-10 border-2 border-black bg-white" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full font-black uppercase border-2 border-black bg-black text-white hover:bg-gray-800">
                      Salvar Certificado
                    </Button>
                  </form>
                )}

                <div className="grid gap-3 pt-2">
                  {certificatesList.map((cert: any) => (
                    <div key={cert.id} className="border-2 border-black p-4 bg-primary/10 flex justify-between items-center hover:bg-primary/20 transition-colors shadow-[2px_2px_0_0_#000]">
                      <div>
                        <div className="font-black text-sm uppercase">{cert.jobTitle}</div>
                        <div className="text-xs font-bold text-gray-600">{cert.institutionName} • {new Date(cert.issuedAt).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-black text-primary font-black border-2 border-black text-xs px-2.5 py-1">
                          {cert.hoursDonated}h Doadas
                        </Badge>
                        {cert.verificationCode && (
                          <div className="text-[10px] font-mono font-bold mt-1 text-gray-500">COD: {cert.verificationCode}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {certificatesList.length === 0 && (
                    <p className="text-gray-500 text-sm font-bold p-4 border-2 border-dashed border-gray-200 text-center">Nenhum certificado registrado.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* DONOR SECTION: DOADORES */}
          {profile.profileType === 'donor' && (
            <Card className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000] mt-6 bg-white">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-display text-2xl font-black uppercase flex items-center gap-2 border-b-2 border-black pb-3">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" /> Registro de Doações
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-primary/20 border-2 border-black p-4 text-center shadow-[2px_2px_0_0_#000]">
                    <div className="text-3xl font-black">{donationsList.length}</div>
                    <div className="text-xs font-black uppercase text-gray-600">Doações Realizadas</div>
                  </div>
                  <div className="bg-secondary/20 border-2 border-black p-4 text-center shadow-[2px_2px_0_0_#000]">
                    <div className="text-3xl font-black">R$ {donationsList.reduce((acc, curr) => acc + curr.amount, 0)}</div>
                    <div className="text-xs font-black uppercase text-gray-600">Valor Total Apoiado</div>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  {donationsList.map((don: any) => (
                    <div key={don.id} className="border-2 border-black p-3 bg-white flex justify-between items-center text-sm font-bold shadow-[2px_2px_0_0_#000]">
                      <div>
                        <div className="uppercase">{don.campaignTitle}</div>
                        <div className="text-xs text-gray-500 font-bold">{don.date}</div>
                      </div>
                      <div className="text-accent font-black text-base">R$ {don.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* INSTITUTION SECTION: ONGs */}
          {profile.profileType === 'institution' && (
            <Card className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000] mt-6 bg-white">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-display text-2xl font-black uppercase flex items-center gap-2 border-b-2 border-black pb-3">
                  <Building2 className="w-6 h-6 text-accent" /> Indicadores da Organização
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-primary/20 border-2 border-black p-4 text-center shadow-[2px_2px_0_0_#000]">
                    <div className="text-3xl font-black">{actionsCount}</div>
                    <div className="text-xs font-black uppercase text-gray-600">Número de Ações Realizadas</div>
                  </div>
                  <div className="bg-secondary/20 border-2 border-black p-4 text-center shadow-[2px_2px_0_0_#000]">
                    <div className="text-xs font-black uppercase text-gray-600 mb-2">Causas Principais</div>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {causesList.map((cause: string) => (
                        <Badge key={cause} className="bg-black text-white border border-black font-black text-[10px]">
                          {cause}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <aside className="space-y-6">
        <Card className="border-4 border-black rounded-none bg-secondary shadow-[6px_6px_0_0_#000]">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-display text-2xl font-black uppercase">Visão do Painel</h2>
            <div className="space-y-3 text-sm font-bold text-gray-700 leading-relaxed">
              <p>Mantenha seus dados e formas de contato sempre atualizados para que as ONGs do RN possam falar com você de forma rápida.</p>
              <p>Caso tenha cadastrado um telefone celular, ele será usado para o redirecionamento dos links rápidos do WhatsApp nas candidaturas.</p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
