import { Link, useNavigate } from "react-router-dom";
import { Building2, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import logoFreela from "@/assets/logo-freela.png";

const EscolherPerfil = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center container-padding py-12 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-card shadow-md border border-border hover:bg-muted transition-colors"
        aria-label="Voltar">

        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>
      <Link to="/" className="mb-10">
        <img alt="Freela Serviços" className="h-14" src="/lovable-uploads/e0273d4b-5303-4824-8b4e-0982e57cc2a9.png" />
      </Link>

      <h1 className="text-3xl md:text-4xl font-display font-bold text-secondary mb-3 text-center">
        Como você quer usar a Freela?
      </h1>
      <p className="text-secondary/70 mb-10 text-center max-w-md">
        Escolha o tipo de conta que melhor se encaixa no seu perfil
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Contratante */}
        <Link
          to="/obrigado-contratante"
          className="group bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border">

          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            Cadastre-se como Contratante
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Encontre os melhores profissionais para seu evento, festa ou estabelecimento.
          </p>
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
            Começar <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        {/* Freelancer */}
        <Link
          to="/obrigado-freelancer"
          className="group bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border">

          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            Cadastre-se como Freelancer
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Ofereça seus serviços e conquiste novas oportunidades de trabalho.
          </p>
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
            Começar <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </div>);

};

export default EscolherPerfil;