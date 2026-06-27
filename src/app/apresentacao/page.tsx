'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, Heart, ShieldCheck, Megaphone, Check, Search, 
  Filter, Award, User, LogOut, LayoutDashboard, Calendar, Share2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// --- DATA MOCKS ---
const MOCK_CAMPAIGNS = [
  {
    id: '1',
    title: 'Marmitas Solidárias Filipe Camarão',
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
    id: '2',
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
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800',
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
    subtitle: 'Painel completo do organizador com emissão ágil de certificados ESG.',
    type: 'dashboard',
  }
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Single ref holding array of slide viewport containers
  const slideContainers = useRef<(HTMLDivElement | null)[]>([]);

  // 1. Navigation Handlers
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

  // 2. Reset scroll and start smooth auto-scroll on slide change
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

  return (
    <div 
      onClick={handleScreenClick}
      className="fixed inset-0 z-[9999] bg-[#fdfdfd] text-black select-none flex flex-col items-center justify-center py-6 px-4 font-sans cursor-pointer overflow-hidden"
    >
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
      <div className="w-full max-w-6xl h-[80vh] bg-white border-4 border-black shadow-[12px_12px_0_0_#000] flex flex-col relative transition-all duration-300 overflow-hidden">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.type}
            ref={el => { slideContainers.current[index] = el; }}
            className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden transition-opacity duration-500 bg-[#fdfdfd]"
            style={{
              opacity: index === currentSlide ? 1 : 0,
              pointerEvents: index === currentSlide ? 'auto' : 'none',
              scrollBehavior: 'auto'
            }}
          >
            {/* STATIC NAV BAR INSIDE THE SLIDE VIEWPORT */}
            <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-primary shadow-[0_4px_0_0_#000] shrink-0">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <img src="/logo-provi.png" alt="PROVI" className="w-10 h-10 object-contain" />
                  <span className="font-display text-2xl font-black uppercase tracking-tighter">PROVI</span>
                </div>
                <nav className="hidden md:flex items-center gap-4 font-black uppercase text-sm">
                  <span className="hover:underline">Explorar</span>
                  <span className="hover:underline">Feed</span>
                  <span className="hover:underline">Vagas</span>
                </nav>
                <div className="flex items-center gap-3">
                  {slide.type === 'dashboard' ? (
                    <div className="flex items-center gap-2 border-2 border-black bg-secondary p-1 font-bold text-xs uppercase shadow-brutalist-sm">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>teste@gmail.com</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button className="h-8 border-2 border-black bg-white hover:bg-black hover:text-white text-xs font-black uppercase shadow-brutalist-sm">Entrar</Button>
                      <Button className="h-8 border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-black uppercase shadow-brutalist-sm">Cadastrar</Button>
                    </div>
                  )}
                </div>
              </div>
            </header>

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
                    <img src="https://images.unsplash.com/photo-1559027615-cd937c9be33a?auto=format&fit=crop&q=80&w=800" alt="Voluntários" className="border-2 border-black object-cover w-full h-48 aspect-video" />
                    <div className="mt-4 flex justify-between font-black text-sm uppercase">
                      <span>Ação Viva — Natal, RN</span>
                      <Badge className="border-2 border-black bg-accent text-white">Ativa ✓</Badge>
                    </div>
                  </div>
                </div>

                {/* Stats Panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 border-4 border-black bg-white text-center shadow-brutalist">
                  <div className="border-r-2 md:border-r-4 border-black p-4 bg-primary"><div className="font-display text-3xl font-black">851+</div><div className="text-xs font-black uppercase text-black/70">Voluntários</div></div>
                  <div className="border-r-4 border-black p-4 bg-secondary"><div className="font-display text-3xl font-black">34+</div><div className="text-xs font-black uppercase text-black/70">ONGs Parceiras</div></div>
                  <div className="border-r-2 md:border-r-4 border-black p-4 bg-accent text-white"><div className="font-display text-3xl font-black">96+</div><div className="text-xs font-black uppercase text-white/70">Vagas Abertas</div></div>
                  <div className="p-4 bg-black text-white"><div className="font-display text-3xl font-black">2652+</div><div className="text-xs font-black uppercase text-white/70">Vidas Impactadas</div></div>
                </div>

                {/* Sliding Marquee */}
                <div className="bg-black text-primary py-3 border-4 border-black text-sm font-black uppercase flex items-center justify-around gap-8 overflow-hidden select-none">
                  <span>⚡ CAMPANHA EM DESTAQUE: Refeitório Comunitário e Sopão do Seridó</span>
                  <span>•</span>
                  <span>⚡ VAGAS QUALIFICADAS: Facilitador de Oficinas de Leitura</span>
                </div>

                {/* Featured Campaigns List */}
                <div className="space-y-6">
                  <h4 className="font-display text-2xl font-black uppercase text-black border-b-4 border-black pb-2">Campanhas em Destaque</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_CAMPAIGNS.map(camp => (
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

            {/* --- SLIDE 2: EXPLORER PAGE CONTENT --- */}
            {slide.type === 'explorer' && (
              <div className="p-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-display text-4xl font-black uppercase">Explorar Campanhas</h3>
                  <div className="flex gap-3">
                    <div className="flex-1 border-4 border-black p-2 flex items-center gap-2 bg-white">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input placeholder="Buscar campanhas ou cidades..." className="w-full text-sm font-bold bg-transparent border-none outline-none" disabled />
                    </div>
                    <Button className="border-4 border-black bg-primary p-3 shadow-brutalist-sm"><Filter className="w-5 h-5" /></Button>
                  </div>
                </div>

                {/* Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {MOCK_CAMPAIGNS.map(camp => (
                    <div key={camp.id} className="border-4 border-black p-4 bg-white shadow-brutalist">
                      <div className="aspect-video relative overflow-hidden border-2 border-black">
                        <img src={camp.coverImage} alt={camp.title} className="object-cover w-full h-full" />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <Badge className="border-2 border-black bg-black text-white font-black uppercase text-[10px]">🤖 Classificado por IA (Seguro)</Badge>
                          <Badge className="border-2 border-black bg-primary text-black font-black uppercase text-[10px]">{camp.category}</Badge>
                        </div>
                      </div>
                      <h4 className="font-display text-xl font-black uppercase mt-3 leading-tight">{camp.title}</h4>
                      <p className="text-xs text-gray-500 font-bold mt-1"><MapPin className="w-3.5 h-3.5 inline mr-1" /> {camp.city}, {camp.neighborhood}</p>
                      
                      <div className="mt-4 flex items-center justify-between text-xs font-black uppercase">
                        <span>Progresso</span>
                        <span>R$ {camp.financialRaised} / R$ {camp.financialGoal}</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 border-2 border-black h-3 overflow-hidden">
                        <div className="bg-primary h-full border-r-2 border-black" style={{ width: `${(camp.financialRaised / camp.financialGoal) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- SLIDE 3: CAMPAIGN DETAIL CONTENT --- */}
            {slide.type === 'campaign_detail' && (
              <div className="p-6 space-y-8">
                {/* Header details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-primary text-black border-2 border-black font-black uppercase text-xs">Alimentação</Badge>
                      <span className="text-xs font-bold text-gray-500"><MapPin className="w-3.5 h-3.5 inline mr-1" /> Caicó — Centro</span>
                      <span className="text-xs font-black text-yellow-600 bg-yellow-50 px-2 py-0.5 border border-yellow-200 rounded">⭐ 4.8 (124 avaliações)</span>
                      <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 border border-red-200 rounded">❤️ 342 curtidas</span>
                    </div>
                    <h3 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-black">
                      Refeitório Comunitário e Sopão do Seridó
                    </h3>
                  </div>

                  {/* AI Safety Thermometer Widget */}
                  <div className="bg-green-50 border-4 border-green-500 p-4 shadow-brutalist flex items-center gap-3">
                    <ShieldCheck className="w-10 h-10 text-green-600 shrink-0" />
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-black text-green-800">
                        <span>TERMÔMETRO DE SEGURANÇA IA</span>
                        <span>Muito Seguro (2% Risco)</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1 border border-green-300">
                        <div className="bg-green-500 h-full w-[2%]"></div>
                      </div>
                      <p className="text-[10px] text-green-700 font-bold mt-1.5">
                        Insumos validados localmente. Notas fiscais auditadas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Side: About, Updates Timeline */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-3">
                      <h4 className="font-display text-xl font-black uppercase border-b-4 border-black pb-1">Sobre a Campanha</h4>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed">
                        Nossa campanha visa manter o refeitório comunitário em funcionamento por mais 3 meses, garantindo refeições diárias e sopão para centenas de moradores locais do Seridó.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <h4 className="font-display text-xl font-black uppercase border-b-4 border-black pb-1">Atualizações de Progresso</h4>
                      <div className="space-y-6">
                        {MOCK_UPDATES.map(up => (
                          <div key={up.id} className="border-4 border-black p-4 bg-white shadow-brutalist">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-display font-black text-sm">IA</div>
                              <div>
                                <div className="font-bold text-sm">Instituto Água Viva</div>
                                <span className="text-[10px] text-gray-400 font-bold">{up.date}</span>
                              </div>
                            </div>
                            <p className="text-xs font-semibold leading-relaxed mb-3">{up.content}</p>
                            <img src={up.imageUrl} alt="Update" className="border-2 border-black w-full h-40 object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Accountability ledger, Goal Progress */}
                  <div className="space-y-6">
                    <div className="border-4 border-black p-4 bg-white shadow-brutalist">
                      <h4 className="font-display text-base font-black uppercase mb-3">Progresso de Arrecadação</h4>
                      <div className="flex justify-between font-black text-sm">
                        <span>Meta Atingida</span>
                        <span className="text-green-600">R$ 3.000 / R$ 3.000</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 border-2 border-black h-4 overflow-hidden">
                        <div className="bg-green-500 h-full w-full"></div>
                      </div>
                    </div>

                    <div className="border-4 border-black p-4 bg-white shadow-brutalist space-y-4">
                      <h4 className="font-display text-base font-black uppercase border-b-2 border-black pb-1">Comprovantes de Despesa</h4>
                      <div className="space-y-3">
                        {MOCK_EXPENSES.map(exp => (
                          <div key={exp.id} className="p-3 border-2 border-black bg-gray-50 text-xs">
                            <div className="flex justify-between font-black">
                              <span className="uppercase text-gray-500">{exp.category}</span>
                              <span>R$ {exp.amount.toFixed(2)}</span>
                            </div>
                            <p className="text-[11px] font-bold text-gray-700 mt-1">{exp.description}</p>
                            <div className="mt-2 text-[9px] font-black text-green-600 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Nota Fiscal Validada por IA
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- SLIDE 4: JOB POSTINGS CONTENT --- */}
            {slide.type === 'jobs' && (
              <div className="p-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-display text-4xl font-black uppercase">Vagas de Voluntariado</h3>
                  <div className="flex gap-2">
                    <Badge className="bg-primary text-black border-2 border-black font-black text-xs uppercase">Natal, RN</Badge>
                    <Badge className="bg-secondary text-black border-2 border-black font-black text-xs uppercase">Presencial</Badge>
                  </div>
                </div>

                <div className="grid gap-6">
                  {MOCK_JOBS.map(job => (
                    <div key={job.id} className="border-4 border-black p-5 bg-white shadow-brutalist flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display text-xl font-black uppercase text-black">{job.title}</h4>
                          <Badge className="bg-primary text-black border-2 border-black text-xs font-black uppercase">{job.category}</Badge>
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

            {/* --- SLIDE 5: ORGANIZER DASHBOARD --- */}
            {slide.type === 'dashboard' && (
              <div className="p-6 space-y-8">
                <div className="flex items-center justify-between border-b-4 border-black pb-3">
                  <div>
                    <h3 className="font-display text-2xl font-black uppercase">Painel do Organizador</h3>
                    <p className="text-xs text-gray-400 font-black uppercase mt-0.5">Instituto Água Viva</p>
                  </div>
                  <Badge className="bg-secondary text-black border-2 border-black font-black text-xs uppercase">Gestão Ativa</Badge>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-4 border-black p-4 bg-primary/20 shadow-brutalist-sm">
                    <div className="text-[10px] font-black text-gray-500 uppercase">Total Arrecadado</div>
                    <div className="font-display text-2xl font-black text-black mt-1">R$ 6.450,00</div>
                  </div>
                  <div className="border-4 border-black p-4 bg-secondary/20 shadow-brutalist-sm">
                    <div className="text-[10px] font-black text-gray-500 uppercase">Candidaturas</div>
                    <div className="font-display text-2xl font-black text-black mt-1">12 Candidatos</div>
                  </div>
                  <div className="border-4 border-black p-4 bg-accent/20 shadow-brutalist-sm">
                    <div className="text-[10px] font-black text-gray-500 uppercase">Certificados Selo ESG</div>
                    <div className="font-display text-2xl font-black text-black mt-1">4 Emitidos</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left component: Issue Certificates */}
                  <div className="border-4 border-black p-4 bg-white shadow-brutalist space-y-4">
                    <h4 className="font-display text-sm font-black uppercase border-b-2 border-black pb-1 text-gray-500">Candidatos Aprovados (Emissão de Certificado)</h4>
                    <div className="p-3 border-2 border-black bg-gray-50 flex items-center justify-between">
                      <div>
                        <div className="font-black text-sm uppercase">Ana Beatriz</div>
                        <span className="text-[10px] text-gray-500 font-bold">Facilitadora de Oficinas — 4 Horas</span>
                      </div>
                      <Button className="h-8 border-2 border-green-700 bg-green-500 text-white font-black text-xs uppercase hover:bg-green-600 shadow-brutalist-sm flex items-center gap-1">
                        <Award className="w-4 h-4" /> Emitir Selo ESG
                      </Button>
                    </div>
                  </div>

                  {/* Right component: Budget / Expense ledger launcher */}
                  <div className="border-4 border-black p-4 bg-white shadow-brutalist space-y-4">
                    <h4 className="font-display text-sm font-black uppercase border-b-2 border-black pb-1 text-gray-500">Lançar Nova Despesa (Prestação de Contas)</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Valor da Despesa (R$)</label>
                        <input value="320.00" className="w-full border-2 border-black h-8 text-xs px-2 font-bold bg-white" disabled />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Descrição</label>
                        <input value="Compra de gás de cozinha e copos descartáveis" className="w-full border-2 border-black h-8 text-xs px-2 font-bold bg-white" disabled />
                      </div>
                      <Button className="w-full h-8 border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-black uppercase shadow-brutalist-sm">Enviar Notas e Lançar</Button>
                    </div>
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
