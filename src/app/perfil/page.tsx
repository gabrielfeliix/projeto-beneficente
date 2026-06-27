import { getProfile } from '@/actions/platform';
import { cookies } from 'next/headers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil } from 'lucide-react';

export default async function PerfilPage() {
  let profileId = null;
  const cookieStore = await cookies();
  const profileCookie = cookieStore.get('mutirao_user_profile')?.value;
  if (profileCookie) {
    try {
      const stored = JSON.parse(decodeURIComponent(profileCookie));
      if (stored && stored.id) profileId = stored.id;
    } catch {}
  }

  const profile = profileId ? await getProfile(profileId) : null;

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center font-bold text-gray-600">Perfil não encontrado.</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <Badge className="mb-4">Perfil</Badge>
        <div className="bg-white border-4 border-border p-8 shadow-brutalist-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-4xl font-black uppercase tracking-tighter">{profile.name}</h1>
              <p className="text-gray-600 font-bold mt-3">{profile.description}</p>
            </div>
            <Button size="lg" className="uppercase tracking-wider"><Pencil className="mr-2" />Editar Perfil</Button>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="border-2 rounded-none">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-black uppercase mb-4">Dados Básicos</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <div><strong>Email:</strong> {profile.email}</div>
                  <div><strong>Telefone:</strong> {profile.phone || 'Não informado'}</div>
                  <div><strong>Cidade:</strong> {profile.city}</div>
                  <div><strong>Bairro:</strong> {profile.neighborhood}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 rounded-none">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-black uppercase mb-4">Ações</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>Atualize seu feed, habilidades e experiência para melhorar sua compatibilidade com vagas.</p>
                  <p>Gerencie suas candidaturas, notificações e informações de contato.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 space-y-6">
            <Card className="border-2 rounded-none">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-black uppercase mb-4">Dados do Perfil</h2>
                {'profileType' in profile && profile.profileType === 'volunteer' ? (
                  <div className="space-y-3 text-sm text-gray-700">
                    <div><strong>CPF:</strong> {profile.cpf}</div>
                    <div><strong>Data de Nascimento:</strong> {new Date(profile.birthDate).toLocaleDateString()}</div>
                    <div><strong>Disponibilidade:</strong> {profile.availability}</div>
                    <div><strong>Interesses:</strong> {profile.interests?.join(', ')}</div>
                    <div><strong>Habilidades:</strong> {profile.skills?.join(', ')}</div>
                    <div><strong>Contato de emergência:</strong> {profile.emergencyContact}</div>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-gray-700">
                    <div><strong>CNPJ:</strong> {profile.cnpj}</div>
                    <div><strong>Representante:</strong> {profile.legalRepresentative.name}</div>
                    <div><strong>Dados bancários:</strong> {profile.bankDetails}</div>
                    <div><strong>Missão:</strong> {profile.mission}</div>
                    <div><strong>Áreas de atuação:</strong> {profile.serviceAreas.join(', ')}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <Card className="border-2 rounded-none bg-secondary">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-black uppercase mb-4">Visão Rápida</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div><strong>Perfil:</strong> {profile.profileType === 'volunteer' ? 'Voluntário' : 'Instituição'}</div>
              <div><strong>Notificações:</strong> 2 não lidas</div>
              <div><strong>Candidaturas Ativas:</strong> 1</div>
              <div><strong>Feed atualizado:</strong> sim</div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
