import { getCampaigns } from "@/actions/campaigns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Settings, Eye, MessageSquare, BarChart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
  // In a real app, this would use the logged-in user's ID
  const campaigns = await getCampaigns();
  const myCampaigns = campaigns.filter(c => c.organizerId === 'user-1'); // Mock filter

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Meu Painel</h1>
          <p className="text-gray-600 font-bold mt-2">Gerencie suas campanhas e atualizações</p>
        </div>
        <Link href="/campaigns/new">
          <Button size="lg" className="text-lg">
            <Plus className="mr-2" /> Nova Campanha
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="bg-primary border-4">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm uppercase">Total Arrecadado</p>
              <h2 className="font-display text-4xl font-black mt-2">R$ 2.350</h2>
            </div>
            <BarChart className="w-12 h-12 opacity-50" />
          </CardContent>
        </Card>
        <Card className="bg-secondary border-4">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm uppercase">Campanhas Ativas</p>
              <h2 className="font-display text-4xl font-black mt-2">{myCampaigns.length}</h2>
            </div>
            <Eye className="w-12 h-12 opacity-50" />
          </CardContent>
        </Card>
        <Card className="bg-accent text-white border-4 border-black">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm uppercase">Novos Comentários</p>
              <h2 className="font-display text-4xl font-black mt-2">14</h2>
            </div>
            <MessageSquare className="w-12 h-12 opacity-50" />
          </CardContent>
        </Card>
      </div>

      <h2 className="font-display text-3xl font-black uppercase mb-6">Minhas Campanhas</h2>
      
      <div className="grid grid-cols-1 gap-6">
        {myCampaigns.map(campaign => (
          <Card key={campaign.id} className="flex flex-col sm:flex-row overflow-hidden hover:bg-gray-50">
            <div className="w-full sm:w-64 h-48 sm:h-auto relative border-b-2 sm:border-b-0 sm:border-r-2 border-border shrink-0">
              <Image 
                src={campaign.coverImage} 
                alt={campaign.title} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-2xl font-bold">{campaign.title}</h3>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                  </Badge>
                </div>
                <p className="text-gray-600 font-medium line-clamp-2 mt-2">{campaign.description}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href={`/campaigns/${campaign.id}`}>
                  <Button variant="outline" className="bg-white">Ver Página</Button>
                </Link>
                <Button variant="secondary" className="border-2 border-border">
                  <Plus className="w-4 h-4 mr-2" /> Nova Atualização
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
