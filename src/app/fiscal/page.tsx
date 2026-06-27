/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getPendingInstitutions, updateInstitutionApproval } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { XCircle, CheckCircle, FileText, Building2, User, Phone, MapPin, Search } from "lucide-react";
import { loadStoredProfile } from "@/lib/auth";

export default function FiscalPage() {
  const [profile, setProfile] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInst, setSelectedInst] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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

  if (loading) {
    return (
      <div className="text-center font-display text-2xl font-black uppercase py-24">
        Carregando painel de auditoria...
      </div>
    );
  }

  if (!profile || (profile.role !== "fiscal" && profile.role !== "admin")) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="border-4 border-black p-8 bg-white shadow-[6px_6px_0_0_#000]">
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter">Acesso Negado</h1>
          <p className="text-gray-600 font-bold mt-4">
            Apenas auditores fiscais ou administradores podem acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  const filtered = pending.filter(inst =>
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.cnpj.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Badge className="mb-3 bg-secondary text-black border-2 border-black font-black uppercase">
            Painel do Fiscal
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">
            Auditoria de ONGs
          </h1>
          <p className="text-gray-600 font-bold mt-2">
            Analise documentos e aprove ou recuse novas organizações na plataforma.
          </p>
        </div>
        <div className="bg-black text-white p-3 border-2 border-black font-bold text-sm">
          Fiscais online: 1 | Pendentes: {pending.length}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_450px]">
        {/* Lista de pendentes */}
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome da ONG ou CNPJ..."
              className="pl-11 h-12 border-4 border-black font-bold"
            />
          </div>

          <div className="space-y-4">
            {filtered.map(inst => (
              <Card
                key={inst.id}
                onClick={() => {
                  setSelectedInst(inst);
                  setNotes("");
                }}
                className={`border-4 border-black rounded-none cursor-pointer transition-all hover:bg-gray-50 ${selectedInst?.id === inst.id ? "bg-primary/20 shadow-[6px_6px_0_0_#000] -translate-y-1" : "bg-white shadow-[4px_4px_0_0_#000]"}`}
              >
                <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5">
                    <h3 className="font-display text-xl font-black uppercase">{inst.name}</h3>
                    <p className="text-sm font-bold text-gray-500 flex items-center gap-1">
                      CNPJ: {inst.cnpj}
                    </p>
                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-black" /> {inst.city} - RN
                    </p>
                  </div>
                  <Button variant="outline" className="border-2 border-black font-black uppercase text-xs">
                    Analisar →
                  </Button>
                </CardContent>
              </Card>
            ))}

            {filtered.length === 0 && (
              <div className="p-12 border-4 border-dashed border-gray-300 text-center text-gray-500 font-bold uppercase">
                Nenhuma ONG pendente de análise no momento.
              </div>
            )}
          </div>
        </div>

        {/* Painel de Ação / Detalhes */}
        <aside>
          {selectedInst ? (
            <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] space-y-6">
              <div className="border-b-2 border-black pb-4">
                <Badge className="bg-primary text-black border-2 border-black font-black uppercase text-xs">
                  ONG sob auditoria
                </Badge>
                <h2 className="font-display text-2xl font-black uppercase mt-2">{selectedInst.name}</h2>
                <p className="text-sm font-bold text-gray-500">{selectedInst.email}</p>
              </div>

              {/* Ficha técnica */}
              <div className="space-y-3 text-sm font-bold">
                <div className="flex gap-2">
                  <Building2 className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-400">CNPJ:</span> {selectedInst.cnpj}
                  </div>
                </div>
                <div className="flex gap-2">
                  <User className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-400">Representante:</span> {selectedInst.representative_name} (CPF: {selectedInst.representative_cpf})
                  </div>
                </div>
                <div className="flex gap-2">
                  <Phone className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-400">Telefone:</span> {selectedInst.phone}
                  </div>
                </div>
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-400">Endereço da sede:</span> {selectedInst.headquarters_address}
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div className="p-4 bg-gray-50 border-2 border-black">
                <h4 className="font-black uppercase text-xs mb-3 text-gray-700">Documentos enviados:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white border border-gray-300 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Estatuto_Social.pdf</span>
                    <span className="text-green-600">Enviado ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white border border-gray-300 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Ata_Eleicao.pdf</span>
                    <span className="text-green-600">Enviado ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white border border-gray-300 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Cartao_CNPJ.pdf</span>
                    <span className="text-green-600">Enviado ✓</span>
                  </div>
                </div>
              </div>

              {/* Justificativa */}
              <div className="space-y-2">
                <label className="font-black uppercase text-xs text-gray-700 block">
                  Notas de auditoria / Justificativa
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Escreva alguma observação ou motivo da recusa..."
                  rows={3}
                  className="w-full border-2 border-black p-3 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black bg-white"
                />
              </div>

              {/* Ações */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button
                  onClick={() => handleAction("rejected")}
                  disabled={actionLoading}
                  variant="outline"
                  className="border-2 border-red-500 text-red-500 hover:bg-red-50 font-black uppercase text-sm h-12"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Recusar
                </Button>
                <Button
                  onClick={() => handleAction("approved")}
                  disabled={actionLoading}
                  className="border-2 border-black bg-black text-white hover:bg-gray-800 font-black uppercase text-sm h-12"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Aprovar ONG
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-4 border-dashed border-gray-300 p-12 text-center text-gray-400 font-bold uppercase rounded-none">
              Selecione uma organização à esquerda para iniciar o processo de auditoria.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
