"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveStoredProfile } from '@/lib/auth';

const sampleUsers = [
  {
    id: 'vol-1',
    profileType: 'volunteer' as const,
    name: 'Ana Beatriz',
    email: 'ana.beatriz@email.com',
  },
  {
    id: 'inst-1',
    profileType: 'institution' as const,
    name: 'Instituto Água Viva',
    email: 'contato@aguaviva.org',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = sampleUsers.find((user) => user.email === email.trim().toLowerCase());
    if (!user) {
      setError('Usuário não encontrado. Use o e-mail de demonstração.');
      return;
    }

    saveStoredProfile(user);
    router.push('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter">Login</h1>
        <p className="text-gray-600 font-bold mt-3">Entre com o e-mail de demonstração para acessar seu painel.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6 bg-white border-4 border-border p-8 shadow-brutalist-lg">
        <div>
          <label className="font-bold uppercase tracking-wide text-sm">E-mail</label>
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ana.beatriz@email.com"
            type="email"
            required
            className="mt-2"
          />
        </div>

        {error && <div className="text-sm font-bold text-red-600">{error}</div>}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" size="lg" className="uppercase tracking-wider">Entrar</Button>
          <div className="text-sm text-gray-600">
            Use <strong>ana.beatriz@email.com</strong> para voluntário ou <strong>contato@aguaviva.org</strong> para ONG.
          </div>
        </div>
      </form>

      <div className="mt-10 text-center text-sm text-gray-600">
        <p>Não há autenticação real ainda. Este login simula acesso para o fluxo de ONG/voluntário.</p>
      </div>
    </div>
  );
}
