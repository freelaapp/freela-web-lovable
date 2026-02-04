import { 
  PartyPopper, 
  Camera, 
  Cake, 
  Music2, 
  Sofa, 
  Sparkles,
  MapPin,
  Star,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PartnersSection = () => {
  const categories = [
    { icon: PartyPopper, name: "Salões de Festa", color: "bg-pink-100 text-pink-600" },
    { icon: Cake, name: "Buffets", color: "bg-orange-100 text-orange-600" },
    { icon: Camera, name: "Fotógrafos", color: "bg-blue-100 text-blue-600" },
    { icon: Music2, name: "Bandas & DJs", color: "bg-purple-100 text-purple-600" },
    { icon: Sofa, name: "Aluguel de Móveis", color: "bg-green-100 text-green-600" },
    { icon: Sparkles, name: "Decoração", color: "bg-amber-100 text-amber-600" },
  ];

  const featuredPartners = [
    {
      id: 1,
      name: "Espaço Bella Festa",
      category: "Salão de Festas",
      location: "São Paulo, SP",
      rating: 4.9,
      reviews: 128,
      image: "🏰",
      description: "Salão completo para até 200 pessoas com estacionamento e segurança.",
      highlight: "10% OFF para clientes Freela",
    },
    {
      id: 2,
      name: "Buffet Sabor & Arte",
      category: "Buffet Completo",
      location: "São Paulo, SP",
      rating: 4.8,
      reviews: 95,
      image: "🍽️",
      description: "Gastronomia de qualidade para eventos corporativos e festas.",
      highlight: "Cardápio personalizado",
    },
    {
      id: 3,
      name: "Click Momentos",
      category: "Fotografia & Vídeo",
      location: "São Paulo, SP",
      rating: 5.0,
      reviews: 67,
      image: "📸",
      description: "Registramos os melhores momentos do seu evento com qualidade.",
      highlight: "Álbum digital incluso",
    },
    {
      id: 4,
      name: "Som & Luz Produções",
      category: "DJ & Iluminação",
      location: "São Paulo, SP",
      rating: 4.7,
      reviews: 84,
      image: "🎧",
      description: "Equipamentos de som e iluminação profissional para eventos.",
      highlight: "Pacote festa completo",
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <span className="badge-primary mb-6 inline-block text-base px-5 py-2">
            🎉 Parceiros & Negócios Locais
          </span>
          <h2 className="mb-6 section-title section-title-center">
            Tudo para sua festa em um só lugar
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra os melhores fornecedores da sua região para tornar seu evento inesquecível. Salões, buffets, decoração e muito mais!
          </p>
        </div>

        {/* Categories Quick Access */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${cat.color} font-medium text-sm hover:scale-105 transition-transform cursor-pointer`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Featured Partners Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {featuredPartners.map((partner) => (
            <div
              key={partner.id}
              className="card-elevated overflow-hidden card-hover group cursor-pointer"
            >
              {/* Image/Emoji Header */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center relative">
                <span className="text-6xl">{partner.image}</span>
                {partner.highlight && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {partner.highlight}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                      {partner.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{partner.category}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-primary-light px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-xs font-bold text-primary">{partner.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {partner.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {partner.location}
                  </div>
                  <span>{partner.reviews} avaliações</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-secondary to-secondary/90 rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-secondary-foreground mb-4">
              Tem um negócio de festas ou eventos?
            </h3>
            <p className="text-secondary-foreground/80 mb-6 max-w-2xl mx-auto">
              Cadastre seu salão, buffet, loja de decoração ou serviço e alcance milhares de pessoas que estão planejando eventos na sua região.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Anunciar meu negócio
                <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
              >
                Saiba mais
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
