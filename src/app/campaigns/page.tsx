import { getCampaigns } from "@/actions/campaigns";
import { CampaignsExplorer } from "@/components/campaigns-explorer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16 text-black">
      <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Badge className="mb-4 bg-accent text-white border-2 border-black">Rio Grande do Norte</Badge>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter">
            Explore as Causas
          </h1>
          <p className="font-bold text-gray-600 mt-2 text-lg sm:text-xl max-w-2xl">
            Encontre os projetos que mais tocam seu coração. Filtre por cidade, categoria ou busque por palavras-chave.
          </p>
        </div>
        <Link href="/campaigns/new" className="shrink-0">
          <Button size="lg" className="font-black uppercase border-2 border-black bg-[#ff90e8] text-black hover:bg-black hover:text-white shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-all">
            Criar Campanha
          </Button>
        </Link>
      </div>

      <CampaignsExplorer initialCampaigns={campaigns} />
    </div>
  );
}
