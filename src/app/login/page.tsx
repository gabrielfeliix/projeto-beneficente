"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { saveStoredProfile } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkUniqueField, getProfile } from "@/actions/platform";
import {
  validateCPF, validateCNPJ, validatePhone, validateEmail, validatePassword,
  formatCPF, formatCNPJ, formatPhone, formatCEP, buscarCEP,
} from "@/lib/validators";
import {
  Eye, EyeOff, Sparkles, User, Building2, Heart, ArrowLeft,
  CheckCircle, MapPin, Loader2, AlertCircle,
} from "lucide-react";

/* ─── Demo users (fallback offline) ─── */
const demoUsers = [
  { id: "vol-1", profileType: "volunteer" as const, role: "volunteer", name: "Ana Beatriz", email: "ana.beatriz@email.com", password: "demo123" },
  { id: "vol-2", profileType: "volunteer" as const, role: "volunteer", name: "Lucas Mendes", email: "lucas.mendes@email.com", password: "demo123" },
  { id: "inst-1", profileType: "institution" as const, role: "institution", name: "Instituto Água Viva", email: "contato@aguaviva.org", password: "demo123" },
  { id: "inst-2", profileType: "institution" as const, role: "institution", name: "ONG Mãos que Ajudam", email: "contato@maosqueajudam.org", password: "demo123" },
  { id: "don-1", profileType: "donor" as const, role: "donor", name: "Pedro Doador", email: "pedro.doador@email.com", password: "demo123" },
];

