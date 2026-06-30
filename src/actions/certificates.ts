"use server";

import { supabase, isSupabaseConfigured, isUUID } from "@/lib/supabase";

export interface CertificateData {
  id: string;
  volunteerId: string;
  institutionId: string;
  jobId: string | null;
  volunteerName: string;
  institutionName: string;
  jobTitle: string;
  hoursDonated: number;
  issuedAt: string;
  verificationCode: string;
}

export async function issueCertificate(
  applicationId: string,
  hours: number,
  feedbackNotes?: string
): Promise<CertificateData> {
  const code = "LUM-" + Math.random().toString(36).substring(2, 9).toUpperCase();

  if (isSupabaseConfigured && supabase && isUUID(applicationId)) {
    // 1. Carrega dados da candidatura
    const { data: app, error: appErr } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (appErr || !app) {
      throw new Error("Candidatura não encontrada no Supabase");
    }

    // 2. Insere na tabela de certificados
    const { data: cert, error: certErr } = await supabase
      .from("certificates")
      .insert({
        volunteer_id: app.volunteer_id,
        institution_id: app.institution_id,
        job_id: app.job_id,
        volunteer_name: app.volunteer_name,
        institution_name: app.institution_name,
        job_title: app.job_title,
        hours_donated: hours,
        verification_code: code,
      })
      .select()
      .single();

    if (certErr || !cert) {
      throw new Error("Falha ao registrar certificado: " + certErr?.message);
    }

    // 3. Atualiza candidatura para concluída com horas e notas
    await supabase
      .from("applications")
      .update({
        status: "selected",
        hours_logged: hours,
        feedback_notes: feedbackNotes || null,
      })
      .eq("id", applicationId);

    return {
      id: cert.id,
      volunteerId: cert.volunteer_id,
      institutionId: cert.institution_id,
      jobId: cert.job_id,
      volunteerName: cert.volunteer_name,
      institutionName: cert.institution_name,
      jobTitle: cert.job_title,
      hoursDonated: cert.hours_donated,
      issuedAt: cert.issued_at,
      verificationCode: cert.verification_code,
    };
  }

  // Fallback offline
  const fallbackCert: CertificateData = {
    id: "cert-" + Date.now(),
    volunteerId: "vol-1",
    institutionId: "inst-1",
    jobId: "job-1",
    volunteerName: "Voluntário Simulado",
    institutionName: "Instituição Simulação",
    jobTitle: "Ação de Reflorestamento",
    hoursDonated: hours,
    issuedAt: new Date().toISOString(),
    verificationCode: code,
  };
  return fallbackCert;
}

export async function getCertificateByCode(code: string): Promise<CertificateData | null> {
  const cleanCode = code.trim().toUpperCase();

  // Fallback offline demo
  if (cleanCode === "LUM-DEMO123") {
    return {
      id: "cert-demo",
      volunteerId: "vol-demo",
      institutionId: "inst-demo",
      jobId: null,
      volunteerName: "Ana Beatriz",
      institutionName: "Associação Água Viva",
      jobTitle: "Desenvolvedora Voluntária",
      hoursDonated: 12,
      issuedAt: new Date().toISOString(),
      verificationCode: "LUM-DEMO123",
    };
  }

  if (isSupabaseConfigured && supabase) {
    const { data: cert, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("verification_code", cleanCode)
      .maybeSingle();

    if (error || !cert) return null;

    return {
      id: cert.id,
      volunteerId: cert.volunteer_id,
      institutionId: cert.institution_id,
      jobId: cert.job_id,
      volunteerName: cert.volunteer_name,
      institutionName: cert.institution_name,
      jobTitle: cert.job_title,
      hoursDonated: cert.hours_donated,
      issuedAt: cert.issued_at,
      verificationCode: cert.verification_code,
    };
  }

  return null;
}

export async function getVolunteerCertificates(volunteerId: string): Promise<CertificateData[]> {
  if (isSupabaseConfigured && supabase && isUUID(volunteerId)) {
    const { data: certs, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("volunteer_id", volunteerId)
      .order("issued_at", { ascending: false });

    if (error || !certs) return [];

    return certs.map((cert) => ({
      id: cert.id,
      volunteerId: cert.volunteer_id,
      institutionId: cert.institution_id,
      jobId: cert.job_id,
      volunteerName: cert.volunteer_name,
      institutionName: cert.institution_name,
      jobTitle: cert.job_title,
      hoursDonated: cert.hours_donated,
      issuedAt: cert.issued_at,
      verificationCode: cert.verification_code,
    }));
  }

  return [];
}
