import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  ShieldCheck,
  ClipboardCheck,
  Star,
  Building2,
  Home,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CalendarCheck,
  Eye,
  Zap,
  UserCheck,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { useMode } from "@/contexts/ModeContext";
import logoFreela from "@/assets/logo-freela-transparent.png";

const InstitutionalHome = () => {
  const { setMode } = useMode();

  return (
    <div className="bg-background">
      {/* ===== 1. HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
        {/* Subtle background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto container-padding relative z-10">
          <div className="max-w-4xl mx-auto text-center pt-28 pb-20">
            <img
              src={logoFreela}
              alt="Freela"
              className="h-16 md:h-20 w-auto mx-auto mb-8 animate-slide-up"
            />

            <h1 className="text-foreground mb-6 animate-slide-up">
              Profissionalize sua{" "}
              <span className="text-gradient">contratação de equipe.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Conectamos você a profissionais preparados para bares, restaurantes
              e eventos — de forma organizada, segura e prática.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button size="xl" asChild className="group" onClick={() => setMode("empresas")}>
                <Link to="/freelancers">
                  <Building2 className="w-5 h-5 mr-2" />
                  Sou Empresa
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="group border-success text-success hover:bg-success hover:text-success-foreground" onClick={() => setMode("casa")}>
                <Link to="/criar-evento">
                  <Home className="w-5 h-5 mr-2" />
                  Quero contratar para minha casa
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. O QUE É O FREELA ===== */}
      <section className="section-padding bg-muted/50">
        <div className="container mx-auto container-padding">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Sobre o Freela
            </span>
            <h2 className="text-foreground mb-6">
              A plataforma especializada em{" "}
              <span className="text-gradient">hospitalidade</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              O Freela é uma plataforma que conecta quem precisa contratar
              profissionais da área de hospitalidade com quem quer trabalhar.
              Garçons, bartenders, cozinheiros, churrasqueiros, copeiros, 
              recepcionistas, músicos e muito mais.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: UserCheck, title: "Profissionais cadastrados", desc: "Base verificada de profissionais da hospitalidade" },
              { icon: Star, title: "Histórico e avaliações", desc: "Veja a reputação antes de contratar" },
              { icon: ClipboardCheck, title: "Processo organizado", desc: "Contratação estruturada do início ao fim" },
              { icon: ShieldCheck, title: "Foco exclusivo no setor", desc: "Plataforma 100% dedicada à hospitalidade" },
            ].map((item) => (
              <div key={item.title} className="card-elevated p-6 text-center card-hover">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h5 className="text-foreground mb-2">{item.title}</h5>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. PROPOSTA DE VALOR ===== */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="text-center mb-16">
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Para todos os lados
            </span>
            <h2 className="text-foreground">
              Nossa proposta de <span className="text-gradient">valor</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Para quem contrata */}
            <div className="card-elevated p-8 border-t-4 border-t-primary">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-foreground">Para quem contrata</h4>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: Zap, text: "Redução de improviso na operação" },
                  { icon: CalendarCheck, text: "Mais previsibilidade na escala" },
                  { icon: Users, text: "Organização e reforço de equipe" },
                  { icon: ClipboardCheck, text: "Facilidade e agilidade na contratação" },
                  { icon: AlertTriangle, text: "Alternativa rápida em caso de imprevisto" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Para os profissionais */}
            <div className="card-elevated p-8 border-t-4 border-t-success">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-success" />
                </div>
                <h4 className="text-foreground">Para os profissionais</h4>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: TrendingUp, text: "Oportunidades constantes de trabalho" },
                  { icon: CalendarCheck, text: "Organização da agenda profissional" },
                  { icon: Eye, text: "Mais visibilidade no mercado" },
                  { icon: ShieldCheck, text: "Plataforma especializada no seu setor" },
                  { icon: MapPin, text: "Trabalhe na sua região" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. COMPARATIVO ===== */}
      <section className="section-padding bg-muted/50">
        <div className="container mx-auto container-padding">
          <div className="text-center mb-16">
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Comparativo
            </span>
            <h2 className="text-foreground">
              Por que não contratar da{" "}
              <span className="text-gradient">forma tradicional?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Tradicional */}
            <div className="card-elevated p-8 border border-destructive/20 opacity-80">
              <h4 className="text-foreground mb-6 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-destructive" />
                Modelo tradicional
              </h4>
              <ul className="space-y-4">
                {[
                  "Indicação informal e sem garantia",
                  "Sem histórico ou avaliações",
                  "Sem registro ou organização",
                  "Risco operacional alto",
                  "Depende de disponibilidade incerta",
                ].map((text) => (
                  <li key={text} className="flex items-center gap-3 text-muted-foreground">
                    <XCircle className="w-5 h-5 text-destructive shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Freela */}
            <div className="card-elevated p-8 border-2 border-primary/30 relative">
              <div className="absolute -top-3 left-6 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                RECOMENDADO
              </div>
              <h4 className="text-foreground mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Freela
              </h4>
              <ul className="space-y-4">
                {[
                  "Processo estruturado e confiável",
                  "Profissionais cadastrados e verificados",
                  "Mais segurança na contratação",
                  "Foco exclusivo no setor de hospitalidade",
                  "Disponibilidade em tempo real",
                ].map((text) => (
                  <li key={text} className="flex items-center gap-3 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. AUTORIDADE ===== */}
      <section className="section-padding hero-gradient">
        <div className="container mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-secondary mb-4 hero-text-shadow">
              Números que falam por si
            </h2>
            <p className="text-secondary/70 text-lg">
              Crescendo em todo o Brasil
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { value: "+170 mil", label: "Profissionais cadastrados", icon: Users },
              { value: "100%", label: "Especializada em hospitalidade", icon: ShieldCheck },
              { value: "Brasil", label: "Crescendo em todo o país", icon: MapPin },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-secondary" />
                </div>
                <p className="font-display text-3xl md:text-4xl font-bold text-secondary mb-2">
                  {stat.value}
                </p>
                <p className="text-secondary/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. DIRECIONAMENTO ===== */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="text-center mb-16">
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Escolha seu caminho
            </span>
            <h2 className="text-foreground">
              Como você quer <span className="text-gradient">contratar?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Empresas */}
            <div className="card-elevated p-8 md:p-10 card-hover border-2 border-transparent hover:border-primary/30 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-foreground mb-3">Freela para Empresas</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Para bares, restaurantes, hotéis e eventos corporativos. Equipe
                extra, reforço de escala e substituições rápidas com profissionais
                avaliados.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Reforço de equipe sob demanda
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Substituição de faltas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Valor pré-fixado
                </li>
              </ul>
              <Button size="lg" asChild className="w-full group/btn" onClick={() => setMode("empresas")}>
                <Link to="/freelancers">
                  Acessar Freela para Empresas
                  <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Casa */}
            <div className="card-elevated p-8 md:p-10 card-hover border-2 border-transparent hover:border-success/30 group">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-success/20 transition-colors">
                <Home className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-foreground mb-3">Freela em Casa</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Para aniversários, churrascos, casamentos e eventos particulares.
                Profissionais para sua festa com praticidade e preço fechado.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Churrasqueiro, barman, DJ e mais
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Preço automático, sem negociação
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Contratação simples e rápida
                </li>
              </ul>
              <Button size="lg" variant="outline" asChild className="w-full group/btn border-success text-success hover:bg-success hover:text-success-foreground" onClick={() => setMode("casa")}>
                <Link to="/criar-evento">
                  Acessar Freela em Casa
                  <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 7. CTA FINAL ===== */}
      <section className="section-padding bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-40 h-40 bg-primary rounded-full blur-2xl" />
          <div className="absolute bottom-10 left-20 w-60 h-60 bg-primary rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto container-padding relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-secondary-foreground mb-4">
              Escolha como quer contratar.
            </h2>
            <p className="text-secondary-foreground/70 text-xl mb-10 max-w-xl mx-auto">
              Pare de improvisar.
              <br />
              <strong className="text-primary">
                Profissionalize sua contratação.
              </strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cta" size="xl" asChild className="group" onClick={() => setMode("empresas")}>
                <Link to="/freelancers">
                  <Building2 className="w-5 h-5 mr-2" />
                  Freela para Empresas
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="group border-success text-success hover:bg-success hover:text-success-foreground" onClick={() => setMode("casa")}>
                <Link to="/criar-evento">
                  <Home className="w-5 h-5 mr-2" />
                  Freela em Casa
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InstitutionalHome;
