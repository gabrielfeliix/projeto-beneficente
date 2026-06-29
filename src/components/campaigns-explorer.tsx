"use client";

import { Campaign } from "@/domain/entities";
import { useState, useMemo } from "react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Search, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CampaignsExplorerProps {
  initialCampaigns: Campaign[];
}

const CATEGORIES = [
  "Todas as Categorias",
  "Alimentação",
  "Saúde",
  "Educação",
  "Animais",
  "Desastres",
  "Moradia",
  "Esporte",
  "Cultura",
  "Meio Ambiente",
  "Outro"
];

const CITIES = ["Todo o RN", "Natal", "Parnamirim", "Mossoró"];

export function CampaignsExplorer({ initialCampaigns }: CampaignsExplorerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas as Categorias");
  const [selectedCity, setSelectedCity] = useState("Todo o RN");

  const filteredCampaigns = useMemo(() => {
    return initialCampaigns.filter((campaign) => {
      const matchesSearch = search === "" || 
        campaign.title.toLowerCase().includes(search.toLowerCase()) || 
        campaign.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory === "Todas as Categorias" || campaign.category === selectedCategory;
      const matchesCity = selectedCity === "Todo o RN" || campaign.city === selectedCity;

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [initialCampaigns, search, selectedCategory, selectedCity]);

  // Helper function to format the date like "Hoje, 16:44" as seen in OLX
  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    
    // Very simplified logic for mock purposes
    const isToday = d.getDate() === now.getDate();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    if (isToday) return `Hoje, ${hours}:${minutes}`;
    return `${d.toLocaleDateString('pt-BR')}, ${hours}:${minutes}`;
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar (Dropdowns) */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border-4 border-border shadow-brutalist-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Buscar campanhas, ONGs, causas..." 
            className="pl-10 h-12 text-lg border-2 border-border focus-visible:ring-primary rounded-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className="h-12 px-4 border-2 border-border bg-white text-lg focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          {CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select 
          className="h-12 px-4 border-2 border-border bg-white text-lg focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Results List (OLX Style) */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border-4 border-border">
          <h3 className="font-display text-2xl font-black uppercase text-gray-500">Nenhuma campanha encontrada</h3>
          <p className="text-gray-400 font-bold mt-2">Tente ajustar seus filtros de busca.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="flex flex-col sm:flex-row bg-white hover:bg-gray-50 transition-colors border-2 shadow-sm rounded-none overflow-hidden">
              
              {/* Left Side: Image */}
              <div className="relative w-full sm:w-[300px] h-[200px] sm:h-auto shrink-0 border-b-2 sm:border-b-0 sm:border-r-2 border-border group cursor-pointer">
                <Link href={`/campaigns/${campaign.id}`}>
                  <Image 
                    src={campaign.coverImage} 
                    alt={campaign.title}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                  />
                  {/* OLX typically has a heart icon overlay, but we'll put the Category badge here */}
                  <Badge className="absolute top-2 left-2 text-xs" variant={campaign.category === 'Educação' ? 'secondary' : 'default'}>
                    {campaign.category}
                  </Badge>
                </Link>
              </div>
              
              {/* Right Side: Content */}
              <CardContent className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <Link href={`/campaigns/${campaign.id}`} className="hover:underline">
                    <h3 className="text-xl sm:text-2xl font-bold line-clamp-2 uppercase leading-tight text-gray-800">
                      {campaign.title}
                    </h3>
                  </Link>
                  
                  <div className="mt-2 font-display text-2xl font-black text-black">
                    {campaign.financialGoal ? `R$ ${campaign.financialGoal.toLocaleString('pt-BR')}` : 'Doação de Materiais'}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block shrink-0 shadow-sm border border-green-700"></span>
                      <span className="text-sm font-bold text-green-600">Ativa</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 border border-gray-300 px-2 py-0.5 uppercase">
                      ID: #{campaign.id}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded flex items-center gap-1 uppercase select-none">
                      🤖 Classificado por IA (Seguro)
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                    <MapPin className="w-4 h-4 shrink-0" /> 
                    <span>{campaign.city}, {campaign.neighborhood} | {formatTime(campaign.updatedAt)}</span>
                  </div>
                  
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button variant="outline" className="w-full sm:w-auto rounded-full border-2 border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600 uppercase font-bold text-sm h-10 px-6 gap-2">
                      <MessageCircle className="w-4 h-4" /> Entrar na Causa
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
