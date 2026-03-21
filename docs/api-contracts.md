# API Contracts

## Base URL
- Produção: `https://api.freela.com.br`
- Staging: `https://api.staging.freela.com.br`
- Local: `http://localhost:3000`

## Autenticação
- **Tipo:** Bearer JWT
- **Header:** `Authorization: Bearer {token}`
- **Armazenamento:** `localStorage` em `auth_token` (definido em `auth.ts`)

## Endpoints

### Autenticação

#### POST `/auth/login`
**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string"
    }
  }
}
```

**Response 401/422:**
```json
{
  "success": false,
  "message": "E-mail ou senha inválidos"
}
```

#### POST `/auth/logout`
**Headers:** Authorization Required
**Response 200:**
```json
{
  "success": true
}
```

### Usuário

#### GET `/users/contractors`
**Headers:** Authorization Required
**Descrição:** Verifica se o usuário autenticado tem perfil de contratante
**Response 200 (com perfil):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "companyName": "string",
    // ... outros campos do contratante
  }
}
```

**Response 200 (sem perfil):**
```json
{
  "success": true,
  "data": null
}
```

**Response 401:** Token inválido/expirado

---

### Recuperação de Senha *(Novo)*

#### POST `/forgot-password`
**Descrição:** Solicita código de recuperação de senha
**Headers:** Nenhum (acesso público)
**Request:**
```json
{
  "email": "string"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Se o email estiver cadastrado, você receberá um código de recuperação"
}
```

**Observações:**
- ⚠️ Resposta genérica — sempre retorna a mesma mensagem, independente de o email existir ou não (BR-FP04)
- Código de recuperação (6 dígitos) é enviado por email
- O token expira em 15 minutos (BR-FP01)
- Se o usuário solicitar novamente, tokens anteriores são invalidados (BR-FP03)

#### POST `/reset-password`
**Descrição:** Redefine a senha usando código de recuperação
**Headers:** Nenhum (acesso público)
**Request:**
```json
{
  "email": "string",
  "code": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

**Erros:**
- `401 Unauthorized`: Código inválido ou expirado
- `500 Internal Server Error`: Erro interno do servidor

---

### Providers (Freelancers)

#### PATCH `/users/providers`
**Descrição:** Atualiza disponibilidade de horários do freelancer
**Headers:** Authorization Required (Bearer JWT)
**Autenticação:** Valida que o token corresponde ao provider autenticado
**Request:**
```json
{
  "diasAtivos": ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
  "horarios": {
    "seg": { "de": "08h", "ate": "20h" },
    "ter": { "de": "08h", "ate": "20h" },
    "qua": { "de": "08h", "ate": "20h" },
    "qui": { "de": "08h", "ate": "20h" },
    "sex": { "de": "08h", "ate": "20h" },
    "sab": { "de": "10h", "ate": "16h" },
    "dom": { "de": "10h", "ate": "14h" }
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Disponibilidade atualizada com sucesso",
  "data": {
    "diasAtivos": ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
    "horarios": { ... }
  }
}
```

**Response 422 (Validação):**
```json
{
  "success": false,
  "message": "Validação falhou",
  "errors": [
    {
      "field": "horarios.seg.ate",
      "message": "Horário 'até' não pode ser menor ou igual a 'de'"
    }
  ]
}
```

**Response 401:** Token inválido/expirado
**Response 500:** Erro interno do servidor

**Validações:**
- Todos os horários devem ter `ate > de` (horário até deve ser posterior ao de)
- Formato de hora: `HHh` (ex: `08h`, `20h`)
- Horas devem estar entre `00h` e `23h`
- `diasAtivos` pode estar vazio (usuário indisponível)
- Se um dia está em `diasAtivos`, deve ter entrada em `horarios`

---

## Paginação (Padrão Geral)
Quando aplicável, endpoints de lista usam:
```
GET /resource?page=1&limit=20
Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Conventions
- **Naming:** camelCase em payloads, snake_case em banco (abstraído)
- **Datetimes:** ISO 8601 (UTC) em todas as respostas
- **IDs:** UUID v4 strings
- **Booleans:** `true`/`false` (não 0/1)
