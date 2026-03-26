# Documentação do Projeto Freela

Este documento descreve a arquitetura, a estrutura de pastas e a integração com a API do projeto Freela.

## 🏗️ Arquitetura do Projeto.

O projeto é uma aplicação web moderna construída com:

- **Framework**: React 18 com Vite e TypeScript.
- **Estilização**: Tailwind CSS e Shadcn UI (baseado em Radix UI).
- **Roteamento**: React Router DOM (v6).
- **Gerenciamento de Estado**: React Context API para autenticação e modos de serviço.
- **Comunicação API**: Fetch API com um wrapper customizado (`apiFetch`) para gerenciamento de tokens.
- **Tempo Real**: Pusher JS para atualizações de status de pagamento em tempo real.
- **Formulários**: React Hook Form com validação Zod.

### Gerenciamento de Estado (Contexts)

- **AuthContext**: Controla o estado de autenticação do usuário, armazena o `userId` e gerencia o ciclo de vida da sessão (login, logout, revalidação).
- **ModeContext**: Gerencia o modo de operação do aplicativo: "casa" (Freela em Casa) ou "empresas" (Freela para Empresas).

### Camada de API e Autenticação

A comunicação com o backend (`https://api.freelaservicos.com.br`) é centralizada em `src/lib/api.ts` e `src/lib/auth.ts`.

- **apiFetch**: Um wrapper que injeta automaticamente o token `Bearer` nos headers e lida com o erro 401 (Unauthorized) tentando renovar o token via `/users/auth/refresh` de forma transparente.
- **JWT**: O token é armazenado no `localStorage`, e a expiração é controlada para disparar renovações automáticas.

---

## 📁 Estrutura de Pastas

```text
src/
├── assets/          # Imagens, logotipos e recursos estáticos.
├── components/      # Componentes reutilizáveis.
│   ├── ui/          # Componentes primitivos do Shadcn UI.
│   ├── layout/      # Estruturas globais (Header, Footer, Nav).
│   ├── home/        # Seções da landing page.
│   ├── criar-evento/ # Lógica e UI para criação de vagas.
│   └── ...          # Outros componentes específicos de domínio.
├── contexts/        # Providers de contexto do React (Auth, Mode).
├── hooks/           # Hooks customizados (useAuth, useMode, useToast).
├── lib/             # Lógica central, utilitários, serviços e config de API.
├── pages/           # Páginas principais da aplicação (rotas).
└── test/            # Configurações e arquivos de teste.
```

---

## 🔌 Endpoints e Integrações

Abaixo estão os principais endpoints utilizados, as páginas que os consomem e seus payloads.

### Autenticação e Usuário

| Endpoint | Método | Página | Payload (exemplo/campos) |
| :--- | :--- | :--- | :--- |
| `/users/login` | POST | `Login.tsx` | `{ email, password, date }` |
| `/users/register` | POST | `Cadastro.tsx` | `{ name, email, phoneNumber, password, status, createdAt }` |
| `/users/auth/refresh` | POST | `lib/auth.ts` | `{} ` (Usa cookies httpOnly) |
| `/users/confirm-email` | POST | `ConfirmarEmail.tsx` | `{ code, email, createdAt }` |
| `/users/generate-email-confirmation-code` | GET | `Cadastro.tsx`, `ConfirmarEmail.tsx` | Query param: `email` |
| `/users/contractors` | GET | `DashboardContratante.tsx`, `Login.tsx` | - |

### Contratantes e Freelancers (Provedores)

| Endpoint | Método | Página | Payload |
| :--- | :--- | :--- | :--- |
| `/contractors/` | POST | `CadastroContratante.tsx` | `FormData` (cnpj/cpf, name, images, addresses, etc.) |
| `/providers/` | POST | `CadastroFreelancerAreas.tsx` | `FormData` (cpf, profileImage, availability, bio, etc.) |
| `/providers/:id` | GET | `DetalheEventoContratante.tsx` | - |
| `/users/providers` | GET | `DetalheVaga.tsx` | - |

### Vagas e Candidaturas

| Endpoint | Método | Página | Payload |
| :--- | :--- | :--- | :--- |
| `/vacancies` | POST | `CriarEventoEmpresas.tsx` | `{ establishment, description, jobDate, contractorId, freelancers: [...] }` |
| `/vacancies/:id` | GET | `DetalheVaga.tsx`, `DetalheEventoContratante.tsx` | - |
| `/vacancies/jobs` | GET | `DetalheEventoContratante.tsx` | Query param: `vacancyId` |
| `/vacancies/candidacies` | GET | `DetalheEventoContratante.tsx` | Query param: `vacancyId` |
| `/candidacies` | POST | `DetalheVaga.tsx` | `{ providerId, vacancyId, status, createdAt }` |
| `/candidacies/:id/accept` | PATCH | `DetalheEventoContratante.tsx` | - |
| `/candidacies/:id/reject` | PATCH | `DetalheEventoContratante.tsx` | - |

### Jobs e Pagamentos

| Endpoint | Método | Página | Payload |
| :--- | :--- | :--- | :--- |
| `/jobs/:id` | GET | `DetalheVaga.tsx`, `DetalheEventoContratante.tsx` | - |
| `/jobs/:id/payments` | POST | `DetalheEventoContratante.tsx` | `{ vacancyId, contractorId, providerId, providerPixKeyId, method }` |
| `/jobs/:id/payments` | GET | `DetalheEventoContratante.tsx` | - |
| `/jobs/:id/schedule` | PATCH | `DetalheEventoContratante.tsx` | - |
| `/jobs/:id/terminate` | PATCH | `DetalheEventoContratante.tsx` | - |
| `/providers/jobs/check-ins/code` | POST | `DetalheEventoContratante.tsx` | `{ providerId, jobId }` |
| `/providers/jobs/check-outs/code` | POST | `DetalheEventoContratante.tsx` | `{ providerId, jobId }` |
| `/providers/jobs/feedbacks` | POST | `DetalheEventoContratante.tsx` | `{ comment, star, sender, receiver, jobId, providerAttendedJob, createdAt }` |

---

## 📡 Tempo Real (Pusher)

O projeto utiliza o Pusher para monitorar atualizações de pagamento sem necessidade de polling manual na página de detalhes do evento do contratante.

- **App Key**: `f8d94fc93946ed0f4e0b`
- **Cluster**: `sa1`
- **Canal**: `payments`
- **Evento**: `payment.updated`

---

## 🛠️ Tecnologias Principais

- **Vite**: Build tool e dev server.
- **Tailwind CSS**: Framework CSS utilitário.
- **Lucide React**: Biblioteca de ícones.
- **Radix UI**: Primitivas de UI acessíveis.
- **React Hook Form**: Gerenciamento de formulários.
- **Zod**: Esquemas de validação.
- **TanStack Query**: Otimização de requisições (mencionado no package.json).
