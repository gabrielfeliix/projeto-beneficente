"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { saveStoredProfile } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Eye, EyeOff, Sparkles, User, Building2, ArrowLeft, CheckCircle } from "lucide-react";

/* ─────────── CPF / CNPJ ─────────── */
function validateCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += +c[i] * (10 - i);
  let r = 11 - (s % 11);
  if (r >= 10) r = 0;
  if (r !== +c[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += +c[i] * (11 - i);
  r = 11 - (s % 11);
  if (r >= 10) r = 0;
  return r === +c[10];
}

function validateCNPJ(cnpj: string): boolean {
  const c = cnpj.replace(/\D/g, "");
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const calc = (n: string, w: number[]) =>
    w.reduce((s, wi, i) => s + +n[i] * wi, 0);
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(c, w1) % 11;
  const d2 = calc(c, w2) % 11;
  return +c[12] === (d1 < 2 ? 0 : 11 - d1) && +c[13] === (d2 < 2 ? 0 : 11 - d2);
}

function formatCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, a, b, c, e) =>
    e ? `${a}.${b}.${c}-${e}` : c ? `${a}.${b}.${c}` : b ? `${a}.${b}` : a
  );
}

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_, a, b, c, e, f) =>
    f ? `${a}.${b}.${c}/${e}-${f}` : e ? `${a}.${b}.${c}/${e}` : c ? `${a}.${b}.${c}` : b ? `${a}.${b}` : a
  );
}

/* ─────────── Demo users (fallback offline) ─────────── */
const demoUsers = [
  { id: "vol-1", profileType: "volunteer" as const, name: "Ana Beatriz", email: "ana.beatriz@email.com", password: "demo123" },
  { id: "vol-2", profileType: "volunteer" as const, name: "Lucas Mendes", email: "lucas.mendes@email.com", password: "demo123" },
  { id: "inst-1", profileType: "institution" as const, name: "Instituto Água Viva", email: "contato@aguaviva.org", password: "demo123" },
  { id: "inst-2", profileType: "institution" as const, name: "ONG Mãos que Ajudam", email: "contato@maosqueajudam.org", password: "demo123" },
];

