import { 
  Palette, 
  Code, 
  PenTool, 
  Video, 
  BarChart3, 
  Megaphone,
  FileText,
  Music,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const CategoriesSection = () => {
  const categories = [
    { icon: Palette, name: "Design Gráfico", count: "2.500+ freelancers", color: "bg-pink-100 text-pink-600" },
    { icon: Code, name: "Desenvolvimento", count: "3.200+ freelancers", color: "bg-blue-100 text-blue-600" },
    { icon: PenTool, name: "Redação", count: "1.800+ freelancers", color: "bg-green-100 text-green-600" },
    { icon: Video, name: "Vídeo & Animação", count: "980+ freelancers", color: "bg-purple-100 text-purple-600" },
    { icon: BarChart3, name: "Finanças", count: "750+ freelancers", color: "bg-amber-100 text-amber-600" },
    { icon: Megaphone, name: "Marketing Digital", count: "2.100+ freelancers", color: "bg-red-100 text-red-600" },
    { icon: FileText, name: "Tradução", count: "620+ freelancers", color: "bg-indigo-100 text-indigo-600" },
    { icon: Music, name: "Música & Áudio", count: "430+ freelancers", color: "bg-teal-100 text-teal-600" },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="badge-primary mb-4 inline-block">Categorias</span>
          <h2 className="mb-4">Explore todas as áreas</h2>
          <p className="text-lg text-muted-foreground">
            Milhares de profissionais em diversas categorias prontos para 
            transformar suas ideias em realidade.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/categorias/${category.name.toLowerCase().replace(/ /g, "-")}`}
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
            to="/categorias" 
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            Ver todas as categorias
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
