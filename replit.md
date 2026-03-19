# HabiTracker

Aplicativo de rastreamento de hábitos em português brasileiro com autenticação via Google.

## Arquitetura

- **Frontend**: React + TypeScript + Vite, Tailwind CSS + shadcn/ui, TanStack Query, Wouter
- **Backend**: Express.js + TypeScript
- **Banco de Dados**: PostgreSQL via Drizzle ORM (tabelas de auth), armazenamento em memória para dados da app
- **Autenticação**: Replit Auth (OpenID Connect) com suporte a Google, GitHub, Apple, X

## Funcionalidades

- Rastreamento de hábitos diários com streaks e histórico
- Planos de estudo estruturados (Frontend, Algoritmos, Lógica de Programação)
- Controle de uso de apps (app usage tracker)
- Estatísticas com gráficos responsivos
- Interface totalmente em português brasileiro
- Autenticação com Google via Replit Auth

## Estrutura de Arquivos

```
shared/
  schema.ts           - Schema Drizzle (re-exporta models/auth + tabelas da app)
  models/
    auth.ts           - Tabelas users + sessions para autenticação

server/
  index.ts            - Configuração Express + setupAuth
  routes.ts           - Rotas da API
  storage.ts          - MemStorage para hábitos, sessões de estudo, uso de apps
  db.ts               - Conexão PostgreSQL com Drizzle
  replit_integrations/auth/
    index.ts          - Re-exporta módulos de auth
    replitAuth.ts     - Configuração OIDC + passport
    storage.ts        - Operações de usuário no PostgreSQL
    routes.ts         - Rota /api/auth/user

client/src/
  pages/
    landing.tsx       - Tela de boas-vindas para usuários não autenticados
    dashboard.tsx     - Painel principal
    habits.tsx        - Gerenciamento de hábitos
    study.tsx         - Sessões de estudo
    stats.tsx         - Estatísticas
  hooks/
    use-auth.ts       - Hook de autenticação (useAuth)
  components/
    layout/header.tsx - Header com avatar e logout do usuário
```

## Rotas de Auth

- `GET /api/login` — Inicia o fluxo de login (redireciona para provedor OAuth)
- `GET /api/logout` — Faz logout e redireciona
- `GET /api/auth/user` — Retorna o usuário autenticado atual

## Configuração para Android

Ver `ANDROID_README.md` para instruções de build com Capacitor.
