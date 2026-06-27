'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, Heart, ShieldCheck, Megaphone, Check, Search, 
  Filter, Award, User, LogOut, LayoutDashboard, Calendar, Share2,
  FileText, CheckCircle, Sparkles, MessageSquare, AlertCircle, ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { saveStoredProfile } from '@/lib/auth';
import { getProfile, getJobs, getApplicationsForVolunteer } from '@/actions/platform';
import { getCampaigns, getCampaignById, getCampaignUpdates } from '@/actions/campaigns';
import { getCampaignExpenses } from '@/actions/accountability';
import { getVolunteerCertificates } from '@/actions/certificates';

const MOCK_CAMPAIGNS = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'MARMITAS SOLIDÁRIAS FILIPE CAMARÃO',
    category: 'Alimentação',
    city: 'Natal',
    neighborhood: 'Filipe Camarão',
    coverImage: '/images/hero_community.png',
    financialGoal: 5000,
    financialRaised: 3450,
    mainNeed: 'Arroz, feijão e carne para preparo',
    status: 'active',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'Refeitório Comunitário e Sopão do Seridó',
    category: 'Alimentação',
    city: 'Caicó',
    neighborhood: 'Centro',
    coverImage: '/images/hero_community.png',
    financialGoal: 3000,
    financialRaised: 3000,
    mainNeed: 'Ingredientes para sopa e embalagens descartáveis',
    status: 'completed',
  }
];

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Facilitador de Oficinas de Leitura',
    category: 'Educação',
    city: 'Natal',
    modality: 'Presencial',
    description: 'Auxiliar crianças na alfabetização básica e leitura de histórias aos sábados pela manhã no centro comunitário.',
  },
  {
    id: '2',
    title: 'Cozinheiro para Sopão Solidário',
    category: 'Alimentação',
    city: 'Caicó',
    modality: 'Presencial',
    description: 'Auxiliar no preparo de panelas de sopa e higienização dos insumos na sede da ONG em Caicó.',
  }
];

const MOCK_UPDATES = [
  {
    id: 'u1',
    content: '🍲 Preparativos a todo vapor para o sopão deste sábado! Graças ao apoio de vocês, compramos todos os legumes e ingredientes fresquinhos no mercado local. Nossa cozinha comunitária em Caicó já está pronta para receber os voluntários.',
    imageUrl: '/images/hero_community.png',
    likes: 24,
    shares: 5,
    date: 'Hoje'
  },
  {
    id: 'u2',
    content: '❤️ Meta de arrecadação financeira atingida em 100%! Estamos imensamente gratos a cada doador que tornou isso possível. Com esse valor de R$ 3.000,00 garantiremos a manutenção do refeitório social e o sopão por mais 3 meses.',
    imageUrl: '/images/hero_community.png',
    likes: 48,
    shares: 12,
    date: 'Ontem'
  }
];

const MOCK_EXPENSES = [
  { id: 'e1', amount: 450, category: 'Alimentação', description: 'Compra de 100kg de feijão carioca e 50kg de arroz agulha.', date: 'Ontem' },
  { id: 'e2', amount: 180, category: 'Logística', description: 'Pagamento de frete para entrega das cestas e marmitas.', date: 'Há 2 dias' }
];

