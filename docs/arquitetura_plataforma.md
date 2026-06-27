# Documentação de Arquitetura — Doações & Assinaturas Corporativas

Este documento descreve a modelagem de dados, a arquitetura de rotas e middlewares no backend, e a lógica de componentes no front-end para o ecossistema de doações e assinaturas recorrentes B2B da plataforma Mutirão.

---

## 🗄️ 1. Modelagem de Dados (Camada de Banco de Dados)

Abaixo estão as tabelas estruturadas no **PostgreSQL** para suportar doadores simplificados, empresas parceiras com planos recorrentes e posts do feed.

```sql
-- Habilita extensão para UUIDs automáticos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para os tipos de perfis de usuário
CREATE TYPE profile_role_type AS ENUM ('donor', 'volunteer', 'institution', 'fiscal', 'admin', 'company');

-- Enum para os planos de assinatura recorrente de empresas
CREATE TYPE subscription_plan_type AS ENUM ('none', 'mensal_prata', 'mensal_ouro', 'mensal_platina');

-- 1. Tabela Principal de Perfis (Voluntários, ONGs, Doadores, Empresas Assinantes)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    profile_type profile_role_type NOT NULL DEFAULT 'volunteer',
    
    -- Campos de Geolocalização / Endereço
    cep VARCHAR(8) NOT NULL,
    city VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    address TEXT,
    
    -- Campos Específicos de Doadores / Voluntários (Pessoa Física)
    cpf VARCHAR(11) UNIQUE,
    birth_date DATE,
    
    -- Campos Específicos de ONGs / Empresas (Pessoa Jurídica)
    cnpj VARCHAR(14) UNIQUE,
    representative_name VARCHAR(255),
    representative_cpf VARCHAR(11),
    logo_url VARCHAR(512),
    mission TEXT,
    
    -- Controle de Assinatura Corporativa (B2B)
    subscription_plan subscription_plan_type NOT NULL DEFAULT 'none',
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'past_due'
    subscription_id VARCHAR(255), -- ID correspondente no gateway (Stripe/Asaas)
    
    accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Doações Financeiras (Avulsas ou Vinculadas a Campanhas)
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    donor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    donor_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL, -- 'pix', 'credit_card'
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Lançamento de Gastos / Despesas (Prestação de Contas ONGs)
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL, -- 'Alimentação', 'Logística', etc.
    description TEXT NOT NULL,
    receipt_url VARCHAR(512), -- Link da foto da nota ou cupom fiscal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela do Feed de Histórias / Publicações
CREATE TABLE feed_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_type profile_role_type NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(512),
    city VARCHAR(100) NOT NULL, -- Cidade onde o post foi gerado (para filtro de proximidade)
    likes INT NOT NULL DEFAULT 0,
    comments INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Performance para Buscas Rápidas e Geolocalização
CREATE INDEX idx_profiles_cep ON profiles(cep);
CREATE INDEX idx_profiles_sub_status ON profiles(subscription_status);
CREATE INDEX idx_feed_posts_city ON feed_posts(city);
```

---

## 🛠️ 2. Estrutura de Rotas e Middlewares (Camada de Back-end)

Abaixo estão os exemplos de código em **Next.js API Routes / Node.js** para tratamento de webhooks e validação de acessos das empresas assinantes.

### Middleware de Validação de Assinatura Ativa (`middleware.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server";

