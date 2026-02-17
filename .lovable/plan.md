

# Reestruturacao Completa - Login e Cadastro

## Resumo

Refatorar todo o fluxo de autenticacao da plataforma, criando um sistema de cadastro em etapas (multi-step) com ramificacao por tipo de usuario (Contratante/Freelancer), mantendo a identidade visual existente.

---

## Estrutura de Paginas e Rotas

| Rota | Pagina | Descricao |
|------|--------|-----------|
| `/login` | Login simplificado | Email + Senha + Entrar |
| `/cadastro` | Criar Conta (dados basicos) | Nome, Email, Senha, Confirmar Senha |
| `/escolher-perfil` | Escolha de perfil | Dois botoes: Contratante ou Freelancer |
| `/cadastro-contratante` | Cadastro Contratante | Formulario completo com switch Casa/Empresas |
| `/cadastro-freelancer` | Cadastro Freelancer | Formulario existente adaptado (servico, estilos) |

---

## Detalhamento por Pagina

### 1. Login (`/login`) - Simplificacao

- Remover botao "Continuar com Google"
- Remover divisor "ou"
- Manter apenas: Email, Senha, botao Entrar, link "Esqueceu a senha?" e link "Cadastre-se"
- Manter o layout split-screen (formulario esquerda, visual direita) e identidade visual

### 2. Criar Conta (`/cadastro`) - Simplificacao

- Remover o toggle "Sou Freelancer / Sou Cliente"
- Remover campos condicionais de cargo e estilos musicais
- Manter apenas: Nome Completo, Email, Senha (com indicadores de requisitos), Confirmar Senha, Checkbox de Termos e Politica, botao "Criar Conta"
- Apos submit, simular envio de email de confirmacao (toast informativo) e redirecionar para `/escolher-perfil`
- Manter layout split-screen com painel visual lateral

### 3. Escolha de Perfil (`/escolher-perfil`) - Nova Pagina

- Tela centralizada com logo, titulo "Como voce quer usar a Freela?" e dois cards grandes:
  - Card 1: Icone Building2 + "Cadastre-se como Contratante" + descricao breve -> redireciona para `/cadastro-contratante`
  - Card 2: Icone Briefcase + "Cadastre-se como Freelancer" + descricao breve -> redireciona para `/cadastro-freelancer`
- Visual limpo, sem split-screen, fundo hero-gradient

### 4. Cadastro Contratante (`/cadastro-contratante`) - Nova Pagina

Layout com formulario a esquerda e painel informativo a direita (desktop), seguindo o padrao visual existente.

**Estrutura do formulario:**

**Switch principal** no topo: "Freela em Casa" / "Freela para Empresas"
- Ao alternar, o painel lateral direito exibe descricao explicativa do modo selecionado

**Campos comuns (ambos modos):**
- Tipo de Documento: Select com opcoes CPF ou CNPJ
- Campo dinamico de documento (mascara CPF ou CNPJ)
- Se CNPJ selecionado: campo "Razao Social"
- Se CPF selecionado: campo "Nome Completo"
- Endereco completo (CEP, Rua, Numero, Complemento, Bairro, Cidade, Estado)

**Campos exclusivos "Freela em Casa" + CPF:**
- Data de Nascimento (com validacao de idade minima 18 anos usando date-fns)

**Campos exclusivos "Freela para Empresas":**
- Ramo do estabelecimento (select: Bar, Restaurante, Hotel, Buffet, Casa de Eventos, etc.)
- Nome do estabelecimento
- Upload de imagens: 1 foto fachada (obrigatorio), 1 foto ambiente interno (obrigatorio), botao "Adicionar mais fotos" (opcional)
  - Upload via input file com preview das imagens selecionadas (armazenamento local/state por enquanto, sem backend)

**Finalizacao:**
- Botao "Cadastrar-se"
- Validacao de todos os campos obrigatorios
- Toast de sucesso + redirecionamento para `/dashboard-contratante`

### 5. Cadastro Freelancer (`/cadastro-freelancer`) - Nova Pagina

- Extrair os campos especificos de freelancer do cadastro atual (selecao de servico, estilos musicais para musicos)
- Adicionar campos adicionais: CPF, Data de Nascimento (validacao 18+), Endereco
- Checkbox de Termos/Politica
- Botao "Cadastrar-se" -> toast sucesso + redirecionar para `/dashboard-freelancer`

---

## Detalhes Tecnicos

### Arquivos a modificar:
- `src/pages/Login.tsx` - Simplificar removendo Google login
- `src/pages/Cadastro.tsx` - Reescrever para formulario basico (sem tipo)
- `src/App.tsx` - Adicionar 3 novas rotas

### Arquivos a criar:
- `src/pages/EscolherPerfil.tsx` - Tela de escolha pos-cadastro
- `src/pages/CadastroContratante.tsx` - Formulario completo contratante
- `src/pages/CadastroFreelancer.tsx` - Formulario completo freelancer

### Validacoes implementadas:
- Campos obrigatorios com mensagens em portugues
- Mascara visual para CPF (000.000.000-00) e CNPJ (00.000.000/0000-00)
- Validacao de idade minima 18 anos via date-fns (comparacao com data atual)
- Requisitos de senha (8 chars, maiuscula, minuscula, numero, especial)
- Upload de imagens: validacao de tipo (image/*) e preview com URL.createObjectURL

### Componentes reutilizados:
- Button, Input, Label, Select, Checkbox, Switch do design system existente
- Popover + Calendar para DatePicker de nascimento
- Layout split-screen com hero-gradient do padrao atual
- Cores primary (ambar), secondary (preto), tipografia Poppins/Inter

