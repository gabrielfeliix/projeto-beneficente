"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { getAllProfilesAdmin, promoteUserToRole } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Users, Search, UserCheck, RefreshCw, Cpu, Database, Server, Settings, 
  Terminal, ShieldAlert, Sparkles, Play 
} from "lucide-react";
import { loadStoredProfile } from "@/lib/auth";

export default function AdminPage() {
  const [profile, setProfile] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"roles" | "ai">("roles");

  // AI & Infra simulator states
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-pro");
  const [temperature, setTemperature] = useState(0.2);
  const [promptInput, setPromptInput] = useState("Você é um assistente especializado em validar a conformidade de relatórios fiscais de ONGs e emitir certificados...");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const user = loadStoredProfile();
    setProfile(user);

    async function loadData() {
      try {
        const list = await getAllProfilesAdmin();
        setUsers(list);
      } catch (err) {
        console.error("Error loading profiles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePromote = async (userId: string, currentRole: string) => {
    let newRole: "donor" | "volunteer" | "institution" | "fiscal" | "admin" = "volunteer";
    if (currentRole === "volunteer") newRole = "fiscal";
    else if (currentRole === "fiscal") newRole = "admin";
    else newRole = "volunteer";

    setUpdatingId(userId);
    try {
      const ok = await promoteUserToRole(userId, newRole);
      if (ok) {
        alert(`Usuário alterado para o cargo: ${newRole}`);
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, profile_type: newRole } : u))
        );
      } else {
        alert("Erro ao alterar cargo do usuário.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTestAI = () => {
    if (!promptInput.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    
    // Simulate Gemini API processing
    setTimeout(() => {
      setAiResponse(
        `[${selectedModel.toUpperCase()} RESPONSE (TEMP: ${temperature})]\n` +
        `Análise concluída com sucesso! ✓\n` +
        `- Prompt processado: ${promptInput.substring(0, 40)}...\n` +
        `- Conformidade: 98% aprovado.\n` +
        `- Latência: 240ms\n` +
        `- Token count: 1,412 input / 324 output\n` +
        `Estrutura de prompt válida para categorização de ações sociais.`
      );
      setAiLoading(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="text-center font-display text-2xl font-black uppercase py-24 text-black">
        Carregando painel do administrador...
      </div>
    );
  }

  // Admin access validation
  if (!profile || profile.role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 text-black">
        <div className="border-4 border-black p-8 bg-white shadow-[6px_6px_0_0_#000]">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter">Acesso Negado</h1>
          <p className="text-gray-600 font-bold mt-4">
            Apenas administradores gerais da plataforma podem acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-black">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-8">
        <div>
          <Badge className="mb-3 bg-accent text-white border-2 border-black font-black uppercase">
            Administração Geral
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">
            Painel do Administrador Geral
          </h1>
          <p className="text-gray-600 font-bold mt-2">
            Manutenção do sistema, controle de acesso, auditoria de dados e configuração de IA.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-4 border-black p-1 bg-white shadow-[3px_3px_0_0_#000]">
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 font-black uppercase text-xs transition-colors flex items-center gap-1.5 ${activeTab === "roles" ? "bg-black text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            <Users className="w-4 h-4" /> Roles & Acessos
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 font-black uppercase text-xs transition-colors flex items-center gap-1.5 ${activeTab === "ai" ? "bg-black text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            <Cpu className="w-4 h-4" /> IA & Infraestrutura
          </button>
        </div>
      </div>

      {/* ─── TAB 1: ROLES & ACESSOS ─── */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="pl-11 h-12 border-2 border-black font-bold bg-white"
              />
            </div>
            <div className="bg-primary/20 border-2 border-black p-3 font-bold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-black" /> Total de Usuários Cadastrados: {users.length}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(u => (
              <Card key={u.id} className="border-4 border-black rounded-none bg-white hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 transition-all duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-display text-lg font-black uppercase leading-tight truncate max-w-[180px]">{u.name || "Sem Nome"}</h3>
                      <p className="text-xs font-bold text-gray-500 truncate max-w-[180px]">{u.email}</p>
                    </div>
                    <Badge className={`border-2 border-black font-black uppercase text-xs ${
                      u.profile_type === "admin" ? "bg-accent text-white" :
                      u.profile_type === "fiscal" ? "bg-secondary text-black" :
                      u.profile_type === "institution" ? "bg-primary text-black" :
                      "bg-white text-black"
                    }`}>
                      {u.profile_type}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t-2 border-gray-100 flex items-center justify-between gap-2">
                    <div className="text-xs font-bold text-gray-400">
                      ID: <code className="bg-gray-100 px-1 rounded-sm">{u.id.substring(0, 8)}</code>
                    </div>
                    <Button
                      size="sm"
                      disabled={updatingId === u.id || u.profile_type === "admin"}
                      onClick={() => handlePromote(u.id, u.profile_type)}
                      className="border-2 border-black bg-black text-white hover:bg-gray-800 text-xs font-black uppercase"
                    >
                      {updatingId === u.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <><UserCheck className="w-3.5 h-3.5 mr-1" /> Alterar Cargo</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="p-16 border-4 border-dashed border-gray-300 text-center text-gray-400 font-bold uppercase">
              Nenhum usuário correspondente aos filtros encontrado.
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: IA & INFRAESTRUTURA ─── */}
      {activeTab === "ai" && (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Coluna Esquerda: Status do Sistema & Infraestrutura */}
          <div className="space-y-6">
            <Card className="border-4 border-black rounded-none bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <CardContent className="p-0 space-y-6">
                <h3 className="font-display text-2xl font-black uppercase flex items-center gap-2 border-b-2 border-black pb-3">
                  <Server className="w-6 h-6 text-accent" /> Status de Infraestrutura
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border-2 border-black p-3 bg-green-50 text-center">
                    <Database className="w-5 h-5 mx-auto text-green-600 mb-1" />
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Banco PostgreSQL</span>
                    <span className="text-xs font-black text-green-700">CONECTADO ✓</span>
                  </div>
                  <div className="border-2 border-black p-3 bg-green-50 text-center">
                    <Server className="w-5 h-5 mx-auto text-green-600 mb-1" />
                    <span className="text-[10px] font-black uppercase text-gray-400 block">API Gateway</span>
                    <span className="text-xs font-black text-green-700">42ms LATÊNCIA</span>
                  </div>
                  <div className="border-2 border-black p-3 bg-green-50 text-center">
                    <Cpu className="w-5 h-5 mx-auto text-green-600 mb-1" />
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Storage Bucket</span>
                    <span className="text-xs font-black text-green-700">ATIVO ✓</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm font-bold pt-2">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 uppercase text-xs">Versão do Next.js:</span>
                    <span>v15.5.19 (Vercel)</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 uppercase text-xs">Supabase Client:</span>
                    <span>v2.108.2</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 uppercase text-xs">Limite de Armazenamento:</span>
                    <span>14.2 GB / 50.0 GB (28%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-black rounded-none bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <CardContent className="p-0 space-y-4">
                <h3 className="font-display text-2xl font-black uppercase flex items-center gap-2 border-b-2 border-black pb-3">
                  <Settings className="w-6 h-6 text-secondary" /> Configurações de Modelagem de IA
                </h3>

                <div className="space-y-4 font-bold">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-600 block">Modelo Ativo do Gemini</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full h-11 border-2 border-black bg-white px-2 text-sm font-black uppercase"
                    >
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recomendado - Alto Raciocínio)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Rápido / Baixa Latência)</option>
                      <option value="gemini-2.0-experimental">Gemini 2.0 experimental</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase text-gray-600">
                      <span>Temperatura</span>
                      <span>{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 border border-black rounded-none appearance-none cursor-pointer accent-black"
                    />
                    <span className="text-[10px] text-gray-400 block leading-tight font-medium">
                      Valores menores de temperatura produzem respostas mais precisas e estruturadas (ideal para auditoria).
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita: Editor de Prompts & Testes */}
          <div className="space-y-6">
            <Card className="border-4 border-black rounded-none bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <CardContent className="p-0 space-y-4">
                <h3 className="font-display text-2xl font-black uppercase flex items-center gap-2 border-b-2 border-black pb-3">
                  <Terminal className="w-6 h-6 text-primary" /> Prompt Base do Sistema (Auditor IA)
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-600 block">Diretrizes do Agente</label>
                    <textarea
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      rows={5}
                      className="w-full border-2 border-black p-3 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                  </div>

                  <Button
                    onClick={handleTestAI}
                    disabled={aiLoading}
                    className="w-full font-black uppercase border-2 border-black bg-black text-white hover:bg-primary hover:text-black flex items-center justify-center gap-1.5"
                  >
                    {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                    Testar Pipeline de Prompts
                  </Button>

                  {aiResponse && (
                    <div className="space-y-2 pt-2 border-t-2 border-dashed border-gray-100">
                      <span className="text-xs font-black uppercase text-gray-600 block">Console de Resposta da IA</span>
                      <pre className="w-full border-2 border-black bg-gray-900 text-green-400 p-4 font-mono text-xs overflow-x-auto leading-relaxed shadow-[inner_2px_2px_4px_rgba(0,0,0,0.4)] whitespace-pre-wrap">
                        {aiResponse}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
