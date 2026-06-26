"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ClipboardList, Search } from 'lucide-react';
import { JobPosting } from '@/domain/entities';

interface JobBoardProps {
  initialJobs: JobPosting[];
}

const categories = ['Todas', 'Educação', 'Saúde', 'Cultura', 'Meio Ambiente', 'Moradia', 'Animais'];

export function JobBoard({ initialJobs }: JobBoardProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');

  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      const matchesQuery = query === '' || job.title.toLowerCase().includes(query.toLowerCase()) || job.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'Todas' || job.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [initialJobs, query, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Marketplace de Vagas para Voluntariado</h1>
        <p className="text-gray-600 font-bold mt-3 max-w-3xl">Filtre pelas suas áreas de interesse, perfil e encontre oportunidades com base nos requisitos da ONG.</p>
      </div>

      <div className="grid gap-4 mb-8 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar vaga, ONG, causa..."
            className="w-full pl-12 h-12 border-2 border-border rounded-none text-lg"
          />
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-12 border-2 border-border rounded-none bg-white text-lg"
        >
          {categories.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-8">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="border-2 rounded-none hover:bg-gray-50 transition-colors">
            <CardContent className="p-6 grid gap-6 sm:grid-cols-[1fr_auto] items-start">
              <div>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="font-display text-2xl font-black uppercase">{job.title}</h2>
                  <Badge variant={job.category === 'Educação' ? 'secondary' : 'default'}>{job.category}</Badge>
                </div>
                <p className="mt-4 text-gray-600 font-medium max-w-3xl">{job.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-gray-500">
                  <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.neighborhood}, {job.city}</span>
                  <span className="inline-flex items-center gap-2"><ClipboardList className="w-4 h-4" /> {job.modality}</span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 sm:items-end">
                <div className="text-right text-sm font-bold text-gray-500">Publicado em {new Date(job.postedAt).toLocaleDateString()}</div>
                <Link href={`/vagas/${job.id}`} className="w-full sm:w-auto">
                  <Button size="lg" className="uppercase tracking-wider">Ver vaga</Button>
                </Link>
                <Link href="/cadastro" className="text-sm font-bold text-primary hover:underline">Cadastre-se para aplicar</Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredJobs.length === 0 && (
          <div className="p-10 border-2 border-border text-center font-bold text-gray-600">Nenhuma vaga encontrada com esses filtros.</div>
        )}
      </div>
    </div>
  );
}
