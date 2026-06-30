import { getCertificateByCode } from "@/actions/certificates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/print-button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Award, Calendar, Clock, Bookmark, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cert = await getCertificateByCode(code);

  if (!cert) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 print:bg-white print:p-0">
      <div className="max-w-4xl w-full space-y-6 print:space-y-0 print:max-w-none print:w-auto">
        
        {/* NAVEGAÇÃO DE VOLTA (OCULTA NA IMPRESSÃO) */}
        <div className="flex justify-between items-center print:hidden print-hidden">
          <Link href="/dashboard">
            <Button variant="ghost" className="font-bold uppercase text-xs flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Painel de Controle
            </Button>
          </Link>
          <Badge className="bg-green-600 text-white font-black uppercase tracking-wider flex items-center gap-1.5 py-1 px-3">
            <ShieldCheck className="w-4 h-4" /> Certificado Autêntico
          </Badge>
        </div>

        {/* MOLDURA PRINCIPAL DO CERTIFICADO (ESTILO DIPLOMA NEO-BRUTALISTA) */}
        <Card className="border-8 border-black rounded-none bg-white p-4 sm:p-10 shadow-[12px_12px_0px_0px_#000000] relative overflow-hidden print-certificate-card">
          {/* Detalhes Estéticos nos Cantos */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 border-primary print:hidden" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-8 border-r-8 border-primary print:hidden" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-8 border-l-8 border-primary print:hidden" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-8 border-r-8 border-primary print:hidden" />

          <CardContent className="border-4 border-dashed border-gray-300 p-6 sm:p-12 text-center space-y-8 flex flex-col items-center justify-between min-h-[500px] print-certificate-content">
            {/* Cabeçalho */}
            <div className="space-y-3 flex flex-col items-center">
              <Award className="w-16 h-16 text-yellow-500 stroke-[2] drop-shadow-sm" />
              <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
                Certificado de Impacto Social
              </h1>
              <div className="h-1.5 w-32 bg-black" />
            </div>

            {/* Texto de Homologação */}
            <div className="max-w-2xl text-center space-y-4">
              <p className="text-gray-500 font-bold uppercase text-sm tracking-widest">
                Lumiar - Rede de Conexão Cidadã (PROVI)
              </p>
              <p className="text-gray-800 font-medium text-lg sm:text-xl leading-relaxed">
                Certificamos para os devidos fins de impacto social e acadêmico que o(a) usuário(a) voluntário(a)
              </p>
              <h2 className="font-display text-2xl sm:text-4xl font-black uppercase text-black my-2">
                {cert.volunteerName}
              </h2>
              <div className="text-xs font-mono font-bold text-gray-500 mb-2">ID do Usuário: #{cert.volunteerId || "vol-1"}</div>
              <p className="text-gray-800 font-medium text-lg sm:text-xl leading-relaxed">
                participou e concluiu com dedicação as atividades de voluntariado na causa de{" "}
                <strong className="font-black text-black">{cert.jobTitle}</strong>, atuando como voluntário(a) ativo(a) junto à instituição{" "}
                <strong className="font-black text-black">{cert.institutionName}</strong>, doando um total homologado de:
              </p>
            </div>

            {/* Horas */}
            <div className="bg-primary/10 border-4 border-black p-4 px-8 inline-flex items-center gap-3 shadow-[4px_4px_0px_0px_#000000]">
              <Clock className="w-6 h-6 text-black stroke-[3.5]" />
              <span className="font-display text-2xl sm:text-3xl font-black uppercase text-black">
                {cert.hoursDonated} Horas Doadas
              </span>
            </div>

            {/* Assinatura e Código */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-8 border-t border-gray-200">
              <div className="space-y-1 text-left">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Instituição Emitente</div>
                <div className="font-display font-black text-lg uppercase text-black">{cert.institutionName}</div>
                <div className="text-[10px] font-bold text-gray-500">Validação sob CNPJ Oficial</div>
              </div>

              <div className="space-y-2 text-center flex flex-col items-center">
                <div className="font-serif italic text-2xl font-semibold border-b border-black w-48 text-gray-700 pb-1" style={{ fontFamily: "Georgia, serif" }}>
                  PROVI Social
                </div>
                <div className="text-xs font-black uppercase text-gray-500">Assinatura Digital PROVI</div>
              </div>

              <div className="space-y-1 md:text-right">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center md:justify-end gap-1">
                  <Bookmark className="w-3.5 h-3.5" /> Código de Autenticidade
                </div>
                <div className="font-mono font-bold text-sm text-primary">{cert.verificationCode}</div>
                <div className="text-[10px] font-bold text-gray-500">Validação Pública Homologada</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AÇÕES DE IMPRESSÃO (OCULTAS NA IMPRESSÃO) */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden print-hidden">
          <p className="text-xs font-bold text-gray-500 leading-relaxed max-w-md">
            Este certificado é público e validado criptograficamente pela rede Lumiar. Instituições de ensino ou empresas podem consultar a validade deste documento usando o código <strong>{cert.verificationCode}</strong> em nosso portal.
          </p>
          <div className="flex gap-3 w-full sm:w-auto shrink-0">
            <PrintButton className="w-full sm:w-auto font-black uppercase border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-all" />
          </div>
        </div>

      </div>
    </div>
  );
}
