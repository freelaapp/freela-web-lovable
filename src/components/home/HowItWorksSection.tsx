import { UserPlus, Search, MessageSquare, CheckCircle, Calendar, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useMode } from "@/contexts/ModeContext";

const HowItWorksSection = () => {
  const { isFreelaCasa } = useMode();

  // Passos para clientes PJ (modo empresas)
  const clientStepsPJ = [
    {
      icon: UserPlus,
      step: "01",
      title: "Cadastre seu estabelecimento",
      description: "Informe seu bar, restaurante, buffet ou hotel. Cadastro rápido e gratuito.",
    },
    {
      icon: Search,
      step: "02",
      title: "Escolha os freelancers",
      description: "Garçons, bartenders, cozinheiros e mais. Veja avaliações e perfis completos.",
    },
    {
      icon: MessageSquare,
      step: "03",
      title: "Valor pré-fixado",
      description: "Sem negociação! O valor já está definido por tipo de serviço e diária.",
    },
    {
      icon: CheckCircle,
      step: "04",
      title: "Confirme e receba",
      description: "O freelancer confirma presença e vai até seu estabelecimento no dia combinado.",
    },
  ];

  // Passos para clientes PF (Freela em Casa)
  const clientStepsPF = [
    {
      icon: Calendar,
      step: "01",
      title: "Escolha o serviço",
      description: "Selecione o tipo de profissional, data, horário e quantidade de horas.",
    },
    {
      icon: MapPin,
      step: "02",
      title: "Informe o endereço",
      description: "Digite o local do evento. O profissional irá até sua casa.",
    },
    {
      icon: CreditCard,
      step: "03",
      title: "Veja o valor",
      description: "O preço é calculado automaticamente. Sem negociação, simples e direto.",
    },
    {
      icon: CheckCircle,
      step: "04",
      title: "Confirme e pronto!",
      description: "O profissional é notificado e confirma sua presença. Aproveite seu evento!",
    },
  ];

  // Passos para freelancers PJ
  const freelancerStepsPJ = [
    {
      icon: UserPlus,
      step: "01",
      title: "Cadastre-se como freelancer",
      description: "Informe seu serviço (garçom, bartender, cozinheiro, etc.) e sua disponibilidade.",
    },
    {
      icon: Search,
      step: "02",
      title: "Receba oportunidades",
      description: "Bares, restaurantes e hotéis da sua região vão solicitar seus serviços.",
    },
    {
      icon: MessageSquare,
      step: "03",
      title: "Aceite e confirme",
      description: "Veja os detalhes do estabelecimento, data e valor. Aceite com um clique.",
    },
    {
      icon: CheckCircle,
      step: "04",
      title: "Trabalhe e receba",
      description: "Compareça ao local, realize o serviço e receba o pagamento na sua conta.",
    },
  ];

  // Passos para freelancers PF
  const freelancerStepsPF = [
    {
      icon: UserPlus,
      step: "01",
      title: "Cadastre-se",
      description: "Crie seu perfil, informe seu serviço e adicione estilos (se for músico).",
    },
    {
      icon: Search,
      step: "02",
      title: "Receba oportunidades",
      description: "Eventos em residências aparecerão para você aceitar ou recusar.",
    },
    {
      icon: MapPin,
      step: "03",
      title: "Confira os detalhes",
      description: "Veja endereço, data, horário e o valor que você irá receber.",
    },
    {
      icon: CheckCircle,
      step: "04",
      title: "Aceite e trabalhe",
      description: "Confirme sua presença, realize o serviço e receba seu pagamento.",
    },
  ];

  const clientSteps = isFreelaCasa ? clientStepsPF : clientStepsPJ;
  const freelancerSteps = isFreelaCasa ? freelancerStepsPF : freelancerStepsPJ;

  return (
    <section className="section-padding bg-muted">
      <div className="container mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <span className="badge-primary mb-6 inline-block text-base px-5 py-2">🚀 Como funciona</span>
          <h2 className="mb-6 section-title section-title-center">Simples para todos</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {isFreelaCasa
              ? "Contrate um profissional para seu evento ou cadastre-se para trabalhar. Tudo de forma rápida e prática."
              : "Seja você um bar buscando garçons ou um freelancer em busca de diárias, o processo é rápido e sem burocracia."}
          </p>
        </div>

        {/* Two Columns */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* For Clients */}
          <div>
            <div className="bg-primary rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-display font-bold text-primary-foreground text-center">
                {isFreelaCasa ? "Para quem contrata" : "Para Estabelecimentos"}
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
                <Link to={isFreelaCasa ? "/criar-evento" : "/cadastro?tipo=cliente"}>
                  {isFreelaCasa ? "Contratar agora" : "Cadastrar estabelecimento"}
                </Link>
              </Button>
            </div>
          </div>

          {/* For Freelancers */}
          <div>
            <div className="bg-secondary rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-display font-bold text-secondary-foreground text-center">
                {isFreelaCasa ? "Para profissionais" : "Para Freelancers"}
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
                <Link to="/cadastro?tipo=freelancer">
                  {isFreelaCasa ? "Quero trabalhar" : "Quero trabalhar"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
