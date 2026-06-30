'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, Heart, ShieldCheck, Megaphone, Check, Search, 
  Filter, Award, User, LogOut, LayoutDashboard, Calendar, Share2,
  FileText, CheckCircle, Sparkles, MessageSquare, AlertCircle, ArrowLeft,
  Clock, Bookmark, ChevronRight, ChevronLeft
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
import { PrintButton } from '@/components/print-button';

const MOCK_CAMPAIGNS = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'MARMITAS SOLIDÁRIAS FILIPE CAMARÃO',
    category: 'Alimentação',
    city: 'Natal',
    neighborhood: 'Filipe Camarão',
    coverImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
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
    coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
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
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    likes: 24,
    shares: 5,
    date: 'Hoje'
  },
  {
    id: 'u2',
    content: '❤️ Meta de arrecadação financeira atingida em 100%! Estamos imensamente gratos a cada doador que tornou isso possível. Com esse valor de R$ 3.000,00 garantiremos a manutenção do refeitório social e o sopão por mais 3 meses.',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
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
    type: 'home',
    title: 'PROVI',
    subtitle: 'Conexão Cidadã e Transparência Radical',
    description: 'O canal definitivo de comunicação e auditoria que une Instituições, Governo, Voluntários e Doadores em um único ecossistema transparente no Rio Grande do Norte.',
    highlights: [
      'Conexão direta de ponta a ponta',
      'Auditoria de conformidade e segurança com IA',
      'Certificados de impacto rastreáveis para ESG'
    ]
  },
  {
    type: 'explorer',
    title: 'Vitrine de Impacto',
    subtitle: 'Conexão Segura e Descentralizada',
    description: 'Campanhas e projetos verificados e auditados em tempo real. Nossa IA classifica o risco de cada causa, gerando segurança absoluta para doações e voluntariado.',
    highlights: [
      'Busca inteligente de causas no RN',
      'Categorização automática por tema',
      'Selo de Verificação de Segurança IA contra golpes'
    ]
  },
  {
    type: 'campaign_detail',
    title: 'Transparência Radical',
    subtitle: 'Rastreabilidade Total de Recursos',
    description: 'Doar sem sombra de dúvidas. Prestação de contas integrada que rastreia cada centavo de despesa, com upload de notas fiscais auditadas pelo painel de transparência.',
    highlights: [
      'Termômetro de Risco IA (Anti-Fraude)',
      'Notas fiscais validadas pelo Governo',
      'Histórico aberto de receitas e despesas'
    ]
  },
  {
    type: 'jobs',
    title: 'Cidadania Ativa',
    subtitle: 'Força de Trabalho para ONGs',
    description: 'Banco de vagas de voluntariado que supre as demandas reais das instituições sociais. Facilidade para se candidatar em projetos presenciais ou remotos.',
    highlights: [
      'Alinhamento com competências individuais',
      'Apoio direto às necessidades operacionais das ONGs',
      'Triagem automatizada de perfis sociais'
    ]
  },
  {
    type: 'dashboard',
    title: 'Certificação ESG',
    subtitle: 'Validação de Horas de Impacto',
    description: 'Unimos voluntários a empresas e universidades. Homologação digital e emissão de certificados A4 rastreáveis com código de autenticidade criptográfica.',
    highlights: [
      'Controle integrado de horas de impacto',
      'Visualização e download do certificado de forma oficial',
      'Validação pública via código no portal'
    ]
  },
  {
    type: 'qrcode',
    title: 'Invista no Futuro',
    subtitle: 'Conecte-se Agora Mesmo',
    description: 'A plataforma está pronta, online e operando em produção. Escaneie o QR Code e teste a experiência em tempo real no seu dispositivo móvel.',
    highlights: [
      'Acesso imediato via celular',
      'Pronto para parcerias governamentais e empresariais',
      'Tecnologia de ponta e alto impacto socioeconômico'
    ]
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
  
  const scrollIntervals = useRef<(NodeJS.Timeout | null)[]>([]);
  const slideElements = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainers = useRef<(HTMLDivElement | null)[]>([]);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // 1. Programmatic Login and DB Fetching in Background
  useEffect(() => {
    const loadRealData = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: 'teste@gmail.com',
            password: '12345678',
          });

          if (!error && data.user) {
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

              const apps = await getApplicationsForVolunteer(profile.id);
              setApplications(apps);

              const certs = await getVolunteerCertificates(profile.id);
              setCertificates(certs);
            }
          }
        }

        const dbCampaigns = await getCampaigns();
        setCampaigns(dbCampaigns);

        const dbJobs = await getJobs();
        setJobs(dbJobs);

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
        setIsLoaded(true);
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

  // Scroll active slide into view smoothly
  useEffect(() => {
    const targetSlideEl = slideElements.current[currentSlide];
    if (targetSlideEl) {
      targetSlideEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Reset all scroll heights of browser previews
    scrollContainers.current.forEach((container, index) => {
      if (index !== currentSlide && container) {
        container.scrollTop = 0;
      }
    });

    // Clear old scrolling intervals
    scrollIntervals.current.forEach(interval => {
      if (interval) clearInterval(interval);
    });

    const activeContainer = scrollContainers.current[currentSlide];
    if (!activeContainer) return;

    // Start a cinematic auto-scroll inside the browser preview of the current slide
    const timer = setTimeout(() => {
      let scrollPos = 0;
      scrollIntervals.current[currentSlide] = setInterval(() => {
        scrollPos += 1;
        if (activeContainer) {
          activeContainer.scrollTop = scrollPos;
          if (scrollPos >= activeContainer.scrollHeight - activeContainer.clientHeight) {
            if (scrollIntervals.current[currentSlide]) clearInterval(scrollIntervals.current[currentSlide]!);
          }
        }
      }, 30);
    }, 2500);

    return () => {
      clearTimeout(timer);
      scrollIntervals.current.forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, [currentSlide]);

  // Fallbacks
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
      className="fixed inset-0 z-[9999] bg-[#fdfdfd] text-black select-none font-sans cursor-pointer overflow-hidden flex flex-col"
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

      {/* Main scrolling wrapper */}
      <div 
        ref={mainContainerRef}
        className="flex-1 overflow-hidden no-scrollbar scroll-smooth"
      >
        {SLIDES.map((slide, index) => (
          <div
            key={slide.type}
            ref={el => { slideElements.current[index] = el; }}
            className="w-full h-screen flex flex-col md:flex-row shrink-0 border-b-8 border-black relative"
            style={{ backgroundColor: slide.type === 'home' ? '#ffe17c' : '#fdfdfd' }}
          >
            {/* LEFT PANEL: PITCH SCRIPTS AND VALUE PROPOSITION */}
            <div className="w-full md:w-[32%] h-[38vh] md:h-full p-4 md:px-8 md:py-14 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-black bg-[#ffe17c]/15 text-black select-text shrink-0 z-10">
              <div className="space-y-2 md:space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-sm md:text-lg tracking-widest text-black">
                    PROVI PITCH
                  </span>
                  <Badge className="bg-black text-[#ffe17c] border border-black font-black uppercase text-[9px] md:text-[10px] rounded-none px-2 py-0.5">
                    {String(index + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
                  </Badge>
                </div>

                <div className="hidden md:block h-[2px] w-full bg-black/10" />

                <div className="space-y-1 md:space-y-3">
                  <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-none text-black">
                    {slide.title}
                  </h2>
                  <p className="text-xs md:text-base font-black text-gray-500 uppercase tracking-wide">
                    {slide.subtitle}
                  </p>
                </div>

                <p className="text-xs md:text-sm font-bold text-gray-700 leading-relaxed line-clamp-2 md:line-clamp-none">
                  {slide.description}
                </p>

                <div className="hidden md:block space-y-2 pt-4">
                  {slide.highlights.map((highlight, hIndex) => (
                    <div key={hIndex} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-none bg-black text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-xs font-black uppercase text-black">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation tip */}
              <div className="flex items-center justify-between text-[9px] md:text-[11px] font-black uppercase text-gray-400">
                <span className="hidden md:inline">Clique na esquerda para voltar</span>
                <span className="md:hidden">Toque na esquerda para voltar</span>
                <ChevronRight className="w-4 h-4 text-black animate-pulse shrink-0" />
                <span className="hidden md:inline">Clique na direita para avançar</span>
                <span className="md:hidden">Toque na direita para avançar</span>
              </div>
            </div>

            {/* RIGHT PANEL: BROWSER CHROME WORKINGS */}
            <div className="flex-1 h-[62vh] md:h-full p-4 md:p-8 bg-[#fafafa] flex items-center justify-center relative overflow-hidden">
              <div className="w-full md:w-[95%] h-full md:h-[90%] border-4 border-black shadow-[6px_6px_0_0_#000] md:shadow-[12px_12px_0_0_#000] bg-white rounded-none flex flex-col overflow-hidden relative">
                
                {/* Browser chrome header bar */}
                <div className="h-8 md:h-10 bg-gray-100 border-b-4 border-black px-2 md:px-4 flex items-center justify-between shrink-0 select-none">
                  <div className="flex gap-2">
                    <span className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-red-400 border border-black/20" />
                    <span className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-yellow-400 border border-black/20" />
                    <span className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-green-400 border border-black/20" />
                  </div>
                  <div className="w-48 md:w-96 h-5 md:h-6 border-2 border-black bg-white rounded-none px-2 flex items-center text-[9px] md:text-[10px] font-bold text-gray-400 overflow-hidden truncate">
                    🔒 provi.org/{slide.type !== 'home' ? slide.type : ''}
                  </div>
                  <div className="flex gap-1">
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Sub-container containing the actual platform rendering */}
                <div 
                  ref={el => { scrollContainers.current[index] = el; }}
                  className="flex-1 overflow-y-auto no-scrollbar relative"
                  style={{ backgroundColor: slide.type === 'home' ? '#ffe17c' : '#ffffff' }}
                >
                  
                  {/* APP NAVBAR (PRE-RENDERED IN PREVIEWS) */}
                  {slide.type !== 'home' && slide.type !== 'qrcode' && (
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
                        </div>
                      </div>
                    </header>
                  )}

                  {/* 1. HOME PREVIEW */}
                  {slide.type === 'home' && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-6">
                      <img 
                        src="/logo-provi.png" 
                        alt="PROVI Logo" 
                        className="w-40 h-40 object-contain animate-bounce"
                      />
                      <h1 className="font-display text-7xl font-black uppercase tracking-tighter text-black leading-none">
                        PROVI
                      </h1>
                      <div className="border-4 border-black bg-white p-3 font-display font-black text-sm uppercase tracking-widest shadow-brutalist">
                        CONEXÃO, TRANSPARÊNCIA E CRÉDITO SOCIAL
                      </div>
                    </div>
                  )}

                  {/* 2. EXPLORER PREVIEW */}
                  {slide.type === 'explorer' && (
                    <div className="p-6 space-y-8 bg-white text-black">
                      <div className="space-y-4">
                        <Badge className="bg-[#ffe17c] text-black border border-black font-black uppercase text-xs rounded-none">Rio Grande do Norte</Badge>
                        <h3 className="font-display text-4xl font-black uppercase tracking-tight">Explore as Causas</h3>
                        
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
                                  <Badge className="bg-green-50 text-green-700 border border-green-300 font-bold uppercase text-[9px] px-2 py-0.5">
                                    🤖 Classificado por IA (Seguro)
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-400 font-bold mt-2">
                                  <MapPin className="w-3.5 h-3.5 inline mr-1" /> {camp.city}, {camp.neighborhood}
                                </p>
                              </div>
                              <div className="flex justify-end mt-4">
                                <Button className="h-8 border-2 border-black bg-white hover:bg-black hover:text-white text-[10px] font-black uppercase shadow-brutalist-sm">
                                  Ver Detalhes
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. CAMPAIGN ACCOUNTABILITY PREVIEW */}
                  {slide.type === 'campaign_detail' && (
                    <div className="p-6 space-y-8 bg-white text-black">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-[#ffe17c] text-black border-2 border-black font-black uppercase text-xs rounded-none">{activeCamp.category}</Badge>
                        <span className="text-xs font-black text-gray-400 flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-green-600" /> Analisado por IA
                        </span>
                      </div>

                      <h3 className="font-display text-3xl font-black uppercase tracking-tight leading-none text-black">
                        {activeCamp.title}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border-4 border-black p-3 bg-white flex items-center justify-around font-black text-xs shadow-brutalist-sm">
                          <span className="text-yellow-600">⭐ 4.8 <span className="text-[9px] text-gray-400 font-bold">(124 avaliações)</span></span>
                          <span className="text-red-500">❤️ 342 curtidas</span>
                        </div>

                        <div className="md:col-span-2 bg-green-50 border-4 border-green-500 p-3 shadow-brutalist-sm flex items-center gap-3">
                          <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-[9px] font-black text-green-800">
                              <span>TERMÔMETRO DE SEGURANÇA IA</span>
                              <span>Risco de Golpe: Muito Baixo (2%)</span>
                            </div>
                            <div className="w-full bg-gray-200 h-1.5 mt-1 border border-green-300">
                              <div className="bg-green-500 h-full w-[2%]"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                        <div className="space-y-6">
                          <div className="border-4 border-black p-4 bg-white shadow-brutalist">
                            <h4 className="font-display text-xl font-black uppercase mb-2">Finalidade dos Insumos</h4>
                            <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                              {activeCamp.description}
                            </p>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-display text-xl font-black uppercase border-b-2 border-black pb-1">Despesas em Tempo Real</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="border-4 border-black p-4 bg-white shadow-brutalist space-y-4">
                                <span className="text-[9px] font-black text-gray-400 uppercase">Gastos por Categoria</span>
                                <div className="space-y-2">
                                  <div className="text-[10px] font-bold flex justify-between"><span>Alimentação</span><span>R$ 450,00</span></div>
                                  <div className="w-full bg-gray-200 h-1.5"><div className="bg-secondary h-full" style={{ width: '71%' }}></div></div>
                                  <div className="text-[10px] font-bold flex justify-between"><span>Logística</span><span>R$ 180,00</span></div>
                                  <div className="w-full bg-gray-200 h-1.5"><div className="bg-accent h-full" style={{ width: '29%' }}></div></div>
                                </div>
                              </div>

                              <div className="border-4 border-black p-4 bg-white shadow-brutalist space-y-4">
                                <span className="text-[9px] font-black text-gray-400 uppercase">Comprovantes e Notas Fiscais</span>
                                <div className="space-y-2">
                                  {displayExpenses.map(exp => (
                                    <div key={exp.id} className="p-2 border border-black bg-gray-50 text-[10px]">
                                      <div className="flex justify-between font-black">
                                        <span className="uppercase text-gray-500">{exp.category}</span>
                                        <span>R$ {exp.amount.toFixed(2)}</span>
                                      </div>
                                      <p className="text-[9px] font-bold text-gray-700 mt-1">{exp.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="border-4 border-black p-4 bg-white shadow-brutalist space-y-3">
                            <span className="text-[9px] font-black text-gray-400 uppercase">Prestador de Contas</span>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-display font-black text-xs">IN</div>
                              <div>
                                <h5 className="font-display font-black text-sm uppercase leading-none">Instituto Água Viva</h5>
                                <span className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Caicó</span>
                              </div>
                            </div>
                            <Button className="w-full h-8 bg-black text-[#ffe17c] hover:bg-gray-800 border border-black font-black uppercase text-[10px]">
                              Realizar Doação
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. VOLUNTEER JOBS PREVIEW */}
                  {slide.type === 'jobs' && (
                    <div className="p-6 space-y-6 bg-white text-black">
                      <h3 className="font-display text-3xl font-black uppercase">Vagas de Voluntariado</h3>
                      <div className="grid gap-4">
                        {displayJobs.map(job => (
                          <div key={job.id} className="border-4 border-black p-4 bg-white shadow-brutalist flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-display text-lg font-black uppercase text-black">{job.title}</h4>
                                <Badge className="bg-[#ffe17c] text-black border border-black text-[10px] font-black uppercase rounded-none">{job.category}</Badge>
                              </div>
                              <p className="text-[11px] text-gray-600 font-bold max-w-2xl">{job.description}</p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              <span className="text-[9px] font-black bg-black text-primary px-2 py-0.5 uppercase">{job.modality}</span>
                              <Button className="h-8 border border-black bg-white hover:bg-black hover:text-white font-black uppercase text-[10px]">Candidatar-se</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. VOLUNTEER CERTIFICATES DASHBOARD */}
                  {slide.type === 'dashboard' && (
                    <div className="p-6 space-y-6 bg-white text-black">
                      <div>
                        <h3 className="font-display text-3xl font-black uppercase leading-none">Área do Voluntário</h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase mt-1">TESTE TESTE | Conquistas e Certificações ESG</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-4 border-black p-4 bg-[#ffe17c]/20 shadow-brutalist flex items-center justify-between">
                          <div>
                            <p className="font-black text-[9px] uppercase text-gray-600">Candidaturas Ativas</p>
                            <h2 className="font-display text-3xl font-black mt-1">{displayApps.length}</h2>
                          </div>
                          <FileText className="w-8 h-8 opacity-50" />
                        </div>

                        <div className="border-4 border-black p-4 bg-accent/20 shadow-brutalist flex items-center justify-between">
                          <div>
                            <p className="font-black text-[9px] uppercase text-gray-600">Horas Homologadas</p>
                            <h2 className="font-display text-3xl font-black mt-1">12h</h2>
                          </div>
                          <Award className="w-8 h-8 opacity-50" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-display text-xl font-black uppercase border-b-2 border-black pb-1">Certificado em Acesso Rápido</h4>
                        
                        {/* Premium A4 layout card rendered dynamically */}
                        <div className="border-4 border-black p-4 bg-white relative overflow-hidden shadow-brutalist flex flex-col items-center justify-center">
                          <div className="border-2 border-dashed border-gray-300 p-6 text-center w-full max-w-xl space-y-4 flex flex-col items-center">
                            <Award className="w-10 h-10 text-yellow-500 stroke-[2]" />
                            <h5 className="font-display text-xl font-black uppercase text-black leading-none">
                              Certificado de Impacto Social
                            </h5>
                            <p className="text-[11px] text-gray-600 font-semibold leading-relaxed max-w-sm">
                              Certificamos que o voluntário <strong>Ana Beatriz</strong> concluiu 12 horas voluntárias na causa de <strong>Desenvolvedora Voluntária</strong>.
                            </p>
                            
                            {/* Standard print button component inline */}
                            <PrintButton size="sm" className="font-black uppercase border-2 border-black bg-black text-white hover:bg-white hover:text-black text-[10px] h-8 shadow-brutalist-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. QR CODE CONCLUSION PREVIEW */}
                  {slide.type === 'qrcode' && (
                    <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 bg-white text-black">
                      <div className="space-y-2">
                        <Badge className="bg-[#ffe17c] text-black border border-black font-black uppercase text-xs rounded-none">Acesse Agora</Badge>
                        <h3 className="font-display text-3xl font-black uppercase tracking-tight leading-none">Experimente a PROVI</h3>
                      </div>
                      
                      <div className="border-4 border-black p-4 bg-white shadow-brutalist flex flex-col items-center">
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://projeto-beneficente-five.vercel.app/" 
                          alt="QR Code PROVI" 
                          className="w-40 h-40 border-2 border-black object-contain"
                        />
                        <div className="font-display font-black text-xs uppercase mt-3 bg-[#ffe17c] px-3 py-1 border border-black">
                          projeto-beneficente-five.vercel.app
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