/* ─────────── Main component ─────────── */
function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"auth" | "profile">("auth");
  const [profileType, setProfileType] = useState<"volunteer" | "institution">("volunteer");
  const [userId, setUserId] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Volunteer step 2
  const [volCpf, setVolCpf] = useState("");
  const [volBirth, setVolBirth] = useState("");
  const [volPhone, setVolPhone] = useState("");
  const [volAddress, setVolAddress] = useState("");
  const [volProfession, setVolProfession] = useState("");
  const [volAvailability, setVolAvailability] = useState("");
  const [volSkills, setVolSkills] = useState("");
  const [volTerms, setVolTerms] = useState(false);

  // Institution step 2
  const [instCnpj, setInstCnpj] = useState("");
  const [instPhone, setInstPhone] = useState("");
  const [instAddress, setInstAddress] = useState("");
  const [instMission, setInstMission] = useState("");
  const [instRepName, setInstRepName] = useState("");
  const [instRepCpf, setInstRepCpf] = useState("");
  const [instTerms, setInstTerms] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") setTab("signup");
  }, [searchParams]);

  /* ── Handle CNPJ autofill ── */
  const handleCnpjBlur = async () => {
    const clean = instCnpj.replace(/\D/g, "");
    if (clean.length !== 14 || !validateCNPJ(clean)) return;
    setCnpjLoading(true);
    try {
      const res = await fetch(`https://publica.cnpj.ws/cnpj/${clean}`);
      if (res.ok) {
        const d = await res.json();
        if (d?.razao_social) setSignupName(d.razao_social);
        if (d?.estabelecimento) {
          const e = d.estabelecimento;
          if (e.ddd1 && e.telefone1) setInstPhone(`(${e.ddd1}) ${e.telefone1}`);
          const parts = [e.tipo_logradouro, e.logradouro, e.numero, e.bairro, e.cidade?.nome, e.estado?.sigla].filter(Boolean);
          if (parts.length > 2) setInstAddress(parts.join(", "));
        }
      }
    } catch {
      // Fallback silencioso
    } finally {
      setCnpjLoading(false);
    }
  };

  /* ── LOGIN ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
        if (err) throw err;
        if (data.user) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
          if (!profile) {
            // Usuário existe no auth mas não tem perfil — redireciona para completar
            setUserId(data.user.id);
            setSignupName(data.user.email?.split("@")[0] || "");
            setSignupEmail(data.user.email || "");
            setStep("profile");
            setLoading(false);
            return;
          }
          saveStoredProfile({ id: profile.id, profileType: profile.profile_type, name: profile.name, email: profile.email, avatarUrl: profile.avatar_url });
        }
      } else {
        const found = demoUsers.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPassword);
        if (!found) throw new Error("Credenciais inválidas. Use um dos e-mails demo abaixo.");
        saveStoredProfile({ id: found.id, profileType: found.profileType, name: found.name, email: found.email });
      }
      setSuccess("Login efetuado! Redirecionando...");
      setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao efetuar login.";
      setError(msg);
    } finally { setLoading(false); }
  };

  /* ── SIGNUP STEP 1 ── */
  const handleSignupStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (!signupName.trim()) throw new Error("Nome é obrigatório.");
      if (!signupEmail.trim()) throw new Error("E-mail é obrigatório.");
      if (signupPassword.length < 6) throw new Error("A senha deve ter no mínimo 6 caracteres.");

      if (isSupabaseConfigured && supabase) {
        const { data, error: err } = await supabase.auth.signUp({
          email: signupEmail,
          password: signupPassword,
          options: { data: { name: signupName } },
        });

        if (err) {
          // Email rate limit: orientar o usuário
          if (err.message.toLowerCase().includes("rate limit") || err.message.toLowerCase().includes("email rate")) {
            throw new Error("Limite de e-mails de confirmação atingido. Aguarde alguns minutos e tente novamente, ou use um e-mail diferente.");
          }
          if (err.message.toLowerCase().includes("already registered") || err.message.toLowerCase().includes("user already")) {
            throw new Error("Este e-mail já está cadastrado. Faça login ou use a opção 'Esqueci minha senha'.");
          }
          throw err;
        }
        if (data.user) setUserId(data.user.id);
        else setUserId("local-" + Date.now());
      } else {
        setUserId("local-" + Date.now());
      }

      setStep("profile");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro no cadastro.";
      setError(msg);
    } finally { setLoading(false); }
  };

  /* ── SIGNUP STEP 2 ── */
  const handleSignupStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (profileType === "volunteer") {
        if (!volCpf.trim()) throw new Error("CPF é obrigatório.");
        if (!validateCPF(volCpf)) throw new Error("CPF inválido.");
        if (!volBirth) throw new Error("Data de nascimento é obrigatória.");
        if (!volPhone.trim()) throw new Error("Telefone é obrigatório.");
        if (!volAddress.trim()) throw new Error("Endereço é obrigatório.");
        if (!volTerms) throw new Error("Aceite os termos para continuar.");

        if (isSupabaseConfigured && supabase) {
          const { error: dbErr } = await supabase.from("profiles").upsert({
            id: userId, name: signupName, email: signupEmail, profile_type: "volunteer",
            cpf: volCpf, birth_date: volBirth, phone: volPhone, address: volAddress,
            profession: volProfession, availability: volAvailability,
            skills: volSkills.split(",").map(s => s.trim()).filter(Boolean),
            accepted_terms: volTerms, city: "Não informada", neighborhood: "Não informado",
          });
          if (dbErr) {
            if (dbErr.message.includes("row-level security")) throw new Error("Permissão negada. Verifique as políticas de segurança no Supabase (RLS na tabela profiles).");
            throw dbErr;
          }
        }
        saveStoredProfile({ id: userId, profileType: "volunteer", name: signupName, email: signupEmail });
      } else {
        if (!instCnpj.trim()) throw new Error("CNPJ é obrigatório.");
        if (!validateCNPJ(instCnpj)) throw new Error("CNPJ inválido.");
        if (!instRepName.trim()) throw new Error("Nome do representante é obrigatório.");
        if (!instAddress.trim()) throw new Error("Endereço da sede é obrigatório.");
        if (!instTerms) throw new Error("Confirme os dados para continuar.");

        if (isSupabaseConfigured && supabase) {
          const { error: dbErr } = await supabase.from("profiles").upsert({
            id: userId, name: signupName, email: signupEmail, profile_type: "institution",
            cnpj: instCnpj, phone: instPhone, headquarters_address: instAddress,
            mission: instMission, representative_name: instRepName,
            representative_cpf: instRepCpf, accepted_terms: instTerms,
            city: "Não informada", neighborhood: "Não informado",
          });
          if (dbErr) {
            if (dbErr.message.includes("row-level security")) throw new Error("Permissão negada. Configure as políticas RLS no Supabase para a tabela profiles.");
            throw dbErr;
          }
        }
        saveStoredProfile({ id: userId, profileType: "institution", name: signupName, email: signupEmail });
      }

      setSuccess("Cadastro realizado com sucesso! Bem-vindo(a) ao Mutirão.");
      setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar perfil.";
      setError(msg);
    } finally { setLoading(false); }
  };

  /* ─────────── RENDER STEP 2 ─────────── */
  if (step === "profile") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => { setStep("auth"); setError(""); }} className="flex items-center gap-2 font-bold text-sm uppercase mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="mb-8">
          <Badge className="mb-3 bg-accent text-white border-2 border-black">Passo 2 de 2</Badge>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter">Complete seu Perfil</h1>
          <p className="text-gray-600 font-bold mt-2">Essas informações são necessárias para participar da plataforma.</p>
        </div>

        {/* Seletor de tipo (apenas para novos cadastros) */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button type="button" onClick={() => setProfileType("volunteer")}
            className={`py-4 font-black uppercase border-4 flex items-center justify-center gap-2 transition-all ${profileType === "volunteer" ? "bg-black text-white border-black" : "bg-white border-gray-300 hover:border-black"}`}>
            <User className="w-5 h-5" /> Voluntário
          </button>
          <button type="button" onClick={() => setProfileType("institution")}
            className={`py-4 font-black uppercase border-4 flex items-center justify-center gap-2 transition-all ${profileType === "institution" ? "bg-black text-white border-black" : "bg-white border-gray-300 hover:border-black"}`}>
            <Building2 className="w-5 h-5" /> ONG / Instituição
          </button>
        </div>

        {error && <div className="border-4 border-red-500 bg-red-50 p-4 font-bold text-red-700 mb-6">⚠️ {error}</div>}
        {success && <div className="border-4 border-green-500 bg-green-50 p-4 font-bold text-green-700 mb-6 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> {success}</div>}

        {profileType === "volunteer" ? (
          <form onSubmit={handleSignupStep2} className="space-y-5 bg-white border-4 border-black p-8 shadow-[6px_6px_0_0_#000]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">CPF *</label>
                <Input value={volCpf} onChange={e => setVolCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" className="border-2 border-black h-11" />
                {volCpf.replace(/\D/g,"").length === 11 && (
                  <span className={`text-xs font-bold mt-1 ${validateCPF(volCpf) ? "text-green-600" : "text-red-600"}`}>
                    {validateCPF(volCpf) ? "✓ CPF válido" : "✗ CPF inválido"}
                  </span>
                )}
              </div>
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Data de Nascimento *</label>
                <Input type="date" value={volBirth} onChange={e => setVolBirth(e.target.value)} className="border-2 border-black h-11" />
              </div>
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Telefone / WhatsApp *</label>
                <Input value={volPhone} onChange={e => setVolPhone(e.target.value)} placeholder="(84) 99999-0000" className="border-2 border-black h-11" />
              </div>
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Profissão</label>
                <Input value={volProfession} onChange={e => setVolProfession(e.target.value)} placeholder="Ex: Professor, Designer..." className="border-2 border-black h-11" />
              </div>
            </div>
            <div>
              <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Endereço Completo *</label>
              <Input value={volAddress} onChange={e => setVolAddress(e.target.value)} placeholder="Rua, número, bairro, cidade" className="border-2 border-black h-11" />
            </div>
            <div>
              <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Disponibilidade de Horários</label>
              <Input value={volAvailability} onChange={e => setVolAvailability(e.target.value)} placeholder="Ex: Fins de semana, Manhãs..." className="border-2 border-black h-11" />
            </div>
            <div>
              <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Habilidades (separadas por vírgula)</label>
              <Input value={volSkills} onChange={e => setVolSkills(e.target.value)} placeholder="Ex: Design, Culinária, Tecnologia" className="border-2 border-black h-11" />
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={volTerms} onChange={e => setVolTerms(e.target.checked)} className="w-5 h-5 mt-0.5 accent-black border-2 border-black" />
              <span className="text-sm font-bold">Aceito os termos de uso e a política de privacidade da plataforma Mutirão.</span>
            </label>
            <Button type="submit" disabled={loading} size="lg" className="w-full h-14 font-black uppercase text-lg bg-black text-white hover:bg-gray-800">
              {loading ? "Salvando..." : "Criar minha conta de voluntário"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignupStep2} className="space-y-5 bg-white border-4 border-black p-8 shadow-[6px_6px_0_0_#000]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">CNPJ *</label>
                <div className="relative">
                  <Input value={instCnpj} onChange={e => setInstCnpj(formatCNPJ(e.target.value))} onBlur={handleCnpjBlur} placeholder="00.000.000/0001-00" className="border-2 border-black h-11" />
                  {cnpjLoading && <span className="absolute right-3 top-3 text-xs text-gray-500 font-bold animate-pulse">Buscando...</span>}
                </div>
                {instCnpj.replace(/\D/g,"").length === 14 && (
                  <span className={`text-xs font-bold mt-1 ${validateCNPJ(instCnpj) ? "text-green-600" : "text-red-600"}`}>
                    {validateCNPJ(instCnpj) ? "✓ CNPJ válido" : "✗ CNPJ inválido"}
                  </span>
                )}
              </div>
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Telefone</label>
                <Input value={instPhone} onChange={e => setInstPhone(e.target.value)} placeholder="(84) 3333-0000" className="border-2 border-black h-11" />
              </div>
            </div>
            <div>
              <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Endereço da Sede *</label>
              <Input value={instAddress} onChange={e => setInstAddress(e.target.value)} placeholder="Av. Principal, 123, Bairro, Cidade" className="border-2 border-black h-11" />
            </div>
            <div>
              <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Missão da Organização</label>
              <textarea value={instMission} onChange={e => setInstMission(e.target.value)} rows={3}
                placeholder="Descreva a missão e os objetivos da sua organização..."
                className="w-full border-2 border-black p-3 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Nome do Representante Legal *</label>
                <Input value={instRepName} onChange={e => setInstRepName(e.target.value)} placeholder="Nome completo" className="border-2 border-black h-11" />
              </div>
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">CPF do Representante</label>
                <Input value={instRepCpf} onChange={e => setInstRepCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" className="border-2 border-black h-11" />
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={instTerms} onChange={e => setInstTerms(e.target.checked)} className="w-5 h-5 mt-0.5 accent-black border-2 border-black" />
              <span className="text-sm font-bold">Confirmo que os dados fornecidos são verídicos e aceito os termos da plataforma Mutirão.</span>
            </label>
            <Button type="submit" disabled={loading} size="lg" className="w-full h-14 font-black uppercase text-lg bg-black text-white hover:bg-gray-800">
              {loading ? "Salvando..." : "Cadastrar minha organização"}
            </Button>
          </form>
        )}
      </div>
    );
  }

  /* ─────────── RENDER STEP 1 ─────────── */
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <Badge className="mb-4 bg-accent text-white border-2 border-black flex items-center gap-1.5 w-fit mx-auto">
          <Sparkles className="w-3.5 h-3.5" /> Plataforma de Impacto Social
        </Badge>
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter">
          {tab === "login" ? "Entrar" : "Criar Conta"}
        </h1>
        <p className="text-gray-600 font-bold mt-3">
          {tab === "login" ? "Acesse seus projetos e candidaturas." : "Junte-se à maior rede de voluntariado."}
        </p>
      </div>

      {/* Abas */}
      <div className="flex border-4 border-black mb-8 shadow-[4px_4px_0_0_#000]">
        <button onClick={() => { setTab("login"); setError(""); }}
          className={`flex-1 py-4 font-display text-lg font-black uppercase transition-colors border-r-4 border-black ${tab === "login" ? "bg-primary text-black" : "bg-white hover:bg-gray-50"}`}>
          Entrar
        </button>
        <button onClick={() => { setTab("signup"); setError(""); }}
          className={`flex-1 py-4 font-display text-lg font-black uppercase transition-colors ${tab === "signup" ? "bg-primary text-black" : "bg-white hover:bg-gray-50"}`}>
          Cadastrar-se
        </button>
      </div>

      <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0_0_#000]">
        {error && <div className="border-4 border-red-500 bg-red-50 p-4 font-bold text-red-700 mb-6">⚠️ {error}</div>}
        {success && <div className="border-4 border-green-500 bg-green-50 p-4 font-bold text-green-700 mb-6 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> {success}</div>}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="font-bold uppercase text-sm text-gray-700 block mb-1">E-mail</label>
              <Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="seu@email.com" required className="h-12 border-2 border-black" />
            </div>
            <div>
              <label className="font-bold uppercase text-sm text-gray-700 block mb-1">Senha</label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Sua senha" required={isSupabaseConfigured} className="h-12 border-2 border-black pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-500">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isSupabaseConfigured && (
              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 text-sm font-bold space-y-1">
                <p className="uppercase text-yellow-700">💡 Modo Demonstração</p>
                <p>Voluntário: <code className="bg-yellow-100 px-1">ana.beatriz@email.com</code> / <code className="bg-yellow-100 px-1">demo123</code></p>
                <p>ONG: <code className="bg-yellow-100 px-1">contato@aguaviva.org</code> / <code className="bg-yellow-100 px-1">demo123</code></p>
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full h-14 uppercase font-black text-lg bg-black text-white hover:bg-gray-800">
              {loading ? "Entrando..." : "Entrar na Plataforma"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignupStep1} className="space-y-5">
            {/* Tipo de perfil */}
            <div>
              <label className="font-bold uppercase text-sm text-gray-700 block mb-2">Sou um(a)</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setProfileType("volunteer")}
                  className={`py-3 font-black uppercase border-4 flex items-center justify-center gap-2 transition-all ${profileType === "volunteer" ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:border-black"}`}>
                  <User className="w-4 h-4" /> Voluntário
                </button>
                <button type="button" onClick={() => setProfileType("institution")}
                  className={`py-3 font-black uppercase border-4 flex items-center justify-center gap-2 transition-all ${profileType === "institution" ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:border-black"}`}>
                  <Building2 className="w-4 h-4" /> ONG
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold uppercase text-sm text-gray-700 block mb-1">
                {profileType === "volunteer" ? "Nome Completo" : "Nome / Razão Social"}
              </label>
              <Input value={signupName} onChange={e => setSignupName(e.target.value)}
                placeholder={profileType === "volunteer" ? "Ex: Maria Silva" : "Ex: Associação Viva Bem"}
                required className="h-12 border-2 border-black" />
            </div>
            <div>
              <label className="font-bold uppercase text-sm text-gray-700 block mb-1">E-mail</label>
              <Input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                placeholder="seuemail@exemplo.com" required className="h-12 border-2 border-black" />
            </div>
            <div>
              <label className="font-bold uppercase text-sm text-gray-700 block mb-1">Senha</label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" required className="h-12 border-2 border-black pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-500">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={loading} className="w-full h-14 uppercase font-black text-lg bg-black text-white hover:bg-gray-800">
              {loading ? "Processando..." : "Continuar →"}
            </Button>
            <p className="text-center text-xs font-bold text-gray-500">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 font-black text-2xl uppercase">Carregando...</div>}>
      <AuthForm />
    </Suspense>
  );
}
