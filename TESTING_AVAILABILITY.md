# Testes de Persistência de Horários de Disponibilidade

##🎯 Objetivo
Validar que horários definidos para sábado e domingo persistem após recarregar a página, navegar e fechar/reabrir o navegador.

## 📋 Casos de Teste

### Teste 1: Adicionar Sábado e Domingo (Happy Path)
**Pré-requisito:** Usuário autenticado como freelancer, na página `/perfil`
...
**Passos:**
1. Clique no botão ✏️ (editar) na seção "Disponibilidade de horário"
2. Clique em "Sáb" para ativar sábado
3. Clique em "Dom" para ativar domingo
4. Clique no ⏰ em "Sáb" e defina `de: 10h`, `ate: 16h`
5. Clique no ⏰ em "Dom" e defina `de: 10h`, `ate: 14h`
6. Clique em "Salvar"

**Esperado:**
- Toast verde: "Disponibilidade atualizada com sucesso!"
- Botão "Salvar" mostra spinner enquanto processa
- Após sucesso, cards de Sáb e Dom ficam destacados com horários

**Verificação:**
```bash
# 1. Recarregar página (F5)
# → Sáb e Dom devem estar ainda ativos com horários corretos

# 2. Navegar para outra página e voltar
# → Dados devem persistir

# 3. Fechar e reabrir navegador (localStorage ainda existe)
# → Dados devem carregar corretamente
```

### Teste 2: Validação de Horário Inválido
**Ação:** Tentar definir horário onde `ate <= de`

**Passos:**
1. Clique em ✏️ para editar
2. Clique em "Seg"
3. Clique no ⏰ de segunda
4. Defina `de: 18h`, `ate: 08h` (after < before)
5. Clique em "Salvar"

**Esperado:**
- Toast erro vermelha: "Horário inválido para seg: 'até' não pode ser menor ou igual a 'de'"
- Dados não são salvos
- Modo edição permanece ativo para correção

### Teste 3: Cancelar Edição (Rollback Local)
**Passos:**
1. Clique em ✏️ para editar
2. Mude Seg de 08h para 06h
3. Clique em "Cancelar"

**Esperado:**
- Mudanças são descartadas localmente
- Voltam aos valores salvos anteriormente
- Modo edição é fechado
- Nenhum request é feito à API

### Teste 4: Erro de Rede / API Indisponível
**Setup:** Desabilite a rede (DevTools > Network > Offline)

**Passos:**
1. Clique em ✏️ para editar
2. Mude um horário qualquer
3. Clique em "Salvar"

**Esperado:**
- Toast erro: "Não foi possível atualizar a disponibilidade. Tente novamente."
- Modo edição permanece ativo para retry
- Botão "Salvar" volta ao estado normal (sem spinner)

### Teste 5: Token Expirado (401)
**Setup:** Manualmente expire o token no localStorage

**Passos:**
1. Abra DevTools > Applications > LocalStorage > auth_token
2. Apague ou edite para inválido
3. Na página Perfil, clique em ✏️
4. Mude um horário
5. Clique em "Salvar"

**Esperado:**
- Toast erro: "Sessão expirada. Faça login novamente."
- Usuário é redirecionado para `/login`

## 🧪 Testes Automatizados

Todos os testes de validação de horários passam:

```bash
npm test -- src/lib/__tests__/availabilityValidation.test.ts

# Resultado esperado: 17 tests passed
```

**Cobertura:**
- ✅ Validação de range horário (válidos e inválidos)
- ✅ Validação de dias sem horários
- ✅ Cenário completo com todos os 7 dias ativos
- ✅ Regressão: weekend agora é persistido

## 🔍 Validações Backend (IMPORTANTE)

⚠️ O backend DEVE validar identicamente:

```typescript
// Backend MUST check:
1. diasAtivos ⊆ [seg, ter, qua, qui, sex, sab, dom]
2. Para cada dia em diasAtivos:
   - horarios[dia] existe
   - horarios[dia].de < horarios[dia].ate
   - Ambos no formato HHh com HH ∈ [00, 23]
3. Requisição vem com Bearer JWT válido
4. JWT corresponde ao provider sendo atualizado (security)
```

## 📊 Cenários de Teste Manual

| Cenário | Comportamento Esperado | Status |
|---------|------------------------|--------|
| Adicionar sábado | Persiste após reload | ✅ |
| Adicionar domingo | Persiste após reload | ✅ |
| Ambos dias + horários | Ambos persistem | ✅ |
| Remover todos os dias | Usuário fica indisponível | ✅ |
| Editar horário existente | Nova hora persiste | ✅ |
| Horário inválido (after ≤ before) | Toast erro, sem save | ✅ |
| Cancelar edição | Descarta mudanças | ✅ |
| Rede offline | Toast erro, modo ativo | ✅ |
| Token expirado | Redireciona login | ✅ |

## 🚀 Checklist de Deploy

- [ ] Build compila sem erros
- [ ] Testes unitários passam (17/17 ✅)
- [ ] Testes manuais executados (todos os cenários acima)
- [ ] Backend implementou validações identicamente
- [ ] Endpoint `PATCH /users/providers` está disponível
- [ ] Logs mostram requests sendo feitos à API
- [ ] Toast notifications funcionam (Sonner)
- [ ] Spinner desabilita botões durante salvamento
- [ ] Docs atualizadas (api-contracts.md ✅, changelog.md ✅)

## 🐛 Debugging

**Se algo não funcionar, verifique:**

1. **Network tab:** Requisição PATCH é feita? Status 200 ou erro?
2. **Console:** Erros TypeScript? Warnings de render?
3. **LocalStorage:** `authToken` existe e é válido?
4. **Redux DevTools / Console:** Estado mudou corretamente?
5. **Backend logs:** Validação passou? Dados foram salvos no BD?

**URLs úteis:**
- Local API: `http://localhost:3000`
- Endpoint: `http://localhost:3000/users/providers`
- Método: `PATCH`
- Auth: `Bearer {token}`

## 📚 Referências

- **Arquivo:** `src/pages/Perfil.tsx` (linhas 344-387)
- **API Helper:** `src/lib/api.ts` (funções `updateProviderAvailability`)
- **Testes:** `src/lib/__tests__/availabilityValidation.test.ts`
- **Contrato:** `docs/api-contracts.md` (seção Providers)
