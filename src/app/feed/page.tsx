import { getFeedPosts } from "@/actions/platform";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Calendar } from "lucide-react";
import Image from "next/image";

export default async function FeedPage() {
  const posts = await getFeedPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <Badge className="mb-4 bg-accent text-white border-2 border-black">Comunidade</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Feed da Comunidade</h1>
        <p className="text-gray-600 font-bold mt-3 max-w-2xl">
          Histórias reais de impacto. Acompanhe o que voluntários e organizações estão fazendo pelo bem comum.
        </p>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="border-4 border-black rounded-none bg-white hover:shadow-[6px_6px_0_0_#000] transition-all duration-200">
            <CardContent className="p-6">
              {/* Autor */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary border-2 border-black flex items-center justify-center font-black text-sm uppercase">
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-display text-lg font-black uppercase leading-tight">{post.authorName}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      {post.authorType === "institution" ? "🏛️ Organização Social" : "🙋 Voluntário(a)"}
                    </div>
                  </div>
                </div>
                <Badge className={`border-2 border-black font-black uppercase text-xs ${post.authorType === "institution" ? "bg-accent text-white" : "bg-primary text-black"}`}>
                  {post.authorType === "institution" ? "ONG" : "Voluntário"}
                </Badge>
              </div>

              {/* Conteúdo */}
              <p className="text-gray-800 leading-relaxed font-medium text-base">{post.content}</p>

              {/* Imagem */}
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

              {/* Rodapé */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-red-500" />
                    {post.likes} curtidas
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    {post.comments} comentários
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <div className="p-16 border-4 border-dashed border-gray-200 text-center font-black text-gray-400 uppercase tracking-wider">
            Nenhuma publicação encontrada ainda.
          </div>
        )}
      </div>
    </div>
  );
}
