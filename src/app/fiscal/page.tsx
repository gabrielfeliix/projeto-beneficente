"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { getPendingInstitutions, updateInstitutionApproval } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  XCircle, CheckCircle, FileText, Building2, User, Phone, MapPin, 
  Search, Shield, BarChart3, TrendingUp, Users, Heart, Award, ArrowUpRight 
} from "lucide-react";
import { loadStoredProfile } from "@/lib/auth";

export default function FiscalPage() {
  const [profile, setProfile] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInst, setSelectedInst] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"governo" | "auditoria">("governo");

  useEffect(() => {
    const user = loadStoredProfile();
    setProfile(user);

    async function loadData() {
      try {
        const list = await getPendingInstitutions();
        setPending(list);
      } catch (err) {
        console.error("Error loading pending ONGs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAction = async (status: "approved" | "rejected") => {
    if (!selectedInst) return;
    setActionLoading(true);
    try {
      const ok = await updateInstitutionApproval(selectedInst.id, status, notes);
      if (ok) {
        alert(status === "approved" ? "ONG aprovada com sucesso!" : "ONG rejeitada.");
        setPending(prev => prev.filter(item => item.id !== selectedInst.id));
        setSelectedInst(null);
        setNotes("");
      } else {
        alert("Erro ao salvar ação de auditoria.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPending = pending.filter(inst => 
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    (inst.cnpj && inst.cnpj.includes(search))
  );

  if (loading) {
    return (
      <div className="py-24 text-center font-display text-2xl font-black uppercase text-black">
        Carregando Painel de Controle Governamental...
      </div>
    );
  }

  // Estatísticas governamentais simuladas com visual neobrutalista premium
  const kpis = [
    { title: "ONGs Parceiras", value: "37", icon: <Building2 className="w-5 h-5" />, color: "bg-primary" },
    { title: "Voluntários Ativos", value: "847", icon: <Users className="w-5 h-5" />, color: "bg-secondary" },
    { title: "Arrecadação Total", value: "R$ 114.500", icon: <TrendingUp className="w-5 h-5" />, color: "bg-accent text-white" },
    { title: "Horas doadas no RN", value: "2.840h", icon: <Award className="w-5 h-5" />, color: "bg-yellow-300" },
  ];

  const regionsData = [
    { city: "Natal", count: 45, percentage: 90, color: "bg-primary" },
    { city: "Mossoró", count: 25, percentage: 50, color: "bg-secondary" },
    { city: "Parnamirim", count: 18, percentage: 36, color: "bg-accent" },
    { city: "Caicó", count: 12, percentage: 24, color: "bg-yellow-400" },
    { city: "Macau", count: 7, percentage: 14, color: "bg-pink-300" },
  ];

  const causesData = [
    { cause: "Alimentação (Combate à Fome)", percentage: 35, color: "bg-primary" },
    { cause: "Educação / Alfabetização", percentage: 28, color: "bg-secondary" },
    { cause: "Meio Ambiente & Proteção", percentage: 18, color: "bg-accent" },
    { cause: "Saúde / Apoio Médico", percentage: 19, color: "bg-yellow-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-black">
      {/* Cabeçalho */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <Badge className="bg-black text-white border-2 border-black font-black uppercase text-xs mb-2">
            Portal de Transparência Social
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Shield className="w-8 h-8 text-accent" /> Auditoria e Estatísticas Governamentais
          </h1>
          <p className="text-gray-600 font-bold mt-2">
            Análise detalhada de impacto social, validação tributária e acompanhamento de ONGs pelo Governo do Rio Grande do Norte.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-4 border-black p-1 bg-white shrink-0 self-start shadow-[3px_3px_0_0_#000]">
          <button
            onClick={() => setActiveTab("governo")}
            className={`px-4 py-2 font-black uppercase text-xs transition-colors flex items-center gap-1.5 ${activeTab === "governo" ? "bg-black text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            <BarChart3 className="w-4 h-4" /> Estatísticas e Gráficos
          </button>
          <button
            onClick={() => setActiveTab("auditoria")}
            className={`px-4 py-2 font-black uppercase text-xs transition-colors flex items-center gap-1.5 ${activeTab === "auditoria" ? "bg-black text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            <CheckCircle className="w-4 h-4" /> Aprovação de ONGs ({pending.length})
          </button>
        </div>
      </div>

      {/* ─── TAB 1: GRÁFICOS E METRICAS (GOVERNO) ─── */}
      {activeTab === "governo" && (
        <div className="space-y-8">
          {/* Grid de KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
              <Card key={i} className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000] bg-white overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-gray-400 block">{kpi.title}</span>
                    <span className="font-display text-2xl sm:text-3xl font-black block">{kpi.value}</span>
                  </div>
                  <div className={`w-12 h-12 border-2 border-black flex items-center justify-center ${kpi.color} shadow-[2px_2px_0_0_#000]`}>
                    {kpi.icon}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráficos em Neobrutalismo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Gráfico 1: Regiões com mais Ações */}
            <Card className="border-4 border-black rounded-none bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <CardContent className="p-0 space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-black uppercase flex items-center gap-2">
                    Regiões com Mais Ações Comunitárias
                  </h3>
                  <p className="text-xs font-bold text-gray-500 mt-1">Número acumulado de projetos cadastrados no RN por município.</p>
                </div>

                <div className="space-y-4">
                  {regionsData.map((reg, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-black uppercase">
                        <span>{reg.city}</span>
                        <span>{reg.count} ações</span>
                      </div>
                      <div className="w-full bg-gray-100 border-2 border-black h-8 relative overflow-hidden flex items-center">
                        <div 
                          className={`h-full ${reg.color} border-r-2 border-black transition-all`} 
                          style={{ width: `${reg.percentage}%` }}
                        />
                        <span className="absolute right-3 text-xs font-black text-black z-10">{reg.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico 2: Causas Sociais */}
            <Card className="border-4 border-black rounded-none bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <CardContent className="p-0 space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-black uppercase flex items-center gap-2">
                    Distribuição das Ações Sociais por Causa
                  </h3>
                  <p className="text-xs font-bold text-gray-500 mt-1">Proporção percentual de focos de atuação das instituições.</p>
                </div>

                <div className="space-y-4">
                  {/* Barras Horizontais Empilhadas ou Segmentadas */}
                  <div className="space-y-4">
                    {causesData.map((cause, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-black uppercase">
                          <span>{cause.cause}</span>
                          <span>{cause.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-100 border-2 border-black h-6">
                          <div 
                            className={`h-full ${cause.color} border-r-2 border-black transition-all`} 
                            style={{ width: `${cause.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-4 border-2 border-black border-dashed flex items-start gap-2">
                    <ArrowUpRight className="w-5 h-5 text-accent shrink-0" />
                    <p className="text-xs font-bold text-gray-600">
                      <strong>Destaque Governamental:</strong> A causa de <strong>Alimentação</strong> é a que apresenta maior crescimento no Seridó e Grande Natal neste semestre.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {/* ─── TAB 2: AUDITORIA / APROVAÇÃO ─── */}
      {activeTab === "auditoria" && (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
          {/* COLUNA ESQUERDA: LISTAGEM DE PENDENTES */}
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar ONGs pendentes por nome ou CNPJ..."
                className="pl-10 border-2 border-black h-12 font-bold bg-white"
              />
            </div>

            <div className="grid gap-4">
              {filteredPending.map((inst) => (
                <Card 
                  key={inst.id} 
                  className={`border-4 border-black rounded-none cursor-pointer transition-all shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 ${selectedInst?.id === inst.id ? 'bg-[#fff9e6] border-amber-400' : 'bg-white'}`}
                  onClick={() => setSelectedInst(inst)}
                >
                  <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="font-display text-xl font-black uppercase text-black">{inst.name}</h2>
                      <div className="text-xs font-bold text-gray-500 mt-1 flex flex-wrap gap-3">
                        <span><strong>CNPJ:</strong> {inst.cnpj}</span>
                        <span><strong>Cidade:</strong> {inst.city}</span>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 font-black text-xs uppercase px-2.5 py-1 shrink-0">
                      Aguardando Análise
                    </Badge>
                  </CardContent>
                </Card>
              ))}

              {filteredPending.length === 0 && (
                <div className="p-16 border-4 border-black border-dashed text-center font-black text-gray-500 bg-gray-50">
                  Nenhuma instituição pendente de aprovação encontrada.
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: DETALHES DE AUDITORIA */}
          <aside>
            {selectedInst ? (
              <Card className="border-4 border-black rounded-none shadow-[6px_6px_0_0_#000] bg-white sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="border-b-2 border-black pb-3">
                    <h3 className="font-display text-2xl font-black uppercase">Ficha cadastral</h3>
                    <p className="text-xs font-bold text-gray-500 mt-1">Revise as informações antes de autorizar o cadastro.</p>
                  </div>

                  <div className="space-y-4 text-sm font-bold">
                    <div className="bg-gray-50 p-3 border border-black space-y-1.5">
                      <div className="text-xs text-gray-400 uppercase">Organização</div>
                      <div className="text-base font-black text-black">{selectedInst.name}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 border border-black space-y-1">
                        <div className="text-xs text-gray-400 uppercase">CNPJ</div>
                        <div className="text-xs font-mono text-black">{selectedInst.cnpj}</div>
                      </div>
                      <div className="bg-gray-50 p-3 border border-black space-y-1">
                        <div className="text-xs text-gray-400 uppercase">Cidade</div>
                        <div className="text-xs text-black">{selectedInst.city}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 border border-black space-y-1.5">
                      <div className="text-xs text-gray-400 uppercase">Representante Legal</div>
                      <div className="text-black flex items-center gap-1">
                        <User className="w-4 h-4" /> {selectedInst.representative_name || "Maria Rezende"}
                      </div>
                      {selectedInst.phone && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Phone className="w-3.5 h-3.5" /> {selectedInst.phone}
                        </div>
                      )}
                    </div>

                    {selectedInst.mission && (
                      <div className="bg-gray-50 p-3 border border-black space-y-1">
                        <div className="text-xs text-gray-400 uppercase">Missão</div>
                        <div className="text-xs text-gray-600 font-medium leading-relaxed">{selectedInst.mission}</div>
                      </div>
                    )}
                  </div>

                  {/* Notas de Auditoria */}
                  <div className="space-y-2 pt-2 border-t-2 border-dashed border-gray-100">
                    <label className="text-xs font-black uppercase text-gray-600">Notas de Auditoria Fiscal</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Adicione observações sobre a análise de documentos, alvarás..."
                      rows={3}
                      className="w-full border-2 border-black p-3 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                  </div>

                  {/* Ações */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAction("rejected")}
                      disabled={actionLoading}
                      className="border-2 border-black uppercase font-black text-xs hover:bg-red-50 text-red-700 h-11"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" /> Rejeitar
                    </Button>
                    <Button
                      onClick={() => handleAction("approved")}
                      disabled={actionLoading}
                      className="border-2 border-black bg-black text-white hover:bg-primary hover:text-black uppercase font-black text-xs h-11"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" /> Aprovar ONG
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-4 border-dashed border-black rounded-none bg-gray-50 p-6 text-center text-gray-500 font-bold">
                Selecione uma ONG na lista para exibir a ficha de auditoria.
              </Card>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
