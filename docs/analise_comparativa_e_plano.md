# Plano de Implementação Lumiar 2.0 - Referência: Atados e ADRA

Este documento descreve a análise comparativa entre as plataformas líderes de voluntariado no Brasil (**Atados** e **ADRA Brasil**) e o **Lumiar 2.0**, identificando as funcionalidades que faltam no nosso projeto e detalhando a arquitetura, modelo de dados e guias passo a passo para a implementação completa no sistema.

---

## 1. Análise Comparativa e Oportunidades (Gaps)

Ao analisar o **Atados** (focado em redes sociais, matching por tags e voluntariado corporativo) e a **ADRA** (focada em projetos fixos/recorrentes, treinamento estruturado e resposta a emergências), identificamos as seguintes carências no Lumiar 2.0:

| Funcionalidade | Atados | ADRA Brasil | Lumiar 2.0 (Atual) | Status / Oportunidade |
| :--- | :--- | :--- | :--- | :--- |
| **Matching por Causas / Habilidades** | Sim (filtros avançados de interesses/skills) | Não (busca regional/núcleos) | Parcial (campos em profiles, mas sem busca integrada) | **Falta**: Filtro avançado dinâmico na busca de vagas e campanhas. |
| **Modalidade e Frequência** | Remoto/Presencial; Pontual/Recorrente | Voluntário Fixo vs. Temporário | Estático (apenas Modificadores Textuais) | **Falta**: Atributo de tipo de ação e modalidade de serviço estruturado. |
| **Painel de Recrutamento (ONG)** | Completo (Aprovar, Recusar, Entrar em Contato) | Manual (Ficha encaminhada por e-mail/WhatsApp) | Parcial (Tabela existe, mas sem gestão visual) | **Falta**: Painel Kanban para ONGs gerenciarem candidatos e iniciarem chat direto via WhatsApp. |
| **Certificação de Horas de Impacto** | Sim (histórico e validação de horas) | Não (declaração sob demanda) | Não possui | **Falta**: Geração automatizada de PDF de Certificado de Voluntariado assinado digitalmente. |
| **Métricas de Impacto Social** | Horas doadas, ONGs atendidas | Indicadores humanitários globais | Não possui | **Falta**: Contador global e individual de horas e metas financeiras alcançadas. |

---

## 2. Nova Estrutura de Banco de Dados (SQL Supabase)

Para suportar essas funcionalidades premium, execute as seguintes alterações e criações de tabelas adicionais no SQL Editor do Supabase:

```sql
-- 1. Modificar a tabela de vagas (job_postings) para incluir modalidade, frequência e carga horária
ALTER TABLE public.job_postings 
ADD COLUMN IF NOT EXISTS duration_type TEXT CHECK (duration_type IN ('point', 'continuous')) DEFAULT 'point',
ADD COLUMN IF NOT EXISTS weekly_hours INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS causes_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skills_tags TEXT[] DEFAULT '{}';

-- 2. Tabela de Certificados Emitidos
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    volunteer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    institution_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
    volunteer_name TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    hours_donated INTEGER NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verification_code TEXT UNIQUE NOT NULL
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Certificados
DROP POLICY IF EXISTS "Leitura pública de certificados" ON public.certificates;
CREATE POLICY "Leitura pública de certificados" ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Voluntários leem seus próprios certificados" ON public.certificates;
CREATE POLICY "Voluntários leem seus próprios certificados" ON public.certificates FOR SELECT USING (auth.uid() = volunteer_id);

DROP POLICY IF EXISTS "ONGs emitem certificados" ON public.certificates;
CREATE POLICY "ONGs emitem certificados" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = institution_id);

-- 3. Modificar a tabela de candidaturas (applications) para rastrear o status e horas estimadas
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS hours_logged INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS feedback_notes TEXT;
```

---

## 3. Planejamento de Layout e Interface do Usuário (UI/UX)

### A. Barra de Busca e Filtro Avançado (Página `/vagas`)
* **Design**: Layout estilo Neo-brutalismo com cards flutuantes.
* **Componentes**:
  - Filtro por **Causa** (Crianças, Idosos, Animais, Meio Ambiente, Tecnologia).
  - Filtro por **Habilidades** (Design, Desenvolvimento, Cozinha, Pedagogia, Tradução).
  - Filtro de **Localização** (Cidade / Bairro).
  - Seletor de **Modalidade** (Presencial / À Distância).
  - Seletor de **Duração** (Ação Pontual / Fixo Contínuo).

