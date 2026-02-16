import { useNavigate } from "react-router-dom";
import { useMode } from "@/contexts/ModeContext";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { MapPin, Users, Wifi, GraduationCap, Handshake, ArrowRight, Home, Building2, UserPlus, PartyPopper, UtensilsCrossed, Star, BookOpen, Award } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useEffect, useState } from "react";

const HomePage = () => {
  const navigate = useNavigate();
  const { setMode } = useMode();
  const autoplayPlugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));

  const handleModeCasa = () => {
    setMode("casa");
    navigate("/inicio");
  };

  const handleModeEmpresas = () => {
    setMode("empresas");
    navigate("/inicio");
  };

  return (
    <AppLayout>
      {/* HERO CAROUSEL */}
      <section className="relative">
        <Carousel
          opts={{ loop: true, align: "start" }}
          plugins={[autoplayPlugin.current]}
          className="w-full"
        >
          <CarouselContent>
            {/* Slide 1 - Institucional */}
            <CarouselItem>
              <div className="hero-gradient min-h-[70vh] md:min-h-[80vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary/20" />
                <div className="relative z-10 text-center container-padding max-w-4xl mx-auto">
                  <span className="badge-primary mb-6 inline-block">Plataforma Freela</span>
                  <h1 className="text-secondary-foreground mb-6 hero-text-shadow">
                    Venha fazer parte do <span className="text-gradient">Freela!</span>
                  </h1>
                  <p className="text-lg md:text-xl text-secondary-foreground/80 mb-10 max-w-2xl mx-auto">
                    O Freela é um sistema que integra freelancers a contratantes de forma simples, rápida e segura.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="hero" onClick={handleModeCasa} className="gap-2">
                      <Home className="w-5 h-5" /> Freela em Casa
                    </Button>
                    <Button size="lg" variant="hero" onClick={handleModeEmpresas} className="gap-2">
                      <Building2 className="w-5 h-5" /> Freela Bares e Restaurantes
                    </Button>
                    <Button size="lg" variant="hero-outline" onClick={() => navigate("/cadastro")} className="gap-2">
                      <UserPlus className="w-5 h-5" /> Cadastre-se
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 2 - Foco Negócios */}
            <CarouselItem>
              <div className="bg-secondary min-h-[70vh] md:min-h-[80vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-primary/20" />
                <div className="relative z-10 text-center container-padding max-w-4xl mx-auto">
                  <span className="badge-primary mb-6 inline-block">Para Empresários</span>
                  <h1 className="text-secondary-foreground mb-6 hero-text-shadow">
                    Precisa de ajuda no seu <span className="text-gradient">negócio?</span>
                  </h1>
                  <p className="text-lg md:text-xl text-secondary-foreground/80 mb-10 max-w-2xl mx-auto">
                    O Freela Serviços conecta freelancers qualificados para seu bar ou restaurante.
                    Não sofra mais com falta de funcionários e não gaste nada além do necessário.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="hero" onClick={handleModeEmpresas} className="gap-2">
                      <UtensilsCrossed className="w-5 h-5" /> Saiba mais sobre Freela Bares e Restaurantes
                    </Button>
                    <Button size="lg" variant="hero-outline" onClick={() => navigate("/cadastro")} className="gap-2">
                      <UserPlus className="w-5 h-5" /> Cadastre-se
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 3 - Foco Eventos/CPF */}
            <CarouselItem>
              <div className="hero-gradient min-h-[70vh] md:min-h-[80vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10" />
                <div className="relative z-10 text-center container-padding max-w-4xl mx-auto">
                  <span className="badge-primary mb-6 inline-block">Para Você</span>
                  <h1 className="text-secondary-foreground mb-6 hero-text-shadow">
                    Festa em família sem <span className="text-gradient">preocupação!</span>
                  </h1>
                  <p className="text-lg md:text-xl text-secondary-foreground/80 mb-10 max-w-2xl mx-auto">
                    Com o Freela, contrate freelancers para sua festa particular e apenas curta e relaxe.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="hero" onClick={handleModeCasa} className="gap-2">
                      <PartyPopper className="w-5 h-5" /> Saiba mais sobre Freela em Casa
                    </Button>
                    <Button size="lg" variant="hero-outline" onClick={() => navigate("/cadastro")} className="gap-2">
                      <UserPlus className="w-5 h-5" /> Cadastre-se
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 4 - Captação Freelancer */}
            <CarouselItem>
              <div className="bg-secondary min-h-[70vh] md:min-h-[80vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary via-secondary to-primary/30" />
                <div className="relative z-10 text-center container-padding max-w-4xl mx-auto">
                  <span className="badge-primary mb-6 inline-block">Seja Freelancer</span>
                  <h1 className="text-secondary-foreground mb-6 hero-text-shadow">
                    Renda extra a alguns <span className="text-gradient">cliques</span>
                  </h1>
                  <p className="text-lg md:text-xl text-secondary-foreground/80 mb-10 max-w-2xl mx-auto">
                    Transforme sua habilidade em oportunidade.
                    Escolha quando trabalhar, aceite serviços perto de você e receba com segurança.
                    No Freela, você tem liberdade e crescimento profissional.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="hero" onClick={() => navigate("/cadastro")} className="gap-2">
                      <Star className="w-5 h-5" /> Quero ser Freelancer
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </section>

      {/* FREELAS PERTO DE VOCÊ */}
      <section className="section-padding bg-background">
        <div className="container-padding max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge-primary mb-8">
            <MapPin className="w-5 h-5" /> Perto de você
          </div>
          <h2 className="section-title section-title-center mb-6">
            Freelancers ativos na sua região
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Profissionais qualificados prontos para atender você
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <CounterCard icon={<Users className="w-8 h-8 text-primary" />} target={247} label="Freelancers cadastrados" sublabel="em um raio de 30km" />
            <CounterCard icon={<Wifi className="w-8 h-8 text-primary" />} target={38} label="Profissionais conectados" sublabel="disponíveis agora" />
            <CounterCard icon={<Star className="w-8 h-8 text-primary" />} target={1200} label="Serviços realizados" sublabel="na sua região" />
          </div>

          <Button size="xl" variant="cta" onClick={() => navigate("/freelancers")} className="gap-2">
            Encontrar profissional agora <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* PARCERIAS */}
      <section className="section-padding bg-muted/50">
        <div className="container-padding max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge-primary mb-8">
            <Handshake className="w-5 h-5" /> Ecossistema
          </div>
          <h2 className="section-title section-title-center mb-6">
            Empresas que acreditam no Freela
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Nosso ecossistema cresce a cada dia com parceiros que compartilham a visão de um mercado freelance mais justo e profissional.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Fornecedores", icon: <UtensilsCrossed className="w-6 h-6" />, desc: "Insumos e materiais" },
              { name: "Espaços de Eventos", icon: <PartyPopper className="w-6 h-6" />, desc: "Locais parceiros" },
              { name: "Distribuidoras", icon: <Building2 className="w-6 h-6" />, desc: "Bebidas e alimentos" },
              { name: "Escolas", icon: <GraduationCap className="w-6 h-6" />, desc: "Capacitação profissional" },
            ].map((partner) => (
              <div key={partner.name} className="card-elevated card-hover p-6 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {partner.icon}
                </div>
                <h5 className="font-semibold">{partner.name}</h5>
                <p className="text-sm text-muted-foreground">{partner.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPACITAÇÃO */}
      <section className="section-padding bg-background">
        <div className="container-padding max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge-primary mb-8">
            <GraduationCap className="w-5 h-5" /> Capacitação
          </div>
          <h2 className="section-title section-title-center mb-6">
            Mais que uma plataforma. Um crescimento profissional.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Oferecemos acesso a materiais de ensinamento, capacitação e desenvolvimento contínuo para que nossos freelancers evoluam e entreguem mais qualidade ao mercado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { name: "Bares SP", icon: <UtensilsCrossed className="w-7 h-7" />, desc: "Coquetelaria e serviço de bar com os melhores profissionais de SP" },
              { name: "Diageo Bar Academy", icon: <Award className="w-7 h-7" />, desc: "Mixologia premium e técnicas avançadas de bar com certificação internacional" },
              { name: "Sebrae", icon: <BookOpen className="w-7 h-7" />, desc: "Gestão, finanças e empreendedorismo para empresários do setor" },
            ].map((course) => (
              <div key={course.name} className="card-elevated card-hover p-8 text-left">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {course.icon}
                </div>
                <h4 className="mb-2">{course.name}</h4>
                <p className="text-muted-foreground">{course.desc}</p>
              </div>
            ))}
          </div>

          <Button size="xl" variant="cta" className="gap-2">
            Conheça as capacitações <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="hero-gradient section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/30" />
        <div className="relative z-10 container-padding max-w-4xl mx-auto text-center">
          <h2 className="text-secondary-foreground mb-6 hero-text-shadow">
            Seu próximo serviço começa aqui.
          </h2>
          <p className="text-xl text-secondary-foreground/80 mb-10 max-w-2xl mx-auto">
            Seja contratante ou freelancer, o Freela conecta você ao melhor do mercado de hospitalidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="hero" onClick={() => navigate("/cadastro")} className="gap-2">
              Comece agora <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="xl" variant="hero-outline" onClick={handleModeCasa} className="gap-2">
              Explorar plataforma
            </Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

/* Animated Counter Card */
const CounterCard = ({
  icon,
  target,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  target: number;
  label: string;
  sublabel: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="card-elevated card-hover p-8 flex flex-col items-center gap-3">
      {icon}
      <span className="text-4xl font-bold text-foreground">{count.toLocaleString("pt-BR")}+</span>
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{sublabel}</p>
    </div>
  );
};

export default HomePage;
