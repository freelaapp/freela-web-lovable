import { Shield, Zap, Clock, Users, CreditCard, Award, Home, Calculator, Star } from "lucide-react";
import { useMode } from "@/contexts/ModeContext";

const BenefitsSection = () => {
  const { isFreelaCasa } = useMode();

  const benefitsPJ = [
  {
    icon: Zap,
    title: "Contratação Imediata",
    description: "Precisa de um garçom para amanhã? Encontre freelancers disponíveis e contrate na hora."
  },
  {
    icon: Shield,
    title: "Pagamento Seguro",
    description: "Pague pelo app com total segurança. O freelancer só recebe após realizar o serviço."
  },
  {
    icon: Users,
    title: "Profissionais Avaliados",
    description: "Garçons, bartenders e cozinheiros verificados com avaliações reais de outros estabelecimentos."
  },
  {
    icon: Clock,
    title: "Reforço Quando Precisar",
    description: "Fim de semana lotado? Evento especial? Tenha freelancers extras sem vínculo empregatício."
  },
  {
    icon: CreditCard,
    title: "Valor Pré-fixado",
    description: "Sem negociação! O valor da diária já é definido por tipo de serviço. Transparência total."
  },
  {
    icon: Award,
    title: "Para Todo Tipo de Negócio",
    description: "Bares, restaurantes, buffets, hotéis, motéis e empresas de eventos. Atendemos todos."
  }];


  const benefitsPF = [
  {
    icon: Calculator,
    title: "Preço Automático",
    description: "Sem negociação! O valor é calculado automaticamente com base no serviço, horas e profissionais."
  },
  {
    icon: Home,
    title: "Na sua casa",
    description: "O profissional vai até você. Basta informar o endereço do seu evento ou residência."
  },
  {
    icon: Star,
    title: "Profissionais Avaliados",
    description: "Todos os freelancers têm avaliações reais de outros clientes. Escolha com confiança."
  },
  {
    icon: Zap,
    title: "Simples e Rápido",
    description: "Em poucos cliques você contrata. Sem formulários longos, sem burocracia."
  },
  {
    icon: Shield,
    title: "Pagamento Seguro",
    description: "Pague pelo app com total segurança. O profissional só recebe após o serviço."
  },
  {
    icon: Users,
    title: "Para Todos os Eventos",
    description: "Aniversários, churrascos, confraternizações, jantares... Temos profissionais para tudo."
  }];


  const benefits = isFreelaCasa ? benefitsPF : benefitsPJ;

  return (
    <section className="section-padding bg-background py-[60px]">
      <div className="container mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <span className="badge-primary mb-6 inline-block text-base px-5 py-2">
            {isFreelaCasa ? "✨ Vantagens" : "⭐ Por que usar o Freela"}
          </span>
          <h2 className="mb-6 section-title section-title-center">
            {isFreelaCasa ?
            <>
                Seu evento{" "}
                <span className="text-gradient">simples e sem estresse</span>
              </> :

            <>
                Reforce sua equipe{" "}
                <span className="text-gradient">sem burocracia</span>
              </>
            }
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {isFreelaCasa ?
            "Contrate profissionais para seu evento de forma prática. Preço fechado, sem surpresas e com profissionais avaliados." :
            "Garçons, bartenders, cozinheiros e auxiliares prontos para trabalhar no seu bar, restaurante ou hotel. Valor pré-fixado e sem vínculo."}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) =>
          <div
            key={benefit.title}
            className="card-elevated p-8 card-hover group"
            style={{ animationDelay: `${index * 0.1}s` }}>

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
          )}
        </div>
      </div>
    </section>);

};

export default BenefitsSection;