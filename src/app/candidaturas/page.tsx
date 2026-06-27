import { getApplicationsForVolunteer } from '@/actions/platform';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default async function CandidaturasPage() {
  const applications = await getApplicationsForVolunteer('vol-1');

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <Badge className="mb-4">Candidaturas</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Minhas candidaturas</h1>
        <p className="text-gray-600 font-bold mt-3 max-w-3xl">Acompanhe o status das vagas às quais você se candidatou e converse com os gestores.</p>
      </div>

      <div className="grid gap-6">
        {applications.map((application) => (
          <Card key={application.id} className="border-2 rounded-none">
            <CardContent className="p-6 grid gap-4 sm:grid-cols-[1fr_auto] items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={application.status === 'selected' ? 'default' : application.status === 'rejected' ? 'secondary' : 'outline'}>{application.status.toUpperCase()}</Badge>
                  <h2 className="font-display text-2xl font-black uppercase">{application.jobTitle}</h2>
                </div>
                <p className="text-gray-700 mt-4">{application.message}</p>
                <div className="mt-4 text-sm text-gray-500 space-y-1">
                  <p><strong>Publicado por:</strong> {application.institutionName}</p>
                  <p><strong>Enviado em:</strong> {new Date(application.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                {application.status === 'pending' && (
                  <Button variant="secondary" size="lg" className="uppercase tracking-wider">Enviar mensagem</Button>
                )}
                {application.status === 'selected' && (
                  <Button size="lg" className="uppercase tracking-wider">Confirmar presença</Button>
                )}
                {application.status === 'rejected' && (
                  <Button variant="outline" size="lg" className="uppercase tracking-wider">Ver outras vagas</Button>
                )}
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <MessageSquare className="w-4 h-4" /> Converse com o gestor para alinhar detalhes.
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {applications.length === 0 && (
          <div className="p-10 text-center border-2 border-border font-bold text-gray-600">Você ainda não fez nenhuma candidatura. Explore vagas e candidate-se agora mesmo.</div>
        )}
      </div>
    </div>
  );
}
