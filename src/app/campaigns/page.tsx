import { getCampaigns } from "@/actions/campaigns";
import { CampaignsExplorer } from "@/components/campaigns-explorer";
import { Badge } from "@/components/ui/badge";

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
      <div className="mb-12">
        <Badge className="mb-4">Rio Grande do Norte</Badge>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter">
          Explore as Causas
        </h1>
        <p className="font-bold text-gray-600 mt-2 text-lg sm:text-xl max-w-2xl">
          Encontre os projetos que mais tocam seu coração. Filtre por cidade, categoria ou busque por palavras-chave.
        </p>
      </div>

      <CampaignsExplorer initialCampaigns={campaigns} />
    </div>
  );
}
