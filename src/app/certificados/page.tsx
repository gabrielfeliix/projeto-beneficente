"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Award, ShieldCheck, Search, HelpCircle } from "lucide-react";

export default function CertificadosSearchPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Por favor, informe o código do certificado.");
      return;
    }
    
    setLoading(true);
    // Redirect to dynamic verification page
    router.push(`/certificados/${cleanCode}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-black min-h-[70vh] flex flex-col justify-center">
      <div className="text-center mb-10 space-y-4">
        <Badge className="bg-accent text-white border-2 border-black font-black uppercase text-xs tracking-wider">
          Validador Criptográfico PROVI
        </Badge>
        <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tighter">
          Validação de Certificados
        </h1>
        <p className="font-bold text-gray-600 max-w-xl mx-auto text-base">
          Verifique a autenticidade de horas de impacto social de estudantes, candidatos ou voluntários parceiros da nossa rede no RN.
        </p>
      </div>

      <Card className="border-4 border-black rounded-none shadow-[8px_8px_0_0_#000] bg-white max-w-2xl mx-auto w-full">
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase block text-gray-700">Código de Autenticidade *</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex: LUM-DEMO123 ou LUM-XXXXXXX"
                  className="pl-12 border-2 border-black h-14 text-lg font-bold bg-white uppercase tracking-wider"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-black text-red-600 uppercase bg-red-50 p-2 border-2 border-red-500">
                ⚠️ {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-lg h-14 font-black uppercase border-2 border-black bg-black text-white hover:bg-primary hover:text-black transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]"
            >
              {loading ? "Buscando Registro..." : "Validar e Acessar Certificado"}
            </Button>
          </form>

          <div className="border-t-2 border-dashed border-gray-200 pt-6 space-y-3">
            <h3 className="font-black uppercase text-sm flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent" /> Como funciona?
            </h3>
            <p className="text-xs font-bold text-gray-500 leading-relaxed">
              Todos os voluntários que concluem suas atividades recebem um certificado com identificador alfanumérico único gerado pela plataforma. Empresas e faculdades podem inserir esse código acima para conferir o nome do voluntário, a causa de atuação e a assinatura homologada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
