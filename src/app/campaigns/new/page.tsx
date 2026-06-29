"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { loadStoredProfile } from "@/lib/auth";

export default function NewCampaignPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const profile = loadStoredProfile();
    if (!profile) {
      router.push("/login");
    } else {
      setIsAllowed(true);
    }
  }, [router]);

  // States for conditionals
  const [organizerType, setOrganizerType] = useState<"fisica" | "juridica">("fisica");
  const [needType, setNeedType] = useState<"dinheiro" | "material">("dinheiro");

  // States for terms
  const [acceptIdentity, setAcceptIdentity] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptIdentity || !acceptTerms) {
      alert("Você deve confirmar sua identidade e aceitar os termos para prosseguir.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      router.push("/campaigns");
    }, 1500);
  };
  if (!isAllowed) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-display text-2xl font-black uppercase tracking-tighter">
        Verificando permissões...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 text-center sm:text-left">
        <Badge className="mb-4">Portal do Organizador</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">
          Iniciar Movimento
        </h1>
        <p className="font-bold text-gray-600 mt-2 text-lg">
          Transforme sua causa em realidade. Preencha com transparência e segurança.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* SEÇÃO 1: PERFIL DO ORGANIZADOR */}
        <Card className="border-4 bg-white shadow-brutalist-lg overflow-hidden">
          <div className="bg-primary border-b-4 border-border px-6 py-4">
            <h2 className="font-display text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-white text-black px-2 py-0.5 border-2 border-border text-sm">1</span>
              Quem está organizando?
            </h2>
          </div>
          <CardContent className="p-6 sm:p-8 space-y-8">
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setOrganizerType("fisica")}
                className={`flex-1 py-3 font-bold border-2 transition-transform active:scale-95 ${organizerType === "fisica" ? "bg-black text-white border-black" : "bg-white text-black border-border hover:bg-gray-50"}`}
              >
                Pessoa Física
              </button>
              <button
                type="button"
                onClick={() => setOrganizerType("juridica")}
                className={`flex-1 py-3 font-bold border-2 transition-transform active:scale-95 ${organizerType === "juridica" ? "bg-black text-white border-black" : "bg-white text-black border-border hover:bg-gray-50"}`}
              >
                ONG / Projeto (CNPJ)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="font-bold uppercase tracking-wide text-sm">Nome Completo / Razão Social</label>
                <Input required placeholder={organizerType === "fisica" ? "Ex: Maria da Silva" : "Ex: Associação Vida Nova"} className="h-12" />
              </div>
              <div className="space-y-3">
                <label className="font-bold uppercase tracking-wide text-sm">E-mail de Contato</label>
                <Input required type="email" placeholder="contato@exemplo.com" className="h-12" />
              </div>
              {organizerType === "fisica" ? (
                <div className="space-y-3">
                  <label className="font-bold uppercase tracking-wide text-sm">CPF</label>
                  <Input required placeholder="000.000.000-00" className="h-12" />
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="font-bold uppercase tracking-wide text-sm">CNPJ</label>
                  <Input required placeholder="00.000.000/0001-00" className="h-12" />
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 border-2 border-border space-y-4">
              <div className="flex items-start gap-4">
                <FileText className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h3 className="font-bold uppercase">Prova da Causa (Transparência)</h3>
                  <p className="text-sm font-medium text-gray-600 mt-1">Anexe uma foto do local, relato, ou documento que comprove a existência do projeto ou do beneficiário.</p>
                  <Input type="file" className="mt-4 bg-white" required />
                </div>
              </div>
            </div>

            {/* Termos e Segurança */}
            <div className="space-y-4 pt-4 border-t-2 border-dashed border-gray-300">
              <div className="flex items-start gap-3 bg-accent text-white p-4 border-2 border-black">
                <AlertCircle className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">A conta bancária cadastrada na plataforma terceira deverá estar <strong>obrigatoriamente no mesmo nome/CPF do criador</strong> (Pessoa Física) ou CNPJ da Instituição.</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={`w-6 h-6 border-2 border-black flex items-center justify-center shrink-0 transition-colors ${acceptIdentity ? 'bg-primary' : 'bg-white group-hover:bg-gray-100'}`}>
                  {acceptIdentity && <CheckCircle2 className="w-4 h-4 text-black" />}
                </div>
                <input type="checkbox" className="hidden" checked={acceptIdentity} onChange={(e) => setAcceptIdentity(e.target.checked)} />
                <span className="font-bold text-sm">Confirmo minha identidade e garanto que todas as informações prestadas são verdadeiras.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={`w-6 h-6 border-2 border-black flex items-center justify-center shrink-0 transition-colors ${acceptTerms ? 'bg-primary' : 'bg-white group-hover:bg-gray-100'}`}>
                  {acceptTerms && <CheckCircle2 className="w-4 h-4 text-black" />}
                </div>
                <input type="checkbox" className="hidden" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                <span className="font-bold text-sm">Li e aceito os <a href="#" className="underline decoration-primary decoration-2 hover:bg-primary/20">Termos de Uso e Política de Transparência</a> da plataforma PROVE.</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 2: A CAMPANHA */}
        <Card className="border-4 bg-white shadow-brutalist-lg overflow-hidden">
          <div className="bg-[#ff90e8] border-b-4 border-border px-6 py-4">
            <h2 className="font-display text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-white text-black px-2 py-0.5 border-2 border-border text-sm">2</span>
              Dados da Causa
            </h2>
          </div>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <label className="font-bold uppercase tracking-wide text-sm">Título da Campanha</label>
              <Input required placeholder="Ex: Construção do Telhado da Creche Esperança" className="h-12 text-lg font-medium" />
            </div>

            <div className="space-y-3">
              <label className="font-bold uppercase tracking-wide text-sm">Descrição Clara do Objetivo</label>
              <textarea
                required
                className="w-full brutalist-border p-4 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px] resize-y font-medium"
                placeholder="Conte de forma objetiva o motivo da campanha, quem será ajudado e qual o impacto real..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="font-bold uppercase tracking-wide text-sm">Categoria</label>
                <select className="w-full h-12 px-3 brutalist-border bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary" required>
                  <option value="">Selecione...</option>
                  <option value="saude">Saúde</option>
                  <option value="educacao">Educação</option>
                  <option value="animais">Animais</option>
                  <option value="moradia">Moradia</option>
                  <option value="esporte">Esporte</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="font-bold uppercase tracking-wide text-sm">Cidade (RN)</label>
                <select className="w-full h-12 px-3 brutalist-border bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary" required>
                  <option value="">Selecione...</option>
                  <option value="natal">Natal</option>
                  <option value="parnamirim">Parnamirim</option>
                  <option value="mossoro">Mossoró</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="font-bold uppercase tracking-wide text-sm">Bairro</label>
                <Input required placeholder="Ex: Alecrim" className="h-12" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="font-bold uppercase tracking-wide text-sm">URL da Imagem ou Vídeo (Capa)</label>
                <Input required placeholder="Link do YouTube ou Imagem hospedada" className="h-12" />
              </div>
              <div className="space-y-3">
                <label className="font-bold uppercase tracking-wide text-sm">Rede Social do Projeto</label>
                <Input placeholder="Ex: instagram.com/projeto" className="h-12" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 3: ARRECADAÇÃO */}
        <Card className="border-4 bg-white shadow-brutalist-lg overflow-hidden">
          <div className="bg-[#23a094] border-b-4 border-border px-6 py-4">
            <h2 className="font-display text-2xl font-black uppercase text-white flex items-center gap-2">
              <span className="bg-white text-black px-2 py-0.5 border-2 border-border text-sm">3</span>
              Necessidade
            </h2>
          </div>
          <CardContent className="p-6 sm:p-8 space-y-8">

            <div>
              <p className="font-bold uppercase tracking-wide text-sm mb-4">O que a campanha precisa arrecadar prioritariamente?</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className={`flex-1 border-2 border-border p-4 cursor-pointer transition-colors ${needType === "dinheiro" ? "bg-primary shadow-brutalist-sm" : "bg-white hover:bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="need"
                      checked={needType === "dinheiro"}
                      onChange={() => setNeedType("dinheiro")}
                      className="w-5 h-5 accent-black"
                    />
                    <span className="font-black text-lg uppercase">Dinheiro</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-2 ml-8">Recursos financeiros para pagamento de obras, tratamentos ou compras maiores.</p>
                </label>

                <label className={`flex-1 border-2 border-border p-4 cursor-pointer transition-colors ${needType === "material" ? "bg-[#ff90e8] shadow-brutalist-sm" : "bg-white hover:bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="need"
                      checked={needType === "material"}
                      onChange={() => setNeedType("material")}
                      className="w-5 h-5 accent-black"
                    />
                    <span className="font-black text-lg uppercase">Material / Trabalho</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-2 ml-8">Alimentos, roupas, materiais de construção ou voluntários.</p>
                </label>
              </div>
            </div>

            {needType === "dinheiro" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 border-2 border-border border-dashed">
                <div className="space-y-3">
                  <label className="font-bold uppercase tracking-wide text-sm">Meta Financeira (R$)</label>
                  <Input required type="number" placeholder="Ex: 5000" className="h-12 text-lg font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="font-bold uppercase tracking-wide text-sm text-accent flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Link de Plataforma Terceira
                  </label>
                  <Input required placeholder="Link da Vakinha, Apoia.se, etc" className="h-12" />
                  <p className="text-xs font-bold text-gray-500">Para garantir transparência, a gestão financeira é feita por plataformas especializadas parceiras.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 border-2 border-border border-dashed">
                <div className="space-y-3 md:col-span-2">
                  <label className="font-bold uppercase tracking-wide text-sm">Indicação exata da Necessidade</label>
                  <Input required placeholder="Ex: 50 pacotes de cimento e 2 pedreiros voluntários" className="h-12" />
                </div>
                <div className="space-y-3">
                  <label className="font-bold uppercase tracking-wide text-sm">Ponto de Coleta (Endereço)</label>
                  <Input required placeholder="Local onde as doações devem ser entregues" className="h-12" />
                </div>
                <div className="space-y-3">
                  <label className="font-bold uppercase tracking-wide text-sm text-green-600 flex items-center gap-2">
                    WhatsApp para Coordenar Entrega
                  </label>
                  <Input required placeholder="(84) 90000-0000" className="h-12" />
                </div>
              </div>
            )}

            <div className="pt-8 flex flex-col sm:flex-row justify-end gap-4 border-t-4 border-border">
              <Button type="button" variant="ghost" onClick={() => router.back()} className="text-lg h-14 px-8" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="lg"
                className={`text-xl px-10 h-14 uppercase tracking-wider transition-all ${(!acceptIdentity || !acceptTerms) ? "opacity-50 cursor-not-allowed bg-gray-400" : "bg-black text-white hover:-translate-y-1 hover:shadow-brutalist active:translate-y-0"
                  }`}
                disabled={isSubmitting || !acceptIdentity || !acceptTerms}
              >
                {isSubmitting ? "Publicando..." : "Publicar Campanha"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
