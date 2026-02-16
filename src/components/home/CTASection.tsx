import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, PartyPopper } from "lucide-react";
import { useMode } from "@/contexts/ModeContext";

const CTASection = () => {
  const { isFreelaCasa } = useMode();

  return (
    <section className="section-padding hero-gradient relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 w-40 h-40 bg-secondary rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-20 w-60 h-60 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto container-padding relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-6">
            {isFreelaCasa ? (
              <>
                <PartyPopper className="w-4 h-4" />
                <span className="text-sm font-medium">Seu evento perfeito</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Cadastro gratuito</span>
              </>
            )}
          </div>
          
          <h2 className="text-secondary mb-8 hero-text-shadow">
            {isFreelaCasa
              ? "Pronto para fazer seu evento?"
              : "Precisa reforçar sua equipe?"}
          </h2>
          
          <p className="text-xl md:text-2xl text-secondary/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            {isFreelaCasa
              ? "Contrate um profissional de forma simples e rápida. Churrasqueiro, barman, músico e muito mais. Sem negociação, preço automático."
              : "Garçons, bartenders, cozinheiros e auxiliares disponíveis para seu bar, restaurante ou hotel. Valor pré-fixado e contratação imediata."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild className="group">
              <Link to={isFreelaCasa ? "/criar-evento" : "/cadastro"}>
                {isFreelaCasa ? "Contratar agora" : "Cadastrar meu estabelecimento"}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to={isFreelaCasa ? "/freelancers" : "/freelancers"}>
                {isFreelaCasa ? "Ver profissionais" : "Ver freelancers disponíveis"}
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-secondary/60">
            {isFreelaCasa
              ? "Preço fechado • Sem surpresas • Pagamento seguro"
              : "Valor pré-fixado • Sem vínculo • Profissionais avaliados"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
