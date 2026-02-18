import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Briefcase, Star, Home, Building2 } from "lucide-react";
import { useMode } from "@/contexts/ModeContext";
import logoFreela from "@/assets/logo-freela.png";

const HeroSection = () => {
  const { isFreelaCasa } = useMode();

  const stats = isFreelaCasa ?
  [
  { icon: Users, value: "15.000+", label: "Profissionais" },
  { icon: Home, value: "50.000+", label: "Eventos realizados" },
  { icon: Star, value: "4.9", label: "Avaliação média" }] :

  [
  { icon: Users, value: "15.000+", label: "Freelancers cadastrados" },
  { icon: Briefcase, value: "8.000+", label: "Estabelecimentos" },
  { icon: Star, value: "4.9", label: "Avaliação média" }];


  return (
    <section className="relative min-h-screen flex items-center hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 py-[22px]">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto container-padding relative z-10 py-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center pt-24 pb-16 py-0">
          {/* Content */}
          <div className="text-center lg:text-left animate-slide-up">
            {/* Logo destacada com animação */}
            <div className="mb-8 flex justify-center lg:justify-start">
              <img
                src={logoFreela}
                alt="Freela Serviços"
                className="h-20 md:h-28 lg:h-32 w-auto drop-shadow-lg animate-blink hover:scale-105 transition-transform cursor-pointer" />

            </div>
            
            <span className="inline-block bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
              {isFreelaCasa ?
              <>🏠 Freela em Casa - Eventos particulares</> :

              <>🏢 Freelancers para bares, restaurantes e eventos</>
              }
            </span>
            
            <h1 className="text-secondary mb-6 hero-text-shadow text-5xl">
              {isFreelaCasa ?
              <>
                  Contrate um profissional para{" "}
                  <span className="relative">
                    seu evento
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                      <path d="M2 8C50 2 150 2 198 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                </> :

              <>
                  Freelancers prontos para o seu{" "}
                  <span className="relative">
                    estabelecimento
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                      <path d="M2 8C50 2 150 2 198 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                </>
              }
            </h1>
            
            <p className="text-lg text-secondary/80 mb-8 max-w-xl mx-auto lg:mx-0 md:text-lg">
              {isFreelaCasa ?
              "Churrasqueiro, barman, músico, DJ, garçom e mais. Profissionais qualificados para festas, confraternizações e eventos em sua casa. Simples e sem negociação." :
              "Garçons, bartenders, cozinheiros e mais para bares, restaurantes, buffets e hotéis. Valor pré-fixado, sem negociação e profissionais avaliados."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button variant="hero" size="xl" asChild className="group">
                <Link to={isFreelaCasa ? "/criar-evento" : "/cadastro"}>
                  {isFreelaCasa ? "Contratar agora" : "Cadastrar meu estabelecimento"}
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/freelancers">
                  {isFreelaCasa ? "Ver profissionais" : "Ver freelancers disponíveis"}
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8">
              {stats.map((stat) =>
              <div key={stat.label} className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <stat.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg text-secondary">{stat.value}</p>
                    <p className="text-sm text-secondary/70">{stat.label}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative z-10 animate-float">
              {/* Main Card */}
              <div className="bg-card rounded-2xl shadow-lg p-6 max-w-sm ml-auto">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {isFreelaCasa ? "CS" : "JC"}
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {isFreelaCasa ? "Carlos Silva" : "Felipe Santos"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isFreelaCasa ? "Churrasqueiro" : "Garçom"}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-medium">4.9</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {isFreelaCasa ?
                  "\"Churrasco incrível! Carlos cuidou de tudo e os convidados amaram. Super recomendo!\"" :
                  "\"Profissional pontual e atencioso. Atendeu meu restaurante num sábado lotado e deu conta de tudo.\""}
                </p>
                <div className="flex gap-2">
                  {isFreelaCasa ?
                  <>
                      <span className="px-3 py-1 bg-primary-light rounded-full text-xs font-medium text-primary">
                        Churrasco
                      </span>
                      <span className="px-3 py-1 bg-primary-light rounded-full text-xs font-medium text-primary">
                        Eventos
                      </span>
                    </> :

                  <>
                      <span className="px-3 py-1 bg-primary-light rounded-full text-xs font-medium text-primary">
                        Garçom
                      </span>
                      <span className="px-3 py-1 bg-primary-light rounded-full text-xs font-medium text-primary">
                        Restaurantes
                      </span>
                    </>
                  }
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -left-8 top-1/2 bg-card rounded-xl shadow-md p-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-sm font-medium">
                    {isFreelaCasa ? "Profissional contratado!" : "Freelancer confirmado!"}
                  </span>
                </div>
              </div>

              <div className="absolute -right-4 bottom-8 bg-card rounded-xl shadow-md p-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {isFreelaCasa ? "R$ 480" : "R$ 180"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isFreelaCasa ? "Valor do serviço" : "Valor pré-fixado/diária"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default HeroSection;