'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Calendar, MapPin, Loader2, Award, Sparkles, Search, Filter, ArrowUpDown, Clock, X, MessageSquare, Bell } from 'lucide-react';
import Image from 'next/image';
import { FeedPost } from '@/domain/entities';
import { loadStoredProfile } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type FeedListClientProps = {
  initialPosts: FeedPost[];
};

export function FeedListClient({ initialPosts }: FeedListClientProps) {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [displayedPosts, setDisplayedPosts] = useState<FeedPost[]>(initialPosts.slice(0, 4));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length > 4);
  const [loading, setLoading] = useState(false);
  const [proximityFilter, setProximityFilter] = useState(false);
  const [likesState, setLikesState] = useState<Record<string, { count: number; active: boolean }>>({});
  const [newContent, setNewContent] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [showCreator, setShowCreator] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);

  // New Filters and interactions state
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("");
  const [dateOrder, setDateOrder] = useState<"desc" | "asc">("desc");
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsState, setCommentsState] = useState<Record<string, { author: string; text: string }[]>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [selectedPostDetails, setSelectedPostDetails] = useState<FeedPost | null>(null);

  // States for post location and notifications
  const [postCity, setPostCity] = useState("Natal");
  const [postNeighborhood, setPostNeighborhood] = useState("");
  const [notifiedPosts, setNotifiedPosts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loaded = loadStoredProfile();
    setProfile(loaded);
    if (loaded?.city) setPostCity(loaded.city);
  }, []);

  // Populate mock comments for initial posts on mount
  useEffect(() => {
    const initialComments: Record<string, { author: string; text: string }[]> = {};
    initialPosts.forEach(post => {
      if (post.id === '60000000-0000-0000-0000-000000000001') {
        initialComments[post.id] = [
          { author: "Ana Beatriz", text: "Excelente iniciativa! A água potável muda tudo no Sertão." },
          { author: "Felipe Albuquerque", text: "Fico muito feliz em ver que minha doação ajudou a concluir mais este poço!" }
        ];
      } else if (post.id === '60000000-0000-0000-0000-000000000003') {
        initialComments[post.id] = [
          { author: "Juliana Santos", text: "Ler para as crianças é plantar sementes para o futuro! Parabéns pelo dia." }
        ];
      } else {
        initialComments[post.id] = [];
      }
    });
    setCommentsState(initialComments);
  }, [initialPosts]);

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...posts];

    // Search query filter (Text search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.content.toLowerCase().includes(query) || 
        p.authorName.toLowerCase().includes(query)
      );
    }

    // Category / Cause filter
    if (categoryFilter) {
      const cat = categoryFilter.toLowerCase();
      filtered = filtered.filter(p => 
        p.content.toLowerCase().includes(cat) || 
        (p.badge && p.badge.toLowerCase().includes(cat))
      );
    }

    // Region / City filter
    if (cityFilter) {
      const cityVal = cityFilter.toLowerCase();
      filtered = filtered.filter(p => p.city?.toLowerCase() === cityVal);
    }

    // Institution filter
    if (institutionFilter) {
      filtered = filtered.filter(p => p.authorId === institutionFilter);
    }

    // Hashtag filter
    if (hashtagFilter) {
      const cleanTag = hashtagFilter.toLowerCase();
      filtered = filtered.filter(p => {
        const words = p.content.toLowerCase().split(/\s+/);
        return words.some(w => w.startsWith("#") && w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") === cleanTag);
      });
    }

    // Proximity logic & Sorting
    if (proximityFilter) {
      const userCity = profile?.city || 'Natal';
      // Prioritize same city posts
      filtered.sort((a, b) => {
        const aNear = a.city?.toLowerCase() === userCity.toLowerCase();
        const bNear = b.city?.toLowerCase() === userCity.toLowerCase();
        if (aNear && !bNear) return -1;
        if (!aNear && bNear) return 1;
        
        // Secondary sorting by date
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return dateOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
    } else {
      filtered.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return dateOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
    }

    setDisplayedPosts(filtered.slice(0, 4));
    setPage(1);
    setHasMore(filtered.length > 4);
  }, [posts, proximityFilter, profile, searchQuery, categoryFilter, cityFilter, institutionFilter, hashtagFilter, dateOrder]);

  // Load more posts (Infinite scroll mock simulation)
  const loadMore = () => {
    if (loading || !hasMore) return;
    setLoading(true);

    setTimeout(() => {
      let filtered = [...posts];

      // Re-apply filters
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
          p.content.toLowerCase().includes(query) || p.authorName.toLowerCase().includes(query)
        );
      }
      if (categoryFilter) {
        const cat = categoryFilter.toLowerCase();
        filtered = filtered.filter(p => p.content.toLowerCase().includes(cat));
      }
      if (cityFilter) {
        const cityVal = cityFilter.toLowerCase();
        filtered = filtered.filter(p => p.city?.toLowerCase() === cityVal);
      }
      if (institutionFilter) {
        filtered = filtered.filter(p => p.authorId === institutionFilter);
      }
      if (hashtagFilter) {
        const cleanTag = hashtagFilter.toLowerCase();
        filtered = filtered.filter(p => p.content.toLowerCase().includes(`#${cleanTag}`));
      }

      // Re-apply sorting
      if (proximityFilter) {
        const userCity = profile?.city || 'Natal';
        filtered.sort((a, b) => {
          const aNear = a.city?.toLowerCase() === userCity.toLowerCase();
          const bNear = b.city?.toLowerCase() === userCity.toLowerCase();
          if (aNear && !bNear) return -1;
          if (!aNear && bNear) return 1;
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return dateOrder === "desc" ? timeB - timeA : timeA - timeB;
        });
      } else {
        filtered.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return dateOrder === "desc" ? timeB - timeA : timeA - timeB;
        });
      }

      const nextBatch = filtered.slice(page * 4, (page + 1) * 4);
      if (nextBatch.length > 0) {
        setDisplayedPosts(prev => [...prev, ...nextBatch]);
        setPage(prev => prev + 1);
        setHasMore(filtered.length > (page + 1) * 4);
      } else {
        setHasMore(false);
      }
      setLoading(false);
    }, 800);
  };

  // Intersection Observer setup for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [displayedPosts, hasMore, loading]);

  const handleLike = async (postId: string) => {
    if (!profile) {
      alert("Você precisa estar logado para curtir publicações no feed!");
      return;
    }
    setLikesState(prev => {
      const current = prev[postId] || { count: posts.find(p => p.id === postId)?.likes || 0, active: false };
      const nextActive = !current.active;
      
      if (isSupabaseConfigured && supabase) {
        supabase
          .from("feed_posts")
          .update({ likes: nextActive ? current.count + 1 : current.count - 1 })
          .eq("id", postId)
          .then(({ error }) => {
            if (error) console.error("Error updating likes count:", error.message);
          });
      }

      return {
        ...prev,
        [postId]: {
          count: nextActive ? current.count + 1 : current.count - 1,
          active: nextActive
        }
      };
    });
  };

  const handleSubmitComment = async (postId: string) => {
    if (!profile) {
      alert("Você precisa estar logado para comentar nas publicações do feed!");
      return;
    }
    const text = newCommentText[postId] || "";
    if (!text.trim()) return;

    const authorName = profile?.name || "Visitante";
    const newComment = { author: authorName, text: text.trim() };

    setCommentsState(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setNewCommentText(prev => ({
      ...prev,
      [postId]: ""
    }));

    // Update database comments count if Supabase is configured
    if (isSupabaseConfigured && supabase) {
      const postObj = posts.find(p => p.id === postId);
      const currentCommentsCount = postObj?.comments || 0;
      await supabase
        .from("feed_posts")
        .update({ comments: currentCommentsCount + 1 })
        .eq("id", postId);
    }

    // Increment local posts comments count
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
  };

  const renderParsedContent = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith("#") && part.length > 1) {
        const cleanTag = part.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        return (
          <button
            key={i}
            onClick={() => setHashtagFilter(cleanTag)}
            className="text-accent hover:underline font-black mr-1 cursor-pointer"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  const handleToggleNotifications = (postId: string, authorName: string) => {
    if (!profile) {
      alert("Você precisa estar logado para seguir e ativar notificações!");
      return;
    }
    setNotifiedPosts(prev => {
      const active = !prev[postId];
      alert(active 
        ? `Notificações ativadas! Você receberá alertas de novas publicações de "${authorName}".`
        : `Notificações desativadas para "${authorName}".`
      );
      return { ...prev, [postId]: active };
    });
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newPost: FeedPost = {
      id: 'post-user-' + Date.now(),
      authorId: profile?.id || 'anonymous',
      authorName: profile?.name || 'Comunidade PROVE',
      authorType: profile?.profileType || 'volunteer',
      content: newContent,
      imageUrl: selectedImage || undefined,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      city: postNeighborhood ? `${postCity} (${postNeighborhood})` : postCity,
      badge: profile?.profileType === 'company' ? 'Empresa ESG 🏆' : profile?.profileType === 'donor' ? 'Doador Solidário ❤️' : undefined
    };

    setPosts(prev => [newPost, ...prev]);
    setNewContent('');
    setSelectedImage('');
    setPostNeighborhood('');
    setShowCreator(false);

    // Save in DB if supabase active
    if (isSupabaseConfigured && supabase) {
      supabase.from("feed_posts").insert({
        id: newPost.id,
        author_id: newPost.authorId === 'anonymous' ? '00000000-0000-0000-0000-000000000001' : newPost.authorId,
        author_name: newPost.authorName,
        author_type: newPost.authorType,
        content: newPost.content,
        image_url: newPost.imageUrl,
      }).then(({ error }) => {
        if (error) console.error("Error creating post in DB:", error.message);
      });
    }
  };

  return (
    <div className="space-y-6 text-black">
      
      {/* Search & Filters Panel */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000] space-y-4 text-black">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <span className="font-display text-2xl font-black uppercase flex items-center gap-1.5">
              <Filter className="w-6 h-6 text-black" /> Filtros Globais do Feed
            </span>
            <p className="text-xs font-bold text-gray-500 mt-1">Busque publicações por data, causa, região, hashtag ou instituição.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setProximityFilter(!proximityFilter)}
              className={`flex-1 md:flex-none px-4 py-2 font-black uppercase text-xs border-2 border-black transition-all flex items-center justify-center gap-1.5 ${proximityFilter ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              <MapPin className="w-4 h-4" /> {proximityFilter ? "Local Primeiro ✓" : "Ordenar por Proximidade"}
            </button>
            <button
              onClick={() => setDateOrder(prev => prev === "desc" ? "asc" : "desc")}
              className="px-3 py-2 border-2 border-black font-black uppercase text-xs flex items-center justify-center gap-1.5 bg-white hover:bg-gray-100"
            >
              <ArrowUpDown className="w-4 h-4" /> {dateOrder === "desc" ? "Recentes" : "Antigos"}
            </button>
          </div>
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search by text */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por texto..."
              className="pl-9 border-2 border-black h-11 font-bold text-sm bg-white"
            />
          </div>

          {/* Region / City filter */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full h-11 border-2 border-black bg-white px-2 font-bold text-sm font-sans"
            >
              <option value="">Todas as Cidades (Região)</option>
              <option value="Natal">Natal</option>
              <option value="Caicó">Caicó</option>
              <option value="Parnamirim">Parnamirim</option>
            </select>
          </div>

          {/* Causa / Keyword filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-11 border-2 border-black bg-white px-2 font-bold text-sm font-sans"
            >
              <option value="">Todas as Causas</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Educação">Educação</option>
              <option value="Ambiente">Meio Ambiente</option>
              <option value="ESG">Transparência/ESG</option>
            </select>
          </div>

          {/* Institution filter */}
          <div>
            <select
              value={institutionFilter}
              onChange={(e) => setInstitutionFilter(e.target.value)}
              className="w-full h-11 border-2 border-black bg-white px-2 font-bold text-sm font-sans"
            >
              <option value="">Todas as Instituições</option>
              <option value="00000000-0000-0000-0000-000000000002">Instituto Água Viva</option>
              <option value="00000000-0000-0000-0000-000000000006">ONG Mãos que Ajudam</option>
            </select>
          </div>
        </div>

        {/* Clear filters & active badges */}
        {(searchQuery || categoryFilter || cityFilter || institutionFilter || hashtagFilter || proximityFilter) && (
          <div className="pt-2 flex flex-wrap items-center gap-2 border-t-2 border-dashed border-gray-100">
            <span className="text-xs font-black uppercase text-gray-500">Filtros ativos:</span>
            
            {hashtagFilter && (
              <Badge className="bg-accent text-white border-2 border-black font-black text-xs py-1 px-2.5 flex items-center gap-1.5">
                #{hashtagFilter}
                <button onClick={() => setHashtagFilter(null)} className="hover:text-black font-bold">✗</button>
              </Badge>
            )}
            
            {searchQuery && (
              <Badge className="bg-primary text-black border-2 border-black font-black text-xs py-1 px-2.5 flex items-center gap-1.5">
                Busca: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")} className="hover:text-red-600 font-bold">✗</button>
              </Badge>
            )}

            {cityFilter && (
              <Badge className="bg-primary text-black border-2 border-black font-black text-xs py-1 px-2.5 flex items-center gap-1.5">
                Cidade: {cityFilter}
                <button onClick={() => setCityFilter("")} className="hover:text-red-600 font-bold">✗</button>
              </Badge>
            )}

            {categoryFilter && (
              <Badge className="bg-primary text-black border-2 border-black font-black text-xs py-1 px-2.5 flex items-center gap-1.5">
                Causa: {categoryFilter}
                <button onClick={() => setCategoryFilter("")} className="hover:text-red-600 font-bold">✗</button>
              </Badge>
            )}

            {institutionFilter && (
              <Badge className="bg-primary text-black border-2 border-black font-black text-xs py-1 px-2.5 flex items-center gap-1.5">
                ONG Selecionada
                <button onClick={() => setInstitutionFilter("")} className="hover:text-red-600 font-bold">✗</button>
              </Badge>
            )}

            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("");
                setCityFilter("");
                setInstitutionFilter("");
                setHashtagFilter(null);
                setProximityFilter(false);
              }}
              className="text-xs font-black uppercase text-red-600 underline hover:text-red-800 ml-auto cursor-pointer"
            >
              Limpar Todos
            </button>
          </div>
        )}
      </div>

      {/* Instagram-style Post Creator */}
      {profile && !showCreator && (
        <Card className="border-4 border-black rounded-none bg-white p-4 shadow-[4px_4px_0_0_#000] text-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary border-2 border-black flex items-center justify-center font-black text-sm uppercase">
              {profile.name.charAt(0)}
            </div>
            <button
              onClick={() => setShowCreator(true)}
              className="flex-1 h-11 px-4 border-2 border-black bg-gray-50 text-left text-gray-500 font-bold text-sm hover:bg-gray-100 transition-colors cursor-pointer"
            >
              No que você está pensando, {profile.name}? Compartilhe uma história...
            </button>
          </div>
        </Card>
      )}

      {profile && showCreator && (
        <Card className="border-4 border-black rounded-none bg-white p-6 shadow-[6px_6px_0_0_#000] space-y-4 text-black">
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3">
            <span className="font-display text-xl font-black uppercase flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-accent" /> Criar Publicação
            </span>
            <button onClick={() => setShowCreator(false)} className="text-gray-400 hover:text-black font-black uppercase text-xs cursor-pointer">
              Fechar ✗
            </button>
          </div>

          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase block text-gray-600 mb-1">Cidade (RN)</label>
                <select
                  value={postCity}
                  onChange={(e) => setPostCity(e.target.value)}
                  className="w-full h-10 border-2 border-black bg-white px-2 font-bold text-sm font-sans"
                >
                  <option value="Natal">Natal</option>
                  <option value="Caicó">Caicó</option>
                  <option value="Parnamirim">Parnamirim</option>
                  <option value="Mossoró">Mossoró</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase block text-gray-600 mb-1">Bairro / Região</label>
                <Input
                  value={postNeighborhood}
                  onChange={(e) => setPostNeighborhood(e.target.value)}
                  placeholder="Ex: Petrópolis, Tirol..."
                  className="border-2 border-black h-10 font-bold text-sm bg-white"
                />
              </div>
            </div>
            <div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                placeholder="Escreva sua legenda com hashtags de impacto... #PROVERN #Voluntariado"
                rows={4}
                className="w-full border-2 border-black p-3 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
            </div>

            {/* Preset image suggestions */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase block text-gray-600">Escolha uma Imagem Temática</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "🍲 Alimentação", url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800" },
                  { label: "🐶 Animais", url: "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&q=80&w=800" },
                  { label: "📚 Educação", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800" },
                  { label: "🌳 Ecologia", url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800" }
                ].map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img.url)}
                    className={`py-2 text-xs font-black border-2 border-black transition-all cursor-pointer ${selectedImage === img.url ? 'bg-primary text-black font-black' : 'bg-white hover:bg-gray-100'}`}
                  >
                    {img.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div>
              <label className="text-xs font-black uppercase block text-gray-600 mb-1">Ou Insira URL da Imagem</label>
              <Input
                type="url"
                value={selectedImage}
                onChange={(e) => setSelectedImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="border-2 border-black font-bold h-11 bg-white text-black"
              />
            </div>

            {selectedImage && (
              <div className="relative h-48 w-full border-4 border-black overflow-hidden mt-3">
                <img src={selectedImage} alt="Prévia do Post" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="submit" className="font-black uppercase text-xs bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[3px_3px_0_0_#000]">
                Compartilhar Publicação
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Feed list */}
      <div className="grid gap-6">
        {displayedPosts.map((post) => {
          const postLike = likesState[post.id] || { count: post.likes, active: false };
          return (
            <Card key={post.id} className="border-4 border-black rounded-none bg-white hover:shadow-[6px_6px_0_0_#000] transition-all duration-200">
              <CardContent className="p-6">
                
                {/* Author Card header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b-2 border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary border-2 border-black flex items-center justify-center font-black text-sm uppercase">
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-display text-lg font-black uppercase flex items-center gap-1.5 leading-tight">
                        {post.authorName}
                        {post.badge && (
                          <Badge className="bg-primary text-black border border-black font-black text-[9px] px-1 py-0 flex items-center gap-0.5">
                            <Award className="w-2.5 h-2.5 shrink-0 text-accent" /> {post.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-black" /> {post.city || "Rio Grande do Norte"}
                      </div>
                    </div>
                  </div>
                  <Badge className={`border-2 border-black font-black uppercase text-[10px] ${
                    post.authorType === "institution" ? "bg-accent text-white" :
                    post.authorType === "company" ? "bg-sky-600 text-white" :
                    post.authorType === "donor" ? "bg-pink-600 text-white" :
                    "bg-primary text-black"
                  }`}>
                    {post.authorType === "institution" ? "ONG" :
                     post.authorType === "company" ? "Empresa" :
                     post.authorType === "donor" ? "Doador" :
                     "Voluntário"}
                  </Badge>
                </div>

                {/* Content */}
                <p className="text-gray-800 leading-relaxed font-medium text-base">
                  {renderParsedContent(post.content)}
                </p>

                {/* Image */}
                {post.imageUrl && (
                  <div className="relative mt-5 h-64 sm:h-80 overflow-hidden border-4 border-black">
                    <img
                      src={post.imageUrl}
                      alt={`Post de ${post.authorName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Card footer details */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                  <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer ${postLike.active ? 'text-red-600 font-black' : ''}`}
                    >
                      <Heart className={`w-4 h-4 ${postLike.active ? 'fill-red-600 text-red-600' : 'text-red-500'}`} />
                      {postLike.count} curtidas
                    </button>
                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      {(commentsState[post.id] || []).length || post.comments} comentários
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleNotifications(post.id, post.authorName)}
                      className={`px-3 py-1.5 text-xs border-2 border-black font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                        notifiedPosts[post.id] 
                          ? 'bg-primary text-black' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                      }`}
                    >
                      <Bell className={`w-3.5 h-3.5 ${notifiedPosts[post.id] ? 'fill-black' : ''}`} />
                      {notifiedPosts[post.id] ? "Notificações Ativas ✓" : "Ativar Notificações"}
                    </button>
                    <button
                      onClick={() => setSelectedPostDetails(post)}
                      className="px-3 py-1.5 text-xs border-2 border-black font-black uppercase bg-white hover:bg-gray-100 cursor-pointer shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>

                {/* Collapsible Comments Section */}
                {expandedComments[post.id] && (
                  <div className="mt-6 pt-6 border-t-2 border-black border-dashed space-y-4">
                    <span className="font-display text-lg font-black uppercase flex items-center gap-1.5">
                      <MessageSquare className="w-5 h-5 text-black" /> Comentários da Comunidade
                    </span>
                    
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {(commentsState[post.id] || []).map((comment, index) => (
                        <div key={index} className="bg-gray-50 border-2 border-black p-3 text-sm rounded-none">
                          <span className="font-black uppercase text-[10px] block mb-1 text-gray-700">{comment.author}</span>
                          <span className="font-bold text-gray-900">{comment.text}</span>
                        </div>
                      ))}
                      
                      {(!commentsState[post.id] || commentsState[post.id].length === 0) && (
                        <p className="text-xs font-bold text-gray-400 uppercase py-2">Nenhum comentário ainda. Seja o primeiro!</p>
                      )}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitComment(post.id);
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={newCommentText[post.id] || ""}
                        onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Escreva um comentário..."
                        required
                        className="flex-1 border-2 border-black font-bold h-10 bg-white"
                      />
                      <Button type="submit" size="sm" className="font-black uppercase text-xs border-2 border-black bg-black text-white hover:bg-gray-800">
                        Comentar
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Loading Spinner for Infinite Scroll */}
        {hasMore && (
          <div ref={loaderRef} className="py-8 flex justify-center items-center">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-black" />
            ) : (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role o scroll para ver mais histórias</span>
            )}
          </div>
        )}

        {!hasMore && displayedPosts.length > 0 && (
          <div className="py-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-t-2 border-gray-100">
            Fim do feed. Você viu todas as novidades! 💛
          </div>
        )}

        {displayedPosts.length === 0 && (
          <div className="p-16 border-4 border-dashed border-gray-200 text-center font-black text-gray-400 uppercase tracking-wider">
            Nenhuma publicação encontrada.
          </div>
        )}
      </div>

      {/* Modal - Post Details */}
      {selectedPostDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-4 border-black rounded-none bg-white p-6 shadow-[8px_8px_0_0_#000] relative max-h-[90vh] overflow-y-auto text-black">
            <button
              onClick={() => setSelectedPostDetails(null)}
              className="absolute right-4 top-4 border-2 border-black bg-white p-1 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <Badge className="mb-3 bg-accent text-white border-2 border-black">Detalhes da Publicação</Badge>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary border-2 border-black flex items-center justify-center font-black text-lg uppercase">
                {selectedPostDetails.authorName.charAt(0)}
              </div>
              <div>
                <h3 className="font-display text-xl font-black uppercase leading-none">{selectedPostDetails.authorName}</h3>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-black" /> {selectedPostDetails.city || "Rio Grande do Norte"}
                </span>
              </div>
            </div>

            <p className="text-gray-800 leading-relaxed font-bold text-lg mb-6 border-l-4 border-black pl-4">
              {renderParsedContent(selectedPostDetails.content)}
            </p>

            {selectedPostDetails.imageUrl && (
              <div className="relative h-64 sm:h-96 overflow-hidden border-4 border-black mb-6">
                <img
                  src={selectedPostDetails.imageUrl}
                  alt={`Post de ${selectedPostDetails.authorName}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="border-t-2 border-black border-dashed pt-6 space-y-4">
              <h4 className="font-display text-xl font-black uppercase">Comentários da Comunidade</h4>
              
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {(commentsState[selectedPostDetails.id] || []).map((comment, index) => (
                  <div key={index} className="bg-gray-50 border-2 border-black p-3 text-sm">
                    <span className="font-black uppercase text-[10px] block mb-1 text-gray-700">{comment.author}</span>
                    <span className="font-bold text-gray-900">{comment.text}</span>
                  </div>
                ))}
                
                {(!commentsState[selectedPostDetails.id] || commentsState[selectedPostDetails.id].length === 0) && (
                  <p className="text-xs font-bold text-gray-400 uppercase py-2">Nenhum comentário ainda.</p>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitComment(selectedPostDetails.id);
                }}
                className="flex gap-2"
              >
                <Input
                  value={newCommentText[selectedPostDetails.id] || ""}
                  onChange={(e) => setNewCommentText(prev => ({ ...prev, [selectedPostDetails.id]: e.target.value }))}
                  placeholder="Escreva um comentário..."
                  required
                  className="flex-1 border-2 border-black font-bold h-11 bg-white"
                />
                <Button type="submit" size="lg" className="font-black uppercase border-2 border-black bg-black text-white hover:bg-gray-800 shadow-[3px_3px_0_0_#000]">
                  Comentar
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
