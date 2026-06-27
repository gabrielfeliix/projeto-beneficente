# 🌟 Mutirão - Plataforma de Projetos Beneficentes

Mutirão é uma aplicação web moderna projetada para conectar instituições beneficentes e voluntários, facilitando a criação de campanhas de ajuda mútua, gerenciamento de vagas de voluntariado e acompanhamento de candidaturas em tempo real.

---

## 🛠️ Stack Tecnológica

O projeto foi construído utilizando as melhores e mais modernas tecnologias de desenvolvimento web:

- **Framework**: [Next.js 15.5](https://nextjs.org/) (com App Router e suporte a Turbopack)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) para layouts modernos e responsivos
- **Linguagem**: [TypeScript](https://www.typescript.org/) para tipagem estática e segurança
- **Animações**: [Framer Motion](https://www.framer.com/motion/) para micro-interações fluidas
- **Formulários**: [React Hook Form](https://react-hook-form.com/) e [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
- **Validação de Schemas**: [Zod](https://zod.dev/) para sanitização de inputs
- **Ícones**: [Lucide React](https://lucide.dev/) para a interface visual

---

## 🚀 Funcionalidades Principais

- **Feed de Campanhas**: Descubra campanhas beneficentes ativas, progresso de doações e atualizações.
- **Vagas de Voluntariado**: Portal de listagem e candidatura a vagas sociais e mutirões de trabalho.
- **Painel de Controle (Dashboard)**: Acompanhamento de metas, impacto gerado e progresso de campanhas por parte das instituições.
- **Gestão de Perfil**: Perfis customizados para voluntários e instituições.
- **Sistema de Notificações**: Atualizações em tempo real sobre status de candidaturas e novas oportunidades.
- **Persistência Local**: Estado persistido via `localStorage` para testes rápidos sem necessidade de setup de banco de dados complexo.

---

## 🛡️ Segurança e Práticas Recomendadas

Esta versão contém correções para diversos gargalos de segurança e integridade:

- **Cabeçalhos de Segurança (Security Headers)**: Adicionados via `next.config.ts` (e.g., `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, etc.) para proteção contra sequestro de cliques (Clickjacking) e injeções de script.
- **Imagens Remotas Restritas**: O Next.js Image Optimizer foi configurado para aceitar apenas imagens do Unsplash sob o padrão `/photo-**`.
- **Prevenção de Vazamento de Segredos**: Arquivo [.env.example](.env.example) adicionado para documentar variáveis e instruir o uso correto de arquivos locais não-versionados.
- **Validação com TypeScript e ESLint**: Tipagem forte e linter configurados para evitar falhas em tempo de execução.
- **CI de Integração Contínua**: Pipeline de GitHub Actions configurado para executar auditoria de segurança de dependências (`npm audit`), linter e build de produção automaticamente em cada push ou Pull Request.

---

## 📦 Como Rodar o Projeto

1. **Clonar e acessar o repositório**
   ```bash
   git clone https://github.com/gabrielfeliix/projeto-beneficente.git
   cd projeto-beneficente
   ```

2. **Instalar as dependências**
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente**
   Copie o modelo de exemplo para criar suas variáveis locais (se necessário):
   ```bash
   cp .env.example .env.local
   ```

4. **Executar em Desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em [http://localhost:3000](http://localhost:3000).

5. **Gerar Build de Produção**
   ```bash
   npm run build
   npm run start
   ```
