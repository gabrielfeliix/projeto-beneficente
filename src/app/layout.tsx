import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";

export const metadata: Metadata = {
  title: "PROVI — Voluntariado e Impacto Social",
  description: "A maior plataforma de conexão entre voluntários e ONGs do Rio Grande do Norte. Encontre vagas, apoie campanhas e faça a diferença.",
  keywords: ["voluntariado", "ONG", "impacto social", "Rio Grande do Norte", "Natal", "doação"],
  openGraph: {
    title: "PROVI — Voluntariado e Impacto Social",
    description: "Conectando voluntários com organizações sociais no RN.",
    type: "website",
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
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo-provi.png" alt="PROVI Logo" className="w-12 h-12 object-contain shrink-0" />
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
              <ul className="space-y-2 text-sm font-bold text-gray-400">
                <li><span className="text-gray-500">📧</span> contato@mutirao.org.br</li>
                <li><span className="text-gray-500">📍</span> Natal — Rio Grande do Norte</li>
                <li><span className="text-gray-500">🕐</span> Respondemos em até 24h</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              © 2026 PROVI Plataforma. Todos os direitos reservados.
            </p>
            <p className="text-xs font-bold text-gray-600">
              Feito com 💛 para o RN
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
