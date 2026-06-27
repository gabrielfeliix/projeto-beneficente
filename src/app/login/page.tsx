"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter">Login</h1>
        <p className="text-gray-600 font-bold mt-3">Entre na sua conta para acessar seu painel.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6 bg-white border-4 border-border p-8 shadow-brutalist-lg">
        <div>
          <label className="font-bold uppercase tracking-wide text-sm">E-mail</label>
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            type="email"
            required
            className="mt-2"
          />
        </div>
        <div>
          <label className="font-bold uppercase tracking-wide text-sm">Senha</label>
          <Input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="******"
            type="password"
            required
            className="mt-2"
          />
        </div>

        {error && <div className="text-sm font-bold text-red-600">{error}</div>}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" size="lg" disabled={loading} className="uppercase tracking-wider">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <div className="text-sm text-gray-600">
            Não tem uma conta? <Link href="/cadastro" className="font-bold underline">Cadastre-se</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
