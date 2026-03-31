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
  
  GraduationCap,
  HelpCircle,
  DollarSign,
  UserCheck,
  MapPin,
  FileText,
  CreditCard,
  Smartphone,
  Download } from
"lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from
"@/components/ui/accordion";
import logoFreela from "@/assets/logo-freela-red.svg";
import bannerEmpresas from "@/assets/banner-empresas.jpg";
import bannerFesta from "@/assets/banner-festa.jpg";
import bannerCorporativo from "@/assets/banner-corporativo.jpg";
import AppLayout from "@/components/layout/AppLayout";
import brazilMap from "@/assets/brazil-map-freela.png";

/* ─── Animated Counter ─── */
const AnimatedCounter = ({ target, suffix = "" }: {target: number;suffix?: string;}) => {
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
    </span>);

};

/* ═══════════════════════════════════════════════════
   1️⃣  HERO
   ═══════════════════════════════════════════════════ */
const bannerSlides = [
{
  image: bannerEmpresas,
  headline: "Contrate Freelancers para seu Bar, Restaurante, Buffet e Empresa de Eventos",
  cta: { label: "Contratar para minha Empresa", link: "/inicio?modo=empresas", icon: Building2 }
},
{
  image: bannerFesta,
  headline: "Contrate Freelancers para seu Churrasco, Aniversário ou Casamento",
  cta: { label: "Contratar para Evento em Casa", link: "/inicio?modo=casa", icon: Home }
},
{
  image: bannerCorporativo,
  headline: "Contrate Freelancers para Eventos Corporativos e Grandes Operações",
  cta: { label: "Quero contratar agora", link: "/cadastro", icon: Briefcase }
}];


