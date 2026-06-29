"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ClipboardList, Search, SlidersHorizontal, Clock, Heart, Hammer } from "lucide-react";
import { JobPosting } from "@/domain/entities";

interface JobBoardProps {
  initialJobs: JobPosting[];
}

const categories = ["Todas", "Educação", "Saúde", "Cultura", "Meio Ambiente", "Moradia", "Animais"];
const modalities = ["Todas", "Presencial", "À Distância"];

const causes = [
  "Todas",
  "Crianças",
  "Animais",
  "Idosos",
  "Combate à Fome",
  "Meio Ambiente",
  "Educação",
  "Direitos Humanos",
  "Tecnologia",
];

const skills = [
  "Todas",
  "Design",
  "Tecnologia",
  "Didática/Aulas",
  "Comunicação/Mídias",
  "Cozinha/Nutrição",
  "Artes/Música",
  "Administrativo/Legal",
];

export function JobBoard({ initialJobs }: JobBoardProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [modality, setModality] = useState("Todas");
  const [selectedCause, setSelectedCause] = useState("Todas");
  const [selectedSkill, setSelectedSkill] = useState("Todas");
  const [hoursFilter, setHoursFilter] = useState("Todas"); // "Todas", "up-to-4", "more-than-4"

  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      // 1. Query text matches
      const matchesQuery =
        query === "" ||
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.description.toLowerCase().includes(query.toLowerCase());

      // 2. Category matches
      const matchesCategory = category === "Todas" || job.category === category;

      // 3. Modality matches
      const matchesModality =
        modality === "Todas" ||
        (modality === "Presencial" && job.modality.toLowerCase() === "presencial") ||
        (modality === "À Distância" && (job.modality.toLowerCase().includes("distância") || job.modality.toLowerCase().includes("remoto")));

      // 4. Cause matches
      // Atados style causes_tags fallback matching
      const jobCauseText = (job.causes || "").toLowerCase();
      const matchesCause =
        selectedCause === "Todas" ||
        jobCauseText.includes(selectedCause.toLowerCase());

      // 5. Skill matches
      // Atados style skills matching
      const reqsText = [...(job.requirementsEssential || []), ...(job.requirementsOptional || [])]
        .join(" ")
        .toLowerCase();
      const matchesSkill =
        selectedSkill === "Todas" ||
        reqsText.includes(selectedSkill.toLowerCase()) ||
        (selectedSkill === "Didática/Aulas" && reqsText.includes("aula")) ||
        (selectedSkill === "Comunicação/Mídias" && reqsText.includes("redes"));

      // 6. Hours matches
      // job_postings has weekly_hours. Fallback to 4 if undefined.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jobHours = (job as any).weekly_hours ?? 4;
      const matchesHours =
        hoursFilter === "Todas" ||
        (hoursFilter === "up-to-4" && jobHours <= 4) ||
        (hoursFilter === "more-than-4" && jobHours > 4);

      return matchesQuery && matchesCategory && matchesModality && matchesCause && matchesSkill && matchesHours;
    });
  }, [initialJobs, query, category, modality, selectedCause, selectedSkill, hoursFilter]);

  const clearFilters = () => {
    setQuery("");
    setCategory("Todas");
    setModality("Todas");
    setSelectedCause("Todas");
    setSelectedSkill("Todas");
    setHoursFilter("Todas");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">
            Conexão Voluntária de Impacto
          </h1>
          <p className="text-gray-600 font-bold mt-3 max-w-3xl">
            Filtre por suas causas favoritas, habilidades e disponibilidade de horas para encontrar a oportunidade perfeita de voluntariado.
          </p>
        </div>
        <Link href="/vagas/new" className="shrink-0">
          <Button size="lg" className="font-black uppercase border-2 border-black bg-primary text-black hover:bg-black hover:text-white shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-all">
            Criar Nova Vaga
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-start">
        {/* SIDEBAR FILTERS (NEO-BRUTALISM STYLE) */}
        <aside className="border-4 border-black p-6 bg-white shadow-[6px_6px_0px_0px_#000000] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="font-display text-lg font-black uppercase flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" /> Filtros
            </h2>
            <button
              onClick={clearFilters}
              className="text-xs font-black uppercase text-red-600 hover:underline"
            >
              Limpar Tudo
            </button>
          </div>

          {/* CATEGORIA */}
          <div>
            <label className="font-bold uppercase text-xs text-gray-500 block mb-2">Categoria Geral</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 border-2 border-black rounded-none bg-white font-bold text-sm px-2 focus:ring-0"
            >
              {categories.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* MODALIDADE */}
          <div>
            <label className="font-bold uppercase text-xs text-gray-500 block mb-2">Formato</label>
            <div className="space-y-2">
              {modalities.map((mode) => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                  <input
                    type="radio"
                    name="modality"
                    checked={modality === mode}
                    onChange={() => setModality(mode)}
                    className="w-4 h-4 accent-black border-2 border-black"
                  />
                  <span>{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* CAUSA DO IMPACTO */}
          <div>
            <label className="font-bold uppercase text-xs text-gray-500 block mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Causa Apoiada
            </label>
            <select
              value={selectedCause}
              onChange={(e) => setSelectedCause(e.target.value)}
              className="w-full h-11 border-2 border-black rounded-none bg-white font-bold text-sm px-2 focus:ring-0"
            >
              {causes.map((cause) => (
                <option key={cause} value={cause}>
                  {cause}
                </option>
              ))}
            </select>
          </div>

          {/* HABILIDADE REQUISITADA */}
          <div>
            <label className="font-bold uppercase text-xs text-gray-500 block mb-2 flex items-center gap-1.5">
              <Hammer className="w-3.5 h-3.5 text-blue-500" /> Habilidade
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full h-11 border-2 border-black rounded-none bg-white font-bold text-sm px-2 focus:ring-0"
            >
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          {/* CARGA HORÁRIA */}
          <div>
            <label className="font-bold uppercase text-xs text-gray-500 block mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-green-500" /> Carga Horária Semanal
            </label>
            <select
              value={hoursFilter}
              onChange={(e) => setHoursFilter(e.target.value)}
              className="w-full h-11 border-2 border-black rounded-none bg-white font-bold text-sm px-2 focus:ring-0"
            >
              <option value="Todas">Todas as cargas</option>
              <option value="up-to-4">Até 4 horas / semana</option>
              <option value="more-than-4">Mais de 4 horas / semana</option>
            </select>
          </div>
        </aside>

        {/* SEARCH AND VAGAS LIST */}
        <main className="space-y-6">
          {/* BARRA DE PESQUISA */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por palavras-chave (ex: programador, crianças, aulas)..."
              className="w-full pl-12 h-14 border-4 border-black rounded-none text-lg font-bold shadow-[4px_4px_0px_0px_#000000]"
            />
          </div>

          {/* LISTAGEM DE VAGAS */}
          <div className="grid gap-6">
            {filteredJobs.map((job) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const jobHours = (job as any).weekly_hours ?? 4;
              return (
                <Card
                  key={job.id}
                  className="border-4 border-black rounded-none bg-white hover:shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 transition-all duration-200"
                >
                  <CardContent className="p-6 grid gap-6 md:grid-cols-[1fr_auto] items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-mono font-bold bg-gray-100 border border-gray-300 px-2 py-0.5 text-gray-600">
                          ID: #{job.id}
                        </span>
                        <h2 className="font-display text-2xl font-black uppercase tracking-tight">
                          {job.title}
                        </h2>
                        <Badge className="bg-black text-white hover:bg-black font-black uppercase text-xs px-2.5 py-1">
                          {job.category}
                        </Badge>
                      </div>
                      <p className="text-gray-600 font-bold text-sm leading-relaxed max-w-3xl">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs font-black uppercase text-gray-500 pt-2">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-black" /> {job.neighborhood}, {job.city}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ClipboardList className="w-4 h-4 text-black" /> {job.modality}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-4 h-4 text-black" /> {jobHours}h / semana
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch md:items-end gap-3 justify-between h-full pt-4 md:pt-0 border-t-2 md:border-t-0 border-gray-100">
                      <div className="text-xs font-black uppercase text-gray-400">
                        Postada em {new Date(job.postedAt).toLocaleDateString()}
                      </div>
                      <Link href={`/vagas/${job.id}`}>
                        <Button className="w-full md:w-auto uppercase tracking-wider font-black border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-all">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="p-16 border-4 border-black border-dashed text-center font-black text-gray-500 uppercase tracking-wider bg-gray-50">
                Nenhuma vaga encontrada com os filtros selecionados.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
