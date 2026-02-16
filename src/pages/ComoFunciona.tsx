import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Search,
  Handshake,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Crie sua conta",
    description:
      "Cadastre-se gratuitamente como empresa, pessoa física ou profissional freelancer. É rápido e simples.",
  },
  {
    icon: Search,
    title: "Busque o profissional",
    description:
      "Encontre freelancers da área de hospitalidade por categoria, região e disponibilidade. Garçons, bartenders, cozinheiros e mais.",
  },
  {
    icon: Handshake,
    title: "Contrate com segurança",
    description:
      "Selecione o profissional, confirme o serviço com valor pré-fixado e tenha tudo organizado em um só lugar.",
  },
  {
    icon: Star,
    title: "Avalie o serviço",
    description:
      "Após o evento ou turno, avalie o freelancer. Isso ajuda outros contratantes e valoriza os melhores profissionais.",
  },
];

const ComoFunciona = () => {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20">
        <div className="container mx-auto container-padding text-center">
          <h1 className="text-secondary mb-4 hero-text-shadow">
            Como funciona o Freela
          </h1>
          <p className="text-xl text-secondary/80 max-w-2xl mx-auto">
            Contratar freelancers da hospitalidade nunca foi tão simples. Veja o
            passo a passo.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="max-w-4xl mx-auto space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <div className={`text-center ${index % 2 !== 0 ? "md:text-right" : "md:text-left"}`}>
                  <span className="text-primary font-bold text-sm">
                    PASSO {index + 1}
                  </span>
                  <h3 className="text-foreground mt-1 mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-muted/50">
        <div className="container mx-auto container-padding text-center">
          <h2 className="text-foreground mb-12">
            Por que usar o <span className="text-gradient">Freela?</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              "Profissionais verificados e avaliados",
              "Valor pré-fixado, sem negociação",
              "Foco exclusivo em hospitalidade",
              "Contratação rápida e organizada",
              "Histórico de serviços completo",
              "Suporte dedicado",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 card-elevated p-4">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-foreground text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto container-padding text-center">
          <h2 className="text-secondary-foreground mb-6">
            Pronto para começar?
          </h2>
          <p className="text-secondary-foreground/70 text-lg mb-8 max-w-xl mx-auto">
            Crie sua conta gratuitamente e encontre os melhores freelancers da
            hospitalidade.
          </p>
          <Button variant="cta" size="xl" asChild className="group">
            <Link to="/cadastro">
              Criar minha conta grátis
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </AppLayout>
  );
};

export default ComoFunciona;
