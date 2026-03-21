# Architecture

## Stack
- **Framework:** React 18 + TypeScript + Vite
- **State Management:** React Context (AuthContext) + useState/useReducer local
- **Data Fetching:** TanStack Query (React Query v5)
- **Forms:** React Hook Form + Zod
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS 3.4 + class-variance-authority
- **Routing:** React Router DOM v6
- **Testing:** Vitest + React Testing Library
- **Icons:** Lucide React
- **Notifications:** Sonner (toasts)

## Padrão Arquitetural
- **Padrão:** Feature-based (organização por domínio/funcionalidade)
- **Justificativa:** Facilita escalabilidade e separação de responsabilidades em domínios distintos (auth, profile, contractor, freelancer)

## Estrutura de Pastas
```
src/
├── app/                    # Rotas e páginas (App Router pattern)
│   ├── (auth)/            # Grupo de rotas autenticadas/não-autenticadas
│   ├── (public)/          # Rotas públicas
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizáveis (UI atoms/molecules)
│   ├── ui/               # shadcn/ui components
│   └── ...               # Componentes de domínio
├── features/             # Feature modules (lógica de negócio por domínio)
│   ├── auth/
│   │   ├── components/   # Componentes específicos de auth
│   │   ├── hooks/        # Custom hooks de auth
│   │   ├── services/     # Integração com API de autenticação
│   │   ├── store/        # Zustand stores (se aplicável)
│   │   └── validations/  # Schemas Zod
│   ├── contractor/
│   └── freelancer/
├── lib/                  # Utilitários e configurações
│   ├── api.ts           # Cliente HTTP e tipos de resposta
│   ├── auth.ts          # Funções de auth (login, logout, token)
│   └── utils.ts         # Helpers diversos
├── contexts/            # React Contexts (AuthContext, ThemeContext)
├── hooks/               # Custom hooks reutilizáveis
├── pages/               # Páginas legado (em migração para app/)
└── assets/              # Images, fonts, etc.

```

## Decisões Técnicas (ADRs)
| Data | Decisão | Justificativa |
|------|---------|---------------|
| 2025-03-20 | shadcn/ui + Radix | Componentes acessíveis e customizáveis sem lib pesada |
| 2025-03-20 | React Hook Form + Zod | Validação declarativa e tipagem segura |
| 2025-03-20 | TanStack Query | Cache, refetch automático e loading/error states |
| 2025-03-20 | Feature-based layout | Separar domínios: auth, contractor, freelancer |

## Restrições
- **TypeScript estrito:** sem `any`, preferir tipos explícitos
- **Componentes server-first:** usar `use client` apenas quando necessário
- **Acessibilidade:** seguir WCAG 2.1 AA, usar componentes Radix
- **Performance:** lazy loading de rotas, code splitting automático do Vite
- **Testes:** cobertura mínima 80%, testar componentes, hooks e integrações
