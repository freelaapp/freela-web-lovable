# Relatório de Auditoria de Segurança — Freela Web

**Projeto:** `freela-web-lovable`
**Data da análise:** 29/03/2026
**Nível de Risco Geral:** 🔴 **ALTO**

---

## Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Vulnerabilidades Críticas (P0)](#vulnerabilidades-críticas-p0)
3. [Vulnerabilidades Altas (P1)](#vulnerabilidades-altas-p1)
4. [Vulnerabilidades Médias (P2)](#vulnerabilidades-médias-p2)
5. [Pontos Positivos](#pontos-positivos)
6. [npm audit — Dependências Vulneráveis](#npm-audit--dependências-vulneráveis)
7. [Matriz de Risco](#matriz-de-risco)
8. [Ações Corretivas Priorizadas](#ações-corretivas-priorizadas)

---

## Resumo Executivo

A auditoria identificou **3 vulnerabilidades críticas**, **4 vulnerabilidades altas** e **4 vulnerabilidades médias**. Além disso, o `npm audit` reportou **18 vulnerabilidades em dependências** (8 high, 7 moderate, 3 low).

Os pontos mais graves são:

1. **Vulnerabilidade XSS no React Router** (CVSS 8.0) — correção disponível via `npm audit fix`
2. **Arquivo `.env` commitado no repositório** — chaves de API expostas
3. **Senha armazenada em plaintext no localStorage** — risco de credenciais vazadas

O projeto **NÃO está pronto para produção** até que os itens P0 sejam resolvidos.

---

## Vulnerabilidades Críticas (P0)

### VULN-01: Vulnerabilidade XSS no React Router (CVSS 8.0)

- **Pacote:** `react-router-dom` via `@remix-run/router <=1.23.1`
- **Advisory:** [GHSA-2w69-qvjg-hvjx](https://github.com/advisories/GHSA-2w69-qvjg-hvjx)
- **Severidade:** HIGH — XSS via Open Redirects
- **Status:** Correção disponível (`npm audit fix`)
- **Impacto:** Atacante pode injetar scripts via URLs maliciosas que o router processa
- **Ação:** Executar `npm audit fix` imediatamente

### VULN-02: Arquivo `.env` Commitado no Repositório

- **Arquivo:** `.env` (raiz do projeto)
- **Conteúdo exposto:**
  ```
  API_BASE_URL=https://api.freelaservicos.com.br
  VITE_PUSHER_KEY=f8d94fc93946ed0f4e0b
  VITE_PUSHER_CLUSTER=sa1
  ```
- **Problema:** `.env` **NÃO** está no `.gitignore` — já está no histórico git
- **Impacto:**
  - URL da API de produção exposta
  - Chave do Pusher exposta (permite conectar ao WebSocket e interceptar eventos em tempo real)
  - Qualquer pessoa com acesso ao repo tem essas chaves
- **Ação Imediata:**
  1. Adicionar `.env` ao `.gitignore`
  2. Criar `.env.example` sem valores reais
  3. **Rotacionar a chave Pusher** no dashboard do Pusher
  4. Considerar remover `.env` do histórico com `git filter-branch` ou BFG

### VULN-03: Senha Armazenada em localStorage (Plaintext)

- **Arquivo:** `src/pages/Cadastro.tsx:86-103`
- **Trecho vulnerável:**
  ```typescript
  const pendingData = {
    name: formData.nome,
    email: emailNormalizado,
    phoneNumber: formData.celular.replace(/\D/g, ""),
    password: formData.password, // ⚠️ SENHA EM TEXTO PLANO!
    status: "active",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("pendingRegisterData", JSON.stringify(pendingData));
  ```
- **Consumidores do `pendingRegisterData`:**
  - `src/pages/ConfirmarEmail.tsx:64`
  - `src/pages/ConfirmarEmail.tsx:93`
  - `src/pages/ConfirmarEmail.tsx:119`
  - `src/pages/CadastroFreelancer.tsx:150`
  - `src/pages/CadastroContratante.tsx:105`
- **Impacto:** Qualquer script no domínio (XSS, extensão de browser maliciosa) pode ler a senha em plaintext do localStorage
- **Ação:** Enviar a senha apenas no momento do `POST /users/register`, não armazenar intermediariamente

---

## Vulnerabilidades Altas (P1)

### VULN-04: Token JWT em localStorage

- **Arquivo:** `src/lib/auth.ts:69`
- **Trecho:** `localStorage.setItem("authToken", JSON.stringify(newAuthToken))`
- **Risco:** Vulnerável a ataques XSS. Se qualquer script malicioso rodar no contexto da página, pode roubar o token JWT.
- **Padrão seguro:** Usar cookies `httpOnly` + `Secure` + `SameSite=Strict` para o access token (igual já faz com o refresh token)
- **Impacto:** Se explorado, atacante pode impersonar o usuário até o token expirar
- **Observação:** O refresh token já é armazenado corretamente em cookie httpOnly. O access token deveria seguir o mesmo padrão.

### VULN-05: 18 Vulnerabilidades em Dependências

Ver seção detalhada em [npm audit](#npm-audit--dependências-vulneráveis).

Resumo:

| Severidade | Quantidade | Exemplos |
|-----------|-----------|---------|
| 🔴 High | 8 | react-router XSS, rollup path traversal, flatted DoS, minimatch ReDoS, picomatch injection, glob command injection |
| 🟠 Moderate | 7 | esbuild dev server, ajv ReDoS, js-yaml prototype pollution, lodash prototype pollution |
| 🟡 Low | 3 | @tootallnate/once |

### VULN-06: Sem Headers de Segurança no Deploy

- **Verificado:** `vercel.json` não contém headers de segurança
- **Conteúdo atual do vercel.json:**
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- **Headers ausentes:**
  - `Content-Security-Policy` (CSP) — sem proteção contra XSS
  - `X-Frame-Options` — vulnerável a clickjacking
  - `X-Content-Type-Options` — MIME sniffing permitido
  - `Strict-Transport-Security` (HSTS) — sem forçar HTTPS
  - `Referrer-Policy` — pode vazar URLs sensíveis
- **Ação:** Adicionar headers ao `vercel.json`

Exemplo de configuração recomendada:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.freelaservicos.com.br wss://ws-mt1.pusher.com; frame-ancestors 'none';" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### VULN-07: Sem Validação CSRF

- **Problema:** Todas as chamadas API são fetchs com `credentials: "include"` mas sem tokens CSRF
- **Fluxo atual:**
  - `apiFetch` envia `Origin-type: Web` como header custom
  - `credentials: "include"` envia cookies automaticamente
  - Não há token CSRF nem validação de `Origin`/`Referer` verificada
- **Risco:** Um site malicioso pode fazer requisições autenticadas em nome do usuário (se ele estiver logado)
- **Mitigação parcial:** O header `Origin-type: Web` oferece alguma proteção se o backend validar o `Origin` header, mas não é um padrão CSRF adequado
- **Ação:** Implementar padrão double-submit cookie ou SameSite=Strict nos cookies de sessão

---

## Vulnerabilidades Médias (P2)

### VULN-08: Sem Rate Limiting no Frontend

- **Login:** `Login.tsx` trata 429 do backend, mas não implementa cooldown client-side
- **Email Confirmation:** Tem cooldown de 60s para reenvio
- **Criação de eventos/criar conta:** Sem limite de tentativas client-side
- **Risco:** Ataques de força bruta, flood de requisições
- **Ação:** Adicionar debounce/throttle nos forms de login e cadastro

### VULN-09: `document.cookie` sem Flags de Segurança

- **Arquivo:** `src/components/ui/sidebar.tsx:68`
- **Trecho:**
  ```typescript
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  ```
- **Problema:** Cookie sem `Secure`, `HttpOnly`, `SameSite`
- **Impacto baixo:** É apenas o estado da sidebar (não é dado sensível), mas revela padrão inseguro
- **Ação:** Adicionar flags `Secure; SameSite=Lax` ao cookie

### VULN-10: `dangerouslySetInnerHTML` em Chart Component

- **Arquivo:** `src/components/ui/chart.tsx:70`
- **Uso:** Geração dinâmica de CSS via `__html`
- **Risco:** Se os dados de config do chart vierem de fonte não confiável, pode ser vetor de XSS
- **Mitigação atual:** O shadcn/ui chart usa isso para CSS dinâmico — baixo risco se a config for sempre interna
- **Ação:** Garantir que chartConfig nunca receba dados de input do usuário

### VULN-11: Chamadas Diretas a APIs Externas Sem Validação

- **viacep.com.br:** Chamado em 4 arquivos sem validação de resposta
  - `src/components/criar-evento/CriarEventoEmpresas.tsx:69`
  - `src/pages/MeusDados.tsx:178`
  - `src/pages/MeusDadosContratante.tsx:494`
  - `src/pages/CadastroFreelancer.tsx:97`
  - `src/pages/CadastroContratante.tsx:148`
- **brasilapi.com.br:** Chamado em `src/pages/CadastroContratante.tsx:415`
- **ibge.gov.br:** Chamado em `src/components/CitySelect.tsx:19`
- **Risco:** Se essas APIs retornarem dados maliciosos (man-in-the-middle), o frontend pode renderizar conteúdo perigoso
- **Ação:** Validar e sanitizar respostas de APIs externas antes de renderizar

---

## Pontos Positivos

| Aspecto | Status | Detalhe |
|---------|--------|---------|
| Refresh token em cookie httpOnly | ✅ | `credentials: "include"` usado corretamente |
| Single-flight refresh guard | ✅ | Variável `refreshPromise` evita refresh em loop |
| Auto-logout em sessão expirada | ✅ | `SessionExpiredError` bem implementado |
| Tratamento de 401 em apiFetch | ✅ | Silencioso + transparente para o caller |
| Validação de CPF (algoritmo oficial) | ✅ | `validateCPF` usa dígitos verificadores corretos |
| Email confirmation com cooldown | ✅ | 60s de espera entre reenvios |
| Forgot password não vaza email | ✅ | Resposta genérica (OWASP BR-FP04) |
| Senha com requisitos fortes | ✅ | 8+ chars, maiúscula, minúscula, número, especial |
| Limpeza de pendingRegisterData | ✅ | `removeItem` após confirmação |
| `target="_blank"` com `rel="noopener noreferrer"` | ✅ | Links externos seguros |
| Sem `eval()`, `innerHTML`, `document.write` | ✅ | Sem vetores óbvios de XSS |
| Sem `postMessage` sem validação | ✅ | Não usa cross-origin messaging |

---

## npm audit — Dependências Vulneráveis

Resultado completo do `npm audit`:

```
18 vulnerabilities (3 low, 7 moderate, 8 high)
```

| Pacote | Severidade | Vulnerabilidade | Correção |
|--------|-----------|-----------------|----------|
| `@remix-run/router <=1.23.1` | 🔴 HIGH | XSS via Open Redirects | `npm audit fix` |
| `rollup 4.0.0 - 4.58.0` | 🔴 HIGH | Arbitrary File Write via Path Traversal | `npm audit fix` |
| `flatted <=3.4.1` | 🔴 HIGH | Unbounded recursion DoS + Prototype Pollution | `npm audit fix` |
| `minimatch <=3.1.3` | 🔴 HIGH | ReDoS via wildcards | `npm audit fix` |
| `picomatch <=2.3.1` | 🔴 HIGH | Method Injection + ReDoS | `npm audit fix` |
| `glob 10.2.0 - 10.4.5` | 🔴 HIGH | Command injection via CLI | `npm audit fix` |
| `esbuild <=0.24.2` | 🟠 MODERATE | Dev server request forgery | `npm audit fix` |
| `ajv <6.14.0` | 🟠 MODERATE | ReDoS with `$data` option | `npm audit fix` |
| `js-yaml 4.0.0 - 4.1.0` | 🟠 MODERATE | Prototype Pollution via merge | `npm audit fix` |
| `lodash 4.0.0 - 4.17.21` | 🟠 MODERATE | Prototype Pollution in `_.unset`/`_.omit` | `npm audit fix` |
| `yaml 2.0.0 - 2.8.2` | 🟠 MODERATE | Stack Overflow via nested collections | `npm audit fix` |
| `brace-expansion` | 🟠 MODERATE | Zero-step sequence DoS | `npm audit fix` |
| `@tootallnate/once <3.0.1` | 🟡 LOW | Incorrect Control Flow Scoping | `npm audit fix --force` |

**Para corrigir a maioria:**
```bash
npm audit fix
```

**Para corrigir todos (pode ter breaking changes):**
```bash
npm audit fix --force
```

---

## Matriz de Risco

| Vulnerabilidade | Explorabilidade | Impacto | Risco |
|----------------|----------------|---------|-------|
| React Router XSS | Média (requer URL crafted) | Alto (XSS) | 🔴 CRÍTICO |
| .env no repositório | Alta (qualquer um com repo) | Alto (chaves expostas) | 🔴 CRÍTICO |
| Senha em localStorage | Média (requer XSS ou extensão) | Crítico (credenciais) | 🔴 CRÍTICO |
| Token em localStorage | Média (requer XSS) | Alto (impersonation) | 🟠 ALTO |
| 18 npm vulnerabilities | Variável | Variável | 🟠 ALTO |
| Sem CSP/HSTS | Alta (qualquer request) | Alto (XSS, MITM) | 🟠 ALTO |
| Sem CSRF protection | Média (requer social engineering) | Alto (ação não autorizada) | 🟠 ALTO |
| Sem rate limiting | Alta | Baixo | 🟡 MÉDIO |
| Cookie sem flags | Baixa | Baixo | 🟡 MÉDIO |
| dangerouslySetInnerHTML | Baixa (config interna) | Médio | 🟡 MÉDIO |
| APIs externas sem validação | Média (MITM) | Médio | 🟡 MÉDIO |

---

## Ações Corretivas Priorizadas

| # | Ação | Esforço | Risco Mitigado | Prioridade |
|---|------|---------|----------------|------------|
| 1 | `npm audit fix` para react-router e dependências | 5 min | XSS (VULN-01) | P0 |
| 2 | Adicionar `.env` ao `.gitignore` + criar `.env.example` | 10 min | Exposição de chaves (VULN-02) | P0 |
| 3 | **Rotacionar chave Pusher** no dashboard | 5 min | Exposição de chaves (VULN-02) | P0 |
| 4 | Remover senha do `pendingRegisterData` — enviar só no register | 1-2h | Credential leak (VULN-03) | P0 |
| 5 | Adicionar headers de segurança no vercel.json | 30 min | CSP, HSTS, Clickjacking (VULN-06) | P1 |
| 6 | Avaliar migrar JWT para cookie httpOnly | 1-2 dias | Token theft (VULN-04) | P1 |
| 7 | Implementar CSRF tokens ou SameSite cookies | 1 dia | CSRF (VULN-07) | P1 |
| 8 | Adicionar rate limiting client-side nos forms | 2h | Flood (VULN-08) | P2 |
| 9 | Sanitizar respostas de APIs externas | 2h | Injection via MITM (VULN-11) | P2 |
| 10 | Adicionar flags ao cookie da sidebar | 10 min | Cookie security (VULN-09) | P2 |

---

## Verificação de Segurança Checklist

### Autenticação
- [x] Refresh token em cookie httpOnly
- [x] Single-flight refresh guard
- [x] Auto-logout em sessão expirada
- [ ] Access token em cookie httpOnly (atualmente em localStorage)
- [ ] CSRF protection implementada

### Dados Sensíveis
- [x] CPF com validação de dígito verificador
- [x] Senha com requisitos fortes
- [ ] `.env` no `.gitignore`
- [ ] Senha não armazenada em localStorage
- [ ] Chaves de API rotacionadas

### Headers de Segurança
- [ ] Content-Security-Policy
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Strict-Transport-Security
- [ ] Referrer-Policy

### Dependências
- [ ] 0 vulnerabilidades high no npm audit
- [ ] Dependências atualizadas regularmente

### Proteção de Rotas
- [x] ProtectedRoute com verificação de autenticação
- [x] Rediretamento por role (freelancer/contratante)
- [ ] Validação de role no backend (não verificável no frontend)

---

**Conclusão:** O projeto tem **3 vulnerabilidades críticas (P0)** que devem ser corrigidas antes de qualquer deploy para produção. A mais fácil de resolver é a do React Router (`npm audit fix` — 5 minutos). A mais perigosa é a senha em localStorage, que expõe credenciais de usuários.

**Parecer: REJECTED** — Não deve ir para produção até que todos os itens P0 sejam resolvidos.
