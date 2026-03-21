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
