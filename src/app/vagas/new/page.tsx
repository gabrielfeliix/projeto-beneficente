"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createJob } from "@/actions/platform";
import { PlusCircle, ArrowLeft, Info } from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Educação");
  const [city, setCity] = useState("Natal");
  const [neighborhood, setNeighborhood] = useState("");
  const [modality, setModality] = useState("Presencial");
  const [causes, setCauses] = useState("Educação");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [requirementsEssential, setRequirementsEssential] = useState("");
  const [requirementsOptional, setRequirementsOptional] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const essentialArray = requirementsEssential
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
      const optionalArray = requirementsOptional
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      const res = await createJob({
        title,
        description,
        category,
        city,
        neighborhood,
        modality,
        causes,
        startDate: startDate || new Date().toISOString().split("T")[0],
        endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        requirementsEssential: essentialArray,
        requirementsOptional: optionalArray,
        contactName,
        contactEmail,
        contactPhone,
      });

      if (!res.success) {
        throw new Error(res.error || "Erro ao criar vaga.");
      }

      setSuccess(`Vaga criada com sucesso! ID Gerado: #${res.data?.id || "nova"}`);
      setTimeout(() => {
        router.push("/vagas");
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Algo deu errado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-black">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 font-bold text-sm uppercase mb-6 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Vagas
      </button>

      <div className="mb-8">
        <Badge className="mb-4 bg-primary text-black border-2 border-black font-black uppercase">
          ONG / Instituição
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">
          Criar Nova Vaga de Voluntariado
        </h1>
        <p className="font-bold text-gray-600 mt-2">
          Cadastre uma nova oportunidade de impacto comunitário no Rio Grande do Norte.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-4 border-red-500 p-4 font-bold text-red-700 mb-6 uppercase text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-4 border-green-500 p-4 font-bold text-green-700 mb-6 uppercase text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-4 border-black rounded-none shadow-[6px_6px_0_0_#000] bg-white">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-2xl font-black uppercase border-b-2 border-black pb-2 flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-primary" /> Detalhes da Oportunidade
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase block text-gray-700">Título da Vaga *</label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Professor de Inglês Voluntário"
                className="border-2 border-black h-11 font-bold bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase block text-gray-700">Descrição Detalhada *</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva as atividades, horários e qualidades desejadas no voluntário..."
                className="w-full border-2 border-black p-3 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-black uppercase block text-gray-700 mb-1">Categoria *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 border-2 border-black bg-white px-2 font-bold text-sm font-sans"
                >
                  <option value="Educação">Educação</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Cultura">Cultura</option>
                  <option value="Meio Ambiente">Meio Ambiente</option>
                  <option value="Moradia">Moradia</option>
                  <option value="Animais">Animais</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase block text-gray-700 mb-1">Formato *</label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                  className="w-full h-11 border-2 border-black bg-white px-2 font-bold text-sm font-sans"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="À Distância">À Distância (Remoto)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase block text-gray-700 mb-1">Causa Apoiada *</label>
                <select
                  value={causes}
                  onChange={(e) => setCauses(e.target.value)}
                  className="w-full h-11 border-2 border-black bg-white px-2 font-bold text-sm font-sans"
                >
                  <option value="Crianças">Crianças</option>
                  <option value="Animais">Animais</option>
                  <option value="Idosos">Idosos</option>
                  <option value="Combate à Fome">Combate à Fome</option>
                  <option value="Meio Ambiente">Meio Ambiente</option>
                  <option value="Educação">Educação</option>
                  <option value="Direitos Humanos">Direitos Humanos</option>
                  <option value="Tecnologia">Tecnologia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase block text-gray-700 mb-1">Cidade (RN) *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 border-2 border-black bg-white px-2 font-bold text-sm font-sans"
                >
                  <option value="Natal">Natal</option>
                  <option value="Parnamirim">Parnamirim</option>
                  <option value="Caicó">Caicó</option>
                  <option value="Mossoró">Mossoró</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase block text-gray-700 mb-1">Bairro *</label>
                <Input
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Ex: Tirol, Lagoa Nova..."
                  className="border-2 border-black h-11 font-bold bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase block text-gray-700 mb-1">Data de Início *</label>
                <Input
                  required
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-2 border-black h-11 font-bold bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase block text-gray-700 mb-1">Data Limite de Inscrição *</label>
                <Input
                  required
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-2 border-black h-11 font-bold bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase block text-gray-700">Requisitos Essenciais (Separados por vírgula) *</label>
              <Input
                required
                value={requirementsEssential}
                onChange={(e) => setRequirementsEssential(e.target.value)}
                placeholder="Ex: Fluência em inglês, Experiência didática, Notebook próprio"
                className="border-2 border-black h-11 font-bold bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase block text-gray-700">Diferenciais (Separados por vírgula)</label>
              <Input
                value={requirementsOptional}
                onChange={(e) => setRequirementsOptional(e.target.value)}
                placeholder="Ex: Certificado TEFL, Residir próximo ao local"
                className="border-2 border-black h-11 font-bold bg-white"
              />
            </div>

            <h3 className="font-display text-xl font-black uppercase border-b border-black pb-1 pt-4">Informações de Contato</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-black uppercase block text-gray-700 mb-1">Nome do Gestor *</label>
                <Input
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="border-2 border-black h-11 font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase block text-gray-700 mb-1">E-mail *</label>
                <Input
                  required
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="gestor@ong.org"
                  className="border-2 border-black h-11 font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase block text-gray-700 mb-1">WhatsApp de Contato *</label>
                <Input
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(84) 99999-0000"
                  className="border-2 border-black h-11 font-bold bg-white"
                />
              </div>
            </div>

            <div className="bg-primary/10 border-2 border-black p-4 flex items-start gap-3 mt-4">
              <Info className="w-5 h-5 text-black shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-gray-700">
                Ao publicar, sua vaga estará imediatamente visível para busca pública e candidaturas por voluntários no RN.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-lg h-14 font-black uppercase border-2 border-black bg-black text-white hover:bg-primary hover:text-black transition-all shadow-[4px_4px_0_0_#000]"
            >
              {loading ? "Criando Vaga..." : "Publicar Vaga de Voluntariado"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
