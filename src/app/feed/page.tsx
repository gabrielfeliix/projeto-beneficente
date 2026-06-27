import { getFeedPosts } from "@/actions/platform";
import { Badge } from "@/components/ui/badge";
import { FeedListClient } from "@/components/feed-list-client";

export default async function FeedPage() {
  const posts = await getFeedPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <Badge className="mb-4 bg-accent text-white border-2 border-black">Comunidade</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Feed da Comunidade</h1>
        <p className="text-gray-600 font-bold mt-3 max-w-2xl">
          Histórias reais de impacto. Acompanhe o que voluntários, doadores e organizações parceiras estão realizando pelo bem comum no Rio Grande do Norte.
        </p>
      </div>

      <FeedListClient initialPosts={posts} />
    </div>
  );
}
