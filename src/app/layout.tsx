import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Mutirão - Ação e Transparência",
  description: "Plataforma de Visibilidade para Projetos Sociais no Rio Grande do Norte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-primary px-4 py-3 sm:px-6 lg:px-8 brutalist-shadow-bottom">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-black text-white p-1.5 brutalist-border group-hover:-translate-y-1 transition-transform">
                <Heart size={24} className="fill-current text-secondary" />
              </div>
              <span className="font-display text-2xl font-black uppercase tracking-tighter">Mutirão</span>
            </Link>
            
            <nav className="hidden md:flex gap-6 font-bold">
              <Link href="/" className="hover:underline decoration-2 underline-offset-4">Explorar</Link>
              <Link href="/dashboard" className="hover:underline decoration-2 underline-offset-4">Minhas Campanhas</Link>
            </nav>

            <div className="flex gap-4">
              <Link href="/campaigns/new">
                <Button variant="secondary" className="hidden sm:inline-flex border-2 border-border">Criar Campanha</Button>
              </Link>
              <Button variant="outline" className="bg-white">Login</Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t-2 border-border bg-black text-white py-12 px-6 mt-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Heart size={24} className="text-primary fill-current" />
              <span className="font-display text-2xl font-black uppercase tracking-tighter">Mutirão</span>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-8">© 2026 MUTIRÃO PLATAFORMA. TODOS OS DIREITOS RESERVADOS.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
