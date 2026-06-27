'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Calendar, MapPin, Loader2, Award, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { FeedPost } from '@/domain/entities';
import { loadStoredProfile } from '@/lib/auth';

type FeedListClientProps = {
  initialPosts: FeedPost[];
};

export function FeedListClient({ initialPosts }: FeedListClientProps) {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [displayedPosts, setDisplayedPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [proximityFilter, setProximityFilter] = useState(false);
  const [likesState, setLikesState] = useState<Record<string, { count: number; active: boolean }>>({});
  const [newContent, setNewContent] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [showCreator, setShowCreator] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(loadStoredProfile());
  }, []);

  // Initialize display posts list
  useEffect(() => {
    // Sort logic
    const sorted = [...posts];
    if (proximityFilter) {
      const userCity = profile?.city || 'Natal';
      // Prioritize same city posts
      sorted.sort((a, b) => {
        const aNear = a.city?.toLowerCase() === userCity.toLowerCase();
        const bNear = b.city?.toLowerCase() === userCity.toLowerCase();
        if (aNear && !bNear) return -1;
        if (!aNear && bNear) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Reset pagination on sorting filter toggle
    setDisplayedPosts(sorted.slice(0, 4));
    setPage(1);
    setHasMore(sorted.length > 4);
  }, [posts, proximityFilter, profile]);

  // Load more posts (Infinite scroll mock simulation)
  const loadMore = () => {
    if (loading || !hasMore) return;
    setLoading(true);

    setTimeout(() => {
      const sorted = [...posts];
      if (proximityFilter) {
        const userCity = profile?.city || 'Natal';
        sorted.sort((a, b) => {
          const aNear = a.city?.toLowerCase() === userCity.toLowerCase();
          const bNear = b.city?.toLowerCase() === userCity.toLowerCase();
          if (aNear && !bNear) return -1;
          if (!aNear && bNear) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      } else {
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const nextBatch = sorted.slice(page * 4, (page + 1) * 4);
      if (nextBatch.length > 0) {
        setDisplayedPosts(prev => [...prev, ...nextBatch]);
        setPage(prev => prev + 1);
        setHasMore(sorted.length > (page + 1) * 4);
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

  const handleLike = (postId: string) => {
    setLikesState(prev => {
      const current = prev[postId] || { count: posts.find(p => p.id === postId)?.likes || 0, active: false };
      const nextActive = !current.active;
      return {
        ...prev,
        [postId]: {
          count: nextActive ? current.count + 1 : current.count - 1,
          active: nextActive
        }
      };
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
      city: profile?.city || 'Natal',
      badge: profile?.profileType === 'company' ? 'Empresa ESG 🏆' : profile?.profileType === 'donor' ? 'Doador Solidário ❤️' : undefined
    };

    setPosts(prev => [newPost, ...prev]);
    setNewContent('');
    setSelectedImage('');
    setShowCreator(false);
  };

  return (
    <div className="space-y-6">
      {/* Proximity Toggle Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-4 border-black bg-secondary shadow-[4px_4px_0_0_#000]">
        <div>
          <span className="font-display text-lg font-black uppercase flex items-center gap-1.5">
            <MapPin className="w-5 h-5 text-accent animate-pulse" /> Filtro de Proximidade Física
          </span>
          <p className="text-xs font-bold text-gray-700 mt-1">
            {profile ? `Exibindo primeiro posts da sua cidade (${profile.city || 'Não configurada'})` : "Prioriza postagens da sua cidade para criar impacto local."}
          </p>
        </div>
        <button
          onClick={() => setProximityFilter(!proximityFilter)}
          className={`px-4 py-2 font-black uppercase text-xs border-2 border-black transition-all ${proximityFilter ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
        >
          {proximityFilter ? "Ativado: Local Primeiro ✓" : "Ordenar por Proximidade"}
        </button>
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
              className="flex-1 h-11 px-4 border-2 border-black bg-gray-50 text-left text-gray-500 font-bold text-sm hover:bg-gray-100 transition-colors"
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
              <Sparkles className="w-5 h-5 text-accent" /> Criar Publicação (Estilo Instagram)
            </span>
            <button onClick={() => setShowCreator(false)} className="text-gray-400 hover:text-black font-black uppercase text-xs">
              Fechar ✗
            </button>
          </div>

          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                placeholder="Escreva sua legenda com hashtags de impacto... #PROVERN #Voluntariado"
                rows={4}
                className="w-full border-2 border-black p-3 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Preset image suggestions to simulate uploads easily */}
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
                    className={`py-2 text-xs font-black border-2 border-black transition-all ${selectedImage === img.url ? 'bg-primary text-black' : 'bg-white hover:bg-gray-100'}`}
                  >
                    {img.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div>
              <label className="text-xs font-black uppercase block text-gray-600 mb-1">Ou Insira URL do Instagram / Foto</label>
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
                <p className="text-gray-800 leading-relaxed font-medium text-base">{post.content}</p>

                {/* Image */}
                {post.imageUrl && (
                  <div className="relative mt-5 h-64 sm:h-80 overflow-hidden border-4 border-black">
                    <Image
                      src={post.imageUrl}
                      alt={`Post de ${post.authorName}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 700px"
                    />
                  </div>
                )}

                {/* Card footer details */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 hover:text-red-500 transition-colors ${postLike.active ? 'text-red-600 font-black' : ''}`}
                    >
                      <Heart className={`w-4 h-4 ${postLike.active ? 'fill-red-600 text-red-600' : 'text-red-500'}`} />
                      {postLike.count} curtidas
                    </button>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      {post.comments} comentários
                    </span>
                  </div>
                </div>
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
    </div>
  );
}
