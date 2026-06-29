"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { getApplicationsForVolunteer } from "@/actions/platform";
import { loadStoredProfile } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function CandidaturasPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, { sender: string; text: string; time: string }[]>>({});
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const loaded = loadStoredProfile();
    const volunteerId = loaded?.id || "vol-1";

    getApplicationsForVolunteer(volunteerId).then((list) => {
      setApplications(list);

      // Inicializa histórico de conversas simuladas
      const initialChats: Record<string, any[]> = {};
      list.forEach((app) => {
        initialChats[app.id] = [
          { sender: "volunteer", text: app.message, time: "10:30" },
          { sender: "institution", text: `Olá, ${app.volunteerName}! Recebemos sua candidatura. Vamos alinhar os detalhes por aqui?`, time: "11:00" },
        ];
      });
      setChatMessages(initialChats);
      setLoading(false);
    });
  }, []);

  const handleSendMessage = (appId: string) => {
    if (!newMessage.trim()) return;
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    setChatMessages((prev) => ({
      ...prev,
      [appId]: [
        ...(prev[appId] || []),
        { sender: "volunteer", text: newMessage.trim(), time },
      ],
    }));

    const textSent = newMessage.trim();
    setNewMessage("");

    // Resposta automática simulada após 1.2 segundos
    setTimeout(() => {
      setChatMessages((prev) => ({
        ...prev,
        [appId]: [
          ...(prev[appId] || []),
          { sender: "institution", text: `Perfeito! Vou verificar com a nossa equipe de coordenação e te dou um retorno em breve sobre o seu ponto: "${textSent.length > 30 ? textSent.substring(0, 30) + "..." : textSent}"`, time },
        ],
      }));
    }, 1200);
  };

  if (loading) {
    return (
      <div className="py-24 text-center font-display text-2xl font-black uppercase text-black">
        Carregando Candidaturas...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-black">
      <div className="mb-10">
        <Badge className="mb-4 bg-accent text-white border-2 border-black">Candidaturas</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Minhas candidaturas</h1>
        <p className="text-gray-600 font-bold mt-3 max-w-3xl">Acompanhe o status das vagas às quais você se candidatou e converse com os gestores.</p>
      </div>

      <div className="grid gap-6">
        {applications.map((application) => (
          <Card key={application.id} className="border-4 border-black rounded-none shadow-[6px_6px_0_0_#000] bg-white">
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-start border-b-2 border-dashed border-gray-200 pb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={`uppercase font-black border-2 border-black ${application.status === 'selected' ? 'bg-primary text-black' : application.status === 'rejected' ? 'bg-destructive text-white' : 'bg-white text-black'}`}>
                      {application.status.toUpperCase()}
                    </Badge>
                    <h2 className="font-display text-2xl font-black uppercase">{application.jobTitle}</h2>
                  </div>
                  <p className="text-gray-700 mt-4 font-semibold">{application.message}</p>
                  <div className="mt-4 text-xs font-bold text-gray-500 space-y-1">
                    <p><strong>Publicado por:</strong> {application.institutionName}</p>
                    <p><strong>Enviado em:</strong> {new Date(application.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                  <Button 
                    className="uppercase tracking-wider font-black border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-all"
                    onClick={() => setActiveChatId(activeChatId === application.id ? null : application.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {activeChatId === application.id ? "Fechar Chat" : "Conversar"}
                  </Button>
                </div>
              </div>

              {/* AREA DE CHAT INTERNO */}
              {activeChatId === application.id && (
                <div className="mt-6 space-y-4 bg-gray-50 p-4 border-2 border-black shadow-[3px_3px_0_0_#000]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-2">
                    <div className="font-bold text-sm uppercase">
                      Representante:{" "}
                      <Link 
                        href={`/perfil?id=${application.institutionId}`} 
                        className="text-accent hover:underline font-black hover:bg-accent/10 px-1 border border-transparent hover:border-accent"
                      >
                        {application.institutionName}
                      </Link>
                    </div>
                    <span className="text-xs font-black uppercase text-gray-400">Mensagens Criptografadas</span>
                  </div>

                  <div className="h-64 overflow-y-auto border-2 border-black p-4 bg-white space-y-3 flex flex-col">
                    {(chatMessages[application.id] || []).map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.sender === "volunteer" ? "items-end" : "items-start"}`}>
                        <div className={`p-2.5 max-w-[80%] font-bold text-sm shadow-[2px_2px_0_0_#000] border-2 border-black ${msg.sender === "volunteer" ? "bg-primary text-black" : "bg-secondary text-black"}`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-wider">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite uma mensagem para o coordenador da ONG..."
                      className="border-2 border-black h-11 bg-white font-bold"
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage(application.id)}
                    />
                    <Button 
                      className="border-2 border-black bg-black text-white hover:bg-primary hover:text-black font-black uppercase h-11"
                      onClick={() => handleSendMessage(application.id)}
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {applications.length === 0 && (
          <div className="p-16 border-4 border-black border-dashed text-center font-black text-gray-500 uppercase tracking-wider bg-gray-50 shadow-[4px_4px_0_0_#000]">
            Você ainda não fez nenhuma candidatura. Explore vagas e candidate-se agora mesmo.
          </div>
        )}
      </div>
    </div>
  );
}
