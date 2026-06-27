"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { getCampaigns } from "@/actions/campaigns";
import {
  getApplicationsForVolunteer,
  getApplicationsForInstitution,
  updateApplicationStatus,
  getProfile,
} from "@/actions/platform";
import { mockVolunteers } from "@/data/mock";
import { issueCertificate, getVolunteerCertificates, type CertificateData } from "@/actions/certificates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loadStoredProfile } from "@/lib/auth";
import {
  Plus,
  Eye,
  MessageSquare,
  BarChart,
  Sparkles,
  Search,
  User,
  CheckCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Campaign, Application } from "@/domain/entities";

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [hoursToEmit, setHoursToEmit] = useState<number>(4);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("Parabéns por sua contribuição social!");
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [certs, setCerts] = useState<CertificateData[]>([]);
  const [volunteerPhones, setVolunteerPhones] = useState<Record<string, string>>({});

  const handleStatusChange = async (appId: string, nextStatus: "pending" | "selected" | "rejected") => {
    setUpdatingAppId(appId);
    try {
      const ok = await updateApplicationStatus(appId, nextStatus);
      if (ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: nextStatus } : app))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await issueCertificate(selectedApp.id, hoursToEmit, feedbackMsg);
      alert(`Certificado emitido com sucesso para ${selectedApp.volunteerName}!`);
      // Update app status to selected locally
      setApplications((prev) =>
        prev.map((app) => (app.id === selectedApp.id ? { ...app, status: "selected" } : app))
      );
      setSelectedApp(null);
    } catch (err) {
      const error = err as Error;
      alert("Erro ao emitir certificado: " + error.message);
    }
  };

  useEffect(() => {
    const user = loadStoredProfile();
    setProfile(user);

    async function loadData() {
      try {
        const allCampaigns = await getCampaigns();
        setCampaigns(allCampaigns);

        if (user) {
          if (user.profileType === "volunteer") {
            const volunteerApps = await getApplicationsForVolunteer(user.id);
            const defaultVolApps = [
              {
                id: "app-mock-1",
                jobId: "job-1",
                volunteerId: user.id,
                institutionId: "inst-1",
                jobTitle: "Facilitador de Oficinas de Leitura",
                institutionName: "Instituto Água Viva",
                volunteerName: user.name,
                message: "Gostaria muito de apoiar as crianças da comunidade com oficinas de leitura.",
                status: "selected" as const,
                submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
              }
            ];
            setApplications(volunteerApps.length > 0 ? volunteerApps : defaultVolApps);
            const volunteerCerts = await getVolunteerCertificates(user.id);
            setCerts(volunteerCerts);
          } else {
            const institutionApps = await getApplicationsForInstitution(user.id);
            const defaultApps = [
              {
                id: "app-mock-2",
                jobId: "job-1",
                volunteerId: "vol-2",
                institutionId: user.id,
                jobTitle: "Cozinheiro para Sopão Solidário",
                institutionName: user.name,
                volunteerName: "Lucas Mendes",
                message: "Olá! Tenho experiência com culinária de grande porte e gostaria muito de ajudar nos finais de semana.",
                status: "pending" as const,
                submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
              },
              {
                id: "app-mock-3",
                jobId: "job-2",
                volunteerId: "vol-3",
                institutionId: user.id,
                jobTitle: "Pedagoga para Reforço Escolar",
                institutionName: user.name,
                volunteerName: "Juliana Santos",
                message: "Olá! Sou pedagoga aposentada e posso auxiliar no apoio escolar e alfabetização de crianças carentes.",
                status: "selected" as const,
                submittedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
              },
            ];
            const finalApps = institutionApps.length > 0 ? institutionApps : defaultApps;
            setApplications(finalApps);

            // Fetch phone numbers for candidates
            const phones: Record<string, string> = {};
            for (const app of finalApps) {
              const mockVol = mockVolunteers.find(v => v.id === app.volunteerId || v.name === app.volunteerName);
              if (mockVol) {
                phones[app.volunteerId] = mockVol.phone || "";
              } else {
                const profileData = await getProfile(app.volunteerId);
                if (profileData && 'phone' in profileData) {
                  phones[app.volunteerId] = (profileData as any).phone || "";
                }
              }
            }
            setVolunteerPhones(phones);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="text-center font-display text-2xl font-black uppercase py-24">
        Carregando Painel...
      </div>
    );
  }

  // Se o usuário não estiver logado
  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="border-4 border-black p-8 bg-white shadow-brutalist-lg">
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter">Acesso Restrito</h1>
          <p className="text-gray-600 font-bold mt-4">
            Você precisa estar logado para acessar seu painel personalizado.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button size="lg" className="w-full uppercase font-black text-lg tracking-wider">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDEREIZAÇÃO DO DASHBOARD DO VOLUNTÁRIO ---
  if (profile.profileType === "volunteer") {
    // Caso de demonstração offline
    const displayApps =
      applications.length > 0
        ? applications
        : [
            {
              id: "app-mock-1",
              jobId: "job-1",
              volunteerId: profile.id,
              institutionId: "inst-1",
              jobTitle: "Facilitador de Oficinas de Leitura",
              institutionName: "Instituto Água Viva",
              volunteerName: profile.name,
              message: "Gostaria muito de apoiar as crianças da comunidade com oficinas de leitura.",
              status: "selected" as const,
              submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            },
          ];

    const displayCerts =
      certs.length > 0
        ? certs
        : [
            {
              id: "cert-mock-1",
              volunteerId: profile.id,
              institutionId: "inst-1",
              jobId: "job-1",
              volunteerName: profile.name,
              institutionName: "Associação Água Viva",
              jobTitle: "Auxiliar Administrativo de Doações",
              hoursDonated: 12,
              issuedAt: new Date().toISOString(),
              verificationCode: "LUM-DEMO123",
            },
          ];

    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">
              Olá, {profile.name}
            </h1>
            <p className="text-gray-600 font-bold mt-2">Área do Voluntário — Veja seu impacto e candidaturas</p>
          </div>
          <Link href="/vagas">
            <Button size="lg" className="text-lg uppercase font-black tracking-wider">
              <Search className="mr-2 w-5 h-5" /> Buscar Vagas
            </Button>
          </Link>
        </div>

        {/* Cards de Estatísticas do Voluntário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-primary border-4 border-black shadow-brutalist">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm uppercase">Candidaturas Realizadas</p>
                <h2 className="font-display text-4xl font-black mt-2">{displayApps.length}</h2>
              </div>
              <FileText className="w-12 h-12 opacity-50" />
            </CardContent>
          </Card>
          <Card className="bg-secondary border-4 border-black shadow-brutalist">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm uppercase">Status da Conta</p>
                <h2 className="font-display text-3xl font-black mt-2">Ativo</h2>
              </div>
              <CheckCircle className="w-12 h-12 opacity-50" />
            </CardContent>
          </Card>
          <Card className="bg-accent text-white border-4 border-black shadow-brutalist">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm uppercase">Perfil Concluído</p>
                <h2 className="font-display text-4xl font-black mt-2">100%</h2>
              </div>
              <User className="w-12 h-12 opacity-50" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* LADO ESQUERDO: Candidaturas e Certificados */}
          <div className="space-y-8">
            {/* Listagem de candidaturas */}
            <div className="space-y-6">
            <h2 className="font-display text-3xl font-black uppercase">Minhas Candidaturas</h2>
            
            <div className="space-y-6">
              {displayApps.map((app) => (
                <Card key={app.id} className="border-4 bg-white hover:bg-gray-50 flex flex-col sm:flex-row justify-between p-6 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display text-2xl font-bold">{app.jobTitle}</h3>
                      <Badge
                        variant={
                          app.status === "selected"
                            ? "default"
                            : app.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {app.status === "selected"
                          ? "Selecionado"
                          : app.status === "pending"
                          ? "Pendente"
                          : "Recusado"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 font-bold text-sm">Instituição: {app.institutionName}</p>
                    <p className="text-sm font-medium text-gray-500">
                      Sua mensagem de motivação: &quot;{app.message}&quot;
                    </p>
                  </div>
                  <div className="flex items-end justify-between sm:flex-col sm:justify-start gap-4">
                    <span className="text-xs font-bold text-gray-400">
                      Enviada em {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                    <Link href={`/vagas/${app.jobId}`}>
                      <Button variant="outline" size="sm" className="uppercase font-bold">
                        Ver Vaga
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Seção Certificados */}
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-black uppercase">Meus Certificados de Horas</h2>
            <div className="space-y-4">
              {displayCerts.map((cert) => (
                <Card key={cert.id} className="border-4 bg-white p-6 shadow-brutalist flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-display text-xl font-black uppercase">{cert.jobTitle}</h3>
                    <p className="text-sm font-bold text-gray-500">Emitido por: {cert.institutionName}</p>
                    <p className="text-xs font-black uppercase text-green-600 mt-1">✓ {cert.hoursDonated} horas homologadas</p>
                  </div>
                  <Link href={`/certificados/${cert.verificationCode}`}>
                    <Button className="border-2 border-black font-black uppercase text-xs bg-black text-white hover:bg-white hover:text-black">
                      Visualizar Certificado
                    </Button>
                  </Link>
                </Card>
              ))}

              {displayCerts.length === 0 && (
                <div className="p-8 border-4 border-dashed border-gray-200 text-center font-bold text-gray-400 uppercase text-xs tracking-wider">
                  Nenhum certificado emitido até o momento.
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Atalhos Rápidos */}
          <aside className="space-y-6">
            <Card className="border-4 bg-white p-6 shadow-brutalist">
              <h2 className="font-display text-2xl font-black uppercase mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Atalhos
              </h2>
              <div className="flex flex-col gap-4">
                <Link href="/vagas">
                  <Button className="w-full text-left justify-start font-bold uppercase py-4" variant="outline">
                    🔍 Explorar Vagas
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button className="w-full text-left justify-start font-bold uppercase py-4" variant="outline">
                    📰 Feed de Notícias
                  </Button>
                </Link>
                <Link href="/perfil">
                  <Button className="w-full text-left justify-start font-bold uppercase py-4" variant="outline">
                    👤 Meu Perfil Público
                  </Button>
                </Link>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DO DASHBOARD DO DOADOR ---
  if (profile.profileType === "donor") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 text-black">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-black pb-8">
          <div>
            <Badge className="bg-primary text-black border-2 border-black font-black uppercase mb-2">Painel do Doador</Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Olá, {profile.name}</h1>
            <p className="text-gray-600 font-bold mt-2">Veja o impacto das suas doações e apoie novas causas no RN.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/campaigns">
              <Button size="lg" className="text-lg font-black uppercase tracking-wider bg-black text-white hover:bg-gray-800">
                Apoiar Projetos
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas e Gamificação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-primary border-4 border-black shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6 space-y-2">
              <span className="font-bold text-xs uppercase text-gray-700">Total Contribuído</span>
              <h2 className="font-display text-4xl font-black">R$ 450,00</h2>
              <p className="text-xs font-bold text-gray-500">Destinado a 3 causas no RN</p>
            </CardContent>
          </Card>

          <Card className="bg-secondary border-4 border-black shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6 space-y-2">
              <span className="font-bold text-xs uppercase text-gray-700">Sua Ofensiva (Streak)</span>
              <h2 className="font-display text-4xl font-black flex items-center gap-2">🔥 12 Dias</h2>
              <p className="text-xs font-bold text-gray-500">Você doou ou interagiu 3x esta semana!</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-4 border-black shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6 space-y-2">
              <span className="font-bold text-xs uppercase text-gray-700">Recursos Doados</span>
              <h2 className="font-display text-4xl font-black">8 Itens</h2>
              <p className="text-xs font-bold text-gray-500">Alimentos, roupas e brinquedos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Esquerda: Histórico de doações e causas */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-black uppercase border-b-2 border-black pb-2">Minhas Doações Ativas</h3>
            
            <div className="space-y-4">
              {[
                { campaign: "Marmitas Solidárias Filipe Camarão", amount: 150.00, date: "25/06/2026", type: "Financeiro" },
                { campaign: "Abrigo Animal Cão Feliz Natal", amount: 50.00, date: "20/06/2026", type: "Financeiro" },
                { campaign: "Roupas de Frio para Crianças do Seridó", amount: 250.00, date: "15/06/2026", type: "Recurso Físico (15 peças)" },
              ].map((item, index) => (
                <div key={index} className="p-5 border-4 border-black bg-white shadow-[4px_4px_0_0_#000] flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-display text-lg font-black uppercase">{item.campaign}</h4>
                    <p className="text-xs font-bold text-gray-400">Tipo: {item.type} | Data: {item.date}</p>
                  </div>
                  <div className="font-display font-black text-xl bg-primary px-3 py-1 border-2 border-black">
                    {typeof item.amount === 'number' ? `R$ ${item.amount.toFixed(2)}` : item.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direita: Perfil rápido para doação de qualquer valor / recurso */}
          <aside className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] space-y-6">
            <div>
              <h3 className="font-display text-2xl font-black uppercase">Apoio Expresso</h3>
              <p className="text-xs font-bold text-gray-500 mt-1">Doe qualquer valor diretamente para o fundo geral da PROVE RN.</p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); alert("Obrigado pela sua contribuição expressa no fundo geral da PROVE!"); }} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase block mb-1">Destinar Para</label>
                <select className="w-full h-11 border-2 border-black bg-white px-2 font-bold text-sm font-sans">
                  <option value="fundo_geral">Fundo Geral de Impacto (PROVE)</option>
                  <option value="alimentacao">Fundo Setorial Alimentação</option>
                  <option value="saude">Fundo Setorial Saúde</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase block mb-1">Valor (R$)</label>
                <Input type="number" placeholder="Ex: 20" required className="border-2 border-black font-bold h-11 text-black bg-white" />
              </div>

              <Button type="submit" className="w-full h-12 bg-secondary text-black hover:bg-yellow-400 border-2 border-black font-black uppercase shadow-[3px_3px_0_0_#000]">
                Doar Imediatamente
              </Button>
            </form>

            <div className="pt-4 border-t-2 border-dashed border-gray-200">
              <h4 className="font-black text-xs uppercase mb-2">Badges de Orgulho</h4>
              <div className="flex gap-2">
                <Badge className="bg-accent text-white border border-black font-black text-[10px]">🔥 STREAK ATIVO</Badge>
                <Badge className="bg-primary text-black border border-black font-black text-[10px]">❤️ DOADOR ATIVO</Badge>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DO DASHBOARD DA EMPRESA ASSINANTE ---
  if (profile.profileType === "company") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 text-black">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-black pb-8">
          <div>
            <Badge className="bg-accent text-white border-2 border-black font-black uppercase mb-2">Painel Corporativo ESG</Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">{profile.name}</h1>
            <p className="text-gray-600 font-bold mt-2">
              Gerencie sua assinatura de impacto corporativo, selos de sustentabilidade e deduções fiscais no RN.
            </p>
          </div>
          <div className="bg-black text-white p-3 border-2 border-black font-bold text-sm">
            Status: <span className="text-green-400 uppercase font-black">Plano Ouro Ativo ✓</span>
          </div>
        </div>

        {/* Métricas Corporativas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-[#E0F2FE] border-4 border-black shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6 space-y-2">
              <span className="font-bold text-xs uppercase text-gray-700">Arrecadação Mensal Recorrente</span>
              <h2 className="font-display text-4xl font-black text-sky-900">R$ 500,00</h2>
              <p className="text-xs font-bold text-sky-700">Cobrado via PIX recorrente todo dia 10</p>
            </CardContent>
          </Card>

          <Card className="bg-[#F0FDF4] border-4 border-black shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6 space-y-2">
              <span className="font-bold text-xs uppercase text-gray-700">Deduções Fiscais (Simuladas)</span>
              <h2 className="font-display text-4xl font-black text-green-900">R$ 1.200,00</h2>
              <p className="text-xs font-bold text-green-700">Isenção potencial acumulada Lei Rouanet / Fundos Municipais</p>
            </CardContent>
          </Card>

          <Card className="bg-primary border-4 border-black shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6 space-y-2">
              <span className="font-bold text-xs uppercase text-gray-700">Selo de Impacto ESG</span>
              <h2 className="font-display text-2xl font-black">Empresa Ouro 🏆</h2>
              <p className="text-xs font-bold text-gray-500">Exibido nas páginas de apoio e relatórios</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Esquerda: Campanhas e impacto apoiado */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-black uppercase border-b-2 border-black pb-2">Campanhas Apoiadas sob seu Selo</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Refeitório Popular Seridó", description: "Sua assinatura mensal garante 200 marmitas por mês.", image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=300" },
                { title: "Inclusão Digital RN", description: "Parceria corporativa para doação de equipamentos usados.", image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=300" },
              ].map((c, idx) => (
                <div key={idx} className="border-4 border-black bg-white shadow-[4px_4px_0_0_#000] overflow-hidden">
                  <div className="h-32 w-full relative">
                    <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-display text-lg font-black uppercase">{c.title}</h4>
                    <p className="text-xs text-gray-600 font-bold">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direita: Simulador de assinatura corporativa / cobrança mensal regular */}
          <aside className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] space-y-6">
            <div>
              <h3 className="font-display text-xl font-black uppercase">Simulador de Assinatura ESG</h3>
              <p className="text-xs font-bold text-gray-500 mt-1">
                Configure sua doação corporativa mensal recorrente (PIX ou Cartão).
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert("Frequência de pagamento regular configurada com sucesso!"); }} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase block mb-1">Escolha o Plano</label>
                <select className="w-full h-11 border-2 border-black bg-white px-2 font-bold text-sm font-sans">
                  <option value="ouro">Plano Ouro (R$ 500,00/mês)</option>
                  <option value="prata">Plano Prata (R$ 200,00/mês)</option>
                  <option value="platina">Plano Platina (R$ 1.000,00/mês)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase block mb-1">Método de Recorrência</label>
                <select className="w-full h-11 border-2 border-black bg-white px-2 font-bold text-sm font-sans">
                  <option value="pix">PIX Recorrente Automatizado</option>
                  <option value="card">Cartão Corporativo</option>
                </select>
              </div>

              <div className="bg-cyan-50 border border-cyan-300 p-3 text-[11px] font-bold text-cyan-800 leading-snug">
                💡 Nota: Doações corporativas no RN podem deduzir até 2% do lucro operacional bruto do imposto de renda da pessoa jurídica.
              </div>

              <Button type="submit" className="w-full h-12 bg-primary text-black hover:bg-yellow-300 border-2 border-black font-black uppercase shadow-[3px_3px_0_0_#000]">
                Atualizar Assinatura
              </Button>
            </form>
          </aside>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DO DASHBOARD DA ONG ---
  // Filtra campanhas da ONG ativa
  const myCampaigns = campaigns.filter(
    (c) => c.organizerId === profile.id || (profile.id === "inst-1" && c.organizerId === "user-1")
  );

  const displayApplications = applications;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Meu Painel</h1>
          <p className="text-gray-600 font-bold mt-2">Área Administrativa — Gerencie suas campanhas e candidaturas</p>
        </div>
        <Link href="/campaigns/new">
          <Button size="lg" className="text-lg font-black uppercase tracking-wider">
            <Plus className="mr-2 w-5 h-5" /> Nova Campanha
          </Button>
        </Link>
      </div>

      {/* Cards de Métricas da ONG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-primary border-4 border-black shadow-brutalist">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm uppercase">Total Arrecadado</p>
              <h2 className="font-display text-4xl font-black mt-2">R$ 2.350</h2>
            </div>
            <BarChart className="w-12 h-12 opacity-50" />
          </CardContent>
        </Card>
        <Card className="bg-secondary border-4 border-black shadow-brutalist">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm uppercase">Minhas Campanhas</p>
              <h2 className="font-display text-4xl font-black mt-2">{myCampaigns.length}</h2>
            </div>
            <Eye className="w-12 h-12 opacity-50" />
          </CardContent>
        </Card>
        <Card className="bg-accent text-white border-4 border-black shadow-brutalist">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm uppercase">Candidaturas Ativas</p>
              <h2 className="font-display text-4xl font-black mt-2">{displayApplications.length}</h2>
            </div>
            <MessageSquare className="w-12 h-12 opacity-50" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* LADO ESQUERDO: CAMPANHAS E CANDIDATURAS */}
        <div className="space-y-12">
          {/* SEÇÃO CAMPANHAS */}
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-black uppercase">Nossas Campanhas</h2>
            <div className="grid grid-cols-1 gap-6">
              {myCampaigns.map((campaign) => (
                <Card key={campaign.id} className="flex flex-col sm:flex-row overflow-hidden hover:bg-gray-50 border-4 border-black shadow-brutalist">
                  <div className="w-full sm:w-56 h-40 relative border-b-4 sm:border-b-0 sm:border-r-4 border-black shrink-0">
                    <Image src={campaign.coverImage} alt={campaign.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-display text-xl font-black uppercase">{campaign.title}</h3>
                        <Badge className="bg-black text-white">{campaign.status === "active" ? "Ativa" : "Pausada"}</Badge>
                      </div>
                      <p className="text-gray-600 font-bold text-sm mt-2 line-clamp-2">{campaign.description}</p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Button variant="outline" size="sm" className="bg-white border-2 border-black font-bold uppercase text-xs">
                          Página Pública
                        </Button>
                      </Link>
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Button size="sm" className="bg-black border-2 border-black text-white font-black uppercase text-xs hover:bg-white hover:text-black">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Atualização
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}

              {myCampaigns.length === 0 && (
                <div className="p-10 border-4 border-dashed border-gray-300 text-center font-bold text-gray-500">
                  Nenhuma campanha cadastrada por esta instituição.
                </div>
              )}
            </div>
          </div>

          {/* SEÇÃO CANDIDATURAS / RECRUTAMENTO (KANBAN/LISTA ESTILO ATADOS) */}
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-black uppercase">Candidaturas e Recrutamento</h2>
            <div className="space-y-6">
              {displayApplications.map((app) => (
                <Card
                  key={app.id}
                  className={`border-4 p-6 bg-white shadow-brutalist relative ${
                    updatingAppId === app.id ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-display text-xl font-black uppercase">{app.volunteerName}</h3>
                        <Badge
                          className={`uppercase font-black text-xs ${
                            app.status === "selected"
                              ? "bg-green-500 text-white"
                              : app.status === "rejected"
                              ? "bg-red-500 text-white"
                              : "bg-yellow-500 text-black"
                          }`}
                        >
                          {app.status === "selected"
                            ? "Aprovado"
                            : app.status === "rejected"
                            ? "Recusado"
                            : "Pendente"}
                        </Badge>
                      </div>
                      <p className="text-gray-500 font-black text-xs uppercase">
                        Vaga: <span className="text-black">{app.jobTitle}</span>
                      </p>
                      <p className="text-gray-600 font-bold text-sm bg-gray-50 p-3 border-2 border-dashed border-gray-200 leading-relaxed">
                        &quot;{app.message}&quot;
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                      <span className="text-xs font-bold text-gray-400 sm:text-right">
                        Recebida em {new Date(app.submittedAt).toLocaleDateString()}
                      </span>

                      {/* Botão Direct WhatsApp Chat */}
                      {(() => {
                        const rawPhone = volunteerPhones[app.volunteerId] || "(84) 98888-7777";
                        const cleanPhone = rawPhone.replace(/\D/g, "");
                        const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
                        return (
                          <a
                            href={`https://wa.me/${formattedPhone}?text=Olá%20${encodeURIComponent(
                              app.volunteerName
                            )}!%20Recebemos%20sua%20candidatura%20no%20Lumiar%20para%20a%20vaga%20${encodeURIComponent(
                              app.jobTitle
                            )}.%20Gostaríamos%20de%20combinar%20os%20próximos%20passos!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button className="w-full font-bold uppercase text-xs border-2 border-black bg-white text-black hover:bg-black hover:text-white">
                              💬 Chamar no WhatsApp ({rawPhone})
                            </Button>
                          </a>
                        );
                      })()}

                      {app.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStatusChange(app.id, "selected")}
                            size="sm"
                            className="flex-1 font-black uppercase text-xs bg-green-600 text-white border-2 border-black hover:bg-white hover:text-green-600"
                          >
                            ✓ Aceitar
                          </Button>
                          <Button
                            onClick={() => handleStatusChange(app.id, "rejected")}
                            size="sm"
                            className="flex-1 font-black uppercase text-xs bg-red-600 text-white border-2 border-black hover:bg-white hover:text-red-600"
                          >
                            ✗ Recusar
                          </Button>
                        </div>
                      )}

                      {app.status === "selected" && (
                        <Button
                          onClick={() => setSelectedApp(app)}
                          className="w-full font-black uppercase text-xs bg-yellow-400 text-black border-2 border-black hover:bg-black hover:text-white"
                        >
                          🎓 Emitir Certificado
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* LADO DIREITO: ATALHOS & MÉTRICAS DE IMPACTO E MAPA */}
        <aside className="space-y-6">
          <Card className="border-4 bg-white p-6 shadow-brutalist">
            <h2 className="font-display text-xl font-black uppercase mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Painel ONG
            </h2>
            <div className="flex flex-col gap-3">
              <Link href="/campaigns/new">
                <Button className="w-full justify-start font-bold uppercase text-sm" variant="outline">
                  ➕ Criar Nova Campanha
                </Button>
              </Link>
              <Link href="/feed">
                <Button className="w-full justify-start font-bold uppercase text-sm" variant="outline">
                  📰 Feed da Comunidade
                </Button>
              </Link>
              <Link href="/perfil">
                <Button className="w-full justify-start font-bold uppercase text-sm" variant="outline">
                  👤 Configurar Perfil
                </Button>
              </Link>
            </div>
          </Card>

          {/* Métricas de Impacto e Causas */}
          <Card className="border-4 bg-white p-6 shadow-brutalist text-black space-y-4">
            <h2 className="font-display text-xl font-black uppercase flex items-center gap-2">
              📊 Impacto Social & Causas
            </h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-black text-gray-500 uppercase text-[10px]">Causas Apoiadas</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge className="bg-primary text-black border border-black font-black text-[10px]">Alimentação</Badge>
                  <Badge className="bg-primary text-black border border-black font-black text-[10px]">Educação</Badge>
                  <Badge className="bg-accent text-white border border-black font-black text-[10px]">Sertão Sem Sede</Badge>
                </div>
              </div>
              
              <div className="border-t-2 border-dashed border-gray-100 pt-3">
                <span className="font-black text-gray-500 uppercase text-[10px] block">Métricas Acumuladas</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-gray-50 border-2 border-black p-2 text-center">
                    <span className="text-xs font-bold text-gray-400 block uppercase">Refeições</span>
                    <span className="text-lg font-black text-black">1.250</span>
                  </div>
                  <div className="bg-gray-50 border-2 border-black p-2 text-center">
                    <span className="text-xs font-bold text-gray-400 block uppercase">Crianças</span>
                    <span className="text-lg font-black text-black">180+</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Mapa do Voluntariado no RN */}
          <Card className="border-4 bg-white p-6 shadow-brutalist text-black space-y-3">
            <h2 className="font-display text-xl font-black uppercase flex items-center gap-2">
              📍 Concentração de Voluntários (RN)
            </h2>
            <p className="text-xs font-bold text-gray-500 leading-snug">Distribuição geográfica dos candidatos e voluntários da sua instituição.</p>
            
            {/* Visual simulation of RN map region markers */}
            <div className="border-2 border-black bg-sky-50 h-44 relative overflow-hidden flex flex-col justify-between p-3">
              {/* Map grid decoration */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 pointer-events-none">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border border-dashed border-black" />
                ))}
              </div>
              
              {/* Map pins simulation */}
              <div className="absolute left-8 top-16 flex flex-col items-center">
                <Badge className="bg-black text-white text-[9px] font-black border border-black">Caicó (8)</Badge>
                <div className="w-2.5 h-2.5 bg-accent border-2 border-black rounded-full animate-ping mt-1" />
              </div>

              <div className="absolute right-12 top-8 flex flex-col items-center">
                <Badge className="bg-black text-white text-[9px] font-black border border-black">Natal (34)</Badge>
                <div className="w-2.5 h-2.5 bg-primary border-2 border-black rounded-full animate-pulse mt-1" />
              </div>

              <div className="absolute right-8 top-28 flex flex-col items-center">
                <Badge className="bg-black text-white text-[9px] font-black border border-black">Parnamirim (15)</Badge>
                <div className="w-2.5 h-2.5 bg-primary border-2 border-black rounded-full mt-1" />
              </div>
              
              <div className="mt-auto z-10 text-[9px] font-black text-gray-500 uppercase bg-white/80 p-1 border border-black rounded-none self-start">
                Região de Atuação: Rio Grande do Norte
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {/* MODAL DE EMISSÃO DE CERTIFICADOS (EFEITO UAU) */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#000000] space-y-6">
            <h3 className="font-display text-2xl font-black uppercase tracking-tight">Emitir Certificado</h3>
            <p className="text-gray-600 font-bold text-sm leading-relaxed">
              Ao emitir o certificado, você valida as horas trabalhadas do voluntário <strong>{selectedApp.volunteerName}</strong> na vaga <strong>{selectedApp.jobTitle}</strong>.
            </p>
            <form onSubmit={handleCreateCertificate} className="space-y-4">
              <div>
                <label className="font-bold uppercase text-xs text-gray-500 block mb-1">Carga Horária Aprovada (Horas)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={hoursToEmit}
                  onChange={(e) => setHoursToEmit(parseInt(e.target.value))}
                  className="w-full h-11 border-2 border-black rounded-none px-3 font-bold focus:ring-0 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold uppercase text-xs text-gray-500 block mb-1">Agradecimento / Feedback</label>
                <textarea
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  className="w-full p-3 border-2 border-black rounded-none font-bold text-sm h-24 focus:ring-0 focus:outline-none"
                  placeholder="Ex: Excelente engajamento no apoio comunitário..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedApp(null)}
                  className="uppercase font-bold border-2 border-black rounded-none"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="uppercase font-black border-2 border-black bg-black text-white hover:bg-white hover:text-black rounded-none px-6"
                >
                  Gerar Certificado
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
