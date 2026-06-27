'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Check, Loader2, Save, X } from 'lucide-react';
import { loadStoredProfile, saveStoredProfile } from '@/lib/auth';
import { getProfile, updateProfile } from '@/actions/platform';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function ProfileClient() {
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

  useEffect(() => {
    const stored = loadStoredProfile();
    if (!stored) {
      setLoading(false);
      return;
    }

    const storedProfile = stored;
    async function loadData() {
      try {
        const fullProfile = await getProfile(storedProfile.id);
        if (fullProfile) {
          setProfile(fullProfile);
          setName(fullProfile.name || '');
          setPhone(fullProfile.phone || '');
          setCity(fullProfile.city || '');
          setNeighborhood(fullProfile.neighborhood || '');
          setDescription(fullProfile.description || (fullProfile as any).mission || '');
        } else {
          // Fallback minimal profile from cookie
          setProfile(storedProfile);
          setName(storedProfile.name || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
              <Button
                onClick={() => setIsEditing(true)}
                size="lg"
                className="uppercase tracking-wider font-black border-2 border-black bg-primary text-black hover:bg-black hover:text-white shrink-0 shadow-[3px_3px_0_0_#000]"
              >
                <Pencil className="mr-2 w-4 h-4" /> Editar Perfil
              </Button>
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
                  <div><strong>E-mail de Login:</strong> {profile.email}</div>
                  <div><strong>Cidade / Estado:</strong> {profile.city || 'Não configurada'} - RN</div>
                  <div><strong>Bairro:</strong> {profile.neighborhood || 'Não informado'}</div>
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
                  <div><strong>Data de Cadastro:</strong> {new Date().toLocaleDateString('pt-BR')}</div>
                </div>
              </CardContent>
            </Card>
          </div>
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
