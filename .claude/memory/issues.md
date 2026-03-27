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

### [ISSUE-002] Renderizacao incorreta de vaga fechada em DetalheEventoContratante — RESOLVIDO
- **Dominio**: Frontend / Fluxo de pagamento (contratante)
- **Ambiente**: Producao
- **Sintoma**: Em `DetalheEventoContratante`, vaga com status fechado ainda exibia bloco de acao de pagamento/CTA como se estivesse disponivel, gerando estado visual inconsistente.
- **Causa raiz**:
  - Condicao de renderizacao considerava apenas existencia do job.
  - Nao havia guarda explicita para status de vaga encerrada no branch principal da tela.
- **Solucao implementada**:
  - Ajustada a condicao de renderizacao em `DetalheEventoContratante` para priorizar status fechado e ocultar acoes de pagamento quando a vaga estiver encerrada.
  - Mantida exibicao apenas do estado de vaga fechada (sem CTA indevido).
- **Status**: Resolvido (2026-03-25)
- **Evidencia QA**: ✅ APROVADO | Build OK | Testes 83/83 PASS

### [ISSUE-003] Correcao de registro anterior (supersede ISSUE-002) — RESOLVIDO
- **Dominio**: Frontend / Detalhe de vaga (contratante)
- **Ambiente**: Producao
- **Correcao semantica**: O ISSUE-002 deve ser desconsiderado para descricao funcional; o bug desta entrega nao era CTA de pagamento.
- **Sintoma correto**: Quando a candidatura era aceita e a vaga ficava `closed`, o bloco de freelancers inscritos continuava aparecendo indevidamente.
- **Regra correta esperada**:
  - Nao exibir o bloco de freelancers inscritos com vaga `closed`.
  - Exibir card unico do freelancer selecionado com foto, nome, avaliacao, contato e botao para abrir perfil completo.
- **Arquivo principal**: `src/pages/DetalheEventoContratante.tsx`
- **Status**: Resolvido (2026-03-25)
- **Evidencia QA**: ✅ APROVADO | Build OK | Testes 83/83 PASS
