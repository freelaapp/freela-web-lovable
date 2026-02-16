import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PartnersBenefitsSection from "@/components/home/PartnersBenefitsSection";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Users,
  TrendingUp,
  Star,
  Clock,
  BadgeCheck,
} from "lucide-react";
import logoFreela from "@/assets/logo-freela.png";

const EmpresasLandingPage = () => {
  return (
    <div className="bg-background">
      {/* ========== HERO DE CONVERSÃO ========== */}
      <section className="relative min-h-screen flex items-center hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto container-padding relative z-10">
          <div className="max-w-4xl mx-auto pt-28 pb-16">
            <div className="flex justify-center mb-8">
              <img
                src={logoFreela}
                alt="Freela Serviços"
                className="h-16 md:h-24 w-auto drop-shadow-lg animate-blink"
              />
            </div>

            <h1 className="text-secondary text-center mb-6 hero-text-shadow">
              Seu funcionário{" "}
              <span className="relative inline-block">
                faltou hoje?
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C50 2 150 2 198 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-secondary/80 text-center max-w-3xl mx-auto mb-8 leading-relaxed">
              O Freela te ajuda a resolver, de forma <strong>rápida, prática e sem custo extra</strong> para você — dono de bar, restaurante, buffet ou empresa de eventos.
            </p>

            <p className="text-lg text-secondary/70 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
              Contratar por indicação ou grupo de WhatsApp deixa seu negócio vulnerável.{" "}
              <strong>No Freela você contrata profissionais avaliados, com histórico e processo organizado.</strong>
            </p>

            {/* 4 Bullets de impacto */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
              {[
                "Veja avaliações antes de contratar",
                "Histórico de trabalhos anteriores",
                "Registro organizado da contratação",
                "Alternativa rápida em caso de imprevisto",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 bg-secondary/10 rounded-xl px-5 py-4">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-secondary font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild className="group">
                <Link to="/cadastro">
                  Criar conta gratuita
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/freelancers">Buscar profissional disponível</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BLOCO DE DOR ========== */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto container-padding">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-destructive/20 text-destructive px-4 py-2 rounded-full mb-8">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-bold">Atenção</span>
            </span>

            <h2 className="text-secondary-foreground mb-12">
              Você já passou por isso?
            </h2>

            <div className="space-y-5 text-left max-w-xl mx-auto mb-12">
              {[
                "Profissional confirma e não aparece",
                "Atendimento cai e o cliente reclama",
                "Funcionário temporário gera problema trabalhista",
                "Você precisa resolver tudo de última hora",
                "Fica refém de indicação informal",
              ].map((pain) => (
                <div key={pain} className="flex items-start gap-4 bg-secondary-foreground/5 rounded-xl p-5">
                  <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-secondary-foreground text-lg">{pain}</span>
                </div>
              ))}
            </div>

            <div className="bg-primary/20 rounded-2xl p-8 border border-primary/30">
              <p className="text-xl md:text-2xl font-display font-bold text-secondary-foreground">
                Se a resposta for sim, você precisa{" "}
                <span className="text-primary">profissionalizar sua contratação.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== COMPARATIVO ========== */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <div className="text-center mb-16">
            <span className="badge-primary mb-6 inline-block">⚖ Comparativo direto</span>
            <h2 className="mb-4 section-title section-title-center">
              Clareza gera <span className="text-gradient">conversão</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Tradicional */}
            <div className="card-elevated p-8 border-2 border-destructive/20">
              <h4 className="text-card-foreground mb-6 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-destructive" />
                Contratação tradicional
              </h4>
              <div className="space-y-4">
                {[
                  "Sem avaliação",
                  "Sem histórico",
                  "Sem registro",
                  "Sem suporte",
                  "Alto risco operacional",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Freela */}
            <div className="card-elevated p-8 border-2 border-primary ring-2 ring-primary/20 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                Recomendado
              </div>
              <h4 className="text-card-foreground mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Contratando pelo Freela
              </h4>
              <div className="space-y-4">
                {[
                  "Profissionais cadastrados na plataforma",
                  "Avaliações reais",
                  "Processo organizado",
                  "Mais previsibilidade",
                  "Foco exclusivo em bares e restaurantes",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-card-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BLOCO DE AUTORIDADE ========== */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto container-padding">
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            {[
              { icon: Users, value: "170 mil+", label: "Profissionais cadastrados" },
              { icon: Star, value: "Especializada", label: "No setor de hospitalidade" },
              { icon: TrendingUp, value: "Crescendo", label: "Em todo o Brasil" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-3">
                <div className="p-3 bg-primary-light rounded-xl">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="font-display font-bold text-2xl text-foreground">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== QUEBRA DE OBJEÇÃO FINANCEIRA ========== */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="badge-primary mb-6 inline-block">💰 Sobre o custo</span>
              <h2 className="mb-4 section-title section-title-center">
                <span className="text-gradient">"É mais caro?"</span>
              </h2>
              <p className="text-xl text-muted-foreground mt-8">
                <strong className="text-foreground">Errado.</strong> No Freela você não paga nada a mais por isso — os profissionais cobram valores praticados no mercado.
              </p>
            </div>

            <div className="bg-destructive/5 rounded-2xl p-8 border border-destructive/20 mb-10">
              <h4 className="text-foreground mb-6 text-center">O que sai caro de verdade é:</h4>
              <div className="space-y-4 max-w-lg mx-auto">
                {[
                  "Perder cliente por mau atendimento",
                  "Ter problema trabalhista",
                  "Ficar sem equipe em dia de pico",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <span className="text-foreground text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/10 rounded-2xl p-8 border border-primary/30 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">
                O Freela não é custo.
              </p>
              <p className="text-2xl font-display font-bold text-primary">
                É proteção operacional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BENEFÍCIOS PARCEIROS ========== */}
      <PartnersBenefitsSection />

      {/* ========== CTA FINAL ========== */}
      <section className="section-padding hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-40 h-40 bg-secondary rounded-full blur-2xl" />
          <div className="absolute bottom-10 left-20 w-60 h-60 bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto container-padding relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-8">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-sm font-bold">Profissionalize agora</span>
            </div>

            <h2 className="text-secondary mb-6 hero-text-shadow">
              Profissionalize sua contratação agora.
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button variant="hero" size="xl" asChild className="group">
                <Link to="/cadastro">
                  Criar conta gratuita
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/freelancers">Buscar profissional disponível</Link>
              </Button>
            </div>

            <div className="bg-secondary/10 rounded-2xl p-8 max-w-xl mx-auto">
              <p className="text-xl md:text-2xl font-display font-bold text-secondary leading-relaxed">
                Quem improvisa corre risco.
              </p>
              <p className="text-xl md:text-2xl font-display font-bold text-secondary">
                Quem profissionaliza{" "}
                <span className="relative inline-block">
                  cresce.
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 100 8" fill="none">
                    <path d="M2 5C25 2 75 2 98 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </p>
            </div>

            <p className="mt-6 text-sm text-secondary/60">
              Valor de mercado • Sem vínculo • Profissionais avaliados
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmpresasLandingPage;
