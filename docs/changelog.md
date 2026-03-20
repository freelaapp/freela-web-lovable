# Changelog

Todas as mudanças notáveis deste projeto serão documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
seguindo [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.3.0] - 2026-03-20
### Fixed
- **[P1] `Login.tsx`** — Contratantes eram redirecionados para `/dashboard-freelancer` ao fazer login. Corrigido implementando função `detectUserRole()` que verifica perfil de contratante via `GET /users/contractors` e redireciona corretamente.

### Added
- **`detectUserRole()`** exportada em `Login.tsx` — função reutilizável para detecção de role via API
- **Testes unitários** em `src/pages/__tests__/detectUserRole.test.ts` — 13 testes cobrindo todos os cenários de detecção de role

### Notes
- Função `detectUserRole()` valida explicitamente o tipo de `data` (objeto ou array não-vazio), evitando falsos positivos
- `SessionExpiredError` durante role detection agora é tratado corretamente e propagado com mensagem clara
- Build compila sem erros
- Testes: 13/13 passando
- QA Verdict: **APPROVED** — todas as correções validadas

## [0.2.0] - 2026-03-20
### Fixed
- **[P1] `Perfil.tsx`** — Violação de Rules of Hooks: `useAuth()` era chamado dentro da função `switchRole()`. Corrigido extraindo `setRole` diretamente do `useAuth()` no topo do componente.
- **[P2] `CadastroContratante.tsx`** — Navegação para `/dashboard-contratante` após cadastro sem sincronizar o `AuthContext`. Corrigido adicionando chamada a `loginSuccess(userId, "contratante")` antes do `navigate()`.
- **[P3] `auth.ts`** — `initializeAuth()` sobrescrevia `authUser` sem preservar o campo `role` quando apenas `id` estava ausente. Corrigido para preservar `role` existente e tentar extraí-lo do JWT como fallback.
- **[P3] `useUserRole.ts`** — `useEffect` persistia o role default `"freelancer"` no `localStorage` em rotas compartilhadas, sobrescrevendo silenciosamente o role de um contratante. Corrigido para persistir apenas quando o role foi determinado por rota explícita.

### Changed
- **[P3] `AuthContext.tsx`** — Adicionado comentário `@deprecated` em `setRole` na interface `AuthContextValue` para dissuadir uso direto e orientar ao uso de `loginSuccess()` ou `recheckAuth()`.

### Notes
- Correções P1 e P2 são pré-requisito para deploy em produção.
- TypeScript compila sem erros após todas as correções (`tsc --noEmit` limpo).
- QA Verdict: **APPROVED** — zero bugs P1/P2 remanescentes, conformidade com padrões do projeto.

## [0.1.0] - 2026-03-20
### Added
- Setup inicial do projeto — estrutura base React + TypeScript + Vite
- Módulo de autenticação: `AuthContext`, `Login.tsx`, `auth.ts`
  - `loginSuccess()` adicionado ao `AuthContext` para atualização atômica de `isAuthenticated`, `userId` e `role`
  - `logout()` em `auth.ts` corrigido para remover `userRole` do `localStorage`

### Notes
- `docs/changelog.md` criado automaticamente pelo QA Agent na primeira revisão.
- `docs/architecture.md`, `docs/business-rules.md` e `docs/api-contracts.md` ausentes — alertas emitidos no relatório de QA.
