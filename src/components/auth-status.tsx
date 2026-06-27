"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentProfile, signOut, StoredProfile } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export function AuthStatus() {
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await signOut();
    setProfile(null);
    window.location.href = '/';
  };

  if (loading) {
    return <div className="text-sm">Carregando...</div>;
  }

  if (!profile) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login"><Button size="sm" variant="outline" className="font-bold">Entrar</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right text-sm">
        <div className="font-bold uppercase">{profile.name}</div>
        <div className="text-gray-500">{profile.profileType === 'institution' ? 'ONG' : 'Voluntário'}</div>
      </div>
      <Link href={profile.profileType === 'institution' ? '/campaigns/new' : '/perfil'}>
        <Button size="sm" className="uppercase">{profile.profileType === 'institution' ? 'Criar Campanha' : 'Meu Perfil'}</Button>
      </Link>
      <Button size="sm" variant="secondary" onClick={handleLogout}>Sair</Button>
    </div>
  );
}
