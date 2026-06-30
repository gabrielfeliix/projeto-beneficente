import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "PROVI",
  description: "A maior plataforma de conexão voluntária, auditoria de ONGs e rastreabilidade de impacto social do Rio Grande do Norte. Acompanhe a prestação de contas, fiscalização de projetos e doações em tempo real.",
  keywords: [
    "voluntariado",
    "ONG",
    "transparência social",
    "auditoria de ONGs",
    "Rio Grande do Norte",
    "prestação de contas",
    "doações rastreáveis",
    "impacto social",
    "Natal RN",
    "portal da transparência"
  ],
  openGraph: {
    title: "PROVI",
    description: "Conectando voluntários e ONGs com total transparência, rastreabilidade de doações e auditoria fiscal no Rio Grande do Norte.",
    type: "website",
    images: [
      {
        url: "/logo-provi.png",
        width: 800,
        height: 600,
        alt: "PROVI Logo",
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen flex flex-col bg-background">
        <NavBar />

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t-4 border-black bg-black text-white py-12 px-6 mt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo white.png" alt="PROVI Logo" className="w-[58px] h-[58px] object-contain shrink-0" />
                <span className="font-display text-2xl font-black uppercase tracking-tighter">PROVI</span>
              </div>
              <p className="text-gray-400 font-bold text-sm leading-relaxed">
                A plataforma de voluntariado e impacto social do Rio Grande do Norte. Conectando pessoas e organizações para transformar comunidades.
              </p>
            </div>
            <div>
              <h3 className="font-black uppercase text-sm mb-4 tracking-widest text-primary">Navegação</h3>
              <ul className="space-y-2 text-sm font-bold text-gray-400">
                <li><Link href="/campaigns" className="hover:text-white transition-colors">Explorar Campanhas</Link></li>
                <li><Link href="/vagas" className="hover:text-white transition-colors">Vagas de Voluntariado</Link></li>
                <li><Link href="/feed" className="hover:text-white transition-colors">Feed da Comunidade</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Entrar / Cadastrar</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-black uppercase text-sm mb-4 tracking-widest text-primary">Informações</h3>
              <ul className="space-y-4 text-sm font-bold text-gray-400 mt-2">
                <li className="flex items-center gap-3 hover:text-white transition-colors">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span>contato@mutirao.org.br</span>
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <span>Natal — Rio Grande do Norte</span>
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <span>Respondemos em até 24h</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              © 2026 PROVI Plataforma. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
