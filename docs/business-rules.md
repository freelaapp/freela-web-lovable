# Business Rules

## Domínio
Plataforma de marketplace de serviços (Freela) conectando freelancers e contratantes. Funcionalidades principais: autenticação, perfis, projetos, propostas, mensagens, pagamentos, reviews.

## Regras de Negócio

### Autenticação
- **BR-AUTH-001:** Login por email + senha (mínimo 6 caracteres)
- **BR-AUTH-002:** Papéis distintos: `freelancer` e `contratante`
- **BR-AUTH-003:** Detecção automática de role via endpoint `/users/contractors`
- **BR-AUTH-004:** Redirecionamento pós-login baseado no role detectado

### Recuperação de Senha
- **BR-FP01:** Código de recuperação expira em 15 minutos
- **BR-FP02:** Código tem 6 dígitos numéricos
- **BR-FP03:** Nova solicitação invalida códigos anteriores
- **BR-FP04:** Resposta de sucesso é genérica (não revela se email existe)
- **BR-FP05:** Nova senha mínima 6 caracteres (recomendado usar regras de fortaleza)

### Perfil do Contratante
- **BR-CFG01:** Configurações de notificação por canal: candidaturas, mensagens, avaliações, pagamentos, email, push
- **BR-CFG02:** Perfil público (visibilidade) controlado por toggle

### Projetos e Propostas
- *(A definir pelo PO)*

## Restrições de Negócio
- **REST-01:** Não divulgar se um email está cadastrado (segurança — BR-FP04)
- **REST-02:** Senhas devem ser armazenadas hash+salt (responsabilidade do backend)
- **REST-03:** Rate limiting em endpoints sensíveis (login, forgot-password)
- **REST-04:** Log de eventos de segurança (login, reset de senha)

## Glossário
| Termo | Definição |
|-------|-----------|
| Freelancer | Prestador de serviços que busca trabalhos |
| Contratante | Cliente que publica projetos e contrata serviços |
| Role | Papel do usuário no sistema (freelancer/contratante) |
| forgot-password | Endpoint que gera código de recuperação (6 dígitos) |
| reset-password | Endpoint que aplica nova senha usando código válido |
| AuthContext | Context React que gerencia estado de autenticação global |
