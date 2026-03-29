# Relatório de QA — Freela Web (Frontend)

## Referências

- **Projeto:** `freela-web-lovable` — Plataforma de contratação de freelancers para eventos
- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router v6 + TanStack Query + Zod
- **Deploy:** Vercel / Cloudflare (wrangler.toml presente)
- **Data da análise:** 29/03/2026

---

## Visão Geral da Situação

| Dimensão | Avaliação | Nota |
|----------|-----------|------|
| Estrutura de projeto | Boa base com Lovable/SHADCN | ✅ |
| Configuração TypeScript | Relaxada perigosamente | ⚠️ |
| Arquitetura de código | Páginas inchadas, sem separação de camadas | 🔴 |
| Segurança | .env exposto, tokens em localStorage | 🔴 |
| Qualidade do código | `any` types, fetch direto, catch vazio | ⚠️ |
| Testes | Cobertura mínima (~9 arquivos de teste) | 🔴 |
| UX/Mobile | Bem estruturado, bottom nav, responsivo | ✅ |
| Tratamento de erros | Mensagens centralizadas, bom padrão | ✅ |
| Feature completeness | Mensagens é mock, várias features incompletas | ⚠️ |

**Parecer Final: NEEDS_FIX** — Funcionalmente funcional, mas com problemas estruturais significativos que precisam ser resolvidos antes de produção.

---

## Bugs e Problemas Críticos

### BUG-01: `.env` Commitado no Repositório

- **Arquivo:** `.env`
- **Severidade:** CRÍTICA
- **Prioridade:** P0
- **Problema:** O arquivo `.env` está commitado e contém chaves de API (`VITE_PUSHER_KEY`, `API_BASE_URL`). Embora use prefixo `VITE_` (exposto no client), a API base URL de produção está visível.
- **Impacto:** Chaves Pusher expostas no client-side bundle, URL da API de produção visível.
- **Sugestão:** Adicionar `.env` ao `.gitignore`, usar `.env.example`, rotacionar as chaves Pusher.

### BUG-02: TypeScript Strict Mode Desativado

- **Arquivo:** `tsconfig.json`
- **Severidade:** ALTA
- **Prioridade:** P1
- **Problema:** `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals: false`, `noUnusedParameters: false` — Isso permite que erros de tipo passem despercebidos.
- **Impacto:** Bugs em tempo de execução que o TypeScript deveria prevenir. Ex: acessar propriedades de `undefined`.
- **Sugestão:** Ativar `strict: true` gradualmente.

### BUG-03: 58 Chamadas Diretas a `fetch()` Bypassando `apiFetch`

- **Arquivo:** Várias páginas (DashboardFreelancer, DetalheVaga, Perfil, etc.)
- **Severidade:** ALTA
- **Prioridade:** P1
- **Problema:** O projeto tem um `apiFetch` bem implementado com auto-refresh de token, mas 58 chamadas nas páginas usam `fetch()` direto, perdendo:
  - Auto-refresh de token
  - Tratamento de sessão expirada
  - Header `Origin-type`
  - `credentials: "include"`
- **Impacto:** Sessões podem expirar silenciosamente em funcionalidades críticas (dashboards, perfil).
- **Sugestão:** Migrar todas as chamadas para `apiFetch`.

### BUG-04: 54 Ocorrências de `: any` no Código

- **Arquivo:** Várias páginas
- **Severidade:** MÉDIA
- **Prioridade:** P2
- **Problema:** Uso massivo de `any` destrói a segurança de tipos do TypeScript.
- **Exemplo:** `const vaga: any`, `const body: any`, `(job: any)`.
- **Sugestão:** Criar interfaces adequadas para os dados da API.

### BUG-05: 30 Blocos `catch {}` Vazios

- **Arquivo:** Várias páginas
- **Severidade:** MÉDIA
- **Prioridade:** P2
- **Problema:** Erros são silenciosamente engolidos sem log, sem feedback ao usuário.
- **Sugestão:** Pelo menos logar o erro e mostrar feedback ao usuário.

---

## Problemas de Arquitetura

### ARCH-01: Páginas Gincháticas (God Components)

