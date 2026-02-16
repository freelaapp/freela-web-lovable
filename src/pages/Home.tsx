import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  Zap,
  Clock,
  Users,
  Star,
  CheckCircle2,
  Building2,
  Home,
  Briefcase,
  ChefHat,
  Wine,
  UtensilsCrossed,
  Music,
  Baby,
  ConciergeBell,
  LayoutGrid,
  UserPlus,
  Search,
  CalendarCheck,
  MessageCircle,
  TrendingUp,
  Eye,
  ScaleIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logoFreela from "@/assets/logo-freela.png";
import AppLayout from "@/components/layout/AppLayout";

/* ─── Animated Counter ─── */
const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
};

/* ═══════════════════════════════════════════════════
   1️⃣  HERO
   ═══════════════════════════════════════════════════ */
const HeroHome = () => (
  <section className="relative min-h-screen flex items-center overflow-hidden bg-secondary">
    {/* BG blobs */}
    <div className="absolute inset-0 opacity-15">
      <div className="absolute top-20 left-10 w-80 h-80 bg-primary rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
    </div>

    <div className="container mx-auto container-padding relative z-10 pt-28 pb-20">
      <div className="max-w-4xl mx-auto text-center animate-slide-up">
        <img
          src={logoFreela}
          alt="Freela Serviços"
          className="h-20 md:h-28 mx-auto mb-8 drop-shadow-lg animate-blink"
        />

        <h1 className="text-secondary-foreground mb-6 hero-text-shadow">
          Milhares de Freelancers disponíveis para seu bar, restaurante, buffets, ou para sua{" "}
          <span className="text-primary">festa particular.</span>
        </h1>

        <p className="text-lg md:text-xl text-secondary-foreground/80 max-w-2xl mx-auto mb-10">
          Conectamos você a profissionais qualificados em todo o Brasil. Rápido, seguro e sem burocracia.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Button variant="cta" size="xl" asChild className="group">
            <Link to="/inicio?modo=empresas">
              <Building2 className="w-5 h-5" />
              Contratar para minha Empresa
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="hero" size="xl" asChild className="group bg-primary text-primary-foreground hover:bg-primary-hover">
            <Link to="/inicio?modo=casa">
              <Home className="w-5 h-5" />
              Contratar para Evento em Casa
            </Link>
          </Button>
          <Button variant="outline" size="xl" asChild className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground">
            <Link to="/cadastro">
              <Briefcase className="w-5 h-5" />
              Quero trabalhar pelo Freela
            </Link>
          </Button>
        </div>

        {/* Animated Counters */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-14 mb-12">
          <div className="text-center">
            <p className="font-display text-3xl md:text-4xl font-bold text-primary">
              <AnimatedCounter target={180000} suffix="+" />
            </p>
            <p className="text-sm text-secondary-foreground/70 mt-1">profissionais cadastrados</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl md:text-4xl font-bold text-primary">🇧🇷</p>
            <p className="text-sm text-secondary-foreground/70 mt-1">Presente em todo o Brasil</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl md:text-4xl font-bold text-primary">
              <AnimatedCounter target={50000} suffix="+" />
            </p>
            <p className="text-sm text-secondary-foreground/70 mt-1">contratações realizadas</p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { icon: Shield, label: "Plataforma segura" },
            { icon: Star, label: "Profissionais avaliados" },
            { icon: MessageCircle, label: "Suporte ativo" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 bg-secondary-foreground/10 px-4 py-2 rounded-full">
              <b.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-secondary-foreground/90">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════
   2️⃣  COMO FUNCIONA
   ═══════════════════════════════════════════════════ */
const HowItWorks = () => {
  const contratante = [
    { icon: Search, title: "Publique sua necessidade", desc: "Informe o tipo de profissional que precisa, data e local." },
    { icon: Users, title: "Receba candidatos qualificados", desc: "Profissionais avaliados se candidatam à sua vaga." },
    { icon: CalendarCheck, title: "Confirme e acompanhe", desc: "Escolha o melhor e gerencie tudo pelo app." },
  ];
  const profissional = [
    { icon: UserPlus, title: "Cadastre-se gratuitamente", desc: "Crie seu perfil e mostre suas habilidades." },
    { icon: Search, title: "Receba oportunidades", desc: "Oportunidades na sua região chegam até você." },
    { icon: Briefcase, title: "Trabalhe e receba", desc: "Aceite serviços e receba pelas oportunidades." },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-16">
          <span className="badge-primary mb-4 inline-block">Simples e rápido</span>
          <h2 className="section-title section-title-center mb-4">Como funciona?</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contratantes */}
          <div>
            <h4 className="text-primary font-display font-bold mb-8 text-center">Para contratantes</h4>
            <div className="space-y-8">
              {contratante.map((s, i) => (
                <div key={s.title} className="flex gap-5 items-start card-elevated p-6 card-hover">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {i + 1}
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">{s.title}</h5>
                    <p className="text-muted-foreground text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profissionais */}
          <div>
            <h4 className="text-primary font-display font-bold mb-8 text-center">Para profissionais</h4>
            <div className="space-y-8">
              {profissional.map((s, i) => (
                <div key={s.title} className="flex gap-5 items-start card-elevated p-6 card-hover">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {i + 1}
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">{s.title}</h5>
                    <p className="text-muted-foreground text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-14">
          <Button size="lg" asChild>
            <Link to="/criar-evento">Contratar Agora</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/cadastro">Quero me cadastrar</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   3️⃣  NOSSAS SOLUÇÕES
   ═══════════════════════════════════════════════════ */
const Solutions = () => {
  const empresas = [
    { icon: ConciergeBell, label: "Garçons" },
    { icon: Wine, label: "Bartenders" },
    { icon: ChefHat, label: "Cozinheiros" },
    { icon: Users, label: "Auxiliares" },
    { icon: LayoutGrid, label: "Caixa" },
    { icon: UserPlus, label: "Recepção" },
    { icon: CalendarCheck, label: "Produção de eventos" },
  ];
  const casa = [
    { icon: ConciergeBell, label: "Garçom para festa" },
    { icon: UtensilsCrossed, label: "Churrasqueiro" },
    { icon: Wine, label: "Bartender" },
    { icon: ChefHat, label: "Copeira" },
    { icon: Baby, label: "Recreação infantil" },
    { icon: Music, label: "Música ao vivo" },
  ];

  return (
    <section className="section-padding bg-muted/50">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-16">
          <span className="badge-primary mb-4 inline-block">Soluções</span>
          <h2 className="section-title section-title-center mb-4">Nossas Soluções</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Empresas */}
          <div className="card-elevated p-8 md:p-10 card-hover border-2 border-transparent hover:border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold">Freela para Empresas</h3>
            </div>
            <p className="text-muted-foreground mb-8">
              Equipe extra para bares, restaurantes, eventos corporativos e grandes operações.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {empresas.map((s) => (
                <div key={s.label} className="flex items-center gap-2 p-3 rounded-lg bg-background">
                  <s.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
              ))}
            </div>
            <Button size="lg" className="w-full" asChild>
              <Link to="/inicio?modo=empresas">
                Conhecer Freela para Empresas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Casa */}
          <div className="card-elevated p-8 md:p-10 card-hover border-2 border-transparent hover:border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Home className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold">Freela em Casa</h3>
            </div>
            <p className="text-muted-foreground mb-8">
              Profissionais para festas, aniversários, churrascos e eventos particulares.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {casa.map((s) => (
                <div key={s.label} className="flex items-center gap-2 p-3 rounded-lg bg-background">
                  <s.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
              ))}
            </div>
            <Button size="lg" className="w-full" asChild>
              <Link to="/inicio?modo=casa">
                Conhecer Freela em Casa
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   4️⃣  QUEBRA DE OBJEÇÕES
   ═══════════════════════════════════════════════════ */
const Objections = () => {
  const items = [
    { icon: Shield, title: "Segurança", desc: "Você sabe quem está contratando" },
    { icon: Zap, title: "Agilidade", desc: "Evite grupos de WhatsApp e indicações inseguras" },
    { icon: LayoutGrid, title: "Organização", desc: "Tudo centralizado na plataforma" },
    { icon: ScaleIcon, title: "Escalabilidade", desc: "Contrate 1 ou 50 profissionais" },
    { icon: Eye, title: "Transparência", desc: "Avaliações reais de quem já contratou" },
    { icon: Clock, title: "Economia de tempo", desc: "Resolva em minutos, não em dias" },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-16">
          <span className="badge-primary mb-4 inline-block">Diferencial</span>
          <h2 className="section-title section-title-center mb-4">
            Por que contratar pelo Freela?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            O modelo tradicional é informal, desorganizado e inseguro.{" "}
            <span className="text-primary font-semibold">O Freela profissionaliza a contratação.</span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.title} className="card-elevated p-6 card-hover text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h5 className="font-bold mb-2">{item.title}</h5>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   5️⃣  PROVA SOCIAL
   ═══════════════════════════════════════════════════ */
const SocialProof = () => {
  const testimonials = [
    {
      name: "Mariana Costa",
      role: "Proprietária de Restaurante",
      text: "Precisei de 3 garçons de última hora e em 30 minutos já tinha profissionais confirmados. Incrível!",
    },
    {
      name: "Ricardo Almeida",
      role: "Organizador de Eventos",
      text: "Uso o Freela para todos os meus eventos corporativos. A qualidade dos profissionais é consistente.",
    },
    {
      name: "Juliana Santos",
      role: "Festa em casa",
      text: "Contratei um churrasqueiro pelo Freela para o aniversário do meu marido. Foi perfeito, recomendo!",
    },
  ];

  return (
    <section className="section-padding bg-muted/50">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-16">
          <span className="badge-primary mb-4 inline-block">Depoimentos</span>
          <h2 className="section-title section-title-center mb-4">
            Quem usa, recomenda
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((t) => (
            <div key={t.name} className="card-elevated p-6 card-hover">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">"{t.text}"</p>
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
          {[
            { value: "+180 mil", label: "profissionais cadastrados", icon: Users },
            { value: "Brasil inteiro", label: "atendido", icon: TrendingUp },
            { value: "Crescimento", label: "constante", icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-lg">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   6️⃣  CTA FORTE
   ═══════════════════════════════════════════════════ */
const CtaSection = () => (
  <section className="py-20 md:py-28 hero-gradient">
    <div className="container mx-auto container-padding text-center">
      <h2 className="text-secondary mb-6 hero-text-shadow">
        Seu próximo profissional está a poucos cliques.
      </h2>
      <p className="text-secondary/80 text-lg max-w-xl mx-auto mb-10">
        Não perca tempo com métodos informais. Contrate com segurança e agilidade.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="hero" size="xl" asChild>
          <Link to="/inicio?modo=empresas">
            <Building2 className="w-5 h-5" />
            Contratar para Empresa
          </Link>
        </Button>
        <Button variant="hero" size="xl" asChild>
          <Link to="/inicio?modo=casa">
            <Home className="w-5 h-5" />
            Contratar para Evento em Casa
          </Link>
        </Button>
        <Button variant="hero-outline" size="xl" asChild>
          <Link to="/cadastro">
            <Briefcase className="w-5 h-5" />
            Quero trabalhar
          </Link>
        </Button>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════
   7️⃣  FLOATING SUPPORT BUTTON
   ═══════════════════════════════════════════════════ */
const FloatingSupport = () => (
  <a
    href="https://wa.me/5511999999999"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-24 lg:bottom-8 right-6 z-50 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 font-semibold text-sm"
  >
    <MessageCircle className="w-5 h-5" />
    <span className="hidden sm:inline">Fale com nosso suporte</span>
  </a>
);

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */
const HomePage = () => {
  return (
    <AppLayout showBottomNav={false}>
      <HeroHome />
      <HowItWorks />
      <Solutions />
      <Objections />
      <SocialProof />
      <CtaSection />
      <FloatingSupport />
    </AppLayout>
  );
};

export default HomePage;
