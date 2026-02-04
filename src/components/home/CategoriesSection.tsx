import { 
  Palette, 
  Code, 
  PenTool, 
  Video, 
  BarChart3, 
  Megaphone,
  FileText,
  Music,
  ArrowRight,
  Flame,
  Wine,
  ChefHat,
  Sparkles,
  UserCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMode } from "@/contexts/ModeContext";

const CategoriesSection = () => {
  const { isFreelaCasa } = useMode();

  const categoriesPJ = [
    { icon: Palette, name: "Design Gráfico", count: "2.500+ freelancers", color: "bg-primary-light text-primary" },
    { icon: Code, name: "Desenvolvimento", count: "3.200+ freelancers", color: "bg-primary-light text-primary" },
    { icon: PenTool, name: "Redação", count: "1.800+ freelancers", color: "bg-primary-light text-primary" },
    { icon: Video, name: "Vídeo & Animação", count: "980+ freelancers", color: "bg-primary-light text-primary" },
    { icon: BarChart3, name: "Finanças", count: "750+ freelancers", color: "bg-primary-light text-primary" },
    { icon: Megaphone, name: "Marketing Digital", count: "2.100+ freelancers", color: "bg-primary-light text-primary" },
    { icon: FileText, name: "Tradução", count: "620+ freelancers", color: "bg-primary-light text-primary" },
    { icon: Music, name: "Música & Áudio", count: "430+ freelancers", color: "bg-primary-light text-primary" },
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
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="badge-primary mb-4 inline-block">
            {isFreelaCasa ? "Serviços disponíveis" : "Categorias"}
          </span>
          <h2 className="mb-4">
            {isFreelaCasa ? "Profissionais para seu evento" : "Explore todas as áreas"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isFreelaCasa
              ? "Encontre o profissional ideal para fazer da sua festa um sucesso. Contratação simples e sem negociação."
              : "Milhares de profissionais em diversas categorias prontos para transformar suas ideias em realidade."}
          </p>
        </div>

        {/* Categories Grid */}
        <div className={`grid ${isFreelaCasa ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"} gap-4 md:gap-6 mb-8`}>
          {categories.map((category) => (
            <Link
              key={category.name}
              to={isFreelaCasa ? `/criar-evento` : `/categorias/${category.name.toLowerCase().replace(/ /g, "-")}`}
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
            to={isFreelaCasa ? "/freelancers" : "/categorias"} 
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            {isFreelaCasa ? "Ver todos os profissionais" : "Ver todas as categorias"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
