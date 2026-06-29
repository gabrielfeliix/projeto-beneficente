import { ProfileClient } from '@/components/profile-client';
import { Suspense } from 'react';

export default function PerfilPage() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center font-display text-2xl font-black uppercase text-black">
        Carregando Perfil...
      </div>
    }>
      <ProfileClient />
    </Suspense>
  );
}