const SLIDES = [
  {
    title: 'Portal de Conexão PROVI',
    subtitle: 'Uma vitrine viva e dinâmica para impulsionar o engajamento social no RN.',
    type: 'home',
  },
  {
    title: 'Explorar Causas Verificadas',
    subtitle: 'Filtragem simplificada e identificação de campanhas seguras classificadas por IA.',
    type: 'explorer',
  },
  {
    title: 'Prestação de Contas em Tempo Real',
    subtitle: 'Transparência financeira de despesas e notas fiscais com termômetro IA.',
    type: 'campaign_detail',
  },
  {
    title: 'Vagas de Voluntariado Qualificadas',
    subtitle: 'Engajamento direto e flexível com organizações locais estilo Atados.',
    type: 'jobs',
  },
  {
    title: 'Gestão e Certificação de Impacto',
    subtitle: 'Painel completo do voluntário mostrando candidaturas e certificados ESG.',
    type: 'dashboard',
  },
  {
    title: 'Experimente a Plataforma',
    subtitle: 'Acesse o portal ao vivo e conecte-se com causas do RN.',
    type: 'qrcode',
  }
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dynamic DB states
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaignUpdates, setCampaignUpdates] = useState<any[]>([]);
  const [campaignExpenses, setCampaignExpenses] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);
  const slideContainers = useRef<(HTMLDivElement | null)[]>([]);

  // 1. Programmatic Login and DB Fetching in Background
  useEffect(() => {
    const loadRealData = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          // Sign in
          const { data, error } = await supabase.auth.signInWithPassword({
            email: 'teste@gmail.com',
            password: '12345678',
          });

          if (error) throw error;

          if (data.user) {
            const profile = await getProfile(data.user.id);
            if (profile) {
              const typeVal = profile.profileType as 'donor' | 'volunteer' | 'institution' | 'fiscal' | 'admin' | 'company';
              saveStoredProfile({
                id: profile.id,
                profileType: typeVal,
                role: typeVal,
                name: profile.name,
                email: profile.email || 'teste@gmail.com',
              });

              // Load volunteer specific details
              const apps = await getApplicationsForVolunteer(profile.id);
              setApplications(apps);

              const certs = await getVolunteerCertificates(profile.id);
              setCertificates(certs);
            }
          }
        }

        // Load generic platform data
        const dbCampaigns = await getCampaigns();
        setCampaigns(dbCampaigns);

        const dbJobs = await getJobs();
        setJobs(dbJobs);

        // Load specific Marmitas campaign (10000000-0000-0000-0000-000000000001) details
        const targetCampId = '10000000-0000-0000-0000-000000000001';
        const detailCamp = await getCampaignById(targetCampId);
        if (detailCamp) {
          setSelectedCampaign(detailCamp);
          const updates = await getCampaignUpdates(targetCampId);
          setCampaignUpdates(updates);
          const expenses = await getCampaignExpenses(targetCampId);
          setCampaignExpenses(expenses);
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Erro ao carregar dados reais do banco:', err);
        setIsLoaded(true); // Fallback to local mocks if DB fails
      }
    };

    loadRealData();
  }, []);

  // 2. Navigation Handlers
  const handleNext = useCallback(() => {
    setCurrentSlide(prev => (prev < SLIDES.length - 1 ? prev + 1 : prev));
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Click navigation (Left/Right half of screen)
  const handleScreenClick = (e: React.MouseEvent) => {
    const width = window.innerWidth;
    if (e.clientX < width / 2) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  // Reset scroll and start smooth auto-scroll on slide change
  useEffect(() => {
    // Reset all scroll positions
    slideContainers.current.forEach((container, index) => {
      if (index !== currentSlide && container) {
        container.scrollTop = 0;
      }
    });

    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
    }

    const activeContainer = slideContainers.current[currentSlide];
    if (!activeContainer) return;

    // Delay auto-scrolling slightly to let transition finish
    const timer = setTimeout(() => {
      let scrollPos = 0;
      scrollInterval.current = setInterval(() => {
        scrollPos += 1; // Smooth cinematic scroll
        if (activeContainer) {
          activeContainer.scrollTop = scrollPos;
          if (scrollPos >= activeContainer.scrollHeight - activeContainer.clientHeight) {
            if (scrollInterval.current) clearInterval(scrollInterval.current);
          }
        }
      }, 30);
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [currentSlide]);

  // Fallbacks if DB is empty or loading
  const displayCampaigns = campaigns.length > 0 ? campaigns : MOCK_CAMPAIGNS;
  const displayJobs = jobs.length > 0 ? jobs : MOCK_JOBS;
  const displayUpdates = campaignUpdates.length > 0 ? campaignUpdates : MOCK_UPDATES;
  const displayExpenses = campaignExpenses.length > 0 ? campaignExpenses : MOCK_EXPENSES;

  const activeCamp = selectedCampaign || {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'MARMITAS SOLIDÁRIAS FILIPE CAMARÃO',
    description: 'Campanha mensal para produção e distribuição de 300 refeições para famílias desabrigadas da região oeste de Natal.',
    category: 'Alimentação',
    city: 'Natal',
    neighborhood: 'Filipe Camarão',
    coverImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
    financialGoal: 5000,
    financialRaised: 3450,
    mainNeed: 'Arroz, feijão e carne para preparo',
  };

  const displayApps = applications.length > 0 ? applications : [
    {
      id: 'app-1',
      jobId: 'job-1',
      jobTitle: 'Facilitador de Oficinas de Leitura',
      institutionName: 'Instituto Água Viva',
      message: 'Gostaria muito de apoiar as crianças da comunidade com oficinas de leitura.',
      status: 'selected',
      submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    }
  ];

  const displayCerts = certificates.length > 0 ? certificates : [
    {
      id: 'cert-1',
      jobTitle: 'Auxiliar Administrativo de Doações',
      institutionName: 'Associação Água Viva',
      hoursDonated: 12,
      issuedAt: new Date().toISOString(),
      verificationCode: 'LUM-DEMO123',
    }
  ];

  return (
    <div 
      onClick={handleScreenClick}
      className="fixed inset-0 z-[9999] bg-[#fdfdfd] text-black select-none flex flex-col items-center justify-center py-6 px-4 font-sans cursor-pointer overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      {/* TEXT OVERLAY AREA */}
      <div className="text-center max-w-3xl mx-auto px-4 h-20 flex flex-col justify-center shrink-0">
        <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-black">
          {SLIDES[currentSlide].title}
        </h2>
        <p className="text-sm sm:text-base font-bold text-gray-500 mt-1.5">
          {SLIDES[currentSlide].subtitle}
        </p>
      </div>

      {/* MAIN CONTAINER: LARGE SLIDE VIEWPORT */}
      <div className="w-full max-w-6xl h-[80vh] bg-[#fdfdfd] border-4 border-black shadow-[12px_12px_0_0_#000] flex flex-col relative transition-all duration-300 overflow-hidden">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.type}
            ref={el => { slideContainers.current[index] = el; }}
            className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar transition-opacity duration-500 bg-[#fdfdfd]"
            style={{
              opacity: index === currentSlide ? 1 : 0,
              pointerEvents: index === currentSlide ? 'auto' : 'none',
              scrollBehavior: 'auto'
            }}
          >
            {/* STICKY NAVBAR AS REQUESTED */}
            {slide.type !== 'qrcode' && (
              <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-[#ffe17c] shadow-[0_4px_0_0_#000] shrink-0">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                  <div className="flex items-center gap-2">
                    <img src="/logo-provi.png" alt="PROVI" className="w-10 h-10 object-contain" />
                    <span className="font-display text-2xl font-black uppercase tracking-tighter">PROVI</span>
                  </div>
                  <nav className="hidden md:flex items-center gap-6 font-black uppercase text-xs tracking-wider">
                    <span className="hover:underline">Explorar</span>
                    <span className="hover:underline">Vagas</span>
                    <span className="hover:underline">Feed</span>
                    <span className="hover:underline">Painel</span>
                    <span className="hover:underline">Notificações</span>
                  </nav>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-black text-sm uppercase text-black leading-none">TESTE TESTE</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Voluntário</div>
                    </div>
                    <Button className="h-8 px-3 border-2 border-black bg-white hover:bg-black hover:text-white text-xs font-black uppercase shadow-brutalist-sm flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Perfil
                    </Button>
                    <Button className="h-8 w-8 p-0 border-2 border-black bg-white text-black hover:bg-black hover:text-white text-xs font-black shadow-brutalist-sm flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </header>
            )}

            {/* --- SLIDE 1: HOME PAGE CONTENT --- */}
            {slide.type === 'home' && (
              <div className="p-6 space-y-12">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-6">
                  <div className="space-y-6">
                    <Badge className="bg-black text-primary border-2 border-black font-black uppercase text-xs">🌟 Conectando Causas no RN</Badge>
                    <h3 className="font-display text-5xl sm:text-6xl font-black uppercase tracking-tighter leading-none text-black">
                      Eles lutam todos os dias. <br />
                      <span className="bg-primary px-2 inline-block -rotate-1 border-2 border-black mt-2">Você é a força.</span>
                    </h3>
                    <p className="text-gray-700 font-bold text-sm">
                      A PROVI conecta voluntários dispostos a ajudar e ONGs que prestam contas com transparência auditada por Inteligência Artificial no Rio Grande do Norte.
                    </p>
                  </div>
                  <div className="border-4 border-black p-4 bg-secondary shadow-brutalist rotate-2">
                    {/* Fixed to Local asset hero_community.png */}
                    <img src="/images/hero_community.png" alt="Voluntários" className="border-2 border-black object-cover w-full h-48 aspect-video" />
                    <div className="mt-4 flex justify-between font-black text-sm uppercase">
                      <span>Ação Viva — Natal, RN</span>
                      <Badge className="border-2 border-black bg-accent text-white">Ativa ✓</Badge>
                    </div>
                  </div>
                </div>

                {/* Stats Panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 border-4 border-black bg-white text-center shadow-brutalist">
                  <div className="border-r-2 md:border-r-4 border-black p-4 bg-[#ffe17c]"><div className="font-display text-3xl font-black">851+</div><div className="text-xs font-black uppercase text-black/70">Voluntários</div></div>
                  <div className="border-r-4 border-black p-4 bg-secondary"><div className="font-display text-3xl font-black">34+</div><div className="text-xs font-black uppercase text-black/70">ONGs Parceiras</div></div>
                  <div className="border-r-2 md:border-r-4 border-black p-4 bg-accent text-white"><div className="font-display text-3xl font-black">96+</div><div className="text-xs font-black uppercase text-white/70">Vagas Abertas</div></div>
                  <div className="p-4 bg-black text-white"><div className="font-display text-3xl font-black">2652+</div><div className="text-xs font-black uppercase text-white/70">Vidas Impactadas</div></div>
                </div>

                {/* Sliding Marquee */}
                <div className="bg-black text-[#ffe17c] py-3 border-4 border-black text-sm font-black uppercase flex items-center justify-around gap-8 overflow-hidden select-none">
                  <span>⚡ CAMPANHA EM DESTAQUE: Marmitas Solidárias Filipe Camarão</span>
                  <span>•</span>
                  <span>⚡ VAGAS QUALIFICADAS: Facilitador de Oficinas de Leitura</span>
                </div>

                {/* Featured Campaigns List */}
                <div className="space-y-6">
                  <h4 className="font-display text-2xl font-black uppercase text-black border-b-4 border-black pb-2">Campanhas em Destaque</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayCampaigns.map(camp => (
                      <div key={camp.id} className="border-4 border-black p-4 bg-white shadow-brutalist hover:-translate-y-1 transition-transform">
                        <div className="aspect-video relative overflow-hidden border-2 border-black">
                          <img src={camp.coverImage} alt={camp.title} className="object-cover w-full h-full" />
                          <Badge className="absolute top-2 right-2 border-2 border-black bg-primary text-black font-black uppercase text-xs">{camp.category}</Badge>
                        </div>
                        <h5 className="font-display text-xl font-black uppercase mt-3 leading-tight truncate">{camp.title}</h5>
                        <p className="text-xs text-gray-500 font-bold mt-1"><MapPin className="w-3.5 h-3.5 inline mr-1" /> {camp.city}, {camp.neighborhood}</p>
                        <div className="mt-4 w-full bg-gray-200 border-2 border-black h-3 overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${(camp.financialRaised / camp.financialGoal) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- SLIDE 2: EXPLORAR CAUSAS CONTENT (EXACTLY AS SCREENSHOT) --- */}
            {slide.type === 'explorer' && (
              <div className="p-6 space-y-8 bg-white text-black">
                <div className="space-y-4">
                  <Badge className="bg-[#ffe17c] text-black border border-black font-black uppercase text-xs rounded-none">Rio Grande do Norte</Badge>
                  <h3 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">Explore as Causas</h3>
                  <p className="text-sm font-bold text-gray-500 leading-relaxed max-w-2xl">
                    Encontre os projetos que mais tocam seu coração. Filtre por cidade, categoria ou busque por palavras-chave.
                  </p>
                  
                  {/* Search Bar matching screenshot */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6 border-4 border-black p-2 bg-white flex items-center gap-2">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input placeholder="Buscar campanhas, ONGs, causas..." className="w-full text-sm font-bold bg-transparent border-none outline-none" disabled />
                    </div>
                    <div className="md:col-span-3 border-4 border-black bg-white p-2 flex items-center justify-between text-sm font-bold">
                      <span>Todo o RN</span>
                      <span>▼</span>
                    </div>
                    <div className="md:col-span-3 border-4 border-black bg-white p-2 flex items-center justify-between text-sm font-bold">
                      <span>Todas as Categorias</span>
                      <span>▼</span>
                    </div>
                  </div>
                </div>

                {/* Card list layout matching screenshot exactly */}
                <div className="space-y-6">
                  {displayCampaigns.map(camp => (
                    <div key={camp.id} className="border-4 border-black p-6 bg-white shadow-brutalist flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-80 shrink-0 aspect-video relative overflow-hidden border-2 border-black">
                        <img src={camp.coverImage} alt={camp.title} className="object-cover w-full h-full" />
                        <span className="absolute top-2 left-2 border-2 border-black bg-[#ffe17c] text-black font-black uppercase text-[10px] px-2 py-0.5">
                          {camp.category}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="font-display text-2xl font-black uppercase leading-none">{camp.title}</h4>
                          <div className="font-display font-black text-xl text-black">
                            R$ {camp.financialGoal?.toLocaleString('pt-BR') || '0'}
                          </div>
                          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 flex-wrap mt-2">
                            <span className="flex items-center gap-1.5 font-bold">
                              <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Ativa
                            </span>
                            <Badge className="bg-gray-100 text-gray-500 border border-gray-300 font-bold uppercase text-[9px] px-2 py-0.5">
                              🤖 Classificado por IA (Seguro)
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 font-bold mt-2">
                            <MapPin className="w-3.5 h-3.5 inline mr-1" /> {camp.city}, {camp.neighborhood} | Hoje, 11:58
                          </p>
                        </div>
                        <div className="flex justify-end mt-4 md:mt-0">
                          <Button className="h-9 border-2 border-black bg-white hover:bg-black hover:text-white text-xs font-black uppercase shadow-brutalist-sm flex items-center gap-1.5 text-orange-600">
                            <MessageSquare className="w-4 h-4" /> Entrar na Causa
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- SLIDE 3: CAMPAIGN DETAIL (MATCHING SCREENSHOT) --- */}
            {slide.type === 'campaign_detail' && (
              <div className="p-6 space-y-8 bg-white text-black">
                {/* Header Tag and IA */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-[#ffe17c] text-black border-2 border-black font-black uppercase text-xs rounded-none">{activeCamp.category}</Badge>
                  <span className="text-xs font-black text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-600" /> Analisado por IA
                  </span>
                </div>

                {/* Campaign Title */}
                <h3 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-black">
                  {activeCamp.title}
                </h3>

                {/* Rating Likes and IA Thermometer bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-4 border-black p-3 bg-white flex items-center justify-around font-black text-sm shadow-brutalist-sm">
                    <span className="text-yellow-600">⭐ 4.8 <span className="text-[10px] text-gray-400 font-bold">(124 avaliações)</span></span>
                    <span className="text-red-500">❤️ 342 curtidas</span>
                  </div>

                  <div className="md:col-span-2 bg-green-50 border-4 border-green-500 p-3 shadow-brutalist-sm flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[9px] font-black text-green-800">
                        <span>TERMÔMETRO DE SEGURANÇA IA</span>
                        <span>Risco de Golpe: Muito Baixo (2%)</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1 border border-green-300">
                        <div className="bg-green-500 h-full w-[2%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-gray-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" /> {activeCamp.neighborhood}, {activeCamp.city} | Criada em 27/06/2026
                </div>

                {/* Main cover image */}
                <div className="border-4 border-black overflow-hidden aspect-video max-h-96 relative">
                  <img src={activeCamp.coverImage} alt={activeCamp.title} className="w-full h-full object-cover" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
                  {/* Left Column content */}
                  <div className="space-y-8">
                    {/* Nossa Luta */}
                    <div className="border-4 border-black p-6 bg-white shadow-brutalist">
                      <h4 className="font-display text-2xl font-black uppercase mb-4">Nossa Luta</h4>
                      <p className="text-sm font-bold text-gray-700 leading-relaxed">
                        {activeCamp.description}
                      </p>
                    </div>

                    {/* Vitrina Publica */}
                    <div className="space-y-4">
                      <h4 className="font-display text-2xl font-black uppercase border-b-4 border-black pb-1">Vitrine Pública</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border-4 border-black p-6 bg-white shadow-brutalist flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase">Progresso da Meta</span>
                            <div className="font-display text-3xl font-black text-black mt-2">
                              R$ {activeCamp.financialRaised?.toLocaleString('pt-BR') || '0'}
                            </div>
                            <span className="text-xs font-bold text-gray-400">de R$ {activeCamp.financialGoal?.toLocaleString('pt-BR') || '0'} arrecadados</span>
                          </div>
                          <div className="w-full bg-gray-200 border-2 border-black h-4 overflow-hidden mt-4">
                            <div className="bg-primary h-full" style={{ width: `${(activeCamp.financialRaised / activeCamp.financialGoal) * 100}%` }}></div>
                          </div>
                        </div>

                        <div className="border-4 border-black p-4 bg-white shadow-brutalist space-y-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Galeria</span>
                          <div className="aspect-video relative border-2 border-black overflow-hidden">
                            <img src={activeCamp.coverImage} alt="Galeria" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prestacao de contas */}
                    <div className="space-y-4">
                      <h4 className="font-display text-2xl font-black uppercase border-b-4 border-black pb-1">Prestação de Contas (Transparência)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Categories distribution list */}
                        <div className="border-4 border-black p-6 bg-white shadow-brutalist space-y-4">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Distribuição dos Gastos</span>
                          <div className="space-y-3">
                            <div className="text-xs font-bold flex justify-between"><span>Alimentação</span><span>R$ 450,00 (71%)</span></div>
                            <div className="w-full bg-gray-200 h-2 rounded"><div className="bg-secondary h-full" style={{ width: '71%' }}></div></div>
                            <div className="text-xs font-bold flex justify-between"><span>Logística</span><span>R$ 180,00 (29%)</span></div>
                            <div className="w-full bg-gray-200 h-2 rounded"><div className="bg-accent h-full" style={{ width: '29%' }}></div></div>
                          </div>
                        </div>

                        {/* Receipts grid */}
                        <div className="border-4 border-black p-6 bg-white shadow-brutalist space-y-4">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Comprovantes e Despesas</span>
                          <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                            {displayExpenses.map(exp => (
                              <div key={exp.id} className="p-3 border-2 border-black bg-gray-50 text-xs">
                                <div className="flex justify-between font-black">
                                  <span className="uppercase text-gray-500">{exp.category}</span>
                                  <span>R$ {exp.amount.toFixed(2)}</span>
                                </div>
                                <p className="text-[11px] font-bold text-gray-700 mt-1">{exp.description}</p>
                                <div className="mt-2 text-[9px] font-black text-green-600 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Nota Fiscal Validada
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Feed de atualizações */}
                    <div className="space-y-4">
                      <h4 className="font-display text-2xl font-black uppercase border-b-4 border-black pb-1">Feed de Atualizações</h4>
                      <div className="space-y-6">
                        {displayUpdates.map(up => (
                          <div key={up.id} className="border-4 border-black p-4 bg-white shadow-brutalist">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-display font-black text-sm">IA</div>
                              <div>
                                <div className="font-bold text-sm">Instituto Água Viva</div>
                                <span className="text-[10px] text-gray-400 font-bold">{up.date}</span>
                              </div>
                            </div>
                            <p className="text-xs font-semibold leading-relaxed mb-3">{up.content}</p>
                            {up.imageUrl && (
                              <img src={up.imageUrl} alt="Update" className="border-2 border-black w-full h-40 object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column content (Goal Card) */}
                  <div className="space-y-6">
                    <div className="border-4 border-black p-6 bg-white shadow-brutalist space-y-4">
                      <div className="flex justify-between font-black text-sm">
                        <span>Arrecadado</span>
                        <span className="text-green-600">R$ {activeCamp.financialRaised}</span>
                      </div>
                      <div className="w-full bg-gray-200 border-2 border-black h-4 overflow-hidden">
                        <div className="bg-secondary h-full" style={{ width: `${(activeCamp.financialRaised / activeCamp.financialGoal) * 100}%` }}></div>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase text-center">de meta de R$ {activeCamp.financialGoal}</div>
                      
                      <div className="border-2 border-dashed border-gray-200 p-3 bg-gray-50 rounded">
                        <span className="text-[10px] font-black text-gray-400 uppercase block">Necessidade Principal</span>
                        <p className="text-xs font-black uppercase text-black mt-1">{activeCamp.mainNeed}</p>
                      </div>

                      <Button className="w-full h-12 bg-black text-[#ffe17c] hover:bg-gray-800 border-2 border-black font-black uppercase shadow-brutalist text-sm">
                        ❤️ Doar na Vakinha
                      </Button>
                      <Button className="w-full h-10 bg-white text-black hover:bg-gray-50 border-2 border-black font-black uppercase shadow-brutalist-sm text-xs">
                        🔗 Multiplicar essa Causa
                      </Button>
                      <Button className="w-full h-10 bg-white text-black hover:bg-gray-50 border-2 border-black font-black uppercase shadow-brutalist-sm text-xs">
                        ◀ Voltar ao Painel
                      </Button>
                    </div>

                    {/* Organizador */}
                    <div className="border-4 border-black p-6 bg-white shadow-brutalist space-y-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase">Organizador / ONG</span>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-display font-black text-sm">IN</div>
                        <div>
                          <h5 className="font-display font-black text-base uppercase leading-none">Instituto Água Viva</h5>
                          <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Natal</span>
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-gray-500 leading-relaxed">
                        ONG voltada à preservação ambiental e acesso a recursos básicos.
                      </p>
                      <div className="pt-2 border-t border-gray-100 text-[10px] font-bold text-gray-400">
                        Contato Público: (84) 99888-1111
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- SLIDE 4: JOB POSTINGS CONTENT --- */}
            {slide.type === 'jobs' && (
              <div className="p-6 space-y-8 bg-white text-black">
                <div className="space-y-4">
                  <h3 className="font-display text-4xl font-black uppercase">Vagas de Voluntariado</h3>
                  <div className="flex gap-2">
                    <Badge className="bg-[#ffe17c] text-black border-2 border-black font-black text-xs uppercase rounded-none">Natal, RN</Badge>
                    <Badge className="bg-secondary text-black border-2 border-black font-black text-xs uppercase rounded-none">Presencial</Badge>
                  </div>
                </div>

                <div className="grid gap-6">
                  {displayJobs.map(job => (
                    <div key={job.id} className="border-4 border-black p-5 bg-white shadow-brutalist flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display text-xl font-black uppercase text-black">{job.title}</h4>
                          <Badge className="bg-[#ffe17c] text-black border-2 border-black text-xs font-black uppercase rounded-none">{job.category}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 font-bold max-w-2xl leading-relaxed">{job.description}</p>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                        <span className="text-[10px] font-black bg-black text-primary px-2 py-0.5 border border-black uppercase">{job.modality}</span>
                        <Button className="h-8 border-2 border-black bg-black text-white hover:bg-white hover:text-black font-black uppercase text-xs shadow-brutalist-sm">Candidatar-se</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- SLIDE 5: VOLUNTEER DASHBOARD (MATCHING CODE RENDER) --- */}
            {slide.type === 'dashboard' && (
              <div className="p-6 space-y-8 bg-white text-black">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Olá, TESTE TESTE</h3>
                    <p className="text-xs text-gray-500 font-black uppercase mt-1">Área do Voluntário — Veja seu impacto e candidaturas</p>
                  </div>
                  <Button className="border-4 border-black bg-[#ffe17c] font-black text-xs uppercase py-3 shadow-brutalist-sm">
                    🔍 Buscar Vagas
                  </Button>
                </div>

                {/* Stats cards for Volunteer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="border-4 border-black p-6 bg-primary shadow-brutalist flex items-center justify-between">
                    <div>
                      <p className="font-black text-xs uppercase text-gray-600">Candidaturas Realizadas</p>
                      <h2 className="font-display text-4xl font-black mt-2">{displayApps.length}</h2>
                    </div>
                    <FileText className="w-12 h-12 opacity-50 shrink-0" />
                  </div>

                  <div className="border-4 border-black p-6 bg-secondary shadow-brutalist flex items-center justify-between">
                    <div>
                      <p className="font-black text-xs uppercase text-gray-600">Status da Conta</p>
                      <h2 className="font-display text-3xl font-black mt-2">Ativo</h2>
                    </div>
                    <CheckCircle className="w-12 h-12 opacity-50 shrink-0" />
                  </div>

                  <div className="border-4 border-black p-6 bg-accent text-white shadow-brutalist flex items-center justify-between">
                    <div>
                      <p className="font-black text-xs uppercase text-white/70">Perfil Concluído</p>
                      <h2 className="font-display text-4xl font-black mt-2">100%</h2>
                    </div>
                    <User className="w-12 h-12 opacity-50 shrink-0" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                  {/* Left Column: Applications & Certificates */}
                  <div className="space-y-8">
                    {/* Applications */}
                    <div className="space-y-4">
                      <h4 className="font-display text-2xl font-black uppercase">Minhas Candidaturas</h4>
                      <div className="space-y-4">
                        {displayApps.map((app, index) => (
                          <div key={index} className="border-4 border-black bg-white p-6 shadow-brutalist flex flex-col sm:flex-row justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-display text-xl font-black uppercase">{app.jobTitle}</h5>
                                <Badge className="bg-[#ffe17c] text-black border border-black font-black uppercase text-[9px]">
                                  {app.status === 'selected' ? 'Selecionado' : 'Pendente'}
                                </Badge>
                              </div>
                              <p className="text-xs font-bold text-gray-500">Instituição: {app.institutionName}</p>
                              <p className="text-xs font-medium text-gray-400 mt-2">Sua mensagem: &quot;{app.message}&quot;</p>
                            </div>
                            <div className="flex flex-col items-start sm:items-end justify-between shrink-0">
                              <span className="text-[10px] font-bold text-gray-400">Enviada em {new Date(app.submittedAt).toLocaleDateString()}</span>
                              <Button className="h-7 px-3 border border-black bg-white hover:bg-black hover:text-white text-[10px] font-black uppercase mt-2">Ver Vaga</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certificates */}
                    <div className="space-y-4">
                      <h4 className="font-display text-2xl font-black uppercase">Meus Certificados de Horas</h4>
                      <div className="space-y-4">
                        {displayCerts.map((cert, index) => (
                          <div key={index} className="border-4 border-black bg-white p-6 shadow-brutalist flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <h5 className="font-display text-lg font-black uppercase">{cert.jobTitle}</h5>
                              <p className="text-xs font-bold text-gray-500">Emitido por: {cert.institutionName}</p>
                              <p className="text-xs font-black uppercase text-green-600 mt-1">✓ {cert.hoursDonated} horas homologadas</p>
                            </div>
                            <Button className="border-2 border-black font-black uppercase text-[10px] h-8 bg-black text-white hover:bg-white hover:text-black">
                              Visualizar Certificado
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Shortcuts */}
                  <div className="space-y-6">
                    <div className="border-4 border-black bg-white p-6 shadow-brutalist space-y-4">
                      <h4 className="font-display text-xl font-black uppercase flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Atalhos
                      </h4>
                      <div className="flex flex-col gap-3">
                        <Button className="w-full text-left justify-start font-black uppercase text-xs h-10 border border-black" variant="outline">🔍 Explorar Vagas</Button>
                        <Button className="w-full text-left justify-start font-black uppercase text-xs h-10 border border-black" variant="outline">📰 Feed de Notícias</Button>
                        <Button className="w-full text-left justify-start font-black uppercase text-xs h-10 border border-black" variant="outline">👤 Meu Perfil Público</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- SLIDE 6: QR CODE / CONCLUSION --- */}
            {slide.type === 'qrcode' && (
              <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 bg-white text-black">
                <div className="space-y-3">
                  <Badge className="bg-[#ffe17c] text-black border-2 border-black font-black uppercase text-xs rounded-none">Acesse Agora</Badge>
                  <h3 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">Experimente a Plataforma</h3>
                  <p className="text-sm font-bold text-gray-500 max-w-md mx-auto leading-relaxed">
                    Escaneie com a câmera do seu celular para testar a experiência real da PROVI em produção na Vercel!
                  </p>
                </div>
                
                <div className="border-8 border-black p-6 bg-white shadow-brutalist flex flex-col items-center rotate-1 hover:rotate-0 transition-transform duration-300">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://projeto-beneficente-five.vercel.app/" 
                    alt="QR Code PROVI" 
                    className="w-64 h-64 border-4 border-black object-contain"
                  />
                  <div className="font-display font-black text-lg uppercase mt-4 bg-[#ffe17c] px-4 py-1.5 border-2 border-black">
                    projeto-beneficente-five.vercel.app
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
