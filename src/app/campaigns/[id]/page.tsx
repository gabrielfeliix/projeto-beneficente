import { getCampaignById, getCampaignUpdates, getCampaignOrganizer } from "@/actions/campaigns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Target, Share2, Heart, Calendar, Megaphone } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const campaign = await getCampaignById(id);
  
  if (!campaign) {
    notFound();
  }

  const updates = await getCampaignUpdates(id);
  const organizer = await getCampaignOrganizer(campaign.organizerId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-12">
        
        {/* Header Section */}
        <div className="space-y-6">
          <Badge className="text-lg" variant={campaign.category === 'Educação' ? 'secondary' : 'default'}>
            {campaign.category}
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-tight">
            {campaign.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-600 font-bold">
            <div className="flex items-center gap-1"><MapPin className="w-5 h-5" /> {campaign.neighborhood}, {campaign.city}</div>
            <div className="flex items-center gap-1"><Calendar className="w-5 h-5" /> Criada em {new Date(campaign.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full aspect-video relative brutalist-card bg-primary overflow-hidden group">
          <Image 
            src={campaign.coverImage} 
            alt={campaign.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Story */}
        <div className="space-y-4">
          <h2 className="font-display text-3xl font-black uppercase border-b-4 border-border inline-block pb-1">Nossa Luta</h2>
          <p className="text-lg font-medium leading-relaxed bg-gray-50 p-6 brutalist-border rounded-md">
            {campaign.description}
          </p>
        </div>

        {/* Timeline (Core Feature) */}
        <div className="space-y-6">
          <h2 className="font-display text-3xl font-black uppercase border-b-4 border-border inline-block pb-1">Linha do Tempo</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-border">
            {updates.map((update, index) => (
              <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-border bg-primary text-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-brutalist-sm z-10">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 brutalist-card hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-500">{new Date(update.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-bold mb-4">{update.content}</p>
                  {update.imageUrl && (
                    <div className="relative aspect-video w-full mt-2 border-2 border-border rounded-sm overflow-hidden">
                      <Image src={update.imageUrl} alt="Atualização" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-96">
        <div className="sticky top-24 space-y-8">
          {/* Action Card */}
          <Card className="bg-primary text-primary-foreground border-4">
            <CardContent className="p-6 space-y-6">
              {campaign.financialGoal ? (
                <div>
                  <div className="flex justify-between font-bold mb-2 text-xl">
                    <span>Arrecadado</span>
                    <span>R$ {campaign.financialRaised || 0}</span>
                  </div>
                  <div className="w-full bg-white border-2 border-border h-6 rounded-full overflow-hidden">
                    <div 
                      className="bg-secondary h-full border-r-2 border-border transition-all duration-1000" 
                      style={{ width: `${Math.min(100, ((campaign.financialRaised || 0) / campaign.financialGoal) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-bold mt-2 text-right">
                    da meta de R$ {campaign.financialGoal}
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 p-4 brutalist-border">
                  <h3 className="uppercase tracking-widest text-sm text-gray-700 font-bold mb-2">Ponto de Coleta</h3>
                  <p className="font-medium text-black">Entre em contato para combinar a entrega física no nosso endereço central.</p>
                </div>
              )}

              <div className="space-y-2 font-bold bg-white/50 p-4 brutalist-border">
                <h3 className="uppercase tracking-widest text-sm text-gray-700">Necessidade Principal</h3>
                <p className="text-xl">{campaign.mainNeed}</p>
              </div>

              {campaign.financialGoal ? (
                <Button size="lg" className="w-full text-xl h-14 uppercase tracking-wider bg-black text-white hover:bg-gray-800 hover:text-white transition-transform active:scale-95">
                  <Heart className="mr-2" /> Doar na Vakinha
                </Button>
              ) : (
                <Button size="lg" className="w-full text-lg h-14 uppercase tracking-wider bg-[#25D366] text-black border-2 border-black hover:bg-[#20b858] transition-transform active:scale-95">
                  <Megaphone className="mr-2" /> Falar no WhatsApp
                </Button>
              )}
              
              <Button variant="outline" size="lg" className="w-full h-12 bg-white hover:bg-gray-100 transition-transform active:scale-95">
                <Share2 className="mr-2" /> Multiplicar essa Causa
              </Button>
            </CardContent>
          </Card>

          {/* Organizer Info */}
          {organizer && (
            <Card className="bg-secondary border-4">
              <CardContent className="p-6">
                <h3 className="font-display font-black uppercase text-xl mb-4">Organizador / ONG</h3>
                <div className="flex items-center gap-4 mb-4">
                  {organizer.avatarUrl && (
                    <Image 
                      src={organizer.avatarUrl} 
                      alt={organizer.name} 
                      width={64} height={64} 
                      className="rounded-full border-2 border-border"
                    />
                  )}
                  <div>
                    <div className="font-bold text-lg leading-tight">{organizer.name}</div>
                    <div className="text-sm font-semibold text-gray-700">{organizer.city}</div>
                  </div>
                </div>
                <p className="text-sm font-medium mb-4">{organizer.description}</p>
                {campaign.contact && (
                  <div className="pt-4 border-t-2 border-border text-sm font-bold">
                    Contato Público: {campaign.contact}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