- **Arquivo:** `DetalheEventoContratante.tsx` (1561 linhas), `DetalheVaga.tsx` (1034), `MeusDados.tsx` (1014), `CadastroContratante.tsx` (929), `Perfil.tsx` (894)
- **Severidade:** ALTA
- **Problema:** Páginas com 800-1500+ linhas contêm tudo: lógica de negócio, chamadas de API, estado, UI. Impossível testar ou manter.
- **Sugestão:** Extrair hooks customizados (`useVacancyDetails`, `useProfile`, etc.) e componentes menores.

### ARCH-02: `formatCurrency` Duplicado

- **Arquivo:** `src/lib/values.ts` e `src/lib/formatters.ts`
- **Problema:** Duas implementações de `formatCurrency` diferentes. A de `values.ts` formata como `R$ 240.00`, a de `formatters.ts` usa `toLocaleString("pt-BR")`.
- **Impacto:** Formatação inconsistente de moeda no app.
- **Sugestão:** Manter apenas a versão de `formatters.ts` (mais robusta com `toLocaleString`).

### ARCH-03: TimelineContext Armazena Estado que Deveria Vir do Backend

- **Arquivo:** `src/contexts/TimelineContext.tsx`
- **Problema:** O estado da timeline (aceite, pagamento, início, fim) é gerenciado apenas no client-side (useState). Se o usuário recarregar a página, todo o progresso é perdido.
- **Sugestão:** O estado de timeline deve vir da API. O contexto deveria ser apenas cache/estado de UI.

### ARCH-04: ESLint Desativa Detecção de Variáveis Não Usadas

- **Arquivo:** `eslint.config.js:23`
- **Problema:** `"@typescript-eslint/no-unused-vars": "off"` — Código morto não é detectado.
- **Sugestão:** Ativar a regra e limpar imports/variáveis não usados.

### ARCH-05: Fetch de Dados Sem TanStack Query

- **Problema:** O projeto instala `@tanstack/react-query` mas quase não o usa. Todas as chamadas de API são feitas com `useEffect` + `useState` + `fetch()` manual, sem:
  - Cache automático
  - Refetch em foco
  - Loading states padronizados
  - Retry automático
  - Stale-while-revalidate
- **Sugestão:** Migrar para `useQuery`/`useMutation` progressivamente.

---

## Problemas de Segurança

### SEC-01: Token JWT Armazenado em `localStorage`

- **Arquivo:** `src/lib/auth.ts`
- **Severidade:** MÉDIA
- **Problema:** `localStorage.setItem("authToken", ...)` — Vulnerável a ataques XSS. Se um script malicioso rodar, pode roubar o token.
- **Mitigação existente:** O refresh token usa cookie httpOnly (correto), mas o access token fica em localStorage.
- **Sugestão:** Mover access token para cookie httpOnly ou usar BFF pattern.

### SEC-02: Dados de Cadastro Pendentes em localStorage

- **Arquivo:** `src/pages/Cadastro.tsx:103`
- **Problema:** `localStorage.setItem("pendingRegisterData", JSON.stringify(pendingData))` — Dados sensíveis (senha em texto plano!) ficam no localStorage.
- **Sugestão:** Não armazenar senha no localStorage. Enviar diretamente na etapa de confirmação.

### SEC-03: Página 404 (NotFound) com Texto em Inglês

- **Arquivo:** `src/pages/NotFound.tsx`
- **Problema:** "Oops! Page not found" e "Return to Home" em inglês em um app 100% em português.
- **Sugestão:** Traduzir para português.

---

## Métricas de Qualidade

| Métrica | Valor | Status |
|---------|-------|--------|
| Total de linhas de código | ~27.731 | ℹ️ |
| Páginas | 30+ | ℹ️ |
| Maior arquivo | 1561 linhas (DetalheEventoContratante) | 🔴 |
| Chamadas `fetch()` diretas | 58 | 🔴 |
| Uso de `: any` | 54 | 🔴 |
| Blocos `catch {}` vazios | 30 | ⚠️ |
| Arquivos de teste | 9 | 🔴 |
| localStorage direto | 76 ocorrências | ⚠️ |
| Console.log/error/warn | 18 | ⚠️ |
| Cobertura de testes | < 10% | 🔴 |

