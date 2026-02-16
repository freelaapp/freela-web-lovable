import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  ShieldCheck,
  MapPin,
  Target,
  Eye,
  Heart,
} from "lucide-react";

const Sobre = () => {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20">
        <div className="container mx-auto container-padding text-center">
          <h1 className="text-secondary mb-4 hero-text-shadow">
            Sobre o Freela
          </h1>
          <p className="text-xl text-secondary/80 max-w-2xl mx-auto">
            A plataforma que está profissionalizando a contratação de freelancers
            da hospitalidade no Brasil.
          </p>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Target,
                title: "Missão",
                desc: "Conectar profissionais da hospitalidade a oportunidades de trabalho de forma organizada, segura e justa, eliminando a informalidade do setor.",
              },
              {
                icon: Eye,
                title: "Visão",
                desc: "Ser a principal plataforma de contratação de freelancers da hospitalidade no Brasil, referência em qualidade e confiança.",
              },
              {
                icon: Heart,
                title: "Propósito",
                desc: "Valorizar os profissionais do setor, dando visibilidade, oportunidades e reconhecimento a quem faz a hospitalidade acontecer.",
              },
            ].map((item) => (
              <div key={item.title} className="card-elevated p-8 text-center card-hover">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-foreground mb-3">{item.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="section-padding bg-muted/50">
        <div className="container mx-auto container-padding text-center">
          <h2 className="text-foreground mb-12">
            Nossos <span className="text-gradient">números</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { icon: Users, value: "+170 mil", label: "Freelancers cadastrados" },
              { icon: ShieldCheck, value: "100%", label: "Especializada em hospitalidade" },
              { icon: MapPin, value: "Brasil", label: "Crescendo em todo o país" },
            ].map((stat) => (
              <div key={stat.label}>
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-foreground mb-6">
              Nossa <span className="text-gradient">história</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              O Freela nasceu da necessidade real do mercado de hospitalidade:
              encontrar profissionais qualificados de forma rápida e organizada.
              Donos de bares e restaurantes dependiam de indicações informais,
              sem garantia de qualidade ou disponibilidade.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Criamos uma plataforma onde empresas e pessoas físicas podem
              contratar freelancers avaliados, com processo estruturado e valor
              transparente. Hoje, somos a maior rede de profissionais freelancers
              da hospitalidade do Brasil.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto container-padding text-center">
          <h2 className="text-secondary-foreground mb-6">
            Faça parte do Freela
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cta" size="xl" asChild className="group">
              <Link to="/cadastro">
                Criar minha conta
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
              <Link to="/contato">Fale conosco</Link>
            </Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Sobre;
