/**
 * validators.ts
 * Validações matemáticas locais (sem dependências externas) + ViaCEP
 * CPF/CNPJ: algoritmos oficiais da Receita Federal
 */

// ─────────────────── CPF ───────────────────

/**
 * Valida CPF pelo algoritmo oficial da Receita Federal.
 * Rejeita sequências repetidas (111.111.111-11, etc.)
 */
export function validateCPF(raw: string): boolean {
  const c = raw.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += +c[i] * (10 - i);
  let rem = 11 - (sum % 11);
  if (rem >= 10) rem = 0;
  if (rem !== +c[9]) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += +c[i] * (11 - i);
  rem = 11 - (sum % 11);
  if (rem >= 10) rem = 0;
  return rem === +c[10];
}

/** Formata CPF enquanto o usuário digita: 123.456.789-09 */
export function formatCPF(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  return d.replace(
    /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
    (_, a, b, c, e) =>
      e ? `${a}.${b}.${c}-${e}` : c ? `${a}.${b}.${c}` : b ? `${a}.${b}` : a
  );
}

// ─────────────────── CNPJ ───────────────────

/**
 * Valida CNPJ pelo algoritmo oficial (2 dígitos verificadores).
 * Rejeita sequências repetidas.
 */
export function validateCNPJ(raw: string): boolean {
  const c = raw.replace(/\D/g, "");
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;

  const calc = (n: string, weights: number[]) =>
    weights.reduce((sum, w, i) => sum + +n[i] * w, 0);

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const r1 = calc(c, w1) % 11;
  const r2 = calc(c, w2) % 11;

  return (
    +c[12] === (r1 < 2 ? 0 : 11 - r1) &&
    +c[13] === (r2 < 2 ? 0 : 11 - r2)
  );
}

/** Formata CNPJ enquanto o usuário digita: 12.345.678/0001-90 */
export function formatCNPJ(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 14);
  return d.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,
    (_, a, b, c, e, f) =>
      f
        ? `${a}.${b}.${c}/${e}-${f}`
        : e
        ? `${a}.${b}.${c}/${e}`
        : c
        ? `${a}.${b}.${c}`
        : b
        ? `${a}.${b}`
        : a
  );
}

// ─────────────────── TELEFONE ───────────────────

/**
 * Valida telefone brasileiro: (DD) 9XXXX-XXXX (celular) ou (DD) XXXX-XXXX (fixo)
 * Aceita com ou sem formatação.
 */
export function validatePhone(raw: string): boolean {
  const d = raw.replace(/\D/g, "");
  return d.length === 10 || d.length === 11;
}

/** Formata telefone: (84) 99999-9999 ou (84) 3232-1111 */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// ─────────────────── CEP ───────────────────

/** Formata CEP: 59000-000 */
export function formatCEP(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export interface ViaCEPResult {
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Consulta a API gratuita do ViaCEP.
 * Retorna os dados de endereço ou lança erro se CEP inválido.
 */
export async function buscarCEP(cep: string): Promise<ViaCEPResult> {
  const onlyDigits = cep.replace(/\D/g, "");
  if (onlyDigits.length !== 8) throw new Error("CEP deve ter 8 dígitos");

  const res = await fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`, {
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw new Error("Erro ao consultar CEP");

  const data: ViaCEPResult = await res.json();
  if (data.erro) throw new Error("CEP não encontrado");

  return data;
}

// ─────────────────── EMAIL ───────────────────

/** Validação básica de e-mail (RFC 5322 simplificado) */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// ─────────────────── SENHA ───────────────────

/** Força de senha: mínimo 8 chars com ao menos 1 número */
export function validatePassword(pw: string): { valid: boolean; message: string } {
  if (pw.length < 8) return { valid: false, message: "Mínimo 8 caracteres" };
  if (!/\d/.test(pw)) return { valid: false, message: "Deve conter pelo menos 1 número" };
  return { valid: true, message: "Senha forte" };
}

// ─────────────────── NOME ───────────────────

/** Valida nome completo: ao menos 2 palavras, sem números */
export function validateFullName(name: string): boolean {
  const trimmed = name.trim();
  return /^[a-zA-ZÀ-ÿ\s]{5,}$/.test(trimmed) && trimmed.split(" ").filter(Boolean).length >= 2;
}
