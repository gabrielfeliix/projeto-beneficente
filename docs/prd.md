# PRD V1 — Plataforma de Transparência e Visibilidade de Projetos Sociais (MVP Hackathon)

# Visão do Produto

Construir uma plataforma web focada no Rio Grande do Norte que centraliza campanhas beneficentes em um único ambiente, permitindo que qualquer pessoa, projeto social ou organização publique campanhas, mantenha um histórico transparente e conecte doadores e voluntários.

O MVP não terá como objetivo processar pagamentos. O foco será demonstrar descoberta, transparência e confiança.

---

# Problema

Hoje campanhas sociais enfrentam diversos problemas:

* divulgação fragmentada entre Instagram, WhatsApp e Facebook;
* ausência de histórico centralizado;
* baixa credibilidade;
* dificuldade para encontrar projetos locais;
* dificuldade para conectar voluntários;
* inexistência de um diretório regional.

A plataforma resolve esses problemas oferecendo um perfil vivo para cada campanha.

---

# Objetivo do MVP

Permitir que um usuário consiga:

1. Criar uma campanha.
2. Publicar atualizações.
3. Compartilhar um único link.
4. Construir automaticamente um histórico.
5. Permitir que outras pessoas acompanhem toda a evolução.

---

# Público

## Organizador

Pessoa física

ONG

Projeto comunitário

Igreja

Associação

Empresa

---

## Visitante

Doador

Voluntário

Empresa

Morador

---

# Fluxo Principal

Criar conta

↓

Criar campanha

↓

Adicionar informações

↓

Publicar

↓

Receber página pública

↓

Adicionar atualizações

↓

Compartilhar link

↓

Usuários acompanham evolução

---

# Funcionalidades do MVP

## 1. Autenticação

Login

Cadastro

Logout

Editar perfil

---

## 2. Perfil do Organizador

Foto

Nome

Cidade

Bairro

Descrição

Telefone

Instagram

Quantidade de campanhas

---

## 3. Criar Campanha

Campos:

Título

Descrição

Categoria

Cidade

Bairro

Endereço aproximado

Tipo da campanha

Necessidade principal

Meta financeira (opcional)

Data final

Imagem de capa

Galeria de fotos

PIX (somente exibição)

Contato

Tags

Status

---

# Categorias

Alimentação

Saúde

Educação

Animais

Desastres

Moradia

Esporte

Cultura

Meio Ambiente

Outro

---

# Tipos de ajuda

Dinheiro

Alimentos

Roupas

Medicamentos

Serviços

Voluntários

Materiais

Equipamentos

---

# Página Pública da Campanha

Imagem principal

Título

Organizador

Cidade

Bairro

Categoria

Descrição

Objetivo

Necessidades atuais

Botão Compartilhar

Botão Quero Ajudar

Timeline

Galeria

Comentários

Avaliações

---

# Timeline (Principal diferencial)

Cada atualização gera automaticamente um registro.

Exemplo:

Campanha criada

Recebemos 20 cestas

Meta atingida

Entrega realizada

Fotos publicadas

Prestação de contas

Toda atualização permanece registrada.

Nunca pode ser apagada (apenas ocultada pelo administrador).

---

# Feed da Campanha

O organizador pode criar posts.

Cada post possui:

Texto

Imagem

Vídeo (URL)

Data

Curtidas

Comentários

Compartilhamentos (contador)

Esses posts aparecem:

na página da campanha

na timeline

no feed geral

---

# Feed Geral

Mostrar campanhas recentes

Mostrar atualizações recentes

Filtro por:

Cidade

Bairro

Categoria

Urgência

Mais recentes

Mais populares

---

# Sistema de Avaliações

Usuário pode avaliar:

★★★★★

Comentário

As avaliações aparecem na campanha.

---

# Comentários

Usuários podem comentar em:

campanhas

atualizações

---

# Compartilhamento Inteligente

Cada campanha possui:

URL amigável

QR Code

Botão copiar link

Botão compartilhar WhatsApp

Botão compartilhar Instagram (gerar card futuramente)

---

# Diário da Campanha

Sempre que o organizador registra algo:

"Entregamos alimentos."

Isso automaticamente:

entra na Timeline

aparece no Feed

fica registrado no Histórico

gera transparência

---

# Perfil Público da Campanha

Mostrar:

História

Objetivo

Fotos

Timeline

Atualizações

Avaliações

Comentários

Localização

Organizador

Campanhas relacionadas

---

# Busca

Pesquisar por:

Nome

Cidade

Bairro

Categoria

Tags

---

# Página Inicial

Banner

Pesquisar campanhas

Categorias

Campanhas recentes

Campanhas em destaque

Mapa (placeholder)

Atualizações recentes

---

# Painel do Organizador

Minhas campanhas

Criar campanha

Editar campanha

Nova atualização

Comentários

Avaliações

Compartilhamentos

Visualizações

---

# Diferenciais do MVP

## Histórico Unificado

Toda atualização fica organizada em uma linha do tempo permanente.

---

## Link Único

Toda campanha possui apenas um link para divulgação.

Não importa onde ela seja compartilhada.

---

## Transparência

Toda ação gera histórico.

A campanha se torna uma página viva.

---

## Hiperlocal

Todas as campanhas possuem:

Cidade

Bairro

Estado

Permitindo descoberta regional.

---

# Fora do Escopo (Hackathon)

Sistema de pagamentos

Chat

Aplicativo mobile

Notificações push

Sistema completo de moderação

Integrações com Instagram/Facebook

Sistema de IA

Sistema de verificação documental

---

# Arquitetura Recomendada

Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod

Backend

* Supabase
* PostgreSQL
* Storage
* Authentication
* Row Level Security (RLS)

Deploy

* Vercel

---

# Regras Arquiteturais Inegociáveis

* Utilizar Clean Architecture.
* Componentes pequenos e reutilizáveis.
* Separação clara entre UI, lógica e acesso a dados.
* Nenhuma lógica de negócio dentro dos componentes React.
* Tipagem completa em TypeScript.
* Validação compartilhada utilizando Zod.
* Nenhum dado mockado na versão final.
* Utilizar Server Components sempre que possível.
* Server Actions para mutações.
* Estrutura preparada para crescimento modular.
* Código documentado e legível.

---

# Critério de Sucesso do MVP

Ao final da demonstração, qualquer pessoa deve conseguir:

* Criar uma campanha em menos de 3 minutos.
* Compartilhar um único link.
* Publicar atualizações em formato de diário.
* Visualizar uma timeline organizada da campanha.
* Encontrar campanhas por cidade e bairro.
* Entender rapidamente quem criou a campanha, qual seu objetivo e como ajudar.

Se esses cinco objetivos forem atingidos, o MVP valida a proposta central da plataforma: transformar campanhas sociais em iniciativas mais visíveis, organizadas e transparentes.
