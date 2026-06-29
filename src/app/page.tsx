import { getCampaigns, getRecentUpdates } from "@/actions/campaigns";
import { getJobs, getVolunteers, getInstitutions } from "@/actions/platform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee";
import { ArrowRight, MapPin, Target, Users, Building2, Briefcase, Heart, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const [campaigns, recentUpdates, jobs, volunteers, institutions] = await Promise.all([
    getCampaigns(),
    getRecentUpdates(),
    getJobs(),
    getVolunteers(),
    getInstitutions(),
  ]);

  const stats = [
    { value: `${volunteers.length + 847}+`, label: "Voluntários Ativos", icon: <Users className="w-6 h-6" />, color: "bg-primary" },
    { value: `${institutions.length + 32}+`, label: "ONGs Parceiras", icon: <Building2 className="w-6 h-6" />, color: "bg-secondary" },
    { value: `${jobs.length + 94}+`, label: "Vagas Abertas", icon: <Briefcase className="w-6 h-6" />, color: "bg-accent text-white" },
    { value: `${campaigns.length * 156 + 2340}+`, label: "Vidas Impactadas", icon: <Heart className="w-6 h-6" />, color: "bg-black text-white" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO */}
      <section className="bg-primary px-4 sm:px-6 py-16 sm:py-24 lg:py-32 border-b-4 border-black relative overflow-hidden">
        <div className="absolute -right-16 sm:-right-20 -top-16 sm:-top-20 bg-secondary w-64 sm:w-96 h-64 sm:h-96 border-4 border-black opacity-60" />
        <div className="absolute left-4 sm:left-10 bottom-4 sm:bottom-10 bg-accent w-24 sm:w-48 h-24 sm:h-48 border-4 border-black rotate-12 opacity-80" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 text-center lg:text-left">
          <div className="flex-1 space-y-6 sm:space-y-8">
            <div>
              <Badge className="mb-4 bg-black text-primary border-2 border-black font-black uppercase text-xs sm:text-sm">
                🌟 Plataforma de Voluntariado no RN
              </Badge>
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter">
                Eles lutam <br />
                <span className="bg-white px-2 inline-block -rotate-2 border-2 border-black mt-2">
                  todos os dias.
                </span>
                <br />
                <span className="text-3xl sm:text-4xl lg:text-5xl text-black/80 mt-3 block">
                  Você é a força que falta
                </span>
              </h1>
            </div>
            <p className="font-bold text-base sm:text-xl max-w-2xl bg-white/60 inline-block p-3 border-2 border-black mx-auto lg:mx-0">
              Conectamos voluntários a ONGs e projetos sociais reais no Rio Grande do Norte. Veja o impacto da sua ajuda transformando vidas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/vagas" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-xl px-6 sm:px-8 h-14 font-black uppercase border-2 border-black shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-transform">
                  <Briefcase className="w-5 h-5 mr-2" /> Ver Vagas de Voluntariado
                </Button>
              </Link>
              <Link href="/login?mode=signup" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-xl h-14 font-black uppercase border-4 border-black shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-transform bg-white">
                  Criar Conta
                </Button>
              </Link>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm font-bold">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> 100% Gratuito</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> Certificados Emitidos</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-500 fill-red-500" /> LGPD Conforme</span>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-none hidden sm:block">
            <div className="border-4 border-black p-4 bg-secondary shadow-[8px_8px_0_0_#000] rotate-2 hover:rotate-0 transition-transform duration-300">
              <img
                src="/images/hero_community.png"
                alt="Comunidade voluntária do RN"
                className="border-2 border-black w-full h-auto object-cover aspect-video"
              />
              <div className="mt-4 flex items-center justify-between font-bold">
                <span className="font-display text-xl font-black uppercase">Ação Viva — Natal, RN</span>
                <Badge className="border-2 border-black bg-accent text-white font-black">Em Andamento ✓</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.color} border-r-4 last:border-r-0 border-black p-6 sm:p-8 text-center hover:-translate-y-1 transition-transform`}>
              <div className="flex items-center justify-center gap-2 mb-2 opacity-70">{stat.icon}</div>
              <div className="font-display text-3xl sm:text-4xl font-black">{stat.value}</div>
              <div className="font-bold text-xs sm:text-sm uppercase tracking-widest mt-1 opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVE CAMPAIGNS MARQUEE */}
      {campaigns.length > 0 && (
        <Marquee speed={40} className="border-b-4 border-black bg-black text-primary py-3 select-none">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center gap-4 font-bold text-sm sm:text-base px-8 border-r-4 border-primary/20 last:border-0 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0 border border-green-700 shadow-sm animate-pulse"></span>
              <span>
                CAMPANHA ATIVA: <span className="text-secondary underline decoration-2">{campaign.title}</span> em {campaign.city}
                {campaign.financialGoal ? ` — Meta: R$ ${campaign.financialGoal.toLocaleString('pt-BR')}` : ''}
              </span>
            </div>
          ))}
        </Marquee>
      )}

      {/* FEATURED CAMPAIGNS */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <Badge className="mb-3 bg-accent text-white border-2 border-black font-black">Apoie Agora</Badge>
            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tighter">Campanhas em Destaque</h2>
          </div>
          <Link href="/campaigns">
            <Button variant="outline" className="font-black uppercase border-2 border-black hover:shadow-[4px_4px_0_0_#000] transition-all">
              Ver Todas <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {campaigns.slice(0, 6).map((campaign) => (
            <Card key={campaign.id} className="flex flex-col h-full bg-white border-4 border-black hover:shadow-[8px_8px_0_0_#000] hover:-translate-y-1 transition-all duration-200 rounded-none">
              <div className="aspect-video relative border-b-4 border-black overflow-hidden">
                <Image
                  src={campaign.coverImage}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <Badge className={`absolute top-3 right-3 border-2 border-black font-black text-xs ${campaign.category === "Educação" ? "bg-secondary text-black" : "bg-accent text-white"}`}>
                  {campaign.category}
                </Badge>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-xl sm:text-2xl font-black line-clamp-2 leading-tight">{campaign.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-4 pb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <MapPin className="w-4 h-4 shrink-0" /> {campaign.neighborhood}, {campaign.city}
                </div>
                <p className="text-sm font-medium text-gray-700 line-clamp-3 leading-relaxed">{campaign.description}</p>
                {campaign.financialGoal && campaign.financialRaised && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="flex items-center gap-1"><Target className="w-4 h-4 text-black" /> Meta</span>
                      <span>R$ {campaign.financialRaised.toLocaleString("pt-BR")} / R$ {campaign.financialGoal.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="w-full bg-gray-200 border-2 border-black h-3 overflow-hidden">
                      <div
                        className="bg-primary h-full border-r-2 border-black transition-all"
                        style={{ width: `${Math.min(100, (campaign.financialRaised / campaign.financialGoal) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs font-black text-right text-gray-500">
                      {Math.round((campaign.financialRaised / campaign.financialGoal) * 100)}% alcançado
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0">
                <Link href={`/campaigns/${campaign.id}`} className="w-full">
                  <Button className="w-full font-black uppercase border-2 border-black bg-black text-primary hover:bg-gray-800 transition-all">
                    Apoiar Esta Causa <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* VAGAS SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <Badge className="mb-3 bg-primary text-black border-2 border-primary font-black">Voluntarie-se</Badge>
              <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tighter">Vagas Abertas</h2>
              <p className="font-bold text-gray-400 mt-2 text-sm sm:text-base">Encontre oportunidades compatíveis com suas habilidades e disponibilidade.</p>
            </div>
            <Link href="/vagas">
              <Button className="font-black uppercase border-2 border-primary bg-primary text-black hover:bg-yellow-300">
                Ver Todas as Vagas <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {jobs.slice(0, 6).map((job) => (
              <Link key={job.id} href={`/vagas/${job.id}`}>
                <div className="border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-primary p-5 sm:p-6 transition-all duration-200 h-full flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black uppercase text-base sm:text-lg leading-tight line-clamp-2">{job.title}</h3>
                    <Badge className="shrink-0 border border-black bg-primary text-black text-xs font-black uppercase">{job.category}</Badge>
                  </div>
                  <p className="text-gray-400 text-sm font-medium line-clamp-2">{job.description}</p>
                  <div className="mt-auto flex items-center justify-between text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.city}</span>
                    <span className="text-primary font-black">{job.modality}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-primary border-t-4 border-black">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge className="bg-black text-primary border-2 border-black font-black">Comece Agora</Badge>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tighter">
            Pronto para fazer a diferença?
          </h2>
          <p className="font-bold text-base sm:text-xl text-gray-800 max-w-xl mx-auto">
            Cadastre-se gratuitamente, encontre uma causa que move seu coração e comece a impactar vidas hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/login?mode=signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 text-lg font-black uppercase border-4 border-black bg-black text-primary hover:bg-gray-800 shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all">
                Quero Ser Voluntário
              </Button>
            </Link>
            <Link href="/campaigns/new" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 text-lg font-black uppercase border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all bg-white">
                Sou uma ONG / Instituição
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
