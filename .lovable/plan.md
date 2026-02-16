

## Nova Homepage Unificada - Freela Servicos

### Objetivo
Criar uma nova homepage inicial que funciona como **porta de entrada universal** da plataforma, antes de segmentar o usuario para "Freela em Casa" ou "Freela para Empresas". A homepage atual sera mantida intacta como pagina interna de cada modo.

### Estrutura da Nova Homepage

**1. Banner Carrossel (4 slides com autoplay)**
- **Slide 1 - Institucional:** "Venha fazer parte do Freela!" com 3 botoes (Freela em Casa, Freela Bares e Restaurantes, Cadastre-se)
- **Slide 2 - Foco Negocios:** "Precisa de ajuda no seu negocio?" com botoes para Empresas
- **Slide 3 - Foco Eventos/CPF:** "Festa em familia sem preocupacao!" com botoes para Casa
- **Slide 4 - Captacao Freelancer:** "Renda extra a alguns cliques" com botao "Quero ser Freelancer"
- Usa o componente Embla Carousel ja instalado no projeto

**2. Secao "Freelas perto de voce"**
- Titulo: "Freelancers ativos na sua regiao"
- Texto dinamico com numeros de freelancers no raio de 30km
- Contadores animados e botao "Encontrar profissional agora"

**3. Secao "Parcerias"**
- Titulo: "Empresas que acreditam no Freela"
- Grid de logos/cards de parceiros (fornecedores, espacos, distribuidoras, escolas)
- Texto de credibilidade

**4. Secao "Capacitacao"**
- Titulo: "Mais que uma plataforma. Um crescimento profissional."
- Texto sobre materiais de ensino e capacitacao
- Botao "Conheca as capacitacoes"

**5. CTA Final**
- Frase de ancoragem forte para fechar a pagina

### Alteracoes Tecnicas

1. **Novo arquivo: `src/pages/HomePage.tsx`**
   - Componente da nova homepage unificada
   - Usa `AppLayout` para manter Header/Footer/BottomNav
   - Carousel com Embla (componente `Carousel` ja existe em `src/components/ui/carousel.tsx`)
   - Cada banner com hero-gradient de fundo, textos e botoes conforme briefing
   - Os botoes "Freela em Casa" e "Freela Bares e Restaurantes" usam `setMode()` do ModeContext e redirecionam para `/inicio`
   - Botoes de cadastro redirecionam para `/cadastro`

2. **Rota atualizada em `src/App.tsx`**
   - `"/"` aponta para `HomePage` (nova homepage)
   - `"/inicio"` aponta para `Index` (homepage atual segmentada por modo)
   - Todas as demais rotas permanecem inalteradas

3. **Nenhuma alteracao em:**
   - Fontes, cores, CSS (`index.css`)
   - Componentes existentes (Header, Footer, EmpresasLandingPage, HeroSection, etc.)
   - Paginas ja criadas (Login, Cadastro, Freelancers, etc.)

### Fluxo do Usuario

O usuario chega na homepage nova ("/") -> escolhe o perfil no carrossel -> e redirecionado para "/inicio" com o modo correto ja selecionado (Casa ou Empresas), onde ve a landing page completa correspondente.

### Componentes Reutilizados
- `Carousel`, `CarouselContent`, `CarouselItem` de `@/components/ui/carousel.tsx`
- `Button` com variantes `hero` e `hero-outline`
- `AppLayout` para estrutura de pagina
- `useMode()` e `setMode()` do `ModeContext`
- Classes CSS existentes: `hero-gradient`, `section-padding`, `container-padding`, `badge-primary`, `card-elevated`, etc.