---

## Pontos Positivos

1. **Sistema de Erros Centralizado** — `error-messages.ts` é excelente: mensagens amigáveis, em português, contextualizadas. Padrão que deveria ser copiado por outros projetos.

2. **Componentes UI (shadcn/ui)** — Bem configurados, Tailwind com design tokens, sistema de cores consistente (`freela-amber`, `success`, `warning`), dark mode preparado.

3. **Auth com Refresh Automático** — `apiFetch` implementa corretamente o fluxo de refresh token com single-flight guard (evita múltiplos refreshes simultâneos).

4. **Layout Mobile-First** — Header, BottomNav, AppLayout bem estruturados. Navegação mobile/desktop diferenciada. Safe areas respeitadas.

5. **Formulários com Validação** — Login e Cadastro têm validação inline com feedback visual (indicadores de requisitos de senha).

6. **Imagens Robustas** — `image.ts` com normalização de URLs, suporte a buffers, fallbacks. `pickImageUrlFromPayload` é muito útil.

7. **CPF Validação Correta** — `validateCPF` usa o algoritmo oficial brasileiro.

8. **Pusher para Real-time** — Integração Pusher em `DetalheEventoContratante` para updates de pagamento e check-in.

---

## Gaps de Teste

| Cenário Ausente | Impacto | Justificativa |
|-----------------|---------|---------------|
| Login com sucesso/falha | ALTO | Fluxo crítico, sem teste |
| ProtectedRoute com role errada | ALTO | Segurança de acesso |
| apiFetch com 401 e refresh | ALTO | Autenticação central |
| Criar evento (form validation) | MÉDIO | Fluxo de negócio principal |
| Dashboard freelancer loading states | MÉDIO | UX em estados de erro |
| Perfil: salvar disponibilidade | MÉDIO | CRUD crítico |
| Navegação entre dashboards por role | MÉDIO | Lógica de rota |
| formatCurrency / getDisplayValue | BAIXO | Funções puras, fácil de testar |

---

## Resumo Executivo

Este é um projeto **funcional mas com débito técnico significativo**. A base está boa (React + TypeScript + Tailwind + shadcn), mas a aplicação prática do TypeScript está sendo comprometida pelas configurações relaxadas e pelo uso excessivo de `any`.

Os principais riscos para produção são:

1. **58 chamadas fetch diretas** que bypassam o refresh automático de token
2. **Senha em localStorage** durante o fluxo de cadastro
3. **Estado de timeline apenas no client** (perde-se no refresh)
4. **Páginas com 1000+ linhas** impossíveis de testar unitariamente
5. **Cobertura de testes próxima de zero**

---

## Recomendações Priorizadas

| # | Ação | Esforço | Impacto |
|---|------|---------|---------|
| 1 | Remover `.env` do git e rotacionar chaves | 30min | 🔴 Crítico |
| 2 | Remover senha do localStorage no cadastro | 1h | 🔴 Crítico |
| 3 | Migrar fetch direto → apiFetch (58 ocorrências) | 2-3 dias | 🟠 Alto |
| 4 | Ativar `strictNullChecks` no tsconfig | 1-2 dias | 🟠 Alto |
| 5 | Extrair hooks das páginas gigantes | 3-5 dias | 🟠 Alto |
| 6 | Implementar React Query nos dashboards | 2-3 dias | 🟡 Médio |
| 7 | Adicionar testes nos fluxos críticos | 3-5 dias | 🟡 Médio |
| 8 | Unificar formatCurrency | 30min | 🟢 Baixo |
| 9 | Traduzir NotFound para PT-BR | 5min | 🟢 Baixo |
| 10 | Remover catch vazios, adicionar logging | 1-2 dias | 🟡 Médio |

---

**Parecer: NEEDS_FIX** ⚠️

O projeto está em condição de **desenvolvimento/estágio** mas **não está pronto para produção** devido aos problemas de segurança (P0) e arquitetura (P1) identificados. Após a correção dos 5 itens P0/P1, re-submeter para nova validação.
