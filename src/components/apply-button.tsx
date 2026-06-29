"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadStoredProfile } from "@/lib/auth";
import { submitApplication } from "@/actions/platform";
import { UserCheck, ShieldCheck, LogIn, CheckCircle, AlertCircle } from "lucide-react";

interface ApplyButtonProps {
  jobId: string;
  jobTitle: string;
}

export function ApplyButton({ jobId, jobTitle }: ApplyButtonProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<{ id: string; name: string; profileType: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const p = loadStoredProfile();
    setProfile(p);
  }, []);

  // Visitante não logado — CTA para login
  if (!profile) {
    return (
      <div className="border-4 border-black p-6 bg-white shadow-[4px_4px_0_0_#000] space-y-4">
        <div className="bg-primary/30 border-2 border-black p-4">
          <h2 className="font-display text-xl font-black uppercase flex items-center gap-2">
            <LogIn className="w-5 h-5" /> Quer se voluntariar?
          </h2>
          <p className="font-bold text-sm mt-2 text-gray-700">
            Faça login ou crie uma conta gratuita para se candidatar a esta vaga e fazer parte da mudança.
          </p>
        </div>
        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full font-black uppercase border-2 border-black bg-black text-white hover:bg-gray-800"
            onClick={() => router.push(`/login?redirect=/vagas/${jobId}`)}>
            Entrar e Candidatar-se
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full font-black uppercase border-2 border-black"
            onClick={() => router.push(`/login?mode=signup&redirect=/vagas/${jobId}`)}>
            Criar Conta
          </Button>
        </div>
        <p className="text-xs font-bold text-center text-gray-500">
          Cadastro rápido, gratuito e sem compromisso.
        </p>
      </div>
    );
  }

  // ONG não pode se candidatar
  if (profile.profileType === "institution") {
    return (
      <div className="border-4 border-black p-6 bg-gray-50 shadow-[4px_4px_0_0_#000] space-y-3">
        <Badge className="bg-gray-200 text-gray-700 border-2 border-gray-400 font-black uppercase">Apenas Voluntários</Badge>
        <h2 className="font-display text-xl font-black uppercase">Candidatura Restrita</h2>
        <p className="font-bold text-sm text-gray-600">
          Apenas voluntários podem se candidatar a vagas. Sua conta é do tipo ONG/Instituição.
        </p>
        <Button variant="outline" className="w-full font-black uppercase border-2 border-black" onClick={() => router.push("/dashboard")}>
          Ir para Meu Painel
        </Button>
      </div>
    );
  }

  // Candidatura enviada com sucesso
  if (submitted) {
    return (
      <div className="border-4 border-green-500 p-6 bg-green-50 shadow-[4px_4px_0_0_#16a34a] space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <h2 className="font-display text-xl font-black uppercase text-green-700">Candidatura Enviada!</h2>
        </div>
        <p className="font-bold text-sm text-green-800">
          Sua candidatura para <strong>{jobTitle}</strong> foi registrada com sucesso. A ONG entrará em contato em breve.
        </p>
        <Button className="w-full font-black uppercase border-2 border-black bg-black text-white" onClick={() => router.push("/dashboard")}>
          Ver Minhas Candidaturas
        </Button>
      </div>
    );
  }

  // Formulário de candidatura
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) { setError("Você deve aceitar os termos para se candidatar."); return; }
    setLoading(true); setError("");

    try {
      const res = await submitApplication({
        jobId,
        volunteerId: profile.id,
        message,
      });

      if (!res.success) {
        throw new Error(res.error || "Erro ao enviar candidatura.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar candidatura.");
    } finally { setLoading(false); }
  };

  return (
    <div className="border-4 border-black p-6 bg-primary shadow-[4px_4px_0_0_#000] space-y-5">
      <h2 className="font-display text-2xl font-black uppercase">Candidatar-se</h2>
      <p className="font-bold text-sm text-gray-800">
        Olá, <strong>{profile.name}</strong>! Envie sua candidatura para esta vaga.
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-3 text-sm font-bold">
          <UserCheck className="w-4 h-4 shrink-0" /> Candidatura em nome do seu perfil
        </div>
        <div className="flex items-center gap-3 text-sm font-bold">
          <ShieldCheck className="w-4 h-4 shrink-0" /> Dados protegidos pela plataforma
        </div>
      </div>

      {error && (
        <div className="border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleApply} className="space-y-4">
        <div>
          <label className="font-bold uppercase text-xs text-gray-700 block mb-1">Mensagem de Motivação (Opcional)</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder="Conte brevemente por que você quer participar desta vaga..."
            className="w-full border-2 border-black p-3 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="w-5 h-5 mt-0.5 accent-black shrink-0" />
          <span className="text-sm font-bold">Confirmo que li os requisitos e aceito o compromisso com esta ação voluntária.</span>
        </label>
        <Button type="submit" size="lg" disabled={loading} className="w-full uppercase font-black border-2 border-black bg-black text-white hover:bg-gray-800">
          {loading ? "Enviando..." : "Confirmar Candidatura"}
        </Button>
      </form>
    </div>
  );
}
