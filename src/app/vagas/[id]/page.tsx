import { getJobById } from '@/actions/platform';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, UserCheck, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';

interface ApplyCardProps {
  jobId: string;
}

export default async function JobPage({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id);

  if (!job) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <Badge className="mb-4">Vaga</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">{job.title}</h1>
        <div className="mt-4 flex flex-wrap gap-3 text-gray-600 font-bold">
          <span className="inline-flex items-center gap-2"><MapPin className="w-5 h-5" /> {job.neighborhood}, {job.city}</span>
          <Badge variant={job.category === 'Educação' ? 'secondary' : 'default'}>{job.category}</Badge>
        </div>

        <div className="mt-10 space-y-8">
          <Card className="border-2 rounded-none bg-white">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-display text-2xl font-black uppercase">Descrição da vaga</h2>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </CardContent>
          </Card>

          <Card className="border-2 rounded-none bg-white">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-display text-2xl font-black uppercase">Requisitos essenciais</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {job.requirementsEssential.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3 className="font-bold uppercase">Requisitos desejáveis</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {job.requirementsOptional.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 rounded-none bg-white">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-display text-2xl font-black uppercase">Sobre a causa</h2>
              <p className="text-gray-700 leading-relaxed">{job.causes}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-bold uppercase text-sm">Início</span>
                  <p className="text-gray-700 mt-1">{new Date(job.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-bold uppercase text-sm">Fim</span>
                  <p className="text-gray-700 mt-1">{new Date(job.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <aside className="space-y-6">
        <Card className="border-2 rounded-none bg-primary text-primary-foreground">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-display text-3xl font-black uppercase">Candidatar-se</h2>
            <p className="text-gray-900 font-bold">Verifique os requisitos, aceite os termos e inicie o contato com o gestor.</p>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5" />
                <span className="font-bold">Compatibilidade</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold">Condições e termos</span>
              </div>
            </div>
            <form className="space-y-4">
              <label className="flex flex-col gap-2 text-sm font-bold">
                Confirmo minhas informações e aceito os termos de compromisso.
                <input type="checkbox" className="accent-black" required />
              </label>
              <Button size="lg" className="w-full uppercase tracking-wider">Candidatar-se</Button>
              <Button variant="outline" size="lg" className="w-full uppercase tracking-wider">Conversar com o gestor</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-2 rounded-none bg-secondary">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-display text-2xl font-black uppercase">Dados do gestor</h2>
            <div className="text-gray-700 font-bold">{job.contactName}</div>
            <div className="text-sm text-gray-500">{job.contactEmail}</div>
            <div className="text-sm text-gray-500">{job.contactPhone}</div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
