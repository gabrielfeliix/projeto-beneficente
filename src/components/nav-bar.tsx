"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCurrentProfile, signOut, StoredProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Menu, X, Bell, LayoutDashboard, User, LogOut, Briefcase, Newspaper, Compass, Plus, Shield, Settings } from "lucide-react";

export function NavBar() {
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"warm" | "cold" | "colorblind">("warm");

  useEffect(() => {
    getCurrentProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });

    const saved = localStorage.getItem("lumiar-theme") as "warm" | "cold" | "colorblind" | null;
    if (saved && ["warm", "cold", "colorblind"].includes(saved)) {
      setTheme(saved);
      document.body.className = `theme-${saved}`;
    }
  }, []);

  const changeTheme = (newTheme: "warm" | "cold" | "colorblind") => {
    setTheme(newTheme);
    localStorage.setItem("lumiar-theme", newTheme);
    document.body.className = `theme-${newTheme}`;
  };

  const handleLogout = async () => {
    await signOut();
    setProfile(null);
    setMenuOpen(false);
    window.location.href = "/";
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return "Voluntário";
    switch (role) {
      case "donor": return "Doador";
      case "volunteer": return "Voluntário";
      case "institution": return "ONG";
      case "fiscal": return "Fiscal";
      case "admin": return "Administrador";
      case "company": return "Empresa Assinante";
      default: return "Voluntário";
    }
  };

  const navLinks = [
    { href: "/campaigns", label: "Explorar", icon: <Compass className="w-4 h-4" />, show: true },
    { href: "/vagas", label: "Vagas", icon: <Briefcase className="w-4 h-4" />, show: !!profile },
    { href: "/feed", label: "Feed", icon: <Newspaper className="w-4 h-4" />, show: true },
    { href: "/dashboard", label: "Painel", icon: <LayoutDashboard className="w-4 h-4" />, show: !!profile },
    { href: "/fiscal", label: "Auditoria", icon: <Shield className="w-4 h-4" />, show: profile?.role === "fiscal" || profile?.role === "admin" },
    { href: "/admin", label: "Gerenciar", icon: <Settings className="w-4 h-4" />, show: profile?.role === "admin" },
    { href: "/notificacoes", label: "Notificações", icon: <Bell className="w-4 h-4" />, show: !!profile },
  ];

  const visibleLinks = navLinks.filter(l => l.show);

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-primary shadow-[0_4px_0_0_#000]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
          <img src="/logo-provi.png" alt="PROVI Logo" className="w-14 h-14 object-contain group-hover:-translate-y-0.5 transition-transform shrink-0" />
          <span className="font-display text-2xl font-black uppercase tracking-tighter">PROVI</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-1.5 px-4 py-2 font-bold uppercase text-sm hover:bg-black/10 rounded-none transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* THEME SWITCHER & DESKTOP AUTH */}
        <div className="hidden md:flex items-center gap-4">
          {/* THEME PICKER */}
          <div className="flex items-center gap-1 border-2 border-black p-1 bg-white shadow-[2px_2px_0px_0px_#000000]">
            <button 
              onClick={() => changeTheme("warm")}
              className={`px-2 py-1 text-xs font-black uppercase transition-colors ${theme === "warm" ? "bg-primary text-black animate-pulse" : "hover:bg-gray-100 text-gray-500"}`}
              title="Esquema Quente"
            >
              Quente
            </button>
            <button 
              onClick={() => changeTheme("cold")}
              className={`px-2 py-1 text-xs font-black uppercase transition-colors ${theme === "cold" ? "bg-[#93c5fd] text-black" : "hover:bg-gray-100 text-gray-500"}`}
              title="Esquema Frio"
            >
              Frio
            </button>
            <button 
              onClick={() => changeTheme("colorblind")}
              className={`px-2 py-1 text-xs font-black uppercase transition-colors ${theme === "colorblind" ? "bg-black text-white" : "hover:bg-gray-100 text-gray-500"}`}
              title="Acessível / Contraste"
            >
              Daltonismo
            </button>
          </div>

          {loading ? (
            <div className="h-8 w-24 bg-black/10 animate-pulse" />
          ) : profile ? (
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <div className="font-black text-sm uppercase truncate max-w-[140px]">{profile.name}</div>
                <div className="text-xs font-bold text-black/60">{getRoleLabel(profile.role)}</div>
              </div>
              {profile.role === "institution" ? (
                <Link href="/campaigns/new">
                  <Button size="sm" className="font-black uppercase border-2 border-black bg-black text-primary hover:bg-gray-800">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Campanha
                  </Button>
                </Link>
              ) : (
                <Link href="/perfil">
                  <Button size="sm" variant="outline" className="font-black uppercase border-2 border-black">
                    <User className="w-3.5 h-3.5 mr-1" /> Perfil
                  </Button>
                </Link>
              )}
              <Button size="sm" variant="ghost" onClick={handleLogout} className="font-black border-2 border-black/20 hover:border-black hover:bg-black/10">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="font-black uppercase border-2 border-black">Entrar</Button>
              </Link>
              <Link href="/login?mode=signup">
                <Button size="sm" className="font-black uppercase border-2 border-black bg-black text-primary hover:bg-gray-800">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          className="md:hidden border-2 border-black p-2 hover:bg-black/10 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      {menuOpen && (
        <div className="md:hidden border-t-4 border-black bg-primary animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col py-2">
            {visibleLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 font-black uppercase text-sm border-b-2 border-black/10 hover:bg-black/10 transition-colors">
                {link.icon} {link.label}
              </Link>
            ))}

            <div className="px-6 py-4 border-t-2 border-black mt-2 space-y-4">
              {/* MOBILE THEME PICKER */}
              <div className="space-y-2">
                <div className="text-xs font-black uppercase text-gray-500">Esquema de Cores</div>
                <div className="grid grid-cols-3 gap-2 border-2 border-black p-1 bg-white shadow-[2px_2px_0px_0px_#000000]">
                  <button 
                    onClick={() => changeTheme("warm")}
                    className={`py-2 text-xs font-black uppercase transition-colors ${theme === "warm" ? "bg-primary text-black" : "hover:bg-gray-100 text-gray-500"}`}
                  >
                    Quente
                  </button>
                  <button 
                    onClick={() => changeTheme("cold")}
                    className={`py-2 text-xs font-black uppercase transition-colors ${theme === "cold" ? "bg-[#93c5fd] text-black" : "hover:bg-gray-100 text-gray-500"}`}
                  >
                    Frio
                  </button>
                  <button 
                    onClick={() => changeTheme("colorblind")}
                    className={`py-2 text-xs font-black uppercase transition-colors ${theme === "colorblind" ? "bg-black text-white" : "hover:bg-gray-100 text-gray-500"}`}
                  >
                    Daltonismo
                  </button>
                </div>
              </div>

              {profile ? (
                <div className="space-y-3">
                  <div className="font-black text-lg uppercase">{profile.name}</div>
                  <div className="text-sm font-bold text-black/60">{getRoleLabel(profile.role)}</div>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 font-black uppercase text-sm text-red-700 border-2 border-red-700 px-4 py-2 hover:bg-red-50 w-full justify-center transition-colors">
                    <LogOut className="w-4 h-4" /> Sair da Conta
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full font-black uppercase border-2 border-black bg-black text-primary">Entrar</Button>
                  </Link>
                  <Link href="/login?mode=signup" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-black uppercase border-2 border-black">Criar Conta</Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
