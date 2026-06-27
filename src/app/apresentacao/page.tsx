'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { saveStoredProfile } from '@/lib/auth';
import { getProfile } from '@/actions/platform';

const SLIDES = [
  {
    title: 'Portal de Conexão PROVI',
    subtitle: 'Uma vitrine viva e dinâmica para impulsionar o engajamento social no RN.',
    url: '/',
  },
  {
    title: 'Explorar Causas Verificadas',
    subtitle: 'Filtragem simplificada e identificação de campanhas seguras classificadas por IA.',
    url: '/campaigns',
  },
  {
    title: 'Prestação de Contas em Tempo Real',
    subtitle: 'Transparência financeira de despesas e notas fiscais com termômetro IA.',
    url: '/campaigns/10000000-0000-0000-0000-000000000002',
  },
  {
    title: 'Vagas de Voluntariado Qualificadas',
    subtitle: 'Engajamento direto e flexível com organizações locais estilo Atados.',
    url: '/vagas',
  },
  {
    title: 'Gestão e Certificação de Impacto',
    subtitle: 'Painel completo do organizador com emissão ágil de certificados ESG.',
    url: '/dashboard',
  }
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  // Single ref holding array of iframe elements
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  // 1. Programmatic Login on start to account teste@gmail.com / 12345678
  useEffect(() => {
    const performLogin = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
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
              // Force reload all iframes to pick up the logged-in session cookies/localStorage
              setIframeKey(prev => prev + 1);
            }
          }
        }
      } catch (err) {
        console.error('Erro no login automático da apresentação:', err);
      }
    };

    performLogin();
  }, []);

  // 2. Navigation Handlers (memoized to prevent hook warning)
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

  // 3. Inject styling inside iframes to hide the standard Header/Footer and style it full-height
  const cleanIframeHeaderFooter = useCallback((iframe: HTMLIFrameElement | null) => {
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        // Create styling to hide outer navbars and footers inside the iframe
        const style = doc.createElement('style');
        style.innerHTML = `
          header, footer, nav, .sticky { display: none !important; }
          main { padding-top: 0 !important; margin-top: 0 !important; }
          body { overflow: hidden !important; background-color: #fdfdfd !important; }
        `;
        doc.head.appendChild(style);
      }
    } catch {
      // Silent catch for cross-origin or pre-loaded assets
    }
  }, []);

  // 4. Reset scroll and start smooth auto-scroll on slide change
  useEffect(() => {
    // Reset all iframe scrolls
    iframeRefs.current.forEach((iframe, index) => {
      if (index !== currentSlide && iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.scrollTo(0, 0);
        } catch {}
      }
    });

    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
    }

    const activeIframe = iframeRefs.current[currentSlide];
    if (!activeIframe) return;

    // Delay auto-scrolling slightly to let transition/loading finish
    const timer = setTimeout(() => {
      let scrollPos = 0;
      scrollInterval.current = setInterval(() => {
        scrollPos += 1; // Smooth cinematic scroll
        if (activeIframe && activeIframe.contentWindow) {
          try {
            // Clean headers/footers in case they hotloaded or loaded late
            cleanIframeHeaderFooter(activeIframe);
            
            activeIframe.contentWindow.scrollTo(0, scrollPos);
            
            const doc = activeIframe.contentDocument || activeIframe.contentWindow.document;
            if (doc && scrollPos >= doc.documentElement.scrollHeight - doc.documentElement.clientHeight) {
              if (scrollInterval.current) clearInterval(scrollInterval.current);
            }
          } catch {
            if (scrollInterval.current) clearInterval(scrollInterval.current);
          }
        }
      }, 30);
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [currentSlide, iframeKey, cleanIframeHeaderFooter]);

  return (
    <div 
      onClick={handleScreenClick}
      className="fixed inset-0 z-[9999] bg-white text-black select-none flex flex-col items-center justify-center py-6 px-4 font-sans cursor-pointer overflow-hidden"
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

      {/* MAIN CONTAINER: LARGE SCREEN SHAPE */}
      <div className="w-full max-w-6xl h-[80vh] bg-[#fdfdfd] border-4 border-black shadow-[12px_12px_0_0_#000] flex flex-col relative transition-all duration-300 overflow-hidden">
        {SLIDES.map((slide, index) => (
          <iframe
            key={`${slide.url}-${iframeKey}`}
            ref={el => { iframeRefs.current[index] = el; }}
            src={slide.url}
            onLoad={() => cleanIframeHeaderFooter(iframeRefs.current[index])}
            className="absolute inset-0 w-full h-full border-none transition-opacity duration-500"
            style={{
              opacity: index === currentSlide ? 1 : 0,
              pointerEvents: index === currentSlide ? 'auto' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
