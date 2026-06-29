import { getJobById } from "@/actions/platform";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Award } from "lucide-react";
import { notFound } from "next/navigation";
import { ApplyButton } from "@/components/apply-button";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge className="bg-accent text-white border-2 border-black font-black uppercase">Vaga Aberta</Badge>
          <Badge variant="outline" className="border-2 border-black font-bold font-mono bg-gray-50">ID: #{job.id}</Badge>
          <Badge variant="outline" className="border-2 border-black font-bold">{job.category}</Badge>
          <Badge variant="outline" className="border-2 border-black font-bold">{job.modality}</Badge>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-tight">{job.title}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-gray-600 font-bold text-sm">
          <span className="inline-flex items-center gap-2">
            <MapPin className="w-4 h-4 text-black shrink-0" />
            {job.neighborhood}, {job.city}
          </span>
          <span className="inline-flex items-center gap-2">
            <Calendar className="w-4 h-4 text-black shrink-0" />
            Início: {new Date(job.startDate).toLocaleDateString("pt-BR")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="w-4 h-4 text-black shrink-0" />
            Até: {new Date(job.endDate).toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* COLUNA ESQUERDA */}
        <div className="space-y-8">
          <Card className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000]">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-black uppercase mb-4">Sobre a Vaga</h2>
              <p className="text-gray-700 leading-relaxed font-medium">{job.description}</p>
            </CardContent>
          </Card>

          <Card className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000]">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-black uppercase mb-4">Requisitos Essenciais</h2>
              <ul className="space-y-2">
                {job.requirementsEssential.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 font-bold text-gray-700">
                    <span className="w-2 h-2 bg-black rounded-full shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>

              {job.requirementsOptional.length > 0 && (
                <>
                  <h3 className="font-display text-xl font-black uppercase mt-6 mb-3">Diferenciais (Desejáveis)</h3>
                  <ul className="space-y-2">
                    {job.requirementsOptional.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 font-bold text-gray-500">
                        <span className="w-2 h-2 bg-gray-300 rounded-full shrink-0 mt-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000]">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-black uppercase mb-4">Sobre a Causa</h2>
              <p className="text-gray-700 leading-relaxed font-medium">{job.causes}</p>
              <div className="flex items-center gap-2 mt-4 p-3 bg-primary/20 border-2 border-primary">
                <Award className="w-5 h-5 text-black shrink-0" />
                <span className="font-black text-sm uppercase">Ao concluir, receba um certificado de horas voluntárias homologado!</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA */}
        <aside className="space-y-6">
          {/* CARD DE CANDIDATURA — protegido por login */}
          <ApplyButton jobId={job.id} jobTitle={job.title} />

          {/* CONTATO DO GESTOR */}
          <Card className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000]">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-black uppercase mb-4">Contato da ONG</h2>
              <div className="space-y-2">
                <div className="font-black text-lg">{job.contactName}</div>
                <div className="text-sm font-bold text-gray-600 break-all">{job.contactEmail}</div>
                <div className="text-sm font-bold text-gray-600">{job.contactPhone}</div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
