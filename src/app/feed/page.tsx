import { getFeedPosts } from '@/actions/platform';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle } from 'lucide-react';

export default async function FeedPage() {
  const posts = await getFeedPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <Badge className="mb-4">Feed</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Feed de Notícias</h1>
        <p className="text-gray-600 font-bold mt-3 max-w-3xl">Compartilhe seus feitos e acompanhe as atualizações de voluntários e instituições.</p>
      </div>

      <div className="grid gap-8">
        {posts.map((post) => (
          <Card key={post.id} className="border-2 rounded-none">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div>
                  <div className="font-bold uppercase tracking-[0.25em] text-sm text-gray-500">{post.authorType === 'volunteer' ? 'Voluntário' : 'Instituição'}</div>
                  <div className="font-display text-2xl font-black uppercase">{post.authorName}</div>
                </div>
                <Badge variant={post.authorType === 'institution' ? 'secondary' : 'default'}>{post.authorType === 'institution' ? 'ONG' : 'Voluntário'}</Badge>
              </div>

              <p className="text-gray-700 leading-relaxed text-lg">{post.content}</p>

              {post.imageUrl && (
                <div className="relative mt-6 h-72 overflow-hidden border-2 border-border rounded-sm">
                  <img src={post.imageUrl} alt="Imagem do post" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-bold text-gray-600">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span className="inline-flex items-center gap-2"><Heart className="w-4 h-4" /> {post.likes} curtidas</span>
                <span className="inline-flex items-center gap-2"><MessageCircle className="w-4 h-4" /> {post.comments} comentários</span>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline">Curtir</Button>
                <Button variant="secondary">Comentar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
