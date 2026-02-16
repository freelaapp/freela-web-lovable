import { 
  Music,
  ArrowRight,
  Flame,
  Wine,
  ChefHat,
  Sparkles,
  UserCheck,
  UtensilsCrossed,
  Building2,
  Hotel,
  PartyPopper,
  BedDouble
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMode } from "@/contexts/ModeContext";

const CategoriesSection = () => {
  const { isFreelaCasa } = useMode();

  const categoriesPJ = [
    { icon: UtensilsCrossed, name: "Bares", count: "1.200+ estabelecimentos", color: "bg-primary-light text-primary" },
    { icon: ChefHat, name: "Restaurantes", count: "2.800+ estabelecimentos", color: "bg-primary-light text-primary" },
    { icon: PartyPopper, name: "Buffets", count: "950+ estabelecimentos", color: "bg-primary-light text-primary" },
    { icon: Sparkles, name: "Empresas de Eventos", count: "680+ estabelecimentos", color: "bg-primary-light text-primary" },
    { icon: Hotel, name: "Hotéis", count: "1.500+ estabelecimentos", color: "bg-primary-light text-primary" },
    { icon: BedDouble, name: "Motéis", count: "420+ estabelecimentos", color: "bg-primary-light text-primary" },
  ];

  const categoriesPF = [
    { icon: Flame, name: "Churrasqueiro", count: "850+ profissionais", color: "bg-primary-light text-primary" },
    { icon: Wine, name: "Barman", count: "620+ profissionais", color: "bg-primary-light text-primary" },
    { icon: ChefHat, name: "Cozinheira(o)", count: "780+ profissionais", color: "bg-primary-light text-primary" },
    { icon: Sparkles, name: "Auxiliar de Limpeza", count: "1.200+ profissionais", color: "bg-primary-light text-primary" },
    { icon: UserCheck, name: "Garçom", count: "950+ profissionais", color: "bg-primary-light text-primary" },
    { icon: Music, name: "Músico", count: "430+ profissionais", color: "bg-primary-light text-primary" },
    { icon: Music, name: "DJ", count: "380+ profissionais", color: "bg-primary-light text-primary" },
  ];

  const categories = isFreelaCasa ? categoriesPF : categoriesPJ;

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <span className="badge-primary mb-6 inline-block text-base px-5 py-2">
            {isFreelaCasa ? "🎯 Serviços disponíveis" : "🏢 Segmentos atendidos"}
          </span>
          <h2 className="mb-6 section-title section-title-center">
            {isFreelaCasa ? "Profissionais para seu evento" : "Empresas que contratam Freelas"}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {isFreelaCasa
              ? "Encontre o profissional ideal para fazer da sua festa um sucesso. Contratação simples e sem negociação."
              : "Bares, restaurantes, buffets e mais — contrate freelancers qualificados com valor já pré-fixado e sem burocracia."}
          </p>
        </div>

        {/* Categories Grid */}
        <div className={`grid ${isFreelaCasa ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3"} gap-4 md:gap-6 mb-8`}>
          {categories.map((category) => (
            <Link
              key={category.name}
              to={isFreelaCasa ? `/criar-evento` : `/freelancers`}
              className="group card-elevated p-6 card-hover text-center"
            >
              <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <category.icon className="w-7 h-7" />
              </div>
              <h4 className="font-display font-semibold text-sm md:text-base mb-1 text-card-foreground">
                {category.name}
              </h4>
              <p className="text-xs md:text-sm text-muted-foreground">
                {category.count}
              </p>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Link 
            to={isFreelaCasa ? "/freelancers" : "/freelancers"} 
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            {isFreelaCasa ? "Ver todos os profissionais" : "Ver todos os segmentos"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
