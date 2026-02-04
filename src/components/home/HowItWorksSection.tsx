import { UserPlus, Search, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HowItWorksSection = () => {
  const clientSteps = [
    {
      icon: UserPlus,
      step: "01",
      title: "Crie sua conta",
      description: "Cadastro rápido e gratuito. Em poucos minutos você estará pronto para começar.",
    },
    {
      icon: Search,
      step: "02",
      title: "Publique seu projeto",
      description: "Descreva o que precisa, defina o orçamento e prazo. Simples assim.",
    },
    {
      icon: MessageSquare,
      step: "03",
      title: "Receba propostas",
      description: "Freelancers qualificados enviarão propostas. Compare e converse com eles.",
    },
    {
      icon: CheckCircle,
      step: "04",
      title: "Contrate e aprove",
      description: "Escolha o melhor, acompanhe o trabalho e pague apenas quando aprovar.",
    },
  ];

  const freelancerSteps = [
    {
      icon: UserPlus,
      step: "01",
      title: "Crie seu perfil",
      description: "Monte seu portfólio, adicione suas habilidades e mostre seu diferencial.",
    },
    {
      icon: Search,
      step: "02",
      title: "Encontre projetos",
      description: "Navegue por milhares de oportunidades que combinam com suas habilidades.",
    },
    {
      icon: MessageSquare,
      step: "03",
      title: "Envie propostas",
      description: "Apresente-se, mostre seu trabalho anterior e faça sua oferta.",
    },
    {
      icon: CheckCircle,
      step: "04",
      title: "Entregue e receba",
      description: "Realize o trabalho, receba a aprovação e o pagamento cai na sua conta.",
    },
  ];

  return (
    <section className="section-padding bg-muted">
      <div className="container mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="badge-primary mb-4 inline-block">Como funciona</span>
          <h2 className="mb-4">Simples para todos</h2>
          <p className="text-lg text-muted-foreground">
            Seja você um cliente buscando talentos ou um freelancer em busca de 
            oportunidades, o processo é rápido e intuitivo.
          </p>
        </div>

        {/* Two Columns */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* For Clients */}
          <div>
            <div className="bg-primary rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-display font-bold text-primary-foreground text-center">
                Para Clientes
              </h3>
            </div>
            <div className="space-y-6">
              {clientSteps.map((item, index) => (
                <div key={item.step} className="flex gap-4 group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    {index < clientSteps.length - 1 && (
                      <div className="w-0.5 h-8 bg-border mx-auto mt-2" />
                    )}
                  </div>
                  <div className="pt-2">
                    <h4 className="font-display font-semibold text-lg mb-1">{item.title}</h4>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/cadastro?tipo=cliente">Quero contratar</Link>
              </Button>
            </div>
          </div>

          {/* For Freelancers */}
          <div>
            <div className="bg-secondary rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-display font-bold text-secondary-foreground text-center">
                Para Freelancers
              </h3>
            </div>
            <div className="space-y-6">
              {freelancerSteps.map((item, index) => (
                <div key={item.step} className="flex gap-4 group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    {index < freelancerSteps.length - 1 && (
                      <div className="w-0.5 h-8 bg-border mx-auto mt-2" />
                    )}
                  </div>
                  <div className="pt-2">
                    <h4 className="font-display font-semibold text-lg mb-1">{item.title}</h4>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto">
                <Link to="/cadastro?tipo=freelancer">Quero trabalhar</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
