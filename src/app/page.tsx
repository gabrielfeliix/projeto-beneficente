import { getCampaigns, getRecentUpdates } from "@/actions/campaigns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee";
import { ArrowRight, Megaphone, MapPin, Target } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const campaigns = await getCampaigns();
  const recentUpdates = await getRecentUpdates();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary px-6 py-20 lg:py-32 border-b-2 border-border brutalist-shadow-bottom relative overflow-hidden">
        <div className="absolute -right-20 -top-20 bg-secondary w-96 h-96 rounded-full border-4 border-border opacity-50 blur-none"></div>
        <div className="absolute left-10 bottom-10 bg-accent w-48 h-48 border-4 border-border rotate-12 opacity-80"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center lg:text-left flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter">
              Eles lutam <br /> <span className="bg-white px-2 inline-block -rotate-2 border-2 border-border mt-2">todos os dias.</span><br />
              <span className="text-4xl sm:text-5xl lg:text-6xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Você é a força que falta.</span>
            </h1>
            <p className="font-sans text-xl sm:text-2xl font-bold max-w-2xl bg-white/50 inline-block p-2 border-2 border-border">
              Apoie projetos sociais reais na sua região e veja, passo a passo, o impacto da sua ajuda transformando vidas.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link href="/campaigns">
                <Button size="lg" className="text-xl px-8 shadow-brutalist-lg hover:-translate-y-1 transition-transform">Descubra Quem Precisa de Você</Button>
              </Link>
              <Link href="/campaigns/new">
                <Button variant="secondary" size="lg" className="text-xl border-2 border-border px-8 shadow-brutalist-lg hover:-translate-y-1 transition-transform">Inicie uma Causa</Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 hidden lg:block">
            <div className="brutalist-card bg-secondary p-4 rotate-3 w-full max-w-md mx-auto">
              <Image 
                src="/images/hero_community.png" 
                alt="Comunidade" 
                width={800} height={600} 
                className="border-2 border-border w-full h-auto object-cover aspect-video"
              />
              <div className="mt-4 flex items-center justify-between font-bold">
                <span className="text-2xl font-display">Ação Viva</span>
                <Badge variant="default" className="text-lg py-1">Em Andamento</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Updates */}
      <Marquee speed={30}>
        {recentUpdates.map((update) => (
          <div key={update.id} className="flex items-center gap-4 font-bold text-lg px-8 border-r-2 border-border last:border-0">
            <Megaphone className="text-primary fill-current" />
            <span><span className="text-accent underline decoration-2">{update.campaign.title}</span>: {update.content.substring(0, 60)}...</span>
          </div>
        ))}
      </Marquee>

      {/* Featured Campaigns Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Campanhas em Destaque</h2>
          <Link href="/campaigns" className="hidden sm:flex">
            <Button variant="outline">
              Ver Todas <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="flex flex-col h-full bg-white hover:bg-gray-50">
              <div className="aspect-video relative border-b-2 border-border overflow-hidden">
                <Image 
                  src={campaign.coverImage} 
                  alt={campaign.title}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 right-4 text-sm" variant={campaign.category === 'Educação' ? 'secondary' : 'default'}>
                  {campaign.category}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl line-clamp-2">{campaign.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <MapPin className="w-4 h-4" /> {campaign.neighborhood}, {campaign.city}
                </div>
                <p className="text-sm font-medium line-clamp-3">
                  {campaign.description}
                </p>
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="flex items-center gap-1"><Target className="w-4 h-4 text-primary" /> Meta</span>
                    <span>{campaign.financialGoal ? `R$ ${campaign.financialGoal}` : 'Não financeira'}</span>
                  </div>
                  {campaign.financialGoal && campaign.financialRaised && (
                    <div className="w-full bg-gray-200 border-2 border-border h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full border-r-2 border-border" 
                        style={{ width: `${Math.min(100, (campaign.financialRaised / campaign.financialGoal) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Link href={`/campaigns/${campaign.id}`} className="w-full">
                  <Button className="w-full text-lg shadow-brutalist hover:-translate-y-1 transition-transform">Salvar Essa História</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