const HeroHome = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % bannerSlides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="relative w-full min-h-[620px] md:min-h-[680px] lg:min-h-[720px] xl:min-h-[760px]">
        {bannerSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === active ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.headline}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/55 to-secondary/20" />
          </div>
        ))}

        <div className="relative z-20 flex min-h-[620px] md:min-h-[680px] lg:min-h-[720px] xl:min-h-[760px] items-end pt-24 md:pt-28 lg:pt-32 pb-8 md:pb-10 lg:pb-12">
          <div className="container mx-auto container-padding">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                {(() => {
                  const SlideIcon = bannerSlides[active].cta.icon;
                  return <SlideIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />;
                })()}
                <span className="text-xs md:text-sm font-bold text-primary uppercase tracking-wider">
                  {bannerSlides[active].cta.label}
                </span>
              </div>

              <h1 className="max-w-2xl text-[1.5rem] sm:text-[1.75rem] md:text-[2rem] lg:text-[2.5rem] xl:text-[3rem] 2xl:text-[3.5rem] font-bold text-secondary-foreground mb-3 md:mb-4 lg:mb-5 leading-[1.1] hero-text-shadow">
                {bannerSlides[active].headline}
              </h1>

              <p className="text-sm md:text-base lg:text-xl text-secondary-foreground/80 max-w-2xl mb-5 md:mb-6 lg:mb-8">
                Conectamos você a profissionais qualificados em todo o Brasil. Rápido, seguro e sem burocracia.
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6 md:mb-10">
                <Button size="lg" asChild className="group bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg">
                  <Link to={bannerSlides[active].cta.link}>
                    {bannerSlides[active].cta.label}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" asChild className="bg-secondary-foreground text-secondary border-2 border-secondary-foreground font-bold hover:bg-secondary-foreground/90">
                  <Link to="/cadastro">
                    <UserPlus className="w-5 h-5" />
                    Quero trabalhar pelo Freela
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {bannerSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Ir para slide ${i + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      i === active
                        ? "w-8 h-3 bg-primary"
                        : "w-3 h-3 bg-secondary-foreground/50 hover:bg-secondary-foreground/80"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Counters & Trust Badges (separate section) ─── */
const CountersSection = () => (
  <section className="bg-secondary py-10 md:py-12 lg:py-14">
    <div className="container mx-auto container-padding">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-14 mb-8 items-start">
        <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="font-display text-3xl md:text-5xl font-extrabold text-secondary-foreground">
            <AnimatedCounter target={180000} suffix="+" />
          </p>
          <p className="text-xs md:text-sm font-semibold text-secondary-foreground/70 mt-1 uppercase tracking-wider">profissionais cadastrados</p>
        </div>
        <div className="text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <p className="font-display text-3xl md:text-5xl font-extrabold text-secondary-foreground">BR</p>
          <p className="text-xs md:text-sm font-semibold text-secondary-foreground/70 mt-1 uppercase tracking-wider">Presente em todo o Brasil</p>
        </div>
        <div className="text-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <p className="font-display text-3xl md:text-5xl font-extrabold text-secondary-foreground">
            <AnimatedCounter target={50000} suffix="+" />
          </p>
          <p className="text-xs md:text-sm font-semibold text-secondary-foreground/70 mt-1 uppercase tracking-wider">contratações realizadas</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {[
          { icon: Shield, label: "Plataforma segura" },
          { icon: Star, label: "Profissionais avaliados" },
          { icon: MessageCircle, label: "Suporte ativo" },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2 bg-secondary-foreground/10 text-secondary-foreground px-4 py-2 rounded-full hover:scale-105 transition-transform duration-300">
            <b.icon className="w-4 h-4 text-primary" />
            <span className="text-xs md:text-sm font-bold">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════
   2️⃣  COMO FUNCIONA
   ═══════════════════════════════════════════════════ */
const HowItWorks = () => {
  const contratante = [
  { icon: Search, step: "01", title: "Publique sua necessidade", desc: "Informe o tipo de profissional que precisa, data e local." },
  { icon: Users, step: "02", title: "Receba candidatos qualificados", desc: "Profissionais avaliados se candidatam à sua vaga." },
  { icon: CalendarCheck, step: "03", title: "Confirme e acompanhe", desc: "Escolha o melhor e gerencie tudo pelo app." }];

  const profissional = [
  { icon: UserPlus, step: "01", title: "Cadastre-se gratuitamente", desc: "Crie seu perfil e mostre suas habilidades." },
  { icon: Search, step: "02", title: "Receba oportunidades", desc: "Oportunidades na sua região chegam até você." },
  { icon: Briefcase, step: "03", title: "Trabalhe e receba", desc: "Aceite serviços e receba pelas oportunidades." }];


  return (
    <section id="como-funciona" className="section-padding scroll-mt-24 py-[30px] bg-secondary-foreground">
      <div className="container mx-auto container-padding bg-secondary-foreground">
        <div className="text-center mb-16 py-[30px]">
          <span className="badge-primary mb-4 inline-block">Simples e rápido</span>
          <h2 className="section-title section-title-center mb-4 mx-[30px]">Como funciona?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Seja para contratar ou trabalhar, o processo é rápido e descomplicado.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 bg-secondary-foreground">
          {/* Contratantes */}
          <div className="bg-secondary rounded-2xl p-8 md:p-10 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary rounded-xl">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="text-secondary-foreground font-display font-bold text-xl md:text-2xl">Para Contratantes</h4>
            </div>
            <div className="space-y-6">
              {contratante.map((s) =>
              <div key={s.title} className="flex gap-4 items-start group">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary flex flex-col items-center justify-center shadow-amber">
                    <s.icon className="w-5 h-5 text-primary-foreground" />
                    <span className="text-[10px] font-extrabold text-primary-foreground mt-0.5">{s.step}</span>
                  </div>
                  <div className="pt-1">
                    <h5 className="font-bold text-secondary-foreground text-base mb-1 group-hover:text-primary transition-colors">{s.title}</h5>
                    <p className="text-secondary-foreground/60 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              )}
            </div>
            <Button size="lg" className="w-full mt-8" asChild>
              <Link to="/cadastro">
                Contratar Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Profissionais */}
          <div className="bg-primary rounded-2xl p-8 md:p-10 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-secondary rounded-xl">
                <UserPlus className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h4 className="text-primary-foreground font-display font-bold text-xl md:text-2xl">Para Freelancers</h4>
            </div>
            <div className="space-y-6">
              {profissional.map((s) =>
              <div key={s.title} className="flex gap-4 items-start group">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-secondary flex flex-col items-center justify-center">
                    <s.icon className="w-5 h-5 text-secondary-foreground" />
                    <span className="text-[10px] font-extrabold text-secondary-foreground mt-0.5">{s.step}</span>
                  </div>
                  <div className="pt-1">
                    <h5 className="font-bold text-primary-foreground text-base mb-1 group-hover:text-secondary transition-colors">{s.title}</h5>
                    <p className="text-primary-foreground/70 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              )}
            </div>
            <Button size="lg" variant="secondary" className="w-full mt-8 bg-secondary text-secondary-foreground hover:bg-secondary/90" asChild>
              <Link to="/cadastro">
                Quero me cadastrar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>);

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
  { icon: CalendarCheck, label: "Produção de eventos" }];

  const casa = [
  { icon: ConciergeBell, label: "Garçom para festa" },
  { icon: UtensilsCrossed, label: "Churrasqueiro" },
  { icon: Wine, label: "Bartender" },
  { icon: ChefHat, label: "Copeira" },
  { icon: Baby, label: "Recreação infantil" },
  { icon: Music, label: "Música ao vivo" }];


  return (
    <section className="section-padding py-[60px] bg-muted">
      <div className="container mx-auto container-padding bg-muted">
        <div className="text-center mb-16 py-[30px]">
          <span className="badge-primary mb-4 inline-block">Soluções</span>
          <h2 className="section-title section-title-center mb-4 mx-[30px]">Nossas Soluções</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 bg-muted">
          {[
          {
            icon: Building2,
            title: "Freela para Empresas",
            desc: "Equipe extra para bares, restaurantes, eventos corporativos e grandes operações.",
            items: empresas,
            link: "/inicio?modo=empresas",
            btnLabel: "Conhecer Freela para Empresas",
            bg: "bg-secondary",
            textColor: "text-secondary-foreground",
            descColor: "text-secondary-foreground/60",
            iconBg: "bg-primary",
            iconColor: "text-primary-foreground",
            itemBg: "bg-secondary-foreground/10",
            itemText: "text-secondary-foreground",
            itemIconColor: "text-primary",
            btnVariant: "default" as const
          },
          {
            icon: Home,
            title: "Freela em Casa",
            desc: "Profissionais para festas, aniversários, churrascos e eventos particulares.",
            items: casa,
            link: "/inicio?modo=casa",
            btnLabel: "Conhecer Freela em Casa",
            bg: "bg-primary",
            textColor: "text-primary-foreground",
            descColor: "text-primary-foreground/70",
            iconBg: "bg-secondary",
            iconColor: "text-secondary-foreground",
            itemBg: "bg-primary-foreground/10",
            itemText: "text-primary-foreground",
            itemIconColor: "text-secondary",
            btnVariant: "secondary" as const
          }].
          map((card) => {
            const CardIcon = card.icon;
            return (
              <div key={card.title} className={`${card.bg} rounded-2xl p-8 md:p-10 shadow-lg flex flex-col`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 ${card.iconBg} rounded-xl`}>
                    <CardIcon className={`w-7 h-7 ${card.iconColor}`} />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold ${card.textColor}`}>{card.title}</h3>
                </div>
                <p className={`${card.descColor} mb-6`}>{card.desc}</p>
                <div className="grid grid-cols-2 gap-3 mb-8 flex-1">
                  {card.items.map((s) =>
                  <div key={s.label} className={`flex items-center gap-2 p-3 rounded-lg ${card.itemBg}`}>
                      <s.icon className={`w-4 h-4 ${card.itemIconColor} flex-shrink-0`} />
                      <span className={`text-sm font-semibold ${card.itemText}`}>{s.label}</span>
                    </div>
                  )}
                </div>
                <Button size="lg" variant={card.btnVariant} className="w-full mt-auto" asChild>
                  <Link to={card.link}>
                    {card.btnLabel}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>);

          })}
        </div>
      </div>
    </section>);

};

/* ═══════════════════════════════════════════════════
   4️⃣  O QUE É O FREELA
   ═══════════════════════════════════════════════════ */
const OQueEoFreela = () => {
  const beneficios = [
  { icon: CheckCircle2, title: "Sem custo adicional", desc: "Você paga o valor de mercado. Sem taxas escondidas." },
  { icon: Star, title: "Profissionais avaliados", desc: "Cadastrados e avaliados por quem já contratou." },
  { icon: Zap, title: "Processo rápido e digital", desc: "Encontre e contrate em poucos cliques." },
  { icon: TrendingUp, title: "Presença nacional", desc: "Profissionais disponíveis em todo o Brasil." },
  { icon: MessageCircle, title: "Suporte da plataforma", desc: "Apoio do início ao fim da contratação." }];


  return (
    <section id="o-que-e" className="section-padding bg-background scroll-mt-24 py-[30px]">
      <div className="container mx-auto container-padding">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="badge-primary mb-4 inline-block">Conheça o Freela</span>
          <h2 className="section-title section-title-center mb-6">
            O jeito mais seguro e organizado de contratar profissionais.
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Conectamos você a profissionais qualificados para empresas e eventos particulares em todo o Brasil —{" "}
            <span className="text-primary font-bold">sem custo adicional.</span>
          </p>
        </div>

        {/* Texto persuasivo */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-secondary rounded-2xl p-8 md:p-10 shadow-lg">
            <p className="text-secondary-foreground/80 text-base md:text-lg leading-relaxed mb-6">
              O Freela é uma plataforma que conecta contratantes a profissionais qualificados de forma{" "}
              <span className="text-primary font-bold">rápida, segura e organizada.</span>
            </p>
            <p className="text-secondary-foreground/80 text-base md:text-lg leading-relaxed mb-6">
              Seja para reforçar a equipe do seu negócio ou para seu evento em casa, você encontra profissionais prontos para trabalhar em poucos cliques.
            </p>
            <div className="bg-primary rounded-xl p-6 mt-4">
              <p className="text-primary-foreground font-bold text-lg md:text-xl text-center leading-snug">
                Você não paga nada a mais por contratar pelo Freela.
              </p>
              <p className="text-primary-foreground/80 text-center text-sm md:text-base mt-2">
                O valor é o valor de mercado. Sem taxas escondidas. Sem surpresas.
              </p>
              <p className="text-primary-foreground/70 text-center text-sm mt-2">
                A plataforma apenas organiza, facilita e dá segurança à contratação.
              </p>
            </div>
          </div>
        </div>

        {/* Blocos com ícones */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-16">
          {beneficios.map((item) =>
          <div key={item.title} className="bg-card rounded-2xl p-6 shadow-md card-hover text-center flex flex-col items-center border border-border">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-bold text-sm mb-1">{item.title}</h5>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          )}
        </div>

        {/* Mini quebra de objeção */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="bg-muted rounded-2xl p-8">
            <p className="text-muted-foreground text-base md:text-lg mb-3">
              Contratar da forma tradicional pode gerar <span className="font-semibold text-foreground">desorganização, insegurança e perda de tempo.</span>
            </p>
            <p className="text-foreground font-semibold text-base md:text-lg">
              Com o Freela, você mantém controle, clareza e praticidade — pagando{" "}
              <span className="text-primary font-bold">exatamente o que pagaria no mercado.</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/inicio?modo=empresas">
              <Building2 className="w-5 h-5" />
              Contratar para Empresa
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/inicio?modo=casa">
              <Home className="w-5 h-5" />
              Contratar para Evento em Casa
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>);

};

/* ═══════════════════════════════════════════════════
   5️⃣  PROVA SOCIAL
   ═══════════════════════════════════════════════════ */
const SocialProof = () => {
  const testimonials = [
  {
    name: "Mariana Costa",
    role: "Proprietária de Restaurante",
    text: "Precisei de 3 garçons de última hora e em 30 minutos já tinha profissionais confirmados. Incrível!"
  },
  {
    name: "Ricardo Almeida",
    role: "Organizador de Eventos",
    text: "Uso o Freela para todos os meus eventos corporativos. A qualidade dos profissionais é consistente."
  },
  {
    name: "Juliana Santos",
    role: "Festa em casa",
    text: "Contratei um churrasqueiro pelo Freela para o aniversário do meu marido. Foi perfeito, recomendo!"
  }];


  return (
    <section className="section-padding bg-muted/50 py-[60px]">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-16">
          <span className="badge-primary mb-4 inline-block">Depoimentos</span>
          <h2 className="section-title section-title-center mb-4 mx-[30px]">
            Quem usa, recomenda
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((t) =>
          <div key={t.name} className="card-elevated p-6 card-hover">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) =>
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              )}
              </div>
              <p className="text-muted-foreground mb-6 italic">"{t.text}"</p>
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
          {[
          { value: "+180 mil", label: "profissionais cadastrados", icon: Users },
          { value: "Brasil inteiro", label: "atendido", icon: TrendingUp },
          { value: "Crescimento", label: "constante", icon: CheckCircle2 }].
          map((s) =>
          <div key={s.label} className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-lg">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

};

/* ═══════════════════════════════════════════════════
   6️⃣  PARCEIROS & BENEFÍCIOS
   ═══════════════════════════════════════════════════ */
const PartnersCards = () =>
<section id="parcerias" className="section-padding bg-background scroll-mt-24 py-[60px]">
    <div className="container mx-auto container-padding">
      <div className="text-center mb-14">
        <span className="badge-primary mb-4 inline-block">🎁 Benefícios exclusivos</span>
        <h2 className="section-title section-title-center mb-4 mx-[30px]">
          Vantagens de fazer parte do Freela
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Economia real e capacitação profissional para quem usa o ecossistema Freela.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Card Prospera */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent rounded-2xl border border-emerald-500/20 p-8 md:p-10 flex flex-col hidden">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full mb-6 self-start">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold">Parceiro oficial</span>
          </div>

          <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
            Grupo Prospera — Economia na Energia
          </h3>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            Ao se cadastrar no Freela e aderir à <span className="font-semibold text-foreground">Assinatura Verde</span> do Grupo Prospera, você garante{" "}
            <span className="text-emerald-600 font-bold">15% de desconto na sua conta de energia</span>.
          </p>

          <div className="bg-emerald-600 rounded-xl p-5 mb-6 text-center">
            <p className="text-white text-3xl font-display font-extrabold mb-1">15% OFF</p>
            <p className="text-emerald-100 text-sm">na conta de energia elétrica</p>
          </div>

          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            E quanto mais você usa o Freela, <span className="font-semibold text-foreground">mais desconto pode ter na conta de energia</span>. Seus pontos acumulados se convertem em economia real.
          </p>

          <a href="https://www.meuprospera.com.br/proposta/" target="_blank" rel="noopener noreferrer" className="w-full mt-auto">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white group w-full">
              Quero cadastrar agora!
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </div>

        {/* Card Capacitação */}
        <div className="bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent rounded-2xl border border-blue-500/20 p-8 md:p-10 flex flex-col">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full mb-6 self-start">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm font-bold">Capacitação profissional</span>
          </div>

          <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
            Treinamentos e Capacitação
          </h3>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            Aprimore suas habilidades com cursos dos melhores parceiros do setor de hospitalidade e destaque-se no mercado.
          </p>

<div className="grid grid-cols-3 gap-4 mb-8">
  {[
    { emoji: "🍺", name: "Bares SP", desc: "Coquetelaria, gestão de bares e tendências do mercado.", link: "https://baressp.com.br/cursos-online/" },
    { emoji: "🥃", name: "Diageo Bar Academy", desc: "Certificação internacional em mixologia e atendimento premium.", link: "https://www.diageobaracademy.com/pt-br/home/learning-for-life" },
    { emoji: "📊", name: "Sebrae", desc: "Gestão financeira, marketing e formalização para empresários.", link: "https://sebrae.com.br/sites/PortalSebrae" }].
    map((partner) =>
      <div key={partner.name} className="bg-card rounded-xl p-4 border border-border group hover:border-blue-500/30 transition-colors min-h-[250px] flex flex-col">
        <span className="text-2xl flex-shrink-0">{partner.emoji}</span>
        <div className="flex-1">
          <h5 className="font-bold text-foreground text-sm mb-1">{partner.name}</h5>
          <p className="text-xs text-muted-foreground leading-relaxed">{partner.desc}</p>
        </div>
        <a href={partner.link} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="mt-3 flex-shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 text-xs">
            Saber mais
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </a>
      </div>
    )}
  </div>
</div>
      </div>
    </div>
  </section>;


/* ═══════════════════════════════════════════════════
   7️⃣  DÚVIDAS FREQUENTES + BAIXE O APP
   ═══════════════════════════════════════════════════ */
const faqItems = [
{
  icon: DollarSign,
  question: "Contratar pelo Freela é mais caro?",
  answer: "Não. O contratante não paga nada a mais por utilizar a plataforma. O valor é o valor de mercado. Não há taxas escondidas ou custos adicionais."
},
{
  icon: CreditCard,
  question: "O Freela cobra taxa de assinatura?",
  answer: "Não. O cadastro é gratuito."
},
{
  icon: UserCheck,
  question: "Os profissionais são verificados?",
  answer: "Todos os profissionais passam por cadastro com dados obrigatórios. Além disso, o sistema permite avaliações, garantindo mais transparência e segurança."
},
{
  icon: Users,
  question: "Posso contratar apenas um profissional?",
  answer: "Sim. Você pode contratar 1 ou quantos profissionais precisar, tanto para empresas quanto para eventos particulares."
},
{
  icon: MapPin,
  question: "O Freela atende minha cidade?",
  answer: "Estamos presentes em todo o Brasil, com milhares de profissionais cadastrados em diversas regiões."
},
{
  icon: UserPlus,
  question: "Sou profissional. Como faço para trabalhar pelo Freela?",
  answer: "Basta realizar o cadastro gratuito, completar seu perfil e começar a receber oportunidades na sua região."
},
{
  icon: FileText,
  question: "Preciso assinar contrato?",
  answer: "A plataforma organiza a intermediação da contratação, oferecendo mais segurança e clareza para ambas as partes. As regras estão todas dentro dos termos de uso."
},
{
  icon: CreditCard,
  question: "Como funciona o pagamento?",
  answer: "O contratante paga para a plataforma e, após o término do serviço, o freelancer recebe automaticamente. Em caso de desistência ou não comparecimento do freelancer, a plataforma faz o reembolso integral, conforme termos de uso."
}];


const FAQSection = () =>
<section id="duvidas" className="section-padding bg-muted/50 scroll-mt-24">
    <div className="container mx-auto container-padding">
      <div className="text-center mb-14">
        <span className="badge-primary mb-4 inline-block">❓ Tire suas dúvidas</span>
        <h2 className="section-title section-title-center mb-4 mx-[30px]">Dúvidas Frequentes</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tudo o que você precisa saber antes de contratar ou se cadastrar.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-20">
        <Accordion type="single" collapsible className="space-y-3">
          {faqItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card rounded-xl border border-border shadow-sm px-6 data-[state=open]:shadow-md transition-shadow">

                <AccordionTrigger className="hover:no-underline gap-3 py-5">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground text-sm md:text-base">
                      {item.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed pl-12">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>);

        })}
        </Accordion>
      </div>

      {/* BAIXE O APP — temporariamente desativado até o App estar pronto */}
    </div>
  </section>;


/* ═══════════════════════════════════════════════════
   8️⃣  CTA FORTE
   ═══════════════════════════════════════════════════ */
const CtaSection = () =>
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
      <div className="mt-10 flex justify-center">
        <a
        href="https://wa.me/5511999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 font-semibold text-sm">

          <MessageCircle className="w-5 h-5" />
          Fale com nosso suporte
        </a>
      </div>
    </div>
  </section>;


/* ═══════════════════════════════════════════════════
   FREELANCERS PERTO DE VOCÊ
   ═══════════════════════════════════════════════════ */
const FreelancersNearYou = () =>
<section className="section-padding bg-background py-[60px]">
    <div className="container mx-auto container-padding">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Imagem do mapa */}
        <div className="flex justify-center">
          <img

          alt="Mapa do Brasil - Freelancers disponíveis"
          className="w-full max-w-md lg:max-w-lg drop-shadow-2xl" src="/lovable-uploads/6bc76b0e-48cd-43dd-9799-173f81a4f62b.png" />

        </div>

        {/* Conteúdo */}
        <div className="text-center lg:text-left">
          <span className="badge-primary mb-4 inline-block">📍 Cobertura Nacional</span>
          <h2 className="section-title mb-6">
            Veja a quantidade de freelancers perto de você
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto lg:mx-0">
            Milhares de profissionais qualificados espalhados por todo o Brasil, prontos para trabalhar na sua região. Encontre garçons, bartenders, cozinheiros e muito mais.
          </p>
          <Button size="xl" asChild className="group">
            <Link to="/cadastro">
              <MapPin className="w-5 h-5" />
              Ver freelancers disponíveis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </section>;


/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */
const HomePage = () => {
  return (
    <AppLayout showBottomNav={false}>
      <HeroHome />
      <CountersSection />
      <OQueEoFreela />
      <HowItWorks />
      <Solutions />
      <FreelancersNearYou />
      <SocialProof />
      <PartnersCards />
      <FAQSection />
      <CtaSection />
    </AppLayout>);

};

export default HomePage;