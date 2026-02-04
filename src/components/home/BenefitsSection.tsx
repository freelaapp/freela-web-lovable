import { Shield, Zap, Clock, Users, CreditCard, Award } from "lucide-react";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Zap,
      title: "Rápido e Fácil",
      description: "Publique seu projeto em minutos e receba propostas de freelancers qualificados rapidamente.",
    },
    {
      icon: Shield,
      title: "Pagamento Seguro",
      description: "Seu dinheiro fica protegido até você aprovar a entrega do trabalho. Garantia total.",
    },
    {
      icon: Users,
      title: "Talentos Verificados",
      description: "Freelancers passam por verificação de identidade e têm portfólios e avaliações reais.",
    },
    {
      icon: Clock,
      title: "Suporte 24/7",
      description: "Nossa equipe está sempre disponível para ajudar você em qualquer etapa do processo.",
    },
    {
      icon: CreditCard,
      title: "Sem Taxas Ocultas",
      description: "Transparência total nos custos. Você sabe exatamente quanto vai pagar antes de contratar.",
    },
    {
      icon: Award,
      title: "Qualidade Garantida",
      description: "Se não estiver satisfeito, devolvemos seu dinheiro. Sem perguntas, sem burocracia.",
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="badge-primary mb-4 inline-block">Por que escolher a Freela</span>
          <h2 className="mb-4">
            Tudo que você precisa para{" "}
            <span className="text-gradient">trabalhar com confiança</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Criamos uma plataforma completa pensando em cada detalhe para 
            facilitar sua vida, seja você freelancer ou cliente.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="card-elevated p-8 card-hover group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                <benefit.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-card-foreground">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
