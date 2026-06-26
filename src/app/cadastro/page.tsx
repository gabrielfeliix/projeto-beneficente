"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function CadastroPage() {
  const [mode, setMode] = useState<'voluntario' | 'instituicao'>('voluntario');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-10">
        <Badge className="mb-4">Cadastro</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Cadastro de Voluntários e ONGs</h1>
        <p className="text-gray-600 font-bold mt-3 max-w-3xl">Preencha os dados iniciais para iniciar a jornada como voluntário ou instituição parceira.</p>
      </header>

      <div className="flex flex-wrap gap-4 mb-10">
        <button
          type="button"
          onClick={() => setMode('voluntario')}
          className={`flex-1 py-4 font-bold uppercase border-2 ${mode === 'voluntario' ? 'bg-black text-white border-black' : 'bg-white text-black border-border hover:bg-gray-50'}`}
        >
          Voluntário
        </button>
        <button
          type="button"
          onClick={() => setMode('instituicao')}
          className={`flex-1 py-4 font-bold uppercase border-2 ${mode === 'instituicao' ? 'bg-black text-white border-black' : 'bg-white text-black border-border hover:bg-gray-50'}`}
        >
          ONG / Instituição
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {mode === 'voluntario' ? (
          <section className="border-4 border-border p-6 bg-white shadow-brutalist-lg">
            <h2 className="font-display text-3xl font-black uppercase mb-6">Dados do Voluntário</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-bold uppercase text-sm">Nome completo</label>
                <Input required className="mt-2" placeholder="Maria da Silva" />
              </div>
              <div>
                <label className="font-bold uppercase text-sm">CPF</label>
                <Input required className="mt-2" placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="font-bold uppercase text-sm">Data de nascimento</label>
                <Input required type="date" className="mt-2" />
              </div>
              <div>
                <label className="font-bold uppercase text-sm">E-mail</label>
                <Input required type="email" className="mt-2" placeholder="maria@email.com" />
              </div>
              <div>
                <label className="font-bold uppercase text-sm">Telefone</label>
                <Input required className="mt-2" placeholder="(84) 99999-9999" />
              </div>
              <div>
                <label className="font-bold uppercase text-sm">Endereço</label>
                <Input required className="mt-2" placeholder="Rua Exemplo, 123" />
              </div>
              <div>
                <label className="font-bold uppercase text-sm">Profissão</label>
                <Input className="mt-2" placeholder="Professor, pedagogo, analista" />
              </div>
              <div>
                <label className="font-bold uppercase text-sm">Disponibilidade</label>
                <Input className="mt-2" placeholder="Fins de semana, tardes, manhãs" />
              </div>
              <div className="md:col-span-2">
                <label className="font-bold uppercase text-sm">Áreas de interesse</label>
                <Input className="mt-2" placeholder="Educação, saúde, cultura, meio ambiente" />
              </div>
              <div className="md:col-span-2">
                <label className="font-bold uppercase text-sm">Habilidades e qualificações</label>
                <textarea className="w-full mt-2 h-28 border-2 border-border p-3 resize-none" placeholder="Ex: ensino básico, primeiros socorros, técnicas de arrecadação" />
              </div>
              <div className="md:col-span-2">
                <label className="font-bold uppercase text-sm">Contato de emergência</label>
                <Input className="mt-2" placeholder="Nome e telefone" />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" required className="accent-black" />
                  <span className="font-bold text-sm">Li e aceito os termos e condições da plataforma.</span>
                </label>
              </div>
            </div>
          </section>
        ) : (
          <section className="border-4 border-border p-6 bg-white shadow-brutalist-lg">
            <h2 className="font-display text-3xl font-black uppercase mb-6">Dados da Instituição</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-bold uppercase text-sm">Nome da instituição</label>
                <Input required className="mt-2" placeholder="Instituto Esperança" />
              </div>
              <div>
                <label className="font-bold uppercase text-sm">CNPJ</label>
                <Input required className="mt-2" placeholder="00.000.000/0001-00" />
              </div>
              <div>
                <label className="font-bold uppercase text-sm">E-mail institucional</label>
                <Input required type="email" className="mt-2" placeholder="contato@instituto.org" />
              </div>
              <div>
                <label className="font-bold uppercase text-sm">Telefone</label>
                <Input className="mt-2" placeholder="(84) 99999-9999" />
              </div>
              <div className="md:col-span-2">
                <label className="font-bold uppercase text-sm">Endereço da sede</label>
                <Input className="mt-2" placeholder="Rua das Flores, 456" />
              </div>
              <div className="md:col-span-2">
                <label className="font-bold uppercase text-sm">Missão, objetivos e áreas de atuação</label>
                <textarea className="w-full mt-2 h-28 border-2 border-border p-3 resize-none" placeholder="Nossa missão é ..." />
              </div>
              <div className="md:col-span-2">
                <label className="font-bold uppercase text-sm">Dados do representante legal</label>
                <Input className="mt-2" placeholder="Nome, CPF, RG, telefone" />
              </div>
              <div className="md:col-span-2">
                <label className="font-bold uppercase text-sm">Dados bancários</label>
                <Input className="mt-2" placeholder="Banco, agência, conta" />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" required className="accent-black" />
                  <span className="font-bold text-sm">Confirmo que os documentos e dados fornecidos são verdadeiros.</span>
                </label>
              </div>
            </div>
          </section>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="uppercase tracking-wider">Enviar Cadastro</Button>
        </div>

        {submitted && (
          <div className="rounded-xl border-4 border-primary bg-primary/10 p-6 font-bold text-black">
            Cadastro enviado com sucesso. Em breve entraremos em contato para validar seu perfil e ativar seus recursos no sistema.
          </div>
        )}
      </form>
    </div>
  );
}