const CORPORATE_ROUTES = ["/dashboard/esg", "/dashboard/relatorios-fiscais"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isCorporateRoute = CORPORATE_ROUTES.some(route => pathname.startsWith(route));

  if (isCorporateRoute) {
    const authCookie = request.cookies.get("mutirao_user_profile")?.value;
    if (!authCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const user = JSON.parse(decodeURIComponent(authCookie));
      
      // Valida se é empresa e se a assinatura está ativa
      if (user.role !== "company" || user.subscriptionStatus !== "active") {
        // Redireciona para checkout/reativação de assinatura
        return NextResponse.redirect(new URL("/dashboard/reconfigurar-assinatura", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}
```

### Handler de Webhooks de Pagamento Recorrente (`api/webhooks/stripe.ts`)
Escuta os eventos do gateway (ex: Stripe) e atualiza o banco de dados do Supabase. Em caso de inadimplência, bloqueia o status da assinatura automaticamente.
```typescript
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const event = req.body;

  try {
    switch (event.type) {
      // 1. Assinatura criada ou paga com sucesso
      case "invoice.payment_succeeded": {
        const subscriptionId = event.data.object.subscription;
        const customerEmail = event.data.object.customer_email;
        
        await supabase
          .from("profiles")
          .update({ 
            subscription_status: "active",
            subscription_id: subscriptionId 
          })
          .eq("email", customerEmail);
        break;
      }

      // 2. Falha de pagamento (Inadimplência)
      case "invoice.payment_failed": {
        const customerEmail = event.data.object.customer_email;
        
        // Bloqueio automático de recursos ESG da empresa parceira
        await supabase
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("email", customerEmail);
        break;
      }

      // 3. Assinatura cancelada
      case "customer.subscription.deleted": {
        const subscriptionId = event.data.object.id;
        
        await supabase
          .from("profiles")
          .update({ 
            subscription_status: "inactive",
            subscription_plan: "none" 
          })
          .eq("subscription_id", subscriptionId);
        break;
      }
    }
    
    return res.status(200).json({ received: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
```

---

## 💻 3. Lógica de Componentes e APIs (Camada de Front-end)

Abaixo estão os blocos de código React/TypeScript para localização física com fallback e rolagem infinita.

### Validação de Localização (Navigator + ViaCEP Fallback)
```typescript
import { useState } from "react";

export function UseLocationDetector() {
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [cep, setCep] = useState("");
  const [error, setError] = useState("");

  // 1. Detecção automática de Coordenadas -> Reversa para Cidade
  const detectGPS = () => {
    setLoading(true);
    setError("");
    
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada no seu navegador.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Utiliza API gratuita de geocodificação reversa
          const res = await fetch(`https://geocode.xyz/${latitude},${longitude}?json=1`);
          const data = await res.json();
          if (data.city) {
            setCity(data.city);
            setError("");
          } else {
            setError("Não foi possível resolver a cidade via GPS. Insira o CEP manual.");
          }
        } catch {
          setError("Erro na consulta reversa. Por favor, insira o CEP.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Permissão de GPS negada. Por favor, insira o CEP manual.");
        setLoading(false);
      }
    );
  };

  // 2. Fallback CEP Manual via ViaCEP
  const queryCEP = async (cepInput: string) => {
    const cleanCep = cepInput.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setError("CEP não encontrado.");
      } else {
        setCity(data.localidade);
        setNeighborhood(data.bairro);
        setCep(cleanCep);
      }
    } catch {
      setError("Erro ao consultar serviço CEP.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, city, neighborhood, cep, error, detectGPS, queryCEP };
}
```

### Feed com Infinite Scroll (Intersection Observer)
```typescript
import { useEffect, useRef, useState } from "react";
import { FeedPost } from "@/domain/entities";

export function InfiniteScrollFeedList() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchBatch = async (pageNumber: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?page=${pageNumber}&limit=5`);
      const data = await res.json();
      if (data.length < 5) {
        setHasMore(false);
      }
      setPosts((prev) => [...prev, ...data]);
      setPage(pageNumber + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchBatch(page);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading]);

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="p-6 border-4 border-black bg-white shadow-brutalist">
          <h3 className="font-display font-black text-xl">{post.authorName}</h3>
          <p className="mt-2 text-gray-700">{post.content}</p>
        </div>
      ))}

      {hasMore && (
        <div ref={loaderRef} className="py-6 text-center text-xs font-black uppercase text-gray-400">
          Carregando mais publicações...
        </div>
      )}
    </div>
  );
}
```