/* ─── Field feedback helper ─── */
function FieldHint({ ok, msg }: { ok: boolean | null; msg: string }) {
  if (ok === null) return null;
  return (
    <span className={`text-xs font-bold mt-1 flex items-center gap-1 ${ok ? "text-green-600" : "text-red-600"}`}>
      {ok ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {msg}
    </span>
  );
}

/* ─── CEP field component ─── */
function CEPField({
  value, onChange, onFilled,
}: {
  value: string;
  onChange: (v: string) => void;
  onFilled: (data: { logradouro: string; bairro: string; localidade: string; uf: string }) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const handleChange = async (raw: string) => {
    const formatted = formatCEP(raw);
    onChange(formatted);
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 8) {
      setStatus("loading");
      try {
        const data = await buscarCEP(digits);
        onFilled(data);
        setStatus("ok");
      } catch {
        setStatus("error");
      }
    } else {
      setStatus("idle");
    }
  };

  return (
    <div>
      <label className="font-bold uppercase text-xs text-gray-600 block mb-1">
        CEP * <span className="normal-case text-gray-400 font-normal">(auto-preenche endereço)</span>
      </label>
      <div className="relative">
        <Input
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder="00000-000"
          className="border-2 border-black h-11 pr-8"
          maxLength={9}
        />
        {status === "loading" && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-500" />}
        {status === "ok" && <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />}
        {status === "error" && <AlertCircle className="absolute right-3 top-3 w-4 h-4 text-red-500" />}
      </div>
      {status === "ok" && <span className="text-xs font-bold text-green-600 mt-1">✓ Endereço encontrado</span>}
      {status === "error" && <span className="text-xs font-bold text-red-600 mt-1">CEP não encontrado</span>}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN AUTH FORM
═══════════════════════════════════════ */
function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"auth" | "profile">("auth");
  const [profileType, setProfileType] = useState<"donor" | "volunteer" | "institution" | "company">("volunteer");
  const [userId, setUserId] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  // Step 1 fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ── Shared fields (Donor + Volunteer)
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComp, setAddressComp] = useState("");

  // ── Volunteer extras
  const [profession, setProfession] = useState("");
  const [availability, setAvailability] = useState("");
  const [skills, setSkills] = useState("");

  // ── Institution fields
  const [cnpj, setCnpj] = useState("");
  const [instPhone, setInstPhone] = useState("");
  const [instCep, setInstCep] = useState("");
  const [instStreet, setInstStreet] = useState("");
  const [instNeighborhood, setInstNeighborhood] = useState("");
  const [instCity, setInstCity] = useState("");
  const [instUf, setInstUf] = useState("");
  const [instNumber, setInstNumber] = useState("");
  const [instMission, setInstMission] = useState("");
  const [instRepName, setInstRepName] = useState("");
  const [instRepCpf, setInstRepCpf] = useState("");
  const [cnpjLoading, setCnpjLoading] = useState(false);

  // ── Shared
  const [terms, setTerms] = useState(false);

  // Real-time validation states
  const cpfDigits = cpf.replace(/\D/g, "");
  const cpfValid = cpfDigits.length === 11 ? validateCPF(cpf) : null;
  const cnpjDigits = cnpj.replace(/\D/g, "");
  const cnpjValid = cnpjDigits.length === 14 ? validateCNPJ(cnpj) : null;
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneValid = phoneDigits.length >= 10 ? validatePhone(phone) : null;
  const instPhoneDigits = instPhone.replace(/\D/g, "");
  const instPhoneValid = instPhoneDigits.length >= 10 ? validatePhone(instPhone) : null;
  const repCpfDigits = instRepCpf.replace(/\D/g, "");
  const repCpfValid = repCpfDigits.length === 11 ? validateCPF(instRepCpf) : null;
  const emailOk = signupEmail.length > 5 ? validateEmail(signupEmail) : null;
  const pwCheck = signupPassword.length > 0 ? validatePassword(signupPassword) : null;

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") setTab("signup");
  }, [searchParams]);

  /* ── CNPJ autofill ── */
  const handleCnpjBlur = async () => {
    const clean = cnpj.replace(/\D/g, "");
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
        }
      }
    } catch { /* silent */ }
    finally { setCnpjLoading(false); }
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
          const profile = await getProfile(data.user.id);
          if (!profile) {
            setUserId(data.user.id);
            setSignupName(data.user.email?.split("@")[0] || "");
            setSignupEmail(data.user.email || "");
            setStep("profile");
            setLoading(false);
            return;
          }
          saveStoredProfile({
            id: profile.id,
            profileType: profile.profileType as any,
            role: profile.profileType as any,
            name: profile.name,
            email: profile.email,
            avatarUrl: profile.avatarUrl,
            approvalStatus: (profile as any).approvalStatus,
          });
        }
      } else {
        const found = demoUsers.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPassword);
        if (!found) throw new Error("Credenciais inválidas. Use um dos e-mails demo abaixo.");
        saveStoredProfile({ id: found.id, profileType: found.profileType as any, role: found.role as any, name: found.name, email: found.email });
      }
      setSuccess("Login efetuado! Redirecionando...");
      const redirect = searchParams.get("redirect") || "/feed";
      setTimeout(() => { window.location.href = redirect; }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao efetuar login.");
    } finally { setLoading(false); }
  };

  /* ── FORGOT PASSWORD ── */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (!loginEmail.trim() || !validateEmail(loginEmail)) {
        throw new Error("Por favor, insira um e-mail válido.");
      }

      if (isSupabaseConfigured && supabase) {
        const { error: err } = await supabase.auth.resetPasswordForEmail(loginEmail, {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (err) throw err;
        setSuccess("Link de redefinição enviado! Verifique sua caixa de entrada.");
      } else {
        setSuccess("Modo Offline: Link de redefinição enviado com sucesso (simulado).");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar e-mail de recuperação.");
    } finally { setLoading(false); }
  };

  /* ── SIGNUP STEP 1 ── */
  const handleSignupStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (!signupName.trim() || signupName.trim().split(" ").filter(Boolean).length < 2) {
        if (profileType !== "institution") throw new Error("Informe seu nome completo (nome e sobrenome).");
      }
      if (!validateEmail(signupEmail)) throw new Error("E-mail inválido.");
      const pwResult = validatePassword(signupPassword);
      if (!pwResult.valid) throw new Error(`Senha fraca: ${pwResult.message}`);

      if (isSupabaseConfigured) {
        const emailCheck = await checkUniqueField("email", signupEmail);
        if (emailCheck.exists) {
          throw new Error("Este e-mail já está cadastrado. Faça login ou utilize outro e-mail.");
        }
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error: err } = await supabase.auth.signUp({
          email: signupEmail,
          password: signupPassword,
          options: { data: { name: signupName, profile_type: profileType } },
        });
        if (err) {
          if (err.message.toLowerCase().includes("rate limit") || err.message.toLowerCase().includes("email rate"))
            throw new Error("Limite de confirmações atingido. Aguarde alguns minutos ou use outro e-mail.");
          if (err.message.toLowerCase().includes("already registered") || err.message.toLowerCase().includes("user already"))
            throw new Error("Este e-mail já está cadastrado. Faça login ou redefina sua senha.");
          throw err;
        }
        if (data.user) setUserId(data.user.id);
        else setUserId("local-" + Date.now());
      } else {
        setUserId("local-" + Date.now());
      }
      setStep("profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro no cadastro.");
    } finally { setLoading(false); }
  };

  /* ── SIGNUP STEP 2 ── */
  const handleSignupStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (profileType === "donor" || profileType === "volunteer") {
        if (!validateCPF(cpf)) throw new Error("CPF inválido. Verifique o número informado.");
        
        if (isSupabaseConfigured) {
          const cpfCheck = await checkUniqueField("cpf", cpf);
          if (cpfCheck.exists) {
            throw new Error("Este CPF já está cadastrado em nosso sistema.");
          }
        }

        if (!birthDate) throw new Error("Data de nascimento é obrigatória.");
        if (!cep) throw new Error("CEP é obrigatório.");
        const cleanCep = cep.replace(/\D/g, "");
        if (cleanCep.length !== 8) throw new Error("CEP deve conter 8 dígitos.");
        if (cleanCep.substring(0, 2) !== "59") {
          throw new Error("Localização inválida. A PROVE atua exclusivamente no Rio Grande do Norte (CEPs iniciando em 59).");
        }
        if (!city) throw new Error("Cidade é obrigatória.");
        if (!addressNumber) throw new Error("Número do endereço é obrigatório.");
        if (!terms) throw new Error("Aceite os termos para continuar.");

        const fullAddress = `${street}, ${addressNumber}${addressComp ? ", " + addressComp : ""}, ${neighborhood}, ${city} - ${uf}, ${cep}`;

        if (isSupabaseConfigured && supabase) {
          const { error: dbErr } = await supabase.from("profiles").upsert({
            id: userId, name: signupName, email: signupEmail,
            profile_type: profileType,
            cpf: cpf.replace(/\D/g, ""),
            birth_date: birthDate, phone: phone.replace(/\D/g, ""),
            address: fullAddress, city, neighborhood,
            cep: cep.replace(/\D/g, ""),
            profession: profileType === "volunteer" ? profession : undefined,
            availability: profileType === "volunteer" ? availability : undefined,
            skills: profileType === "volunteer" ? skills.split(",").map(s => s.trim()).filter(Boolean) : [],
            accepted_terms: terms,
          });
          if (dbErr) {
            if (dbErr.message.includes("row-level security"))
              throw new Error("Permissão negada. Configure as políticas RLS no Supabase (tabela profiles).");
            throw dbErr;
          }
        }
        saveStoredProfile({ id: userId, profileType: profileType as any, role: profileType as any, name: signupName, email: signupEmail });
        setSuccess("Conta criada com sucesso! Bem-vindo(a) à PROVE!");
        setTimeout(() => { window.location.href = "/feed"; }, 1000);

      } else {
        // Institution or Company
        if (!validateCNPJ(cnpj)) throw new Error("CNPJ inválido. Verifique o número informado.");
        
        if (isSupabaseConfigured) {
          const cnpjCheck = await checkUniqueField("cnpj", cnpj);
          if (cnpjCheck.exists) {
            throw new Error("Este CNPJ já está cadastrado em nosso sistema.");
          }
        }

        if (!instRepName.trim()) throw new Error("Nome do representante legal é obrigatório.");
        if (instRepCpf && !validateCPF(instRepCpf)) throw new Error("CPF do representante inválido.");
        if (instPhone && !validatePhone(instPhone)) throw new Error("Telefone inválido.");
        if (!instCep) throw new Error("CEP é obrigatório.");
        const cleanInstCep = instCep.replace(/\D/g, "");
        if (cleanInstCep.length !== 8) throw new Error("CEP deve conter 8 dígitos.");
        if (cleanInstCep.substring(0, 2) !== "59") {
          throw new Error("Localização inválida. A PROVE atua exclusivamente no Rio Grande do Norte (CEPs iniciando em 59).");
        }
        if (!instCity) throw new Error("Cidade é obrigatória.");
        if (!terms) throw new Error("Confirme os dados para continuar.");

        const fullAddress = `${instStreet}, ${instNumber}, ${instNeighborhood}, ${instCity} - ${instUf}, ${instCep}`;

        if (isSupabaseConfigured && supabase) {
          const { error: dbErr } = await supabase.from("profiles").upsert({
            id: userId, name: signupName, email: signupEmail, profile_type: profileType,
            cnpj: cnpj.replace(/\D/g, ""),
            phone: instPhone.replace(/\D/g, ""),
            headquarters_address: fullAddress,
            mission: instMission,
            representative_name: instRepName,
            representative_cpf: instRepCpf.replace(/\D/g, ""),
            accepted_terms: terms,
            city: instCity, neighborhood: instNeighborhood,
            cep: instCep.replace(/\D/g, ""),
            approval_status: profileType === "institution" ? "pending_approval" : "approved",
            subscription_plan: profileType === "company" ? "mensal_ouro" : "none",
            subscription_status: profileType === "company" ? "active" : "inactive",
          });
          if (dbErr) {
            if (dbErr.message.includes("row-level security"))
              throw new Error("Permissão negada. Configure as políticas RLS no Supabase.");
            throw dbErr;
          }
        }
        saveStoredProfile({
          id: userId, profileType: profileType as any, role: profileType as any,
          name: signupName, email: signupEmail, 
          approvalStatus: profileType === "institution" ? "pending_approval" : "approved",
          subscriptionPlan: profileType === "company" ? "mensal_ouro" : "none",
          subscriptionStatus: profileType === "company" ? "active" : "inactive",
        });
        
        if (profileType === "institution") {
          setSuccess("Cadastro enviado! Sua ONG está em análise. Em até 5 dias úteis você receberá uma resposta.");
        } else {
          setSuccess("Empresa cadastrada com sucesso! Assinatura de impacto Ouro ativada com sucesso.");
        }
        setTimeout(() => { window.location.href = "/feed"; }, 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    } finally { setLoading(false); }
  };

  /* ═══════════════════════════════════════
     RENDER — STEP 2: Profile completion
  ═══════════════════════════════════════ */
  if (step === "profile") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => { setStep("auth"); setError(""); }}
          className="flex items-center gap-2 font-bold text-sm uppercase mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="mb-8">
          <Badge className="mb-3 bg-accent text-white border-2 border-black">Passo 2 de 2</Badge>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter">Complete seu Perfil</h1>
          <p className="text-gray-600 font-bold mt-2">
            {profileType === "institution"
              ? "Sua ONG passará por análise antes de ser aprovada."
              : "Estas informações garantem sua segurança na plataforma."}
          </p>
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {([
            { type: "donor", label: "Pessoa Física", icon: <Heart className="w-4 h-4" /> },
            { type: "volunteer", label: "Voluntário", icon: <User className="w-4 h-4" /> },
            { type: "institution", label: "ONG", icon: <Building2 className="w-4 h-4" /> },
            { type: "company", label: "Empresa", icon: <Building2 className="w-4 h-4" /> },
          ] as const).map(({ type, label, icon }) => (
            <button key={type} type="button" onClick={() => setProfileType(type as any)}
              className={`py-3 font-black uppercase border-4 flex items-center justify-center gap-1 transition-all text-xs ${profileType === type ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:border-black"}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="border-4 border-red-500 bg-red-50 p-4 font-bold text-red-700 mb-6 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> {error}
          </div>
        )}
        {success && (
          <div className="border-4 border-green-500 bg-green-50 p-4 font-bold text-green-700 mb-6 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> {success}
          </div>
        )}

        {/* ── DONOR / VOLUNTEER FORM ── */}
        {(profileType === "donor" || profileType === "volunteer") && (
          <form onSubmit={handleSignupStep2} className="space-y-5 bg-white border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0_0_#000]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* CPF */}
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">CPF *</label>
                <Input value={cpf} onChange={e => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00" className="border-2 border-black h-11" maxLength={14} />
                <FieldHint ok={cpfValid} msg={cpfValid ? "CPF válido ✓" : "CPF inválido — verifique os dígitos"} />
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Data de Nascimento *</label>
                <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                  className="border-2 border-black h-11" max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split("T")[0]} />
              </div>

              {/* Telefone */}
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Telefone / WhatsApp *</label>
                <Input value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
                  placeholder="(84) 99999-0000" className="border-2 border-black h-11" maxLength={15} />
                <FieldHint ok={phoneValid} msg={phoneValid ? "Telefone válido ✓" : "Informe DDD + número (10 ou 11 dígitos)"} />
              </div>

              {profileType === "volunteer" && (
                <div>
                  <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Profissão</label>
                  <Input value={profession} onChange={e => setProfession(e.target.value)}
                    placeholder="Ex: Professor, Designer..." className="border-2 border-black h-11" />
                </div>
              )}
            </div>

            {/* CEP + endereço auto-preenchido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <CEPField value={cep} onChange={setCep}
                  onFilled={data => {
                    setStreet(data.logradouro);
                    setNeighborhood(data.bairro);
                    setCity(data.localidade);
                    setUf(data.uf);
                  }} />
              </div>
              <div className="md:col-span-2">
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Rua / Logradouro</label>
                <Input value={street} onChange={e => setStreet(e.target.value)}
                  placeholder="Preenchido pelo CEP" className="border-2 border-black h-11" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Número *</label>
                <Input value={addressNumber} onChange={e => setAddressNumber(e.target.value)}
                  placeholder="Ex: 123" className="border-2 border-black h-11" />
              </div>
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Complemento</label>
                <Input value={addressComp} onChange={e => setAddressComp(e.target.value)}
                  placeholder="Apto, Bloco..." className="border-2 border-black h-11" />
              </div>
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Bairro</label>
                <Input value={neighborhood} onChange={e => setNeighborhood(e.target.value)}
                  placeholder="Preenchido pelo CEP" className="border-2 border-black h-11" />
              </div>
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Cidade / UF</label>
                <Input value={city ? `${city} - ${uf}` : ""} readOnly
                  placeholder="Preenchido pelo CEP" className="border-2 border-black h-11 bg-gray-50" />
              </div>
            </div>

            {profileType === "volunteer" && (
              <>
                <div>
                  <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Disponibilidade de Horários</label>
                  <Input value={availability} onChange={e => setAvailability(e.target.value)}
                    placeholder="Ex: Fins de semana, Manhãs de segunda..." className="border-2 border-black h-11" />
                </div>
                <div>
                  <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Habilidades (separadas por vírgula)</label>
                  <Input value={skills} onChange={e => setSkills(e.target.value)}
                    placeholder="Ex: Design, Culinária, Tecnologia, Enfermagem" className="border-2 border-black h-11" />
                </div>
              </>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-black border-2 border-black shrink-0" />
              <span className="text-sm font-bold">
                Li e aceito os <span className="underline">Termos de Uso</span> e a{" "}
                <span className="underline">Política de Privacidade</span> da plataforma PROVE.
                Meus dados serão usados apenas para fins de voluntariado social.
              </span>
            </label>

            <Button type="submit" disabled={loading} size="lg"
              className="w-full h-14 font-black uppercase text-lg bg-black text-white hover:bg-gray-800">
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Salvando...</> : `Criar minha conta de ${profileType === "donor" ? "pessoa física" : "voluntário"}`}
            </Button>
          </form>
        )}

        {/* ── INSTITUTION / COMPANY FORM ── */}
        {(profileType === "institution" || profileType === "company") && (
          <form onSubmit={handleSignupStep2} className="space-y-5 bg-white border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0_0_#000]">
            {profileType === "institution" ? (
              <div className="bg-amber-50 border-2 border-amber-400 p-4 text-sm font-bold text-amber-800 flex gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                Após o cadastro, sua ONG passará por análise de um fiscal. O acesso completo é liberado após aprovação (até 5 dias úteis).
              </div>
            ) : (
              <div className="bg-cyan-50 border-2 border-cyan-400 p-4 text-sm font-bold text-cyan-800 flex gap-2">
                <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-cyan-600" />
                Empresa Assinante: Sua conta terá acesso a um painel ESG exclusivo com certificados de regularidade, doações mensais e relatórios dedutíveis.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* CNPJ */}
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">CNPJ *</label>
                <div className="relative">
                  <Input value={cnpj} onChange={e => setCnpj(formatCNPJ(e.target.value))}
                    onBlur={handleCnpjBlur} placeholder="00.000.000/0001-00"
                    className="border-2 border-black h-11" maxLength={18} />
                  {cnpjLoading && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />}
                </div>
                <FieldHint ok={cnpjValid} msg={cnpjValid ? "CNPJ válido ✓" : "CNPJ inválido — verifique os dígitos"} />
              </div>

              {/* Telefone */}
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Telefone da ONG</label>
                <Input value={instPhone} onChange={e => setInstPhone(formatPhone(e.target.value))}
                  placeholder="(84) 3333-0000" className="border-2 border-black h-11" maxLength={15} />
                <FieldHint ok={instPhoneValid} msg={instPhoneValid ? "Válido ✓" : "Formato inválido"} />
              </div>
            </div>

            {/* CEP da sede */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <CEPField value={instCep} onChange={setInstCep}
                  onFilled={data => {
                    setInstStreet(data.logradouro);
                    setInstNeighborhood(data.bairro);
                    setInstCity(data.localidade);
                    setInstUf(data.uf);
                  }} />
              </div>
              <div className="md:col-span-2">
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Rua / Logradouro da Sede</label>
                <Input value={instStreet} onChange={e => setInstStreet(e.target.value)}
                  placeholder="Preenchido pelo CEP" className="border-2 border-black h-11" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Número *</label>
                <Input value={instNumber} onChange={e => setInstNumber(e.target.value)}
                  placeholder="Ex: 123" className="border-2 border-black h-11" />
              </div>
              <div className="md:col-span-2">
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Bairro</label>
                <Input value={instNeighborhood} onChange={e => setInstNeighborhood(e.target.value)}
                  placeholder="Preenchido pelo CEP" className="border-2 border-black h-11" />
              </div>
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Cidade / UF</label>
                <Input value={instCity ? `${instCity} - ${instUf}` : ""} readOnly
                  placeholder="Preenchido pelo CEP" className="border-2 border-black h-11 bg-gray-50" />
              </div>
            </div>

            <div>
              <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Missão da Organização</label>
              <textarea value={instMission} onChange={e => setInstMission(e.target.value)} rows={3}
                placeholder="Descreva brevemente a missão e os objetivos da sua organização..."
                className="w-full border-2 border-black p-3 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">Nome do Representante Legal *</label>
                <Input value={instRepName} onChange={e => setInstRepName(e.target.value)}
                  placeholder="Nome completo" className="border-2 border-black h-11" />
              </div>
              <div>
                <label className="font-bold uppercase text-xs text-gray-600 block mb-1">CPF do Representante</label>
                <Input value={instRepCpf} onChange={e => setInstRepCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00" className="border-2 border-black h-11" maxLength={14} />
                <FieldHint ok={repCpfValid} msg={repCpfValid ? "CPF válido ✓" : "CPF inválido"} />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-black border-2 border-black shrink-0" />
              <span className="text-sm font-bold">
                Confirmo que os dados fornecidos são verídicos. Estou ciente que a conta será analisada
                antes da aprovação e aceito os <span className="underline">Termos de Uso</span> da plataforma PROVE.
              </span>
            </label>

            <Button type="submit" disabled={loading} size="lg"
              className="w-full h-14 font-black uppercase text-lg bg-black text-white hover:bg-gray-800">
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando...</> : (profileType === "company" ? "Cadastrar Empresa Assinante" : "Cadastrar minha organização")}
            </Button>
          </form>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════
     RENDER — STEP 1: Auth
  ═══════════════════════════════════════ */
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
          {tab === "login" ? "Acesse seus projetos e candidaturas." : "Junte-se à maior rede de voluntariado do RN."}
        </p>
      </div>

      {/* Tabs */}
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
        {error && (
          <div className="border-4 border-red-500 bg-red-50 p-4 font-bold text-red-700 mb-6 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> {error}
          </div>
        )}
        {success && (
          <div className="border-4 border-green-500 bg-green-50 p-4 font-bold text-green-700 mb-6 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> {success}
          </div>
        )}

        {tab === "login" ? (
          forgotMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="font-bold uppercase text-sm text-gray-700 block mb-1">E-mail de Recuperação</label>
                <Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com" required className="h-12 border-2 border-black" />
              </div>
              
              <div className="flex flex-col gap-2">
                <Button type="submit" size="lg" disabled={loading}
                  className="w-full h-14 uppercase font-black text-lg bg-black text-white hover:bg-gray-800">
                  {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando...</> : "Enviar E-mail de Recuperação"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setForgotMode(false); setError(""); setSuccess(""); }}
                  className="w-full h-11 font-black uppercase text-xs border-2 border-black">
                  Voltar para o Login
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="font-bold uppercase text-sm text-gray-700 block mb-1">E-mail</label>
                <Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com" required className="h-12 border-2 border-black" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold uppercase text-sm text-gray-700">Senha</label>
                  <button type="button" onClick={() => { setForgotMode(true); setError(""); setSuccess(""); }}
                    className="text-xs font-bold uppercase underline hover:text-primary">
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <Input type={showPass ? "text" : "password"} value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Sua senha" required className="h-12 border-2 border-black pr-12" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-500">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isSupabaseConfigured && (
                <div className="bg-yellow-50 border-2 border-yellow-400 p-4 text-xs font-bold space-y-1.5">
                  <p className="uppercase text-yellow-700 text-sm">💡 Modo Demonstração</p>
                  <p>Voluntário: <code className="bg-yellow-100 px-1">ana.beatriz@email.com</code> / <code className="bg-yellow-100 px-1">demo123</code></p>
                  <p>ONG: <code className="bg-yellow-100 px-1">contato@aguaviva.org</code> / <code className="bg-yellow-100 px-1">demo123</code></p>
                  <p>Pessoa Física: <code className="bg-yellow-100 px-1">pedro.doador@email.com</code> / <code className="bg-yellow-100 px-1">demo123</code></p>
                </div>
              )}

              <Button type="submit" size="lg" disabled={loading}
                className="w-full h-14 uppercase font-black text-lg bg-black text-white hover:bg-gray-800">
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Entrando...</> : "Entrar na Plataforma"}
              </Button>
            </form>
          )
        ) : (
          <form onSubmit={handleSignupStep1} className="space-y-5">
            {/* Tipo */}
            <div>
              <label className="font-bold uppercase text-sm text-gray-700 block mb-2">Sou um(a)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {([
                  { type: "donor", label: "Pessoa Física", icon: <Heart className="w-4 h-4" /> },
                  { type: "volunteer", label: "Voluntário", icon: <User className="w-4 h-4" /> },
                  { type: "institution", label: "ONG", icon: <Building2 className="w-4 h-4" /> },
                  { type: "company", label: "Empresa", icon: <Building2 className="w-4 h-4" /> },
                ] as const).map(({ type, label, icon }) => (
                  <button key={type} type="button" onClick={() => setProfileType(type as any)}
                    className={`py-2.5 font-black uppercase border-4 flex items-center justify-center gap-1 transition-all text-xs ${profileType === type ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:border-black"}`}>
                    {icon} {label}
                  </button>
                ))}
              </div>
              {profileType === "institution" && (
                <p className="text-xs font-bold text-amber-700 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  ONGs passam por aprovação antes de acessar o painel completo.
                </p>
              )}
              {profileType === "company" && (
                <p className="text-xs font-bold text-accent mt-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  Empresas têm painel de assinatura de impacto e benefícios fiscais.
                </p>
              )}
            </div>

            <div>
              <label className="font-bold uppercase text-sm text-gray-700 block mb-1">
                {profileType === "institution" || profileType === "company" ? "Nome / Razão Social" : "Nome Completo"}
              </label>
              <Input value={signupName} onChange={e => setSignupName(e.target.value)}
                placeholder={profileType === "institution" || profileType === "company" ? "Ex: Associação Viva Bem" : "Ex: Maria Silva"}
                required className="h-12 border-2 border-black" />
            </div>

            <div>
              <label className="font-bold uppercase text-sm text-gray-700 block mb-1">E-mail</label>
              <Input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                placeholder="seuemail@exemplo.com" required className="h-12 border-2 border-black" />
              <FieldHint ok={emailOk} msg={emailOk ? "E-mail válido ✓" : "Formato de e-mail inválido"} />
            </div>

            <div>
              <label className="font-bold uppercase text-sm text-gray-700 block mb-1">
                Senha <span className="normal-case font-normal text-gray-400 text-xs">(mín. 8 caracteres com 1 número)</span>
              </label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres" required className="h-12 border-2 border-black pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-500">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {pwCheck && (
                <div className={`flex items-center gap-1 text-xs font-bold mt-1 ${pwCheck.valid ? "text-green-600" : "text-amber-600"}`}>
                  {pwCheck.valid ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {pwCheck.message}
                </div>
              )}
            </div>

            <Button type="submit" size="lg" disabled={loading}
              className="w-full h-14 uppercase font-black text-lg bg-black text-white hover:bg-gray-800">
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...</> : "Continuar →"}
            </Button>
            <p className="text-center text-xs font-bold text-gray-500">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </form>
        )}
      </div>

      {/* Location hint */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-gray-500">
        <MapPin className="w-4 h-4" /> Plataforma focada no Rio Grande do Norte
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