### B. Painel Kanban de Gestão de Candidatos (Página `/dashboard` da ONG)
* **Design**: Colunas dividindo os voluntários pelo status da candidatura:
  - **Pendentes**: Candidatos que acabaram de se inscrever.
  - **Em Contato**: Voluntários sendo entrevistados.
  - **Aprovados**: Candidatos selecionados para a vaga.
  - **Concluídos**: Ação finalizada, prontos para receber o certificado.
* **Ações Rápidas**:
  - Botão **Entrar em Contato**: Abre o WhatsApp Web com uma mensagem personalizada do tipo: *"Olá [Voluntário], recebemos sua candidatura para a vaga [Vaga] no Lumiar. Gostaríamos de conversar!"*.
  - Botão **Aprovar**: Altera o status da candidatura com feedback visual.
  - Botão **Emitir Certificado**: Abre um modal para digitar as horas trabalhadas e gerar o certificado digital.

---

## 4. Guia Passo a Passo de Implementação no Lumiar 2.0

### Passo 1: Atualização dos Modelos e Tipos
Atualize o arquivo de definição de entidades ([src/domain/entities.ts](file:///Users/Adrian/Desktop/estudos/lumiar2.0/src/domain/entities.ts)) ou crie tipos para refletir as novas tags de Causas e Habilidades.

### Passo 2: Implementando os Filtros Dinâmicos de Vaga
Modifique a página [src/app/vagas/page.tsx](file:///Users/Adrian/Desktop/estudos/lumiar2.0/src/app/vagas/page.tsx) para processar os filtros de forma reativa:
```typescript
// Exemplo de filtragem no frontend ou backend
const filteredJobs = jobs.filter(job => {
  const matchesCause = selectedCause ? job.causes === selectedCause : true;
  const matchesSkill = selectedSkill ? job.requirementsEssential.includes(selectedSkill) : true;
  const matchesModality = selectedModality ? job.modality === selectedModality : true;
  return matchesCause && matchesSkill && matchesModality;
});
```

### Passo 3: Geração de Certificados de Impacto Social
Crie a rota de API ou Server Action `/actions/certificates.ts` para lidar com a emissão do certificado:
```typescript
import { supabase } from "@/lib/supabase";

export async function issueCertificate(applicationId: string, hours: number) {
  // 1. Carrega dados da candidatura
  const { data: app } = await supabase.from('applications').select('*').eq('id', applicationId).single();
  if (!app) throw new Error("Candidatura não encontrada");

  // 2. Cria código de verificação único
  const verificationCode = "LUM-" + Math.random().toString(36).substring(2, 9).toUpperCase();

  // 3. Insere na tabela de certificados
  const { data: cert, error } = await supabase.from('certificates').insert({
    volunteer_id: app.volunteer_id,
    institution_id: app.institution_id,
    job_id: app.job_id,
    volunteer_name: app.volunteer_name,
    institution_name: app.institution_name,
    job_title: app.job_title,
    hours_donated: hours,
    verification_code: verificationCode
  }).select().single();

  if (error) throw error;

  // 4. Atualiza candidatura para concluída
  await supabase.from('applications').update({
    status: 'selected',
    hours_logged: hours
  }).eq('id', applicationId);

  return cert;
}
```

### Passo 4: Criando o Visualizador de Certificados (Efeito UAU)
Crie a página `/certificados/[code]/page.tsx` para validação pública do certificado. Qualquer pessoa (incluindo recrutadores ou universidades) poderá digitar o código ou escanear um QR Code para atestar a autenticidade das horas de trabalho voluntário.

---

## 5. Próximos Passos de Execução
Para aplicar essas modificações ao Lumiar 2.0 agora, você pode:
1. Copiar as queries da seção **2** e rodá-las no SQL Editor do Supabase.
2. Autorizar o agente a criar a interface de busca com filtros avançados e o sistema de emissão de certificados nas páginas do projeto.
