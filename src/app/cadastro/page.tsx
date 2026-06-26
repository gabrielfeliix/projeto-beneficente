"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

interface VoluntarioForm {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  endereco: string;
  profissao: string;
  disponibilidade: string;
  areasInteresse: string;
  habilidades: string;
  contatoEmergencia: string;
  aceitaTermos: boolean;
}

interface InstituicaoForm {
  nomeInstituicao: string;
  cnpj: string;
  emailInstitucional: string;
  telefone: string;
  enderecoSede: string;
  missaoObjetivos: string;
  areasAtuacao: string;
  publicoAtendido: string;
  areaGeografica: string;
  estatutoSocial: string;
  atoEleicao: string;
  cartaoCnpj: string;
  representanteNome: string;
  representanteCpf: string;
  representanteRg: string;
  representanteTelefone: string;
  dadosBancarios: string;
  aceitaTermos: boolean;
}

const STORAGE_KEY_VOL = 'cadastro_voluntario';
const STORAGE_KEY_INST = 'cadastro_instituicao';

export default function CadastroPage() {
  const [mode, setMode] = useState<'voluntario' | 'instituicao'>('voluntario');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [voluntario, setVoluntario] = useState<VoluntarioForm>({
    nomeCompleto: '',
    cpf: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    endereco: '',
    profissao: '',
    disponibilidade: '',
    areasInteresse: '',
    habilidades: '',
    contatoEmergencia: '',
    aceitaTermos: false,
  });

  const [instituicao, setInstituicao] = useState<InstituicaoForm>({
    nomeInstituicao: '',
    cnpj: '',
    emailInstitucional: '',
    telefone: '',
    enderecoSede: '',
    missaoObjetivos: '',
    areasAtuacao: '',
    publicoAtendido: '',
    areaGeografica: '',
    estatutoSocial: '',
    atoEleicao: '',
    cartaoCnpj: '',
    representanteNome: '',
    representanteCpf: '',
    representanteRg: '',
    representanteTelefone: '',
    dadosBancarios: '',
    aceitaTermos: false,
  });

  const handleVoluntarioChange = (field: keyof VoluntarioForm, value: string | boolean) => {
    setVoluntario((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleInstituicaoChange = (field: keyof InstituicaoForm, value: string | boolean) => {
    setInstituicao((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateVoluntario = () => {
    if (!voluntario.nomeCompleto.trim()) {
      setError('Nome completo é obrigatório');
      return false;
    }
    if (!voluntario.cpf.trim()) {
      setError('CPF é obrigatório');
      return false;
    }
    if (!voluntario.dataNascimento) {
      setError('Data de nascimento é obrigatória');
      return false;
    }
    if (!voluntario.email.trim()) {
      setError('E-mail é obrigatório');
      return false;
    }
    if (!voluntario.telefone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }
    if (!voluntario.endereco.trim()) {
      setError('Endereço é obrigatório');
      return false;
    }
    if (!voluntario.aceitaTermos) {
      setError('Você deve aceitar os termos e condições');
      return false;
    }
    return true;
  };

  const validateInstituicao = () => {
    if (!instituicao.nomeInstituicao.trim()) {
      setError('Nome da instituição é obrigatório');
      return false;
    }
    if (!instituicao.cnpj.trim()) {
      setError('CNPJ é obrigatório');
      return false;
    }
    if (!instituicao.emailInstitucional.trim()) {
      setError('E-mail institucional é obrigatório');
      return false;
    }
    if (!instituicao.enderecoSede.trim()) {
      setError('Endereço da sede é obrigatório');
      return false;
    }
    if (!instituicao.representanteNome.trim()) {
      setError('Nome do representante legal é obrigatório');
      return false;
    }
    if (!instituicao.aceitaTermos) {
      setError('Você deve confirmar os dados fornecidos');
      return false;
    }
    return true;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (mode === 'voluntario') {
      if (!validateVoluntario()) return;
      localStorage.setItem(STORAGE_KEY_VOL, JSON.stringify(voluntario));
    } else {
      if (!validateInstituicao()) return;
      localStorage.setItem(STORAGE_KEY_INST, JSON.stringify(instituicao));
    }

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-10">
        <Badge className="mb-4">Cadastro</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Cadastro de Voluntários e ONGs</h1>
        <p className="text-gray-600 font-bold mt-3 max-w-3xl">Preencha seus dados completos para fazer parte da nossa comunidade de impacto social.</p>
      </header>

      <div className="flex flex-wrap gap-4 mb-10">
        <button
          type="button"
          onClick={() => { setMode('voluntario'); setSubmitted(false); }}
          className={`flex-1 py-4 font-bold uppercase border-4 transition-colors ${mode === 'voluntario' ? 'bg-black text-white border-black' : 'bg-white text-black border-border hover:bg-gray-50'}`}
        >
          Voluntário
        </button>
        <button
          type="button"
          onClick={() => { setMode('instituicao'); setSubmitted(false); }}
          className={`flex-1 py-4 font-bold uppercase border-4 transition-colors ${mode === 'instituicao' ? 'bg-black text-white border-black' : 'bg-white text-black border-border hover:bg-gray-50'}`}
        >
          ONG / Instituição
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {mode === 'voluntario' ? (
          <>
            {/* Dados Pessoais */}
            <section className="border-4 border-border p-8 bg-white">
              <h2 className="font-display text-2xl font-black uppercase mb-6 pb-4 border-b-4 border-border">Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Nome completo *</label>
                  <Input
                    value={voluntario.nomeCompleto}
                    onChange={(e) => handleVoluntarioChange('nomeCompleto', e.target.value)}
                    placeholder="Maria da Silva"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">CPF *</label>
                  <Input
                    value={voluntario.cpf}
                    onChange={(e) => handleVoluntarioChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Data de nascimento *</label>
                  <Input
                    type="date"
                    value={voluntario.dataNascimento}
                    onChange={(e) => handleVoluntarioChange('dataNascimento', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Profissão</label>
                  <Input
                    value={voluntario.profissao}
                    onChange={(e) => handleVoluntarioChange('profissao', e.target.value)}
                    placeholder="Ex: professor, enfermeira, engenheiro"
                    className="mt-2"
                  />
                </div>
              </div>
            </section>

            {/* Contato */}
            <section className="border-4 border-border p-8 bg-white">
              <h2 className="font-display text-2xl font-black uppercase mb-6 pb-4 border-b-4 border-border">Informações de Contato</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">E-mail *</label>
                  <Input
                    type="email"
                    value={voluntario.email}
                    onChange={(e) => handleVoluntarioChange('email', e.target.value)}
                    placeholder="maria@email.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Telefone *</label>
                  <Input
                    value={voluntario.telefone}
                    onChange={(e) => handleVoluntarioChange('telefone', e.target.value)}
                    placeholder="(84) 99999-9999"
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold uppercase text-sm text-gray-700">Endereço *</label>
                  <Input
                    value={voluntario.endereco}
                    onChange={(e) => handleVoluntarioChange('endereco', e.target.value)}
                    placeholder="Rua Exemplo, 123 - Apt 456"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Contato de emergência</label>
                  <Input
                    value={voluntario.contatoEmergencia}
                    onChange={(e) => handleVoluntarioChange('contatoEmergencia', e.target.value)}
                    placeholder="Nome e telefone"
                    className="mt-2"
                  />
                </div>
              </div>
            </section>

            {/* Perfil de Voluntário */}
            <section className="border-4 border-border p-8 bg-white">
              <h2 className="font-display text-2xl font-black uppercase mb-6 pb-4 border-b-4 border-border">Seu Perfil como Voluntário</h2>
              <div className="space-y-6">
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Disponibilidade para atuar</label>
                  <Input
                    value={voluntario.disponibilidade}
                    onChange={(e) => handleVoluntarioChange('disponibilidade', e.target.value)}
                    placeholder="Ex: fins de semana, tardes, manhãs, segunda a sexta"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Áreas de interesse</label>
                  <Input
                    value={voluntario.areasInteresse}
                    onChange={(e) => handleVoluntarioChange('areasInteresse', e.target.value)}
                    placeholder="Ex: educação, saúde, cultura, meio ambiente, esportes"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Habilidades e qualificações</label>
                  <textarea
                    value={voluntario.habilidades}
                    onChange={(e) => handleVoluntarioChange('habilidades', e.target.value)}
                    placeholder="Ex: ensino básico, primeiros socorros, técnicas de arrecadação, liderança"
                    className="w-full mt-2 h-24 border-2 border-border p-3 font-medium resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Termos */}
            <section className="border-4 border-border p-8 bg-secondary">
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voluntario.aceitaTermos}
                  onChange={(e) => handleVoluntarioChange('aceitaTermos', e.target.checked)}
                  className="w-6 h-6 mt-1 border-2 border-border"
                />
                <span className="font-bold text-sm leading-relaxed">
                  Li e aceito os <strong>termos e condições</strong> da plataforma Mútiração, incluindo a política de privacidade e diretrizes de conduta para voluntários. Declaro que as informações fornecidas são verdadeiras e completas.
                </span>
              </label>
            </section>
          </>
        ) : (
          <>
            {/* Dados Institucionais */}
            <section className="border-4 border-border p-8 bg-white">
              <h2 className="font-display text-2xl font-black uppercase mb-6 pb-4 border-b-4 border-border">Dados da Instituição</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Nome da instituição *</label>
                  <Input
                    value={instituicao.nomeInstituicao}
                    onChange={(e) => handleInstituicaoChange('nomeInstituicao', e.target.value)}
                    placeholder="Instituto ou ONG"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">CNPJ *</label>
                  <Input
                    value={instituicao.cnpj}
                    onChange={(e) => handleInstituicaoChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">E-mail institucional *</label>
                  <Input
                    type="email"
                    value={instituicao.emailInstitucional}
                    onChange={(e) => handleInstituicaoChange('emailInstitucional', e.target.value)}
                    placeholder="contato@instituicao.org"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Telefone</label>
                  <Input
                    value={instituicao.telefone}
                    onChange={(e) => handleInstituicaoChange('telefone', e.target.value)}
                    placeholder="(84) 99999-9999"
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold uppercase text-sm text-gray-700">Endereço da sede *</label>
                  <Input
                    value={instituicao.enderecoSede}
                    onChange={(e) => handleInstituicaoChange('enderecoSede', e.target.value)}
                    placeholder="Rua das Flores, 456"
                    className="mt-2"
                  />
                </div>
              </div>
            </section>

            {/* Dados de Atuação */}
            <section className="border-4 border-border p-8 bg-white">
              <h2 className="font-display text-2xl font-black uppercase mb-6 pb-4 border-b-4 border-border">Dados de Atuação</h2>
              <div className="space-y-6">
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Missão, objetivos e áreas de atuação</label>
                  <textarea
                    value={instituicao.missaoObjetivos}
                    onChange={(e) => handleInstituicaoChange('missaoObjetivos', e.target.value)}
                    placeholder="Descreva a missão, objetivos e principais áreas de atuação da instituição"
                    className="w-full mt-2 h-28 border-2 border-border p-3 font-medium resize-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Público atendido</label>
                  <Input
                    value={instituicao.publicoAtendido}
                    onChange={(e) => handleInstituicaoChange('publicoAtendido', e.target.value)}
                    placeholder="Ex: crianças em situação de vulnerabilidade, idosos, pessoas com deficiência"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Área geográfica de atuação</label>
                  <Input
                    value={instituicao.areaGeografica}
                    onChange={(e) => handleInstituicaoChange('areaGeografica', e.target.value)}
                    placeholder="Ex: Natal, Grande Natal, Rio Grande do Norte"
                    className="mt-2"
                  />
                </div>
              </div>
            </section>

            {/* Documentos */}
            <section className="border-4 border-border p-8 bg-white">
              <h2 className="font-display text-2xl font-black uppercase mb-6 pb-4 border-b-4 border-border">Documentação</h2>
              <div className="space-y-6">
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Estatuto social registrado</label>
                  <Input
                    value={instituicao.estatutoSocial}
                    onChange={(e) => handleInstituicaoChange('estatutoSocial', e.target.value)}
                    placeholder="Ex: arquivo enviado ou número de registro"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Ato de eleição da diretoria vigente</label>
                  <Input
                    value={instituicao.atoEleicao}
                    onChange={(e) => handleInstituicaoChange('atoEleicao', e.target.value)}
                    placeholder="Ex: arquivo enviado ou data da última eleição"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Cartão CNPJ</label>
                  <Input
                    value={instituicao.cartaoCnpj}
                    onChange={(e) => handleInstituicaoChange('cartaoCnpj', e.target.value)}
                    placeholder="Ex: arquivo enviado ou data de emissão"
                    className="mt-2"
                  />
                </div>
              </div>
            </section>

            {/* Representante Legal */}
            <section className="border-4 border-border p-8 bg-white">
              <h2 className="font-display text-2xl font-black uppercase mb-6 pb-4 border-b-4 border-border">Representante Legal *</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Nome *</label>
                  <Input
                    value={instituicao.representanteNome}
                    onChange={(e) => handleInstituicaoChange('representanteNome', e.target.value)}
                    placeholder="Nome completo"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">CPF</label>
                  <Input
                    value={instituicao.representanteCpf}
                    onChange={(e) => handleInstituicaoChange('representanteCpf', e.target.value)}
                    placeholder="000.000.000-00"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">RG</label>
                  <Input
                    value={instituicao.representanteRg}
                    onChange={(e) => handleInstituicaoChange('representanteRg', e.target.value)}
                    placeholder="XX.XXX.XXX-X"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-sm text-gray-700">Telefone</label>
                  <Input
                    value={instituicao.representanteTelefone}
                    onChange={(e) => handleInstituicaoChange('representanteTelefone', e.target.value)}
                    placeholder="(84) 99999-9999"
                    className="mt-2"
                  />
                </div>
              </div>
            </section>

            {/* Dados Bancários */}
            <section className="border-4 border-border p-8 bg-white">
              <h2 className="font-display text-2xl font-black uppercase mb-6 pb-4 border-b-4 border-border">Dados Bancários</h2>
              <div>
                <label className="font-bold uppercase text-sm text-gray-700">Informações bancárias</label>
                <textarea
                  value={instituicao.dadosBancarios}
                  onChange={(e) => handleInstituicaoChange('dadosBancarios', e.target.value)}
                  placeholder="Banco, agência, conta e titular. (Será utilizado apenas para transferências de doações e repasses)"
                  className="w-full mt-2 h-24 border-2 border-border p-3 font-medium resize-none"
                />
              </div>
            </section>

            {/* Termos */}
            <section className="border-4 border-border p-8 bg-secondary">
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={instituicao.aceitaTermos}
                  onChange={(e) => handleInstituicaoChange('aceitaTermos', e.target.checked)}
                  className="w-6 h-6 mt-1 border-2 border-border"
                />
                <span className="font-bold text-sm leading-relaxed">
                  Confirmo que todos os dados e documentos fornecidos são verdadeiros, completos e atualizados. Aceito os <strong>termos de parceria</strong> com a plataforma Mútiração e suas políticas de operação e transparência.
                </span>
              </label>
            </section>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="border-4 border-red-500 bg-red-50 p-6 font-bold text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="submit" size="lg" className="uppercase tracking-wider font-black text-lg">
            Enviar Cadastro
          </Button>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="border-4 border-green-500 bg-green-50 p-6 rounded-lg flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display font-black text-green-700 text-lg">Cadastro enviado com sucesso!</h3>
              <p className="text-green-700 font-bold mt-2">
                Seus dados foram salvos. Em breve entraremos em contato para validar seu perfil e ativar todos os seus recursos na plataforma.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
