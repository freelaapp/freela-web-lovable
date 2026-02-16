import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Home,
  ChefHat,
  Wine,
  Music,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  Star,
  Users,
} from "lucide-react";

const categories = [
  { icon: ChefHat, name: "Churrasqueiro", desc: "Churrasco completo para sua festa" },
  { icon: Wine, name: "Barman", desc: "Drinks e coquetéis profissionais" },
  { icon: UtensilsCrossed, name: "Cozinheira", desc: "Pratos especiais sob medida" },
  { icon: Users, name: "Garçom", desc: "Atendimento impecável aos convidados" },
  { icon: Music, name: "DJ / Músico", desc: "Entretenimento para sua festa" },
  { icon: Sparkles, name: "Auxiliar de Limpeza", desc: "Organização antes e depois" },
];

const FreelaEmCasa = () => {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20">
        <div className="container mx-auto container-padding text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-6">
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Freela em Casa</span>
          </div>
          <h1 className="text-secondary mb-4 hero-text-shadow">
            Freelancers para seu evento particular
          </h1>
          <p className="text-xl text-secondary/80 max-w-2xl mx-auto mb-8">
            Aniversários, churrascos, casamentos e confraternizações. Contrate
            profissionais qualificados com preço fechado e sem negociação.
          </p>
          <Button variant="hero" size="xl" asChild className="group">
            <Link to="/criar-evento">
              Contratar freelancer agora
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-foreground mb-4">
              Freelancers disponíveis para sua{" "}
              <span className="text-gradient">festa</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Profissionais avaliados e prontos para trabalhar no seu evento.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="card-elevated p-6 card-hover text-center"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <cat.icon className="w-7 h-7 text-primary" />
                </div>
                <h5 className="text-foreground mb-1">{cat.name}</h5>
                <p className="text-sm text-muted-foreground">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-muted/50">
        <div className="container mx-auto container-padding text-center">
          <h2 className="text-foreground mb-12">
            Simples e <span className="text-gradient">rápido</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: "1", title: "Escolha o serviço", desc: "Selecione o tipo de freelancer que precisa" },
              { step: "2", title: "Informe os detalhes", desc: "Data, horário, local e número de convidados" },
              { step: "3", title: "Pronto!", desc: "Receba o preço automático e confirme" },
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

      {/* Benefits */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-foreground text-center mb-12">
              Por que usar o Freela em Casa?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Preço fechado, sem surpresas",
                "Freelancers avaliados por outros clientes",
                "Contratação 100% online",
                "Pagamento seguro pela plataforma",
                "Suporte durante todo o evento",
                "Cancelamento flexível",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3 p-4 card-elevated">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground font-medium text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding hero-gradient">
        <div className="container mx-auto container-padding">
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            {[
              { icon: Users, value: "15.000+", label: "Freelancers cadastrados" },
              { icon: Home, value: "50.000+", label: "Eventos realizados" },
              { icon: Star, value: "4.9", label: "Avaliação média" },
            ].map((stat) => (
              <div key={stat.label}>
                <stat.icon className="w-8 h-8 text-secondary mx-auto mb-3" />
                <p className="font-display text-3xl font-bold text-secondary">{stat.value}</p>
                <p className="text-secondary/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto container-padding text-center">
          <h2 className="text-secondary-foreground mb-4">
            Pronto para fazer seu evento?
          </h2>
          <p className="text-secondary-foreground/70 text-lg mb-8 max-w-xl mx-auto">
            Contrate freelancers qualificados com preço automático e sem dor de cabeça.
          </p>
          <Button variant="cta" size="xl" asChild className="group">
            <Link to="/criar-evento">
              Contratar freelancer agora
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </AppLayout>
  );
};

export default FreelaEmCasa;
