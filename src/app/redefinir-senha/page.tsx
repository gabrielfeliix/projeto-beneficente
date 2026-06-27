"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { validatePassword } from "@/lib/validators";
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const pwCheck = password.length > 0 ? validatePassword(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const pwResult = validatePassword(password);
      if (!pwResult.valid) {
        throw new Error(`Senha inválida: ${pwResult.message}`);
      }

      if (password !== confirmPassword) {
        throw new Error("As senhas não coincidem.");
      }

      if (isSupabaseConfigured && supabase) {
        const { error: err } = await supabase.auth.updateUser({
          password: password,
        });
        if (err) throw err;
        setSuccess("Sua senha foi redefinida com sucesso!");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setSuccess("Modo Offline: Senha redefinida com sucesso (simulado)!");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-black">
      <div className="mb-10 text-center">
        <Badge className="mb-4 bg-accent text-white border-2 border-black">Segurança</Badge>
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter">
          Nova Senha
        </h1>
        <p className="text-gray-600 font-bold mt-3">
          Insira e confirme sua nova senha abaixo.
        </p>
      </div>

      <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0_0_#000] text-black">
        {error && (
          <div className="border-4 border-red-500 bg-red-50 p-4 font-bold text-red-700 mb-6 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> {error}
          </div>
        )}
        {success && (
          <div className="border-4 border-green-500 bg-green-50 p-4 font-bold text-green-700 mb-6 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-bold uppercase text-sm text-gray-700 block mb-1">
              Nova Senha <span className="normal-case font-normal text-gray-400 text-xs">(mín. 8 caracteres com 1 número)</span>
            </label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Insira a nova senha"
                required
                className="h-12 border-2 border-black pr-12 font-bold"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-500">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {pwCheck && (
              <div className={`flex items-center gap-1 text-xs font-bold mt-1 ${pwCheck.valid ? "text-green-600" : "text-amber-600"}`}>
                {pwCheck.valid ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {pwCheck.message}
              </div>
            )}
          </div>

          <div>
            <label className="font-bold uppercase text-sm text-gray-700 block mb-1">Confirmar Nova Senha</label>
            <Input
              type={showPass ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
              required
              className="h-12 border-2 border-black font-bold"
            />
          </div>

          <Button type="submit" size="lg" disabled={loading}
            className="w-full h-14 uppercase font-black text-lg bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0_0_#000]">
            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Salvando...</> : "Atualizar Minha Senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
