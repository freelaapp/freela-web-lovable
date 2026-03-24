# Issues — gig-genius-gateway

Bugs conhecidos, áreas frágeis e workarounds ativos.
Este projeto está em produção — qualquer issue aberto pode estar afetando usuários reais.

---

## Issues resolvidos

### [ISSUE-001] Bug de mescla de perfil contratante/freelancer — RESOLVIDO
- **Domínio**: Autenticação / Perfil de usuário
- **Ambiente**: Produção
- **Sintoma**: Depois de um certo tempo logado como contratante, ao recarregar ou navegar entre abas, usuário aparecia como freelancer mas com informações mescladas do contratante
- **Causa raiz**: 
  - Storage fragmentado (authUser e userRole em chaves separadas)
  - Sem storage listener (abas com estado independente)
  - Race condition entre useEffects que carregam contractor vs provider
  - Chamada redundante de detectUserRole após login
- **Solução implementada**:
  - Storage unificado em authUser (fonte única de verdade)
  - Storage event listener para sincronização entre abas
  - useUserRole usando AuthContext ao invés de localStorage
  - Race condition resolvida com AbortController e cleanup de state
  - Login otimizado (usa role do JWT, evita chamada extra)
- **Status**: Resolvido (2026-03-23)
- **Arquivos modificados**: auth.ts, AuthContext.tsx, useUserRole.ts, Perfil.tsx, Login.tsx
- **Documentação**: `/Users/jonatanmachado/Google Drive/Meu Drive/obsidian/Jonatan/thinkworld/freela/bugs.md` (BUG-AUTH-PROFILE-MERGE)

---

## Áreas de atenção (sem issue aberto, mas historicamente frágeis)

- **Fluxo de autenticação:** JWT refresh e storage — validar sempre ao alterar
- **Navegação entre perfis:** contratante ↔ freelancer — garantir state cleanup

---

## Template para novos issues

```
### [ISSUE-XXX] Título
- **Domínio**: 
- **Ambiente**: produção / staging
- **Sintoma**: 
- **Causa raiz**: 
- **Workaround ativo**: 
- **Solução definitiva**: 
- **Status**: aberto / em andamento / resolvido
```
