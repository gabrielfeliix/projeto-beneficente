/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getAllProfilesAdmin, promoteUserToRole } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Search, UserCheck, RefreshCw } from "lucide-react";
import { loadStoredProfile } from "@/lib/auth";

export default function AdminPage() {
  const [profile, setProfile] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="text-center font-display text-2xl font-black uppercase py-24">
        Carregando painel do administrador...
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="border-4 border-black p-8 bg-white shadow-[6px_6px_0_0_#000]">
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
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-black pb-8">
        <div>
          <Badge className="mb-3 bg-accent text-white border-2 border-black font-black uppercase">
            Administração Geral
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">
            Controle de Roles & Acessos
          </h1>
          <p className="text-gray-600 font-bold mt-2">
            Gerencie todos os perfis cadastrados, promova fiscais e audite permissões de forma centralizada.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-black text-white p-3 border-2 border-black font-bold text-xs flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Total usuários: {users.length}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="pl-11 h-12 border-4 border-black font-bold"
          />
        </div>

        {/* Users list grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(u => (
            <Card key={u.id} className="border-4 border-black rounded-none bg-white hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 transition-all duration-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
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
                      <><UserCheck className="w-3.5 h-3.5 mr-1" /> Alterar Role</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-16 border-4 border-dashed border-gray-300 text-center text-gray-400 font-bold uppercase">
            Nenhum usuário correspondente aos filtros encontrados.
          </div>
        )}
      </div>
    </div>
  );
}
