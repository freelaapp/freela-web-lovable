import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  Eye,
  ShieldCheck,
  Star,
  TrendingUp,
  CheckCircle2,
  MapPin,
  Wallet,
} from "lucide-react";

const ProfissionaisPage = () => {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20">
        <div className="container mx-auto container-padding text-center">
          <span className="inline-block bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
            Para freelancers da hospitalidade
          </span>
          <h1 className="text-secondary mb-4 hero-text-shadow">
            Trabalhe como freelancer na sua região
          </h1>
          <p className="text-xl text-secondary/80 max-w-2xl mx-auto mb-8">
            Cadastre-se gratuitamente e receba oportunidades de trabalho em
            bares, restaurantes, eventos e festas particulares.
          </p>
          <Button variant="hero" size="xl" asChild className="group">
            <Link to="/cadastro">
              Quero me cadastrar como freelancer
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-foreground mb-4">
              Vantagens de ser um{" "}
              <span className="text-gradient">freelancer no Freela</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Briefcase, title: "Mais oportunidades", desc: "Receba convites de trabalho em bares, restaurantes, eventos corporativos e festas." },
              { icon: CalendarCheck, title: "Organize sua agenda", desc: "Gerencie seus dias disponíveis e aceite apenas os serviços que cabem na sua rotina." },
              { icon: Eye, title: "Mais visibilidade", desc: "Seu perfil é visto por empresas e clientes que buscam profissionais qualificados." },
              { icon: Star, title: "Construa sua reputação", desc: "Avaliações dos contratantes valorizam seu trabalho e aumentam suas chances." },
              { icon: MapPin, title: "Trabalhe perto de você", desc: "Encontre oportunidades na sua região, sem precisar se deslocar grandes distâncias." },
              { icon: Wallet, title: "Valor justo e transparente", desc: "Valor pré-fixado por diária ou evento, sem negociação e sem surpresas." },
            ].map((item) => (
              <div key={item.title} className="card-elevated p-6 card-hover">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h5 className="text-foreground mb-2">{item.title}</h5>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-muted/50">
        <div className="container mx-auto container-padding text-center">
          <h2 className="text-foreground mb-12">
            Como funciona para o <span className="text-gradient">freelancer</span>
          </h2>
          <div className="grid sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Cadastre-se", desc: "Crie seu perfil com suas habilidades e experiência" },
              { step: "2", title: "Defina disponibilidade", desc: "Marque os dias e horários em que pode trabalhar" },
              { step: "3", title: "Receba oportunidades", desc: "Empresas e clientes encontram você pela plataforma" },
              { step: "4", title: "Trabalhe e cresça", desc: "Receba avaliações e construa sua carreira" },
            ].map((item) => (
              <div key={item.step}>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <h5 className="text-foreground mb-2">{item.title}</h5>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professions */}
      <section className="section-padding">
        <div className="container mx-auto container-padding text-center">
          <h2 className="text-foreground mb-4">
            Categorias de <span className="text-gradient">freelancers</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto">
            Se você é profissional de hospitalidade, o Freela é para você.
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {[
              "Garçom", "Bartender", "Cozinheiro(a)", "Churrasqueiro",
              "Copeiro(a)", "Auxiliar de cozinha", "Recepcionista",
              "Maitre", "Barista", "Sommelier", "DJ", "Músico",
              "Auxiliar de limpeza", "Segurança",
            ].map((cat) => (
              <span
                key={cat}
                className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto container-padding text-center">
          <h2 className="text-secondary-foreground mb-4">
            Comece a trabalhar como freelancer hoje
          </h2>
          <p className="text-secondary-foreground/70 text-lg mb-8 max-w-xl mx-auto">
            Cadastro gratuito. Comece a receber oportunidades de trabalho na sua região.
          </p>
          <Button variant="cta" size="xl" asChild className="group">
            <Link to="/cadastro">
              Criar meu perfil de freelancer
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </AppLayout>
  );
};

export default ProfissionaisPage;
